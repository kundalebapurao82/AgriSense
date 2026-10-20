"""
AgriSense: Deep Learning Crop Disease Classifier Training Pipeline
Designed for Google Colab (with GPU acceleration) or local training.
Supports: ResNet50, MobileNetV3-Large, EfficientNet-B0 on PlantVillage Dataset.
Exports:
  1. PyTorch weights (.pth)
  2. Class mappings (class_names.json)
  3. ONNX model (.onnx) for lightweight CPU inference in FastAPI web app
"""

import os
import json
import time
import copy
import argparse
import numpy as np
import matplotlib.pyplot as plt
from tqdm import tqdm
from sklearn.metrics import classification_report, confusion_matrix

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms, models

# 38 Standard PlantVillage Classes
PLANT_VILLAGE_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]


def build_model(model_name: str, num_classes: int, pretrained: bool = True):
    """
    Builds transfer learning model with custom classification head.
    """
    print(f"[*] Initializing model: {model_name} (num_classes={num_classes}, pretrained={pretrained})")
    
    if model_name == "resnet50":
        weights = models.ResNet50_Weights.DEFAULT if pretrained else None
        model = models.resnet50(weights=weights)
        in_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(p=0.4),
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Dropout(p=0.2),
            nn.Linear(512, num_classes)
        )
    elif model_name == "mobilenet_v3":
        weights = models.MobileNet_V3_Large_Weights.DEFAULT if pretrained else None
        model = models.mobilenet_v3_large(weights=weights)
        in_features = model.classifier[0].in_features
        model.classifier = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.Hardswish(),
            nn.Dropout(p=0.3),
            nn.Linear(512, num_classes)
        )
    elif model_name == "efficientnet_b0":
        weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
        model = models.efficientnet_b0(weights=weights)
        in_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features, num_classes)
        )
    else:
        raise ValueError(f"Unsupported model: {model_name}. Use resnet50, mobilenet_v3, or efficientnet_b0")

    return model


def get_data_transforms():
    """
    Augmentation for training partition, deterministic normalization for val/test.
    """
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomRotation(degrees=20),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    val_test_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    return train_transform, val_test_transform


def prepare_dataloaders(data_dir: str, batch_size: int = 32, num_workers: int = 2):
    """
    Loads dataset from directory and creates train, val, and test splits.
    """
    train_transform, val_transform = get_data_transforms()

    # Load full dataset using ImageFolder
    full_dataset = datasets.ImageFolder(root=data_dir)
    classes = full_dataset.classes
    print(f"[*] Found {len(classes)} classes with {len(full_dataset)} total images.")

    # 80% train, 10% validation, 10% test
    total_len = len(full_dataset)
    train_len = int(0.80 * total_len)
    val_len = int(0.10 * total_len)
    test_len = total_len - train_len - val_len

    generator = torch.Generator().manual_seed(42)
    train_subset, val_subset, test_subset = random_split(
        full_dataset, [train_len, val_len, test_len], generator=generator
    )

    # Wrap subsets with respective transforms
    class TransformedDataset(torch.utils.data.Dataset):
        def __init__(self, subset, transform):
            self.subset = subset
            self.transform = transform

        def __getitem__(self, idx):
            x, y = self.subset[idx]
            if self.transform:
                x = self.transform(x)
            return x, y

        def __len__(self):
            return len(self.subset)

    train_data = TransformedDataset(train_subset, train_transform)
    val_data = TransformedDataset(val_subset, val_transform)
    test_data = TransformedDataset(test_subset, val_transform)

    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True, num_workers=num_workers, pin_memory=True)
    val_loader = DataLoader(val_data, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)
    test_loader = DataLoader(test_data, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)

    return train_loader, val_loader, test_loader, classes


