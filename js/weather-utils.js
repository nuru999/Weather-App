/**
 * Weather Utilities Module
 * Helper functions for data transformation and formatting
 */

const WeatherUtils = (() => {
  /**
   * Weather icon mapping
   */
  const WEATHER_ICONS = {
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

  /**
   * Get icon URL for weather code
   * @param {string} code - OpenWeatherMap icon code
   * @returns {string} Icon URL
   */
  const getWeatherIcon = (code) => {
    return WEATHER_ICONS[code] || WEATHER_ICONS['01d'];
  };

  /**
   * Convert Celsius to Fahrenheit
   * @param {number} celsius - Temperature in Celsius
   * @returns {number} Temperature in Fahrenheit
   */
  const celsiusToFahrenheit = (celsius) => {
    return (celsius * 9/5) + 32;
  };

  /**
   * Format temperature based on unit
   * @param {number} temp - Temperature
   * @param {string} unit - 'C' or 'F'
   * @returns {number} Formatted temperature
   */
  const formatTemp = (temp, unit = 'C') => {
    if (unit === 'F') {
      return Math.round(celsiusToFahrenheit(temp));
    }
    return Math.round(temp);
  };

  /**
   * Format date/time
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Formatted date
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Format time
   * @param {number} timestamp - Unix timestamp
   * @returns {string} Formatted time (HH:MM)
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  /**
   * Get weather description
   * @param {string} main - Weather main condition
   * @param {string} description - Weather description
   * @returns {string} Formatted description
   */
  const getWeatherDescription = (main, description) => {
    return description.charAt(0).toUpperCase() + description.slice(1);
  };

  /**
   * Calculate "feels like" adjustment
   * @param {number} temp - Actual temperature
   * @param {number} humidity - Humidity percentage
   * @param {number} windSpeed - Wind speed in m/s
   * @returns {number} Feels-like temperature
   */
  const calculateFeelsLike = (temp, humidity, windSpeed) => {
    // Simplified calculation (API provides this, but fallback available)
    let adjustment = 0;
    
    // Wind chill
    if (temp < 10) {
      adjustment -= windSpeed * 0.5;
    }
    
    // Humidity effect
    if (humidity > 70) {
      adjustment += (humidity - 70) * 0.1;
    }
    
    return temp + adjustment;
  };

  /**
   * Determine weather severity for styling
   * @param {string} condition - Weather condition code
   * @returns {string} Severity level: 'clear', 'cloudy', 'rainy', 'stormy'
   */
  const getWeatherSeverity = (condition) => {
    if (condition.includes('clear') || condition.includes('sunny')) return 'clear';
    if (condition.includes('cloud')) return 'cloudy';
    if (condition.includes('rain') || condition.includes('drizzle')) return 'rainy';
    if (condition.includes('thunder') || condition.includes('storm')) return 'stormy';
    if (condition.includes('snow')) return 'snowy';
    if (condition.includes('mist') || condition.includes('fog')) return 'foggy';
    return 'clear';
  };

  /**
   * Get UV index risk level
   * @param {number} uvIndex - UV index value
   * @returns {string} Risk level: 'low', 'moderate', 'high', 'very-high', 'extreme'
   */
  const getUVRisk = (uvIndex) => {
    if (uvIndex < 3) return 'low';
    if (uvIndex < 6) return 'moderate';
    if (uvIndex < 8) return 'high';
    if (uvIndex < 11) return 'very-high';
    return 'extreme';
  };

  return {
    WEATHER_ICONS,
    getWeatherIcon,
    celsiusToFahrenheit,
    formatTemp,
    formatDate,
    formatTime,
    getWeatherDescription,
    calculateFeelsLike,
    getWeatherSeverity,
    getUVRisk
  };
})();
