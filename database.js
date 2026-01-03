const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dbDir, 'career_explorer.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users/CVs table
  db.run(`
    CREATE TABLE IF NOT EXISTS cvs (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_content TEXT,
      parsed_content TEXT,
      skills TEXT,
      experience TEXT,
      education TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Career suggestions table
  db.run(`
    CREATE TABLE IF NOT EXISTS career_suggestions (
      id TEXT PRIMARY KEY,
      cv_id TEXT NOT NULL,
      career_title TEXT NOT NULL,
      match_score INTEGER,
      reasoning TEXT,
      required_skills TEXT,
      growth_potential TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE
    )
  `);

  // Job applications tracker table
  db.run(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      cv_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      job_title TEXT NOT NULL,
      job_description TEXT,
      application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'applied',
      notes TEXT,
      tailored_cv TEXT,
      follow_up_date DATETIME,
      salary_range TEXT,
      location TEXT,
      job_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE
    )
  `);

  // Tailored CVs for specific job postings
  db.run(`
    CREATE TABLE IF NOT EXISTS tailored_cvs (
      id TEXT PRIMARY KEY,
      original_cv_id TEXT NOT NULL,
      job_application_id TEXT,
      tailored_content TEXT NOT NULL,
      modifications TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (original_cv_id) REFERENCES cvs(id) ON DELETE CASCADE,
      FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE SET NULL
    )
  `);
});

module.exports = db;
