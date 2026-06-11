import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityInput, setCityInput] = useState('');
  const [locationName, setLocationName] = useState('');

  // Clave pública de respaldo para WeatherAPI
  const API_KEY = "69c737976e1948dfbfb130008242205";

  // 1. FUNCIÓN PRINCIPAL: Buscar clima por texto (Ciudad) o Coordenadas
  const fetchWeather = async (query, isCoords = false) => {
    setLoading(true);
    setError(null);
    try {
      // WeatherAPI acepta tanto "Latitud,Longitud" como "Nombre de ciudad" en el mismo parámetro 'q'
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${query}&lang=es`
      );
      
      if (!response.ok) throw new Error("No se pudo obtener el clima de este lugar.");
      
      const data = await response.json();
      
      setWeather({
        temp: data.current.temp_c,
        conditionText: data.current.condition.text,
        icon: data.current.condition.icon,
        wind: data.current.wind_kph,
        code: data.current.condition.code
      });
      
      setLocationName(`${data.location.name}, ${data.location.country}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. FUNCIÓN: Manejar el buscador manual
  const searchCity = (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    fetchWeather(cityInput);
    setCityInput('');
  };

  // 3. EFECTO INICIAL: Intentar geolocalizar al usuario
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(`${latitude},${longitude}`, true);
        },
        (err) => {
          console.log("Geolocalización rechazada o lenta, cargando Buenos Aires por defecto.");
          fetchWeather("Buenos Aires");
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeather("Buenos Aires");
    }
  }, []);

  // 4. FUNCIÓN AUXILIAR: Asignar clase de diseño según el clima
  const getWeatherClass = (code) => {
    if (!code) return 'sunny';
    // Códigos de WeatherAPI
    if (code === 1000) return 'sunny';
    if ([1003, 1006, 1009].includes(code)) return 'cloudy';
    if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return 'rainy';
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'stormy';
    return 'sunny';
  };

  // CORRECCIÓN CLAVE: Protección segura si weather es null al arrancar
  const bgClass = weather && weather.code ? getWeatherClass(weather.code) : 'sunny';

  return (
    <div className={`weather-app ${bgClass}`}>
      <div className="weather-container">
        <h2>🌦️ Clima Inteligente</h2>

        <form onSubmit={searchCity} className="search-form">
          <input
            type="text"
            placeholder="Buscar otra ciudad... (ej: Madrid)"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        {loading && <div className="spinner">Cargando datos del cielo... 🌍</div>}

        {error && <div className="error-message">⚠️ {error}</div>}

        {!loading && weather && (
          <div className="weather-info">
            <h3 className="location">{locationName}</h3>
            <div className="weather-main">
              <img src={weather.icon} alt={weather.conditionText} className="weather-icon" />
              <span className="temperature">{Math.round(weather.temp)}°C</span>
            </div>
            <p className="status-text">{weather.conditionText}</p>
            <div className="weather-details">
              <div>💨 Viento: {weather.wind} km/h</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;