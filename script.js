// ============================================
// KRISHI SAHAYAK - Farmer Helper App
// Pure JavaScript - NO Frameworks
// LocalStorage for Data Persistence
// Weather API Integration
// ============================================

// CONFIG & CONSTANTS
const CONFIG = {
  APP_NAME: "কৃষক সহায়ক",
  VERSION: "১.०.०",
  WEATHER_API: "https://api.weatherapi.com/v1",
  WEATHER_API_KEY: "f39ac8e4f3c14f61a5e143005242412", // Free tier key for demo
  STORAGE_KEYS: {
    FARMER: "krishak_farmer",
    EXPENSES: "krishak_expenses",
    NOTES: "krishak_notes",
    BATCHES: "krishak_batches",
    SETTINGS: "krishak_settings",
  },
}

// BENGALI NUMERAL CONVERTER
const convertToBengaliNumeral = (num) => {
  if (typeof num !== "string" && typeof num !== "number") return num
  const bengaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]
  return String(num).replace(/\d/g, (d) => bengaliDigits[d])
}

const convertFromBengaliNumeral = (str) => {
  if (typeof str !== "string") return str
  const bengaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]
  let result = str
  bengaliDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, "g"), index.toString())
  })
  return result
}

// CROP DISEASE DATABASE (IN BANGLA)
const CROP_DATABASE = {
  rice: {
    name: "ধান",
    diseases: [
      {
        name: "ব্লাস্ট রোগ",
        symptoms: "পাতায় ছোট ছোট বাদামি দাগ, ধীরে ধীরে বড় হয়, পাতা শুকিয়ে যায়",
        solution: "সুস্থ বীজ বপন করুন, জমিতে পানি নিকাশের ব্যবস্থা করুন, ছত্রাকনাশক ব্যবহার করুন",
      },
      {
        name: "টুংরো ভাইরাস",
        symptoms: "পাতা ধারালো হয় এবং হলুদ হয়ে যায়, গাছ খাট হয়ে যায়",
        solution: "আক্রান্ত গাছ তুলে ফেলুন, কীটনাশক ব্যবহার করে ঘাসফড়িং দমন করুন",
      },
      {
        name: "শিথিল স্মাট",
        symptoms: "ধানের শীষ কালো হয়ে যায় এবং ভাঙা পড়ে যায়",
        solution: "স্বাস্থ্যকর বীজ ব্যবহার করুন, বীজ শোধন করুন",
      },
    ],
  },
  vegetables: {
    name: "সবজি",
    diseases: [
      {
        name: "গোড়া পচা রোগ",
        symptoms: "গাছের গোড়া নরম হয়ে যায় এবং পচে যায়",
        solution: "জমিতে পানি জমা না হতে দিন, আক্রান্ত গাছ তুলে ফেলুন, ট্রাইকোডারমা ব্যবহার করুন",
      },
      {
        name: "পাতা চিটকে রোগ",
        symptoms: "পাতায় হালকা সবুজ থেকে বাদামি রঙের দাগ পড়ে",
        solution: "রোগমুক্ত বীজ বপন করুন, নিয়মিত স্প্রে করুন",
      },
    ],
  },
  potato: {
    name: "আলু",
    diseases: [
      {
        name: "লেট ব্লাইট",
        symptoms: "পাতায় জলের মতো দাগ পড়ে, দাগ দ্রুত বাড়ে এবং পাতা নষ্ট হয়",
        solution: "আলু নির্বাচন সাবধানে করুন, ছত্রাকনাশক স্প্রে করুন",
      },
      {
        name: "আর্লি ব্লাইট",
        symptoms: "পাতার নিচে ছোট গোল দাগ পড়ে",
        solution: "নিচের পুরনো পাতা সরিয়ে ফেলুন, স্প্রে করুন",
      },
    ],
  },
  wheat: {
    name: "গম",
    diseases: [
      {
        name: "রাস্ট রোগ",
        symptoms: "পাতায় লাল-বাদামি রঙের ক্ষুদ্র পুস্টুল দেখা যায়",
        solution: "রোগ প্রতিরোধী জাত ব্যবহার করুন, ছত্রাকনাশক স্প্রে করুন",
      },
    ],
  },
}

