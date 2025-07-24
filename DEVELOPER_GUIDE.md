# 👨‍💻 GitHub Style Agent - Developer Guide

## 📋 Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Building and Testing](#building-and-testing)
5. [Debugging](#debugging)
6. [Adding New Features](#adding-new-features)
7. [Code Style Guidelines](#code-style-guidelines)
8. [Performance Optimization](#performance-optimization)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## 🚀 Development Setup

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **VS Code**: Latest version
- **Git**: For version control
- **TypeScript**: Global installation recommended

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/atef-ataya/github-style-vscode-extension.git
   cd github-style-vscode-extension
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (for testing)
   ```

4. **Build the Project**
   ```bash
   npm run build
   ```

5. **Open in VS Code**
   ```bash
   code .
   ```

### Development Environment Configuration

#### VS Code Settings

Create or update `.vscode/settings.json`:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/out": true,
    "**/*.vsix": true
  }
}
```

#### Recommended Extensions

- **TypeScript and JavaScript Language Features** (built-in)
- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **GitLens** (eamodio.gitlens)
- **Thunder Client** (rangav.vscode-thunder-client) - for API testing

## 📁 Project Structure

### Core Files

```
Trae/
├── 📄 extension.ts              # Main extension entry point
├── 📄 CodeStyleEngine.ts        # Core business logic
├── 📄 webviewContent.ts         # UI and webview management
├── 📄 package.json              # Extension manifest
├── 📄 tsconfig.json             # TypeScript configuration
├── 📄 webpack.config.js         # Build configuration
└── 📄 .eslintrc.json            # Linting rules
```

### Source Code Organization

```
src/
├── analyzers/
│   └── PatternAnalyzer.ts       # Style pattern detection logic
├── generators/
│   └── CodeGenerator.ts         # AI code generation logic
├── utils/
│   └── ProgressTracker.ts       # Progress monitoring utilities
├── enhanced/
│   ├── project-generator.ts     # Project template generation
│   └── template-engine.ts       # Template processing engine
└── webview/
    ├── enhanced-ui.ts           # Enhanced UI components
    ├── file-manager.ts          # File operation utilities
    └── project-templates.ts     # Project template definitions
```

### Configuration Files

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "out",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "out",
    "dist"
  ]
}
```

#### `webpack.config.js`
```javascript
const path = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  devtool: 'nosources-source-map'
};
```

## 🔄 Development Workflow

### Daily Development Process

1. **Start Development Mode**
   ```bash
   npm run watch
   ```

2. **Open Extension Host**
   - Press `F5` in VS Code
   - Or use "Run Extension" from Run and Debug panel

3. **Make Changes**
   - Edit TypeScript files
   - Changes are automatically compiled (watch mode)

4. **Test Changes**
   - Reload extension host window (`Ctrl+R`)
   - Test functionality in extension host

5. **Debug Issues**
   - Use VS Code debugger
   - Check Developer Console (`Help > Toggle Developer Tools`)

### Git Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Make Changes and Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

3. **Push and Create PR**
   ```bash
   git push origin feature/new-feature-name
   ```

### Commit Message Convention

Use conventional commits format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 🔨 Building and Testing

### Build Commands

```bash
# Development build with watch mode
npm run watch

# Production build
npm run build

# TypeScript compilation only
npm run compile

# Type checking without output
npm run type-check

# Clean build artifacts
npm run clean
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Check Prettier formatting
npm run format:check

# Apply Prettier formatting
npm run format

# Run all checks (CI pipeline)
npm run ci
```

### Package and Install

```bash
# Create VSIX package
npm run package

# Install the packaged extension
npm run package:install
```

### Testing Strategy

#### Manual Testing Checklist

1. **Extension Activation**
   - [ ] Extension activates without errors
   - [ ] Command appears in Command Palette
   - [ ] Webview opens correctly

2. **GitHub Integration**
   - [ ] Valid token authentication works
   - [ ] Invalid token shows appropriate error
   - [ ] Repository discovery functions
   - [ ] File content retrieval works

3. **Pattern Analysis**
   - [ ] Analyzes multiple file types
   - [ ] Detects indentation patterns
   - [ ] Identifies quote preferences
   - [ ] Calculates confidence scores

4. **Code Generation**
   - [ ] Generates code with correct style
   - [ ] Handles various specifications
   - [ ] Applies detected patterns
   - [ ] Shows appropriate error messages

5. **UI/UX**
   - [ ] Monaco Editor loads correctly
   - [ ] Progress indicators work
   - [ ] Form validation functions
   - [ ] File operations work

#### Automated Testing (Future Enhancement)

```typescript
// Example test structure
describe('PatternAnalyzer', () => {
  let analyzer: PatternAnalyzer;

  beforeEach(() => {
    analyzer = new PatternAnalyzer();
  });

  it('should detect spaces indentation', () => {
    const code = `function test() {
    return true;
}`;
    analyzer.feed(code);
    const style = analyzer.getStyle();
    expect(style.indentStyle).toBe('spaces');
  });

  it('should detect single quotes preference', () => {
    const code = `const message = 'Hello World';`;
    analyzer.feed(code);
    const style = analyzer.getStyle();
    expect(style.quoteStyle).toBe('single');
  });
});
```

## 🐛 Debugging

### VS Code Debugging Setup

#### Launch Configuration (`.vscode/launch.json`)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "${workspaceFolder}:tsc:build"
    },
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
      ],
      "outFiles": [
        "${workspaceFolder}/out/test/**/*.js"
      ],
      "preLaunchTask": "${workspaceFolder}:tsc:build"
    }
  ]
}
```

### Debugging Techniques

#### 1. Console Logging

```typescript
// Use conditional logging
const logger = {
  info: (message: string) => {
    if (process.env.DEBUG === 'true') {
      console.log(`[INFO] ${message}`);
    }
  },
  error: (message: string, error?: unknown) => {
    if (process.env.DEBUG === 'true') {
      console.error(`[ERROR] ${message}`, error);
    }
  }
};
```

#### 2. Breakpoint Debugging

- Set breakpoints in TypeScript files
- Use "Run Extension" configuration
- Step through code execution
- Inspect variables and call stack

#### 3. Webview Debugging

```typescript
// In webview content
console.log('Webview message:', message);

// In extension
panel.webview.onDidReceiveMessage(message => {
  console.log('Received from webview:', message);
});
```

#### 4. Error Handling

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error);
  
  // Show user-friendly message
  vscode.window.showErrorMessage(
    `Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  );
  
  // Report to webview
  panel.webview.postMessage({
    command: 'error',
    message: error.message
  });
}
```

## ✨ Adding New Features

### 1. Adding a New Analyzer

```typescript
// src/analyzers/NewAnalyzer.ts
export class NewAnalyzer {
  private patterns: Record<string, number> = {};

  analyze(content: string): AnalysisResult {
    // Implementation
    return {
      pattern: 'detected-pattern',
      confidence: 0.85
    };
  }
}
```

### 2. Adding a New Generator

```typescript
// src/generators/NewGenerator.ts
export class NewGenerator {
  constructor(private config: GeneratorConfig) {}

  async generate(spec: string, style: StyleProfile): Promise<string> {
    // Implementation
    return generatedCode;
  }
}
```

### 3. Adding New Webview Commands

```typescript
// In extension.ts
panel.webview.onDidReceiveMessage(async (message) => {
  switch (message.command) {
    case 'newCommand':
      await handleNewCommand(message, panel);
      break;
    // ... existing cases
  }
});

async function handleNewCommand(
  message: NewCommandMessage,
  panel: vscode.WebviewPanel
): Promise<void> {
  try {
    // Implementation
    panel.webview.postMessage({
      command: 'newCommandResponse',
      data: result
    });
  } catch (error) {
    panel.webview.postMessage({
      command: 'error',
      message: error.message
    });
  }
}
```

### 4. Adding New UI Components

```typescript
// In webviewContent.ts
function createNewComponent(): string {
  return `
    <div class="new-component">
      <h3>New Feature</h3>
      <button onclick="handleNewFeature()">Execute</button>
    </div>
  `;
}

// Add to main HTML
const newComponentHtml = createNewComponent();
```

## 📏 Code Style Guidelines

### TypeScript Best Practices

1. **Use Strict Type Checking**
   ```typescript
   // Good
   function processUser(user: User): UserResult {
     return { id: user.id, name: user.name };
   }

   // Avoid
   function processUser(user: any): any {
     return { id: user.id, name: user.name };
   }
   ```

2. **Prefer Interfaces Over Types**
   ```typescript
   // Good
   interface UserConfig {
     name: string;
     age: number;
   }

   // Use types for unions/primitives
   type Status = 'active' | 'inactive';
   ```

3. **Use Async/Await Over Promises**
   ```typescript
   // Good
   async function fetchData(): Promise<Data> {
     try {
       const response = await api.getData();
       return response.data;
     } catch (error) {
       throw new Error(`Failed to fetch: ${error.message}`);
     }
   }
   ```

4. **Error Handling Patterns**
   ```typescript
   // Good
   class ApiError extends Error {
     constructor(
       message: string,
       public code: string,
       public statusCode?: number
     ) {
       super(message);
       this.name = 'ApiError';
     }
   }

   // Usage
   if (response.status !== 200) {
     throw new ApiError(
       'Request failed',
       'REQUEST_FAILED',
       response.status
     );
   }
   ```

### Code Organization

1. **File Naming**
   - Use PascalCase for classes: `PatternAnalyzer.ts`
   - Use camelCase for utilities: `progressTracker.ts`
   - Use kebab-case for components: `enhanced-ui.ts`

2. **Import Organization**
   ```typescript
   // External libraries
   import * as vscode from 'vscode';
   import { Octokit } from '@octokit/rest';

   // Internal modules
   import { PatternAnalyzer } from './src/analyzers/PatternAnalyzer';
   import { CodeGenerator } from './src/generators/CodeGenerator';

   // Types
   import { SimpleStyleProfile, AnalysisDepth } from './types';
   ```

3. **Function Documentation**
   ```typescript
   /**
    * Analyzes multiple repositories to detect coding style patterns.
    * 
    * @param token - GitHub personal access token
    * @param username - GitHub username to analyze
    * @param maxRepos - Maximum number of repositories to analyze
    * @param analysisDepth - Depth of analysis to perform
    * @returns Promise resolving to detected style profile
    * @throws {Error} When token or username is invalid
    */
   async function analyzeMultipleReposPatterns(
     token: string,
     username: string,
     maxRepos = 10,
     analysisDepth: AnalysisDepth = 'detailed'
   ): Promise<SimpleStyleProfile> {
     // Implementation
   }
   ```

## ⚡ Performance Optimization

### 1. Efficient API Usage

```typescript
// Batch API requests
const promises = files.map(file => 
  octokit.repos.getContent({
    owner: username,
    repo: repoName,
    path: file.path
  })
);

const results = await Promise.allSettled(promises);
```

### 2. Memory Management

```typescript
// Clean up large objects
class PatternAnalyzer {
  private cache = new Map<string, AnalysisResult>();

  cleanup(): void {
    this.cache.clear();
  }
}
```

### 3. Lazy Loading

```typescript
// Load Monaco Editor only when needed
let monacoEditor: any = null;

async function getMonacoEditor() {
  if (!monacoEditor) {
    monacoEditor = await import('monaco-editor');
  }
  return monacoEditor;
}
```

### 4. Debouncing User Input

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Usage
const debouncedAnalysis = debounce(analyzeCode, 500);
```

## 🚀 Deployment

### 1. Pre-deployment Checklist

- [ ] All tests pass
- [ ] Code is linted and formatted
- [ ] Version number updated in `package.json`
- [ ] CHANGELOG updated
- [ ] Documentation updated
- [ ] No sensitive data in code

### 2. Building for Production

```bash
# Clean previous builds
npm run clean

# Run full CI pipeline
npm run ci

# Build production version
npm run build

# Package extension
npm run package
```

### 3. Publishing to VS Code Marketplace

```bash
# Install vsce globally
npm install -g vsce

# Login to marketplace
vsce login <publisher-name>

# Publish extension
vsce publish

# Or publish specific version
vsce publish 1.2.3
```

### 4. GitHub Release

```bash
# Create and push tag
git tag v1.2.3
git push origin v1.2.3

# Create GitHub release with VSIX file
# Use GitHub web interface or CLI
```

## 🔧 Troubleshooting

### Common Development Issues

#### 1. Extension Not Loading

**Symptoms**: Extension doesn't appear in Command Palette

**Solutions**:
- Check `package.json` activation events
- Verify command registration in `extension.ts`
- Check for TypeScript compilation errors
- Reload VS Code window

#### 2. Webview Not Displaying

**Symptoms**: Blank webview panel

**Solutions**:
- Check Content Security Policy
- Verify resource URIs are correct
- Check browser console for errors
- Ensure nonce is properly set

#### 3. API Calls Failing

**Symptoms**: GitHub/OpenAI API errors

**Solutions**:
- Verify API keys are valid
- Check rate limits
- Ensure proper error handling
- Test with minimal requests

#### 4. Build Errors

**Symptoms**: TypeScript compilation fails

**Solutions**:
- Check import paths
- Verify type definitions
- Update dependencies
- Clear `node_modules` and reinstall

### Debug Commands

```bash
# Check TypeScript errors
npx tsc --noEmit

# Verbose webpack build
npx webpack --config webpack.config.js --mode development

# Check ESLint issues
npx eslint . --ext .ts,.js

# Analyze bundle size
npx webpack-bundle-analyzer dist/extension.js
```

### Performance Profiling

```typescript
// Add timing measurements
const startTime = Date.now();
const result = await expensiveOperation();
const duration = Date.now() - startTime;
console.log(`Operation took ${duration}ms`);

// Memory usage tracking
const memBefore = process.memoryUsage();
const result = await operation();
const memAfter = process.memoryUsage();
console.log('Memory delta:', {
  heapUsed: memAfter.heapUsed - memBefore.heapUsed,
  external: memAfter.external - memBefore.external
});
```

---

## 📚 Additional Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [GitHub REST API](https://docs.github.com/en/rest)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)

## 🤝 Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed contribution guidelines.

## 📞 Support

For development questions:
1. Check this developer guide
2. Review existing issues on GitHub
3. Create a new issue with detailed information
4. Join our developer community discussions