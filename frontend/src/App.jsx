import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WeatherDataDisplay from "./weather"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WeatherDataDisplay />} />
          {/* Add more routes here as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;