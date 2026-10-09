import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaSpinner, FaStar, FaChartLine } from 'react-icons/fa';
import api from '../services/api';
import './CareerExplorer.css';

function CareerExplorer({ currentCV }) {
  const [cvList, setCVList] = useState([]);
  const [selectedCV, setSelectedCV] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCVs();
  }, []);

  useEffect(() => {
    if (currentCV && currentCV.cvId) {
      setSelectedCV(currentCV.cvId);
      loadSuggestions(currentCV.cvId);
    }
  }, [currentCV]);

  const loadCVs = async () => {
    try {
      const response = await api.get('/cv');
      setCVList(response.data);
      if (response.data.length > 0 && !selectedCV) {
        setSelectedCV(response.data[0].id);
        loadSuggestions(response.data[0].id);
      }
    } catch (err) {
      console.error('Error loading CVs:', err);
    }
  };

  const loadSuggestions = async (cvId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/careers/${cvId}`);
      setSuggestions(response.data);
    } catch (err) {
      setError('Failed to load career suggestions');
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!selectedCV) {
      setError('Please select a CV first');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await api.post(`/careers/suggest/${selectedCV}`);
      setSuggestions(response.data.suggestions);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate career suggestions');
    } finally {
      setGenerating(false);
    }
  };

  const handleCVChange = (e) => {
    const cvId = e.target.value;
    setSelectedCV(cvId);
    loadSuggestions(cvId);
  };

  const getMatchColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="career-explorer">
      <h1>
        <FaLightbulb className="title-icon" />
        Career Explorer
      </h1>
      <p className="subtitle">
        Discover career paths tailored to your skills and experience
      </p>

      <div className="card cv-selector-card">
        <div className="form-group">
          <label className="form-label">Select CV:</label>
          <select
            className="select"
            value={selectedCV || ''}
            onChange={handleCVChange}
            disabled={cvList.length === 0}
          >
            {cvList.length === 0 && <option>No CVs uploaded yet</option>}
            {cvList.map((cv) => (
              <option key={cv.id} value={cv.id}>
                {cv.filename} - {new Date(cv.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {selectedCV && (
          <button
            className="button button-primary"
            onClick={generateSuggestions}
            disabled={generating}
          >
            {generating ? (
              <>
                <FaSpinner className="spinner-icon" />
                Generating AI Suggestions...
              </>
            ) : (
              <>
                <FaLightbulb />
                Generate Career Suggestions
              </>
            )}
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading career suggestions...</p>
        </div>
      )}

      {!loading && suggestions.length === 0 && selectedCV && (
        <div className="card empty-state">
          <FaLightbulb className="empty-icon" />
          <h3>No Career Suggestions Yet</h3>
          <p>Click "Generate Career Suggestions" to get AI-powered recommendations</p>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="suggestions-grid">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="suggestion-card">
              <div className="suggestion-header">
                <h3>{suggestion.career_title}</h3>
                <div
                  className="match-score"
                  style={{ color: getMatchColor(suggestion.match_score) }}
                >
                  <FaStar />
                  {suggestion.match_score}%
                </div>
              </div>

              <div className="suggestion-section">
                <h4>Why This Fits You</h4>
                <p>{suggestion.reasoning}</p>
              </div>

              {suggestion.required_skills && suggestion.required_skills.length > 0 && (
                <div className="suggestion-section">
                  <h4>Skills to Develop</h4>
                  <div className="skills-list">
                    {JSON.parse(suggestion.required_skills).map((skill, index) => (
                      <span key={index} className="skill-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {suggestion.growth_potential && (
                <div className="suggestion-section">
                  <h4>
                    <FaChartLine /> Growth Potential
                  </h4>
                  <p>{suggestion.growth_potential}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CareerExplorer;
