const apiKey = 'dc0c35edbf982768ac67930df6f7f91b';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM Elements
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const locationBtn = document.querySelector('.location-btn');
const unitToggle = document.querySelector('.unit-toggle');
const errorMessage = document.querySelector('.error-message');
const errorText = document.getElementById('error-text');
const weatherContent = document.querySelector('.weather-content');
const loadingSpinner = document.querySelector('.loading-spinner');
const recentSearchesContainer = document.getElementById('recent-searches');
const tempElement = document.querySelector('.temp-value');
const tempUnitElement = document.querySelector('.temp-unit');

// State
let currentUnit = 'C';
let currentWeatherData = null;
let isFetching = false;

/* ===== WEATHER ICONS ===== */
const weatherIcons = {
    '01d': 'https://cdn-icons-png.flaticon.com/512/869/869869.png',
    '01n': 'https://cdn-icons-png.flaticon.com/512/740/740878.png',
    '02d': 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
    '02n': 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
    '03d': 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
    '03n': 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
    '04d': 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
    '04n': 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
    '09d': 'https://cdn-icons-png.flaticon.com/512/1163/1163627.png',
    '10d': 'https://cdn-icons-png.flaticon.com/512/1163/1163627.png',
    '11d': 'https://cdn-icons-png.flaticon.com/512/1163/1163663.png',
    '13d': 'https://cdn-icons-png.flaticon.com/512/642/642102.png',
    '50d': 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png',
    '09n': 'https://cdn-icons-png.flaticon.com/512/1163/1163627.png',
    '10n': 'https://cdn-icons-png.flaticon.com/512/1163/1163627.png',
    '11n': 'https://cdn-icons-png.flaticon.com/512/1163/1163663.png',
    '13n': 'https://cdn-icons-png.flaticon.com/512/642/642102.png',
    '50n': 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png'
};

/* ===== EVENTS ===== */
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
searchInput.addEventListener('input', debounce(() => {
    // Could add autocomplete here
}, 300));

locationBtn.addEventListener('click', handleGeolocation);
unitToggle.addEventListener('click', toggleUnit);

// Load recent searches on init
loadRecentSearches();

function handleSearch() {
    const city = searchInput.value.trim();
    if (!city || isFetching) return;
    getWeather(city);
}

function handleGeolocation() {
    if (!navigator.geolocation) {
        showError('Geolocation not supported by your browser');
        return;
    }
    
    locationBtn.style.transform = 'scale(0.95)';
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            locationBtn.style.transform = '';
            getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
            locationBtn.style.transform = '';
            let msg = 'Unable to retrieve location';
            if (err.code === 1) msg = 'Location access denied';
            if (err.code === 2) msg = 'Location unavailable';
            showError(msg);
        }
    );
}

function toggleUnit() {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    unitToggle.textContent = `°${currentUnit}`;
    tempUnitElement.textContent = `°${currentUnit}`;
    
    if (currentWeatherData) {
        displayWeather(currentWeatherData, false); // false = don't re-fetch
    }
}

