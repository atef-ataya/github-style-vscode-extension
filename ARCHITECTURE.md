# 🏗️ GitHub Style Agent - Architecture Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [File Structure](#file-structure)
6. [API Integration](#api-integration)
7. [Extension Lifecycle](#extension-lifecycle)
8. [Security Considerations](#security-considerations)

## 🎯 Overview

The GitHub Style Agent is a VS Code extension that analyzes GitHub repositories to understand coding patterns and generates consistent code based on the detected style preferences. The extension combines repository analysis, pattern detection, and AI-powered code generation into a seamless workflow.

### Key Features
- **Repository Analysis**: Scans multiple GitHub repositories to detect coding patterns
- **Style Pattern Detection**: Identifies indentation, quotes, semicolons, and other style preferences
- **AI Code Generation**: Uses OpenAI GPT models to generate code matching detected patterns
- **Enhanced UI**: Monaco Editor integration for professional code editing experience
- **Progress Tracking**: Real-time progress updates during analysis and generation
- **Project Templates**: Support for various project types (React, Express, Vue, etc.)

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VS Code Extension                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Extension     │  │    Webview      │  │   Monaco        │ │
│  │   Controller    │  │    Panel        │  │   Editor        │ │
│  │  (extension.ts) │  │(webviewContent) │  │  Integration    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                      Core Engine Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ CodeStyleEngine │  │ PatternAnalyzer │  │ CodeGenerator   │ │
│  │   (Main Logic)  │  │ (Style Detection│  │ (AI Generation) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                      Utility Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ ProgressTracker │  │  Type System    │  │  Enhanced UI    │ │
│  │   (Progress)    │  │   (types/)      │  │   Components    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    External Services                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                     │
│  │   GitHub API    │  │   OpenAI API    │                     │
│  │   (@octokit)    │  │     (GPT-4)     │                     │
│  └─────────────────┘  └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🧩 Core Components

### 1. Extension Controller (`extension.ts`)
**Purpose**: Main entry point and command registration

**Key Responsibilities**:
- Register VS Code commands
- Create and manage webview panels
- Handle message communication between webview and extension
- Coordinate between different components

**Key Functions**:
```typescript
- activate(context: ExtensionContext): void
- handleEnhancedGeneration(message, panel): Promise<void>
- handleSaveProject(files, panel): Promise<void>
- handleExportFiles(files, panel): Promise<void>
```

### 2. Code Style Engine (`CodeStyleEngine.ts`)
**Purpose**: Core business logic orchestrator

**Key Responsibilities**:
- Orchestrate repository analysis workflow
- Manage GitHub API interactions
- Coordinate pattern analysis and code generation
- Handle error management and logging

**Key Functions**:
```typescript
- analyzeMultipleReposPatterns(token, username, maxRepos, depth): Promise<SimpleStyleProfile>
- generateCodeSample(openaiApiKey, styleProfile, codeSpec): Promise<string>
```

### 3. Pattern Analyzer (`src/analyzers/PatternAnalyzer.ts`)
**Purpose**: Detect coding style patterns from source code

**Key Responsibilities**:
- Parse source code files
- Detect indentation patterns (spaces vs tabs)
- Identify quote preferences (single vs double)
- Analyze semicolon usage
- Generate style confidence metrics

**Analysis Patterns**:
- **Indentation**: Spaces vs tabs, indentation size
- **Quotes**: Single vs double quote preference
- **Semicolons**: Usage frequency and patterns
- **Code Structure**: Function styles, variable declarations

### 4. Code Generator (`src/generators/CodeGenerator.ts`)
**Purpose**: Generate code using AI based on detected patterns

**Key Responsibilities**:
- Create context-aware prompts for OpenAI
- Apply detected style patterns to generated code
- Handle AI API interactions
- Format and validate generated code

**Generation Process**:
1. Analyze user specification
2. Apply detected style preferences
3. Create optimized prompt for AI model
4. Generate and format code
5. Validate output quality

### 5. Progress Tracker (`src/utils/ProgressTracker.ts`)
**Purpose**: Real-time progress monitoring and user feedback

**Key Responsibilities**:
- Track analysis progress across multiple repositories
- Estimate completion times
- Provide detailed progress updates
- Handle error states and recovery

**Progress Stages**:
- **Fetching**: Repository discovery and access
- **Analyzing**: Code pattern analysis
- **Generating**: AI code generation
- **Complete**: Final processing and delivery

### 6. Webview Content (`webviewContent.ts`)
**Purpose**: User interface and interaction management

**Key Responsibilities**:
- Render professional UI with Monaco Editor
- Handle user input and form validation
- Manage real-time progress display
- Coordinate file operations and project management

**UI Components**:
- Configuration panel for API keys and settings
- Monaco Editor for code display and editing
- Progress indicators and status updates
- Project template selection
- File management and export options

## 🔄 Data Flow

### Analysis Workflow
```
1. User Input
   ├── GitHub Token
   ├── Username
   ├── Repository Count
   └── Analysis Depth

2. Repository Discovery
   ├── GitHub API Call
   ├── Repository Filtering
   └── File Discovery

3. Pattern Analysis
   ├── File Content Retrieval
   ├── Style Pattern Detection
   ├── Confidence Calculation
   └── Profile Generation

4. Code Generation
   ├── Specification Processing
   ├── Style Application
   ├── AI Prompt Creation
   └── Code Generation

5. Result Delivery
   ├── Code Formatting
   ├── Quality Assessment
   └── User Presentation
```

### Message Flow
```
Webview UI ←→ Extension Controller ←→ Core Engine
    ↓              ↓                    ↓
User Input    Message Routing      Business Logic
    ↓              ↓                    ↓
Validation    Command Dispatch     API Calls
    ↓              ↓                    ↓
Progress      Progress Relay      Result Processing
```

## 📁 File Structure

```
Trae/
├── 📄 extension.ts              # Main extension entry point
├── 📄 CodeStyleEngine.ts        # Core business logic
├── 📄 webviewContent.ts         # UI and webview management
├── 📄 package.json              # Extension manifest and dependencies
├── 📄 tsconfig.json             # TypeScript configuration
├── 📄 webpack.config.js         # Build configuration
│
├── 📁 types/
│   └── 📄 index.ts              # TypeScript type definitions
│
├── 📁 src/
│   ├── 📁 analyzers/
│   │   └── 📄 PatternAnalyzer.ts    # Style pattern detection
│   ├── 📁 generators/
│   │   └── 📄 CodeGenerator.ts      # AI code generation
│   ├── 📁 utils/
│   │   └── 📄 ProgressTracker.ts    # Progress monitoring
│   ├── 📁 enhanced/
│   │   ├── 📄 project-generator.ts  # Project template generation
│   │   └── 📄 template-engine.ts    # Template processing
│   └── 📁 webview/
│       ├── 📄 enhanced-ui.ts        # Enhanced UI components
│       ├── 📄 file-manager.ts       # File operations
│       └── 📄 project-templates.ts  # Project template definitions
│
├── 📁 docs/
│   ├── 📄 quick-start.md
│   ├── 📄 api-keys-setup.md
│   └── 📄 troubleshooting.md
│
├── 📁 .vscode/
│   ├── 📄 launch.json           # Debug configuration
│   └── 📄 tasks.json            # Build tasks
│
└── 📁 resources/
    └── 📁 templates/            # Project templates
```

## 🔌 API Integration

### GitHub API (@octokit/rest)
**Purpose**: Repository and file access

**Key Operations**:
- `repos.listForUser()`: Discover user repositories
- `repos.getContent()`: Retrieve file contents
- `users.getAuthenticated()`: Validate authentication

**Rate Limiting**: Handles GitHub API rate limits gracefully

### OpenAI API
**Purpose**: AI-powered code generation

**Configuration**:
- Model: GPT-4 (configurable)
- Temperature: 0.2 (for consistent output)
- Context-aware prompting with style preferences

**Error Handling**: Robust error handling with fallback responses

## 🔄 Extension Lifecycle

### 1. Activation
```typescript
// Triggered by command execution
activate(context: ExtensionContext)
├── Register commands
├── Set up subscriptions
└── Initialize resources
```

### 2. Command Execution
```typescript
// User triggers "GitHub Style Agent: Generate Code"
command execution
├── Create webview panel
├── Load webview content
├── Set up message handlers
└── Display UI
```

### 3. Analysis Process
```typescript
// User submits analysis request
analysis workflow
├── Validate inputs
├── Initialize progress tracking
├── Fetch repositories
├── Analyze patterns
├── Generate code
└── Present results
```

### 4. Cleanup
```typescript
// Panel disposal or extension deactivation
cleanup
├── Dispose webview panel
├── Clear subscriptions
└── Release resources
```

## 🔒 Security Considerations

### API Key Management
- **No Storage**: API keys are never stored persistently
- **Memory Only**: Keys exist only in memory during session
- **User Responsibility**: Users manage their own credentials

### Content Security Policy
- **Strict CSP**: Webview uses restrictive content security policy
- **Nonce-based Scripts**: All scripts use cryptographic nonces
- **Limited Sources**: Only trusted sources allowed

### Data Privacy
- **No Logging**: Sensitive data is never logged
- **Local Processing**: All analysis happens locally
- **API Calls Only**: Only necessary API calls are made

### Error Handling
- **Graceful Degradation**: Continues operation despite errors
- **Safe Defaults**: Falls back to safe default values
- **User Feedback**: Clear error messages without exposing internals

---

## 🚀 Getting Started

For implementation details and usage instructions, see:
- [Quick Start Guide](./docs/quick-start.md)
- [API Keys Setup](./docs/api-keys-setup.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)

## 🤝 Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development guidelines and contribution instructions.