// MARKET PRICES DATABASE (স্থির ডেটা - আজকের মূল্য)
const MARKET_PRICES = [
  { crop: "ধান", price: "1200", unit: "টাকা/মন" },
  { crop: "গম", price: "1000", unit: "টাকা/মন" },
  { crop: "আলু", price: "800", unit: "টাকা/মন" },
  { crop: "সবজি মিশ্রণ", price: "200000", unit: "টাকা/কুইন্টাল" },
  { crop: "ভুট্টা", price: "100000", unit: "টাকা/কুইন্টাল" },
  { crop: "সয়াবিন", price: "60000", unit: "টাকা/কুইন্টাল" },
]

// UPAZILA/DIVISION MAPPING
const UPAZILAS = {
  dhaka: ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "তাঙ্গাইল"],
  chittagong: ["চট্টগ্রাম", "কুমিল্লা", "নোয়াখালী"],
  sylhet: ["সিলেট", "মৌলভীবাজার"],
  rajshahi: ["রাজশাহী", "নওগাঁ"],
  khulna: ["খুলনা", "বাগেরহাট"],
  barishal: ["বরিশাল", "পটুয়াখালী"],
  rangpur: ["রংপুর", "দিনাজপুর"],
  mymensingh: ["ময়মনসিংহ", "জামালপুর"],
}

// ============================================
// INITIALIZATION & APP START
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] App initialization starting")

  // Initialize settings from localStorage
  loadSettings()

  // Set today's date as default
  const today = new Date().toISOString().split("T")[0]
  const dateInputs = document.querySelectorAll('input[type="date"]')
  dateInputs.forEach((input) => {
    if (!input.value) input.value = today
  })

  // Update market date
  updateMarketDate()

  // Load initial data
  loadAllData()

  // Show landing page first
  showModule("landing")

  // Register Service Worker for offline support
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch((err) => {
      console.log("[v0] Service Worker registration failed:", err)
    })
  }

  // Check online/offline status
  window.addEventListener("online", updateOnlineStatus)
  window.addEventListener("offline", updateOnlineStatus)
  updateOnlineStatus()

  console.log("[v0] App initialization complete")
})

// ============================================
// MODULE NAVIGATION
// ============================================

function showModule(moduleId) {
  console.log("[v0] Showing module:", moduleId)

  // Hide all modules
  const modules = document.querySelectorAll(".module")
  modules.forEach((mod) => mod.classList.remove("active"))

  // Show selected module
  const module = document.getElementById(moduleId)
  if (module) {
    module.classList.add("active")

    // Update navbar
    const navBtns = document.querySelectorAll(".nav-btn")
    navBtns.forEach((btn) => btn.classList.remove("active"))
    const activeBtn = document.querySelector(`[data-module="${moduleId}"]`)
    if (activeBtn) activeBtn.classList.add("active")

    // Scroll to top
    window.scrollTo(0, 0)
  }
}

function toggleSettings() {
  showModule("settings")
}

// ============================================
// ONLINE/OFFLINE STATUS
// ============================================

function updateOnlineStatus() {
  const status = navigator.onLine ? "অনলাইন" : "অফলাইন"
  const offlineStatusEl = document.getElementById("offlineStatus")
  if (offlineStatusEl) {
    offlineStatusEl.textContent = status
  }
  console.log("[v0] Status:", status)
}

// ============================================
// WEATHER MODULE
// ============================================

async function getWeatherByLocation() {
  const location = document.getElementById("locationInput").value.trim()
  if (!location) {
    alert("অনুগ্রহ করে এলাকার নাম লিখুন")
    return
  }

  await fetchWeather(location)
}

async function getWeatherByGPS() {
  if (!navigator.geolocation) {
    alert("আপনার ডিভাইসে GPS উপলব্ধ নেই")
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      await fetchWeatherByCoords(latitude, longitude)
    },
    (error) => {
      console.log("[v0] GPS Error:", error)
      alert("অবস্থান নির্ধারণ করতে পারলাম না। অনুগ্রহ করে নিজে এলাকা লিখুন।")
    },
  )
}

