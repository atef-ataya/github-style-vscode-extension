"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebviewContent = getWebviewContent;
// File: webviewContent.ts
// Enhanced webview with Monaco Editor and multi-panel interface
const vscode = __importStar(require("vscode"));
function getWebviewContent(webview, extensionUri) {
    // Get URIs for Monaco Editor
    const monacoLoaderUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'monaco-editor', 'min', 'vs', 'loader.js'));
    const monacoUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'monaco-editor', 'min', 'vs'));
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GitHub Style Agent - Professional</title>
    <style>
      :root {
        --bg-primary: #1e1e1e;
        --bg-secondary: #252526;
        --bg-tertiary: #2d2d30;
        --border-color: #3e3e42;
        --text-primary: #cccccc;
        --text-secondary: #969696;
        --accent-blue: #007acc;
        --accent-green: #4caf50;
        --accent-red: #f44336;
        --accent-orange: #ff9800;
        --shadow: rgba(0, 0, 0, 0.3);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        height: 100vh;
        overflow: hidden;
      }
      
      .main-container {
        display: flex;
        height: 100vh;
      }
      
      /* Left Configuration Panel */
      .config-panel {
        width: 350px;
        background: var(--bg-secondary);
        border-right: 1px solid var(--border-color);
        padding: 20px;
        overflow-y: auto;
        flex-shrink: 0;
      }
      
      .config-section {
        margin-bottom: 24px;
        background: var(--bg-tertiary);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--border-color);
      }
      
      .config-section h3 {
        color: var(--accent-blue);
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .form-group {
        margin-bottom: 12px;
      }
      
      .form-group label {
        display: block;
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--text-secondary);
      }
      
      .form-group input,
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 8px;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        color: var(--text-primary);
        font-size: 13px;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      
      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: var(--accent-blue);
        box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.25);
      }
      
      .checkbox-group {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 0;
      }
      
      .checkbox-group input[type="checkbox"] {
        width: auto;
        accent-color: var(--accent-blue);
      }
      
      .status-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        margin-top: 4px;
      }
      
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent-green);
      }
      
      .status-dot.loading {
        background: var(--accent-orange);
        animation: pulse 1.5s infinite;
      }
      
      .status-dot.error {
        background: var(--accent-red);
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .generate-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(45deg, var(--accent-blue), #0066cc);
        border: none;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 8px var(--shadow);
      }
      
      .generate-btn:hover {
        background: linear-gradient(45deg, #0066cc, var(--accent-blue));
        transform: translateY(-1px);
        box-shadow: 0 4px 12px var(--shadow);
      }
      
      .generate-btn:active {
        transform: translateY(0);
      }
      
      .generate-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      
      /* Right Code Panel */
      .code-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: var(--bg-primary);
      }
      
      .code-header {
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
        padding: 12px 20px;
        display: flex;
        justify-content: between;
        align-items: center;
      }
      
      .file-tabs {
        display: flex;
        gap: 2px;
        flex: 1;
      }
      
      .file-tab {
        padding: 8px 16px;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-color);
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
        color: var(--text-secondary);
        max-width: 200px;
        overflow: hidden;
        white-space: nowrap;
      }
      
      .file-tab.active {
        background: var(--bg-primary);
        color: var(--text-primary);
        border-bottom: 1px solid var(--bg-primary);
        margin-bottom: -1px;
      }
      
      .file-tab:hover {
        background: var(--bg-primary);
        color: var(--text-primary);
      }
      
      .file-tab .close-btn {
        margin-left: 8px;
        opacity: 0.6;
        cursor: pointer;
      }
      
      .file-tab .close-btn:hover {
        opacity: 1;
      }
      
      .code-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      
      .action-btn {
        padding: 6px 12px;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        color: var(--text-primary);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .action-btn:hover {
        background: var(--accent-blue);
        border-color: var(--accent-blue);
      }
      
      .monaco-container {
        flex: 1;
        border: none;
        overflow: hidden;
      }
      
      .welcome-screen {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 40px;
        background: var(--bg-primary);
      }
      
      .welcome-screen h2 {
        color: var(--accent-blue);
        margin-bottom: 16px;
        font-size: 24px;
      }
      
      .welcome-screen p {
        color: var(--text-secondary);
        font-size: 16px;
        line-height: 1.5;
        max-width: 500px;
      }
      
      .progress-bar {
        width: 100%;
        height: 3px;
        background: var(--bg-tertiary);
        border-radius: 3px;
        overflow: hidden;
        margin: 12px 0;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-blue), var(--accent-green));
        border-radius: 3px;
        transition: width 0.3s ease;
        width: 0%;
      }
      
      .progress-text {
        font-size: 12px;
        color: var(--text-secondary);
        margin-top: 4px;
      }
      
      /* Style Profile Display */
      .style-profile {
        background: var(--bg-primary);
        border-radius: 4px;
        padding: 12px;
        margin-top: 8px;
      }
      
      .style-item {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        font-size: 12px;
      }
      
      .style-value {
        color: var(--accent-green);
        font-weight: 500;
      }
      
      /* Loading States */
      .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid var(--border-color);
        border-radius: 50%;
        border-top-color: var(--accent-blue);
        animation: spin 1s ease-in-out infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .config-panel {
          width: 100%;
          height: 40vh;
          border-right: none;
          border-bottom: 1px solid var(--border-color);
        }
        
        .main-container {
          flex-direction: column;
        }
        
        .code-panel {
          height: 60vh;
        }
      }
    </style>
  </head>
  <body>
    <div class="main-container">
      <!-- Left Configuration Panel -->
      <div class="config-panel">
        <!-- GitHub Analysis Section -->
        <div class="config-section">
          <h3>🔍 GitHub Style Analysis</h3>
          
          <div class="form-group">
            <label>GitHub Token</label>
            <input type="password" id="githubToken" placeholder="ghp_..." />
          </div>
          
          <div class="form-group">
            <label>GitHub Username</label>
            <input type="text" id="githubUsername" placeholder="your-username" />
            <div class="status-indicator" id="usernameStatus" style="display: none;">
              <div class="status-dot"></div>
              <span>Repositories found</span>
            </div>
          </div>
          
          <div class="form-group">
            <label>OpenAI API Key</label>
            <input type="password" id="openaiKey" placeholder="sk-..." />
          </div>
          
          <div class="form-group">
            <label>Max Repositories</label>
            <input type="number" id="maxRepos" value="20" min="1" max="50" />
          </div>
          
          <!-- Style Profile Display -->
          <div class="style-profile" id="styleProfile" style="display: none;">
            <div class="style-item">
              <span>Indentation:</span>
              <span class="style-value" id="indentStyle">-</span>
            </div>
            <div class="style-item">
              <span>Quotes:</span>
              <span class="style-value" id="quoteStyle">-</span>
            </div>
            <div class="style-item">
              <span>Semicolons:</span>
              <span class="style-value" id="semicolonStyle">-</span>
            </div>
            <div class="style-item">
              <span>Confidence:</span>
              <span class="style-value" id="confidenceLevel">-</span>
            </div>
          </div>
        </div>
        
        <!-- AI Configuration Section -->
        <div class="config-section">
          <h3>🤖 AI Configuration</h3>
          
          <div class="form-group">
            <label>AI Model</label>
            <select id="aiModel">
              <option value="gpt-4">GPT-4 (Recommended)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Complexity Level</label>
            <select id="complexity">
              <option value="simple">Simple</option>
              <option value="moderate" selected>Moderate</option>
              <option value="complex">Complex</option>
            </select>
          </div>
          
          <div class="checkbox-group">
            <input type="checkbox" id="includeTests" />
            <label for="includeTests">Include Tests</label>
          </div>
          
          <div class="checkbox-group">
            <input type="checkbox" id="includeComments" checked />
            <label for="includeComments">Include Comments</label>
          </div>
        </div>
        
        <!-- Project Options Section -->
        <div class="config-section">
          <h3>📁 Project Options</h3>
          
          <div class="form-group">
            <label>Project Template</label>
            <select id="projectTemplate">
              <option value="custom">Custom Code</option>
              <option value="express-api">Express.js API</option>
              <option value="react-app">React Application</option>
              <option value="nextjs-app">Next.js Application</option>
              <option value="vue-app">Vue.js Application</option>
              <option value="node-cli">Node.js CLI Tool</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>What do you want to build?</label>
            <textarea id="codeSpec" rows="3" placeholder="Describe your project in detail..."></textarea>
          </div>
          
          <div class="checkbox-group">
            <input type="checkbox" id="useTypeScript" />
            <label for="useTypeScript">Use TypeScript</label>
          </div>
          
          <div class="checkbox-group">
            <input type="checkbox" id="initGit" checked />
            <label for="initGit">Initialize Git</label>
          </div>
        </div>
        
        <!-- Progress Section -->
        <div class="config-section" id="progressSection" style="display: none;">
          <h3>⚡ Progress</h3>
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <div class="progress-text" id="progressText">Ready to analyze...</div>
        </div>
        
        <!-- Generate Button -->
        <button class="generate-btn" id="generateBtn" onclick="startGeneration()">
          🚀 Analyze & Generate
        </button>
      </div>
      
      <!-- Right Code Panel -->
      <div class="code-panel">
        <div class="code-header">
          <div class="file-tabs" id="fileTabs">
            <!-- File tabs will be dynamically added here -->
          </div>
          
          <div class="code-actions" id="codeActions" style="display: none;">
            <button class="action-btn" onclick="saveProject()" title="Save Project">
              💾 Save Project
            </button>
            <button class="action-btn" onclick="exportFiles()" title="Export Files">
              📁 Export
            </button>
            <button class="action-btn" onclick="copyCurrentFile()" title="Copy Code">
              📋 Copy
            </button>
            <button class="action-btn" onclick="downloadProject()" title="Download ZIP">
              ⬇️ Download
            </button>
          </div>
        </div>
        
        <div class="monaco-container" id="monacoContainer">
          <!-- Welcome Screen -->
          <div class="welcome-screen" id="welcomeScreen">
            <h2>🧠 GitHub Style Agent</h2>
            <p>Configure your GitHub credentials and project requirements in the left panel, then click "Analyze & Generate" to create code that matches your personal coding style.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Monaco Editor Loader -->
    <script src="${monacoLoaderUri.toString()}"></script>
    <script>
      // Global variables
      let monacoEditor = null;
      let currentFiles = {};
      let activeFile = null;
      let styleProfile = null;
      
      // Monaco Editor setup
      require.config({ paths: { vs: '${monacoUri.toString()}' } });
      require(['vs/editor/editor.main'], function () {
        // Monaco is ready but we'll create editor when needed
        console.log('Monaco Editor loaded and ready');
      });
      
      const vscode = acquireVsCodeApi();
      
      // Create Monaco Editor
      function createMonacoEditor(content = '', language = 'javascript') {
        const container = document.getElementById('monacoContainer');
        container.innerHTML = '';
        
        monacoEditor = monaco.editor.create(container, {
          value: content,
          language: language,
          theme: 'vs-dark',
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          minimap: { enabled: true },
          wordWrap: 'on',
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 14,
            horizontalScrollbarSize: 14
          }
        });
        
        // Auto-save on content change
        monacoEditor.onDidChangeModelContent(() => {
          if (activeFile) {
            currentFiles[activeFile].content = monacoEditor.getValue();
          }
        });
        
        return monacoEditor;
      }
      
      // File management
      function addFile(fileName, content, language = 'javascript') {
        currentFiles[fileName] = { content, language };
        updateFileTabs();
        switchToFile(fileName);
        showCodeActions();
      }
      
      function switchToFile(fileName) {
        if (!currentFiles[fileName]) return;
        
        activeFile = fileName;
        const file = currentFiles[fileName];
        
        if (monacoEditor) {
          const model = monaco.editor.createModel(file.content, file.language);
          monacoEditor.setModel(model);
        } else {
          createMonacoEditor(file.content, file.language);
        }
        
        updateFileTabs();
        hideWelcomeScreen();
      }
      
      function closeFile(fileName) {
        delete currentFiles[fileName];
        
        if (activeFile === fileName) {
          const remainingFiles = Object.keys(currentFiles);
          if (remainingFiles.length > 0) {
            switchToFile(remainingFiles[0]);
          } else {
            showWelcomeScreen();
            hideCodeActions();
            activeFile = null;
          }
        }
        
        updateFileTabs();
      }
      
      function updateFileTabs() {
        const tabsContainer = document.getElementById('fileTabs');
        tabsContainer.innerHTML = '';
        
        Object.keys(currentFiles).forEach(fileName => {
          const tab = document.createElement('div');
          tab.className = \`file-tab \${fileName === activeFile ? 'active' : ''}\`;
          tab.innerHTML = \`
            <span>\${fileName}</span>
            <span class="close-btn" onclick="closeFile('\${fileName}')">✕</span>
          \`;
          tab.onclick = (e) => {
            if (e.target.classList.contains('close-btn')) return;
            switchToFile(fileName);
          };
          tabsContainer.appendChild(tab);
        });
      }
      
      function showWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'flex';
        if (monacoEditor) {
          document.getElementById('monacoContainer').innerHTML = '';
          document.getElementById('monacoContainer').appendChild(document.getElementById('welcomeScreen'));
          monacoEditor = null;
        }
      }
      
      function hideWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'none';
      }
      
      function showCodeActions() {
        document.getElementById('codeActions').style.display = 'flex';
      }
      
      function hideCodeActions() {
        document.getElementById('codeActions').style.display = 'none';
      }
      
      // Progress management
      function updateProgress(progress, message) {
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = message;
      }
      
      function hideProgress() {
        document.getElementById('progressSection').style.display = 'none';
      }
      
      function showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = \`
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--accent-red);
          color: white;
          padding: 12px 16px;
          border-radius: 6px;
          z-index: 1000;
          max-width: 300px;
        \`;
        errorDiv.textContent = '❌ ' + message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
      }
      
      function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = \`
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--accent-green);
          color: white;
          padding: 12px 16px;
          border-radius: 6px;
          z-index: 1000;
          max-width: 300px;
        \`;
        successDiv.textContent = '✅ ' + message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => successDiv.remove(), 3000);
      }
      
      // Main generation function
      async function startGeneration() {
        const token = document.getElementById('githubToken').value.trim();
        const username = document.getElementById('githubUsername').value.trim();
        const openaiKey = document.getElementById('openaiKey').value.trim();
        const codeSpec = document.getElementById('codeSpec').value.trim();
        const maxRepos = parseInt(document.getElementById('maxRepos').value) || 20;
        
        // Validation
        if (!token || !username || !openaiKey || !codeSpec) {
          showError('Please fill in all required fields');
          return;
        }
        
        // Disable button and show progress
        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
        
        try {
          // Clear previous files
          currentFiles = {};
          activeFile = null;
          updateFileTabs();
          showWelcomeScreen();
          hideCodeActions();
          
          // Send message to extension
          vscode.postMessage({
            command: 'analyzeAndGenerate',
            token,
            openaiKey,
            username,
            spec: codeSpec,
            maxRepos,
            options: {
              model: document.getElementById('aiModel').value,
              complexity: document.getElementById('complexity').value,
              includeTests: document.getElementById('includeTests').checked,
              includeComments: document.getElementById('includeComments').checked,
              template: document.getElementById('projectTemplate').value,
              useTypeScript: document.getElementById('useTypeScript').checked,
              initGit: document.getElementById('initGit').checked
            }
          });
          
        } catch (error) {
          showError('Failed to start generation: ' + error.message);
          resetGenerateButton();
        }
      }
      
      function resetGenerateButton() {
        const btn = document.getElementById('generateBtn');
        btn.disabled = false;
        btn.innerHTML = '🚀 Analyze & Generate';
        hideProgress();
      }
      
      // Action functions
      function saveProject() {
        if (Object.keys(currentFiles).length === 0) return;
        
        vscode.postMessage({
          command: 'saveProject',
          files: currentFiles
        });
      }
      
      function exportFiles() {
        if (Object.keys(currentFiles).length === 0) return;
        
        vscode.postMessage({
          command: 'exportFiles',
          files: currentFiles
        });
      }
      
      function copyCurrentFile() {
        if (!activeFile || !currentFiles[activeFile]) return;
        
        vscode.postMessage({
          command: 'copyToClipboard',
          code: currentFiles[activeFile].content
        });
      }
      
      function downloadProject() {
        if (Object.keys(currentFiles).length === 0) return;
        
        vscode.postMessage({
          command: 'downloadProject',
          files: currentFiles
        });
      }
      
      // Message handling from extension
      window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
          case 'showProgress':
            updateProgress(message.progress, message.message);
            break;
            
          case 'showStyleProfile':
            styleProfile = message.profile;
            displayStyleProfile(message.profile);
            break;
            
          case 'showGeneratedFiles':
            displayGeneratedFiles(message.files);
            resetGenerateButton();
            showSuccess('Code generation completed!');
            break;
            
          case 'showError':
            showError(message.error);
            resetGenerateButton();
            break;
            
          case 'saveSuccess':
            showSuccess('Project saved successfully!');
            break;
            
          case 'copySuccess':
            showSuccess('Code copied to clipboard!');
            break;
        }
      });
      
      function displayStyleProfile(profile) {
        document.getElementById('styleProfile').style.display = 'block';
        document.getElementById('indentStyle').textContent = profile.indentStyle;
        document.getElementById('quoteStyle').textContent = profile.quoteStyle;
        document.getElementById('semicolonStyle').textContent = profile.useSemicolons ? 'Yes' : 'No';
        document.getElementById('confidenceLevel').textContent = 
          profile.confidence ? \`\${profile.confidence.level} (\${profile.confidence.percentage}%)\` : 'Unknown';
      }
      
      function displayGeneratedFiles(files) {
        // Clear existing files
        currentFiles = {};
        
        // Add each generated file
        Object.entries(files).forEach(([fileName, fileData]) => {
          const language = getLanguageFromFileName(fileName);
          addFile(fileName, fileData.content, language);
        });
      }
      
      function getLanguageFromFileName(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const languageMap = {
          js: 'javascript',
          ts: 'typescript',
          jsx: 'javascript',
          tsx: 'typescript',
          py: 'python',
          java: 'java',
          cpp: 'cpp',
          c: 'c',
          cs: 'csharp',
          php: 'php',
          rb: 'ruby',
          go: 'go',
          rs: 'rust',
          vue: 'vue',
          html: 'html',
          css: 'css',
          scss: 'scss',
          json: 'json',
          md: 'markdown',
          yaml: 'yaml',
          yml: 'yaml'
        };
        return languageMap[ext] || 'text';
      }
    </script>
  </body>
  </html>
`;
}
//# sourceMappingURL=webviewContent.js.map