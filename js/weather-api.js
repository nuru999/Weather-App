/**
 * Weather API Module
 * Handles all API calls to OpenWeatherMap
 */

const WeatherAPI = (() => {
  const API_KEY = 'dc0c35edbf982768ac67930df6f7f91b';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  /**
   * Fetch current weather by city name
   * @param {string} city - City name
   * @returns {Promise<object>} Weather data
   */
  const getCurrentWeather = async (city) => {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found');
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Weather API error:', error);
      throw error;
    }
  };

  /**
   * Fetch weather by coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<object>} Weather data
   */
  const getWeatherByCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Geo-weather API error:', error);
      throw error;
    }
  };

  /**
   * Fetch 5-day forecast
   * @param {string} city - City name
   * @returns {Promise<object>} Forecast data
   */
  const getForecast = async (city) => {
    try {
      const response = await fetch(
        `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Forecast API error:', error);
      throw error;
    }
  };

  /**
   * Get user's current location weather
   * @returns {Promise<object>} Weather data for user's location
   */
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await getWeatherByCoords(
              position.coords.latitude,
              position.coords.longitude
            );
            resolve(data);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(new Error('Location access denied'));
        }
      );
    });
  };

  return {
    getCurrentWeather,
    getWeatherByCoords,
    getForecast,
    getCurrentLocation
  };
})();
