# AgriSense: Deep Learning Crop Disease Detection, Weather-Driven Risk Advisory & Multilingual AI Assistant

**Department of Computer Science & Engineering (Artificial Intelligence and Machine Learning)**  
**D.K.T.E. Society's Textile and Engineering Institute, Ichalkaranji (2025–26)**  
**Authors:** Mr. Jatin Sanjaykumar Dayama (23UAM025) & Mr. Bapurao Anil Kundale (23UAM066)

---

## 🌾 Project Architecture & Modules

### 1. Image-Based Plant Disease Detection (Deep Learning)
- **Architecture**: Transfer learning with **ResNet50** and **MobileNetV3** on the **PlantVillage** dataset (38 disease and healthy classes).
- **Google Colab GPU Training Workflow**:
  - Training script: [`training/train.py`](file:///e:/Honors_Project/training/train.py)
  - Ready-to-run Colab Notebook: [`training/train_plant_disease_colab.ipynb`](file:///e:/Honors_Project/training/train_plant_disease_colab.ipynb)
  - Detailed Guide: [`training/README.md`](file:///e:/Honors_Project/training/README.md)
  - Exports PyTorch (`.pth`), ONNX (`.onnx`), and `class_names.json`.
- **Inference Service**: [`backend/services/detection_service.py`](file:///e:/Honors_Project/backend/services/detection_service.py) loads weights from `backend/models/` and links each prediction to verified symptoms, causes, biological control, and chemical treatments.

---

### 2. Multi-Source Weather & Agro-Meteorological Risk Engine
- **Service**: [`backend/services/weather_service.py`](file:///e:/Honors_Project/backend/services/weather_service.py)
- **Sources**:
  - **OpenWeatherMap API**: Live temperature, weather description, and humidity by city/village name.
  - **Open-Meteo API**: High-resolution hourly agricultural forecast (no API key required), dew point, rainfall sum, and wind speed.
- **Disease Outbreak Risk Model**:
  - Quantitative rules matching temperature, humidity thresholds (e.g. Late Blight: 10–24°C, RH ≥85%; Powdery Mildew: 20–28°C; Bacterial Blight: 25–35°C with rainfall).
  - Automatically raises **HIGH** or **MODERATE** preventive alert warnings for the farmer's registered crops.

---

### 3. TNAU & Koppert Scraper, ChromaDB & Multilingual RAG Agent
- **Scraper Service**: [`backend/services/scraper_service.py`](file:///e:/Honors_Project/backend/services/scraper_service.py)
  - Scrapes disease descriptions, symptoms, and spray schedules from [TNAU Agritech Portal](https://agritech.tnau.ac.in/crop_protection/crop_prot_crop_diseases.html)
  - Scrapes biological disease control products from [Koppert India](https://www.koppert.in/disease-control/)
  - Compiles structured dataset in [`backend/data/knowledge_base.json`](file:///e:/Honors_Project/backend/data/knowledge_base.json)
- **Vector Database**: **ChromaDB** with `all-MiniLM-L6-v2` dense embeddings stored locally in `backend/data/chroma_db/`.
- **Conversational RAG Assistant**: [`backend/services/rag_service.py`](file:///e:/Honors_Project/backend/services/rag_service.py)
  - Grounded strictly in retrieved scientific agricultural passages.
  - Multi-model routing: Groq (high-speed LLaMA/GPT-OSS), Google Gemini Flash, and OpenAI.
  - Full native multilingual support:
    - 🇬🇧 English
    - 🇮🇳 Hindi (हिंदी)
    - 🚩 Marathi (मराठी)
    - 🌾 Kannada (ಕನ್ನಡ)

---

### 4. Modern React Frontend Dashboard
- **Path**: [`frontend/`](file:///e:/Honors_Project/frontend) (React 18 + Vite + Lucide icons + custom agricultural CSS tokens)
- **Interactive Tabs**:
  1. 📸 **Leaf Disease Detection**: Drag & drop or demo sample leaves with confidence bar, pathogen, symptoms, and dual biological + chemical control.
  2. 🌦️ **Weather & Disease Risk**: Dual-source meteorological data for Ichalkaranji/custom cities with outbreak warnings.
  3. 💬 **Multilingual RAG Chatbot**: Chat with verified citation badges (TNAU / Koppert).
  4. 📚 **Knowledge Explorer**: Searchable encyclopedia across Indian crops.
  5. 🚀 **Colab Training Hub**: Step-by-step instructions for GPU training.

---

## 🚀 Running the Project Locally

### Option 1: One-Click Launch (Windows)
Double click `run.bat` or run:
```powershell
.\run.bat
```

### Option 2: Manual Commands
1. **Activate Virtual Environment & Run Backend Server**:
   ```powershell
   .\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   API Docs available at: `http://127.0.0.1:8000/docs`

2. **Run React Frontend**:
   ```powershell
   cd frontend
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
   Web Dashboard available at: `http://127.0.0.1:5173/`
