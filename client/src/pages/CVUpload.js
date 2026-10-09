import React, { useState } from 'react';
import { FaFileUpload, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import api from '../services/api';
import './CVUpload.css';

function CVUpload({ onCVUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split('.').pop().toLowerCase();
      if (!['pdf', 'txt'].includes(fileType)) {
        setError('Please upload a PDF or TXT file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await api.post('/cv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
      if (onCVUploaded) {
        onCVUploaded(response.data);
      }
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload CV');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileType = droppedFile.name.split('.').pop().toLowerCase();
      if (!['pdf', 'txt'].includes(fileType)) {
        setError('Please upload a PDF or TXT file');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="cv-upload">
      <h1>Upload Your CV</h1>
      <p className="subtitle">
        Upload your CV and let AI analyze your skills, experience, and career potential
      </p>

      <div className="card">
        <div
          className={`upload-area ${file ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <FaFileUpload className="upload-icon" />
          <h3>Drag and drop your CV here</h3>
          <p>or</p>
          <label className="file-input-label">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="file-input"
            />
            <span className="button button-secondary">Browse Files</span>
          </label>
          <p className="file-hint">Supported formats: PDF, TXT (Max 10MB)</p>

          {file && (
            <div className="selected-file">
              <FaCheckCircle className="check-icon" />
              <span>{file.name}</span>
            </div>
          )}
        </div>

        {error && <div className="error">{error}</div>}

        {file && !uploadResult && (
          <button
            className="button button-primary upload-button"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <FaSpinner className="spinner-icon" />
                Analyzing CV...
              </>
            ) : (
              <>
                <FaFileUpload />
                Upload and Analyze
              </>
            )}
          </button>
        )}
      </div>

      {uploadResult && (
        <div className="card success-card">
          <h2>
            <FaCheckCircle className="success-icon" />
            CV Uploaded Successfully!
          </h2>
          <p>Your CV has been analyzed by AI. Here's what we found:</p>

          <div className="analysis-results">
            {uploadResult.analysis.skills && uploadResult.analysis.skills.length > 0 && (
              <div className="analysis-section">
                <h3>Skills Identified</h3>
                <div className="skills-list">
                  {uploadResult.analysis.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {uploadResult.analysis.experience && (
              <div className="analysis-section">
                <h3>Experience Summary</h3>
                <p>{uploadResult.analysis.experience}</p>
              </div>
            )}

            {uploadResult.analysis.education && (
              <div className="analysis-section">
                <h3>Education</h3>
                <p>{uploadResult.analysis.education}</p>
              </div>
            )}

            {uploadResult.analysis.strengths && uploadResult.analysis.strengths.length > 0 && (
              <div className="analysis-section">
                <h3>Key Strengths</h3>
                <ul>
                  {uploadResult.analysis.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="next-steps">
            <h3>What's Next?</h3>
            <p>Explore career suggestions or start tracking your job applications!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CVUpload;
