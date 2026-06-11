import React, { useState, useEffect } from 'react';
import './App.css';

function ClimaApp() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityInput, setCityInput] = useState('');
  const [locationName, setLocationName] = useState('');

  // 1. FUNCIÓN PRINCIPAL: Obtener clima por coordenadas (Latitud y Longitud)
const fetchWeatherByCoords = async (lat, lon, name = "Tu ubicación") => {
    setLoading(true);
    setError(null);
    try {
      // URL corregida con parámetros limpios
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=true`
      );
      if (!response.ok) throw new Error("No se pudo conectar con el servidor del clima.");
      
      const data = await response.json();
      
      if (!data.current_weather) throw new Error("Datos de clima no disponibles para esta zona.");

      setWeather(data.current_weather);
      setLocationName(name);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. FUNCIÓN: Buscar coordenadas de una ciudad escrita a mano (Geocoding)
  const searchCity = async (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const geocodeRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput)}&count=1&language=es`
      );
      const geocodeData = await geocodeRes.json();

      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error("Ciudad no encontrada. Probá escribiéndola de otra forma.");
      }

      const { latitude, longitude, name, country } = geocodeData.results[0];
      await fetchWeatherByCoords(latitude, longitude, `${name}, ${country}`);
      setCityInput('');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // 3. EFECTO INICIAL: Intentar geolocalizar al usuario apenas abre la app
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // El usuario aceptó el permiso, usamos sus coordenadas exactas
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude, "Tu ubicación actual");
        },
        (err) => {
          console.log("Geolocalización rechazada o fallida, cargando ciudad por defecto.", err);
          // Si rechaza el permiso o falla, cargamos una por defecto (ej: Buenos Aires)
          fetchWeatherByCoords(-34.61315, -58.37723, "Buenos Aires, Argentina");
        },
        { timeout: 10000 }
      );
    } else {
      // Navegador viejo sin geolocalización
      fetchWeatherByCoords(-34.61315, -58.37723, "Buenos Aires, Argentina");
    }
  }, []);

  // 4. FUNCIÓN AUXILIAR: Traducir los códigos de clima de Open-Meteo a texto y emojis
  const getWeatherStatus = (code) => {
    // Códigos estándar WMO (Organización Meteorológica Mundial)
    if (code === 0) return { text: "Despejado", emoji: "☀️", class: "sunny" };
    if ([1, 2, 3].includes(code)) return { text: "Parcialmente Nublado", emoji: "⛅", class: "cloudy" };
    if ([45, 48].includes(code)) return { text: "Niebla", emoji: "🌫️", class: "cloudy" };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { text: "Lluvia", emoji: "🌧️", class: "rainy" };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: "Nieve", emoji: "❄️", class: "snowy" };
    if ([95, 96, 99].includes(code)) return { text: "Tormenta", emoji: "⛈️", class: "stormy" };
    return { text: "Desconocido", emoji: "🌍", class: "sunny" };
  };

  const status = weather ? getWeatherStatus(weather.weathercode) : { text: "", emoji: "", class: "sunny" };

  return (
    <div className={`weather-app ${status.class}`}>
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
              <span className="emoji-display">{status.emoji}</span>
              <span className="temperature">{Math.round(weather.temperature)}°C</span>
            </div>
            <p className="status-text">{status.text}</p>
            <div className="weather-details">
              <div>💨 Viento: {weather.windspeed} km/h</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClimaApp;