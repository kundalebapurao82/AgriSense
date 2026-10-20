"""
AgriSense Backend API Server
Deep Learning Plant Disease Detection, Weather-Driven Risk Advisory, and Multilingual RAG Assistant.
"""

import os
import json
from typing import List, Optional
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
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid image format. Please upload JPG or PNG leaf image.")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # 1. Run Deep Learning inference
    inference_result = detector.predict_image(image_bytes)

    # 2. Enrich with structured agronomic dossier in requested language
    dossier = rag_agent.get_disease_dossier(
        crop=inference_result["crop"],
        disease=inference_result["disease"],
        language=language
    )

    return {
        "status": "success",
        "detection": inference_result,
        "advisory": dossier,
        "language": language
    }


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
