# Google Gemini API Setup Guide

This guide will help you set up Google Gemini API for the AI Career Explorer application.

## Why Gemini?

- **Free Tier Available**: Generous free quota for personal projects
- **Fast Response**: Quick API responses
- **High Quality**: Excellent performance on text analysis and generation tasks
- **Easy to Get Started**: Simple setup process

## Step-by-Step Setup

### 1. Get Your Gemini API Key

1. **Visit Google AI Studio:**
   https://makersuite.google.com/app/apikey

2. **Sign in with your Google Account**

3. **Click "Get API Key"** or "Create API Key"

4. **Select or Create a Project:**
   - You can create a new project or use an existing one
   - Give it a name like "AI Career Explorer"

5. **Copy Your API Key:**
   - Your API key will look like: `AIzaSy...`
   - Keep this key secure and private!

### 2. Configure the Application

1. **Navigate to your project folder:**
   ```bash
   cd ai-career-explorer
   ```

2. **Create your .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit the .env file:**

   **Windows:**
   ```bash
   notepad .env
   ```

   **Mac/Linux:**
   ```bash
   nano .env
   ```

4. **Add your Gemini API key:**
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key_here...
   ```

5. **Save and close the file**

### 3. Test the Configuration

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   ```
   http://localhost:3000
   ```

3. **Upload a CV and test the AI features:**
   - Upload your CV
   - Generate career suggestions
   - Try CV tailoring

## Free Tier Limits

Google Gemini offers generous free tier limits:

- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

This is more than enough for personal use and testing!

## Troubleshooting

### Error: "API key not valid"
- Double-check you copied the entire API key
- Make sure there are no extra spaces before or after the key
- Verify the key is enabled in Google Cloud Console

### Error: "Quota exceeded"
- You've hit the free tier limit
- Wait until the next day (resets at midnight Pacific Time)
- Or upgrade to a paid plan if needed

### Error: "Failed to generate content"
- Check your internet connection
- Verify the API key is correct
- Check Google AI Studio dashboard for any service issues

## API Key Security

**Important Security Tips:**

- ✅ Keep your API key in `.env` file (it's in `.gitignore`)
- ✅ Never commit `.env` to version control
- ✅ Don't share your API key publicly
- ❌ Don't hardcode the key in your source code
- ❌ Don't post your key in screenshots or forums

## Alternative: Using Other AI Providers

If you prefer, you can also use:

### Anthropic Claude:
```env
ANTHROPIC_API_KEY=your_anthropic_key_here
```
Get key from: https://console.anthropic.com/

### OpenAI GPT:
```env
OPENAI_API_KEY=your_openai_key_here
```
Get key from: https://platform.openai.com/api-keys

**Note:** The application will automatically use whichever API key you provide (checks Gemini first, then Anthropic, then OpenAI).

## Additional Resources

- **Google AI Studio:** https://makersuite.google.com/
- **Gemini API Documentation:** https://ai.google.dev/docs
- **Pricing Information:** https://ai.google.dev/pricing
- **API Limits:** https://ai.google.dev/models/gemini#model-variations

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the main README.md file
3. Check the console logs for error messages
4. Verify your API key at Google AI Studio

---

Enjoy using AI Career Explorer with Google Gemini! 🚀
