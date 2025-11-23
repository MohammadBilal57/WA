import React, { useEffect, useState, useRef } from 'react';
import { Search, MapPin, Wind, Droplets, Eye, Gauge, Sunrise, Sunset, Cloud, Thermometer, AlertCircle, X } from 'lucide-react';
import * as THREE from 'three';

function Weather() {
  const inputRef = useRef();
  const canvasRef = useRef();
  const sceneRef = useRef();
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // Popular cities for suggestions
  const popularCities = [
    // Your Original Cities
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Dubai', 'London', 
    'New York', 'Paris', 'Tokyo', 'Sydney', 'Mumbai',

    // Major Cities in Pakistan
    'Hyderabad', 'Gujranwala', 'Sialkot', 'Sargodha', 'Bahawalpur',
    'Sukkur', 'Larkana', 'Sheikhupura', 'Mirpur Khas', 'Gujrat',

    // Major Cities in Middle East & Gulf
    'Abu Dhabi', 'Riyadh', 'Jeddah', 'Doha', 'Manama',
    'Muscat', 'Kuwait City', 'Istanbul', 'Cairo', 'Beirut',

    // Major Cities in Europe
    'Berlin', 'Madrid', 'Barcelona', 'Rome', 'Milan',
    'Amsterdam', 'Brussels', 'Vienna', 'Prague', 'Lisbon',
    'Manchester', 'Birmingham', 'Edinburgh', 'Dublin', 'Copenhagen',
    'Stockholm',

    // Major Cities in North America
    'Los Angeles', 'Chicago', 'Toronto', 'Vancouver', 'Montreal',
    'Houston', 'Miami', 'San Francisco', 'Washington D.C.', 'Boston',
    'Mexico City',

    // Major Cities in Asia & Australia
    'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Bangkok',
    'Singapore', 'Hong Kong', 'Shanghai', 'Beijing', 'Seoul',
    'Manila', 'Jakarta', 'Kuala Lumpur', 'Melbourne', 'Auckland',

    // Major Cities in Africa
    'Johannesburg', 'Cape Town', 'Nairobi', 'Lagos', 'Casablanca'
];

  // Three.js Animation Setup
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true 
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create floating orbs
    const orbs = [];
    const orbGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    
    for (let i = 0; i < 8; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + i * 0.05, 0.7, 0.6),
        transparent: true,
        opacity: 0.3
      });
      const orb = new THREE.Mesh(orbGeometry, material);
      orb.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4
      );
      orbs.push(orb);
      scene.add(orb);
    }

    sceneRef.current = { scene, camera, renderer, particlesMesh, orbs };

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      particlesMesh.rotation.y += 0.0003;
      particlesMesh.rotation.x += 0.0001;

      orbs.forEach((orb, i) => {
        orb.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001;
        orb.position.x += Math.cos(Date.now() * 0.001 + i) * 0.001;
        orb.rotation.x += 0.01;
        orb.rotation.y += 0.01;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []);

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '☀️';
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length > 0) {
      const filtered = popularCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addToRecentSearches = (city) => {
    const updated = [city, ...recentSearches.filter(c => c !== city)].slice(0, 5);
    setRecentSearches(updated);
  };

  const search = async (city) => {
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      const apiKey = '771fca26e3299effc4d20b250e71c694';
      
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
      const currentResponse = await fetch(currentUrl);
      const currentData = await currentResponse.json();

      if (currentData.cod === '404') {
        setError(`City "${city}" not found. Please check spelling and try again.`);
        setLoading(false);
        return;
      }

      if (currentData.cod !== 200) {
        setError('Unable to fetch weather data. Please try again.');
        setLoading(false);
        return;
      }

      addToRecentSearches(currentData.name);

      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();

      const hourly = forecastData.list.slice(0, 8).map(item => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        temp: Math.round(item.main.temp),
        icon: getWeatherIcon(item.weather[0].icon)
      }));

      const daily = [];
      const seenDates = new Set();
      forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!seenDates.has(date) && seenDates.size < 5) {
          seenDates.add(date);
          daily.push({
            day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            icon: getWeatherIcon(item.weather[0].icon),
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            description: item.weather[0].description
          });
        }
      });

      setWeatherData({
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        location: currentData.name,
        country: currentData.sys.country,
        description: currentData.weather[0].description,
        icon: getWeatherIcon(currentData.weather[0].icon),
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        pressure: currentData.main.pressure,
        visibility: (currentData.visibility / 1000).toFixed(1),
        sunrise: new Date(currentData.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        sunset: new Date(currentData.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        clouds: currentData.clouds.all
      });

      setHourlyForecast(hourly);
      setForecast(daily);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search('Karachi');
  }, []);

  const handleSearch = () => {
    if (inputRef.current.value) {
      search(inputRef.current.value);
    }
  };

  const handleSuggestionClick = (city) => {
    inputRef.current.value = city;
    search(city);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading && !weatherData) {
    return (
      <div style={styles.loadingContainer}>
        <canvas ref={canvasRef} style={styles.canvas} />
        <div style={styles.loadingContent}>
          <div style={styles.loadingSpinner}>
            <div style={styles.spinner}></div>
          </div>
          <div style={styles.loadingText}>Loading Weather Data...</div>
          <div style={styles.loadingSubtext}>Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />
      
      <div style={styles.content}>
        {/* Search Bar */}
        <div style={styles.searchCard} className="weather-card">
          <div style={styles.searchWrapper}>
            <div style={{...styles.searchInput, position: 'relative', flex: 1}}>
              <Search style={styles.searchIcon} size={20} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for a city..."
                style={styles.input}
                onKeyPress={handleKeyPress}
                onChange={handleInputChange}
                onFocus={handleInputChange}
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div style={styles.suggestionsDropdown}>
                  {searchSuggestions.map((city, index) => (
                    <div
                      key={index}
                      style={styles.suggestionItem}
                      onClick={() => handleSuggestionClick(city)}
                      className="suggestion-item"
                    >
                      <MapPin size={16} style={{color: 'rgba(255,255,255,0.6)'}} />
                      <span>{city}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleSearch} style={styles.searchButton}>
              Search
            </button>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div style={styles.recentSearches}>
              <div style={styles.recentLabel}>Recent:</div>
              <div style={styles.recentChips}>
                {recentSearches.map((city, index) => (
                  <button
                    key={index}
                    style={styles.recentChip}
                    onClick={() => handleSuggestionClick(city)}
                    className="recent-chip"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorCard} className="weather-card">
            <AlertCircle style={styles.errorIcon} size={24} />
            <div>
              <div style={styles.errorTitle}>Oops!</div>
              <div style={styles.errorMessage}>{error}</div>
            </div>
            <button style={styles.closeError} onClick={() => setError(null)}>
              <X size={20} />
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && weatherData && (
          <div style={styles.loadingOverlay}>
            <div style={styles.loadingSpinnerSmall}>
              <div style={styles.spinnerSmall}></div>
            </div>
          </div>
        )}

        {weatherData && !error && (
          <>
            {/* Main Weather Card */}
            <div style={styles.mainCard} className="weather-card">
              <div style={styles.locationHeader}>
                <MapPin style={styles.locationIcon} size={20} />
                <h1 style={styles.locationText}>
                  {weatherData.location}, {weatherData.country}
                </h1>
              </div>
              
              <div style={styles.mainWeather}>
                <div style={styles.tempDisplay}>
                  <div style={styles.weatherIcon}>{weatherData.icon}</div>
                  <div>
                    <div style={styles.tempLarge}>{weatherData.temp}°</div>
                    <div style={styles.description}>{weatherData.description}</div>
                    <div style={styles.feelsLike}>Feels like {weatherData.feelsLike}°</div>
                  </div>
                </div>
              </div>

              {/* Hourly Forecast */}
              <div style={styles.hourlySection}>
                <h2 style={styles.sectionTitle}>Hourly Forecast</h2>
                <div style={styles.hourlyScroll}>
                  {hourlyForecast.map((hour, index) => (
                    <div key={index} style={styles.hourlyCard} className="hourly-item">
                      <div style={styles.hourlyTime}>{hour.time}</div>
                      <div style={styles.hourlyIcon}>{hour.icon}</div>
                      <div style={styles.hourlyTemp}>{hour.temp}°</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div style={styles.detailsGrid}>
              <div style={styles.detailCard} className="weather-card">
                <div style={styles.detailHeader}>
                  <Wind style={styles.detailIcon} size={20} />
                  <span style={styles.detailLabel}>Wind Speed</span>
                </div>
                <div style={styles.detailValue}>{weatherData.windSpeed}</div>
                <div style={styles.detailUnit}>km/h</div>
              </div>

              <div style={styles.detailCard} className="weather-card">
                <div style={styles.detailHeader}>
                  <Droplets style={styles.detailIcon} size={20} />
                  <span style={styles.detailLabel}>Humidity</span>
                </div>
                <div style={styles.detailValue}>{weatherData.humidity}</div>
                <div style={styles.detailUnit}>%</div>
              </div>

              <div style={styles.detailCard} className="weather-card">
                <div style={styles.detailHeader}>
                  <Eye style={styles.detailIcon} size={20} />
                  <span style={styles.detailLabel}>Visibility</span>
                </div>
                <div style={styles.detailValue}>{weatherData.visibility}</div>
                <div style={styles.detailUnit}>km</div>
              </div>

              <div style={styles.detailCard} className="weather-card">
                <div style={styles.detailHeader}>
                  <Gauge style={styles.detailIcon} size={20} />
                  <span style={styles.detailLabel}>Pressure</span>
                </div>
                <div style={styles.detailValue}>{weatherData.pressure}</div>
                <div style={styles.detailUnit}>hPa</div>
              </div>

              <div style={styles.detailCard} className="weather-card">
                <div style={styles.detailHeader}>
                  <Sunrise style={styles.detailIcon} size={20} />
                  <span style={styles.detailLabel}>Sunrise</span>
                </div>
                <div style={styles.detailValueSmall}>{weatherData.sunrise}</div>
              </div>

              <div style={styles.detailCard} className="weather-card">
                <div style={styles.detailHeader}>
                  <Sunset style={styles.detailIcon} size={20} />
                  <span style={styles.detailLabel}>Sunset</span>
                </div>
                <div style={styles.detailValueSmall}>{weatherData.sunset}</div>
              </div>

              <div style={styles.detailCard} className="weather-card">
                <div style={styles.detailHeader}>
                  <Cloud style={styles.detailIcon} size={20} />
                  <span style={styles.detailLabel}>Cloudiness</span>
                </div>
                <div style={styles.detailValue}>{weatherData.clouds}</div>
                <div style={styles.detailUnit}>%</div>
              </div>

              <div style={styles.detailCard} className="weather-card">
                <div style={styles.detailHeader}>
                  <Thermometer style={styles.detailIcon} size={20} />
                  <span style={styles.detailLabel}>Feels Like</span>
                </div>
                <div style={styles.detailValue}>{weatherData.feelsLike}°</div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div style={styles.forecastCard} className="weather-card">
              <h2 style={styles.sectionTitle}>5-Day Forecast</h2>
              <div style={styles.forecastList}>
                {forecast.map((day, index) => (
                  <div key={index} style={styles.forecastItem} className="forecast-row">
                    <div style={styles.forecastDay}>{day.day}</div>
                    <div style={styles.forecastMiddle}>
                      <div style={styles.forecastIcon}>{day.icon}</div>
                      <div style={styles.forecastDesc}>{day.description}</div>
                    </div>
                    <div style={styles.forecastTemps}>
                      <span style={styles.forecastHigh}>{day.high}°</span>
                      <span style={styles.forecastLow}>{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        .weather-card {
          animation: fadeInUp 0.6s ease-out;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .weather-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .hourly-item {
          animation: slideIn 0.5s ease-out;
          transition: transform 0.3s ease, background-color 0.3s ease;
        }

        .hourly-item:hover {
          transform: scale(1.05);
          background-color: rgba(255, 255, 255, 0.25);
        }

        .forecast-row {
          animation: fadeIn 0.5s ease-out;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .forecast-row:hover {
          background-color: rgba(255, 255, 255, 0.25);
          transform: translateX(5px);
        }

        .suggestion-item {
          transition: background-color 0.2s ease;
        }

        .suggestion-item:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }

        .recent-chip {
          transition: all 0.2s ease;
        }

        .recent-chip:hover {
          background-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        input:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    overflow: 'auto'
  },
  canvas: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0
  },
  content: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 16px'
  },
  loadingContainer: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  loadingContent: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center'
  },
  loadingSpinner: {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'center'
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: 'white',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
    animation: 'pulse 2s ease-in-out infinite'
  },
  loadingSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '16px'
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(102, 126, 234, 0.5)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  loadingSpinnerSmall: {
    display: 'flex',
    justifyContent: 'center'
  },
  spinnerSmall: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  searchCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  searchWrapper: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.25)',
    borderRadius: '16px',
    padding: '16px 20px',
    minWidth: '200px'
  },
  searchIcon: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: '12px'
  },
  input: {
    flex: '1',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '16px'
  },
  searchButton: {
    background: 'rgba(255, 255, 255, 0.25)',
    border: 'none',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '8px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    zIndex: 10
  },
  suggestionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    cursor: 'pointer',
    color: '#667eea',
    fontSize: '15px',
    fontWeight: '500'
  },
  recentSearches: {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  recentLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    fontWeight: '500'
  },
  recentChips: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  recentChip: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  errorCard: {
    background: 'rgba(255, 59, 48, 0.2)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid rgba(255, 59, 48, 0.4)'
  },
  errorIcon: {
    color: '#ff3b30',
    flexShrink: 0
  },
  errorTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '4px'
  },
  errorMessage: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '14px'
  },
  closeError: {
    marginLeft: 'auto',
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'background 0.2s'
  },
  mainCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  locationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px'
  },
  locationIcon: {
    color: 'white'
  },
  locationText: {
    color: 'white',
    fontSize: '24px',
    fontWeight: '600',
    margin: 0
  },
  mainWeather: {
    marginBottom: '32px'
  },
  tempDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  weatherIcon: {
    fontSize: '96px'
  },
  tempLarge: {
    fontSize: '72px',
    fontWeight: '700',
    color: 'white',
    lineHeight: '1'
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '20px',
    textTransform: 'capitalize',
    marginTop: '8px'
  },
  feelsLike: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '16px',
    marginTop: '4px'
  },
  hourlySection: {
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    paddingTop: '24px'
  },
  sectionTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    margin: '0 0 16px 0'
  },
  hourlyScroll: {
    display: 'flex',
    gap: '16px',
    overflowX: 'auto',
    paddingBottom: '8px'
  },
  hourlyCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '80px',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  hourlyTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    marginBottom: '8px'
  },
  hourlyIcon: {
    fontSize: '32px',
    margin: '8px 0'
  },
  hourlyTemp: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  detailCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  detailIcon: {
    color: 'rgba(255, 255, 255, 0.8)'
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px'
  },
  detailValue: {
    color: 'white',
    fontSize: '36px',
    fontWeight: '700',
    lineHeight: '1.2'
  },
  detailValueSmall: {
    color: 'white',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '1.2'
  },
  detailUnit: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    marginTop: '4px'
  },
  forecastCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  forecastList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  forecastItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.15)'
  },
  forecastDay: {
    color: 'white',
    fontWeight: '600',
    width: '70px',
    fontSize: '16px'
  },
  forecastMiddle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: '1'
  },
  forecastIcon: {
    fontSize: '32px'
  },
  forecastDesc: {
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
    fontSize: '14px'
  },
  forecastTemps: {
    display: 'flex',
    gap: '16px',
    color: 'white',
    fontSize: '16px'
  },
  forecastHigh: {
    fontWeight: '600'
  },
  forecastLow: {
    color: 'rgba(255, 255, 255, 0.6)'
  }
};

export default Weather;