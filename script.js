document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const cityInput = document.getElementById("cityInput");
    const searchBtn = document.getElementById("searchBtn");
    const voiceBtn = document.getElementById("voiceBtn");
    const locationBtn = document.getElementById("locationBtn");
    const unitToggle = document.getElementById("unitToggle");
    const langToggle = document.getElementById("langToggle");
    const autocompleteDropdown = document.getElementById("autocompleteDropdown");
    
    const loading = document.getElementById("loading");
    const weatherContent = document.getElementById("weatherContent");
    const errorMsg = document.getElementById("errorMsg");
    const animateItems = document.querySelectorAll(".animate-item");
    
    // UI Elements
    const cityNameEl = document.getElementById("cityName");
    const currentDateEl = document.getElementById("currentDate");
    const currentIconEl = document.getElementById("currentIcon");
    const currentTempEl = document.getElementById("currentTemp");
    const tempUnitEl = document.getElementById("tempUnit");
    const weatherDescEl = document.getElementById("weatherDesc");
    const humidityValueEl = document.getElementById("humidityValue");
    const windValueEl = document.getElementById("windValue");
    const aqiValueEl = document.getElementById("aqiValue");
    const aqiIconEl = document.getElementById("aqiIcon");
    const feelsLikeValueEl = document.getElementById("feelsLikeValue");
    const uvIndexValueEl = document.getElementById("uvIndexValue");
    const sunriseValueEl = document.getElementById("sunriseValue");
    
    const suggestionTextEl = document.getElementById("suggestionText");
    const suggestionIconEl = document.getElementById("suggestionIcon");
    const healthTextEl = document.getElementById("healthText");
    const forecastCardsEl = document.getElementById("forecastCards");
    const ctx = document.getElementById("weatherChart").getContext("2d");
    
    // State
    let isCelsius = true;
    let currentLang = "en";
    let weatherChartInstance = null;
    let currentData = null; 
    let currentCity = "Unknown";
    let debounceTimer;

    // Translation Dictionaries
    const translations = {
        en: {
            appTitle: "SmartWeather", humidity: "Humidity", wind: "Wind", aqi: "AQI",
            feelsLike: "Feels Like", uvIndex: "UV Index", sunrise: "Daylight",
            suggestionsTitle: "Smart Suggestions", healthTitle: "Health & Wellness", forecastTitle: "5-Day Forecast", chartTitle: "Temperature Trend",
            helpTitle: "Need Help?", helpText: "Allow location access or use the autocomplete search. For support, contact",
            copyright: "© 2026 SmartWeather App. All rights reserved.", placeholder: "Enter city name...",
            searchError: "City not found. Please try again.", locationError: "Failed to fetch location data.",
            weatherError: "Failed to fetch weather data.", geoErrorSupported: "Geolocation is not supported by your browser",
            geoErrorPerm: "Unable to retrieve your location. Please check your permissions.", listening: "Listening..."
        },
        hi: {
            appTitle: "स्मार्ट मौसम", humidity: "नमी (Humidity)", wind: "हवा (Wind)", aqi: "वायु गुणवत्ता",
            feelsLike: "महसूस होता है", uvIndex: "यूवी इंडेक्स", sunrise: "दिन का प्रकाश",
            suggestionsTitle: "स्मार्ट सुझाव", healthTitle: "स्वास्थ्य और कल्याण", forecastTitle: "5-दिन का पूर्वानुमान", chartTitle: "तापमान का रुझान",
            helpTitle: "मदद चाहिए?", helpText: "स्थान (Location) पहुंच दें या खोजें। संपर्क:",
            copyright: "© 2026 SmartWeather App. सर्वाधिकार सुरक्षित।", placeholder: "शहर का नाम दर्ज करें...",
            searchError: "शहर नहीं मिला। पुनः प्रयास करें।", locationError: "स्थान प्राप्त करने में विफल।",
            weatherError: "मौसम का डेटा प्राप्त करने में विफल।", geoErrorSupported: "जियोलोकेशन समर्थित नहीं है",
            geoErrorPerm: "स्थान प्राप्त करने में असमर्थ। अनुमतियों की जांच करें।", listening: "सुन रहा हूँ..."
        },
        mr: {
            appTitle: "स्मार्ट हवामान", humidity: "आर्द्रता (Humidity)", wind: "वारा (Wind)", aqi: "हवेचा दर्जा",
            feelsLike: "असे वाटते", uvIndex: "अतिनील निर्देशांक", sunrise: "दिवसाचा प्रकाश",
            suggestionsTitle: "स्मार्ट सूचना", healthTitle: "आरोग्य आणि निरोगीपणा", forecastTitle: "५-दिवसांचा अंदाज", chartTitle: "तापमान कल",
            helpTitle: "मदत हवी आहे?", helpText: "स्थान प्रवेश द्या किंवा शोध वापरा. संपर्क:",
            copyright: "© 2026 SmartWeather App. सर्व हक्क राखीव.", placeholder: "शहराचे नाव प्रविष्ट करा...",
            searchError: "शहर सापडले नाही. कृपया पुन्हा प्रयत्न करा.", locationError: "स्थान डेटा मिळवण्यात अयशस्वी.",
            weatherError: "हवामान डेटा मिळवण्यात अयशस्वी.", geoErrorSupported: "जिओलोकेशन समर्थित नाही",
            geoErrorPerm: "स्थान मिळवण्यात अक्षम. परवानग्या तपासा.", listening: "ऐकत आहे..."
        }
    };

    const weatherDescriptions = {
        0: { en: "Clear sky", hi: "साफ आसमान", mr: "निरभ्र आकाश" },
        1: { en: "Mainly clear", hi: "मुख्यतः साफ", mr: "मुख्यतः निरभ्र" },
        2: { en: "Partly cloudy", hi: "आंशिक रूप से बादल छाए रहेंगे", mr: "अंशतः ढगाळ" },
        3: { en: "Overcast", hi: "बादल छाए रहेंगे", mr: "ढगाळ" },
        45: { en: "Fog", hi: "कोहरा", mr: "धुके" },
        48: { en: "Depositing rime fog", hi: "घना कोहरा", mr: "दाट धुके" },
        51: { en: "Light drizzle", hi: "हल्की बूंदाबांदी", mr: "हलकी रिमझिम" },
        53: { en: "Moderate drizzle", hi: "मध्यम बूंदाबांदी", mr: "मध्यम रिमझिम" },
        55: { en: "Dense drizzle", hi: "घनी बूंदाबांदी", mr: "दाट रिमझिम" },
        56: { en: "Light freezing", hi: "हल्की ठंड", mr: "थंड रिमझिम" },
        57: { en: "Dense freezing", hi: "घनी ठंड", mr: "थंड आणि दाट धुके" },
        61: { en: "Slight rain", hi: "हल्की बारिश", mr: "हलका पाऊस" },
        63: { en: "Moderate rain", hi: "मध्यम बारिश", mr: "मध्यम पाऊस" },
        65: { en: "Heavy rain", hi: "भारी बारिश", mr: "मुसळधार पाऊस" },
        66: { en: "Light chill rain", hi: "हल्की ठंडी बारिश", mr: "हलका थंड पाऊस" },
        67: { en: "Heavy chill rain", hi: "भारी ठंडी बारिश", mr: "मुसळधार थंड पाऊस" },
        71: { en: "Slight snow", hi: "हल्की बर्फबारी", mr: "हलकी बर्फवृष्टी" },
        73: { en: "Moderate snow", hi: "मध्यम बर्फबारी", mr: "मध्यम बर्फवृष्टी" },
        75: { en: "Heavy snow", hi: "भारी बर्फबारी", mr: "मुसळधार बर्फवृष्टी" },
        77: { en: "Snow grains", hi: "बर्फ के दाने", mr: "बर्फाचे कण" },
        80: { en: "Slight showers", hi: "हल्की बौछारें", mr: "हलक्या पावसाच्या सरी" },
        81: { en: "Moderate showers", hi: "मध्यम बौछारें", mr: "मध्यम पावसाच्या सरी" },
        82: { en: "Violent showers", hi: "तेज बौछारें", mr: "पावसाच्या जोरदार सरी" },
        85: { en: "Slight snow showers", hi: "हल्की बर्फ की बौछारें", mr: "बर्फाच्या हलक्या सरी" },
        86: { en: "Heavy snow showers", hi: "भारी बर्फ की बौछारें", mr: "बर्फाच्या जोरदार सरी" },
        95: { en: "Thunderstorm", hi: "आंधी तूफान", mr: "वादळ" },
        96: { en: "Thunderstorm, hail", hi: "आंधी, ओले", mr: "वादळ आणि गारा" },
        99: { en: "Extreme storm", hi: "भीषण तूफान", mr: "भीषण वादळ" }
    };

    const suggestionTexts = {
        thunder: { en: "Thunderstorms in the area! Stay indoors and keep away from windows.", es: "¡Tormentas en la zona! Mantente adentro y lejos de las ventanas.", fr: "Orages dans la région ! Restez à l'intérieur et loin des fenêtres.", hi: "क्षेत्र में आंधी तूफान! घर के अंदर रहें और खिड़कियों से दूर रहें।" },
        wind: { en: "It's very windy out there! Secure loose objects and be careful if driving.", hi: "बाहर बहुत तेज हवा है! ढीली वस्तुओं को सुरक्षित करें और गाड़ी चलाते समय सावधान रहें।", mr: "बाहेर खूप वारे वाहत आहे! सुरक्षित ठिकाणी राहा आणि गाडी चालवताना काळजी घ्या." },
        snow: { en: "Snow is falling. Bundle up warmly and drive slowly on slippery roads!", hi: "बर्फ गिर रही है। गर्म कपड़े पहनें और फिसलन भरी सड़कों पर धीरे ड्राइव करें!", mr: "बर्फ पडत आहे. उबदार कपडे घाला आणि निसरड्या रस्त्यांवर हळू चालवा!" },
        rain: { en: "It's raining outside. Don't forget your umbrella and a good raincoat!", hi: "बाहर बारिश हो रही है। अपना छाता और एक अच्छा रेनकोट न भूलें!", mr: "बाहेर पाऊस पडत आहे. आपली छत्री आणि चांगला रेनकोट विसरू नका!" },
        fog: { en: "Fog visibility is low. Drive with your headlights on and maintain a safe distance.", hi: "कोहरे के कारण दृश्यता कम है। हेडलाइट्स चालू करके ड्राइव करें और सुरक्षित दूरी बनाए रखें।", mr: "धुक्यामुळे दृश्यमानता कमी आहे. हेडलाइट्स चालू करून गाडी चालवा आणि सुरक्षित अंतर ठेवा." },
        hotHumid: { en: "It's hot and extremely muggy! Stay properly hydrated, wear light clothing, and stay in the shade.", hi: "यह बहुत गर्म और उमस भरा है! हाइड्रेटेड रहें, हल्के कपड़े पहनें, और छाया में रहें।", mr: "खूप गरम आणि दमट वातावरण आहे! भरपूर पाणी प्या, हलके कपडे घाला आणि सावलीत राहा." },
        hot: { en: "It's a hot day! Don't forget sunscreen, sunglasses, and a reusable water bottle.", hi: "आज बहुत गर्मी है! सनस्क्रीन, धूप का चश्मा और पानी की बोतल न भूलें।", mr: "आज खूप गरम दिवस आहे! सनस्क्रीन, गॉगल आणि पाण्याची बाटली विसरू नका." },
        freezing: { en: "Freezing temperatures! Wear thermals, a heavy coat, gloves, and a warm beanie.", hi: "जमा देने वाला तापमान! भारी कोट, दस्ताने और एक गर्म टोपी पहनें।", mr: "गोठवणारे तापमान! उबदार कपडे, जाड कोट, हातमोजे आणि गरम टोपी घाला." },
        chilly: { en: "It's a bit chilly today. A light jacket or warm sweater would be perfect for going out.", hi: "आज थोड़ी ठंड है। बाहर जाने के लिए एक हल्का जैकेट या गर्म स्वेटर एकदम सही होगा।", mr: "आज थोडी थंडी आहे. बाहेर जाण्यासाठी हलके जॅकेट किंवा स्वेटर उत्तम राहील." },
        dry: { en: "The air is quite dry today. Remember to drink water and use some skin moisturizer.", hi: "आज हवा काफी शुष्क है। पानी पीना और स्किन मॉइस्चराइज़र का उपयोग करना याद रखें।", mr: "आज हवा बरीच कोरडी आहे. पाणी पिण्याचे लक्षात ठेवा आणि मॉइश्चरायझर वापरा." },
        perfect: { en: "The skies are clear and the weather is beautiful! A perfect day for outdoor activities.", hi: "आसमान साफ ​​है और मौसम सुंदर है! बाहरी गतिविधियों के लिए एक आदर्श दिन।", mr: "निरभ्र आकाश आणि सुंदर हवामान! बाहेर जाण्यासाठी एक योग्य दिवस." },
        mild: { en: "Expect mild or cloudy skies. It's a very comfortable day to go about your plans!", hi: "हल्के या बादल छाए रहने की उम्मीद है। यह आपकी योजनाओं के लिए एक बहुत ही आरामदायक दिन है!", mr: "हलके किंवा ढगाळ आकाश अपेक्षित आहे. तुमच्या योजनांसाठी आजचा दिवस खूप आरामदायक असेल!" }
    };

    const healthTexts = {
        poorAqi: { en: "Air quality is poor. Limit outdoor exertion and wear an N95 mask if you have respiratory issues.", hi: "वायु गुणवत्ता खराब है। बाहर का व्यायाम कम करें और अगर आपको सांस की समस्या है तो मास्क पहनें।", mr: "हवेची गुणवत्ता खराब आहे. बाहेरचे व्यायाम कमी करा आणि श्वासोच्छवासाचा त्रास असल्यास मास्क घाला." },
        heatStroke: { en: "Extreme heat warning. Risk of heatstroke. Drink plenty of water and stay in air-conditioned environments.", hi: "भीषण गर्मी की चेतावनी। लू लगने का खतरा। खूब पानी पिएं और ठंडे वातावरण में रहें।", mr: "उष्णतेची लाट. उष्माघाताचा धोका. भरपूर पाणी प्या आणि थंड वातावरणात राहा." },
        coldFlu: { en: "Freezing conditions. Protect extremities to prevent frostbite. Keep your home adequately heated.", hi: "जमा देने वाली ठंड। फ्रॉस्टबाइट से बचने के लिए शरीर को ढक कर रखें। घर को गर्म रखें।", mr: "गोठवणारी थंडी. फ्रॉस्टबाइट टाळण्यासाठी शरीर झाकून ठेवा. घर उबदार ठेवा." },
        highUV: { en: "High UV index likely. Apply SPF 30+ sunscreen and wear sunglasses to protect your skin and eyes.", hi: "उच्च यूवी इंडेक्स की संभावना। सनस्क्रीन लगाएं और आंखों की सुरक्षा के लिए धूप का चश्मा पहनें।", mr: "उच्च अतिनील किरणांची शक्यता. त्वचेच्या संरक्षणासाठी सनस्क्रीन लावा आणि रंगीत गॉगल घाला." },
        goodHealth: { en: "Weather conditions are generally favorable for your health. A great time for a light walk or exercise!", hi: "मौसम आपके स्वास्थ्य के लिए अनुकूल है। हल्की सैर या व्यायाम के लिए यह एक अच्छा समय है!", mr: "हवामान तुमच्या आरोग्यासाठी अनुकूल आहे. हलका फेरफटका किंवा व्यायामासाठी ही चांगली वेळ आहे!" }
    };

    // WMO Weather Base Map
    const weatherBaseMap = {
        0: { icon: "fa-sun", bg: "bg-sunny" }, 1: { icon: "fa-cloud-sun", bg: "bg-sunny" }, 2: { icon: "fa-cloud-sun", bg: "bg-cloudy" },
        3: { icon: "fa-cloud", bg: "bg-cloudy" }, 45: { icon: "fa-smog", bg: "bg-cloudy" }, 48: { icon: "fa-smog", bg: "bg-cloudy" },
        51: { icon: "fa-cloud-rain", bg: "bg-rainy" }, 53: { icon: "fa-cloud-rain", bg: "bg-rainy" }, 55: { icon: "fa-cloud-showers-heavy", bg: "bg-rainy" },
        56: { icon: "fa-cloud-rain", bg: "bg-rainy" }, 57: { icon: "fa-cloud-rain", bg: "bg-rainy" },
        61: { icon: "fa-cloud-rain", bg: "bg-rainy" }, 63: { icon: "fa-cloud-showers-heavy", bg: "bg-rainy" }, 65: { icon: "fa-cloud-showers-heavy", bg: "bg-rainy" },
        66: { icon: "fa-cloud-rain", bg: "bg-rainy" }, 67: { icon: "fa-cloud-showers-heavy", bg: "bg-rainy" },
        71: { icon: "fa-snowflake", bg: "bg-snowy" }, 73: { icon: "fa-snowflake", bg: "bg-snowy" }, 75: { icon: "fa-snowflake", bg: "bg-snowy" },
        77: { icon: "fa-snowflake", bg: "bg-snowy" }, 80: { icon: "fa-cloud-rain", bg: "bg-rainy" }, 81: { icon: "fa-cloud-showers-heavy", bg: "bg-rainy" },
        82: { icon: "fa-cloud-showers-heavy", bg: "bg-rainy" }, 85: { icon: "fa-snowflake", bg: "bg-snowy" }, 86: { icon: "fa-snowflake", bg: "bg-snowy" },
        95: { icon: "fa-cloud-bolt", bg: "bg-rainy" }, 96: { icon: "fa-cloud-bolt", bg: "bg-rainy" }, 99: { icon: "fa-cloud-bolt", bg: "bg-rainy" }
    };

    // Helpers
    const toFahrenheit = (celsius) => (celsius * 9/5) + 32;
    const t = (key) => translations[currentLang][key] || translations['en'][key];
    const mapCodeToDesc = (code) => weatherDescriptions[code] ? weatherDescriptions[code][currentLang] : "Unknown";

    const updateStaticText = () => {
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const tk = el.getAttribute("data-i18n");
            if(translations[currentLang] && translations[currentLang][tk]) {
                el.innerText = translations[currentLang][tk];
            }
        });
        cityInput.placeholder = t("placeholder");
        if(document.getElementById("suggestionIcon")) { 
            // the icon HTML got wiped out when setting innerText on suggestionTitle, so wait we must use safe span swapping in HTML
        }
    };

    // Init App
    const init = () => {
        const storedLang = localStorage.getItem("appLang");
        if (storedLang) { currentLang = storedLang; langToggle.value = currentLang; }
        updateStaticText();
        
        const lastCity = localStorage.getItem("lastSearchedCity");
        if (lastCity) fetchCityCoordinates(lastCity);
        else fetchCityCoordinates("New York");
    };

    // Show/Hide Loading Overlay
    const showLoading = () => {
        loading.classList.add("active");
        weatherContent.style.display = "none";
        errorMsg.style.display = "none";
    };

    const hideLoading = () => {
        loading.classList.remove("active");
        weatherContent.style.display = "flex";
        triggerAnimations();
    };

    const showError = (msgKey) => {
        loading.classList.remove("active");
        weatherContent.style.display = "none";
        errorMsg.textContent = t(msgKey);
        errorMsg.style.display = "block";
    };

    const triggerAnimations = () => {
        animateItems.forEach(item => {
            item.classList.remove("animate-in");
            void item.offsetWidth;
            item.classList.add("animate-in");
        });
    };

    const updateBackground = (bgClass) => {
        document.body.className = bgClass || "bg-sunny";
        if (weatherChartInstance) {
            Chart.defaults.color = (bgClass === "bg-rainy" || bgClass === "bg-cloudy") ? "#ffffff" : "#666666";
            weatherChartInstance.update();
        }
    };

    // Live Search
    const fetchAutoComplete = async (query) => {
        if (!query) { autocompleteDropdown.classList.remove("active"); return; }
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`);
            const data = await res.json();
            autocompleteDropdown.innerHTML = "";
            if (data.results && data.results.length > 0) {
                data.results.forEach(loc => {
                    const div = document.createElement("div");
                    div.className = "autocomplete-item";
                    const locName = `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}, ${loc.country}`;
                    div.innerHTML = `<i class="fa-solid fa-location-dot"></i><span>${locName}</span>`;
                    div.addEventListener("click", () => {
                        cityInput.value = locName;
                        autocompleteDropdown.classList.remove("active");
                        fetchCityCoordinates(locName, loc.latitude, loc.longitude);
                    });
                    autocompleteDropdown.appendChild(div);
                });
                autocompleteDropdown.classList.add("active");
            } else autocompleteDropdown.classList.remove("active");
        } catch(e) {}
    };

    // API Calls
    const fetchCityCoordinates = async (city, knownLat = null, knownLon = null) => {
        autocompleteDropdown.classList.remove("active");
        showLoading();
        if (knownLat !== null && knownLon !== null) {
            currentCity = city;
            localStorage.setItem("lastSearchedCity", city);
            fetchWeatherData(knownLat, knownLon);
            return;
        }
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.split(",")[0])}&count=1`);
            const data = await res.json();
            if (!data.results || data.results.length === 0) return showError("searchError");
            
            const location = data.results[0];
            currentCity = `${location.name}${location.admin1 ? ', ' + location.admin1 : ''}`;
            localStorage.setItem("lastSearchedCity", location.name);
            fetchWeatherData(location.latitude, location.longitude);
        } catch (error) { showError("locationError"); }
    };

    const fetchWeatherData = async (lat, lon) => {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
            const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;
            const [res, aqiRes] = await Promise.all([fetch(url), fetch(aqiUrl).catch(()=>null)]);
            const data = await res.json();
            
            let aqiData = null;
            if(aqiRes && aqiRes.ok) aqiData = await aqiRes.json();
            data.current.us_aqi = (aqiData && aqiData.current) ? aqiData.current.us_aqi : null;
            
            currentData = data;
            updateUI();
            setTimeout(() => hideLoading(), 300);
        } catch (error) { showError("weatherError"); }
    };

    const getGeolocation = () => {
        if (!navigator.geolocation) return showError("geoErrorSupported");
        showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                currentCity = "Current Location";
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await res.json();
                    if(data.address && (data.address.city || data.address.town)) {
                        currentCity = data.address.city || data.address.town;
                        localStorage.setItem("lastSearchedCity", currentCity);
                    }
                } catch(e) {}
                fetchWeatherData(lat, lon);
            }, () => showError("geoErrorPerm")
        );
    };

    // Update UI 
    const updateUI = () => {
        if (!currentData) return;
        updateStaticText();
        
        const { current, daily } = currentData;
        const code = current.weather_code;
        const baseMap = weatherBaseMap[code] || { icon: "fa-cloud", bg: "bg-cloudy" };

        updateBackground(baseMap.bg);

        cityNameEl.textContent = currentCity;
        
        const now = new Date();
        const dateStr = now.toLocaleDateString(currentLang, { weekday: 'short', day: 'numeric', month: 'short' });
        const timeStr = now.toLocaleTimeString(currentLang, { hour: 'numeric', minute: '2-digit', hour12: true });
        currentDateEl.textContent = `${dateStr} • ${timeStr}`;
        
        currentIconEl.className = `fa-solid ${baseMap.icon} weather-icon`;
        
        let displayTemp = isCelsius ? current.temperature_2m : toFahrenheit(current.temperature_2m);
        currentTempEl.textContent = Math.round(displayTemp);
        tempUnitEl.textContent = isCelsius ? "°C" : "°F";
        
        weatherDescEl.textContent = mapCodeToDesc(code);
        humidityValueEl.textContent = `${current.relative_humidity_2m}%`;
        windValueEl.textContent = `${current.wind_speed_10m} km/h`;
        
        let displayFeelsLike = isCelsius ? current.apparent_temperature : toFahrenheit(current.apparent_temperature);
        if (feelsLikeValueEl) feelsLikeValueEl.textContent = `${Math.round(displayFeelsLike)}°`;
        if (uvIndexValueEl) uvIndexValueEl.textContent = current.uv_index !== undefined ? current.uv_index.toFixed(1) : "--";
        
        if (sunriseValueEl && daily && daily.sunrise && daily.sunrise.length > 0) {
            const sunriseTime = new Date(daily.sunrise[0]).toLocaleTimeString(currentLang, { hour: 'numeric', minute: '2-digit', hour12: true });
            const sunsetTime = new Date(daily.sunset[0]).toLocaleTimeString(currentLang, { hour: 'numeric', minute: '2-digit', hour12: true });
            sunriseValueEl.textContent = `${sunriseTime} - ${sunsetTime}`;
        }

        const aqi = current.us_aqi;
        if (aqi !== null && aqi !== undefined) {
            let aqiText = "";
            let color = "";
            if (aqi <= 50) { color="#28a745"; aqiText="Good"; }
            else if (aqi <= 100) { color="#ffc107"; aqiText="Mod"; }
            else if (aqi <= 150) { color="#fd7e14"; aqiText="Sens"; }
            else if (aqi <= 200) { color="#dc3545"; aqiText="Poor"; }
            else if (aqi <= 300) { color="#6f42c1"; aqiText="V.Poor"; }
            else { color="#721c24"; aqiText="Hazard"; }
            
            aqiIconEl.style.color = color;
            aqiValueEl.innerHTML = `${aqi} <span style="font-size:0.8rem;opacity:0.8">(${aqiText})</span>`;
        } else {
            aqiValueEl.textContent = "N/A";
            aqiIconEl.style.color = "#aaaaaa";
        }

        updateSmartSuggestion(code, current.temperature_2m, current.wind_speed_10m, current.relative_humidity_2m);
        updateHealthSuggestion(code, current.temperature_2m, current.us_aqi);
        renderForecast(daily);
        renderChart(daily);
    };

    const updateHealthSuggestion = (code, tempC, aqi) => {
        let key = "goodHealth";
        if (aqi && aqi > 100) { key = "poorAqi"; }
        else if (tempC >= 35) { key = "heatStroke"; }
        else if (tempC <= 5) { key = "coldFlu"; }
        else if (tempC > 25 && [0, 1].includes(code)) { key = "highUV"; }
        
        if (healthTextEl) healthTextEl.textContent = healthTexts[key][currentLang] || healthTexts[key]['en'];
    };

    const updateSmartSuggestion = (code, tempC, windKmh, humidity) => {
        let key = "mild";
        let icon = "fa-cloud";
        
        if ([95,96,99].includes(code)) { key="thunder"; icon="fa-cloud-bolt"; }
        else if (windKmh > 40) { key="wind"; icon="fa-wind"; }
        else if ([71,73,75,77,85,86].includes(code)) { key="snow"; icon="fa-person-snowboarding"; }
        else if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) { key="rain"; icon="fa-umbrella"; }
        else if (code===45 || code===48) { key="fog"; icon="fa-smog"; }
        else if (tempC >= 30) {
            if (humidity > 60) { key="hotHumid"; icon="fa-temperature-arrow-up"; } 
            else { key="hot"; icon="fa-sun"; }
        }
        else if (tempC <= 5) { key="freezing"; icon="fa-mitten"; }
        else if (tempC < 15) { key="chilly"; icon="fa-vest"; }
        else if (humidity < 30) { key="dry"; icon="fa-hand-dots"; }
        else if ([0, 1].includes(code)) { key="perfect"; icon="fa-person-walking"; }

        suggestionTextEl.textContent = suggestionTexts[key][currentLang] || suggestionTexts[key]['en'];
        suggestionIconEl.className = `fa-solid ${icon} text-primary`;
    };

    const renderForecast = (daily) => {
        forecastCardsEl.innerHTML = "";
        let len = Math.min(daily.time.length, 5);
        for (let i = 0; i < len; i++) {
            const dateObj = new Date(daily.time[i]);
            // Extract the correct Day label according to locality
            const displayDay = dateObj.toLocaleDateString(currentLang, { weekday: 'short' });
            const code = daily.weather_code[i];
            
            const maxTemp = isCelsius ? Math.round(daily.temperature_2m_max[i]) : Math.round(toFahrenheit(daily.temperature_2m_max[i]));
            const minTemp = isCelsius ? Math.round(daily.temperature_2m_min[i]) : Math.round(toFahrenheit(daily.temperature_2m_min[i]));
            const baseMap = weatherBaseMap[code] || { icon: "fa-cloud" };
            const desc = mapCodeToDesc(code);

            const card = document.createElement("div");
            card.className = "daily-card";
            card.innerHTML = `
                <div class="day">${displayDay}</div>
                <i class="fa-solid ${baseMap.icon}"></i>
                <div class="temps">${maxTemp}° / ${minTemp}°</div>
                <div class="condition">${desc}</div>
            `;
            forecastCardsEl.appendChild(card);
        }
    };

    const renderChart = (daily) => {
        let len = Math.min(daily.time.length, 5);
        const labels = [];
        const maxTemps = [], minTemps = [];

        for (let i = 0; i < len; i++) {
            const dateObj = new Date(daily.time[i]);
            labels.push(dateObj.toLocaleDateString(currentLang, { weekday: 'short' }));
            maxTemps.push(isCelsius ? daily.temperature_2m_max[i] : toFahrenheit(daily.temperature_2m_max[i]));
            minTemps.push(isCelsius ? daily.temperature_2m_min[i] : toFahrenheit(daily.temperature_2m_min[i]));
        }

        if (weatherChartInstance) weatherChartInstance.destroy();

        const chartColorLine = (document.body.className === "bg-rainy" || document.body.className === "bg-cloudy") ? "rgba(255,255,255,0.7)" : "#ff4d4d";
        const chartColorLine2 = (document.body.className === "bg-rainy" || document.body.className === "bg-cloudy") ? "rgba(100,200,255,0.7)" : "#0066cc";
        
        weatherChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: `Max (${isCelsius ? '°C' : '°F'})`,
                        data: maxTemps, borderColor: chartColorLine,
                        backgroundColor: (document.body.className === "bg-rainy" || document.body.className === "bg-cloudy") ? "rgba(255,255,255,0.1)" : "rgba(255, 77, 77, 0.2)",
                        tension: 0.4, fill: true, borderWidth: 3, pointBackgroundColor: chartColorLine
                    },
                    {
                        label: `Min (${isCelsius ? '°C' : '°F'})`,
                        data: minTemps, borderColor: chartColorLine2,
                        backgroundColor: (document.body.className === "bg-rainy" || document.body.className === "bg-cloudy") ? "rgba(100,200,255,0.1)" : "rgba(0, 102, 204, 0.1)",
                        tension: 0.4, fill: true, borderWidth: 3, pointBackgroundColor: chartColorLine2
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { family: "'Inter', sans-serif" } } } },
                scales: {
                    y: { grid: { color: (document.body.className === "bg-rainy" || document.body.className === "bg-cloudy") ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" } },
                    x: { grid: { display: false } }
                }
            }
        });
    };

    // Event Listeners
    langToggle.addEventListener("change", (e) => {
        currentLang = e.target.value;
        localStorage.setItem("appLang", currentLang);
        if(currentData) updateUI();
        else updateStaticText();
    });

    searchBtn.addEventListener("click", () => {
        const query = cityInput.value.trim();
        if (query) { fetchCityCoordinates(query); cityInput.blur(); }
    });

    cityInput.addEventListener("keyup", (e) => {
        const query = cityInput.value.trim();
        if (e.key === "Enter") {
            if (query) { fetchCityCoordinates(query); cityInput.blur(); }
        } else {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => fetchAutoComplete(query), 300);
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest('.search-wrapper')) autocompleteDropdown.classList.remove("active");
    });

    locationBtn.addEventListener("click", getGeolocation);

    unitToggle.addEventListener("click", () => {
        isCelsius = !isCelsius;
        if (currentData) updateUI();
    });

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            if(voiceBtn) voiceBtn.classList.add('listening');
            cityInput.placeholder = t("listening");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const cleanTranscript = transcript.replace(/\.$/, '').trim();
            cityInput.value = cleanTranscript;
            fetchCityCoordinates(cleanTranscript);
            cityInput.blur();
        };

        recognition.onerror = (event) => {
            if (event.error !== 'no-speech') showError("weatherError"); // Generic fallback for VR
        };

        recognition.onend = () => {
            if(voiceBtn) voiceBtn.classList.remove('listening');
            cityInput.placeholder = t("placeholder");
        };
    } else {
        if(voiceBtn) voiceBtn.style.display = 'none';
    }

    if (voiceBtn) {
        voiceBtn.addEventListener("click", () => {
            if (recognition) {
                // sync VR lang to selected language
                recognition.lang = currentLang === 'en' ? 'en-US' : (currentLang === 'hi' ? 'hi-IN' : 'mr-IN');
                if (voiceBtn.classList.contains('listening')) recognition.stop();
                else try { recognition.start(); } catch(e) {}
            } else {
                alert("Voice search is not supported by your browser.");
            }
        });
    }

    // Start App
    init();
});
