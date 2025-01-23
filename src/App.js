import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiChevronLeft,
  FiChevronRight,
  FiSun,
  FiCloud,
  FiCloudRain,
  FiCloudSnow,
  FiCloudLightning,
  FiDroplet,
  FiWind,
  FiMoon
} from 'react-icons/fi';
import './App.css';

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const API_KEY = process.env.REACT_APP_API_KEY;

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // LocalStorage'dan tema yükleme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Hava durumu konfigürasyonu
  const weatherConfig = {
    Clear: { icon: <FiSun />, label: 'Sunny' },
    Clouds: { icon: <FiCloud />, label: 'Cloudy' },
    Rain: { icon: <FiCloudRain />, label: 'Rainy' },
    Snow: { icon: <FiCloudSnow />, label: 'Snowy' },
    Thunderstorm: { icon: <FiCloudLightning />, label: 'Stormy' },
  };

  // Hava durumu verilerini çekme
  const fetchWeatherData = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );
      const processedData = processForecastData(response.data.list);
      setWeatherData(processedData);
      setCurrentDayIndex(0);
    } catch (error) {
      console.error("Error:", error);
      alert('City not found!');
    }
  };

  // Veri işleme fonksiyonu
  const processForecastData = (list) => {
    const today = new Date().toISOString().split('T')[0];
    const groupedData = {};

    list.forEach((item) => {
      const date = item.dt_txt.split(' ')[0];
      const itemDate = new Date(item.dt * 1000);
      const itemHour = itemDate.getHours();
      const isToday = date === today;

      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          isToday,
          current: isToday ? Math.round(item.main.temp) : null,
          humidity: item.main.humidity,
          wind: item.wind.speed,
          condition: item.weather[0].main,
          morning: !isToday ? Math.round(item.main.temp) : null,
          evening: !isToday ? Math.round(item.main.temp) : null
        };
      }

      if (!isToday) {
        if (itemHour >= 6 && itemHour <= 10) groupedData[date].morning = Math.round(item.main.temp);
        if (itemHour >= 18 && itemHour <= 22) groupedData[date].evening = Math.round(item.main.temp);
      }
    });

    return Object.values(groupedData);
  };

  // Tarih formatlama
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })
    };
  };

  return (
    <div className="container">
      {/* Tema değiştirme butonu */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkMode ? <FiSun /> : <FiMoon />}
      </button>

      {/* Arama çubuğu */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchWeatherData()}
        />
        <button onClick={fetchWeatherData}>Search</button>
      </div>

      {/* Hava durumu kartı */}
      {weatherData && (
        <div className="weather-card-container">
          <button
            className="nav-button left"
            onClick={() => setCurrentDayIndex(prev => Math.max(prev - 1, 0))}
            disabled={currentDayIndex === 0}
          >
            <FiChevronLeft />
          </button>

          <div className="weather-card">
            <div className="card-header">
              <div className="header-content">
                <h2>{formatDate(weatherData[currentDayIndex].date).weekday}</h2>
                <p>{formatDate(weatherData[currentDayIndex].date).date}</p>
                <div className="current-condition">
                  {weatherConfig[weatherData[currentDayIndex].condition]?.icon}
                  <span>{weatherConfig[weatherData[currentDayIndex].condition]?.label}</span>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="time-slots">
                {!weatherData[currentDayIndex].isToday ? (
                  <>
                    <div className="time-slot">
                      <div className="slot-content">
                        <div className="weather-icon">
                          {weatherConfig[weatherData[currentDayIndex].condition]?.icon}
                        </div>
                        <span className="time-label">Morning</span>
                        <span className="temperature">
                          {weatherData[currentDayIndex].morning}°C
                        </span>
                      </div>
                    </div>
                    <div className="time-slot">
                      <div className="slot-content">
                        <div className="weather-icon">
                          {weatherConfig[weatherData[currentDayIndex].condition]?.icon}
                        </div>
                        <span className="time-label">Evening</span>
                        <span className="temperature">
                          {weatherData[currentDayIndex].evening}°C
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="time-slot current">
                    <div className="slot-content">
                      <div className="weather-icon">
                        {weatherConfig[weatherData[currentDayIndex].condition]?.icon}
                      </div>
                      <span className="time-label">Current</span>
                      <span className="temperature">
                        {weatherData[currentDayIndex].current}°C
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="weather-stats">
                <div className="stat-item">
                  <FiDroplet className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{weatherData[currentDayIndex].humidity}% </span>
                    <span className="stat-label">Humidity</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FiWind className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{weatherData[currentDayIndex].wind} </span>
                    <span className="stat-label">Wind (m/s)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            className="nav-button right"
            onClick={() => setCurrentDayIndex(prev => Math.min(prev + 1, weatherData.length - 1))}
            disabled={currentDayIndex === weatherData.length - 1}
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;