/**
 * Verified Indian Agricultural Locations Database
 * Hierarchical structure: India -> State -> District -> Division / Taluka
 * Every location has exact geographic coordinates (lat, lon) verified to fetch live meteorological data
 * via OpenWeatherMap & Open-Meteo APIs.
 */

export const INDIA_LOCATIONS = {
  country: {
    code: "IN",
    name: "India",
    mr: "भारत",
    hi: "भारत",
    kn: "ಭಾರತ",
    flag: "🇮🇳"
  },
  states: [
    {
      id: "MH",
      name: "Maharashtra",
      mr: "महाराष्ट्र",
      hi: "महाराष्ट्र",
      kn: "ಮಹಾರಾಷ್ಟ್ರ",
      districts: [
        {
          id: "kolhapur",
          name: "Kolhapur",
          mr: "कोल्हापूर",
          hi: "कोल्हापुर",
          kn: "ಕೊಲ್ಲಾಪುರ",
          talukas: [
            { name: "Ichalkaranji", mr: "इचलकरंजी", hi: "इचलकरंजी", kn: "ಇಚಲಕರಂಜಿ", lat: 16.6967, lon: 74.4608 },
            { name: "Kolhapur City", mr: "कोल्हापूर शहर", hi: "कोल्हापुर शहर", kn: "ಕೊಲ್ಲಾಪುರ ನಗರ", lat: 16.7050, lon: 74.2433 },
            { name: "Shirol", mr: "शिरोळ", hi: "शिरोल", kn: "ಶಿರೋಳ", lat: 16.7460, lon: 74.5976 },
            { name: "Hatkanangale", mr: "हातकणंगले", hi: "हातकणंगले", kn: "ಹಾತಕಣಂಗಲೆ", lat: 16.7467, lon: 74.4447 },
            { name: "Kagal", mr: "कागल", hi: "कागल", kn: "ಕಾಗಲ", lat: 16.5786, lon: 74.3167 },
            { name: "Gadhinglaj", mr: "गडहिंग्लज", hi: "गडहिंग्लज", kn: "ಗಡಹಿಂಗ್ಲಜ್", lat: 16.2294, lon: 74.3547 },
            { name: "Panhala", mr: "पन्हाळा", hi: "पन्हाला", kn: "ಪನ್ಹಾಲಾ", lat: 16.8156, lon: 74.1167 },
            { name: "Radhanagari", mr: "राधानगरी", hi: "राधानगरी", kn: "ರಾಧಾನಗರಿ", lat: 16.4167, lon: 74.0000 }
          ]
        },
        {
          id: "sangli",
          name: "Sangli",
          mr: "सांगली",
          hi: "सांगली",
          kn: "ಸಾಂಗ್ಲಿ",
          talukas: [
            { name: "Sangli City", mr: "सांगली शहर", hi: "सांगली शहर", kn: "ಸಾಂಗ್ಲಿ ನಗರ", lat: 16.8524, lon: 74.5815 },
            { name: "Miraj", mr: "मिरज", hi: "मिरज", kn: "ಮಿರಜ್", lat: 16.7725, lon: 74.6467 },
            { name: "Tasgaon", mr: "तासगाव", hi: "तासगांव", kn: "ತಾಸ್ಗಾಂವ್", lat: 17.0345, lon: 74.6006 },
            { name: "Islampur (Walwa)", mr: "इस्लामपूर (वाळवा)", hi: "इस्लामपुर (वालवा)", kn: "ಇಸ್ಲಾಂಪುರ", lat: 17.0519, lon: 74.2678 },
            { name: "Palus", mr: "पलूस", hi: "पलूस", kn: "ಪಲೂಸ್", lat: 17.0983, lon: 74.4539 },
            { name: "Vita (Khanapur)", mr: "विटा (खानापूर)", hi: "विटा (खानापुर)", kn: "ವಿಟಾ", lat: 17.2758, lon: 74.5367 },
            { name: "Jath", mr: "जत", hi: "जत", kn: "ಜತ್", lat: 17.0450, lon: 75.2217 },
            { name: "Atpadi", mr: "आटपाडी", hi: "आटपाडी", kn: "ಆಟಪಾಡಿ", lat: 17.4206, lon: 74.9458 }
          ]
        },
        {
          id: "pune",
          name: "Pune",
          mr: "पुणे",
          hi: "पुणे",
          kn: "ಪುಣೆ",
          talukas: [
            { name: "Pune Central", mr: "पुणे शहर", hi: "पुणे शहर", kn: "ಪುಣೆ ನಗರ", lat: 18.5204, lon: 73.8567 },
            { name: "Baramati", mr: "बारामती", hi: "बारामती", kn: "ಬಾರಾಮತಿ", lat: 18.1517, lon: 74.5772 },
            { name: "Junnar", mr: "जुन्नर", hi: "जुन्नर", kn: "ಜುನ್ನಾರ್", lat: 19.2064, lon: 73.8767 },
            { name: "Shirur", mr: "शिरूर", hi: "शिरूर", kn: "ಶಿರೂರು", lat: 18.8258, lon: 74.3769 },
            { name: "Indapur", mr: "इंदापूर", hi: "इंदापुर", kn: "ಇಂದಾಪುರ", lat: 18.1167, lon: 75.0333 },
            { name: "Daund", mr: "दौंड", hi: "दौंड", kn: "ದೌಂಡ್", lat: 18.4631, lon: 74.5858 },
            { name: "Ambegaon (Manchar)", mr: "आंबेगाव (मंचर)", hi: "आम्बेगांव (मंचर)", kn: "ಆಂಬೆಗಾಂವ್", lat: 19.0061, lon: 73.9389 },
            { name: "Khed (Rajgurunagar)", mr: "खेड (राजगुरुनगर)", hi: "खेड", kn: "ಖೇಡ್", lat: 18.8539, lon: 73.9167 }
          ]
        },
        {
          id: "nashik",
          name: "Nashik",
          mr: "नाशिक",
          hi: "नासिक",
          kn: "ನಾಸಿಕ್",
          talukas: [
            { name: "Nashik City", mr: "नाशिक शहर", hi: "नासिक शहर", kn: "ನಾಸಿಕ್ ನಗರ", lat: 19.9975, lon: 73.7898 },
            { name: "Niphad", mr: "निफाड (द्राक्ष पट्टा)", hi: "निफाड", kn: "ನಿಫಾಡ್", lat: 20.0822, lon: 74.1084 },
            { name: "Dindori", mr: "दिंडोरी", hi: "डिंडोरी", kn: "ದಿಂಡೋರಿ", lat: 20.2033, lon: 73.8344 },
            { name: "Yeola", mr: "येवला", hi: "येवला", kn: "ಯೇವಲಾ", lat: 20.0406, lon: 74.4842 },
            { name: "Sinnar", mr: "सिन्नर", hi: "सिन्नर", kn: "ಸಿನ್ನಾರ್", lat: 19.8483, lon: 74.0044 },
            { name: "Malegaon", mr: "मालेगाव", hi: "मालेगांव", kn: "ಮಾಲೆಗಾಂವ್", lat: 20.5539, lon: 74.5317 },
            { name: "Satana (Baglan)", mr: "सटाणा (बागलाण)", hi: "सटाना", kn: "ಸಟಾಣ", lat: 20.5900, lon: 74.2000 }
          ]
        },
        {
          id: "solapur",
          name: "Solapur",
          mr: "सोलापूर",
          hi: "सोलापुर",
          kn: "ಸೊಲ್ಲಾಪುರ",
          talukas: [
            { name: "Solapur City", mr: "सोलापूर शहर", hi: "सोलापुर शहर", kn: "ಸೊಲ್ಲಾಪುರ ನಗರ", lat: 17.6599, lon: 75.9064 },
            { name: "Pandharpur", mr: "पंढरपूर", hi: "पंढरपुर", kn: "ಪಂಢರಪುರ", lat: 17.6775, lon: 75.3278 },
            { name: "Barshi", mr: "बार्शी", hi: "बार्शी", kn: "ಬಾರ್ಶಿ", lat: 18.2333, lon: 75.6967 },
            { name: "Malshiras (Akluj)", mr: "माळशिरस (अकलूज)", hi: "मालशिरस", kn: "ಮಾಳಶಿರಸ", lat: 17.8864, lon: 75.0294 },
            { name: "Sangola", mr: "सांगोला", hi: "सांगोला", kn: "ಸಾಂಗೋಲಾ", lat: 17.4333, lon: 75.1967 },
            { name: "Karmala", mr: "करमाळा", hi: "करमाला", kn: "ಕರ್ಮಾಲಾ", lat: 18.4069, lon: 75.1983 }
          ]
        },
        {
          id: "satara",
          name: "Satara",
          mr: "सातारा",
          hi: "सतारा",
          kn: "ಸತಾರಾ",
          talukas: [
            { name: "Satara City", mr: "सातारा शहर", hi: "सतारा शहर", kn: "ಸತಾರಾ ನಗರ", lat: 17.6805, lon: 74.0183 },
            { name: "Karad", mr: "कराड", hi: "कराड", kn: "ಕರಾಡ್", lat: 17.2894, lon: 74.1817 },
            { name: "Phaltan", mr: "फलटण", hi: "फलटन", kn: "ಫಲ್ಟನ್", lat: 17.9864, lon: 74.4339 },
            { name: "Wai", mr: "वाई", hi: "वाई", kn: "ವಾಯಿ", lat: 17.9500, lon: 73.8833 },
            { name: "Khatav (Vaduj)", mr: "खटाव (वडूज)", hi: "खटाव", kn: "ಖಟಾವ್", lat: 17.6000, lon: 74.4500 }
          ]
        },
        {
          id: "ahmednagar",
          name: "Ahmednagar",
          mr: "अहमदनगर (अहिल्यानगर)",
          hi: "अहमदनगर",
          kn: "ಅಹ್ಮದ್‌ನಗರ",
          talukas: [
            { name: "Ahmednagar City", mr: "अहमदनगर शहर", hi: "अहमदनगर शहर", kn: "ಅಹ್ಮದ್‌ನಗರ", lat: 19.0948, lon: 74.7480 },
            { name: "Rahata (Shirdi)", mr: "राहाता (शिर्डी)", hi: "राहाता (शिरडी)", kn: "ಶಿರ್ಡಿ", lat: 19.7083, lon: 74.4783 },
            { name: "Shrirampur", mr: "श्रीरामपूर", hi: "श्रीरामपुर", kn: "ಶ್ರೀರಾಮಪುರ", lat: 19.6194, lon: 74.6583 },
            { name: "Sangamner", mr: "संगमनेर", hi: "संगमनेर", kn: "ಸಂಗಮನೇರ", lat: 19.5761, lon: 74.2094 },
            { name: "Kopargaon", mr: "कोपरगाव", hi: "कोपरगांव", kn: "ಕೋಪರ್‌ಗಾಂವ್", lat: 19.8917, lon: 74.4794 }
          ]
        },
        {
          id: "jalgaon",
          name: "Jalgaon",
          mr: "जळगाव",
          hi: "जलगांव",
          kn: "ಜಲಗಾಂವ್",
          talukas: [
            { name: "Jalgaon City", mr: "जळगाव शहर (केळी पट्टा)", hi: "जलगांव शहर", kn: "ಜಲಗಾಂವ್", lat: 21.0077, lon: 75.5626 },
            { name: "Bhusawal", mr: "भुसावळ", hi: "भुसावल", kn: "ಭುಸಾವಲ್", lat: 21.0458, lon: 75.7892 },
            { name: "Raver", mr: "रावेर", hi: "रावेर", kn: "ರಾವೇರ್", lat: 21.2464, lon: 75.9753 },
            { name: "Chopda", mr: "चोपडा", hi: "चोपड़ा", kn: "ಚೋಪ್ಡಾ", lat: 21.2500, lon: 75.3000 }
          ]
        },
        {
          id: "sambhajinagar",
          name: "Chhatrapati Sambhajinagar",
          mr: "छत्रपती संभाजीनगर",
          hi: "छत्रपति संभाजीनगर",
          kn: "ಸಂಭಾಜಿನಗರ",
          talukas: [
            { name: "Sambhajinagar City", mr: "संभाजीनगर शहर", hi: "संभाजीनगर", kn: "ಸಂಭಾಜಿನಗರ", lat: 19.8762, lon: 75.3433 },
            { name: "Paithan", mr: "पैठण", hi: "पैठन", kn: "ಪೈಠಣ", lat: 19.4833, lon: 75.3833 },
            { name: "Vaijapur", mr: "वैजापूर", hi: "वैजापुर", kn: "ವೈಜಾಪುರ", lat: 19.9250, lon: 74.7297 }
          ]
        },
        {
          id: "amravati",
          name: "Amravati",
          mr: "अमरावती",
          hi: "अमरावती",
          kn: "ಅಮರಾವತಿ",
          talukas: [
            { name: "Amravati City", mr: "अमरावती शहर", hi: "अमरावती शहर", kn: "ಅಮರಾವತಿ", lat: 20.9374, lon: 77.7796 },
            { name: "Achalpur", mr: "अचलपूर", hi: "अचलपुर", kn: "ಅಚಲಪುರ", lat: 21.2583, lon: 77.5083 },
            { name: "Morshi", mr: "मोर्शी", hi: "मोर्शी", kn: "ಮೊರ್ಶಿ", lat: 21.3167, lon: 78.0167 },
            { name: "Warud", mr: "वरुड (संत्रा पट्टा)", hi: "वरुड़", kn: "ವರುಡ್", lat: 21.4667, lon: 78.2667 }
          ]
        },
        {
          id: "nagpur",
          name: "Nagpur",
          mr: "नागपूर",
          hi: "नागपुर",
          kn: "ನಾಗಪುರ",
          talukas: [
            { name: "Nagpur City", mr: "नागपूर शहर", hi: "नागपुर शहर", kn: "ನಾಗಪುರ", lat: 21.1458, lon: 79.0882 },
            { name: "Katol", mr: "काटोल", hi: "काटोल", kn: "ಕಾಟೋಲ್", lat: 21.2667, lon: 78.5833 },
            { name: "Saoner", mr: "सावनेर", hi: "सावनेर", kn: "ಸಾವನೇರ್", lat: 21.3833, lon: 78.9167 },
            { name: "Ramtek", mr: "रामटेक", hi: "रामटेक", kn: "ರಾಮ್ಟೆಕ್", lat: 21.3967, lon: 79.3308 }
          ]
        }
      ]
    },
    {
      id: "KA",
      name: "Karnataka",
      mr: "कर्नाटक",
      hi: "कर्नाटक",
      kn: "ಕರ್ನಾಟಕ",
      districts: [
        {
          id: "belagavi",
          name: "Belagavi",
          mr: "बेळगाव",
          hi: "बेलगावी",
          kn: "ಬೆಳಗಾವಿ",
          talukas: [
            { name: "Belagavi City", mr: "बेळगाव शहर", hi: "बेलगावी", kn: "ಬೆಳಗಾವಿ ನಗರ", lat: 15.8497, lon: 74.4977 },
            { name: "Chikkodi", mr: "चिकोडी", hi: "चिक्कोडी", kn: "ಚಿಕ್ಕೋಡಿ", lat: 16.4286, lon: 74.5967 },
            { name: "Athani", mr: "अथणी", hi: "अथनी", kn: "ಅಥಣಿ", lat: 16.7333, lon: 75.0667 },
            { name: "Gokak", mr: "गोकाक", hi: "गोकाक", kn: "ಗೋಕಾಕ್", lat: 16.1667, lon: 74.8333 },
            { name: "Raybag", mr: "रायबाग", hi: "रायबाग", kn: "ರಾಯಭಾಗ", lat: 16.4833, lon: 74.7833 }
          ]
        },
        {
          id: "vijayapura",
          name: "Vijayapura",
          mr: "विजापूर",
          hi: "विजयपुरा",
          kn: "ವಿಜಯಪುರ (ಬಿಜಾಪುರ)",
          talukas: [
            { name: "Vijayapura City", mr: "विजापूर शहर", hi: "विजयपुरा", kn: "ವಿಜಯಪುರ ನಗರ", lat: 16.8302, lon: 75.7100 },
            { name: "Indi", mr: "इंडी", hi: "इंडी", kn: "ಇಂಡಿ", lat: 17.1833, lon: 75.9667 },
            { name: "Basavana Bagewadi", mr: "बसवन बागेवाडी", hi: "बागेवाड़ी", kn: "ಬಸವನ ಬಾಗೇವಾಡಿ", lat: 16.5833, lon: 75.9667 }
          ]
        },
        {
          id: "bagalkot",
          name: "Bagalkot",
          mr: "बागलकोट",
          hi: "बागलकोट",
          kn: "ಬಾಗಲಕೋಟೆ",
          talukas: [
            { name: "Bagalkot City", mr: "बागलकोट शहर", hi: "बागलकोट", kn: "ಬಾಗಲಕೋಟೆ ನಗರ", lat: 16.1817, lon: 75.6958 },
            { name: "Jamkhandi", mr: "जमखंडी", hi: "जमखंडी", kn: "ಜಮಖಂಡಿ", lat: 16.5167, lon: 75.3000 },
            { name: "Mudhol", mr: "मुधोळ", hi: "मुधोल", kn: "ಮುಧೋಳ", lat: 16.3500, lon: 75.2833 }
          ]
        },
        {
          id: "bengaluru",
          name: "Bengaluru",
          mr: "बंगळुरू",
          hi: "बेंगलुरु",
          kn: "ಬೆಂಗಳೂರು",
          talukas: [
            { name: "Bengaluru Urban", mr: "बंगळुरू शहर", hi: "बेंगलुरु", kn: "ಬೆಂಗಳೂರು ನಗರ", lat: 12.9716, lon: 77.5946 },
            { name: "Devanahalli", mr: "देवनहल्ली", hi: "देवनहल्ली", kn: "ದೇವನಹಳ್ಳಿ", lat: 13.2483, lon: 77.7125 },
            { name: "Hoskote", mr: "होसकोटे", hi: "होसकोटे", kn: "ಹೊಸಕೋಟೆ", lat: 13.0697, lon: 77.7981 }
          ]
        },
        {
          id: "dharwad",
          name: "Dharwad",
          mr: "धारवाड",
          hi: "धारवाड़",
          kn: "ಧಾರವಾಡ",
          talukas: [
            { name: "Dharwad City", mr: "धारवाड शहर", hi: "धारवाड़", kn: "ಧಾರವಾಡ ನಗರ", lat: 15.4589, lon: 75.0078 },
            { name: "Hubballi", mr: "हुबळी", hi: "हुबली", kn: "ಹುಬ್ಬಳ್ಳಿ", lat: 15.3647, lon: 75.1240 },
            { name: "Navalgund", mr: "नवलगुंड", hi: "नवलगुंड", kn: "ನವಲಗುಂದ", lat: 15.5667, lon: 75.3667 }
          ]
        }
      ]
    },
    {
      id: "GJ",
      name: "Gujarat",
      mr: "गुजरात",
      hi: "गुजरात",
      kn: "ಗುಜರಾತ್",
      districts: [
        {
          id: "ahmedabad",
          name: "Ahmedabad",
          mr: "अहमदाबाद",
          hi: "अहमदाबाद",
          kn: "ಅಹಮದಾಬಾದ್",
          talukas: [
            { name: "Ahmedabad City", mr: "अहमदाबाद", hi: "अहमदाबाद", kn: "ಅಹಮದಾಬಾದ್", lat: 23.0225, lon: 72.5714 },
            { name: "Sanand", mr: "साणंद", hi: "सानंद", kn: "ಸಾನಂದ್", lat: 22.9917, lon: 72.3833 },
            { name: "Dholka", mr: "धोलका", hi: "धोलका", kn: "ಧೋಲ್ಕಾ", lat: 22.7167, lon: 72.4667 }
          ]
        },
        {
          id: "rajkot",
          name: "Rajkot",
          mr: "राजकोट",
          hi: "राजकोट",
          kn: "ರಾಜ್‌ಕೋಟ್",
          talukas: [
            { name: "Rajkot City", mr: "राजकोट शहर", hi: "राजकोट", kn: "ರಾಜ್‌ಕೋಟ್", lat: 22.3039, lon: 70.8022 },
            { name: "Gondal", mr: "गोंडल", hi: "गोंडल", kn: "ಗೊಂದಲ್", lat: 21.9617, lon: 70.7983 },
            { name: "Jetpur", mr: "जेतपूर", hi: "जेतपुर", kn: "ಜೆಟ್‌ಪುರ್", lat: 21.7583, lon: 70.6250 }
          ]
        },
        {
          id: "surat",
          name: "Surat",
          mr: "सुरत",
          hi: "सूरत",
          kn: "ಸೂರತ್",
          talukas: [
            { name: "Surat City", mr: "सुरत शहर", hi: "सूरत", kn: "ಸೂರತ್", lat: 21.1702, lon: 72.8311 },
            { name: "Bardoli", mr: "बारडोली", hi: "बारडोली", kn: "ಬಾರ್ಡೋಲಿ", lat: 21.1167, lon: 73.1167 }
          ]
        }
      ]
    },
    {
      id: "MP",
      name: "Madhya Pradesh",
      mr: "मध्य प्रदेश",
      hi: "मध्य प्रदेश",
      kn: "ಮಧ್ಯಪ್ರದೇಶ",
      districts: [
        {
          id: "indore",
          name: "Indore",
          mr: "इंदूर",
          hi: "इंदौर (सोयाबीन पट्टा)",
          kn: "ಇಂದೋರ್",
          talukas: [
            { name: "Indore City", mr: "इंदूर शहर", hi: "इंदौर शहर", kn: "ಇಂದೋರ್", lat: 22.7196, lon: 75.8577 },
            { name: "Depalpur", mr: "देपालपूर", hi: "देपालपुर", kn: "ದೇಪಾಲಪುರ", lat: 22.8500, lon: 75.5500 },
            { name: "Sanwer", mr: "सांवेर", hi: "सांवेर", kn: "ಸಾನ್ವೇರ್", lat: 22.9833, lon: 75.8333 }
          ]
        },
        {
          id: "ujjain",
          name: "Ujjain",
          mr: "उज्जैन",
          hi: "उज्जैन",
          kn: "ಉಜ್ಜೈನ್",
          talukas: [
            { name: "Ujjain City", mr: "उज्जैन शहर", hi: "उज्जैन", kn: "ಉಜ್ಜೈನ್", lat: 23.1765, lon: 75.7885 },
            { name: "Nagda", mr: "नागदा", hi: "नागदा", kn: "ನಾಗ್ಡಾ", lat: 23.4500, lon: 75.4167 }
          ]
        }
      ]
    },
    {
      id: "PB",
      name: "Punjab",
      mr: "पंजाब",
      hi: "पंजाब",
      kn: "ಪಂಜಾಬ್",
      districts: [
        {
          id: "ludhiana",
          name: "Ludhiana",
          mr: "लुधियाना",
          hi: "लुधियाना (गेहूं पट्टा)",
          kn: "ಲುಧಿಯಾನ",
          talukas: [
            { name: "Ludhiana City", mr: "लुधियाना", hi: "लुधियाना", kn: "ಲುಧಿಯಾನ", lat: 30.9010, lon: 75.8573 },
            { name: "Jagraon", mr: "जगरांव", hi: "जगराओं", kn: "ಜಗ್ರಾವೋನ್", lat: 30.7833, lon: 75.4833 },
            { name: "Khanna", mr: "खन्ना", hi: "खन्ना", kn: "ಖನ್ನಾ", lat: 30.7067, lon: 76.2167 }
          ]
        },
        {
          id: "amritsar",
          name: "Amritsar",
          mr: "अमृतसर",
          hi: "अमृतसर",
          kn: "ಅಮೃತಸರ",
          talukas: [
            { name: "Amritsar City", mr: "अमृतसर शहर", hi: "अमृतसर", kn: "ಅಮೃತಸರ", lat: 31.6340, lon: 74.8723 },
            { name: "Ajnala", mr: "अजनाला", hi: "अजनाला", kn: "ಅಜ್ನಾಲಾ", lat: 31.8333, lon: 74.7667 }
          ]
        }
      ]
    },
    {
      id: "HP",
      name: "Himachal Pradesh",
      mr: "हिमाचल प्रदेश",
      hi: "हिमाचल प्रदेश",
      kn: "ಹಿಮಾಚಲ ಪ್ರದೇಶ",
      districts: [
        {
          id: "shimla",
          name: "Shimla",
          mr: "शिमला",
          hi: "शिमला (सेब पट्टा)",
          kn: "ಶಿಮ್ಲಾ",
          talukas: [
            { name: "Shimla City", mr: "शिमला", hi: "शिमला", kn: "ಶಿಮ್ಲಾ", lat: 31.1048, lon: 77.1734 },
            { name: "Rohru", mr: "रोहरु (सफरचंद पट्टा)", hi: "रोहड़ू (सेब)", kn: "ರೋಹ್ರು", lat: 31.2033, lon: 77.7523 },
            { name: "Theog", mr: "थियोग", hi: "थियोग", kn: "ಥಿಯೋಗ್", lat: 31.1167, lon: 77.3500 },
            { name: "Rampur", mr: "रामपूर", hi: "रामपुर", kn: "ರಾಮ್ಪುರ", lat: 31.4500, lon: 77.6333 }
          ]
        },
        {
          id: "kullu",
          name: "Kullu",
          mr: "कुलू",
          hi: "कुल्लू",
          kn: "ಕುಲ್ಲು",
          talukas: [
            { name: "Kullu City", mr: "कुलू शहर", hi: "कुल्लू", kn: "ಕುಲ್ಲು", lat: 31.9579, lon: 77.1095 },
            { name: "Manali", mr: "मनाली", hi: "मनाली", kn: "ಮನಾಲಿ", lat: 32.2396, lon: 77.1887 }
          ]
        }
      ]
    },
    {
      id: "TN",
      name: "Tamil Nadu",
      mr: "तमिळनाडू",
      hi: "तमिलनाडु",
      kn: "ತಮಿಳುನಾಡು",
      districts: [
        {
          id: "coimbatore",
          name: "Coimbatore",
          mr: "कोइम्बतूर",
          hi: "कोयंबटूर",
          kn: "ಕೊಯಮತ್ತೂರು",
          talukas: [
            { name: "Coimbatore City", mr: "कोइम्बतूर", hi: "कोयंबटूर", kn: "ಕೊಯಮತ್ತೂರು", lat: 11.0168, lon: 76.9558 },
            { name: "Pollachi", mr: "पोल्लाची", hi: "पोलाची", kn: "ಪೊಲ್ಲಾಚಿ", lat: 10.6608, lon: 77.0047 }
          ]
        },
        {
          id: "thanjavur",
          name: "Thanjavur",
          mr: "तंजावर",
          hi: "तंजावुर (धान का कटोरा)",
          kn: "ತಂಜಾವೂರು",
          talukas: [
            { name: "Thanjavur City", mr: "तंजावर", hi: "तंजावुर", kn: "ತಂಜಾವೂರು", lat: 10.7870, lon: 79.1378 },
            { name: "Kumbakonam", mr: "कुंभकोणम", hi: "कुंभकोणम", kn: "ಕುಂಭಕೋಣಂ", lat: 10.9602, lon: 79.3845 }
          ]
        }
      ]
    }
  ]
};

/**
 * Returns default location: Ichalkaranji, Kolhapur, Maharashtra
 */
export const DEFAULT_LOCATION = {
  country: "India",
  state: "Maharashtra",
  stateCode: "MH",
  district: "Kolhapur",
  taluka: "Ichalkaranji",
  lat: 16.6967,
  lon: 74.4608,
  displayName: "Ichalkaranji, Kolhapur"
};
