const axios = require('axios');

class AIService {
  constructor() {
    this.anthropicKey = process.env.ANTHROPIC_API_KEY;
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.geminiKey = process.env.GEMINI_API_KEY;
  }

  async analyzeCV(cvContent) {
    const prompt = `Analyze this CV and extract key information in JSON format:
- skills: array of technical and soft skills
- experience: summary of work experience
- education: educational background
- strengths: key strengths
- interests: professional interests

CV Content:
${cvContent}

Return ONLY valid JSON without any markdown formatting.`;

    try {
      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing CV:', error);
      // Return basic structure if AI fails
      return {
        skills: [],
        experience: 'Unable to parse',
        education: 'Unable to parse',
        strengths: [],
        interests: []
      };
    }
  }

  async generateCareerSuggestions(cvAnalysis) {
    const prompt = `Based on this CV analysis, suggest 5-7 career paths that would be a great fit.
For each career, provide:
- career_title: the job title
- match_score: 0-100 score
- reasoning: why this is a good fit (2-3 sentences)
- required_skills: skills they need to develop
- growth_potential: career growth outlook

CV Analysis:
${JSON.stringify(cvAnalysis, null, 2)}

Return ONLY valid JSON array without any markdown formatting.`;

    try {
      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating career suggestions:', error);
      return [];
    }
  }

  async tailorCV(originalCV, jobDescription, jobTitle) {
    const prompt = `You are an expert career coach. Tailor this CV to match the job description below.

IMPORTANT: Keep the same basic structure but:
- Emphasize relevant skills and experiences
- Adjust wording to match job requirements
- Highlight achievements relevant to the role
- Add keywords from job description naturally
- Keep it honest - don't add fake experience

Original CV:
${originalCV}

Job Title: ${jobTitle}

Job Description:
${jobDescription}

Return the tailored CV content as plain text (not JSON). Make it ATS-friendly and professional.`;

    try {
      const response = await this.callAI(prompt);
      return response;
    } catch (error) {
      console.error('Error tailoring CV:', error);
      return originalCV;
    }
  }

  async extractJobInfo(jobPosting) {
    const prompt = `Extract structured information from this job posting:
- job_title: the position title
- company_name: company name if mentioned
- required_skills: array of required skills
- responsibilities: array of key responsibilities
- qualifications: array of qualifications
- salary_range: if mentioned
- location: if mentioned

Job Posting:
${jobPosting}

Return ONLY valid JSON without any markdown formatting.`;

    try {
      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error extracting job info:', error);
      return {
        job_title: 'Unknown',
        required_skills: [],
        responsibilities: [],
        qualifications: []
      };
    }
  }

  async callAI(prompt) {
    // Try Gemini first, then Anthropic, then OpenAI
    if (this.geminiKey) {
      return await this.callGemini(prompt);
    } else if (this.anthropicKey) {
      return await this.callAnthropic(prompt);
    } else if (this.openaiKey) {
      return await this.callOpenAI(prompt);
    } else {
      throw new Error('No AI API key configured. Please set GEMINI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY in .env file');
    }
  }

  async callAnthropic(prompt) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.anthropicKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Anthropic API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async callOpenAI(prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openaiKey}`
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async callGemini(prompt) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new AIService();
