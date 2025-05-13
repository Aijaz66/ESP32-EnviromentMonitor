import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { RefreshCw, ThermometerIcon, Droplets, Clock, Menu, X, Home, BarChart2, Settings, Info, MapPin, Sun, Moon, Upload } from "lucide-react";
import OtaUploader from "./OtaUploader"; // Import the OTA uploader component

function WeatherDataDisplay() {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("Smart Home");
  const [otaUploaderOpen, setOtaUploaderOpen] = useState(false); // New state for OTA uploader

  // Function to fetch weather data from the backend
  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      console.log("Fetching data from backend...");
      const response = await axios.get("https://esp-32-enviroment-monitor-backend1.vercel.app/sensor-data");
      console.log("Data fetched:", response.data);
      // Limit the data to only the six most recent records
      setWeatherData(response.data.slice(0, 6));
    } catch (error) {
      console.error("Error fetching weather data:", error);
      // Set some mock data if the API fails
      setWeatherData([
        { id: 1, temperature: 23.4, humidity: 45, timestamp: new Date().toLocaleString() },
        { id: 2, temperature: 22.8, humidity: 47, timestamp: new Date(Date.now() - 3600000).toLocaleString() },
        { id: 3, temperature: 22.5, humidity: 48, timestamp: new Date(Date.now() - 7200000).toLocaleString() },
        { id: 4, temperature: 21.9, humidity: 50, timestamp: new Date(Date.now() - 10800000).toLocaleString() },
        { id: 5, temperature: 21.5, humidity: 52, timestamp: new Date(Date.now() - 14400000).toLocaleString() },
        { id: 6, temperature: 21.2, humidity: 53, timestamp: new Date(Date.now() - 18000000).toLocaleString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(fetchWeatherData, 300000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Function for a subtle card background gradient from a preset palette
  const getBgGradient = (index) => {
    if (darkMode) {
      const gradients = [
        "bg-gradient-to-r from-gray-800 to-gray-700",
        "bg-gradient-to-r from-gray-900 to-blue-900",
        "bg-gradient-to-r from-gray-900 to-purple-900",
        "bg-gradient-to-r from-gray-900 to-green-900",
        "bg-gradient-to-r from-gray-900 to-red-900",
        "bg-gradient-to-r from-gray-800 to-indigo-900",
      ];
      return gradients[index % gradients.length];
    } else {
      const gradients = [
        "bg-gradient-to-r from-green-50 to-blue-50",
        "bg-gradient-to-r from-purple-50 to-pink-50",
        "bg-gradient-to-r from-yellow-50 to-orange-50",
        "bg-gradient-to-r from-teal-50 to-green-50",
        "bg-gradient-to-r from-indigo-50 to-purple-50",
        "bg-gradient-to-r from-red-50 to-pink-50",
      ];
      return gradients[index % gradients.length];
    }
  };

  // Calculate average temperature and humidity
  const getAverageData = () => {
    if (weatherData.length === 0) return { temperature: "N/A", humidity: "N/A" };
    
    const totalTemp = weatherData.reduce((sum, data) => sum + data.temperature, 0);
    const totalHumidity = weatherData.reduce((sum, data) => sum + data.humidity, 0);
    
    return {
      temperature: (totalTemp / weatherData.length).toFixed(1),
      humidity: (totalHumidity / weatherData.length).toFixed(0)
    };
  };

  // Get temperature trend (rising, falling, or stable)
  const getTemperatureTrend = () => {
    if (weatherData.length < 2) return "stable";
    
    const newest = weatherData[0].temperature;
    const oldest = weatherData[weatherData.length - 1].temperature;
    
    const difference = newest - oldest;
    if (difference > 1) return "rising";
    if (difference < -1) return "falling";
    return "stable";
  };

  const getTrendColor = () => {
    const trend = getTemperatureTrend();
    if (darkMode) {
      if (trend === "rising") return "text-red-400";
      if (trend === "falling") return "text-blue-400";
      return "text-gray-400";
    } else {
      if (trend === "rising") return "text-red-600";
      if (trend === "falling") return "text-blue-600";
      return "text-gray-600";
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 fixed w-full top-0 z-50`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <MapPin className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
            <span className="font-bold text-xl">SensorSync</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className={`flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
              <Home className="h-5 w-5 mr-1" />
              Dashboard
            </a>
            {/* New Firmware Button */}
            <button 
              onClick={() => setOtaUploaderOpen(true)}
              className={`flex items-center ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Upload className="h-5 w-5 mr-1" />
              Firmware
            </button>
             <Link to="/analytics" className={`flex items-center ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <BarChart2 className="h-5 w-5 mr-1" />
              Analytics
            </Link>
            <a href="#" className={`flex items-center ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <Settings className="h-5 w-5 mr-1" />
              Settings
            </a>
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleDarkMode} className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} py-2 px-4 absolute left-0 right-0 top-full border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <a href="#" className={`block py-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Dashboard
              </div>
            </a>
            {/* New Firmware Button (Mobile) */}
            <button 
              onClick={() => {
                setOtaUploaderOpen(true);
                setMobileMenuOpen(false);
              }}
              className={`block py-2 w-full text-left ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              <div className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Firmware
              </div>
            </button>
           <Link to="/analytics" className={`block py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" />
                Analytics
              </div>
            </Link>
            <a href="#" className={`block py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </div>
            </a>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Location and Quick Stats */}
          <div className={`mb-8 p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <MapPin className={`h-5 w-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h2 className="text-xl font-semibold">{currentLocation}</h2>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Last updated: {weatherData.length > 0 ? weatherData[0].timestamp : 'N/A'} 
                  <span className="ml-2">• Auto-refresh every 5 minutes</span>
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center">
                <div className="text-center px-6 border-r border-gray-300">
                  <p className={`text-sm uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg. Temp</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {getAverageData().temperature}°C
                  </p>
                  <p className={`text-xs ${getTrendColor()}`}>
                    {getTemperatureTrend() === "rising" ? "↑ Rising" : 
                     getTemperatureTrend() === "falling" ? "↓ Falling" : "→ Stable"}
                  </p>
                </div>
                <div className="text-center px-6">
                  <p className={`text-sm uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg. Humidity</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {getAverageData().humidity}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Data Display */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Readings</h2>
              <button
                onClick={fetchWeatherData}
                disabled={loading}
                className={`flex items-center ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                    : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
                } px-4 py-2 rounded-full transition-all disabled:opacity-70 shadow-sm border`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {loading ? "Updating..." : "Refresh"}
              </button>
            </div>

            {loading && (
              <div className={`text-center py-16 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
                <div className={`inline-block animate-spin rounded-full h-10 w-10 border-4 ${
                  darkMode ? 'border-gray-600 border-t-blue-400' : 'border-gray-300 border-t-blue-600'
                }`}></div>
                <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fetching latest data...</p>
              </div>
            )}

            {!loading && weatherData.length === 0 && (
              <div className={`text-center py-16 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'} rounded-xl shadow-md`}>
                No data available. Click refresh to load data.
              </div>
            )}

            {/* Display exactly six cards */}
            {!loading && weatherData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weatherData.map((reading, index) => (
                  <div
                    key={reading.id}
                    className={`p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border ${
                      darkMode ? 'border-gray-700' : 'border-gray-200'
                    } ${getBgGradient(index)}`}
                  >
                    {/* Timestamp */}
                    <div className={`flex items-center justify-end mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{reading.timestamp}</span>
                    </div>

                    {/* Temperature & Humidity */}
                    <div className="flex justify-between">
                      {/* Temperature Card */}
                      <div className={`flex flex-col items-center p-4 ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'
                      } rounded-xl w-1/2 mr-2 shadow-sm border`}>
                        <ThermometerIcon className={`w-6 h-6 mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                        <p className={`text-xs uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Temperature</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {reading.temperature}°C
                        </p>
                      </div>

                      {/* Humidity Card */}
                      <div className={`flex flex-col items-center p-4 ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'
                      } rounded-xl w-1/2 ml-2 shadow-sm border`}>
                        <Droplets className={`w-6 h-6 mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                        <p className={`text-xs uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Humidity</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {reading.humidity}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center mb-4">
              <Info className={`h-5 w-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className="text-xl font-semibold">About This Dashboard</h2>
            </div>
            <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              This dashboard displays real-time temperature and humidity readings from various sensors around your home. 
              The data is automatically refreshed every 5 minutes, but you can also manually refresh using the button above.
            </p>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              The system monitors environmental conditions to help maintain optimal comfort and energy efficiency in your living space.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-white text-gray-500 border-gray-200'} py-4 border-t`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 SensorSync Weather Monitoring System. All rights reserved.</p>
        </div>
      </footer>

      {/* OTA Uploader Modal */}
      <OtaUploader 
        isOpen={otaUploaderOpen} 
        onClose={() => setOtaUploaderOpen(false)}
        darkMode={darkMode}
      />
    </div>
  );
}

export default WeatherDataDisplay;
