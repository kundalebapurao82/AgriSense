"""
AgriSense Backend API Server
Deep Learning Plant Disease Detection, Weather-Driven Risk Advisory, and Multilingual RAG Assistant.
"""

import os
import io
import json
from typing import List, Optional
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Query, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from backend.services.detection_service import detector
from backend.services.weather_service import get_multi_source_weather, evaluate_disease_risk, evaluate_crop_weather_advisories
from backend.services.rag_service import rag_agent
from backend.services.scraper_service import build_and_save_full_dataset
from backend.services.agent_service import agri_agent

app = FastAPI(
    title="AgriSense API",
    description="Intelligent Agro-Advisory Platform: Deep Learning Disease Detection, Multi-source Weather Risk Modeling, and Multilingual RAG Chatbot",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite runs on port 5173 or 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    query: str
    language: str = "en"
    city: str = "Ichalkaranji"
    registered_crops: Optional[List[str]] = None
    current_crop: Optional[str] = None
    detected_disease: Optional[str] = None
    history: Optional[List[dict]] = None


class ProfileUpdateRequest(BaseModel):
    farmer_name: str
    city: str
    preferred_language: str
    registered_crops: List[str]


@app.get("/")
def root():
    return {
        "project": "AgriSense",
        "description": "Deep Learning Based Web Platform for Crop Disease Detection, Weather-Driven Risk Advisory",
        "status": "Online",
        "supported_languages": ["en", "hi", "mr", "kn"]
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": detector.model_loaded,
        "classes_count": len(detector.classes),
        "chroma_indexed_docs": rag_agent.collection.count() if rag_agent.collection else len(rag_agent.kb_data),
        "weather_sources": ["OpenWeatherMap", "Open-Meteo"],
        "agent_tools": ["current_weather", "knowledge_base", "web_search"]
    }


@app.post("/api/detect")
async def detect_crop_disease(
    file: UploadFile = File(...),
    language: str = Form("en")
):
    """
    Receives leaf photograph, runs CNN classifier, and enriches result with
    symptoms, causes, biological control, and chemical treatment from knowledge base.
    """
    try:
        image_bytes = await file.read()
        if not image_bytes or len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty. Please select a valid leaf photograph.")

        # Robust image verification using PIL
        try:
            test_img = Image.open(io.BytesIO(image_bytes))
            test_img.verify()
        except Exception as img_err:
            raise HTTPException(
                status_code=400,
                detail="Unsupported or corrupted image format. Please upload a standard JPG, PNG, or WEBP leaf photo."
            )

        # 1. Run Deep Learning inference
        inference_result = detector.predict_image(image_bytes)

        # 2. Enrich with structured agronomic dossier in requested language
        dossier = rag_agent.get_disease_dossier(
            crop=inference_result["crop"],
            disease=inference_result["disease"],
            language=language
        )

        # 3. Provide structured fallback for healthy tissue or newly classified crops
        if not dossier:
            is_healthy = "healthy" in inference_result["disease"].lower()
            crop_name = inference_result["crop"]
            if is_healthy:
                dossier = {
                    "localized_crop": crop_name,
                    "localized_disease": (
                        "निरोगी पान (Healthy Foliage)" if language == "mr"
                        else "स्वस्थ पत्ती (Healthy Leaf)" if language == "hi"
                        else "ಆರೋಗ್ಯಕರ ಎಲೆ" if language == "kn"
                        else "Healthy Foliage (No Disease Detected)"
                    ),
                    "pathogen": "None (Healthy Tissue)",
                    "symptoms": (
                        f"{crop_name} पिकाच्या पानावर कोणत्याही रोगाचे किंवा कीडीचे लक्षण आढळलेले नाही. पाने सशक्त व हिरवीगार आहेत." if language == "mr"
                        else f"{crop_name} की पत्ती पर किसी रोग के लक्षण नहीं हैं। फसल स्वस्थ है।" if language == "hi"
                        else "ಎಲೆಯು ಆರೋಗ್ಯಕರವಾಗಿದೆ, ಯಾವುದೇ ರೋಗದ ಲಕ್ಷಣಗಳಿಲ್ಲ." if language == "kn"
                        else f"No pathological lesions, chlorosis, or necrotic spots detected on {crop_name} foliage."
                    ),
                    "causes": (
                        "अनुकूल हवामान आणि योग्य पोषण व्यवस्थापन." if language == "mr"
                        else "अनुकूल मौसम व उचित पोषण प्रबंधन।" if language == "hi"
                        else "ಉತ್ತಮ ನಿರ್ವಹಣೆ." if language == "kn"
                        else "Optimal micro-climate and balanced crop nutrition."
                    ),
                    "biological_control": (
                        "प्रतिबंधात्मक उपाय म्हणून निंबोळी अर्क (५ मिली/लिटर) किंवा ट्रायकोडर्मा वापरा." if language == "mr"
                        else "नियमित पोषण बनाए रखें और आवश्यकता पड़ने पर नीम तेल का छिड़काव करें।" if language == "hi"
                        else "ಬೇವು ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ." if language == "kn"
                        else "Maintain regular crop nutrition and prophylactic Neem oil spray (5 ml/L)."
                    ),
                    "chemical_control": (
                        "सध्या कोणत्याही रासायनिक बुरशीनाशकाची किंवा फवारणीची गरज नाही. पीक सुरक्षित आहे." if language == "mr"
                        else "वर्तमान में किसी रासायनिक कीटनाशक की आवश्यकता नहीं है।" if language == "hi"
                        else "ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪರಣೆ ಅಗತ್ಯವಿಲ್ಲ." if language == "kn"
                        else "No chemical fungicide spray required. Crop foliage is in healthy condition."
                    ),
                    "sources": ["AgriSense Integrated Pest Management (IPM)"]
                }
            else:
                dossier = {
                    "localized_crop": crop_name,
                    "localized_disease": inference_result["disease"],
                    "pathogen": "Identified by Deep Learning Vision",
                    "symptoms": f"Visible leaf spots or structural discoloration observed on {crop_name}.",
                    "causes": "High humidity or temperature fluctuations favoring fungal/bacterial growth.",
                    "biological_control": "Apply Trichoderma viride or Pseudomonas fluorescens (5g/L) as bio-fungicide.",
                    "chemical_control": "Apply prophylactic broad-spectrum fungicide (Mancozeb 2.5g/L or Copper Oxychloride 2g/L).",
                    "sources": ["TNAU Agritech Portal"]
                }

        return {
            "status": "success",
            "detection": inference_result,
            "advisory": dossier,
            "language": language
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[!] Detection endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Image inference error: {str(e)}")


@app.get("/api/weather")
def get_weather_and_risks(
    city: str = Query("Ichalkaranji", description="Village or city name"),
    crops: str = Query("Tomato,Potato,Grape,Corn,Cotton,Chilli", description="Comma-separated registered crops"),
    lat: Optional[float] = Query(None, description="Latitude for hyper-local meteorological resolution"),
    lon: Optional[float] = Query(None, description="Longitude for hyper-local meteorological resolution")
):
    """
    Multi-source weather monitoring + agro-meteorological disease outbreak risk evaluation.
    Includes comparative explanations for ALL registered crops (why Crop 1 has risk, why Crop 2 is safe).
    """
    crop_list = [c.strip() for c in crops.split(",") if c.strip()]
    weather = get_multi_source_weather(city, lat=lat, lon=lon)
    eval_result = evaluate_crop_weather_advisories(weather, crop_list)

    return {
        "city": weather.get("city", city),
        "weather": weather,
        "registered_crops": crop_list,
        "risk_alerts": eval_result["risk_alerts"],
        "crop_evaluations": eval_result["crop_evaluations"],
        "alert_count": len(eval_result["risk_alerts"]),
        "total_evaluated_crops": eval_result["total_evaluated_crops"]
    }


@app.post("/api/chat")
def chat_with_rag_agent(req: ChatRequest):
    """
    Multi-tool Autonomous Agricultural Agent:
    Dynamically decides to call:
      - 'current_weather' (OpenWeather + Open-Meteo)
      - 'knowledge_base' (ChromaDB + TNAU/Koppert)
      - 'web_search' (DDGS / Live web search)
    Synthesizes natural, conversational farmer responses in English, Hindi, Marathi, or Kannada.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    result = agri_agent.run(
        query=req.query,
        language=req.language,
        city=req.city,
        registered_crops=req.registered_crops,
        current_crop=req.current_crop,
        detected_disease=req.detected_disease,
        history=req.history
    )

    return result


@app.get("/api/knowledge-base")
def get_knowledge_base():
    """Returns curated database of crops, diseases, symptoms, and control methods."""
    return {
        "total_records": len(rag_agent.kb_data),
        "records": rag_agent.kb_data
    }


@app.post("/api/knowledge-base/refresh")
def refresh_knowledge_base():
    """Refreshes and rebuilds knowledge base and ChromaDB indices."""
    kb = build_and_save_full_dataset()
    rag_agent._load_knowledge_base()
    rag_agent._init_vector_store()
    return {"status": "success", "total_records": len(kb)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
