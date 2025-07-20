# Troubleshooting Guide

## Overview

This guide addresses common issues you might encounter when using the GitHub Style Agent VS Code Extension. If you're experiencing problems, follow the troubleshooting steps below before opening an issue on GitHub.

## Installation Issues

### Extension Fails to Install

**Symptoms:**
- Error messages during installation
- Extension doesn't appear in VS Code extensions list

**Solutions:**

1. **Check VS Code Version**
   - Ensure you're using VS Code version 1.60 or later
   - Check your version: Help > About

2. **Verify Node.js Version**
   - The extension requires Node.js v14 or later
   - Check your version: `node --version`
   - Update if necessary: [Node.js Downloads](https://nodejs.org/)

3. **Clear VS Code Extensions Cache**
   - Close VS Code
   - Delete the extensions cache folder:
     - Windows: `%USERPROFILE%\.vscode\extensions`
     - macOS/Linux: `~/.vscode/extensions`
   - Restart VS Code and try installing again

4. **Install from VSIX Manually**
   - Run `npm run package` to create a VSIX file
   - In VS Code, go to Extensions view
   - Click "..." > "Install from VSIX"
   - Select the generated VSIX file

## Configuration Issues

### API Keys Not Working

**Symptoms:**
- "Authentication failed" errors
- "Invalid API key" messages

**Solutions:**

1. **Verify API Keys**
   - Double-check your GitHub token and OpenAI API key for typos
   - Ensure your GitHub token has the `repo` scope
   - Test your OpenAI API key with a simple API call

2. **Check Environment Variables**
   - Ensure your `.env` file is in the correct location
   - Verify the format of your environment variables
   - Try setting the variables directly in your system environment

3. **Regenerate API Keys**
   - GitHub: Create a new Personal Access Token
   - OpenAI: Generate a new API key
   - Update your `.env` file with the new keys

### Repository Analysis Fails

**Symptoms:**
- "Failed to analyze repositories" error
- Analysis process hangs or times out

**Solutions:**

1. **Check GitHub Username**
   - Verify your GitHub username is correct in the `.env` file
   - Ensure the case matches exactly (GitHub usernames are case-sensitive)

2. **Reduce Analysis Scope**
   - Set `MAX_REPOS_TO_ANALYZE` to a lower number (e.g., 5)
   - Change `ANALYSIS_DEPTH` to "basic"

3. **Check GitHub Rate Limits**
   - GitHub API has rate limits that might be exceeded
   - Wait an hour and try again
   - Check your rate limit status: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit`

## Runtime Issues

### Extension Doesn't Load

**Symptoms:**
- Extension doesn't appear in VS Code
- Command palette doesn't show CodeStyle commands

**Solutions:**

1. **Check Extension Activation**
   - Open VS Code Developer Tools: Help > Toggle Developer Tools
   - Look for errors related to the extension in the Console tab

2. **Reinstall the Extension**
   - Uninstall the extension: Right-click on it in the Extensions view and select "Uninstall"
   - Restart VS Code
   - Reinstall the extension

3. **Check Extension Dependencies**
   - Run `npm install` in the extension directory
   - Ensure all dependencies are correctly installed

### Code Generation Fails

**Symptoms:**
- "Failed to generate code" error
- Generation process hangs or times out

**Solutions:**

1. **Check OpenAI API Status**
   - Visit [OpenAI Status](https://status.openai.com/) to check if the service is experiencing issues

2. **Verify OpenAI API Key Quota**
   - Ensure your OpenAI account has available credits
   - Check if you've reached your usage limits

3. **Simplify Your Prompt**
   - Try a simpler prompt to test if generation works
   - Break complex requests into smaller parts

4. **Check Network Connection**
   - Ensure you have a stable internet connection
   - Try connecting to a different network if possible

## Performance Issues

### Slow Repository Analysis

**Symptoms:**
- Analysis takes a very long time to complete
- VS Code becomes unresponsive during analysis

**Solutions:**

1. **Reduce Analysis Scope**
   - Lower the `MAX_REPOS_TO_ANALYZE` value
   - Set `ANALYSIS_DEPTH` to "basic"

2. **Check Repository Size**
   - Very large repositories can slow down analysis
   - Consider excluding specific repositories

3. **Increase System Resources**
   - Close other resource-intensive applications
   - Ensure your computer meets the minimum requirements

### Slow Code Generation

**Symptoms:**
- Code generation takes a long time
- Timeout errors during generation

**Solutions:**

1. **Use a Faster OpenAI Model**
   - Try using "gpt-3.5-turbo" instead of "gpt-4"
   - Adjust the model in the extension settings

2. **Simplify Your Prompt**
   - Break down complex requests into smaller parts
   - Be more specific in your prompts

3. **Check Network Speed**
   - Run a speed test to check your internet connection
   - Try a different network if possible

## Common Error Messages

### "GitHub API rate limit exceeded"

**Cause:** You've made too many requests to the GitHub API in a short period.

**Solution:**
- Wait for the rate limit to reset (usually one hour)
- Use a GitHub token with higher rate limits
- Reduce the frequency of repository analysis

### "Invalid Authentication"

**Cause:** Your API key is incorrect or has been revoked.

**Solution:**
- Generate a new API key
- Ensure the key is correctly formatted in your `.env` file
- Check for leading/trailing whitespace in your API key

### "Cannot connect to OpenAI API"

**Cause:** Network issues or OpenAI service disruption.

**Solution:**
- Check your internet connection
- Verify OpenAI service status
- Try again later if the service is experiencing issues

## Still Having Issues?

If you've tried all the relevant troubleshooting steps and are still experiencing problems:

1. **Check GitHub Issues**
   - Search the [GitHub repository issues](https://github.com/atef-ataya/github-style-vscode-extension/issues) to see if others have reported the same problem

2. **Gather Diagnostic Information**
   - VS Code version
   - Node.js version
   - Extension version
   - Error messages (from Developer Tools console)
   - Steps to reproduce the issue

3. **Open a New Issue**
   - Provide all the diagnostic information
   - Describe the problem in detail
   - Include steps to reproduce the issue
   - Mention troubleshooting steps you've already tried

---

If you need further assistance, please [open an issue](https://github.com/atef-ataya/github-style-vscode-extension/issues/new/choose) on our GitHub repository or contact the maintainers directly.