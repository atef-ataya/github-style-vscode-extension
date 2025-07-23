import * as path from 'path';
import * as fs from 'fs';

import * as vscode from 'vscode';

import { getWebviewContent } from './webviewContent';
import {
  analyzeMultipleReposPatterns,
  generateCodeSample,
} from './CodeStyleEngine';
import { SimpleStyleProfile } from './src/types';

// Enhanced message interfaces
interface GenerationOptions {
  model: string;
  complexity: 'simple' | 'moderate' | 'complex';
  includeTests: boolean;
  includeComments: boolean;
  template: string;
  useTypeScript: boolean;
  initGit: boolean;
}

interface EnhancedGenerationMessage {
  command: 'analyzeAndGenerate';
  token: string;
  openaiKey: string;
  username: string;
  spec: string;
  maxRepos: number;
  options: GenerationOptions;
}

interface FileData {
  content: string;
  language: string;
}

interface ProjectFiles {
  [fileName: string]: FileData;
}

// Project template definitions
const PROJECT_TEMPLATES = {
  'express-api': {
    name: 'Express.js API',
    files: [
      'app.js',
      'package.json',
      'README.md',
      'routes/index.js',
      'middleware/auth.js',
    ],
    dependencies: ['express', 'cors', 'helmet', 'morgan'],
    devDependencies: ['nodemon', 'jest', 'supertest'],
  },
  'react-app': {
    name: 'React Application',
    files: [
      'src/App.js',
      'src/index.js',
      'package.json',
      'README.md',
      'public/index.html',
    ],
    dependencies: ['react', 'react-dom', 'react-router-dom'],
    devDependencies: ['@testing-library/react', '@testing-library/jest-dom'],
  },
  'nextjs-app': {
    name: 'Next.js Application',
    files: [
      'pages/index.js',
      'pages/api/hello.js',
      'package.json',
      'README.md',
    ],
    dependencies: ['next', 'react', 'react-dom'],
    devDependencies: ['eslint', 'eslint-config-next'],
  },
  'vue-app': {
    name: 'Vue.js Application',
    files: [
      'src/App.vue',
      'src/main.js',
      'package.json',
      'README.md',
      'index.html',
    ],
    dependencies: ['vue', 'vue-router'],
    devDependencies: ['@vitejs/plugin-vue', 'vite'],
  },
  'node-cli': {
    name: 'Node.js CLI Tool',
    files: ['bin/cli.js', 'lib/index.js', 'package.json', 'README.md'],
    dependencies: ['commander', 'chalk', 'inquirer'],
    devDependencies: ['jest', 'eslint'],
  },
};

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    'codestyle.generate',
    async (): Promise<void> => {
      try {
        const panel = vscode.window.createWebviewPanel(
          'codeStylePanel',
          'GitHub Style Agent - Professional',
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
              vscode.Uri.joinPath(context.extensionUri, 'out'),
              vscode.Uri.joinPath(context.extensionUri, 'node_modules'),
              context.extensionUri,
            ],
          }
        );

        // Log extension URI and resource roots for debugging
        console.log('Extension URI:', context.extensionUri.fsPath);
        console.log('Resource Roots:', [
          vscode.Uri.joinPath(context.extensionUri, 'out').fsPath,
          vscode.Uri.joinPath(context.extensionUri, 'node_modules').fsPath,
          context.extensionUri.fsPath,
        ]);

        panel.webview.html = getWebviewContent(
          panel.webview,
          context.extensionUri
        );

        panel.onDidDispose(
          () => {
            // Cleanup if needed
          },
          null,
          context.subscriptions
        );

        panel.webview.onDidReceiveMessage(
          async (
            message:
              | EnhancedGenerationMessage
              | { command: 'saveProject'; files: ProjectFiles }
              | { command: 'exportFiles'; files: ProjectFiles }
              | { command: 'downloadProject'; files: ProjectFiles }
              | { command: 'copyToClipboard'; code: string }
          ): Promise<void> => {
            switch (message.command) {
              case 'analyzeAndGenerate':
                await handleEnhancedGeneration(message, panel);
                break;
              case 'saveProject':
                await handleSaveProject(message.files, panel);
                break;
              case 'exportFiles':
                await handleExportFiles(message.files, panel);
                break;
              case 'downloadProject':
                await handleDownloadProject(message.files, panel);
                break;
              case 'copyToClipboard':
                await handleCopyToClipboard(message.code, panel);
                break;
            }
          },
          undefined,
          context.subscriptions
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        void vscode.window.showErrorMessage(`CodeStyle error: ${errorMessage}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function handleEnhancedGeneration(
  message: EnhancedGenerationMessage,
  panel: vscode.WebviewPanel
): Promise<void> {
  try {
    // Send progress update
    void panel.webview.postMessage({
      command: 'showProgress',
      progress: 10,
      message: 'Connecting to GitHub API...',
    });

    // Analyze repositories
    void panel.webview.postMessage({
      command: 'showProgress',
      progress: 20,
      message: 'Analyzing your coding style...',
    });

    const styleProfile = await analyzeMultipleReposPatterns(
      message.token,
      message.username,
      message.maxRepos,
      'detailed'
    );

    // Send style profile to UI
    void panel.webview.postMessage({
      command: 'showStyleProfile',
      profile: styleProfile,
    });

    void panel.webview.postMessage({
      command: 'showProgress',
      progress: 60,
      message: 'Generating project files...',
    });

    // Generate multiple files based on template
    const projectFiles = await generateProjectFiles(
      message.openaiKey,
      styleProfile,
      message.spec,
      message.options
    );

    void panel.webview.postMessage({
      command: 'showProgress',
      progress: 100,
      message: 'Generation complete!',
    });

    // Send generated files to UI
    void panel.webview.postMessage({
      command: 'showGeneratedFiles',
      files: projectFiles,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    void panel.webview.postMessage({
      command: 'showError',
      error: errorMessage,
    });
  }
}

async function generateProjectFiles(
  openaiKey: string,
  styleProfile: SimpleStyleProfile,
  spec: string,
  options: GenerationOptions
): Promise<ProjectFiles> {
  const files: ProjectFiles = {};

  try {
    // Get template configuration
    const template =
      PROJECT_TEMPLATES[options.template as keyof typeof PROJECT_TEMPLATES];

    if (options.template === 'custom') {
      // Generate single custom file
      const code = await generateCodeSample(openaiKey, styleProfile, spec);
      const fileName = options.useTypeScript ? 'index.ts' : 'index.js';
      files[fileName] = {
        content: code,
        language: options.useTypeScript ? 'typescript' : 'javascript',
      };
    } else if (template) {
      // Generate structured project
      await generateStructuredProject(
        files,
        openaiKey,
        styleProfile,
        spec,
        options,
        template
      );
    }

    return files;
  } catch (error) {
    // Fallback to simple generation
    const code = await generateCodeSample(openaiKey, styleProfile, spec);
    files['index.js'] = {
      content: code,
      language: 'javascript',
    };
    return files;
  }
}

interface ProjectTemplate {
  name: string;
  files: string[];
  dependencies: string[];
  devDependencies: string[];
}

async function generateStructuredProject(
  files: ProjectFiles,
  openaiKey: string,
  styleProfile: SimpleStyleProfile,
  spec: string,
  options: GenerationOptions,
  template: ProjectTemplate
): Promise<void> {
  const fileExt = options.useTypeScript ? 'ts' : 'js';
  const useTS = options.useTypeScript;

  // Generate package.json
  files['package.json'] = {
    content: generatePackageJson(spec, template, useTS),
    language: 'json',
  };

  // Generate README.md
  files['README.md'] = {
    content: generateReadme(spec, template.name),
    language: 'markdown',
  };

  // Generate main application file
  switch (options.template) {
    case 'express-api':
      await generateExpressFiles(
        files,
        openaiKey,
        styleProfile,
        spec,
        options,
        fileExt
      );
      break;
    case 'react-app':
      await generateReactFiles(
        files,
        openaiKey,
        styleProfile,
        spec,
        options,
        fileExt
      );
      break;
    case 'nextjs-app':
      await generateNextJsFiles(
        files,
        openaiKey,
        styleProfile,
        spec,
        options,
        fileExt
      );
      break;
    case 'vue-app':
      await generateVueFiles(
        files,
        openaiKey,
        styleProfile,
        spec,
        options,
        fileExt
      );
      break;
    case 'node-cli':
      await generateNodeCliFiles(
        files,
        openaiKey,
        styleProfile,
        spec,
        options,
        fileExt
      );
      break;
  }

  // Generate .gitignore if Git is enabled
  if (options.initGit) {
    files['.gitignore'] = {
      content: generateGitignore(options.template),
      language: 'text',
    };
  }

  // Generate TypeScript config if needed
  if (useTS) {
    files['tsconfig.json'] = {
      content: generateTsConfig(options.template),
      language: 'json',
    };
  }
}

async function generateExpressFiles(
  files: ProjectFiles,
  openaiKey: string,
  styleProfile: SimpleStyleProfile,
  spec: string,
  options: GenerationOptions,
  fileExt: string
): Promise<void> {
  // Main app file
  const appPrompt = `Create an Express.js application for: ${spec}. Include proper middleware, routing, and error handling.`;
  const appCode = await generateCodeSample(openaiKey, styleProfile, appPrompt);
  files[`app.${fileExt}`] = {
    content: appCode,
    language: fileExt === 'ts' ? 'typescript' : 'javascript',
  };

  // Routes file
  const routesPrompt = `Create Express.js routes for: ${spec}. Include RESTful endpoints with proper validation.`;
  const routesCode = await generateCodeSample(
    openaiKey,
    styleProfile,
    routesPrompt
  );
  files[`routes/index.${fileExt}`] = {
    content: routesCode,
    language: fileExt === 'ts' ? 'typescript' : 'javascript',
  };

  // Middleware file
  if (options.includeComments) {
    const middlewarePrompt = `Create Express.js middleware for authentication and validation for: ${spec}`;
    const middlewareCode = await generateCodeSample(
      openaiKey,
      styleProfile,
      middlewarePrompt
    );
    files[`middleware/auth.${fileExt}`] = {
      content: middlewareCode,
      language: fileExt === 'ts' ? 'typescript' : 'javascript',
    };
  }

  // Test file
  if (options.includeTests) {
    const testPrompt = `Create Jest tests for the Express.js API: ${spec}`;
    const testCode = await generateCodeSample(
      openaiKey,
      styleProfile,
      testPrompt
    );
    files[`tests/app.test.${fileExt}`] = {
      content: testCode,
      language: fileExt === 'ts' ? 'typescript' : 'javascript',
    };
  }
}

async function generateReactFiles(
  files: ProjectFiles,
  openaiKey: string,
  styleProfile: SimpleStyleProfile,
  spec: string,
  options: GenerationOptions,
  fileExt: string
): Promise<void> {
  // Main App component
  const appPrompt = `Create a React App component for: ${spec}. Include modern React patterns and hooks.`;
  const appCode = await generateCodeSample(openaiKey, styleProfile, appPrompt);
  files[`src/App.${fileExt}x`] = {
    content: appCode,
    language: fileExt === 'ts' ? 'typescript' : 'javascript',
  };

  // Index file
  const indexCode = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`;

  files[`src/index.${fileExt}x`] = {
    content: indexCode,
    language: fileExt === 'ts' ? 'typescript' : 'javascript',
  };

  // HTML template
  files['public/index.html'] = {
    content: generateHtmlTemplate(spec),
    language: 'html',
  };
}

async function generateNextJsFiles(
  files: ProjectFiles,
  openaiKey: string,
  styleProfile: SimpleStyleProfile,
  spec: string,
  options: GenerationOptions,
  fileExt: string
): Promise<void> {
  // Home page
  const indexPrompt = `Create a Next.js home page component for: ${spec}`;
  const indexCode = await generateCodeSample(
    openaiKey,
    styleProfile,
    indexPrompt
  );
  files[`pages/index.${fileExt}x`] = {
    content: indexCode,
    language: fileExt === 'ts' ? 'typescript' : 'javascript',
  };

  // API route
  const apiPrompt = `Create a Next.js API route for: ${spec}`;
  const apiCode = await generateCodeSample(openaiKey, styleProfile, apiPrompt);
  files[`pages/api/hello.${fileExt}`] = {
    content: apiCode,
    language: fileExt === 'ts' ? 'typescript' : 'javascript',
  };
}

async function generateVueFiles(
  files: ProjectFiles,
  openaiKey: string,
  styleProfile: SimpleStyleProfile,
  spec: string,
  options: GenerationOptions,
  fileExt: string
): Promise<void> {
  // Main App component
  const appPrompt = `Create a Vue.js App component for: ${spec}. Use Vue 3 composition API.`;
  const appCode = await generateCodeSample(openaiKey, styleProfile, appPrompt);
  files['src/App.vue'] = {
    content: appCode,
    language: 'vue',
  };

  // Main entry file
  const mainCode = `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`;

  files[`src/main.${fileExt}`] = {
    content: mainCode,
    language: fileExt === 'ts' ? 'typescript' : 'javascript',
  };
}

async function generateNodeCliFiles(
  files: ProjectFiles,
  openaiKey: string,
  styleProfile: SimpleStyleProfile,
  spec: string,
  options: GenerationOptions,
  fileExt: string
): Promise<void> {
  // CLI entry file
  const cliPrompt = `Create a Node.js CLI application for: ${spec}. Use commander.js for argument parsing.`;
  const cliCode = await generateCodeSample(openaiKey, styleProfile, cliPrompt);
  files[`bin/cli.${fileExt}`] = {
    content: cliCode,
    language: fileExt === 'ts' ? 'typescript' : 'javascript',
  };

  // Library file
  const libPrompt = `Create the main library file for the CLI tool: ${spec}`;
  const libCode = await generateCodeSample(openaiKey, styleProfile, libPrompt);
  files[`lib/index.${fileExt}`] = {
    content: libCode,
    language: fileExt === 'ts' ? 'typescript' : 'javascript',
  };
}

// Utility functions for file generation
function generatePackageJson(
  spec: string,
  template: ProjectTemplate,
  useTypeScript: boolean
): string {
  const packageName = spec.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return JSON.stringify(
    {
      name: packageName,
      version: '1.0.0',
      description: spec,
      main: useTypeScript ? 'dist/index.js' : 'index.js',
      scripts: {
        start: template.name.includes('Express')
          ? 'node app.js'
          : 'npm run dev',
        dev: 'nodemon app.js',
        test: 'jest',
        build: useTypeScript ? 'tsc' : "echo 'No build step needed'",
        ...(useTypeScript && { 'type-check': 'tsc --noEmit' }),
      },
      dependencies: Object.fromEntries(
        template.dependencies.map((dep: string) => [dep, '^latest'])
      ),
      devDependencies: Object.fromEntries([
        ...template.devDependencies.map((dep: string): [string, string] => [
          dep,
          '^latest',
        ]),
        ...(useTypeScript
          ? [
              ['typescript', '^latest'],
              ['@types/node', '^latest'],
            ]
          : []),
      ] as [string, string][]),
    },
    null,
    2
  );
}

function generateReadme(spec: string, templateName: string): string {
  return `# ${spec}

A ${templateName} application generated by GitHub Style Agent.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Features

- Generated with your personal coding style
- Modern development practices
- Comprehensive error handling
- Ready for production deployment

---

Generated by GitHub Style Agent
`;
}

function generateGitignore(template: string): string {
  const commonIgnores = [
    'node_modules/',
    '.env',
    '.env.local',
    '*.log',
    'dist/',
    'build/',
    '.DS_Store',
    'Thumbs.db',
  ];

  const templateSpecific: Record<string, string[]> = {
    'react-app': ['.eslintcache', 'coverage/'],
    'nextjs-app': ['.next/', 'out/'],
    'vue-app': ['dist/', '.vite/'],
    'express-api': ['uploads/', 'logs/'],
    'node-cli': ['*.tgz'],
  };

  const ignores = [...commonIgnores, ...(templateSpecific[template] ?? [])];
  return ignores.join('\n') + '\n';
}

function generateTsConfig(template: string): string {
  type CompilerOptions = {
    target: string;
    module: string;
    lib: string[];
    outDir: string;
    rootDir: string;
    strict: boolean;
    esModuleInterop: boolean;
    skipLibCheck: boolean;
    forceConsistentCasingInFileNames: boolean;
    resolveJsonModule: boolean;
    jsx?: string;
  };

  type TsConfig = {
    compilerOptions: CompilerOptions;
    include: string[];
    exclude: string[];
  };

  const baseConfig: TsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  // Template-specific configurations
  if (template === 'react-app') {
    baseConfig.compilerOptions.lib.push('DOM', 'DOM.Iterable');
    baseConfig.compilerOptions.jsx = 'react-jsx';
  }

  return JSON.stringify(baseConfig, null, 2);
}

function generateHtmlTemplate(spec: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${spec}</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>`;
}

// File handling functions
async function handleSaveProject(
  files: ProjectFiles,
  panel: vscode.WebviewPanel
): Promise<void> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      void vscode.window.showErrorMessage(
        'Please open a folder in VS Code first'
      );
      return;
    }

    const saveLocation = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      defaultUri: workspaceFolders?.[0]?.uri ?? undefined,
      openLabel: 'Select Project Folder',
    });

    if (!saveLocation || saveLocation.length === 0) {
      return;
    }

    const projectPath = saveLocation[0]?.fsPath;
    if (!projectPath) {
      void vscode.window.showErrorMessage('Invalid project path selected');
      return;
    }

    for (const [fileName, fileData] of Object.entries(files)) {
      const filePath = path.join(projectPath, fileName);
      const fileDir = path.dirname(filePath);

      // Create directory if it doesn't exist
      await fs.promises.mkdir(fileDir, { recursive: true });

      // Write file
      await fs.promises.writeFile(filePath, fileData.content, 'utf8');
    }

    void panel.webview.postMessage({
      command: 'saveSuccess',
      message: `Project saved to ${projectPath}`,
    });

    void vscode.window.showInformationMessage(
      `Project saved successfully to ${projectPath}`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    void panel.webview.postMessage({
      command: 'showError',
      error: `Failed to save project: ${errorMessage}`,
    });
  }
}

async function handleExportFiles(
  files: ProjectFiles,
  panel: vscode.WebviewPanel
): Promise<void> {
  // Similar to save but with different UI feedback
  await handleSaveProject(files, panel);
}

async function handleDownloadProject(
  files: ProjectFiles,
  panel: vscode.WebviewPanel
): Promise<void> {
  try {
    // For now, same as save - in a real implementation, this would create a ZIP
    await handleSaveProject(files, panel);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    void panel.webview.postMessage({
      command: 'showError',
      error: `Failed to download project: ${errorMessage}`,
    });
  }
}

async function handleCopyToClipboard(
  code: string,
  panel: vscode.WebviewPanel
): Promise<void> {
  try {
    await vscode.env.clipboard.writeText(code);
    void panel.webview.postMessage({
      command: 'copySuccess',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    void panel.webview.postMessage({
      command: 'showError',
      error: `Failed to copy: ${errorMessage}`,
    });
  }
}

export function deactivate(): void {
  // Cleanup if needed
}
