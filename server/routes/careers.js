const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const aiService = require('../aiService');

// Generate career suggestions for a CV
router.post('/suggest/:cvId', async (req, res) => {
  try {
    // Get CV data
    db.get('SELECT * FROM cvs WHERE id = ?', [req.params.cvId], async (err, cv) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!cv) {
        return res.status(404).json({ error: 'CV not found' });
      }

      const cvAnalysis = JSON.parse(cv.parsed_content || '{}');

      // Generate career suggestions using AI
      const suggestions = await aiService.generateCareerSuggestions(cvAnalysis);

      // Save suggestions to database
      const savePromises = suggestions.map(suggestion => {
        return new Promise((resolve, reject) => {
          const id = uuidv4();
          db.run(
            `INSERT INTO career_suggestions (id, cv_id, career_title, match_score, reasoning, required_skills, growth_potential)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              req.params.cvId,
              suggestion.career_title,
              suggestion.match_score,
              suggestion.reasoning,
              JSON.stringify(suggestion.required_skills || []),
              suggestion.growth_potential
            ],
            (err) => {
              if (err) reject(err);
              else resolve({ id, ...suggestion });
            }
          );
        });
      });

      try {
        const savedSuggestions = await Promise.all(savePromises);
        res.json({
          message: 'Career suggestions generated successfully',
          suggestions: savedSuggestions
        });
      } catch (error) {
        console.error('Error saving suggestions:', error);
        res.status(500).json({ error: 'Failed to save suggestions' });
      }
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get career suggestions for a CV
router.get('/:cvId', (req, res) => {
  db.all(
    'SELECT * FROM career_suggestions WHERE cv_id = ? ORDER BY match_score DESC',
    [req.params.cvId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const suggestions = rows.map(row => ({
        ...row,
        required_skills: JSON.parse(row.required_skills || '[]')
      }));

      res.json(suggestions);
    }
  );
});

// Delete career suggestion
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM career_suggestions WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    res.json({ message: 'Suggestion deleted successfully' });
  });
});

module.exports = router;
