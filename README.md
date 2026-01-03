# AI Career Explorer

An intelligent career exploration and job application management platform powered by AI. This tool helps you discover personalized career paths, tailor your CV to specific job postings, and efficiently track your job applications.

## Features

### 1. CV Upload & Analysis
- Upload your CV in PDF or TXT format
- AI-powered parsing extracts skills, experience, education, and strengths
- Automatic skill categorization and experience summarization

### 2. Career Exploration
- Get personalized career suggestions based on your CV
- AI analyzes your background and recommends suitable career paths
- Each suggestion includes:
  - Match score (0-100%)
  - Reasoning for the recommendation
  - Skills you need to develop
  - Growth potential analysis

### 3. Job Application Tracker
- Track all your job applications in one place
- Store important details:
  - Company name and job title
  - Job description and requirements
  - Application status (Applied, Interviewing, Offered, Rejected, Accepted)
  - Salary range and location
  - Job posting URL
  - Personal notes
- Update application status as you progress
- View comprehensive dashboard with application statistics

### 4. AI-Powered CV Tailoring
- Automatically tailor your CV for specific job postings
- AI rewrites your CV to:
  - Emphasize relevant skills and experiences
  - Match keywords from job descriptions
  - Highlight achievements relevant to the role
  - Maintain honesty while optimizing presentation

## Tech Stack

### Backend
- **Node.js** + **Express**: RESTful API server
- **SQLite**: Lightweight database for data persistence
- **pdf-parse**: PDF parsing for CV extraction
- **Google Gemini / Anthropic Claude / OpenAI GPT**: AI integration for analysis and suggestions

### Frontend
- **React**: Modern UI framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **React Icons**: Beautiful icon library

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- An API key from one of:
  - **Google Gemini** (Recommended - Free tier available)
  - Anthropic (Claude API)
  - OpenAI (GPT-4)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-career-explorer.git
   cd ai-career-explorer
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API key:
   ```env
   # For Google Gemini (Recommended - Free tier)
   GEMINI_API_KEY=your_gemini_api_key_here

   # OR for Anthropic Claude
   ANTHROPIC_API_KEY=your_anthropic_api_key_here

   # OR for OpenAI
   OPENAI_API_KEY=your_openai_api_key_here

   # Server configuration
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ```

5. **Run the application**

   **Development mode** (runs both backend and frontend):
   ```bash
   npm run dev
   ```

   **Or run separately:**

   Backend:
   ```bash
   npm run server
   ```

   Frontend (in another terminal):
   ```bash
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## API Documentation

### CV Endpoints

#### Upload CV
```http
POST /api/cv/upload
Content-Type: multipart/form-data

Body: { cv: <file> }

Response: {
  message: "CV uploaded and analyzed successfully",
  cvId: "uuid",
  analysis: {
    skills: ["JavaScript", "React", ...],
    experience: "Summary of experience",
    education: "Educational background",
    strengths: ["Leadership", ...]
  }
}
```

#### Get All CVs
```http
GET /api/cv

Response: [
  {
    id: "uuid",
    filename: "my_cv.pdf",
    created_at: "2026-01-02T10:00:00.000Z"
  }
]
```

#### Get CV by ID
```http
GET /api/cv/:id

Response: {
  id: "uuid",
  filename: "my_cv.pdf",
  original_content: "Full CV text",
  parsed_content: { ... },
  skills: ["JavaScript", ...],
  ...
}
```

### Career Suggestions Endpoints

#### Generate Career Suggestions
```http
POST /api/careers/suggest/:cvId

Response: {
  message: "Career suggestions generated successfully",
  suggestions: [
    {
      id: "uuid",
      career_title: "Software Engineer",
      match_score: 85,
      reasoning: "Your skills in...",
      required_skills: ["Python", "AWS"],
      growth_potential: "High demand..."
    }
  ]
}
```

#### Get Career Suggestions
```http
GET /api/careers/:cvId

Response: [ ... array of suggestions ... ]
```

### Job Application Endpoints

#### Create Job Application
```http
POST /api/jobs
Content-Type: application/json

Body: {
  cvId: "uuid",
  companyName: "Company Name",
  jobTitle: "Software Engineer",
  jobDescription: "Full job description...",
  status: "applied",
  salaryRange: "$80k - $120k",
  location: "Remote",
  jobUrl: "https://...",
  notes: "Notes here"
}

Response: {
  message: "Job application created successfully",
  jobId: "uuid"
}
```

#### Get All Job Applications
```http
GET /api/jobs?cvId=<uuid>&status=<status>

Response: [ ... array of job applications ... ]
```

#### Update Job Application
```http
PUT /api/jobs/:id
Content-Type: application/json

Body: { status: "interviewing", notes: "..." }

Response: {
  message: "Job application updated successfully"
}
```

#### Delete Job Application
```http
DELETE /api/jobs/:id

Response: {
  message: "Job application deleted successfully"
}
```

#### Tailor CV for Job
```http
POST /api/jobs/:id/tailor