async function fetchWeather(location) {
  const errorEl = document.getElementById("weatherError")
  const widgetEl = document.getElementById("weatherWidget")
  const placeholderEl = document.getElementById("weatherPlaceholder")

  try {
    errorEl.style.display = "none"

    // Using Open-Meteo (FREE, NO API KEY NEEDED)
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&language=bn`
    const geoResponse = await fetch(geoUrl)
    const geoData = await geoResponse.json()

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("এলাকা খুঁজে পাওয়া যায়নি")
    }

    const location_data = geoData.results[0]
    await fetchWeatherByCoords(location_data.latitude, location_data.longitude, location_data.name)
  } catch (error) {
    console.log("[v0] Weather Error:", error)
    errorEl.textContent = "আবহাওয়ার তথ্য পেতে পারলাম না: " + error.message
    errorEl.style.display = "block"
    widgetEl.style.display = "none"
  }
}

async function fetchWeatherByCoords(lat, lon, locationName = null) {
  const errorEl = document.getElementById("weatherError")
  const widgetEl = document.getElementById("weatherWidget")
  const placeholderEl = document.getElementById("weatherPlaceholder")

  try {
    // Using Open-Meteo Weather API (FREE)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia/Dhaka`

    const response = await fetch(weatherUrl)
    const data = await response.json()

    // Reverse geocode for location name
    if (!locationName) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&language=bn`
      const geoResponse = await fetch(geoUrl)
      const geoData = await geoResponse.json()
      locationName = geoData.results?.[0]?.name || "অজানা স্থান"
    }

    displayWeatherWidget(data, locationName)
    saveWeatherCache(data, locationName)
  } catch (error) {
    console.log("[v0] Weather API Error:", error)
    errorEl.textContent = "আবহাওয়ার তথ্য পেতে পারলাম না"
    errorEl.style.display = "block"
    widgetEl.style.display = "none"
  }
}

function displayWeatherWidget(data, locationName) {
  const widgetEl = document.getElementById("weatherWidget")
  const placeholderEl = document.getElementById("weatherPlaceholder")
  const errorEl = document.getElementById("weatherError")

  const current = data.current
  const daily = data.daily

  // Update header
  document.getElementById("weatherLocation").textContent = locationName
  document.getElementById("weatherTime").textContent = new Date().toLocaleString("bn-BD")

  const tempElement = document.getElementById("weatherTemp")
  tempElement.innerHTML = Math.round(current.temperature_2m) + "°সি"
  tempElement.style.fontFamily = "Noto Sans Bengali, sans-serif"

  document.getElementById("weatherDesc").textContent = getWeatherDescription(current.weather_code)

  document.getElementById("weatherHumidity").innerHTML = current.relative_humidity_2m + "%"
  document.getElementById("weatherRain").innerHTML = daily.precipitation_probability_max[0] + "%"
  document.getElementById("weatherWind").innerHTML = Math.round(current.wind_speed_10m) + " কিমি/ঘন্টা"
  document.getElementById("weatherPressure").innerHTML = Math.round(current.pressure_msl) + " মিবার"

  // Generate weather advisory
  generateWeatherAdvisory(current, daily)

  // Display forecast
  displayForecast(daily)

  widgetEl.style.display = "block"
  placeholderEl.style.display = "none"
  errorEl.style.display = "none"
}

function getWeatherDescription(code) {
  // WMO Weather interpretation codes
  const descriptions = {
    0: "পরিষ্কার আকাশ",
    1: "মূলত পরিষ্কার",
    2: "আংশিক মেঘলা",
    3: "মেঘলা",
    45: "কুয়াশা",
    48: "হিম কুয়াশা",
    51: "হালকা বৃষ্টি",
    53: "মাঝারি বৃষ্টি",
    55: "ভারী বৃষ্টি",
    61: "হালকা বৃষ্টি",
    63: "মাঝারি বৃষ্টি",
    65: "ভারী বৃষ্টি",
    71: "হালকা তুষার",
    73: "মাঝারি তুষার",
    75: "ভারী তুষার",
    80: "হালকা বৃষ্টি",
    81: "মাঝারি বৃষ্টি",
    82: "ভারী বৃষ্টি",
  }
  return descriptions[code] || "অজানা"
}

function generateWeatherAdvisory(current, daily) {
  const advisoryEl = document.getElementById("weatherAdvisory")
  let advice = ""

  const temp = current.temperature_2m
  const humidity = current.relative_humidity_2m
  const rainProb = daily.precipitation_probability_max[0]
  const wind = current.wind_speed_10m

  // Generate agricultural advice based on weather
  if (rainProb > 70) {
    advice += "🌧️ বৃষ্টির সম্ভাবনা বেশি - সেচ দেওয়ার পরিকল্পনা পরিবর্তন করুন<br>"
  }
  if (temp < 10) {
    advice += "❄️ ঠান্ডা আবহাওয়া - শীতকালীন ফসলের যত্ন নিন<br>"
  }
  if (temp > 35) {
    advice += "☀️ গরম আবহাওয়া - নিয়মিত সেচ দিন<br>"
  }
  if (humidity > 80) {
    advice += "💧 উচ্চ আর্দ্রতা - রোগের ঝুঁকি বেশি, প্রতিরোধমূলক ব্যবস্থা নিন<br>"
  }
  if (wind > 30) {
    advice += "💨 শক্তিশালী বায়ু - ঝড়ের সম্ভাবনা, গাছ বাঁধুন<br>"
  }

  if (!advice) {
    advice = "✅ আবহাওয়া ফসলের জন্য অনুকূল দেখাচ্ছে"
  }

  advisoryEl.innerHTML = advice
}

function displayForecast(daily) {
  const forecastContainer = document.getElementById("forecastContainer")
  forecastContainer.innerHTML = ""

  const days = ["সোম", "মঙ্গল", "বুধ", "গুরু", "শুক্র", "শনি", "রবি"]

  for (let i = 0; i < Math.min(5, daily.time.length); i++) {
    const date = new Date(daily.time[i])
    const dayName = days[date.getDay()]
    const temp = daily.temperature_2m_max[i]
    const weatherCode = daily.weather_code[i]
    const icon = getWeatherIcon(weatherCode)

    const card = document.createElement("div")
    card.className = "forecast-card"
    const formattedTemp = Math.round(temp) + "°সি"
    card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${formattedTemp}</div>
        `
    forecastContainer.appendChild(card)
  }
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️"
  if (code < 3) return "⛅"
  if (code === 3) return "☁️"
  if (code >= 45 && code <= 48) return "🌫️"
  if (code >= 51 && code <= 82) return "🌧️"
  if (code >= 71 && code <= 75) return "❄️"
  return "🌤️"
}

