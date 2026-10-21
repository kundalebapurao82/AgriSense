import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sprout,
  CloudSun,
  MessageSquareText,
  BookOpen,
  Cpu,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Send,
  Droplets,
  Wind,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  MapPin,
  Globe,
  Plus,
  X,
  Search,
  Wrench,
  Filter,
  Check
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { translations } from "./translations";
import { INDIA_LOCATIONS, DEFAULT_LOCATION } from "./locationsData";
import "./App.css";

const rawApiBase =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" ? "http://127.0.0.1:8000" : `http://${window.location.hostname}:8000`);
const API_BASE = rawApiBase.replace(/\/+$/, "");

const AVAILABLE_CROPS = [
  { name: "Grape", emoji: "🍇", hi: "अंगूर", mr: "द्राक्ष", kn: "ದ್ರಾಕ್ಷಿ" },
  { name: "Tomato", emoji: "🍅", hi: "टमाटर", mr: "टोमॅटो", kn: "ಟೊಮೆಟೊ" },
  { name: "Potato", emoji: "🥔", hi: "आलू", mr: "बटाटा", kn: "ಆಲೂಗಡ್ಡೆ" },
  { name: "Corn", emoji: "🌽", hi: "मक्का", mr: "मका", kn: "ಮೆಕ್ಕೆಜೋಳ" },
  { name: "Cotton", emoji: "🌾", hi: "कपास", mr: "कापूस", kn: "ಹತ್ತಿ" },
  { name: "Soybean", emoji: "🌱", hi: "सोयाबीन", mr: "सोयाबीन", kn: "ಸೋಯಾಬೀನ್" },
  { name: "Sugarcane", emoji: "🎋", hi: "गन्ना", mr: "ऊस", kn: "ಕಬ್ಬು" },
  { name: "Chilli", emoji: "🌶️", hi: "मिर्च", mr: "मिरची", kn: "ಮೆಣಸಿನಕಾಯಿ" },
  { name: "Onion", emoji: "🧅", hi: "प्याज", mr: "कांदा", kn: "ಈರುಳ್ಳಿ" },
  { name: "Wheat", emoji: "🌾", hi: "गेहूं", mr: "गहू", kn: "ಗೋಧಿ" },
  { name: "Rice", emoji: "🌾", hi: "चावल", mr: "भात", kn: "ಅಕ್ಕಿ" },
  { name: "Banana", emoji: "🍌", hi: "केला", mr: "केळी", kn: "ಬಾಳೆಹಣ್ಣು" },
  { name: "Apple", emoji: "🍎", hi: "सेब", mr: "सफरचंद", kn: "ಸೇಬು" }
];

const getCropMeta = (cropName) => {
  if (!cropName) return { name: "Crop", emoji: "🌱" };
  const found = AVAILABLE_CROPS.find(
    (c) =>
      c.name.toLowerCase() === cropName.toLowerCase() ||
      cropName.toLowerCase().includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(cropName.toLowerCase())
  );
  return found || { name: cropName, emoji: "🌱" };
};

const SAMPLE_LEAVES = [
  {
    name: "Tomato Late Blight",
    mr: "टोमॅटो करपा (Late Blight)",
    hi: "टमाटर पछेती झुलसा",
    kn: "ಟೊಮೆಟೊ ಅಂಗಮಾರಿ",
    crop: "Tomato",
    disease: "Late Blight",
    color: "#4a3b1a",
    spotColor: "#261c0b"
  },
  {
    name: "Potato Late Blight",
    mr: "बटाटा करपा (Late Blight)",
    hi: "आलू पछेती झुलसा",
    kn: "ಆಲೂಗಡ್ಡೆ ಅಂಗಮಾರಿ",
    crop: "Potato",
    disease: "Late Blight",
    color: "#524424",
    spotColor: "#1f1807"
  },
  {
    name: "Grape Powdery Mildew",
    mr: "द्राक्ष भुरी (Powdery Mildew)",
    hi: "अंगूर चूर्णिल आसिता",
    kn: "ದ್ರಾಕ್ಷಿ ಬೂದಿ ರೋಗ",
    crop: "Grape",
    disease: "Powdery Mildew",
    color: "#4d7c0f",
    spotColor: "#f1f5f9"
  },
  {
    name: "Corn Common Rust",
    mr: "मका तांबेरा (Common Rust)",
    hi: "मक्का गेरूई रोग",
    kn: "ಮೆಕ್ಕೆಜೋಳ ತುಕ್ಕು ರೋಗ",
    crop: "Corn",
    disease: "Common Rust",
    color: "#ca8a04",
    spotColor: "#9a3412"
  }
];

function generateSampleLeafBlob(sample) {
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");

  // Leaf background
  ctx.fillStyle = sample.color;
  ctx.beginPath();
  ctx.ellipse(150, 150, 90, 130, Math.PI / 4, 0, 2 * Math.PI);
  ctx.fill();

  // Veins
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 70);
  ctx.lineTo(230, 230);
  ctx.stroke();

  // Disease spots
  ctx.fillStyle = sample.spotColor;
  for (let i = 0; i < 18; i++) {
    const rx = 100 + Math.random() * 100;
    const ry = 100 + Math.random() * 100;
    const r = 5 + Math.random() * 14;
    ctx.beginPath();
    ctx.arc(rx, ry, r, 0, 2 * Math.PI);
    ctx.fill();
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
  });
}

