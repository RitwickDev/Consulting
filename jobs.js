const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const aiService = require('../aiService');

// Create new job application
router.post('/', async (req, res) => {
  try {
    const {
      cvId,
      companyName,
      jobTitle,
      jobDescription,
      status = 'applied',
      notes,
      salaryRange,
      location,
      jobUrl,
      followUpDate
    } = req.body;

    if (!cvId || !companyName || !jobTitle) {
      return res.status(400).json({ error: 'cvId, companyName, and jobTitle are required' });
    }

    const jobId = uuidv4();

    // Insert job application
    db.run(
      `INSERT INTO job_applications (id, cv_id, company_name, job_title, job_description, status, notes, salary_range, location, job_url, follow_up_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [jobId, cvId, companyName, jobTitle, jobDescription, status, notes, salaryRange, location, jobUrl, followUpDate],
      (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create job application' });
        }

        res.json({
          message: 'Job application created successfully',
          jobId,
          data: { id: jobId, cvId, companyName, jobTitle, status }
        });
      }
    );
  } catch (error) {
    console.error('Error creating job application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all job applications (with optional CV filter)
router.get('/', (req, res) => {
  const { cvId, status } = req.query;
  let query = 'SELECT * FROM job_applications';
  const params = [];

  if (cvId || status) {
    query += ' WHERE';
    if (cvId) {
      query += ' cv_id = ?';
      params.push(cvId);
    }
    if (status) {
      query += cvId ? ' AND' : '';
      query += ' status = ?';
      params.push(status);
    }
  }

  query += ' ORDER BY application_date DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get single job application
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM job_applications WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Job application not found' });
    }
    res.json(row);
  });
});

// Update job application
router.put('/:id', (req, res) => {
  const {
    companyName,
    jobTitle,
    jobDescription,
    status,
    notes,
    salaryRange,
    location,
    jobUrl,
    followUpDate
  } = req.body;

  const updates = [];
  const params = [];

  if (companyName !== undefined) {
    updates.push('company_name = ?');
    params.push(companyName);
  }
  if (jobTitle !== undefined) {
    updates.push('job_title = ?');
    params.push(jobTitle);
  }
  if (jobDescription !== undefined) {
    updates.push('job_description = ?');
    params.push(jobDescription);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }
  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes);
  }
  if (salaryRange !== undefined) {
    updates.push('salary_range = ?');
    params.push(salaryRange);
  }
  if (location !== undefined) {
    updates.push('location = ?');
    params.push(location);
  }
  if (jobUrl !== undefined) {
    updates.push('job_url = ?');
    params.push(jobUrl);
  }
  if (followUpDate !== undefined) {
    updates.push('follow_up_date = ?');
    params.push(followUpDate);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.id);

  const query = `UPDATE job_applications SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, params, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update job application' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Job application not found' });
    }
    res.json({ message: 'Job application updated successfully' });
  });
});

// Delete job application
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM job_applications WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Job application not found' });
    }
    res.json({ message: 'Job application deleted successfully' });
  });
});

// Tailor CV for specific job
router.post('/:id/tailor', async (req, res) => {
  try {
    const jobId = req.params.id;

    // Get job application details
    db.get('SELECT * FROM job_applications WHERE id = ?', [jobId], async (err, job) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!job) {
        return res.status(404).json({ error: 'Job application not found' });
      }

      // Get original CV
      db.get('SELECT * FROM cvs WHERE id = ?', [job.cv_id], async (err, cv) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!cv) {
          return res.status(404).json({ error: 'CV not found' });
        }

        try {
          // Use AI to tailor CV
          const tailoredContent = await aiService.tailorCV(
            cv.original_content,
            job.job_description,
            job.job_title
          );

          const tailoredId = uuidv4();

          // Save tailored CV
          db.run(
            `INSERT INTO tailored_cvs (id, original_cv_id, job_application_id, tailored_content, modifications)
             VALUES (?, ?, ?, ?, ?)`,
            [
              tailoredId,
              cv.id,
              jobId,
              tailoredContent,
              'AI-tailored for job application'
            ],
            (err) => {
              if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to save tailored CV' });
              }

              // Update job application with tailored CV reference
              db.run(
                'UPDATE job_applications SET tailored_cv = ? WHERE id = ?',
                [tailoredId, jobId],
                (err) => {
                  if (err) {
                    console.error('Error updating job:', err);
                  }
                }
              );

              res.json({
                message: 'CV tailored successfully',
                tailoredId,
                content: tailoredContent
              });
            }
          );
        } catch (error) {
          console.error('Error tailoring CV:', error);
          res.status(500).json({ error: 'Failed to tailor CV' });
        }
      });
    });
  } catch (error) {
    console.error('Error in tailor endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
router.get('/stats/summary', (req, res) => {
  const { cvId } = req.query;
  const whereClause = cvId ? 'WHERE cv_id = ?' : '';
  const params = cvId ? [cvId] : [];

  db.get(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) as applied,
      SUM(CASE WHEN status = 'interviewing' THEN 1 ELSE 0 END) as interviewing,
      SUM(CASE WHEN status = 'offered' THEN 1 ELSE 0 END) as offered,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted
     FROM job_applications ${whereClause}`,
    params,
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(row);
    }
  );
});

module.exports = router;