Response: {
  message: "CV tailored successfully",
  tailoredId: "uuid",
  content: "Tailored CV content..."
}
```

#### Get Application Statistics
```http
GET /api/jobs/stats/summary?cvId=<uuid>

Response: {
  total: 10,
  applied: 5,
  interviewing: 3,
  offered: 1,
  rejected: 1,
  accepted: 0
}
```

## Project Structure

```
ai-career-explorer/
├── server/
│   ├── index.js              # Express server entry point
│   ├── database.js           # SQLite database configuration
│   ├── aiService.js          # AI integration (Anthropic/OpenAI)
│   ├── cvParser.js           # CV parsing utilities
│   └── routes/
│       ├── cv.js             # CV-related endpoints
│       ├── careers.js        # Career suggestion endpoints
│       └── jobs.js           # Job tracking endpoints
├── client/
│   ├── public/
│   └── src/
│       ├── App.js            # Main React component
│       ├── services/
│       │   └── api.js        # API client configuration
│       └── pages/
│           ├── Home.js       # Landing page
│           ├── CVUpload.js   # CV upload interface
│           ├── CareerExplorer.js  # Career suggestions page
│           └── JobTracker.js # Job application tracker
├── database/                 # SQLite database storage
├── uploads/                  # Uploaded CV files
├── package.json              # Backend dependencies
└── README.md                 # This file
```

## Database Schema

### CVs Table
- `id` (TEXT, PRIMARY KEY)
- `filename` (TEXT)
- `original_content` (TEXT)
- `parsed_content` (TEXT/JSON)
- `skills` (TEXT/JSON)
- `experience` (TEXT)
- `education` (TEXT)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### Career Suggestions Table
- `id` (TEXT, PRIMARY KEY)
- `cv_id` (TEXT, FOREIGN KEY)
- `career_title` (TEXT)
- `match_score` (INTEGER)
- `reasoning` (TEXT)
- `required_skills` (TEXT/JSON)
- `growth_potential` (TEXT)
- `created_at` (DATETIME)

### Job Applications Table
- `id` (TEXT, PRIMARY KEY)
- `cv_id` (TEXT, FOREIGN KEY)
- `company_name` (TEXT)
- `job_title` (TEXT)
- `job_description` (TEXT)
- `application_date` (DATETIME)
- `status` (TEXT)
- `notes` (TEXT)
- `tailored_cv` (TEXT)
- `follow_up_date` (DATETIME)
- `salary_range` (TEXT)
- `location` (TEXT)
- `job_url` (TEXT)
- `updated_at` (DATETIME)

### Tailored CVs Table
- `id` (TEXT, PRIMARY KEY)
- `original_cv_id` (TEXT, FOREIGN KEY)
- `job_application_id` (TEXT, FOREIGN KEY)
- `tailored_content` (TEXT)
- `modifications` (TEXT)
- `created_at` (DATETIME)

## Usage Guide

### 1. Getting Started
1. Upload your CV using the "Upload CV" page
2. Wait for AI analysis to complete
3. Review extracted skills and experience

### 2. Exploring Career Options
1. Navigate to "Career Ideas"
2. Select your CV from the dropdown
3. Click "Generate Career Suggestions"
4. Review AI-generated career recommendations
5. Note the skills you need to develop

### 3. Tracking Job Applications
1. Go to "Job Tracker"
2. Click "Add Job Application"
3. Fill in job details:
   - Company name and job title
   - Paste the job description
   - Add location, salary, and URL
   - Add personal notes
4. Click "Tailor CV" to generate a customized version
5. Update status as you progress through the interview process

### 4. Managing Applications
- Edit application details anytime
- Delete applications you no longer need
- View statistics on your dashboard
- Filter by CV or status

## Tips for Best Results

### CV Upload
- Use a well-formatted PDF for best parsing results
- Include clear sections for skills, experience, and education
- Keep it concise and professional

### Career Suggestions
- Ensure your CV is detailed for better suggestions
- Review multiple suggestions to explore different paths
- Note the required skills for your target careers

### Job Tracking
- Always include the job description for CV tailoring
- Update status promptly to stay organized
- Use notes to track follow-ups and interview details
- Keep job URLs for easy reference

## Troubleshooting

### API Key Issues
- Ensure you've set either `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, or `OPENAI_API_KEY` in `.env`
- Verify your API key is valid and has sufficient credits
- Check API key permissions
- **Get Gemini API Key**: Visit https://makersuite.google.com/app/apikey (Free tier available)

### CV Upload Failures
- Ensure file is PDF or TXT format
- Check file size is under 10MB
- Verify file is not corrupted

### Database Errors
- Delete `database/career_explorer.db` to reset
- Ensure write permissions in the database directory

### Port Conflicts
- Change `PORT` in `.env` if 5000 is already in use
- Update `proxy` in `client/package.json` accordingly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Future Enhancements

- Export CVs to PDF/DOCX
- Email notifications for follow-ups
- Interview preparation tips
- Salary negotiation guidance
- Integration with job boards (LinkedIn, Indeed, etc.)
- Resume templates
- Cover letter generation
- Multi-language support
- Mobile app version

---

Built with ❤️ using AI technology
