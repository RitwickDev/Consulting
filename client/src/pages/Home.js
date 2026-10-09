import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFileUpload, FaLightbulb, FaBriefcase, FaRocket } from 'react-icons/fa';
import api from '../services/api';
import './Home.css';

function Home({ currentCV }) {
  const [stats, setStats] = useState(null);
  const [cvList, setCVList] = useState([]);

  useEffect(() => {
    loadStats();
    loadCVs();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/jobs/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadCVs = async () => {
    try {
      const response = await api.get('/cv');
      setCVList(response.data);
    } catch (error) {
      console.error('Error loading CVs:', error);
    }
  };

  return (
    <div className="home">
      <div className="hero">
        <h1 className="hero-title">
          <FaRocket className="hero-icon" />
          AI Career Explorer
        </h1>
        <p className="hero-subtitle">
          Discover your perfect career path with AI-powered insights
        </p>
        <p className="hero-description">
          Upload your CV, get personalized career suggestions, and track your job applications all in one place
        </p>
      </div>

      <div className="features grid grid-3">
        <Link to="/upload" className="feature-card">
          <div className="feature-icon">
            <FaFileUpload />
          </div>
          <h3>Upload Your CV</h3>
          <p>AI-powered CV analysis to extract your skills, experience, and potential</p>
        </Link>

        <Link to="/careers" className="feature-card">
          <div className="feature-icon">
            <FaLightbulb />
          </div>
          <h3>Explore Careers</h3>
          <p>Get personalized career suggestions based on your unique profile</p>
        </Link>

        <Link to="/jobs" className="feature-card">
          <div className="feature-icon">
            <FaBriefcase />
          </div>
          <h3>Track Applications</h3>
          <p>Manage job applications and tailor your CV for each opportunity</p>
        </Link>
      </div>

      {stats && stats.total > 0 && (
        <div className="card">
          <h2>Your Job Search Dashboard</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Applications</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.applied}</div>
              <div className="stat-label">Applied</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.interviewing}</div>
              <div className="stat-label">Interviewing</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.offered}</div>
              <div className="stat-label">Offers</div>
            </div>
          </div>
        </div>
      )}

      {cvList.length > 0 && (
        <div className="card">
          <h2>Your CVs</h2>
          <div className="cv-list">
            {cvList.map((cv) => (
              <div key={cv.id} className="cv-item">
                <div className="cv-name">{cv.filename}</div>
                <div className="cv-date">
                  Uploaded: {new Date(cv.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {cvList.length === 0 && (
        <div className="cta-card">
          <h2>Ready to get started?</h2>
          <p>Upload your CV to unlock AI-powered career insights</p>
          <Link to="/upload" className="button button-primary">
            Upload Your CV Now
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;
