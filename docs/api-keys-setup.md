# API Keys Setup Guide

## Overview

This guide will help you set up the necessary API keys for the GitHub Style Agent VS Code Extension. The extension requires two main API keys:

1. GitHub Personal Access Token
2. OpenAI API Key

## GitHub Personal Access Token

A GitHub Personal Access Token is required to access your GitHub repositories for analysis.

### Steps to Create a GitHub Token:

1. **Log in to GitHub**: Visit [github.com](https://github.com) and log in to your account.

2. **Access Settings**: Click on your profile picture in the top-right corner, then select "Settings".

3. **Developer Settings**: Scroll down to the bottom of the sidebar and click on "Developer settings".

4. **Personal Access Tokens**: Click on "Personal access tokens", then select "Tokens (classic)".

5. **Generate New Token**: Click the "Generate new token" button, then select "Generate new token (classic)".

6. **Configure Token**:
   - **Name**: Give your token a descriptive name (e.g., "GitHub Style Agent")
   - **Expiration**: Choose an expiration date (recommended: 90 days)
   - **Scopes**: Select the following permissions:
     - `repo` (Full control of private repositories)
     - `read:user` (Read access to user profile data)

7. **Generate Token**: Scroll to the bottom and click "Generate token".

8. **Copy Token**: **IMPORTANT**: Copy the generated token immediately and store it securely. GitHub will only show it once!

## OpenAI API Key

An OpenAI API key is required for the code generation functionality.

### Steps to Create an OpenAI API Key:

1. **Create an OpenAI Account**: Visit [platform.openai.com](https://platform.openai.com) and sign up or log in.

2. **Access API Keys**: Click on your profile icon in the top-right corner, then select "View API keys".

3. **Create New Secret Key**: Click the "Create new secret key" button.

4. **Name Your Key**: Give your key a descriptive name (e.g., "GitHub Style Agent").

5. **Copy Key**: **IMPORTANT**: Copy the generated key immediately and store it securely. OpenAI will only show it once!

## Setting Up Environment Variables

After obtaining both API keys, you need to add them to your environment variables:

1. **Create/Edit .env File**: In the root directory of the project, create or edit the `.env` file.

2. **Add API Keys**: Add the following lines to your `.env` file:

```env
# Your GitHub Personal Access Token (with 'repo' scope)
GITHUB_TOKEN=ghp_yourTokenHere

# Your GitHub Username
GITHUB_USERNAME=your-github-username

# Your OpenAI API Key
OPENAI_API_KEY=sk-your-openai-key

# Optional Configuration
MAX_REPOS_TO_ANALYZE=20
ANALYSIS_DEPTH=detailed
```

3. **Replace Placeholder Values**: Replace the placeholder values with your actual API keys and GitHub username.

## Security Best Practices

- **Never commit your API keys** to version control
- Store your API keys securely
- Regularly rotate your API keys
- Use the minimum required permissions
- Consider using environment variables instead of hardcoding keys

## Troubleshooting

### GitHub Token Issues

- **"Bad credentials" error**: Ensure your token hasn't expired and has the correct permissions.
- **Rate limiting**: If you hit rate limits, wait an hour or create a token with increased rate limits.

### OpenAI API Issues

- **"Authentication error"**: Double-check your API key for typos.
- **"Insufficient quota"**: Ensure your OpenAI account has available credits or is linked to a payment method.

## Next Steps

After setting up your API keys, proceed to the [Quick Start Guide](./quick-start.md) to begin using the GitHub Style Agent.

---

If you encounter any issues with API key setup, please check our [Troubleshooting Guide](./troubleshooting.md) or [open an issue](https://github.com/atef-ataya/github-style-vscode-extension/issues/new/choose) on our GitHub repository.