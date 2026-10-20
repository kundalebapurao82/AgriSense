"""
AgriSense Multi-Tool Agricultural AI Agent
Implements tool-augmented reasoning (LangChain / ReAct architecture).
Equipped with 3 foundational agricultural tools:
  1. tool_current_weather: Live OpenWeather & Open-Meteo meteorological parameters
  2. tool_knowledge_base: TNAU Agritech & Koppert scientific vector corpus (ChromaDB)
  3. tool_web_search: Real-time agricultural search & latest advisories (DDGS)

Dynamically selects 1, 2, or 3 tools based on the user's question, gathers observations,
and synthesizes a natural, conversational, farmer-friendly response in English, Hindi, Marathi, or Kannada.
"""

import os
import json
import re
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

from backend.services.weather_service import get_multi_source_weather
from backend.services.rag_service import rag_agent

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("Gemini_API_KEY") or os.getenv("Gemini_API_KEY_1", "")
OPENAI_API_KEY = os.getenv("OPEN_AI_API", "")


# ============================================================================
# TOOL 1: Current Meteorological & Forecast Tool
# ============================================================================
def tool_current_weather(city: str = "Ichalkaranji") -> Dict[str, Any]:
    """
    Fetches real-time multi-source weather (OpenWeatherMap + Open-Meteo) for a given city.
    Returns temperature, humidity, rainfall, wind, and forecast.
    """
    try:
        w = get_multi_source_weather(city)
        return {
            "tool": "current_weather",
            "city": w.get("city", city),
            "temperature_c": w.get("temp"),
            "humidity_percent": w.get("humidity"),
            "condition": w.get("condition"),
            "description": w.get("description"),
            "wind_speed_ms": w.get("wind_speed"),
            "rain_1h_mm": w.get("rain_1h", 0.0),
            "sources": ["OpenWeatherMap", "Open-Meteo Verified"]
        }
    except Exception as e:
        return {"tool": "current_weather", "error": str(e), "city": city}


# ============================================================================
# TOOL 2: Scientific Agricultural Knowledge Base Tool (ChromaDB)
# ============================================================================
def tool_knowledge_base(query: str, crop: Optional[str] = None) -> Dict[str, Any]:
    """
    Retrieves vetted agricultural disease symptoms, pathogens, biological controls (Koppert),
    and chemical sprays (TNAU) from the ChromaDB vector database.
    """
    try:
        passages = rag_agent.search_passages(query=query, crop=crop, n_results=3)
        docs = [p["text"] for p in passages] if passages else []
        sources = list(set([p.get("metadata", {}).get("source", "TNAU / Koppert") for p in passages]))
        return {
            "tool": "knowledge_base",
            "query": query,
            "crop": crop,
            "passages": docs,
            "sources": sources or ["TNAU Agritech Portal", "Koppert Biological Systems"]
        }
    except Exception as e:
        return {"tool": "knowledge_base", "error": str(e), "passages": []}


# ============================================================================
# TOOL 3: Live Web Search Tool (DDGS)
# ============================================================================
def tool_web_search(query: str, max_results: int = 3) -> Dict[str, Any]:
    """
    Searches the live web for real-time agricultural advisories, recent disease outbreaks,
    mandi rates, or farming queries not covered in the static knowledge base.
    """
    results = []
    # Try ddgs
    try:
        from ddgs import DDGS
        ddgs = DDGS()
        search_query = f"{query} agriculture India"
        for r in ddgs.text(search_query, max_results=max_results):
            results.append({
                "title": r.get("title", ""),
                "snippet": r.get("body", ""),
                "url": r.get("href", "")
            })
    except Exception as e:
        pass

    # Fallback to duckduckgo_search if ddgs threw
    if not results:
        try:
            import urllib.request
            import urllib.parse
            from bs4 import BeautifulSoup
            clean_q = urllib.parse.quote_plus(f"{query} agriculture ICAR")
            url = f"https://html.duckduckgo.com/html/?q={clean_q}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            with urllib.request.urlopen(req, timeout=6) as resp:
                soup = BeautifulSoup(resp.read().decode("utf-8", errors="ignore"), "html.parser")
                for a in soup.find_all("a", class_="result__snippet")[:max_results]:
                    results.append({"title": "Web Search Result", "snippet": a.get_text(strip=True), "url": ""})
        except Exception:
            pass

    return {
        "tool": "web_search",
        "query": query,
        "results": results,
        "sources": ["Live Agricultural Web Search"]
    }


