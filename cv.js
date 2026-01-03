const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const cvParser = require('../cvParser');
const aiService = require('../aiService');

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  }
});

// Upload and parse CV
router.post('/upload', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const cvId = uuidv4();
    const fileType = path.extname(req.file.originalname).substring(1);

    // Parse CV content
    const parsedContent = await cvParser.parseCV(req.file.path, fileType);

    // Analyze CV with AI
    const analysis = await aiService.analyzeCV(parsedContent);

    // Save to database
    db.run(
      `INSERT INTO cvs (id, filename, original_content, parsed_content, skills, experience, education)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        cvId,
        req.file.originalname,
        parsedContent,
        JSON.stringify(analysis),
        JSON.stringify(analysis.skills || []),
        analysis.experience || '',
        analysis.education || ''
      ],
      (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save CV' });
        }

        res.json({
          message: 'CV uploaded and analyzed successfully',
          cvId,
          analysis
        });
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get CV by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM cvs WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'CV not found' });
    }

    const cv = {
      ...row,
      parsed_content: JSON.parse(row.parsed_content || '{}'),
      skills: JSON.parse(row.skills || '[]')
    };

    res.json(cv);
  });
});

// Get all CVs
router.get('/', (req, res) => {
  db.all('SELECT id, filename, created_at, updated_at FROM cvs ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Delete CV
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM cvs WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json({ message: 'CV deleted successfully' });
  });
});

module.exports = router;
