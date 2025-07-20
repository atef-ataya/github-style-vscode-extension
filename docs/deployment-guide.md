# Deployment Guide

## Overview

This guide provides instructions for deploying the GitHub Style Agent VS Code Extension in various environments. Whether you're deploying for personal use, team collaboration, or as a public extension, this document will help you through the process.

## Prerequisites

Before deploying, ensure you have:

- Completed the [API Keys Setup](./api-keys-setup.md)
- Installed all dependencies as described in the [Quick Start Guide](./quick-start.md)
- Tested the extension locally

## Deployment Options

### 1. Personal Use (Local Installation)

For personal use, you can run the extension directly from VS Code without publishing it.

#### Steps:

1. **Package the Extension**:

   ```bash
   npm run package
   ```

   This will create a `.vsix` file in the project directory.

2. **Install the Extension**:

   - Open VS Code
   - Go to the Extensions view (Ctrl+Shift+X)
   - Click on the "..." menu in the top-right corner
   - Select "Install from VSIX..."
   - Navigate to and select the `.vsix` file created in step 1

3. **Configure Environment Variables**:

   Create a `.env` file in your user directory with your API keys as described in the [API Keys Setup](./api-keys-setup.md) guide.

### 2. Team Deployment (Private Extension)

For team use, you can share the extension within your organization.

#### Steps:

1. **Package the Extension**:

   ```bash
   npm run package
   ```

2. **Share the VSIX File**:

   - Upload the `.vsix` file to a shared location accessible to your team
   - Provide installation instructions

3. **Team Configuration**:

   - Each team member should create their own `.env` file with their personal API keys
   - Consider setting up a shared configuration for repository analysis settings

### 3. Public Deployment (VS Code Marketplace)

To make your extension available to the public through the VS Code Marketplace:

#### Steps:

1. **Prepare for Publication**:

   - Update `package.json` with appropriate metadata:
     - Ensure `publisher`, `name`, `displayName`, `description`, and `version` are correctly set
     - Add relevant `keywords` for discoverability
     - Update `repository` and `bugs` URLs

2. **Create a Publisher Account**:

   - Sign up for an Azure DevOps account at [dev.azure.com](https://dev.azure.com)
   - Create a publisher ID through the [Visual Studio Marketplace publisher management page](https://marketplace.visualstudio.com/manage/publishers)

3. **Install vsce**:

   ```bash
   npm install -g @vscode/vsce
   ```

4. **Login and Publish**:

   ```bash
   vsce login <your-publisher-id>
   vsce publish
   ```

5. **Update Documentation**:

   - Update the README.md to include clear instructions for users to set up their own API keys
   - Emphasize security considerations for API keys

## Continuous Integration/Continuous Deployment (CI/CD)

For automated deployment, consider setting up a CI/CD pipeline:

### GitHub Actions Example

Create a `.github/workflows/publish.yml` file:

```yaml
name: Publish Extension

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
        with:
          node-version: 16
      - run: npm ci
      - run: npm run test
      - name: Publish to VS Code Marketplace
        run: npm run deploy
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

## Environment-Specific Configurations

### Production

For production deployments, consider:

- Setting stricter rate limits for API calls
- Implementing caching for repository analysis
- Adding telemetry for monitoring usage and errors

### Development

For development environments:

- Use mock data for testing when possible
- Set lower limits for repository analysis
- Enable verbose logging

## Security Considerations

- **Never include API keys in the extension package**
- Implement secure storage for user credentials
- Consider adding encryption for sensitive data
- Regularly audit dependencies for vulnerabilities

## Monitoring and Maintenance

- Set up error tracking and reporting
- Establish a regular update schedule
- Monitor API usage to avoid rate limiting
- Create a feedback channel for users

## Troubleshooting Deployment Issues

### Common Issues

- **Extension not loading**: Check VS Code version compatibility
- **API connection failures**: Verify network configuration and API key validity
- **Performance issues**: Consider optimizing repository analysis depth and caching

For more detailed troubleshooting, refer to the [Troubleshooting Guide](./troubleshooting.md).

---

If you encounter any deployment issues not covered in this guide, please [open an issue](https://github.com/atef-ataya/github-style-vscode-extension/issues/new/choose) on our GitHub repository.