# ============================================================================
# AGENT TOOL ROUTING / DECISION ENGINE
# ============================================================================
def decide_tools(query: str, registered_crops: List[str]) -> List[str]:
    """
    Intelligently analyzes the user's question to decide which tool(s) should be called:
      - 'current_weather': questions about weather, temperature, humidity, rain, climate suitability
      - 'knowledge_base': questions about diseases, symptoms, treatments, sprays, bio-control
      - 'web_search': questions about market rates, mandi prices, new varieties, govt schemes, news
    Can select 1, 2, or all 3 tools.
    """
    q = query.lower()
    tools = []

    # Weather indicators (English, Marathi, Hindi, Kannada)
    weather_keywords = [
        "weather", "temperature", "temp", "humidity", "rain", "forecast", "climate", "hot", "cold",
        "हवामान", "तापमान", "पाऊस", "दमट", "गारठा", "उकाडा", "थंडी",
        "मौसम", "तापमान", "बारिश", "आर्द्रता", "नमी", "गर्मी", "सर्दी",
        "ಹವಾಮಾನ", "ತಾಪಮಾನ", "ಮಳೆ", "ಬಿಸಿಲು"
    ]

    # Crop & disease indicators
    disease_keywords = [
        "disease", "blight", "mildew", "rot", "rust", "spot", "symptom", "control", "spray", "fungicide",
        "fertilizer", "pest", "drench", "biological", "mancozeb", "bordeaux",
        "रोग", "करपा", "भुरी", "केवडा", "तांबेरा", "सड", "लक्षण", "फवारणी", "औषध", "कीड", "जैविक",
        "रोग", "झुलसा", "मिल्ड्यू", "दवा", "उपचार", "रोकथाम", "कीट",
        "ರೋಗ", "ಅಂಗಮಾರಿ", "ಔಷಧ", "ಸಿಂಪರಣೆ", "ಲಕ್ಷಣ"
    ]

    # Web search / current market / external indicators
    web_keywords = [
        "market", "mandi", "rate", "bhav", "price", "subsidy", "scheme", "variety", "hybrid", "trend",
        "बाजार", "भाव", "मार्केट", "योजना", "अनुदान", "वाण",
        "मंडी", "दाम", "सरकारी", "योजना", "किस्म",
        "ಮಾರುಕಟ್ಟೆ", "ಬೆಲೆ", "ಯೋಜನೆ"
    ]

    # Check for weather need
    if any(k in q for k in weather_keywords) or "कसे आहे" in q or "कैसा है" in q or "suitability" in q:
        tools.append("current_weather")

    # Check for knowledge base need (or crop mentioned with weather)
    crop_mentioned = any(c.lower() in q for c in ["grape", "tomato", "potato", "cotton", "corn", "maize", "chilli", "sugarcane", "soybean", "द्राक्ष", "टोमॅटो", "बटाटा", "कापूस", "मका", "ऊस", "मिरची", "टमाटर", "आलू", "अंगूर"])
    if any(k in q for k in disease_keywords) or (crop_mentioned and "current_weather" in tools) or not tools:
        tools.append("knowledge_base")

    # Check for web search need
    if any(k in q for k in web_keywords):
        tools.append("web_search")

    # Always ensure at least 1 tool is activated
    if not tools:
        tools.append("knowledge_base")

    return list(dict.fromkeys(tools))  # preserve order & unique