def train_model(model, train_loader, val_loader, criterion, optimizer, scheduler, device, num_epochs=15, patience=5):
    """
    Two-phase training loop with Early Stopping and learning rate reduction.
    """
    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0
    patience_counter = 0

    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}

    print("\n" + "="*50)
    print(f"[*] Starting Training on {device} for {num_epochs} epochs")
    print("="*50)

    for epoch in range(num_epochs):
        epoch_start = time.time()
        
        # Training Phase
        model.train()
        running_loss = 0.0
        running_corrects = 0
        total_samples = 0

        for inputs, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs} [Train]"):
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            _, preds = torch.max(outputs, 1)

            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data).item()
            total_samples += inputs.size(0)

        epoch_train_loss = running_loss / total_samples
        epoch_train_acc = running_corrects / total_samples

        # Validation Phase
        model.eval()
        val_loss = 0.0
        val_corrects = 0
        val_total = 0

        with torch.no_grad():
            for inputs, labels in tqdm(val_loader, desc=f"Epoch {epoch+1}/{num_epochs} [Val]"):
                inputs = inputs.to(device)
                labels = labels.to(device)

                outputs = model(inputs)
                loss = criterion(outputs, labels)
                _, preds = torch.max(outputs, 1)

                val_loss += loss.item() * inputs.size(0)
                val_corrects += torch.sum(preds == labels.data).item()
                val_total += inputs.size(0)

        epoch_val_loss = val_loss / val_total
        epoch_val_acc = val_corrects / val_total

        if scheduler is not None:
            scheduler.step(epoch_val_loss)

        epoch_time = time.time() - epoch_start
        print(f"Epoch {epoch+1:02d} ({epoch_time:.1f}s) | "
              f"Train Loss: {epoch_train_loss:.4f} Acc: {epoch_train_acc*100:.2f}% | "
              f"Val Loss: {epoch_val_loss:.4f} Acc: {epoch_val_acc*100:.2f}%")

        history["train_loss"].append(epoch_train_loss)
        history["train_acc"].append(epoch_train_acc)
        history["val_loss"].append(epoch_val_loss)
        history["val_acc"].append(epoch_val_acc)

        # Deep copy best model weights
        if epoch_val_acc > best_acc:
            best_acc = epoch_val_acc
            best_model_wts = copy.deepcopy(model.state_dict())
            patience_counter = 0
            print(f" -> Best validation accuracy reached: {best_acc*100:.2f}%. Checkpointed!")
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"\n[!] Early stopping triggered after {epoch+1} epochs.")
                break

    print(f"\n[*] Training completed. Best Validation Accuracy: {best_acc*100:.2f}%")
    model.load_state_dict(best_model_wts)
    return model, history


def evaluate_and_export(model, test_loader, classes, output_dir, device):
    """
    Evaluates model on held-out test set, produces metrics report,
    and exports .pth and .onnx formats.
    """
    os.makedirs(output_dir, exist_ok=True)
    model.eval()

    all_preds = []
    all_labels = []

    print("\n[*] Evaluating on held-out test partition...")
    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)

    test_acc = np.mean(all_preds == all_labels)
    print(f"\n================ TEST SET ACCURACY: {test_acc*100:.2f}% ================\n")

    report = classification_report(all_labels, all_preds, target_names=classes, output_dict=False)
    print(report)

    # Save classification report to text file
    with open(os.path.join(output_dir, "classification_report.txt"), "w") as f:
        f.write(f"Test Accuracy: {test_acc*100:.2f}%\n\n")
        f.write(report)

    # Save class names JSON
    class_names_path = os.path.join(output_dir, "class_names.json")
    with open(class_names_path, "w") as f:
        json.dump(classes, f, indent=2)
    print(f"[+] Saved class names: {class_names_path}")

    # Save PyTorch model state_dict
    pth_path = os.path.join(output_dir, "plant_disease_model.pth")
    torch.save({
        "state_dict": model.state_dict(),
        "classes": classes,
        "test_acc": float(test_acc),
        "timestamp": time.time()
    }, pth_path)
    print(f"[+] Saved PyTorch model: {pth_path}")

    # Export to ONNX for fast CPU inference
    try:
        onnx_path = os.path.join(output_dir, "plant_disease_model.onnx")
        dummy_input = torch.randn(1, 3, 224, 224).to(device)
        torch.onnx.export(
            model,
            dummy_input,
            onnx_path,
            export_params=True,
            opset_version=14,
            do_constant_folding=True,
            input_names=["input"],
            output_names=["output"],
            dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}}
        )
        print(f"[+] Exported ONNX model: {onnx_path}")
    except Exception as e:
        print(f"[!] ONNX export warning: {e}")

    print("\n[✓] Model training and export successfully completed!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Plant Disease Classifier")
    parser.add_argument("--data_dir", type=str, required=True, help="Path to PlantVillage dataset directory")
    parser.add_argument("--model", type=str, default="resnet50", choices=["resnet50", "mobilenet_v3", "efficientnet_b0"], help="Architecture")
    parser.add_argument("--epochs", type=int, default=15, help="Number of epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.0003, help="Learning rate")
    parser.add_argument("--output_dir", type=str, default="./output_model", help="Directory to save exported models")
    args = parser.parse_args()

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"[*] Hardware device selected: {device}")

    train_loader, val_loader, test_loader, classes = prepare_dataloaders(args.data_dir, batch_size=args.batch_size)
    model = build_model(args.model, num_classes=len(classes), pretrained=True).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)

    model, history = train_model(
        model, train_loader, val_loader, criterion, optimizer, scheduler, device, num_epochs=args.epochs
    )

    evaluate_and_export(model, test_loader, classes, args.output_dir, device)
