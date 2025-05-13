import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from "axios";
import { ThermometerIcon, Droplets, ArrowLeft } from "lucide-react";

const AnalyticsPage = ({ darkMode }) => {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange] = useState('24h'); // Fixed to 24h

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://esp-32-enviroment-monitor-backend1.vercel.app/sensor-data`);
      setSensorData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback mock data with random variation
      setSensorData(Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (i * 3600000)).toISOString(),
        temperature: 20 + Math.sin(i / 2) * 4 + (Math.random() * 2 - 1),
        humidity: 55 + Math.cos(i / 3) * 8 + (Math.random() * 5 - 2.5),
      })).reverse());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 fixed w-full top-0 z-50`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <ArrowLeft className={`h-5 w-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className="font-bold">Back to Dashboard</span>
          </Link>
          <div className="text-sm text-gray-400">
            Showing data for last 24 hours
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className={`mb-8 p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h1 className="text-2xl font-bold mb-6">Sensor Analytics</h1>

            {loading ? (
              <div className="text-center py-16">
                <div className={`inline-block animate-spin rounded-full h-10 w-10 border-4 ${
                  darkMode ? 'border-gray-600 border-t-blue-400' : 'border-gray-300 border-t-blue-600'
                }`}></div>
              </div>
            ) : (
              <>
                {/* Temperature Chart */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <ThermometerIcon className="w-5 h-5 mr-2" />
                    Temperature Trend
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sensorData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(str) => new Date(str).toLocaleTimeString()} 
                          stroke={darkMode ? "#9ca3af" : "#6b7280"}
                        />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          stroke={darkMode ? "#9ca3af" : "#6b7280"} 
                          tickFormatter={(value) => value.toFixed(1)}
                        />
                        <Tooltip 
                          contentStyle={darkMode ? { backgroundColor: '#1f2937', borderColor: '#374151' } : null}
                          formatter={(value) => value.toFixed(1)}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="temperature" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot
                          name="Temperature (°C)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Humidity Chart */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Droplets className="w-5 h-5 mr-2" />
                    Humidity Trend
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sensorData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(str) => new Date(str).toLocaleTimeString()} 
                          stroke={darkMode ? "#9ca3af" : "#6b7280"}
                        />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          stroke={darkMode ? "#9ca3af" : "#6b7280"} 
                          tickFormatter={(value) => value.toFixed(1)}
                        />
                        <Tooltip 
                          contentStyle={darkMode ? { backgroundColor: '#1f2937', borderColor: '#374151' } : null}
                          formatter={(value) => value.toFixed(1)}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="humidity" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot
                          name="Humidity (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
