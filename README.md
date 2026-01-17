<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Trip Genius - Seoul

An AI-powered travel assistant for exploring Seoul, built with React and Google Gemini.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- A Google Gemini API Key

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   - Create a file named `.env.local` in the root directory.
   - Add your Gemini API key:
     ```env
     GEMINI_API_KEY=your_actual_api_key_here
     ```
   - *Note: `.env.local` is git-ignored to protect your secrets.*

3. **Run the app:**
   ```bash
   npm run dev
   ```

## 📦 Deployment to GitHub Pages

This repository is configured with GitHub Actions for automatic deployment.

### 1. Configure Secrets
To make the AI features work in the deployed app, you must add your API key to GitHub:

1. Go to your repository **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret**.
3. Name: `GEMINI_API_KEY`
4. Secret: Paste your Google Gemini API key.
5. Click **Add secret**.

### 2. Enable GitHub Pages
1. Go to your repository **Settings** > **Pages**.
2. Under "Build and deployment", select **GitHub Actions** as the source.
3. The next time you push to the `main` branch, the `Deploy to GitHub Pages` workflow will run automatically.

## 🛡️ Security Note

- **API Keys**: Never commit your API keys directly to code. Always use environment variables (`.env.local` for local, Secrets for GitHub).
- **.gitignore**: The `.gitignore` file is configured to exclude sensitive files and build artifacts.
