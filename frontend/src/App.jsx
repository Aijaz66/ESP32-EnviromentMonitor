import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import WeatherDataDisplay from "./weather"
import AnalyticsPage from "./AnalyticsPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WeatherDataDisplay />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