/* ===== API CALLS ===== */
async function getWeather(city) {
    if (isFetching) return;
    isFetching = true;
    showLoading();
    
    try {
        const res = await fetch(`${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
        
        if (res.status === 404) throw new Error('City not found');
        if (res.status === 401) throw new Error('API key invalid');
        if (!res.ok) throw new Error('Weather service unavailable');
        
        const data = await res.json();
        currentWeatherData = data;
        displayWeather(data);
        addToRecentSearches(data.name);
        getForecast(city);
    } catch (err) {
        showError(err.message);
    } finally {
        isFetching = false;
        searchBtn.innerHTML = "🔍";
    }
}

async function getWeatherByCoords(lat, lon) {
    if (isFetching) return;
    isFetching = true;
    showLoading();
    
    try {
        const res = await fetch(`${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!res.ok) throw new Error('Weather service unavailable');
        
        const data = await res.json();
        currentWeatherData = data;
        displayWeather(data);
        addToRecentSearches(data.name);
        getForecastByCoords(lat, lon);
    } catch (err) {
        showError(err.message);
    } finally {
        isFetching = false;
    }
}

async function getForecast(city) {
    try {
        const res = await fetch(`${forecastUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        displayForecast(data);
    } catch (e) {
        console.error('Forecast error:', e);
    }
}

async function getForecastByCoords(lat, lon) {
    try {
        const res = await fetch(`${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        displayForecast(data);
    } catch (e) {
        console.error('Forecast error:', e);
    }
}

/* ===== UI UPDATE ===== */
function displayWeather(data, shouldAnimate = true) {
    hideLoading();
    searchInput.value = '';
    errorMessage.classList.remove('active');
    weatherContent.classList.add('active');
    
    document.querySelector('.city-name').textContent = data.name;
    document.querySelector('.weather-description').textContent = data.weather[0].description;
    
    // Temperature conversion
    let temp = data.main.temp;
    let feelsLike = data.main.feels_like;
    
    if (currentUnit === 'F') {
        temp = (temp * 9/5) + 32;
        feelsLike = (feelsLike * 9/5) + 32;
    }
    
    if (shouldAnimate) {
        animateTemp(Math.round(temp));
    } else {
        tempElement.textContent = Math.round(temp);
    }
    
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    // Convert m/s to km/h (multiply by 3.6)
    document.getElementById('wind-speed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('feels-like').textContent = `${Math.round(feelsLike)}°`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    // Local time calculation using timezone offset
    const localTime = new Date((Date.now() / 1000 + data.timezone) * 1000);
    const timeString = localTime.toUTCString().slice(0, -4); // Remove GMT
    document.getElementById('local-time').textContent = `Local time: ${timeString}`;
    
    const iconCode = data.weather[0].icon;
    const iconUrl = weatherIcons[iconCode] || weatherIcons['01d'];
    document.getElementById('weather-icon').src = iconUrl;
    
    updateBackground(data.weather[0].main);
    setBodyBackground(data.weather[0].main.toLowerCase());
}

function animateTemp(newTemp) {
    tempElement.style.opacity = 0;
    setTimeout(() => {
        tempElement.textContent = newTemp;
        tempElement.style.opacity = 1;
    }, 200);
}

function displayForecast(data) {
    const container = document.getElementById('forecast');
    container.innerHTML = '';
    
    // Group by date (YYYY-MM-DD) instead of weekday name
    const daily = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Take the midday forecast (12:00) or first available
        if (!daily[dateKey] || date.getHours() === 12) {
            daily[dateKey] = item;
        }
    });
    
    // Get next 5 days (skip today)
    const today = new Date().toISOString().split('T')[0];
    const sortedDays = Object.keys(daily)
        .filter(date => date > today)
        .sort()
        .slice(0, 5);
    
    sortedDays.forEach(dateKey => {
        const day = daily[dateKey];
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const iconCode = day.weather[0].icon;
        const iconUrl = weatherIcons[iconCode] || weatherIcons['01d'];
        
        let temp = day.main.temp;
        if (currentUnit === 'F') {
            temp = (temp * 9/5) + 32;
        }
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img src="${iconUrl}" class="forecast-icon" alt="${day.weather[0].description}">
            <div class="forecast-temp">${Math.round(temp)}°</div>
        `;
        container.appendChild(forecastItem);
    });
}

/* ===== BACKGROUND EFFECTS ===== */
function updateBackground(weather) {
    const blobs = document.querySelectorAll('.blob');
    const colors = {
        Clear: ['#00d4ff', '#9d4edd', '#ff006e'],
        Clouds: ['#8899a6', '#657786', '#aab8c2'],
        Rain: ['#1da1f2', '#14171a', '#657786'],
        Snow: ['#83a4d4', '#b6fbff', '#ffffff'],
        Thunderstorm: ['#141E30', '#243B55', '#ff006e'],
        Drizzle: ['#3a7bd5', '#3a6073', '#00d4ff'],
        Mist: ['#606c88', '#3f4c6b', '#8899a6'],
        Fog: ['#606c88', '#3f4c6b', '#8899a6']
    };
    
    const set = colors[weather] || colors.Clear;
    blobs.forEach((b, i) => {
        b.style.background = set[i % set.length];
        b.style.transition = 'background 0.6s ease';
    });
}

function setBodyBackground(condition) {
    document.body.className = '';
    const className = `weather-${condition}`;
    if (document.body.classList.contains(className)) return;
    document.body.classList.add(className);
}

/* ===== RECENT SEARCHES ===== */
function loadRecentSearches() {
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    if (searches.length > 0) {
        recentSearchesContainer.classList.add('active');
        recentSearchesContainer.innerHTML = searches.map(city => 
            `<span class="recent-chip" onclick="getWeather('${city}')">${city}</span>`
        ).join('');
    }
}

function addToRecentSearches(city) {
    let searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    searches = searches.filter(c => c.toLowerCase() !== city.toLowerCase());
    searches.unshift(city);
    searches = searches.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(searches));
    loadRecentSearches();
}

/* ===== UTILS ===== */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* ===== STATES ===== */
function showError(message = 'City not found. Try again.') {
    hideLoading();
    errorText.textContent = message;
    errorMessage.classList.add('active');
    weatherContent.classList.remove('active');
    searchBtn.innerHTML = "🔍";
}

function showLoading() {
    loadingSpinner.classList.add('active');
    weatherContent.classList.remove('active');
    errorMessage.classList.remove('active');
}

function hideLoading() {
    loadingSpinner.classList.remove('active');
}

/* ===== INIT ===== */
getWeather('London');