function saveWeatherCache(data, location) {
  const cache = {
    data: data,
    location: location,
    timestamp: new Date().toISOString(),
  }
  localStorage.setItem("weather_cache", JSON.stringify(cache))
}

// ============================================
// CROP HEALTH MODULE
// ============================================

function showCropInfo() {
  const cropSelect = document.getElementById("cropSelect")
  const cropValue = cropSelect.value
  const container = document.getElementById("cropInfoContainer")
  const noCropSelected = document.getElementById("noCropSelected")
  const diseaseList = document.getElementById("diseaseList")

  if (!cropValue) {
    container.style.display = "none"
    noCropSelected.style.display = "block"
    return
  }

  const cropInfo = CROP_DATABASE[cropValue]
  if (!cropInfo) return

  document.getElementById("cropTitle").textContent = cropInfo.name
  diseaseList.innerHTML = ""

  cropInfo.diseases.forEach((disease) => {
    const card = document.createElement("div")
    card.className = "disease-card"
    card.innerHTML = `
            <div class="disease-name">🦠 ${disease.name}</div>
            <div class="disease-symptoms"><strong>লক্ষণ:</strong> ${disease.symptoms}</div>
            <div class="disease-solution">✅ সমাধান: ${disease.solution}</div>
        `
    diseaseList.appendChild(card)
  })

  container.style.display = "block"
  noCropSelected.style.display = "none"
}

// ============================================
// COST CALCULATOR MODULE
// ============================================

