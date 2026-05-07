/**
 * Weather UI Module
 * Handles all DOM manipulation and UI updates
 */

const WeatherUI = (() => {
  // DOM Elements
  const elements = {
    searchInput: null,
    searchBtn: null,
    locationBtn: null,
    unitToggle: null,
    errorMessage: null,
    errorText: null,
    weatherContent: null,
    loadingSpinner: null,
    recentSearchesContainer: null,
    tempElement: null,
    tempUnitElement: null
  };

  // Current state
  let currentUnit = 'C';
  let currentWeatherData = null;
  let isFetching = false;

  /**
   * Initialize UI module
   */
  const init = () => {
    // Get DOM elements
    elements.searchInput = document.querySelector('.search-input');
    elements.searchBtn = document.querySelector('.search-btn');
    elements.locationBtn = document.querySelector('.location-btn');
    elements.unitToggle = document.querySelector('.unit-toggle');
    elements.errorMessage = document.querySelector('.error-message');
    elements.errorText = document.getElementById('error-text');
    elements.weatherContent = document.querySelector('.weather-content');
    elements.loadingSpinner = document.querySelector('.loading-spinner');
    elements.recentSearchesContainer = document.getElementById('recent-searches');
    elements.tempElement = document.querySelector('.temp-value');
    elements.tempUnitElement = document.querySelector('.temp-unit');

    if (!validateElements()) {
      console.error('Failed to initialize UI: Missing required elements');
      return false;
    }

    loadRecentSearches();
    return true;
  };

  /**
   * Validate that all required elements exist
   */
  const validateElements = () => {
    return Object.values(elements).every(el => el !== null);
  };

  /**
   * Show loading state
   */
  const showLoading = () => {
    isFetching = true;
    elements.loadingSpinner.style.display = 'flex';
    elements.weatherContent.style.opacity = '0.5';
    hideError();
  };

  /**
   * Hide loading state
   */
  const hideLoading = () => {
    isFetching = false;
    elements.loadingSpinner.style.display = 'none';
    elements.weatherContent.style.opacity = '1';
  };

  /**
   * Show error message
   * @param {string} message - Error message
   */
  const showError = (message) => {
    elements.errorText.textContent = message;
    elements.errorMessage.style.display = 'block';
  };

  /**
   * Hide error message
   */
  const hideError = () => {
    elements.errorMessage.style.display = 'none';
  };

  /**
   * Debounce function for search
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  /**
   * Update weather display
   * @param {object} data - Weather data from API
   */
  const updateWeatherDisplay = (data) => {
    try {
      currentWeatherData = data;

      const temp = WeatherUtils.formatTemp(data.main.temp, currentUnit);
      const feelsLike = WeatherUtils.formatTemp(data.main.feels_like, currentUnit);
      const location = `${data.name}, ${data.sys.country}`;
      const condition = data.weather[0].main;
      const description = WeatherUtils.getWeatherDescription(
        data.weather[0].main,
        data.weather[0].description
      );
      const icon = WeatherUtils.getWeatherIcon(data.weather[0].icon);

      // Update main temperature display
      elements.tempElement.textContent = temp;
      elements.tempUnitElement.textContent = currentUnit === 'C' ? '°C' : '°F';

      // Update weather info
      document.querySelector('.location-name').textContent = location;
      document.querySelector('.weather-condition').textContent = condition;
      document.querySelector('.weather-description').textContent = description;
      document.querySelector('.weather-icon').src = icon;
      document.querySelector('.feels-like').textContent = `Feels like ${feelsLike}°`;

      // Update weather details
      document.querySelector('.humidity-value').textContent = `${data.main.humidity}%`;
      document.querySelector('.pressure-value').textContent = `${data.main.pressure} hPa`;
      document.querySelector('.wind-speed').textContent = `${data.wind.speed} m/s`;
      document.querySelector('.visibility-value').textContent = `${(data.visibility / 1000).toFixed(1)} km`;

      hideError();
      addToRecentSearches(data.name);
    } catch (error) {
      console.error('Error updating display:', error);
      showError('Failed to update weather display');
    }
  };

  /**
   * Toggle temperature unit
   */
  const toggleUnit = () => {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';

    if (currentWeatherData) {
      const temp = WeatherUtils.formatTemp(currentWeatherData.main.temp, currentUnit);
      const feelsLike = WeatherUtils.formatTemp(
        currentWeatherData.main.feels_like,
        currentUnit
      );

      elements.tempElement.textContent = temp;
      elements.tempUnitElement.textContent = currentUnit === 'C' ? '°C' : '°F';
      document.querySelector('.feels-like').textContent = `Feels like ${feelsLike}°`;
    }

    elements.unitToggle.textContent = `Switch to ${currentUnit === 'C' ? 'F' : 'C'}°`;
  };

  /**
   * Add search to recent searches
   * @param {string} city - City name
   */
  const addToRecentSearches = (city) => {
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

    if (!searches.includes(city)) {
      searches.unshift(city);
      if (searches.length > 5) searches.pop();
      localStorage.setItem('recentSearches', JSON.stringify(searches));
      loadRecentSearches();
    }
  };

  /**
   * Load and display recent searches
   */
  const loadRecentSearches = () => {
    try {
      const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      elements.recentSearchesContainer.innerHTML = '';

      searches.forEach(city => {
        const button = document.createElement('button');
        button.className = 'recent-search-btn';
        button.textContent = city;
        button.addEventListener('click', () => {
          elements.searchInput.value = city;
          searchWeather();
        });
        elements.recentSearchesContainer.appendChild(button);
      });
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  /**
   * Search weather (to be called from main script)
   */
  const searchWeather = async () => {
    const city = elements.searchInput.value.trim();

    if (!city) {
      showError('Please enter a city name');
      return;
    }

    if (isFetching) return;

    showLoading();

    try {
      const data = await WeatherAPI.getCurrentWeather(city);
      updateWeatherDisplay(data);
    } catch (error) {
      showError(error.message || 'Failed to fetch weather');
    } finally {
      hideLoading();
    }
  };

  /**
   * Get user's location weather
   */
  const getLocationWeather = async () => {
    if (isFetching) return;

    showLoading();

    try {
      const data = await WeatherAPI.getCurrentLocation();
      updateWeatherDisplay(data);
    } catch (error) {
      showError(error.message || 'Failed to get location weather');
    } finally {
      hideLoading();
    }
  };

  /**
   * Get search input value
   */
  const getSearchInput = () => elements.searchInput.value;

  /**
   * Set search input value
   */
  const setSearchInput = (value) => {
    elements.searchInput.value = value;
  };

  /**
   * Get current unit
   */
  const getUnit = () => currentUnit;

  return {
    init,
    showLoading,
    hideLoading,
    showError,
    hideError,
    debounce,
    updateWeatherDisplay,
    toggleUnit,
    addToRecentSearches,
    loadRecentSearches,
    searchWeather,
    getLocationWeather,
    getSearchInput,
    setSearchInput,
    getUnit
  };
})();
