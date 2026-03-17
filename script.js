const apiKey = 'dc0c35edbf982768ac67930df6f7f91b'; // Get from openweathermap.org
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const locationBtn = document.querySelector('.location-btn');
const errorMessage = document.querySelector('.error-message');
const weatherContent = document.querySelector('.weather-content');
const loadingSpinner = document.querySelector('.loading-spinner');

// Weather icon mapping
const weatherIcons = {
    '01d': 'https://cdn-icons-png.flaticon.com/512/869/869869.png', // clear sky day
    '01n': 'https://cdn-icons-png.flaticon.com/512/740/740878.png', // clear sky night
    '02d': 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png', // few clouds day
    '02n': 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png', // few clouds night
    '03d': 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png', // scattered clouds
    '03n': 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
    '04d': 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png', // broken clouds
    '04n': 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
    '09d': 'https://cdn-icons-png.flaticon.com/512/1163/1163627.png', // shower rain
    '09n': 'https://cdn-icons-png.flaticon.com/512/1163/1163627.png',
    '10d': 'https://cdn-icons-png.flaticon.com/512/1163/1163627.png', // rain
    '10n': 'https://cdn-icons-png.flaticon.com/512/1163/1163627.png',
    '11d': 'https://cdn-icons-png.flaticon.com/512/1163/1163663.png', // thunderstorm
    '11n': 'https://cdn-icons-png.flaticon.com/512/1163/1163663.png',
    '13d': 'https://cdn-icons-png.flaticon.com/512/642/642102.png', // snow
    '13n': 'https://cdn-icons-png.flaticon.com/512/642/642102.png',
    '50d': 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png', // mist
    '50n': 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png'
};

searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            () => {
                showError();
            }
        );
    } else {
        showError();
    }
});

async function getWeather(city) {
    showLoading();
    
    try {
        const response = await fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric`);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        displayWeather(data);
        getForecast(city);
    } catch (error) {
        showError();
    }
}

async function getWeatherByCoords(lat, lon) {
    showLoading();
    
    try {
        const response = await fetch(`${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        displayWeather(data);
        getForecastByCoords(lat, lon);
    } catch (error) {
        showError();
    }
}

async function getForecast(city) {
    try {
        const response = await fetch(`${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error('Forecast error:', error);
    }
}

async function getForecastByCoords(lat, lon) {
    try {
        const response = await fetch(`${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error('Forecast error:', error);
    }
}

function displayWeather(data) {
    hideLoading();
    errorMessage.classList.remove('active');
    weatherContent.classList.add('active');
    
    document.querySelector('.city-name').textContent = data.name;
    document.querySelector('.temp-value').textContent = Math.round(data.main.temp);
    document.querySelector('.weather-description').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${Math.round(data.wind.speed)} km/h`;
    document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    const iconCode = data.weather[0].icon;
    const iconUrl = weatherIcons[iconCode] || weatherIcons['01d'];
    document.getElementById('weather-icon').src = iconUrl;
    
    // Change background based on weather
    updateBackground(data.weather[0].main);
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    
    // Get one forecast per day (noon time)
    const dailyForecasts = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const hour = date.getHours();
        
        // Pick forecast around noon (12:00) for each day
        if (!dailyForecasts[day] || Math.abs(hour - 12) < Math.abs(dailyForecasts[day].hour - 12)) {
            dailyForecasts[day] = {
                ...item,
                hour: hour
            };
        }
    });
    
    // Display next 5 days
    Object.values(dailyForecasts).slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const iconCode = day.weather[0].icon;
        const iconUrl = weatherIcons[iconCode] || weatherIcons['01d'];
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img src="${iconUrl}" alt="${day.weather[0].description}" class="forecast-icon">
            <div class="forecast-temp">${Math.round(day.main.temp)}°</div>
            <div class="forecast-temp-range">${Math.round(day.main.temp_min)}° / ${Math.round(day.main.temp_max)}°</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

function updateBackground(weatherMain) {
    const blobs = document.querySelectorAll('.blob');
    const colors = {
        'Clear': ['#00d4ff', '#9d4edd', '#ff006e'],
        'Clouds': ['#8899a6', '#657786', '#aab8c2'],
        'Rain': ['#1da1f2', '#14171a', '#657786'],
        'Snow': ['#e1e8ed', '#aab8c2', '#f5f8fa'],
        'Thunderstorm': ['#9d4edd', '#ff006e', '#1da1f2'],
        'Drizzle': ['#1da1f2', '#aab8c2', '#e1e8ed'],
        'Mist': ['#aab8c2', '#8899a6', '#657786']
    };
    
    const colorSet = colors[weatherMain] || colors['Clear'];
    
    blobs.forEach((blob, index) => {
        blob.style.background = colorSet[index % colorSet.length];
    });
}

function showError() {
    hideLoading();
    weatherContent.classList.remove('active');
    errorMessage.classList.add('active');
}

function showLoading() {
    loadingSpinner.classList.add('active');
    weatherContent.classList.remove('active');
    errorMessage.classList.remove('active');
}

function hideLoading() {
    loadingSpinner.classList.remove('active');
}

// Initialize with a default city
getWeather('London');