function addExpense() {
  const date = document.getElementById("expenseDate").value
  const category = document.getElementById("expenseCategory").value
  const amount = Number.parseFloat(document.getElementById("expenseAmount").value)
  const description = document.getElementById("expenseDescription").value

  if (!date || !category || !amount) {
    alert("অনুগ্রহ করে সব ফিল্ড ভরুন")
    return
  }

  const expense = {
    id: Date.now(),
    date,
    category,
    amount,
    description,
    timestamp: new Date().toISOString(),
  }

  const expenses = getExpenses()
  expenses.push(expense)
  localStorage.setItem(CONFIG.STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))

  // Clear form
  document.getElementById("expenseAmount").value = ""
  document.getElementById("expenseDescription").value = ""

  displayExpenses()
  updateCostSummary()
  updateCostChart()
}

function getExpenses() {
  const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.EXPENSES)
  return stored ? JSON.parse(stored) : []
}

function displayExpenses() {
  const expenses = getExpenses()
  const container = document.getElementById("costTableContainer")

  if (expenses.length === 0) {
    container.innerHTML = '<p class="placeholder-message">কোনো খরচ নেই</p>'
    return
  }

  container.innerHTML = ""
  const categoryLabels = {
    seed: "বীজ",
    fertilizer: "সার",
    pesticide: "কীটনাশক",
    labor: "শ্রমিক",
    water: "পানি",
    equipment: "যন্ত্রপাতি",
    transport: "পরিবহন",
    other: "অন্যান্য",
  }

  expenses.forEach((expense) => {
    const row = document.createElement("div")
    row.className = "cost-row"
    const formattedDate = convertToBengaliNumeral(expense.date)
    const formattedAmount = convertToBengaliNumeral(expense.amount.toFixed(0)) + " টাকা"
    row.innerHTML = `
            <div>${formattedDate}</div>
            <div>${categoryLabels[expense.category] || expense.category}</div>
            <div>${formattedAmount}</div>
            <button class="cost-delete-btn" onclick="deleteExpense(${expense.id})">মুছুন</button>
        `
    container.appendChild(row)
  })
}

function deleteExpense(id) {
  let expenses = getExpenses()
  expenses = expenses.filter((e) => e.id !== id)
  localStorage.setItem(CONFIG.STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))
  displayExpenses()
  updateCostSummary()
  updateCostChart()
}

function updateCostSummary() {
  const expenses = getExpenses()
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const formattedTotal = convertToBengaliNumeral(total.toFixed(0)) + " টাকা"
  document.getElementById("totalCost").innerHTML = formattedTotal
}

function clearAllExpenses() {
  if (confirm("সব খরচ মুছে দিতে চান?")) {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.EXPENSES)
    displayExpenses()
    updateCostSummary()
    updateCostChart()
  }
}

function updateCostChart() {
  const canvas = document.getElementById("costChart")
  if (!canvas) return

  const expenses = getExpenses()
  const categories = {}

  expenses.forEach((e) => {
    categories[e.category] = (categories[e.category] || 0) + e.amount
  })

  // Simple chart using canvas
  const ctx = canvas.getContext("2d")
  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  if (Object.keys(categories).length === 0) return

  const categoryNames = Object.keys(categories)
  const categoryValues = Object.values(categories)
  const maxValue = Math.max(...categoryValues)

  const barWidth = width / (categoryNames.length * 1.5)
  const barSpacing = width / categoryNames.length

  categoryNames.forEach((cat, i) => {
    const value = categoryValues[i]
    const barHeight = (value / maxValue) * (height - 40)
    const x = i * barSpacing + 10
    const y = height - barHeight - 20

    ctx.fillStyle = "#2D5016"
    ctx.fillRect(x, y, barWidth, barHeight)

    ctx.fillStyle = "#2C2C2C"
    ctx.font = "bold 10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(convertToBengaliNumeral(value.toFixed(0)), x + barWidth / 2, y - 5)
  })
}

// ============================================
// MARKET PRICES MODULE
// ============================================

function displayMarketPrices() {
  const container = document.getElementById("priceList")
  container.innerHTML = ""

  MARKET_PRICES.forEach((item) => {
    const card = document.createElement("div")
    card.className = "price-card"
    const formattedPrice = item.price
    card.innerHTML = `
            <div class="price-crop-name">${item.crop}</div>
            <div class="price-amount">${formattedPrice}</div>
            <div class="price-unit">${item.unit}</div>
        `
    container.appendChild(card)
  })

  // Market advice
  const adviceEl = document.getElementById("marketAdvice")
  adviceEl.textContent =
    "বাজারের দাম প্রতিদিন পরিবর্তিত হয়। আপনার ফসল বিক্রয়ের আগে স্থানীয় বাজারে মূল্য জেনে নিন। সরকারি কৃষি অফিসে যোগাযোগ করে সর্বশেষ মূল্য জানতে পারেন।"
}

