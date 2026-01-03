import React, { useState, useEffect } from 'react';
import {
  FaBriefcase,
  FaPlus,
  FaEdit,
  FaTrash,
  FaMagic,
  FaTimes,
  FaSpinner,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import api from '../services/api';
import './JobTracker.css';

function JobTracker({ currentCV }) {
  const [jobs, setJobs] = useState([]);
  const [cvList, setCVList] = useState([]);
  const [selectedCV, setSelectedCV] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [tailoringJob, setTailoringJob] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    status: 'applied',
    salaryRange: '',
    location: '',
    jobUrl: '',
    notes: '',
  });

  const statusOptions = [
    { value: 'applied', label: 'Applied' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'offered', label: 'Offered' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'accepted', label: 'Accepted' },
  ];

  useEffect(() => {
    loadCVs();
  }, []);

  useEffect(() => {
    if (currentCV && currentCV.cvId) {
      setSelectedCV(currentCV.cvId);
      loadJobs(currentCV.cvId);
    }
  }, [currentCV]);

  const loadCVs = async () => {
    try {
      const response = await api.get('/cv');
      setCVList(response.data);
      if (response.data.length > 0 && !selectedCV) {
        setSelectedCV(response.data[0].id);
        loadJobs(response.data[0].id);
      }
    } catch (err) {
      console.error('Error loading CVs:', err);
    }
  };

  const loadJobs = async (cvId) => {
    setLoading(true);
    try {
      const response = await api.get(`/jobs?cvId=${cvId}`);
      setJobs(response.data);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCVChange = (e) => {
    const cvId = e.target.value;
    setSelectedCV(cvId);
    loadJobs(cvId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddJob = () => {
    setEditingJob(null);
    setFormData({
      companyName: '',
      jobTitle: '',
      jobDescription: '',
      status: 'applied',
      salaryRange: '',
      location: '',
      jobUrl: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setFormData({
      companyName: job.company_name,
      jobTitle: job.job_title,
      jobDescription: job.job_description || '',
      status: job.status,
      salaryRange: job.salary_range || '',
      location: job.location || '',
      jobUrl: job.job_url || '',
      notes: job.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCV) {
      alert('Please select a CV first');
      return;
    }

    try {
      if (editingJob) {
        await api.put(`/jobs/${editingJob.id}`, formData);
      } else {
        await api.post('/jobs', {
          ...formData,
          cvId: selectedCV,
        });
      }

      setShowModal(false);
      loadJobs(selectedCV);
    } catch (err) {
      console.error('Error saving job:', err);
      alert('Failed to save job application');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) {
      return;
    }

    try {
      await api.delete(`/jobs/${jobId}`);
      loadJobs(selectedCV);
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job application');
    }
  };

  const handleTailorCV = async (job) => {
    if (!job.job_description) {
      alert('Job description is required to tailor CV');
      return;
    }

    setTailoringJob(job.id);

    try {
      const response = await api.post(`/jobs/${job.id}/tailor`);
      alert('CV tailored successfully! Content:\n\n' + response.data.content.substring(0, 500) + '...');
    } catch (err) {
      console.error('Error tailoring CV:', err);
      alert('Failed to tailor CV');
    } finally {
      setTailoringJob(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status}`;
  };

  return (
    <div className="job-tracker">
      <h1>
        <FaBriefcase className="title-icon" />
        Job Application Tracker
      </h1>
      <p className="subtitle">
        Track your job applications and tailor your CV for each opportunity
      </p>

      <div className="card controls-card">
        <div className="controls-row">
          <div className="form-group cv-select-group">
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
                  {cv.filename}
                </option>
              ))}
            </select>
          </div>

          <button className="button button-primary" onClick={handleAddJob}>
            <FaPlus /> Add Job Application
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading job applications...</p>
        </div>
      )}

      {!loading && jobs.length === 0 && selectedCV && (
        <div className="card empty-state">
          <FaBriefcase className="empty-icon" />
          <h3>No Job Applications Yet</h3>
          <p>Start tracking your job applications by clicking "Add Job Application"</p>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <div>
                  <h3>{job.job_title}</h3>
                  <p className="company-name">{job.company_name}</p>
                </div>
                <span className={getStatusBadgeClass(job.status)}>
                  {job.status}
                </span>
              </div>

              <div className="job-details">
                {job.location && (
                  <div className="job-detail-item">
                    <strong>Location:</strong> {job.location}
                  </div>
                )}
                {job.salary_range && (
                  <div className="job-detail-item">
                    <strong>Salary:</strong> {job.salary_range}
                  </div>
                )}
                <div className="job-detail-item">
                  <strong>Applied:</strong>{' '}
                  {new Date(job.application_date).toLocaleDateString()}
                </div>
                {job.job_url && (
                  <div className="job-detail-item">
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="job-link"
                    >
                      View Job Posting <FaExternalLinkAlt />
                    </a>
                  </div>
                )}
              </div>

              {job.notes && (
                <div className="job-notes">
                  <strong>Notes:</strong>
                  <p>{job.notes}</p>
                </div>
              )}

              <div className="job-actions">
                <button
                  className="button button-secondary"
                  onClick={() => handleTailorCV(job)}
                  disabled={tailoringJob === job.id}
                >
                  {tailoringJob === job.id ? (
                    <>
                      <FaSpinner className="spinner-icon" />
                      Tailoring...
                    </>
                  ) : (
                    <>
                      <FaMagic /> Tailor CV
                    </>
                  )}
                </button>
                <button
                  className="button button-secondary"
                  onClick={() => handleEditJob(job)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="button button-danger"
                  onClick={() => handleDeleteJob(job.id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingJob ? 'Edit' : 'Add'} Job Application</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  className="input"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  name="jobTitle"
                  className="input"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea
                  name="jobDescription"
                  className="textarea"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  placeholder="Paste the job description here (helpful for CV tailoring)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="select"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="input"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Remote, New York, NY"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input
                    type="text"
                    name="salaryRange"
                    className="input"
                    value={formData.salaryRange}
                    onChange={handleInputChange}
                    placeholder="e.g., $80k - $120k"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job URL</label>
                  <input
                    type="url"
                    name="jobUrl"
                    className="input"
                    value={formData.jobUrl}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  className="textarea"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes about this application"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  {editingJob ? 'Update' : 'Add'} Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobTracker;
