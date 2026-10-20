"""
AgriSense RAG Agricultural Advisory & Multilingual Conversational Agent
Powered by LangChain, ChromaDB, and multi-model LLM routing (Groq, Gemini, OpenAI).
Supports: English, Hindi (हिंदी), Marathi (मराठी), and Kannada (ಕನ್ನಡ).
"""

import os
import json
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

# API Keys from .env
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("Gemini_API_KEY") or os.getenv("Gemini_API_KEY_1", "")
OPENAI_API_KEY = os.getenv("OPEN_AI_API", "")

CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "chroma_db")
KB_JSON_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "knowledge_base.json")


class AgriculturalRAGAgent:
    def __init__(self):
        self.chroma_client = None
        self.collection = None
        self.kb_data = []
        self._load_knowledge_base()
        self._init_vector_store()

    def _load_knowledge_base(self):
        """Loads curated crop-disease knowledge base."""
        if os.path.exists(KB_JSON_PATH):
            try:
                with open(KB_JSON_PATH, "r", encoding="utf-8") as f:
                    self.kb_data = json.load(f)
                    print(f"[+] Loaded {len(self.kb_data)} disease dossiers from {KB_JSON_PATH}")
                    return
            except Exception as e:
                print(f"[!] Warning reading KB json: {e}")
        
        # Fallback to importing from scraper service
        try:
            from backend.services.scraper_service import build_and_save_full_dataset
            self.kb_data = build_and_save_full_dataset(KB_JSON_PATH)
        except Exception as e:
            print(f"[!] Fallback KB generation note: {e}")

    def _init_vector_store(self):
        """Initializes ChromaDB collection with agricultural documents."""
        try:
            import chromadb
            os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
            self.chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
            self.collection = self.chroma_client.get_or_create_collection(name="agrisense_kb")

            expected_docs = len(self.kb_data) * 3
            if self.collection.count() != expected_docs and self.kb_data:
                print(f"[*] Refreshing ChromaDB index ({self.collection.count()} -> {expected_docs} docs)...")
                try:
                    self.chroma_client.delete_collection(name="agrisense_kb")
                    self.collection = self.chroma_client.create_collection(name="agrisense_kb")
                except Exception:
                    pass
                documents = []
                metadatas = []
                ids = []

                for idx, entry in enumerate(self.kb_data):
                    crop = entry.get("crop", "Unknown")
                    disease = entry.get("disease", "Unknown")
                    pathogen = entry.get("pathogen", "")

                    # 1. Symptoms passage
                    symptoms_en = entry.get("symptoms", {}).get("en", "")
                    doc_sym = f"Crop: {crop}\nDisease: {disease}\nPathogen: {pathogen}\nSymptoms: {symptoms_en}"
                    documents.append(doc_sym)
                    metadatas.append({"crop": crop.lower(), "disease": disease.lower(), "type": "symptoms", "source": "TNAU Agritech"})
                    ids.append(f"{crop}_{disease}_sym_{idx}".replace(" ", "_"))

                    # 2. Prevention & Causes
                    causes_en = entry.get("causes", {}).get("en", "")
                    prev_en = entry.get("prevention", {}).get("en", "")
                    doc_prev = f"Crop: {crop}\nDisease: {disease}\nCauses: {causes_en}\nPreventive Measures: {prev_en}"
                    documents.append(doc_prev)
                    metadatas.append({"crop": crop.lower(), "disease": disease.lower(), "type": "prevention", "source": "TNAU / Koppert"})
                    ids.append(f"{crop}_{disease}_prev_{idx}".replace(" ", "_"))

                    # 3. Control & Treatment
                    bio_ctrl = entry.get("control", {}).get("biological", "")
                    chem_ctrl = entry.get("control", {}).get("chemical", "")
                    doc_ctrl = f"Crop: {crop}\nDisease: {disease}\nBiological Control: {bio_ctrl}\nChemical Treatment & Fungicides: {chem_ctrl}"
                    documents.append(doc_ctrl)
                    metadatas.append({"crop": crop.lower(), "disease": disease.lower(), "type": "control", "source": "Koppert Disease Control / TNAU"})
                    ids.append(f"{crop}_{disease}_ctrl_{idx}".replace(" ", "_"))

                self.collection.add(documents=documents, metadatas=metadatas, ids=ids)
                print(f"[OK] Indexed {len(documents)} agricultural passages into ChromaDB!")
        except Exception as e:
            print(f"[!] ChromaDB init notice: {e}. Vector search will use high-efficiency in-memory fallback.")

    def search_passages(self, query: str, crop: Optional[str] = None, n_results: int = 4) -> List[Dict[str, Any]]:
        """Retrieves most relevant agricultural passages from ChromaDB."""
        results = []
        if self.collection:
            try:
                where_filter = {"crop": crop.lower()} if crop else None
                query_res = self.collection.query(
                    query_texts=[query],
                    n_results=min(n_results, self.collection.count() or n_results),
                    where=where_filter
                )
                if query_res and "documents" in query_res and query_res["documents"]:
                    docs = query_res["documents"][0]
                    metas = query_res["metadatas"][0] if "metadatas" in query_res else [{}] * len(docs)
                    for d, m in zip(docs, metas):
                        results.append({"text": d, "metadata": m})
            except Exception as e:
                print(f"[!] ChromaDB query error: {e}")

        # Fallback keyword match from KB data if vector search returns empty
        if not results and self.kb_data:
            q_lower = query.lower()
            for entry in self.kb_data:
                c = entry.get("crop", "").lower()
                d = entry.get("disease", "").lower()
                if (crop and crop.lower() in c) or c in q_lower or d in q_lower or "disease" in q_lower:
                    results.append({
                        "text": f"Crop: {entry.get('crop')}\nDisease: {entry.get('disease')}\nSymptoms: {entry.get('symptoms',{}).get('en')}\nControl: {entry.get('control',{}).get('biological')} {entry.get('control',{}).get('chemical')}",
                        "metadata": {"crop": c, "disease": d, "source": "TNAU / Koppert Agritech"}
                    })
                    if len(results) >= n_results:
                        break

        return results

    def get_disease_dossier(self, crop: str, disease: str, language: str = "en") -> Optional[Dict[str, Any]]:
        """
        Direct structured lookup of symptoms, causes, prevention, and control
        for the leaf image diagnosis result in the requested language.
        """
        c_norm = crop.strip().lower()
        d_norm = disease.strip().lower()

        for entry in self.kb_data:
            entry_crop = entry.get("crop", "").lower()
            entry_dis = entry.get("disease", "").lower()

            if (c_norm in entry_crop or entry_crop in c_norm) and (d_norm in entry_dis or entry_dis in d_norm or "blight" in d_norm and "blight" in entry_dis):
                # Format localized output
                lang_key = language if language in ["en", "hi", "mr", "kn"] else "en"
                
                # Fetch localized crop & disease names
                localized_crop = entry.get(f"crop_{lang_key}", entry.get("crop"))
                localized_disease = entry.get(f"disease_{lang_key}", entry.get("disease"))

                symptoms = entry.get("symptoms", {}).get(lang_key, entry.get("symptoms", {}).get("en", ""))
                causes = entry.get("causes", {}).get(lang_key, entry.get("causes", {}).get("en", ""))
                prevention = entry.get("prevention", {}).get(lang_key, entry.get("prevention", {}).get("en", ""))
                
                control_dict = entry.get("control", {})
                ctrl_summary = control_dict.get(f"{lang_key}_summary", control_dict.get("en_summary", ""))
                bio_ctrl = control_dict.get("biological", "")
                chem_ctrl = control_dict.get("chemical", "")

                return {
                    "crop": entry.get("crop"),
                    "localized_crop": localized_crop,
                    "disease": entry.get("disease"),
                    "localized_disease": localized_disease,
                    "pathogen": entry.get("pathogen", ""),
                    "symptoms": symptoms,
                    "causes": causes,
                    "prevention": prevention,
                    "control_summary": ctrl_summary,
                    "biological_control": bio_ctrl,
                    "chemical_control": chem_ctrl,
                    "sources": entry.get("sources", ["TNAU Agritech", "Koppert Disease Control"])
                }

        return None

    def ask(self, query: str, language: str = "en", current_crop: Optional[str] = None, detected_disease: Optional[str] = None, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Main Conversational RAG endpoint:
        Grounded in TNAU/Koppert agricultural corpus.
        Answers in English, Hindi, Marathi, or Kannada with verified source tags.
        """
        # Step 1: Retrieve relevant context passages
        search_query = f"{current_crop or ''} {detected_disease or ''} {query}".strip()
        passages = self.search_passages(search_query, crop=current_crop)
        
        context_str = "\n\n---\n\n".join([p["text"] for p in passages]) if passages else "No specific document passage found. Use agronomic best practices."

        lang_instructions = {
            "en": "Respond clearly in English with bullet points. Be polite, encouraging, and actionable for farmers.",
            "hi": "स्पष्ट और सरल हिंदी में उत्तर दें। बुलेट बिंदुओं का उपयोग करें। किसान के लिए समझने योग्य और व्यावहारिक सलाह दें।",
            "mr": "सोप्या आणि स्पष्ट मराठीत उत्तर द्या. मुद्देसूद माहिती द्या (बुलेट पॉईंट्स). शेतकऱ्याला सहज समजेल असा सल्ला द्या.",
            "kn": "ಸರಳ ಮತ್ತು ಸ್ಪಷ್ಟ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ. ರೈತರಿಗೆ ಸುಲಭವಾಗಿ ಅರ್ಥವಾಗುವಂತೆ ಬುಲೆಟ್ ಪಾಯಿಂಟ್‌ಗಳನ್ನು ಬಳಸಿ."
        }
        chosen_instruction = lang_instructions.get(language, lang_instructions["en"])

        prompt_system = f"""You are AgriSense AI, an expert agricultural extension advisor designed to assist farmers with crop health, pest and disease management, and sustainable farming.
Your advice is strictly grounded in verifiable agronomic scientific publications (TNAU Agritech Portal and Koppert Biological Systems).

Farmer's Context:
- Registered / Current Crop: {current_crop or 'Not specified'}
- Recent Disease Diagnosis: {detected_disease or 'None'}

Grounding Agricultural Knowledge:
{context_str}

Language Instruction:
{chosen_instruction}

Guidelines:
1. Always suggest preventive and organic/biological controls (like Trichoderma, neem formulations, beneficial predators) alongside safe chemical fungicides/pesticides with precise dosages.
2. If weather or temperature affects this disease, mention it.
3. Be concise, direct, and supportive.
4. State the verified sources at the end: (Source: TNAU Agritech / Koppert Disease Control).
"""

        # Step 2: Try LLMs in order of speed and capability: Groq -> Gemini -> OpenAI -> Local Fallback
        response_text = ""
        used_model = "Local Knowledge Engine"

        # 1. Try Groq (Llama 3.3 70B / Llama 3.1 8B)
        if GROQ_API_KEY and not response_text:
            try:
                import requests
                headers = {
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                }
                messages = [{"role": "system", "content": prompt_system}]
                if history:
                    for h in history[-4:]:
                        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
                messages.append({"role": "user", "content": query})

                payload = {
                    "model": "openai/gpt-oss-120b",
                    "messages": messages,
                    "temperature": 0.2,
                    "max_tokens": 3000
                }
                res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=30)
                if res.status_code == 200:
                    data = res.json()
                    response_text = data["choices"][0]["message"]["content"]
                    used_model = "Groq LLaMA/GPT-OSS (High Speed)"
                else:
                    print(f"[!] Groq error {res.status_code}: {res.text}")
            except Exception as e:
                print(f"[!] Groq invocation failed: {e}")

        # 2. Try Gemini
        if (GEMINI_API_KEY or os.getenv("Gemini_API_KEY_1")) and not response_text:
            try:
                import requests
                key = GEMINI_API_KEY or os.getenv("Gemini_API_KEY_1")
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={key}"
                full_prompt = f"{prompt_system}\n\nUser Question: {query}"
                payload = {
                    "contents": [{"parts": [{"text": full_prompt}]}]
                }
                res = requests.post(url, json=payload, timeout=12)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            response_text = parts[0].get("text", "")
                            used_model = "Google Gemini Flash"
                else:
                    print(f"[!] Gemini error {res.status_code}: {res.text}")
            except Exception as e:
                print(f"[!] Gemini invocation failed: {e}")

        # 3. Try OpenAI
        if OPENAI_API_KEY and not response_text:
            try:
                import requests
                headers = {
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                }
                messages = [{"role": "system", "content": prompt_system}, {"role": "user", "content": query}]
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 800
                }
                res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=12)
                if res.status_code == 200:
                    data = res.json()
                    response_text = data["choices"][0]["message"]["content"]
                    used_model = "OpenAI GPT-4o-mini"
            except Exception as e:
                print(f"[!] OpenAI invocation failed: {e}")

        # 4. Fallback if offline/keys unavailable
        if not response_text:
            if passages:
                top_p = passages[0]["text"]
                response_text = f"Based on agricultural extension records:\n\n{top_p}\n\n(Source: TNAU Agritech & Koppert India)"
            else:
                response_text = "Please check crop leaves for visible lesions or spots. Ensure good field aeration, avoid excess nitrogen, and apply Trichoderma viride (5g/L) as a prophylactic measure."

        sources = list(set([p.get("metadata", {}).get("source", "TNAU Agritech") for p in passages]))
        if not sources:
            sources = ["TNAU Agritech Portal", "Koppert Disease Control"]

        return {
            "answer": response_text,
            "sources": sources,
            "language": language,
            "model_used": used_model,
            "retrieved_passages_count": len(passages)
        }


# Singleton instance
rag_agent = AgriculturalRAGAgent()