function updateMarketDate() {
  const dateEl = document.getElementById("marketDate")
  if (dateEl) {
    const today = new Date()
    const dateStr = today.toLocaleDateString("bn-BD", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    dateEl.textContent = dateStr
  }
}

// ============================================
// FARMER NOTES MODULE
// ============================================

function saveNote() {
  const input = document.getElementById("notesInput")
  const text = input.value.trim()

  if (!text) {
    alert("অনুগ্রহ করে কিছু লিখুন")
    return
  }

  const note = {
    id: Date.now(),
    text: text,
    date: new Date().toLocaleString("bn-BD"),
    timestamp: new Date().toISOString(),
  }

  const notes = getNotes()
  notes.push(note)
  localStorage.setItem(CONFIG.STORAGE_KEYS.NOTES, JSON.stringify(notes))

  input.value = ""
  displayNotes()
}

function getNotes() {
  const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.NOTES)
  return stored ? JSON.parse(stored) : []
}

function displayNotes() {
  const container = document.getElementById("notesList")
  const notes = getNotes().reverse()

  if (notes.length === 0) {
    container.innerHTML = '<p class="placeholder-message">কোনো নোট নেই</p>'
    return
  }

  container.innerHTML = ""
  notes.forEach((note) => {
    const card = document.createElement("div")
    card.className = "note-card"
    card.innerHTML = `
            <div class="note-date">${note.date}</div>
            <div class="note-text">${note.text}</div>
            <button class="note-delete-btn" onclick="deleteNote(${note.id})">মুছুন</button>
        `
    container.appendChild(card)
  })
}

function deleteNote(id) {
  let notes = getNotes()
  notes = notes.filter((n) => n.id !== id)
  localStorage.setItem(CONFIG.STORAGE_KEYS.NOTES, JSON.stringify(notes))
  displayNotes()
}

// ============================================
// FARMER PROFILE & REGISTRATION (MODULE A2)
// ============================================

document.addEventListener("submit", (e) => {
  if (e.target.id === "farmerForm") {
    e.preventDefault()
    saveFarmerProfile()
  }
  if (e.target.id === "cropBatchForm") {
    e.preventDefault()
    addCropBatch()
  }
})

function saveFarmerProfile() {
  const farmer = {
    name: document.getElementById("farmerName").value,
    email: document.getElementById("farmerEmail").value,
    phone: document.getElementById("farmerPhone").value,
    division: document.getElementById("farmerDivision").value,
    language: document.getElementById("farmerLanguage").value,
    registeredDate: new Date().toISOString(),
  }

  localStorage.setItem(CONFIG.STORAGE_KEYS.FARMER, JSON.stringify(farmer))
  displayFarmerProfile(farmer)
  alert("আপনার প্রোফাইল সংরক্ষিত হয়েছে!")
}

function displayFarmerProfile(farmer) {
  if (!farmer) {
    farmer = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FARMER) || "null")
  }

  if (!farmer) return

  const formEl = document.getElementById("farmerForm")
  const profileEl = document.getElementById("farmerProfile")

  document.getElementById("profileName").textContent = farmer.name
  document.getElementById("profileEmail").textContent = farmer.email || "যোগ করা হয়নি"
  document.getElementById("profilePhone").textContent = farmer.phone
  document.getElementById("profileDivision").textContent = farmer.division

  formEl.style.display = "none"
  profileEl.style.display = "block"

  displayBadges()
}

function displayBadges() {
  const container = document.getElementById("badgesContainer")
  const batches = getCropBatches()

  const badges = []
  if (batches.length > 0) {
    badges.push("প্রথম ফসল লগ করা হয়েছে")
  }

  container.innerHTML = ""
  badges.forEach((badge) => {
    const badge_el = document.createElement("div")
    badge_el.className = "badge"
    badge_el.textContent = "🏆 " + badge
    container.appendChild(badge_el)
  })
}

