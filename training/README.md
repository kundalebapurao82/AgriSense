# Plant Disease Model Training Guide (Google Colab with GPU)

This guide shows you how to train the Deep Learning model on Google Colab (free T4 GPU) and integrate the trained model into your local **AgriSense** project.

---

### Step 1: Open Google Colab
1. Go to [Google Colab](https://colab.research.google.com/).
2. Click **Upload** and upload the file:
   `training/train_plant_disease_colab.ipynb`

### Step 2: Enable Free GPU
1. In the Colab top menu, click **Runtime** > **Change runtime type**.
2. Select **T4 GPU** under Hardware accelerator.
3. Click **Save**.

### Step 3: Run the Notebook
1. Click **Runtime** > **Run all** (or press `Ctrl + F9`).
2. The notebook will:
   - Download the PlantVillage dataset (38 classes: Tomato, Potato, Apple, Corn, Grape, Bell Pepper, etc.).
   - Train a **ResNet50** / **MobileNetV3** transfer learning model with data augmentations.
   - Run Early Stopping and evaluate classification report + test accuracy (typically >98-99%).
   - Export three files:
     - `plant_disease_model.pth` (PyTorch model weights)
     - `plant_disease_model.onnx` (Fast CPU runtime model)
     - `class_names.json` (The 38 disease class labels)
3. The notebook will automatically trigger downloads for these 3 files in your browser.

### Step 4: Add the Trained Model to AgriSense
Move the downloaded files into your local project directory:
```
e:\Honors_Project\backend\models\
  ├── plant_disease_model.pth    (or .onnx)
  └── class_names.json
```

The AgriSense FastAPI server will automatically detect and load your trained model on startup!
*(Note: If no model file is placed yet, the backend includes an intelligent fallback simulator so all features of the application can be developed, tested, and demonstrated seamlessly).*
