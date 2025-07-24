# 📚 GitHub Style Agent - API Documentation

## 📋 Table of Contents

1. [Core Interfaces](#core-interfaces)
2. [Main Classes](#main-classes)
3. [Type Definitions](#type-definitions)
4. [Extension API](#extension-api)
5. [Webview Messages](#webview-messages)
6. [Error Handling](#error-handling)
7. [Usage Examples](#usage-examples)

## 🔧 Core Interfaces

### SimpleStyleProfile

Represents the detected coding style patterns from repository analysis.

```typescript
interface SimpleStyleProfile {
  indentStyle: 'spaces' | 'tabs';
  quoteStyle: 'single' | 'double';
  useSemicolons: boolean;
  raw: Record<string, number>;
  fileCount: number;
}
```

**Properties:**
- `indentStyle`: Detected indentation preference
- `quoteStyle`: Detected quote style preference
- `useSemicolons`: Whether semicolons are commonly used
- `raw`: Raw analysis data with pattern counts
- `fileCount`: Number of files analyzed

### AnalysisProgress

Tracks the progress of repository analysis and code generation.

```typescript
interface AnalysisProgress {
  stage: 'fetching' | 'analyzing' | 'generating' | 'complete';
  progress: number; // 0-100
  currentRepository?: string;
  currentFile?: string;
  message: string;
  estimatedTimeRemaining?: number;
}
```

**Properties:**
- `stage`: Current processing stage
- `progress`: Completion percentage (0-100)
- `currentRepository`: Currently processing repository name
- `currentFile`: Currently processing file name
- `message`: Human-readable status message
- `estimatedTimeRemaining`: Estimated milliseconds remaining

### CodeGenerationResponse

Response from AI code generation with metadata.

```typescript
interface CodeGenerationResponse {
  code: string;
  explanation?: string;
  suggestions?: string[];
  confidence: number;
  tokensUsed: number;
  estimatedQuality: 'low' | 'medium' | 'high';
  followUpQuestions?: string[];
}
```

**Properties:**
- `code`: Generated code content
- `explanation`: Optional explanation of the generated code
- `suggestions`: Optional improvement suggestions
- `confidence`: Confidence score (0-1)
- `tokensUsed`: Number of tokens consumed in generation
- `estimatedQuality`: Estimated quality assessment
- `followUpQuestions`: Optional follow-up questions for refinement

## 🏗️ Main Classes

### PatternAnalyzer

Analyzes source code to detect coding style patterns.

```typescript
class PatternAnalyzer {
  constructor();
  
  feed(content: string, analysisDepth?: AnalysisDepth): void;
  getStyle(): SimpleStyleProfile;
}
```

#### Methods

##### `feed(content: string, analysisDepth?: AnalysisDepth): void`

Processes source code content to extract style patterns.

**Parameters:**
- `content`: Source code content to analyze
- `analysisDepth`: Analysis depth ('basic' | 'detailed')

**Example:**
```typescript
const analyzer = new PatternAnalyzer();
analyzer.feed(sourceCode, 'detailed');
```

##### `getStyle(): SimpleStyleProfile`

Returns the accumulated style analysis results.

**Returns:** `SimpleStyleProfile` object with detected patterns

**Example:**
```typescript
const styleProfile = analyzer.getStyle();
console.log(`Indent style: ${styleProfile.indentStyle}`);
```

### CodeGenerator

Generates code using AI based on detected style patterns.

```typescript
class CodeGenerator {
  constructor(openai: OpenAI, style: SimpleStyleProfile);
  
  generateCode(input: { spec: string; style: SimpleStyleProfile }): Promise<string>;
}
```

#### Constructor

```typescript
constructor(openai: OpenAI, style: SimpleStyleProfile)
```

**Parameters:**
- `openai`: Configured OpenAI client instance
- `style`: Style profile to apply to generated code

#### Methods

##### `generateCode(input: GenerationInput): Promise<string>`

Generates code based on specification and style preferences.

**Parameters:**
```typescript
interface GenerationInput {
  spec: string;           // Code specification/requirements
  style: SimpleStyleProfile; // Style preferences to apply
}
```

**Returns:** Promise resolving to generated code string

**Example:**
```typescript
const generator = new CodeGenerator(openaiClient, styleProfile);
const code = await generator.generateCode({
  spec: "Create a REST API endpoint for user authentication",
  style: styleProfile
});
```

### ProgressTracker

Tracks and reports progress during long-running operations.

```typescript
class ProgressTracker {
  constructor(onProgressUpdate?: (progress: AnalysisProgress) => void);
  
  setTotalRepositories(count: number): void;
  updateStage(stage: string, message: string, repo?: string, file?: string): void;
  updateRepositoryProgress(current: number, total: number, repoName: string): void;
  updateFileProgress(current: number, total: number, fileName: string, repoName: string): void;
  updateGenerationProgress(message: string): void;
  complete(message?: string): void;
  error(message: string): void;
  getCurrentProgress(): AnalysisProgress;
  getElapsedTime(): number;
  static formatTime(milliseconds: number): string;
}
```

#### Constructor

```typescript
constructor(onProgressUpdate?: (progress: AnalysisProgress) => void)
```

**Parameters:**
- `onProgressUpdate`: Optional callback for progress updates

#### Methods

##### `setTotalRepositories(count: number): void`

Sets the total number of repositories for time estimation.

##### `updateStage(stage, message, repo?, file?): void`

Updates the current processing stage.

**Parameters:**
- `stage`: Current stage ('fetching' | 'analyzing' | 'generating' | 'complete')
- `message`: Status message
- `repo`: Optional current repository name
- `file`: Optional current file name

##### `updateRepositoryProgress(current, total, repoName): void`

Updates progress for repository processing.

##### `updateFileProgress(current, total, fileName, repoName): void`

Updates progress for file processing within a repository.

##### `complete(message?): void`

Marks the operation as complete.

##### `error(message): void`

Reports an error state.

**Example:**
```typescript
const tracker = new ProgressTracker((progress) => {
  console.log(`${progress.stage}: ${progress.progress}% - ${progress.message}`);
});

tracker.setTotalRepositories(10);
tracker.updateStage('fetching', 'Discovering repositories...');
```

## 📝 Type Definitions

### AnalysisDepth

```typescript
type AnalysisDepth = 'basic' | 'detailed';
```

Defines the depth of code analysis to perform.

### GenerationOptions

```typescript
interface GenerationOptions {
  model: string;
  complexity: 'simple' | 'moderate' | 'complex';
  includeTests: boolean;
  includeComments: boolean;
  template: string;
  useTypeScript: boolean;
  initGit: boolean;
}
```

Configuration options for enhanced code generation.

### GitHubRepository

```typescript
interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string | null;
  updated_at: string | null;
  pushed_at: string | null;
  size: number;
  stargazers_count: number;
  language: string | null;
  default_branch: string;
}
```

Represents a GitHub repository from the API.

## 🔌 Extension API

### Main Functions

#### `analyzeMultipleReposPatterns()`

```typescript
function analyzeMultipleReposPatterns(
  token: string,
  username: string,
  maxRepos?: number,
  analysisDepth?: AnalysisDepth
): Promise<SimpleStyleProfile>
```

Analyzes multiple repositories to detect coding style patterns.

**Parameters:**
- `token`: GitHub personal access token
- `username`: GitHub username to analyze
- `maxRepos`: Maximum number of repositories to analyze (default: 10)
- `analysisDepth`: Analysis depth (default: 'detailed')

**Returns:** Promise resolving to detected style profile

**Throws:**
- `Error`: If token or username is missing
- `Error`: If GitHub API calls fail

**Example:**
```typescript
try {
  const profile = await analyzeMultipleReposPatterns(
    'ghp_xxxxxxxxxxxx',
    'username',
    15,
    'detailed'
  );
  console.log('Detected style:', profile);
} catch (error) {
  console.error('Analysis failed:', error.message);
}
```

#### `generateCodeSample()`

```typescript
function generateCodeSample(
  openaiApiKey: string,
  styleProfile: SimpleStyleProfile,
  codeSpec: string
): Promise<string>
```

Generates code sample based on style profile and specification.

**Parameters:**
- `openaiApiKey`: OpenAI API key
- `styleProfile`: Detected or provided style profile
- `codeSpec`: Code specification/requirements

**Returns:** Promise resolving to generated code

**Throws:**
- `Error`: If API key or specification is missing
- `Error`: If OpenAI API calls fail

**Example:**
```typescript
try {
  const code = await generateCodeSample(
    'sk-xxxxxxxxxxxx',
    styleProfile,
    'Create a user authentication middleware for Express.js'
  );
  console.log('Generated code:', code);
} catch (error) {
  console.error('Generation failed:', error.message);
}
```

### Extension Activation

#### `activate()`

```typescript
function activate(context: vscode.ExtensionContext): void
```

Activates the VS Code extension and registers commands.

**Parameters:**
- `context`: VS Code extension context

**Registers:**
- Command: `github-style-agent.generate-1753267655712`
- Webview panel with Monaco Editor integration
- Message handlers for webview communication

## 💬 Webview Messages

### Message Types

#### EnhancedGenerationMessage

```typescript
interface EnhancedGenerationMessage {
  command: 'analyzeAndGenerate';
  token: string;
  openaiKey: string;
  username: string;
  spec: string;
  maxRepos: number;
  options: GenerationOptions;
}
```

Triggers repository analysis and code generation.

#### SaveProjectMessage

```typescript
interface SaveProjectMessage {
  command: 'saveProject';
  files: ProjectFiles;
}
```

Saves generated project files to workspace.

#### CopyToClipboardMessage

```typescript
interface CopyToClipboardMessage {
  command: 'copyToClipboard';
  code: string;
}
```

Copies generated code to clipboard.

### Response Messages

#### Progress Updates

```typescript
{
  command: 'progress',
  data: AnalysisProgress
}
```

#### Authentication Status

```typescript
{
  command: 'authStatus',
  service: 'github' | 'openai',
  status: 'success' | 'error' | 'pending',
  message: string
}
```

#### Generation Results

```typescript
{
  command: 'generationComplete',
  code: string,
  profile: SimpleStyleProfile,
  metadata: {
    tokensUsed: number,
    confidence: number,
    quality: string
  }
}
```

## ⚠️ Error Handling

### Error Types

#### ApiError

```typescript
interface ApiError {
  message: string;
  code: string;
  statusCode?: number;
  details?: unknown;
  timestamp?: string;
  retryable?: boolean;
}
```

#### AnalysisError

```typescript
interface AnalysisError extends ApiError {
  repository?: string;
  file?: string;
  step: 'fetch' | 'parse' | 'analyze';
  context?: Record<string, unknown>;
}
```

### Common Error Scenarios

#### GitHub API Errors

```typescript
// Rate limiting
{
  message: "API rate limit exceeded",
  code: "RATE_LIMIT_EXCEEDED",
  statusCode: 403,
  retryable: true
}

// Invalid token
{
  message: "Bad credentials",
  code: "INVALID_TOKEN",
  statusCode: 401,
  retryable: false
}

// Repository not found
{
  message: "Not Found",
  code: "REPO_NOT_FOUND",
  statusCode: 404,
  retryable: false
}
```

#### OpenAI API Errors

```typescript
// Invalid API key
{
  message: "Incorrect API key provided",
  code: "INVALID_API_KEY",
  statusCode: 401,
  retryable: false
}

// Token limit exceeded
{
  message: "Token limit exceeded",
  code: "TOKEN_LIMIT_EXCEEDED",
  statusCode: 400,
  retryable: false
}
```

### Error Handling Best Practices

```typescript
try {
  const profile = await analyzeMultipleReposPatterns(token, username);
  const code = await generateCodeSample(openaiKey, profile, spec);
} catch (error) {
  if (error.retryable) {
    // Implement retry logic
    setTimeout(() => retry(), 5000);
  } else {
    // Show user-friendly error message
    vscode.window.showErrorMessage(`Error: ${error.message}`);
  }
}
```

## 📖 Usage Examples

### Complete Workflow Example

```typescript
import { analyzeMultipleReposPatterns, generateCodeSample } from './CodeStyleEngine';
import { ProgressTracker } from './src/utils/ProgressTracker';

async function completeWorkflow() {
  // Initialize progress tracking
  const tracker = new ProgressTracker((progress) => {
    console.log(`${progress.stage}: ${progress.progress}%`);
  });

  try {
    // Step 1: Analyze repositories
    tracker.updateStage('fetching', 'Starting repository analysis...');
    
    const profile = await analyzeMultipleReposPatterns(
      process.env.GITHUB_TOKEN!,
      'username',
      10,
      'detailed'
    );

    tracker.updateStage('analyzing', 'Style analysis complete');
    console.log('Detected style profile:', profile);

    // Step 2: Generate code
    tracker.updateStage('generating', 'Generating code...');
    
    const code = await generateCodeSample(
      process.env.OPENAI_API_KEY!,
      profile,
      'Create a RESTful API for user management with CRUD operations'
    );

    tracker.complete('Code generation complete!');
    console.log('Generated code:', code);

  } catch (error) {
    tracker.error(error.message);
    console.error('Workflow failed:', error);
  }
}
```

### Custom Pattern Analysis

```typescript
import { PatternAnalyzer } from './src/analyzers/PatternAnalyzer';

function analyzeCustomCode() {
  const analyzer = new PatternAnalyzer();
  
  // Analyze multiple files
  const files = [
    'const user = { name: "John" };',
    'function getData() {\n    return data;\n}',
    'const items = [1, 2, 3];'
  ];
  
  files.forEach(content => {
    analyzer.feed(content, 'detailed');
  });
  
  const style = analyzer.getStyle();
  console.log('Custom analysis result:', style);
}
```

### Webview Integration

```typescript
// In webview script
const vscode = acquireVsCodeApi();

// Send analysis request
vscode.postMessage({
  command: 'analyzeAndGenerate',
  token: 'ghp_xxxxxxxxxxxx',
  openaiKey: 'sk-xxxxxxxxxxxx',
  username: 'developer',
  spec: 'Create a React component for user profile',
  maxRepos: 15,
  options: {
    model: 'gpt-4',
    complexity: 'moderate',
    includeTests: true,
    includeComments: true,
    template: 'react-app',
    useTypeScript: true,
    initGit: false
  }
});

// Handle responses
window.addEventListener('message', event => {
  const message = event.data;
  
  switch (message.command) {
    case 'progress':
      updateProgressBar(message.data.progress);
      break;
      
    case 'generationComplete':
      displayGeneratedCode(message.code);
      break;
      
    case 'authStatus':
      handleAuthStatus(message.service, message.status);
      break;
  }
});
```

---

## 🔗 Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Quick Start Guide](./docs/quick-start.md)
- [API Keys Setup](./docs/api-keys-setup.md)
- [Troubleshooting](./docs/troubleshooting.md)

## 📞 Support

For API-related questions or issues:
1. Check the [troubleshooting guide](./docs/troubleshooting.md)
2. Review error messages and codes
3. Ensure API keys are valid and have proper permissions
4. Check rate limits and quotas