export default function App() {
  const [lang, setLang] = useState("mr"); // Default to Marathi
  const t = translations[lang] || translations.en;

  const [activeTab, setActiveTab] = useState("weather"); // Start on Weather & Risk

  // Hierarchical Location State (Persisted in localStorage)
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("farmerLocation");
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState(() => selectedLocation.stateCode || "MH");
  const [selectedDistrictId, setSelectedDistrictId] = useState(() => (selectedLocation.districtId || "kolhapur").toLowerCase());
  const [tempSelectedTaluka, setTempSelectedTaluka] = useState(null);
  const [locationSearch, setLocationSearch] = useState("");

  // Registered crops state
  const [farmerCrops, setFarmerCrops] = useState(() => {
    const saved = localStorage.getItem("farmerCrops");
    return saved ? JSON.parse(saved) : ["Grape", "Tomato", "Potato", "Cotton", "Sugarcane"];
  });
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [customCropInput, setCustomCropInput] = useState("");

  // Leaf Detection State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  // Weather & Risk State
  const [weatherData, setWeatherData] = useState(null);
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [cropEvaluations, setCropEvaluations] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      role: "bot",
      content: translations.mr.chatGreeting
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Knowledge Base State
  const [knowledgeRecords, setKnowledgeRecords] = useState([]);
  const [searchKb, setSearchKb] = useState("");
  const [selectedKbItem, setSelectedKbItem] = useState(null);
  const [kbCropFilter, setKbCropFilter] = useState("all_my_crops");

  // Keep bot welcome greeting strictly synchronized when the user switches language
  useEffect(() => {
    setChatMessages((prev) => {
      if (prev.length <= 1 && prev[0]?.role === "bot") {
        return [
          {
            role: "bot",
            content: t.chatGreeting || translations[lang]?.chatGreeting || translations.en.chatGreeting
          }
        ];
      }
      return prev;
    });
  }, [lang]);

  // Save farmer crops & location to localStorage and fetch weather
  useEffect(() => {
    localStorage.setItem("farmerCrops", JSON.stringify(farmerCrops));
    localStorage.setItem("farmerLocation", JSON.stringify(selectedLocation));
    fetchWeather(selectedLocation, farmerCrops);
  }, [farmerCrops, selectedLocation]);

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedKbItem(null);
        setShowLocationModal(false);
        setShowAddCropModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const addCrop = (cropName) => {
    if (!cropName || !cropName.trim()) return;
    const clean = cropName.trim();
    if (!farmerCrops.includes(clean)) {
      setFarmerCrops([...farmerCrops, clean]);
    }
    setCustomCropInput("");
    setShowAddCropModal(false);
  };

  const removeCrop = (cropName) => {
    setFarmerCrops(farmerCrops.filter((c) => c !== cropName));
  };

  const fetchWeather = async (loc = selectedLocation, crops = farmerCrops) => {
    setLoadingWeather(true);
    try {
      const cropsStr = (crops || farmerCrops).join(",");
      const locObj = loc || selectedLocation;
      const cityName = locObj.taluka || locObj.displayName || "Ichalkaranji";
      let url = `${API_BASE}/api/weather?city=${encodeURIComponent(cityName)}&crops=${encodeURIComponent(cropsStr)}`;
      if (locObj.lat && locObj.lon) {
        url += `&lat=${locObj.lat}&lon=${locObj.lon}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data.weather);
        setRiskAlerts(data.risk_alerts || []);
        setCropEvaluations(data.crop_evaluations || []);
      }
    } catch (e) {
      console.warn("Weather fetch error:", e);
    } finally {
      setLoadingWeather(false);
    }
  };

  const fetchKnowledgeBase = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-base`);
      if (res.ok) {
        const data = await res.json();
        setKnowledgeRecords(data.records || []);
      }
    } catch (e) {
      console.warn("KB fetch error:", e);
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDetectionResult(null);
  };

  const handleSelectSample = async (sample) => {
    const blob = await generateSampleLeafBlob(sample);
    const file = new File([blob], `${sample.name.replace(/\s+/g, "_")}.jpg`, { type: "image/jpeg" });
    handleFileUpload(file);
  };

  const runDetection = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("language", lang);

      const res = await fetch(`${API_BASE}/api/detect`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setDetectionResult(data);
      } else {
        let errorMsg = res.statusText;
        try {
          const errJson = await res.json();
          if (errJson && errJson.detail) {
            errorMsg = errJson.detail;
          }
        } catch (_) {}
        alert(`Detection Error (${res.status}): ${errorMsg || "Could not analyze image. Please ensure the file is a valid leaf photo."}`);
      }
    } catch (e) {
      alert("Inference server error. Please ensure the AgriSense backend service is running on http://127.0.0.1:8000.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAskInChat = (disease, crop) => {
    const prompt =
      lang === "mr"
        ? `माझ्या ${crop} पिकावर ${disease} हा रोग आढळला आहे. सध्याच्या हवामानात यावर नियंत्रण मिळवण्यासाठी जैविक व रासायनिक उपाय सविस्तर सांगा.`
        : lang === "hi"
        ? `मेरी ${crop} की फसल में ${disease} का प्रकोप दिखा है। कृपया इसके जैविक और रासायनिक रोकथाम के उपाय विस्तार से बताएं।`
        : lang === "kn"
        ? `ನನ್ನ ${crop} ಬೆಳೆಯಲ್ಲಿ ${disease} ರೋಗ ಕಂಡುಬಂದಿದೆ. ಸೂಕ್ತ ಪರಿಹಾರ ತಿಳಿಸಿ.`
        : `My ${crop} crop was diagnosed with ${disease}. What are the recommended biological controls and preventive chemical sprays under current weather?`;

    setActiveTab("chat");
    sendChatMessage(prompt, crop, disease);
  };

  const sendChatMessage = async (textToSend, currentCrop = null, detectedDis = null) => {
    const msg = textToSend || chatInput;
    if (!msg.trim()) return;

    const newHistory = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(newHistory);
    if (!textToSend) setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: msg,
          language: lang,
          city: selectedLocation.taluka || selectedLocation.displayName || "Ichalkaranji",
          registered_crops: farmerCrops,
          current_crop: currentCrop || (detectionResult ? detectionResult.detection.crop : farmerCrops[0]),
          detected_disease: detectedDis || (detectionResult ? detectionResult.detection.disease : null),
          history: newHistory.slice(-4)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: data.answer,
            tools_used: data.tools_used,
            sources: data.sources,
            model_used: data.model_used
          }
        ]);
      } else {
        const errorDetail =
          res.status === 404
            ? "API route not found. Backend URL might have had a routing issue."
            : res.status === 502 || res.status === 503
            ? "Backend server is waking up or restarting on Render. Please try again in 20-30 seconds."
            : "Apologies, could not process request right now. Please verify API keys in .env.";
        setChatMessages((prev) => [
          ...prev,
          { role: "bot", content: errorDetail }
        ]);
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", content: "Connection to AgriSense Agent server failed." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredKb = knowledgeRecords.filter((r) => {
    // 1. Filter by selected crop mode
    const recordCrop = (r.crop || "").toLowerCase();

    if (kbCropFilter === "all_my_crops") {
      // Must match at least one of the user's registered crops
      const matches = farmerCrops.some((fc) => {
        const cLower = fc.toLowerCase();
        return recordCrop.includes(cLower) || cLower.includes(recordCrop);
      });
      if (!matches) return false;
    } else if (kbCropFilter !== "all_database") {
      // Specific crop chip selected
      const target = kbCropFilter.toLowerCase();
      if (!recordCrop.includes(target) && !target.includes(recordCrop)) {
        return false;
      }
    }

    // 2. Search query filter across all multilingual fields
    if (!searchKb.trim()) return true;
    const q = searchKb.toLowerCase().trim();
    const cropLocal = (r[`crop_${lang}`] || "").toLowerCase();
    const diseaseLocal = (r[`disease_${lang}`] || "").toLowerCase();
    const diseaseEn = (r.disease || "").toLowerCase();
    const pathogen = (r.pathogen || "").toLowerCase();
    const symptoms = (r.symptoms?.[lang] || r.symptoms?.en || "").toLowerCase();
    const causes = (r.causes?.[lang] || r.causes?.en || "").toLowerCase();

    return (
      recordCrop.includes(q) ||
      cropLocal.includes(q) ||
      diseaseLocal.includes(q) ||
      diseaseEn.includes(q) ||
      pathogen.includes(q) ||
      symptoms.includes(q) ||
      causes.includes(q)
    );
  });

  // Flatten all talukas across all states for unified search
  const allFlattenedTalukas = useMemo(() => {
    const list = [];
    INDIA_LOCATIONS.states.forEach((state) => {
      state.districts.forEach((dist) => {
        dist.talukas.forEach((tal) => {
          list.push({
            ...tal,
            stateName: state.name,
            stateCode: state.id,
            stateLocal: state[lang] || state.name,
            districtName: dist.name,
            districtId: dist.id,
            districtLocal: dist[lang] || dist.name,
            talukaLocal: tal[lang] || tal.name,
            displayName: `${tal.name}, ${dist.name}`
          });
        });
      });
    });
    return list;
  }, [lang]);

  // Search results
  const locationSearchResults = useMemo(() => {
    if (!locationSearch.trim()) return [];
    const q = locationSearch.toLowerCase().trim();
    return allFlattenedTalukas.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.talukaLocal.toLowerCase().includes(q) ||
        item.districtName.toLowerCase().includes(q) ||
        item.districtLocal.toLowerCase().includes(q) ||
        item.stateName.toLowerCase().includes(q) ||
        item.stateLocal.toLowerCase().includes(q)
    );
  }, [locationSearch, allFlattenedTalukas]);

  const activeState = INDIA_LOCATIONS.states.find((s) => s.id === selectedStateCode) || INDIA_LOCATIONS.states[0];
  const activeDistrict =
    activeState.districts.find((d) => d.id === selectedDistrictId) || activeState.districts[0] || { talukas: [] };

  const handleSelectTaluka = (taluka) => {
    setTempSelectedTaluka(taluka);
  };

  const applyLocationSelection = (talukaOverride = null) => {
    const taluka = talukaOverride || tempSelectedTaluka;
    if (!taluka) return;

    const stateObj = INDIA_LOCATIONS.states.find((s) => s.id === (taluka.stateCode || activeState.id)) || activeState;
    const distObj =
      stateObj.districts.find((d) => d.id === (taluka.districtId || activeDistrict.id)) || activeDistrict;

    const newLoc = {
      country: "India",
      state: stateObj.name,
      stateCode: stateObj.id,
      district: distObj.name,
      districtId: distObj.id,
      taluka: taluka.name,
      lat: taluka.lat,
      lon: taluka.lon,
      displayName: `${taluka[lang] || taluka.name}, ${distObj[lang] || distObj.name}`
    };

    setSelectedLocation(newLoc);
    setShowLocationModal(false);
    setLocationSearch("");
    setTempSelectedTaluka(null);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-section">
            <div className="brand-logo">
              <Sprout size={26} />
            </div>
            <div className="brand-titles">
              <h1>
                {t.title}
                <span className="brand-badge">Precision AI</span>
              </h1>
              <p className="brand-subtitle">{t.subtitle}</p>
            </div>
          </div>

          <div className="header-controls">
            <button
              className="location-badge-btn"
              onClick={() => setShowLocationModal(true)}
              title={t.changeLocation}
            >
              <MapPin size={16} color="#059669" />
              <div className="location-badge-text">
                <span className="location-badge-name">
                  {selectedLocation[lang] || selectedLocation.displayName || selectedLocation.taluka}
                </span>
                <span className="location-badge-action">{t.changeLocation}</span>
              </div>
            </button>

            <div className="lang-selector">
              <Globe size={16} />
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="mr">मराठी (Marathi)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="en">English (EN)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Farmer Registered Crops Toolbar */}
      <div className="crops-strip-bar">
        <div className="crops-strip-inner">
          <span className="crops-label">
            <Sprout size={16} />
            {t.farmerCrops}:
          </span>

          {farmerCrops.map((c, idx) => {
            const cropMatch = AVAILABLE_CROPS.find((ac) => ac.name.toLowerCase() === c.toLowerCase());
            const label = cropMatch ? (cropMatch[lang] || cropMatch.name) : c;
            const emoji = cropMatch ? cropMatch.emoji : "🌱";
            return (
              <span key={idx} className="crop-tag">
                <span>{emoji} {label}</span>
                <button className="btn-remove" title="Remove crop" onClick={() => removeCrop(c)}>
                  <X size={13} />
                </button>
              </span>
            );
          })}

          <button className="btn-add-crop" onClick={() => setShowAddCropModal(true)}>
            <Plus size={14} />
            {t.addCrop}
          </button>
        </div>
      </div>

      {/* Add Crop Modal */}
      {showAddCropModal && (
        <div className="add-crop-modal" onClick={() => setShowAddCropModal(false)}>
          <div className="add-crop-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#064e3b" }}>
                {t.addCrop}
              </h3>
              <button onClick={() => setShowAddCropModal(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 6 }}>
              Select a crop or type a custom crop:
            </p>

            <div className="quick-crop-chips">
              {AVAILABLE_CROPS.map((ac, idx) => (
                <button
                  key={idx}
                  className="quick-crop-chip"
                  onClick={() => addCrop(ac.name)}
                >
                  {ac.emoji} {ac[lang] || ac.name}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <input
                type="text"
                placeholder={t.enterCropName}
                value={customCropInput}
                onChange={(e) => setCustomCropInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCrop(customCropInput)}
                style={{ flex: 1, padding: "0.5rem 0.8rem", borderRadius: 8, border: "1px solid #cbd5e1", outline: "none" }}
              />
              <button className="btn-primary" onClick={() => addCrop(customCropInput)}>
                <Plus size={16} />
                {t.addCrop}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hierarchical Location Selection Modal (India -> State -> District -> Taluka) */}
      {showLocationModal && (
        <div className="loc-modal-backdrop" onClick={() => setShowLocationModal(false)}>
          <div className="loc-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="loc-modal-header">
              <h3 className="loc-modal-title">
                <MapPin size={22} color="#059669" />
                {t.locationModalTitle}
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                style={{ border: "none", background: "transparent", cursor: "pointer" }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="loc-modal-body">
              {/* Quick Search */}
              <div className="loc-search-wrapper">
                <Search size={18} className="loc-search-icon" />
                <input
                  type="text"
                  className="loc-search-input"
                  placeholder={t.searchLocationPlaceholder}
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
                {locationSearch && (
                  <button className="loc-search-clear" onClick={() => setLocationSearch("")}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {locationSearch.trim() ? (
                /* Search Results List */
                <div className="loc-hierarchy-step">
                  <div className="loc-step-title">
                    <span>Search Results ({locationSearchResults.length})</span>
                    <small style={{ color: "#059669" }}>{t.locationApiVerified}</small>
                  </div>
                  {locationSearchResults.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#94a3b8", padding: "1.5rem" }}>
                      No verified location matched "{locationSearch}".
                    </p>
                  ) : (
                    <div className="loc-search-results-list">
                      {locationSearchResults.map((item, idx) => {
                        const isChosen =
                          (tempSelectedTaluka && tempSelectedTaluka.name === item.name) ||
                          (!tempSelectedTaluka && selectedLocation.taluka === item.name);
                        return (
                          <div
                            key={idx}
                            className={`loc-search-item ${isChosen ? "selected" : ""}`}
                            onClick={() => applyLocationSelection(item)}
                          >
                            <div>
                              <strong style={{ color: "#0f172a", fontSize: "0.95rem" }}>
                                {item[lang] || item.name}
                              </strong>
                              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                {item.districtLocal}, {item.stateLocal} (India) • {item.lat.toFixed(2)}°N, {item.lon.toFixed(2)}°E
                              </div>
                            </div>
                            <span style={{ fontSize: "0.72rem", color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                              <CheckCircle2 size={13} /> {t.locationApiVerified}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Step-by-step Hierarchical Filters: India -> State -> District -> Taluka */
                <>
                  {/* Step 1: Country */}
                  <div className="loc-hierarchy-step">
                    <div className="loc-step-title">
                      <span>1. {t.selectCountry}</span>
                      <small style={{ color: "#059669" }}>Weather API Active</small>
                    </div>
                    <div className="loc-chips-row">
                      <div className="loc-chip-btn active" style={{ cursor: "default" }}>
                        <span>{INDIA_LOCATIONS.country.flag}</span>
                        <span>{INDIA_LOCATIONS.country[lang] || INDIA_LOCATIONS.country.name}</span>
                        <Check size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: State */}
                  <div className="loc-hierarchy-step">
                    <div className="loc-step-title">
                      <span>2. {t.selectState}</span>
                    </div>
                    <div className="loc-chips-row">
                      {INDIA_LOCATIONS.states.map((state) => {
                        const isStateActive = state.id === selectedStateCode;
                        return (
                          <button
                            key={state.id}
                            className={`loc-chip-btn ${isStateActive ? "active" : ""}`}
                            onClick={() => {
                              setSelectedStateCode(state.id);
                              if (state.districts.length > 0) {
                                setSelectedDistrictId(state.districts[0].id);
                              }
                              setTempSelectedTaluka(null);
                            }}
                          >
                            <span>{state[lang] || state.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: District */}
                  <div className="loc-hierarchy-step">
                    <div className="loc-step-title">
                      <span>3. {t.selectDistrict}</span>
                    </div>
                    <div className="loc-chips-row">
                      {activeState.districts.map((dist) => {
                        const isDistActive = dist.id === selectedDistrictId;
                        return (
                          <button
                            key={dist.id}
                            className={`loc-chip-btn ${isDistActive ? "active" : ""}`}
                            onClick={() => {
                              setSelectedDistrictId(dist.id);
                              setTempSelectedTaluka(null);
                            }}
                          >
                            <span>{dist[lang] || dist.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 4: Division / Taluka (Verified Coordinates) */}
                  <div className="loc-hierarchy-step">
                    <div className="loc-step-title">
                      <span>4. {t.selectTaluka}</span>
                      <small style={{ color: "#059669", display: "flex", alignItems: "center", gap: 3 }}>
                        <CheckCircle2 size={13} /> {t.locationApiVerified}
                      </small>
                    </div>
                    <div className="loc-taluka-grid">
                      {activeDistrict.talukas.map((taluka, tidx) => {
                        const isTalukaChosen =
                          (tempSelectedTaluka && tempSelectedTaluka.name === taluka.name) ||
                          (!tempSelectedTaluka && selectedLocation.taluka === taluka.name && selectedLocation.district === activeDistrict.name);

                        return (
                          <div
                            key={tidx}
                            className={`loc-taluka-card ${isTalukaChosen ? "selected" : ""}`}
                            onClick={() => handleSelectTaluka(taluka)}
                          >
                            <div className="loc-taluka-name">
                              {taluka[lang] || taluka.name}
                            </div>
                            <div className="loc-taluka-sub">
                              {taluka.name} • {taluka.lat.toFixed(2)}°N, {taluka.lon.toFixed(2)}°E
                            </div>
                            <div className="loc-taluka-verified">
                              <CheckCircle2 size={12} />
                              <span>{t.locationApiVerified}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="loc-modal-footer">
              <button className="btn-secondary" onClick={() => setShowLocationModal(false)}>
                {t.close}
              </button>
              <button
                className="btn-primary"
                disabled={!tempSelectedTaluka && !locationSearch}
                onClick={() => applyLocationSelection()}
              >
                <Check size={16} />
                {t.applyLocation}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="tabs-nav-bar">
        <div className="tabs-nav-inner">
          <button
            className={`nav-tab-btn ${activeTab === "weather" ? "active" : ""}`}
            onClick={() => setActiveTab("weather")}
          >
            <CloudSun size={18} />
            {t.tabWeather}
            {riskAlerts.length > 0 && (
              <span style={{ background: "#ef4444", color: "white", padding: "1px 6px", borderRadius: 10, fontSize: "0.72rem" }}>
                {riskAlerts.length}
              </span>
            )}
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "detect" ? "active" : ""}`}
            onClick={() => setActiveTab("detect")}
          >
            <Sprout size={18} />
            {t.tabDetect}
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <MessageSquareText size={18} />
            {t.tabChat}
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "knowledge" ? "active" : ""}`}
            onClick={() => setActiveTab("knowledge")}
          >
            <BookOpen size={18} />
            {t.tabKnowledge}
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "colab" ? "active" : ""}`}
            onClick={() => setActiveTab("colab")}
          >
            <Cpu size={18} />
            {t.tabColab}
          </button>
        </div>
      </nav>

      {/* Main Tab Content */}
      <main className="main-wrapper">
        {/* TAB 1: WEATHER & DISEASE RISK ADVISORY WITH PER-CROP EXPLANATIONS */}
        {activeTab === "weather" && (
          <div className="animate-fade">
            <div className="card">
              <div className="card-title-bar">
                <h2>
                  <CloudSun size={22} color="#059669" />
                  {t.weatherTitle} ({selectedLocation[lang] || selectedLocation.displayName || selectedLocation.taluka})
                </h2>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  <button
                    className="btn-outline"
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", padding: "0.45rem 0.9rem" }}
                    onClick={() => setShowLocationModal(true)}
                  >
                    <MapPin size={15} color="#059669" />
                    <span>{selectedLocation[lang] || selectedLocation.displayName || selectedLocation.taluka}</span>
                    <span style={{ fontSize: "0.74rem", color: "#64748b" }}>({t.changeLocation})</span>
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => fetchWeather(selectedLocation, farmerCrops)}
                    title="Refresh weather"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
              </div>

              {/* Weather Metrics */}
              {weatherData && (
                <div className="weather-header-grid">
                  <div className="weather-metric-card">
                    <div className="metric-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
                      <Thermometer size={26} />
                    </div>
                    <div>
                      <div className="metric-val">{weatherData.temp}°C</div>
                      <div className="metric-lbl">{t.temperature}</div>
                    </div>
                  </div>

                  <div className="weather-metric-card">
                    <div className="metric-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                      <Droplets size={26} />
                    </div>
                    <div>
                      <div className="metric-val">{weatherData.humidity}%</div>
                      <div className="metric-lbl">{t.humidity}</div>
                    </div>
                  </div>

                  <div className="weather-metric-card">
                    <div className="metric-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                      <Wind size={26} />
                    </div>
                    <div>
                      <div className="metric-val">{weatherData.wind_speed} m/s</div>
                      <div className="metric-lbl">{t.windSpeed}</div>
                    </div>
                  </div>

                  <div className="weather-metric-card">
                    <div className="metric-icon" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                      <CloudSun size={26} />
                    </div>
                    <div>
                      <div className="metric-val" style={{ fontSize: "1.1rem" }}>{weatherData.condition}</div>
                      <div className="metric-lbl">{weatherData.description}</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.2rem", fontSize: "0.82rem", color: "#059669", fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>{t.multiSourceVerified}</span>
              </div>

              {/* Comprehensive Per-Crop Weather & Disease Evaluation */}
              <div style={{ marginTop: "1.8rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#064e3b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ShieldAlert size={22} color="#059669" />
                    {t.cropEvaluationsTitle}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 2 }}>
                    {t.cropEvaluationsSubtitle}
                  </p>
                </div>

                <div className="crop-eval-grid">
                  {cropEvaluations.map((evalItem, idx) => {
                    const isRisk = evalItem.status === "RISK";
                    const cropLabel = evalItem[`crop_${lang}`] || evalItem.crop;
                    const diseaseLabel = evalItem[`disease_${lang}`] || evalItem.disease;
                    const explanationText = evalItem.explanation[lang] || evalItem.explanation.en;
                    const recText = evalItem.recommendation[lang] || evalItem.recommendation.en;

                    return (
                      <div key={idx} className={`crop-eval-card ${isRisk ? "risk" : "safe"}`}>
                        <div className="crop-eval-header">
                          <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>
                            {cropLabel}
                          </strong>
                          <span className={`crop-status-pill ${isRisk ? "risk" : "safe"}`}>
                            {isRisk ? `⚠️ ${t.cropStatusRisk}` : `✅ ${t.cropStatusSafe}`}
                          </span>
                        </div>

                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: isRisk ? "#991b1b" : "#166534", marginBottom: 6 }}>
                          {isRisk ? `Disease: ${diseaseLabel}` : `Status: ${diseaseLabel}`}
                        </div>

                        <p style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.5, marginBottom: "0.8rem" }}>
                          {explanationText}
                        </p>

                        <div style={{ background: "rgba(255,255,255,0.7)", padding: "0.5rem 0.8rem", borderRadius: 8, fontSize: "0.82rem", color: "#475569" }}>
                          <strong>Recommendation:</strong> {recText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTILINGUAL AI AGENT CHATBOT (AUTONOMOUS TOOL CALLING) */}
        {activeTab === "chat" && (
          <div className="animate-fade">
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: "1.2rem 1.6rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#064e3b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <MessageSquareText size={20} color="#059669" />
                  {t.chatTitle}
                </h2>
                <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>
                  {t.chatSubtitle}
                </p>
              </div>

              <div className="chat-window">
                <div className="chat-history">
                  {chatMessages.map((m, idx) => (
                    <div key={idx} className={`chat-msg ${m.role}`}>
                      <div className={`avatar ${m.role}`}>
                        {m.role === "bot" ? "🌿" : "👨‍🌾"}
                      </div>
                      <div>
                        <div className={`bubble ${m.role}`}>
                          {m.role === "bot" ? (
                            <div className="markdown-content">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {m.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            m.content
                          )}
                        </div>

                        {/* Render Agent Tools Called */}
                        {m.tools_used && m.tools_used.length > 0 && (
                          <div className="tool-badge-row">
                            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                              <Wrench size={12} /> {t.toolsCalled}:
                            </span>
                            {m.tools_used.map((tool, tidx) => (
                              <span key={tidx} className="tool-chip">
                                {tool === "current_weather" && "🌤️ Live Weather (OpenWeather & Open-Meteo)"}
                                {tool === "knowledge_base" && "📚 Knowledge Base (ChromaDB)"}
                                {tool === "web_search" && "🌐 Web Search (DDGS)"}
                              </span>
                            ))}
                          </div>
                        )}

                        {m.sources && (
                          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4, display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <span>📚 {m.sources.join(" | ")}</span>
                            {m.model_used && <span>• {m.model_used}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="chat-msg bot">
                      <div className="avatar bot">🌿</div>
                      <div className="bubble bot" style={{ fontStyle: "italic", color: "#64748b" }}>
                        Agent is reasoning and consulting tools (Weather, Knowledge Base, Web Search)...
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <div className="chat-input-area">
                  <input
                    type="text"
                    placeholder={t.chatPlaceholder}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                  />
                  <button className="btn-primary" onClick={() => sendChatMessage()} disabled={chatLoading}>
                    <Send size={16} />
                    {t.send}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LEAF DISEASE DETECTION */}
        {activeTab === "detect" && (
          <div className="detection-grid animate-fade">
            <div className="card">
              <div className="card-title-bar">
                <h2>
                  <Upload size={20} color="#059669" />
                  {t.tabDetect}
                </h2>
              </div>

              <div className="dropzone" onClick={() => document.getElementById("leaf-input").click()}>
                <input
                  id="leaf-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
                <Sprout size={40} color="#059669" style={{ margin: "0 auto 0.8rem auto" }} />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#064e3b" }}>
                  {t.uploadPrompt}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 4 }}>
                  {t.uploadSub}
                </p>
              </div>

              {previewUrl && (
                <div className="preview-box">
                  <img src={previewUrl} alt="Leaf Preview" />
                </div>
              )}

              <div style={{ marginTop: "1.2rem" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  {t.demoImages}:
                </p>
                <div className="samples-strip">
                  {SAMPLE_LEAVES.map((sample, idx) => (
                    <button
                      key={idx}
                      className="sample-chip"
                      onClick={() => handleSelectSample(sample)}
                    >
                      🌿 {sample[lang] || sample.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <button
                  className="btn-primary"
                  style={{ width: "100%" }}
                  disabled={!selectedFile || analyzing}
                  onClick={runDetection}
                >
                  {analyzing ? (
                     <>
                      <RefreshCw className="animate-spin" size={18} />
                      {t.analyzing}
                    </>
                  ) : (
                    <>
                      <Sprout size={18} />
                      {t.analyzeLeafDisease}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-title-bar">
                <h2>
                  <CheckCircle2 size={20} color="#059669" />
                  {t.diagnosisResult}
                </h2>
                {detectionResult && (
                  <span style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 700, background: "#ecfdf5", padding: "2px 8px", borderRadius: 8 }}>
                    ✓ {detectionResult.detection.model_status}
                  </span>
                )}
              </div>

              {!detectionResult ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
                  <Sprout size={56} style={{ margin: "0 auto 1rem auto", opacity: 0.4 }} />
                  <p style={{ fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
                    {t.uploadLeafPlaceholder}
                  </p>
                </div>
              ) : (
                <div className="animate-fade">
                  <div className="diagnosis-banner">
                    <div className="diagnosis-header">
                      <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>
                          {detectionResult.detection.crop}
                        </span>
                        <div className="disease-name-badge">
                          {detectionResult.advisory?.localized_disease || detectionResult.detection.disease}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{t.confidence}</span>
                        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#059669" }}>
                          {detectionResult.detection.confidence}%
                        </div>
                      </div>
                    </div>

                    <div className="confidence-meter">
                      <div
                        className="confidence-fill"
                        style={{ width: `${detectionResult.detection.confidence}%` }}
                      />
                    </div>
                  </div>

                  {detectionResult.advisory && (
                    <div>
                      <div style={{ marginBottom: "0.8rem", fontSize: "0.9rem" }}>
                        <strong style={{ color: "#334155" }}>{t.pathogen}:</strong>{" "}
                        <span style={{ fontStyle: "italic", color: "#059669", fontWeight: 600 }}>
                          {detectionResult.advisory.pathogen}
                        </span>
                      </div>

                      <div className="advisory-box">
                        <span className="advisory-tag" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                          {t.symptoms}
                        </span>
                        <p style={{ fontSize: "0.92rem", color: "#334155", marginTop: 4 }}>
                          {detectionResult.advisory.symptoms}
                        </p>
                      </div>

                      <div className="advisory-box-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                        <div className="advisory-box" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                          <span className="advisory-tag tag-bio">
                            {t.bioControl}
                          </span>
                          <p style={{ fontSize: "0.88rem", color: "#166534", marginTop: 4 }}>
                            {detectionResult.advisory.biological_control}
                          </p>
                        </div>

                        <div className="advisory-box" style={{ background: "#fff1f2", borderColor: "#fecdd3" }}>
                          <span className="advisory-tag tag-chem">
                            {t.chemControl}
                          </span>
                          <p style={{ fontSize: "0.88rem", color: "#991b1b", marginTop: 4 }}>
                            {detectionResult.advisory.chemical_control}
                          </p>
                        </div>
                      </div>

                      <div style={{ marginTop: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          Sources: {detectionResult.advisory.sources?.join(", ")}
                        </span>
                        <button
                          className="btn-primary"
                          onClick={() => handleAskInChat(detectionResult.detection.disease, detectionResult.detection.crop)}
                        >
                          <MessageSquareText size={16} />
                          {t.askAboutThis}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CROP KNOWLEDGE BASE & MANAGEMENT DOSSIER */}
        {activeTab === "knowledge" && (
          <div className="animate-fade">
            <div className="card">
              <div className="card-title-bar">
                <div>
                  <h2>
                    <BookOpen size={22} color="#059669" />
                    {t.tabKnowledge}
                    <span className="brand-badge" style={{ marginLeft: "0.6rem" }}>
                      {filteredKb.length} {t.totalDiseases}
                    </span>
                  </h2>
                </div>

                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Search crop, disease, causes, pathogen..."
                    value={searchKb}
                    onChange={(e) => setSearchKb(e.target.value)}
                    style={{
                      padding: "0.45rem 1rem",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      width: "clamp(200px, 25vw, 320px)",
                      fontSize: "0.88rem"
                    }}
                  />
                  {searchKb && (
                    <button
                      onClick={() => setSearchKb("")}
                      style={{
                        background: "#e2e8f0",
                        border: "none",
                        borderRadius: "50%",
                        width: 26,
                        height: 26,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Crop Filter Switcher Toolbar */}
              <div className="kb-filter-toolbar">
                <div className="kb-filter-label">
                  <Filter size={15} color="#059669" />
                  <span>{t.filterByCrop}</span>
                </div>

                <div className="kb-filter-chips">
                  {/* All Registered Crops button */}
                  <button
                    className={`kb-filter-chip ${kbCropFilter === "all_my_crops" ? "active" : ""}`}
                    onClick={() => setKbCropFilter("all_my_crops")}
                  >
                    🌿 {t.allRegisteredCrops} ({farmerCrops.length})
                  </button>

                  {/* Individual registered crop chips */}
                  {farmerCrops.map((cropName) => {
                    const meta = getCropMeta(cropName);
                    const count = knowledgeRecords.filter((r) => {
                      const c = (r.crop || "").toLowerCase();
                      const target = cropName.toLowerCase();
                      return c.includes(target) || target.includes(c);
                    }).length;

                    return (
                      <button
                        key={cropName}
                        className={`kb-filter-chip ${kbCropFilter.toLowerCase() === cropName.toLowerCase() ? "active" : ""}`}
                        onClick={() => setKbCropFilter(cropName)}
                      >
                        <span className="kb-crop-emoji">{meta.emoji}</span>
                        <span>{meta[lang] || cropName}</span>
                        <span style={{ opacity: 0.75, fontSize: "0.74rem" }}>({count})</span>
                      </button>
                    );
                  })}

                  {/* Explore all crops in database */}
                  <button
                    className={`kb-filter-chip kb-chip-all ${kbCropFilter === "all_database" ? "active" : ""}`}
                    onClick={() => setKbCropFilter("all_database")}
                  >
                    🌐 {t.showAllDbCrops} ({knowledgeRecords.length})
                  </button>
                </div>
              </div>

              {/* Disease Compact Cards Grid */}
              {filteredKb.length === 0 ? (
                <div
                  style={{
                    padding: "3rem 1.5rem",
                    textAlign: "center",
                    background: "#f8fafc",
                    borderRadius: 14,
                    border: "1px dashed #cbd5e1"
                  }}
                >
                  <AlertTriangle size={36} color="#f59e0b" style={{ margin: "0 auto 0.8rem" }} />
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                    {t.noDiseasesMatch}
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "#64748b", maxWidth: 440, margin: "0 auto 1.2rem" }}>
                    Try selecting "All Available Crops" or add more crops in the top "My Crops" bar.
                  </p>
                  <button
                    className="btn-primary"
                    style={{ margin: "0 auto" }}
                    onClick={() => {
                      setKbCropFilter("all_database");
                      setSearchKb("");
                    }}
                  >
                    🌐 {t.showAllDbCrops}
                  </button>
                </div>
              ) : (
                <div className="kb-disease-grid">
                  {filteredKb.map((item, idx) => {
                    const meta = getCropMeta(item.crop);
                    const primaryCauses =
                      item.primary_causes?.[lang] ||
                      item.primary_causes?.en || [
                        item.causes?.[lang] || item.causes?.en || "Airborne fungal or bacterial spores spread in humid weather.",
                        "Optimal temperature and prolonged leaf wetness triggers outbreak."
                      ];

                    return (
                      <div
                        key={idx}
                        className="kb-disease-card"
                        onClick={() => setSelectedKbItem(item)}
                        tabIndex={0}
                        role="button"
                        aria-label={item[`disease_${lang}`] || item.disease}
                      >
                        <div className="kb-card-header">
                          <span className="kb-crop-badge">
                            <span className="kb-crop-emoji">{meta.emoji}</span>
                            <span>{item[`crop_${lang}`] || item.crop}</span>
                          </span>

                          {item.pathogen && (
                            <span className="kb-pathogen-pill" title={item.pathogen}>
                              {item.pathogen.split("(")[0].trim().split(" ").slice(0, 2).join(" ")}
                            </span>
                          )}
                        </div>

                        <h3 className="kb-disease-title">
                          {item[`disease_${lang}`] || item.disease}
                        </h3>

                        {lang !== "en" && item.disease && (
                          <div className="kb-disease-subtitle">{item.disease}</div>
                        )}

                        {/* Primary 2 causes prominent box */}
                        <div className="kb-causes-box">
                          <div className="kb-causes-heading">
                            <AlertTriangle size={13} color="#ea580c" />
                            <span>{t.primaryCausesTitle}</span>
                          </div>
                          <ul className="kb-causes-list">
                            {primaryCauses.slice(0, 2).map((cause, cIdx) => (
                              <li key={cIdx} className="kb-cause-item">
                                <span className="kb-cause-bullet">{cIdx + 1}</span>
                                <span className="kb-cause-text">{cause}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="kb-card-footer">
                          <span className="kb-tap-prompt">
                            {t.clickForDetails}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DETAILED INFORMATION COMPONENT (MODAL / RESPONSIVE DRAWER) */}
            {selectedKbItem && (
              <div
                className="kb-modal-backdrop"
                onClick={() => setSelectedKbItem(null)}
              >
                <div
                  className="kb-modal-container"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="kb-modal-header">
                    <div className="kb-modal-title-group">
                      <div className="kb-modal-badges">
                        <span className="kb-crop-badge">
                          <span className="kb-crop-emoji">{getCropMeta(selectedKbItem.crop).emoji}</span>
                          <span>{selectedKbItem[`crop_${lang}`] || selectedKbItem.crop}</span>
                        </span>
                        {selectedKbItem.pathogen && (
                          <span className="kb-pathogen-pill">
                            🔬 {selectedKbItem.pathogen}
                          </span>
                        )}
                      </div>
                      <h2 className="kb-modal-title">
                        {selectedKbItem[`disease_${lang}`] || selectedKbItem.disease}
                      </h2>
                      {lang !== "en" && (
                        <div className="kb-modal-en-name">{selectedKbItem.disease}</div>
                      )}
                    </div>
                    <button
                      className="kb-modal-close"
                      onClick={() => setSelectedKbItem(null)}
                      aria-label={t.close}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="kb-modal-body">
                    {/* Favorable Weather triggers */}
                    {selectedKbItem.favorable_weather && (
                      <div className="kb-detail-section kb-weather-triggers">
                        <h4 className="kb-section-heading">
                          <CloudSun size={17} color="#0284c7" />
                          <span>{t.favorableConditions}</span>
                        </h4>
                        <div className="kb-weather-chips">
                          <span className="kb-weather-chip">
                            <Thermometer size={14} />
                            {selectedKbItem.favorable_weather.temp_min}°C – {selectedKbItem.favorable_weather.temp_max}°C
                          </span>
                          <span className="kb-weather-chip">
                            <Droplets size={14} />
                            RH ≥ {selectedKbItem.favorable_weather.humidity_min}%
                          </span>
                          {selectedKbItem.favorable_weather.rainfall_favorable && (
                            <span className="kb-weather-chip rain">
                              🌧️ {lang === "mr" ? "पावसाने रोग वाढतो" : lang === "hi" ? "वर्षा से प्रसार" : "Rain triggers spread"}
                            </span>
                          )}
                        </div>
                        {selectedKbItem.favorable_weather.description && (
                          <p className="kb-weather-desc">
                            {selectedKbItem.favorable_weather.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Symptoms & Visual Identification */}
                    <div className="kb-detail-section">
                      <h4 className="kb-section-heading">
                        <span className="kb-heading-icon">🩺</span>
                        <span>{t.symptoms}</span>
                      </h4>
                      <p className="kb-detail-text">
                        {selectedKbItem.symptoms?.[lang] || selectedKbItem.symptoms?.en}
                      </p>
                    </div>

                    {/* Full Causes & Outbreak Triggers */}
                    <div className="kb-detail-section">
                      <h4 className="kb-section-heading">
                        <span className="kb-heading-icon">⚠️</span>
                        <span>{t.causes}</span>
                      </h4>
                      <p className="kb-detail-text">
                        {selectedKbItem.causes?.[lang] || selectedKbItem.causes?.en}
                      </p>
                    </div>

                    {/* Integrated Treatments & Controls Grid */}
                    <div className="kb-treatment-grid">
                      {/* Biological Control (Koppert India) */}
                      <div className="kb-treatment-card kb-bio-card">
                        <div className="kb-treatment-header bio">
                          <Sprout size={18} color="#16a34a" />
                          <span>{t.bioControl}</span>
                        </div>
                        <p className="kb-treatment-body">
                          {selectedKbItem.control?.biological ||
                            selectedKbItem.control?.[`${lang}_summary`] ||
                            selectedKbItem.control?.en_summary}
                        </p>
                      </div>

                      {/* Chemical Control & Dosages (TNAU / ICAR) */}
                      <div className="kb-treatment-card kb-chem-card">
                        <div className="kb-treatment-header chem">
                          <ShieldAlert size={18} color="#dc2626" />
                          <span>{t.chemControl}</span>
                        </div>
                        <p className="kb-treatment-body">
                          {selectedKbItem.control?.chemical ||
                            selectedKbItem.control?.[`${lang}_summary`] ||
                            selectedKbItem.control?.en_summary}
                        </p>
                      </div>
                    </div>

                    {/* Preventive Agronomic Practices */}
                    {selectedKbItem.prevention && (
                      <div className="kb-detail-section kb-prevention-section">
                        <h4 className="kb-section-heading">
                          <CheckCircle2 size={17} color="#059669" />
                          <span>{t.prevention}</span>
                        </h4>
                        <p className="kb-detail-text">
                          {selectedKbItem.prevention?.[lang] || selectedKbItem.prevention?.en}
                        </p>
                      </div>
                    )}

                    {/* Sources Citation */}
                    {selectedKbItem.sources && (
                      <div className="kb-sources-footer">
                        <small>
                          {t.verifiedSource}: {selectedKbItem.sources.join(" • ")}
                        </small>
                      </div>
                    )}
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="kb-modal-footer">
                    <button
                      className="btn-secondary"
                      onClick={() => setSelectedKbItem(null)}
                    >
                      {t.close}
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        const disease = selectedKbItem[`disease_${lang}`] || selectedKbItem.disease;
                        const crop = selectedKbItem[`crop_${lang}`] || selectedKbItem.crop;
                        setSelectedKbItem(null);
                        handleAskInChat(disease, crop);
                      }}
                    >
                      <MessageSquareText size={16} />
                      {t.askAboutThis}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: COLAB TRAINING HUB */}
        {activeTab === "colab" && (
          <div className="animate-fade">
            <div className="card">
              <div className="card-title-bar">
                <h2>
                  <Cpu size={22} color="#059669" />
                  {t.colabHeader}
                </h2>
                <span className="brand-badge">ResNet50 • 99.74% Accuracy Checkpointed</span>
              </div>
              <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
                {t.colabSub}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.2rem", marginBottom: "1.8rem" }}>
                <div style={{ padding: "1.2rem", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#059669", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: "0.8rem" }}>
                    1
                  </div>
                  <h4 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Upload to Colab</h4>
                  <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Open Google Colab and upload <code style={{ color: "#059669" }}>training/train_plant_disease_colab.ipynb</code>.
                  </p>
                </div>

                <div style={{ padding: "1.2rem", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#059669", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: "0.8rem" }}>
                    2
                  </div>
                  <h4 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>T4 GPU Training</h4>
                  <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Trained with transfer learning on 38 PlantVillage classes, achieving <strong>99.74% accuracy</strong>.
                  </p>
                </div>

                <div style={{ padding: "1.2rem", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#059669", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: "0.8rem" }}>
                    3
                  </div>
                  <h4 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Weights Loaded</h4>
                  <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    <code style={{ color: "#059669" }}>plant_disease_model.pth</code> is actively loaded in memory for CPU inference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Standard Enterprise AgriSense Platform Footer */}
      <footer className="app-footer">
        <p>
          <strong>AgriSense</strong> — Intelligent Precision Agriculture &amp; Crop Health Decision Support System
        </p>
        <p style={{ marginTop: 4, opacity: 0.8 }}>
          Powered by Deep Learning Vision, Hyperlocal Meteorological Telemetry &amp; Autonomous Multi-Tool AI Advisory
        </p>
      </footer>
    </div>
  );
}
