/**
 * Jest test setup file
 * This file is executed before each test file
 */

// Extend global namespace for test utilities
declare global {
  var testUtils: {
    createMockStyleProfile: () => any;
    createMockGenerationConfig: () => any;
    createMockProgressTracker: () => any;
    delay: (ms: number) => Promise<void>;
  };
}

// Make this file a module
export {};

// Mock VS Code API
const mockVSCode = {
  workspace: {
    getConfiguration: jest.fn(() => ({
      get: jest.fn(),
      update: jest.fn(),
      has: jest.fn()
    })),
    onDidChangeConfiguration: jest.fn(),
    workspaceFolders: [{
      uri: { fsPath: '/mock/workspace' },
      name: 'mock-workspace',
      index: 0
    }]
  },
  window: {
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    createWebviewPanel: jest.fn(),
    withProgress: jest.fn()
  },
  Uri: {
    file: jest.fn((path: string) => ({ fsPath: path })),
    parse: jest.fn()
  },
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3
  },
  ViewColumn: {
    One: 1,
    Two: 2,
    Three: 3
  },
  ProgressLocation: {
    Notification: 15
  }
};

// Mock the vscode module
jest.mock('vscode', () => mockVSCode, { virtual: true });

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock file system operations
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
    access: jest.fn(),
    unlink: jest.fn(),
    rmdir: jest.fn(),
    copyFile: jest.fn()
  },
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn()
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => '/' + args.join('/')),
  dirname: jest.fn((path) => path.split('/').slice(0, -1).join('/')),
  basename: jest.fn((path) => path.split('/').pop()),
  extname: jest.fn((path) => {
    const parts = path.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
  }),
  sep: '/'
}));

// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.GITHUB_TOKEN = 'test-github-token';
process.env.OPENAI_API_KEY = 'test-openai-key';

// Global test utilities
(global as any).testUtils = {
  createMockStyleProfile: () => ({
    indentation: { type: 'spaces', size: 2 },
    naming: {
      variables: 'camelCase',
      functions: 'camelCase',
      classes: 'PascalCase',
      constants: 'UPPER_CASE'
    },
    structure: {
      fileOrganization: 'feature-based',
      importStyle: 'named',
      exportStyle: 'named'
    },
    patterns: {
      errorHandling: 'try-catch',
      asyncPattern: 'async-await',
      stateManagement: 'hooks'
    },
    preferences: {
      semicolons: true,
      quotes: 'single',
      trailingCommas: true
    }
  }),
  
  createMockGenerationConfig: () => ({
    projectName: 'test-project',
    projectType: 'react-app',
    outputPath: '/test/output',
    styleProfile: (global as any).testUtils.createMockStyleProfile(),
    features: ['typescript', 'eslint', 'prettier'],
    dependencies: ['react', 'react-dom'],
    devDependencies: ['@types/react', '@types/react-dom']
  }),
  
  createMockProgressTracker: () => ({
    updateProgress: jest.fn(),
    setStage: jest.fn(),
    complete: jest.fn(),
    getProgress: jest.fn(() => ({
      stage: 'test',
      percentage: 50,
      message: 'Test progress',
      estimatedTimeRemaining: 1000,
      repositories: [],
      files: []
    }))
  }),
  
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});