import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false); // Arranca en false para que no congele
  const [error, setError] = useState(null);
  const [cityInput, setCityInput] = useState('');
  const [locationName, setLocationName] = useState('');

  const API_KEY = "69c737976e1948dfbfb130008242205";

  // FUNCIÓN CENTRAL: Recibe el texto directo que queremos buscar ("Madrid", "Buenos Aires" o "lat,lon")
  const buscarClimaDelLugar = async (lugar) => {
    if (!lugar) return;
    setLoading(true);
    setError(null);
    
    try {
      const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(lugar)}&lang=es`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("No pudimos encontrar ese lugar. Probá escribiendo otra ciudad.");
      }
      
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

  // Manejador del Formulario (El botón Buscar)
  const manejarBuscador = (e) => {
    e.preventDefault();
    if (cityInput.trim() === '') return;
    buscarClimaDelLugar(cityInput);
    setCityInput(''); // Limpia el cuadro de texto
  };

  // Al arrancar la app por primera vez
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          buscarClimaDelLugar(`${latitude},${longitude}`);
        },
        (err) => {
          // Si el usuario rechaza el GPS, cargamos Buenos Aires de una
          buscarClimaDelLugar("Buenos Aires");
        },
        { timeout: 5000 }
      );
    } else {
      buscarClimaDelLugar("Buenos Aires");
    }
  }, []);

  // Cambiador de fondos de clima
  const getWeatherClass = (code) => {
    if (!code) return 'sunny';
    if (code === 1000) return 'sunny';
    if ([1003, 1006, 1009].includes(code)) return 'cloudy';
    if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return 'rainy';
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'stormy';
    return 'sunny';
  };

  const bgClass = weather && weather.code ? getWeatherClass(weather.code) : 'sunny';

  return (
    <div className={`weather-app ${bgClass}`}>
      <div className="weather-container">
        <h2>🌦️ Clima Inteligente</h2>

        {/* Formulario conectado a manejarBuscador */}
        <form onSubmit={manejarBuscador} className="search-form">
          <input
            type="text"
            placeholder="Buscar otra ciudad... (ej: Madrid)"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        {loading && <div className="spinner">Buscando en el mapa... 🌍</div>}

        {error && <div className="error-message">⚠️ {error}</div>}

        {/* Solo se muestra si NO está cargando y hay datos de clima */}
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