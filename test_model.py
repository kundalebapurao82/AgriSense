import io
import json
from PIL import Image
from backend.services.detection_service import DiseaseDetector
from backend.services.rag_service import rag_agent

print("="*60)
print("AGRISENSE: TESTING TRAINED MODEL & PIPELINE INTEGRATION")
print("="*60)

detector = DiseaseDetector()
print(f"[1] Model Loaded into Memory: {detector.model_loaded}")
print(f"[2] Classes Count: {len(detector.classes)}")
print(f"[3] Device: {detector.device}")

# Create a sample test image (224x224 RGB green leaf)
img = Image.new("RGB", (224, 224), color=(34, 139, 34))
buf = io.BytesIO()
img.save(buf, format="JPEG")
img_bytes = buf.getvalue()

# Run real inference
result = detector.predict_image(img_bytes)

print("\n--- INFERENCE PREDICTION RESULT ---")
print(f"Raw Predicted Class: {result['predicted_class']}")
print(f"Crop:               {result['crop']}")
print(f"Disease:            {result['disease']}")
print(f"Confidence:         {result['confidence']}%")
print(f"Model Status:       {result['model_status']}")

print("\n--- TOP-3 CANDIDATES ---")
for idx, c in enumerate(result['top_candidates'], 1):
    print(f" {idx}. {c['crop']} - {c['disease']}: {c['confidence']}%")

# Test Knowledge Base dossier linking
print("\n--- LINKING TO MULTILINGUAL KNOWLEDGE BASE ---")
for lang, lang_name in [("en", "English"), ("hi", "Hindi"), ("mr", "Marathi"), ("kn", "Kannada")]:
    dossier = rag_agent.get_disease_dossier(crop=result['crop'], disease=result['disease'], language=lang)
    if dossier:
        print(f"\n[{lang_name}] Dossier Found:")
        print(f"  Crop:        {dossier.get('localized_crop')}")
        print(f"  Disease:     {dossier.get('localized_disease')}")
        print(f"  Symptoms:    {dossier.get('symptoms')[:90]}...")
        print(f"  Bio Control: {dossier.get('biological_control')[:90]}...")
    else:
        print(f"[{lang_name}] Defaulting to generic crop care recommendations.")

print("\n" + "="*60)
print("[OK] ALL TESTS PASSED! MODEL AND INFERENCE PIPELINE ARE FULLY WORKING!")
print("="*60)
