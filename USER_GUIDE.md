# 📖 GitHub Style Agent - User Guide

## 🌟 Welcome to GitHub Style Agent

GitHub Style Agent is a powerful VS Code extension that analyzes your GitHub repositories to understand your coding style patterns and generates new code that matches your personal style preferences. Whether you're working on a new project or maintaining existing code, this extension helps ensure consistency across your codebase.

## 📋 Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Configuration](#configuration)
4. [Core Features](#core-features)
5. [Advanced Usage](#advanced-usage)
6. [Tips and Best Practices](#tips-and-best-practices)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

## 🚀 Installation

### Method 1: VS Code Marketplace (Recommended)

1. **Open VS Code**
2. **Go to Extensions** (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. **Search** for "GitHub Style Agent"
4. **Click Install** on the extension by Atef Ataya
5. **Reload VS Code** when prompted

### Method 2: Manual Installation

1. **Download** the `.vsix` file from the [GitHub releases page](https://github.com/atef-ataya/github-style-vscode-extension/releases)
2. **Open VS Code**
3. **Open Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`)
4. **Type** "Extensions: Install from VSIX..."
5. **Select** the downloaded `.vsix` file
6. **Restart VS Code**

### Verification

After installation, verify the extension is working:

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Type** "GitHub Style Agent"
3. **Select** "GitHub Style Agent: Analyze and Generate Code"
4. The extension interface should open

## 🎯 Getting Started

### Prerequisites

Before using the extension, you'll need:

1. **GitHub Account** with public repositories
2. **GitHub Personal Access Token** (for private repositories)
3. **OpenAI API Key** (for code generation)
4. **Internet Connection** (for API calls)

### First-Time Setup

#### 1. Obtain GitHub Personal Access Token

1. **Go to GitHub** → Settings → Developer settings → Personal access tokens
2. **Click** "Generate new token (classic)"
3. **Add description**: "GitHub Style Agent"
4. **Select scopes**:
   - `repo` (for private repositories)
   - `public_repo` (for public repositories)
   - `read:user` (to read user information)
5. **Generate token** and copy it (you won't see it again!)

#### 2. Get OpenAI API Key

1. **Visit** [OpenAI Platform](https://platform.openai.com/)
2. **Sign up** or log in to your account
3. **Go to** API Keys section
4. **Create** a new API key
5. **Copy** the key for later use

#### 3. Launch the Extension

1. **Open VS Code**
2. **Open Command Palette** (`Ctrl+Shift+P`)
3. **Type** "GitHub Style Agent: Analyze and Generate Code"
4. **Press Enter**

The extension interface will open in a new panel.

## ⚙️ Configuration

### Basic Configuration

When you first open the extension, you'll see a configuration form:

#### GitHub Settings
- **GitHub Token**: Paste your personal access token
- **Username**: Your GitHub username
- **Max Repositories**: Number of repositories to analyze (default: 10)
- **Analysis Depth**: Choose between:
  - **Quick**: Fast analysis of main files
  - **Detailed**: Comprehensive analysis of all files
  - **Deep**: Thorough analysis including dependencies

#### OpenAI Settings
- **API Key**: Your OpenAI API key
- **Model**: Choose the AI model (default: gpt-3.5-turbo)
- **Max Tokens**: Maximum response length (default: 2000)

### Advanced Configuration

#### File Type Preferences
Specify which file types to analyze:
- **JavaScript/TypeScript**: `.js`, `.ts`, `.jsx`, `.tsx`
- **Python**: `.py`
- **Java**: `.java`
- **C/C++**: `.c`, `.cpp`, `.h`
- **CSS/SCSS**: `.css`, `.scss`, `.sass`
- **HTML**: `.html`, `.htm`

#### Repository Filters
- **Include Forks**: Whether to analyze forked repositories
- **Minimum Stars**: Only analyze repositories with X+ stars
- **Language Filter**: Focus on specific programming languages
- **Date Range**: Analyze repositories from specific time periods

## 🎨 Core Features

### 1. Style Pattern Analysis

#### What It Analyzes

The extension examines your code to detect:

- **Indentation Style**: Spaces vs. tabs
- **Indentation Size**: 2, 4, or 8 spaces
- **Quote Preferences**: Single vs. double quotes
- **Semicolon Usage**: Always, never, or contextual
- **Bracket Placement**: Same line vs. new line
- **Naming Conventions**: camelCase, snake_case, PascalCase
- **Function Declarations**: Arrow functions vs. regular functions
- **Import Styles**: Named imports, default imports, namespace imports

#### Analysis Process

1. **Repository Discovery**: Finds your public repositories
2. **File Scanning**: Identifies relevant code files
3. **Pattern Detection**: Analyzes coding patterns
4. **Confidence Scoring**: Rates pattern reliability
5. **Style Profile Creation**: Generates your unique style profile

#### Understanding Results

The analysis results show:

```
Style Profile for @username
├── Indentation: 2 spaces (95% confidence)
├── Quotes: Single quotes (87% confidence)
├── Semicolons: Always (92% confidence)
├── Brackets: Same line (78% confidence)
└── Functions: Arrow functions (83% confidence)
```

**Confidence Levels**:
- **90-100%**: Very reliable pattern
- **70-89%**: Reliable pattern
- **50-69%**: Moderate pattern
- **Below 50%**: Inconsistent or insufficient data

### 2. AI-Powered Code Generation

#### How It Works

1. **Input Specification**: Describe what code you want
2. **Style Application**: Applies your detected style patterns
3. **Code Generation**: Creates code using OpenAI
4. **Style Validation**: Ensures output matches your style
5. **Result Display**: Shows generated code in Monaco Editor

#### Generation Examples

**Input**: "Create a React component for a user profile card"

**Generated Code** (matching your style):
```typescript
import React from 'react';

interface UserProfileProps {
  name: string;
  email: string;
  avatar?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ name, email, avatar }) => {
  return (
    <div className="user-profile">
      {avatar && <img src={avatar} alt={`${name}'s avatar`} />}
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
};

export default UserProfile;
```

### 3. Project Generation

#### Available Templates

- **React App**: Modern React application with TypeScript
- **Node.js API**: Express.js REST API with TypeScript
- **Vue.js App**: Vue 3 application with Composition API
- **Python Package**: Python package with proper structure
- **Next.js App**: Full-stack Next.js application
- **Custom Template**: Define your own project structure

#### Template Customization

Each template can be customized with:
- **Project Name**: Your project identifier
- **Description**: Project description
- **Author**: Your name and email
- **License**: MIT, Apache, GPL, etc.
- **Dependencies**: Additional packages to include
- **Features**: Optional features to enable

### 4. File Management

#### Export Options

- **Single File**: Export generated code as individual file
- **Project Archive**: Download complete project as ZIP
- **Copy to Clipboard**: Copy code for immediate use
- **Save to Workspace**: Save directly to current VS Code workspace

#### File Organization

Generated projects follow best practices:
```
my-project/
├── src/
│   ├── components/
│   ├── utils/
│   └── types/
├── tests/
├── docs/
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

## 🔥 Advanced Usage

### Custom Style Profiles

#### Creating Manual Profiles

If automatic analysis doesn't capture your preferences:

1. **Click** "Custom Style Profile"
2. **Configure** each style preference:
   - Indentation: Spaces/Tabs + Size
   - Quotes: Single/Double
   - Semicolons: Always/Never/Auto
   - Brackets: Same Line/New Line
   - Naming: camelCase/snake_case/PascalCase
3. **Save** profile for future use
4. **Apply** to code generation

#### Profile Management

- **Save Profiles**: Store multiple style profiles
- **Load Profiles**: Switch between different styles
- **Share Profiles**: Export profiles for team use
- **Import Profiles**: Load team or community profiles

### Batch Code Generation

#### Multiple File Generation

1. **Create Specification List**:
   ```
   - User authentication service
   - Database connection utility
   - API route handlers
   - React components for dashboard
   - Unit tests for services
   ```

2. **Run Batch Generation**
3. **Review Generated Files**
4. **Export as Project**

#### Template Chaining

Combine multiple templates:
- **Backend**: Node.js API template
- **Frontend**: React app template
- **Database**: MongoDB schema template
- **Testing**: Jest test template

### Integration with Existing Projects

#### Analyzing Current Project

1. **Open** your existing project in VS Code
2. **Run** "Analyze Current Workspace"
3. **Review** detected patterns
4. **Generate** new code matching existing style

#### Style Consistency Checking

- **Scan Files**: Check style consistency across project
- **Highlight Inconsistencies**: Show style violations
- **Suggest Fixes**: Recommend style corrections
- **Auto-Format**: Apply consistent formatting

### Team Collaboration

#### Shared Style Profiles

1. **Export Team Profile**:
   ```json
   {
     "name": "Team Style Guide",
     "indentStyle": "spaces",
     "indentSize": 2,
     "quoteStyle": "single",
     "semicolons": "always",
     "brackets": "sameLine"
   }
   ```

2. **Share with Team**: Distribute profile file
3. **Import Profile**: Team members load shared profile
4. **Consistent Generation**: All code follows team standards

#### Code Review Integration

- **Style Validation**: Check if generated code follows team style
- **Diff Highlighting**: Show style differences
- **Approval Workflow**: Review before applying changes

## 💡 Tips and Best Practices

### Maximizing Analysis Accuracy

#### Repository Selection
- **Use Recent Repositories**: Newer code reflects current style
- **Include Diverse Projects**: Different project types show consistent patterns
- **Avoid Generated Code**: Exclude auto-generated or copied code
- **Focus on Main Languages**: Analyze repositories in your primary languages

#### Code Quality
- **Well-Maintained Repos**: Use repositories with consistent commit history
- **Personal Projects**: Your own code reflects your true style
- **Collaborative Projects**: Shows how you adapt to team styles

### Effective Code Generation

#### Writing Good Specifications

**Good Example**:
```
Create a TypeScript class for managing user authentication.
Include methods for login, logout, and token validation.
Use async/await for API calls.
Include proper error handling and TypeScript interfaces.
```

**Poor Example**:
```
Make a login thing
```

#### Iterative Refinement

1. **Start Simple**: Begin with basic functionality
2. **Add Details**: Specify additional requirements
3. **Refine Output**: Adjust based on generated results
4. **Test Integration**: Ensure code works in your project

### Performance Optimization

#### Efficient Analysis
- **Limit Repository Count**: Start with 5-10 repositories
- **Use Quick Analysis**: For initial exploration
- **Cache Results**: Save analysis results for reuse
- **Filter File Types**: Focus on relevant languages

#### Smart Generation
- **Specific Requests**: Be precise about requirements
- **Reasonable Scope**: Don't generate entire applications at once
- **Incremental Building**: Generate components separately
- **Review and Refine**: Iterate on generated code

### Security Best Practices

#### API Key Management
- **Environment Variables**: Store keys in `.env` files
- **Never Commit Keys**: Add `.env` to `.gitignore`
- **Rotate Regularly**: Update API keys periodically
- **Limit Permissions**: Use minimal required scopes

#### Code Review
- **Review Generated Code**: Always review before using
- **Test Thoroughly**: Ensure generated code works correctly
- **Security Scan**: Check for potential vulnerabilities
- **Documentation**: Document generated components

## 🔧 Troubleshooting

### Common Issues

#### Extension Not Loading

**Problem**: Extension doesn't appear in Command Palette

**Solutions**:
1. **Restart VS Code** completely
2. **Check Extension Status** in Extensions panel
3. **Reinstall Extension** if necessary
4. **Check VS Code Version** (requires 1.60+)

#### Authentication Errors

**Problem**: "Invalid GitHub token" or "Unauthorized"

**Solutions**:
1. **Verify Token**: Check token is copied correctly
2. **Check Permissions**: Ensure token has required scopes
3. **Token Expiration**: Generate new token if expired
4. **Username Match**: Verify username matches token owner

#### API Rate Limits

**Problem**: "Rate limit exceeded" errors

**Solutions**:
1. **Wait and Retry**: GitHub rate limits reset hourly
2. **Reduce Repository Count**: Analyze fewer repositories
3. **Use Authenticated Requests**: Tokens have higher limits
4. **Spread Analysis**: Analyze repositories over time

#### Code Generation Failures

**Problem**: OpenAI API errors or poor code quality

**Solutions**:
1. **Check API Key**: Verify OpenAI key is valid
2. **Improve Specifications**: Be more specific about requirements
3. **Adjust Model Settings**: Try different models or parameters
4. **Check Account Credits**: Ensure OpenAI account has credits

#### Performance Issues

**Problem**: Slow analysis or generation

**Solutions**:
1. **Reduce Scope**: Analyze fewer files or repositories
2. **Use Quick Analysis**: Switch to faster analysis mode
3. **Check Internet**: Ensure stable internet connection
4. **Close Other Extensions**: Reduce VS Code resource usage

### Error Messages

#### "Repository not found"
- **Check Username**: Verify GitHub username is correct
- **Repository Privacy**: Ensure repositories are public or token has access
- **Repository Existence**: Confirm repositories exist

#### "Invalid specification"
- **Be More Specific**: Provide clearer code requirements
- **Check Language**: Specify programming language if ambiguous
- **Simplify Request**: Break complex requests into smaller parts

#### "Style analysis incomplete"
- **Insufficient Code**: Repository may have too little code
- **Unsupported Language**: Language may not be supported
- **File Access**: Check if files are accessible

### Getting Help

#### Self-Help Resources
1. **Check This Guide**: Review relevant sections
2. **Extension Documentation**: Read README and docs
3. **GitHub Issues**: Search existing issues
4. **VS Code Logs**: Check Output panel for errors

#### Community Support
1. **GitHub Discussions**: Ask questions in repository discussions
2. **Stack Overflow**: Tag questions with "github-style-agent"
3. **VS Code Community**: General VS Code extension help

#### Reporting Bugs

When reporting issues, include:
- **VS Code Version**: Help → About
- **Extension Version**: From Extensions panel
- **Error Messages**: Copy exact error text
- **Steps to Reproduce**: Detailed reproduction steps
- **Sample Code**: Minimal example if applicable

## ❓ FAQ

### General Questions

**Q: Is my code sent to external servers?**
A: Only code specifications are sent to OpenAI for generation. Your existing code stays local during analysis.

**Q: Can I use this offline?**
A: No, the extension requires internet access for GitHub and OpenAI APIs.

**Q: Does this work with private repositories?**
A: Yes, with a GitHub token that has appropriate permissions.

**Q: What programming languages are supported?**
A: JavaScript, TypeScript, Python, Java, C/C++, CSS, HTML, and more.

### Technical Questions

**Q: How accurate is the style analysis?**
A: Accuracy depends on code quantity and consistency. More code generally means better analysis.

**Q: Can I modify the generated code?**
A: Yes, all generated code can be edited in the Monaco Editor before saving.

**Q: Does this replace my IDE's formatter?**
A: No, it complements existing tools by generating new code in your style.

**Q: Can I use custom AI models?**
A: Currently supports OpenAI models. Custom model support may be added in future versions.

### Pricing Questions

**Q: Is the extension free?**
A: The extension is free, but requires API keys for GitHub and OpenAI services.

**Q: What are the API costs?**
A: GitHub API is free for public repositories. OpenAI charges per token used.

**Q: How can I minimize costs?**
A: Use shorter specifications, limit repository analysis, and choose efficient models.

### Privacy Questions

**Q: What data is collected?**
A: Only necessary data for analysis and generation. No personal code is stored.

**Q: Where are API keys stored?**
A: Locally in VS Code settings. Never transmitted except to respective APIs.

**Q: Can I delete my data?**
A: Yes, clear VS Code settings or uninstall the extension to remove local data.

---

## 🎉 Conclusion

Congratulations! You're now ready to use GitHub Style Agent to analyze your coding style and generate consistent, high-quality code. Remember:

- **Start Simple**: Begin with basic analysis and generation
- **Iterate and Improve**: Refine your specifications over time
- **Review Generated Code**: Always review before using in production
- **Share with Team**: Use shared profiles for team consistency
- **Stay Updated**: Check for extension updates regularly

Happy coding! 🚀

---

## 📞 Support and Resources

- **GitHub Repository**: [github-style-vscode-extension](https://github.com/atef-ataya/github-style-vscode-extension)
- **Issue Tracker**: [Report bugs and request features](https://github.com/atef-ataya/github-style-vscode-extension/issues)
- **Discussions**: [Community discussions](https://github.com/atef-ataya/github-style-vscode-extension/discussions)
- **Documentation**: [Complete documentation](https://github.com/atef-ataya/github-style-vscode-extension/docs)

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Author**: Atef Ataya