function editFarmerProfile() {
  const formEl = document.getElementById("farmerForm")
  const profileEl = document.getElementById("farmerProfile")
  formEl.style.display = "block"
  profileEl.style.display = "none"
}

// ============================================
// CROP BATCH MANAGEMENT (MODULE A2b)
// ============================================

function addCropBatch() {
  const cropType = document.getElementById("cropType").value
  const estimatedWeight = Number.parseFloat(document.getElementById("estimatedWeight").value)
  const harvestDate = document.getElementById("harvestDate").value
  const storageType = document.getElementById("storageType").value

  if (!cropType || !estimatedWeight || !harvestDate || !storageType) {
    alert("অনুগ্রহ করে সব ফিল্ড ভরুন")
    return
  }

  const batch = {
    id: Date.now(),
    cropType,
    estimatedWeight,
    harvestDate,
    storageType,
    createdDate: new Date().toISOString(),
    status: "চলমান",
  }

  const batches = getCropBatches()
  batches.push(batch)
  localStorage.setItem(CONFIG.STORAGE_KEYS.BATCHES, JSON.stringify(batches))

  // Clear form
  document.getElementById("cropBatchForm").reset()
  displayCropBatches()
  displayBadges()
}

function getCropBatches() {
  const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.BATCHES)
  return stored ? JSON.parse(stored) : []
}

function displayCropBatches() {
  const container = document.getElementById("batchesList")
  const batches = getCropBatches()

  const cropNames = {
    rice: "ধান",
    vegetables: "সবজি",
    potato: "আলু",
    wheat: "গম",
    corn: "ভুট্টা",
  }

  const storageNames = {
    jute: "পাটের বস্তা স্ট্যাক",
    silo: "সাইলো",
    open: "খোলা স্থান",
    warehouse: "গুদাম",
  }

  container.innerHTML = ""

  if (batches.length === 0) {
    container.innerHTML = '<p class="placeholder-message">কোনো ব্যাচ নেই</p>'
    return
  }

  batches.forEach((batch) => {
    const card = document.createElement("div")
    card.className = "batch-card"
    card.innerHTML = `
            <div class="batch-header">
                <div class="batch-crop-name">${cropNames[batch.cropType] || batch.cropType}</div>
                <div class="batch-status">${batch.status}</div>
            </div>
            <div class="batch-details">
                <div class="batch-detail-item">
                    <div class="batch-detail-label">ওজন:</div>
                    <div>${convertToBengaliNumeral(batch.estimatedWeight)} কেজি</div>
                </div>
                <div class="batch-detail-item">
                    <div class="batch-detail-label">কাটার তারিখ:</div>
                    <div>${convertToBengaliNumeral(batch.harvestDate)}</div>
                </div>
                <div class="batch-detail-item">
                    <div class="batch-detail-label">সংরক্ষণ ধরন:</div>
                    <div>${storageNames[batch.storageType] || batch.storageType}</div>
                </div>
            </div>
            <button class="batch-delete-btn" onclick="deleteCropBatch(${batch.id})">মুছুন</button>
        `
    container.appendChild(card)
  })
}

function deleteCropBatch(id) {
  let batches = getCropBatches()
  batches = batches.filter((b) => b.id !== id)
  localStorage.setItem(CONFIG.STORAGE_KEYS.BATCHES, JSON.stringify(batches))
  displayCropBatches()
}

// ============================================
// SETTINGS & EXTRA FEATURES
// ============================================

function toggleDarkMode() {
  const toggle = document.getElementById("darkModeToggle")
  if (toggle.checked) {
    document.body.classList.add("dark-mode")
    localStorage.setItem("dark_mode", "true")
  } else {
    document.body.classList.remove("dark-mode")
    localStorage.removeItem("dark_mode")
  }
}

function toggleColorBlind() {
  const toggle = document.getElementById("colorBlindToggle")
  if (toggle.checked) {
    document.body.classList.add("color-blind-mode")
    localStorage.setItem("color_blind_mode", "true")
  } else {
    document.body.classList.remove("color-blind-mode")
    localStorage.removeItem("color_blind_mode")
  }
}

