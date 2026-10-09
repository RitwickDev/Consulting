import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FaHome, FaFileUpload, FaLightbulb, FaBriefcase } from 'react-icons/fa';
import './App.css';

import Home from './pages/Home';
import CVUpload from './pages/CVUpload';
import CareerExplorer from './pages/CareerExplorer';
import JobTracker from './pages/JobTracker';
import api from './services/api';

function App() {
  const [currentCV, setCurrentCV] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await api.get('/health');
      setHealth(response.data);
    } catch (error) {
      console.error('API health check failed:', error);
    }
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-brand">
              AI Career Explorer
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                <FaHome /> Home
              </Link>
              <Link to="/upload" className="nav-link">
                <FaFileUpload /> Upload CV
              </Link>
              <Link to="/careers" className="nav-link">
                <FaLightbulb /> Career Ideas
              </Link>
              <Link to="/jobs" className="nav-link">
                <FaBriefcase /> Job Tracker
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          {health && (
            <div className="health-indicator">
              <span className="status-dot"></span> API Connected
            </div>
          )}

          <Routes>
            <Route path="/" element={<Home currentCV={currentCV} />} />
            <Route path="/upload" element={<CVUpload onCVUploaded={setCurrentCV} />} />
            <Route path="/careers" element={<CareerExplorer currentCV={currentCV} />} />
            <Route path="/jobs" element={<JobTracker currentCV={currentCV} />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2026 AI Career Explorer. Powered by AI.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