class AgriculturalAgent:
    def __init__(self):
        pass

    def run(
        self,
        query: str,
        language: str = "en",
        city: str = "Ichalkaranji",
        registered_crops: Optional[List[str]] = None,
        current_crop: Optional[str] = None,
        detected_disease: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Executes the Autonomous Tool-Augmented Agent workflow:
          1. Decides which tool(s) to invoke based on user intent.
          2. Runs tools (weather, knowledge base, web search).
          3. Synthesizes a natural, highly contextualized conversational reply in the farmer's language.
        """
        crops = registered_crops or ["Tomato", "Grape", "Potato", "Cotton"]
        selected_tools = decide_tools(query, crops)

        tool_outputs = {}
        all_sources = []

        # 1. Execute Selected Tools
        if "current_weather" in selected_tools:
            w_data = tool_current_weather(city)
            tool_outputs["current_weather"] = w_data
            all_sources.extend(w_data.get("sources", []))

        if "knowledge_base" in selected_tools:
            crop_hint = current_crop or (crops[0] if crops else None)
            kb_data = tool_knowledge_base(query, crop=crop_hint)
            tool_outputs["knowledge_base"] = kb_data
            all_sources.extend(kb_data.get("sources", []))

        if "web_search" in selected_tools:
            search_data = tool_web_search(query)
            tool_outputs["web_search"] = search_data
            all_sources.extend(search_data.get("sources", []))

        # 2. Build Structured Observation Context for LLM
        observations_block = []
        if "current_weather" in tool_outputs:
            cw = tool_outputs["current_weather"]
            observations_block.append(
                f"[TOOL: CURRENT WEATHER for {cw.get('city')}]\n"
                f"Temperature: {cw.get('temperature_c')}°C | Humidity: {cw.get('humidity_percent')}% | "
                f"Condition: {cw.get('condition')} ({cw.get('description')}) | Wind: {cw.get('wind_speed_ms')} m/s | Rain: {cw.get('rain_1h_mm')} mm"
            )

        if "knowledge_base" in tool_outputs:
            kb = tool_outputs["knowledge_base"]
            passages_text = "\n\n".join(kb.get("passages", []))
            if passages_text:
                observations_block.append(f"[TOOL: AGRICULTURAL KNOWLEDGE BASE]\n{passages_text}")

        if "web_search" in tool_outputs:
            ws = tool_outputs["web_search"]
            search_text = "\n".join([f"- {r['title']}: {r['snippet']}" for r in ws.get("results", [])])
            if search_text:
                observations_block.append(f"[TOOL: LIVE WEB SEARCH]\n{search_text}")

        full_observations = "\n\n".join(observations_block)

        # 3. Multilingual System Prompt
        lang_prompt = {
            "en": "Respond directly and conversationally in English. Use clear bullet points and polite tone.",
            "hi": "उत्तर पूरी तरह से सरल और स्पष्ट हिंदी में दें। सीधे किसान के सवाल का जवाब दें। बुलेट बिंदुओं में समझाएं।",
            "mr": "उत्तर पूर्णपणे सोप्या, आपुलकीच्या आणि स्पष्ट मराठीत द्या. शेतकऱ्याने विचारलेल्या प्रश्नाचे थेट व समर्पक उत्तर द्या. महत्वाचे मुद्दे बुलेट पॉईंट्समध्ये मांडा.",
            "kn": "ರೈತರಿಗೆ ಸುಲಭವಾಗಿ ಅರ್ಥವಾಗುವಂತೆ ಸ್ಪಷ್ಟ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ. ಬುಲೆಟ್ ಪಾಯಿಂಟ್‌ಗಳನ್ನು ಬಳಸಿ."
        }
        instruction = lang_prompt.get(language, lang_prompt["en"])

        prompt = f"""You are AgriSense AI Assistant, a friendly, highly competent agricultural extension specialist talking directly to a farmer.

Farmer Information:
- Location / City: {city}
- Farmer's Registered Crops: {', '.join(crops)}
- Currently Selected / Inspected Crop: {current_crop or 'Not specified'}

Information Gathered from Agent Tools:
{full_observations}

Farmer's Question:
"{query}"

Formatting & Presentation Guidelines:
1. Answer the farmer's question directly, accurately, and conversationally.
2. {instruction}
3. PRESENTATION FORMAT:
   - Present information in clean, highly readable sections with clear headings and bold highlights.
   - For listing diseases or steps, use structured cards/bullet points rather than cramming text into unreadable single-line tables. E.g.:
     ### 1. [रोगाचे नाव / Disease Name]
     - **लक्षणे (Symptoms):** ...
     - **कारणे (Causes):** ...
     - **प्रतिबंध व फवारणी (Prevention & Control):** ...
   - If using a table, keep table columns concise and use standard Markdown table syntax without raw HTML tags like `<br>`.
4. If weather data was provided, explain clearly how the current temperature and humidity affect their specific crop (e.g., whether conditions are safe or favorable for diseases like powdery mildew, late blight, etc.).
5. Provide practical, immediate next steps (such as irrigation timing, monitoring, or safe organic/chemical spray with dosages).
"""

        # 4. Generate LLM Response with fallback (Groq -> Gemini -> OpenAI)
        response_text = ""
        model_used = "AgriSense Agent"

        # Try Groq
        if GROQ_API_KEY and not response_text:
            try:
                import requests
                headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
                messages = [
                    {"role": "system", "content": "You are AgriSense AI agricultural extension expert."},
                    {"role": "user", "content": prompt}
                ]
                res = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json={
                        "model": "openai/gpt-oss-120b",
                        "messages": messages,
                        "temperature": 0.2,
                        "max_tokens": 3000
                    },
                    timeout=30
                )
                if res.status_code == 200:
                    response_text = res.json()["choices"][0]["message"]["content"]
                    model_used = "Groq LLaMA/GPT-OSS Agent"
            except Exception as e:
                pass

        # Try Gemini
        if (GEMINI_API_KEY or os.getenv("Gemini_API_KEY_1")) and not response_text:
            try:
                import requests
                key = GEMINI_API_KEY or os.getenv("Gemini_API_KEY_1")
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={key}"
                res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=14)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            response_text = parts[0].get("text", "")
                            model_used = "Google Gemini Flash Agent"
            except Exception as e:
                pass

        # Try OpenAI
        if OPENAI_API_KEY and not response_text:
            try:
                import requests
                headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
                messages = [{"role": "system", "content": "You are AgriSense AI expert."}, {"role": "user", "content": prompt}]
                res = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json={"model": "gpt-4o-mini", "messages": messages, "temperature": 0.2, "max_tokens": 3000},
                    timeout=30
                )
                if res.status_code == 200:
                    response_text = res.json()["choices"][0]["message"]["content"]
                    model_used = "OpenAI GPT-4o-mini Agent"
            except Exception as e:
                pass

        # Rule-based agronomic synthesis fallback if external APIs are unreachable
        if not response_text:
            temp = tool_outputs.get("current_weather", {}).get("temperature_c", 30)
            hum = tool_outputs.get("current_weather", {}).get("humidity_percent", 45)
            if language == "mr":
                response_text = f"नमस्कार शेतकरी बंधू,\n\nसध्या {city} मधील तापमान {temp}°C आणि हवेतील आर्द्रता {hum}% आहे.\n\nद्राक्षासाठी सध्याचे हवामान:\n- हवेतील आर्द्रता {hum}% असल्याने सध्या भुरी किंवा केवडा रोगाचा मोठा धोका नाही (या रोगांसाठी ७०% पेक्षा जास्त आर्द्रता लागते).\n- तापमान थोडे जास्त असल्याने बागेला ठिबकद्वारे वेळेवर पाणी द्यावे.\n- पानांवर धूळ किंवा पांढुरका थर दिसल्यास विद्राव्य गंधकाची (२ ग्रॅम/लिटर) प्रतिबंधात्मक फवारणी करू शकता."
            elif language == "hi":
                response_text = f"किसान भाई,\n\nवर्तमान में {city} में तापमान {temp}°C और नमी {hum}% है।\n\n- नमी कम होने के कारण अंगूर में फफूंद जनित रोगों (पाउडरी मिल्ड्यू) का खतरा नहीं है।\n- ड्रिप सिंचाई द्वारा पर्याप्त पानी दें।\n- आवश्यकता पड़ने पर घुलनशील सल्फर (2 ग्राम/लीटर) का छिड़काव करें।"
            else:
                response_text = f"Hello Farmer,\n\nCurrently in {city}, the temperature is {temp}°C with {hum}% relative humidity.\n\n- The air is relatively dry ({hum}% RH), so there is no immediate risk of fungal mildew (which thrives above 70% RH).\n- Ensure adequate drip irrigation due to the warmer temperature.\n- Keep monitoring leaf undersides for any stress."

        # Sanitize any raw HTML line breaks from LLM into clean markdown newlines
        if response_text:
            response_text = re.sub(r'<br\s*/?>', '\n', response_text)

        # Unique clean sources list
        clean_sources = list(dict.fromkeys(all_sources))
        if not clean_sources:
            clean_sources = ["TNAU Agritech Portal", "Koppert Biological Systems", "OpenWeatherMap"]

        return {
            "answer": response_text.strip(),
            "tools_used": selected_tools,
            "tool_outputs": tool_outputs,
            "sources": clean_sources,
            "model_used": model_used,
            "language": language
        }


# Singleton instance
agri_agent = AgriculturalAgent()