function increaseFontSize() {
  let currentSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  currentSize += 2
  document.documentElement.style.fontSize = currentSize + "px"
  localStorage.setItem("font_size", currentSize)
}

function decreaseFontSize() {
  let currentSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  currentSize -= 2
  if (currentSize < 12) currentSize = 12
  document.documentElement.style.fontSize = currentSize + "px"
  localStorage.setItem("font_size", currentSize)
}

function toggleTextToSpeech() {
    speechEnabled = !speechEnabled
    localStorage.setItem("text_to_speech", speechEnabled)
    
    if (speechEnabled) {
        alert("কণ্ঠস্বর চালু হয়েছে")
        // Immediately speak a short message
        speakText("আপনি এখন টেক্সট-টু-স্পীচ চালু করেছেন")
    } else {
        alert("কণ্ঠস্বর বন্ধ হয়েছে")
        // Stop any ongoing speech
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel()
        }
    }
}

function speakText(text) {
  if (!speechEnabled) return
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "bn-BD"
    window.speechSynthesis.speak(utterance)
  }
}

function exportData() {
  const data = {
    farmer: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FARMER) || "{}"),
    expenses: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.EXPENSES) || "[]"),
    notes: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.NOTES) || "[]"),
    batches: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.BATCHES) || "[]"),
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "krishak_data_" + new Date().toISOString().split("T")[0] + ".json"
  a.click()
  URL.revokeObjectURL(url)
}

function resetData() {
  if (confirm("সব ডেটা মুছে দিতে চান? এটি পূর্বাবাস করা যাবে না!")) {
    localStorage.clear()
    location.reload()
  }
}

// ============================================
// DATA PERSISTENCE & LOADING
// ============================================

function loadSettings() {
  // Load dark mode
  if (localStorage.getItem("dark_mode")) {
    document.getElementById("darkModeToggle").checked = true
    document.body.classList.add("dark-mode")
  }

  // Load color-blind mode
  if (localStorage.getItem("color_blind_mode")) {
    document.getElementById("colorBlindToggle").checked = true
    document.body.classList.add("color-blind-mode")
  }

  // Load font size
  const fontSize = localStorage.getItem("font_size")
  if (fontSize) {
    document.documentElement.style.fontSize = fontSize + "px"
  }

  // Load text-to-speech
  speechEnabled = localStorage.getItem("text_to_speech") === "true"
}

function loadAllData() {
  // Load farmer profile
  const farmer = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FARMER) || "null")
  if (farmer) {
    displayFarmerProfile(farmer)
  }

  // Load expenses
  displayExpenses()
  updateCostSummary()
  updateCostChart()

  // Load notes
  displayNotes()

  // Load crop batches
  displayCropBatches()

  // Load market prices
  displayMarketPrices()
}

// Auto-save notes every 5 seconds
setInterval(() => {
  const textarea = document.getElementById("notesInput")
  if (textarea && textarea.value.trim()) {
    localStorage.setItem("draft_note", textarea.value)
  }
}, 5000)

// Load draft note on page load
window.addEventListener("load", () => {
  // Convert all Bangla numerals in document to English numerals
  document.body.innerHTML = convertFromBengaliNumeral(document.body.innerHTML)

  // Load draft note on page load
  const draftNote = localStorage.getItem("draft_note")
  if (draftNote) {
    document.getElementById("notesInput").value = draftNote
  }
})

// New helper function to wrap Bangla numerals in spans with .bn-number class
function formatBanglaNumbers(text) {
  if (typeof text !== "string" && typeof text !== "number") return text
  const textStr = String(text)
  // Match Bangla digits (०-९) and wrap them in spans
  return textStr.replace(/[०-९]+/g, (match) => `<span class="bn-number">${match}</span>`)
}

/**
 * Wraps Bangla numerals in a text node (safe for innerHTML)
 * Used when setting innerHTML to preserve HTML and apply styling
 * @param {string} htmlStr - HTML string possibly containing Bangla numerals
 * @returns {string} HTML with Bangla numerals wrapped
 */
function applyBanglaNumberStyling(htmlStr) {
  if (typeof htmlStr !== "string") return htmlStr
  return htmlStr.replace(/[०-९]+/g, (match) => `<span class="bn-number">${match}</span>`)
}
