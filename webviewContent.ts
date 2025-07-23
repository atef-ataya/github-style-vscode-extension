// Enhanced webviewContent.ts with Monaco Editor integration
import * as vscode from 'vscode';

export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): string {
  // Get URIs for Monaco Editor - FIXED PATHS
  const monacoLoaderUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'out', 'vs', 'loader.js')
  );

  const monacoUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'out', 'vs')
  );

  // Generate a nonce for script security
  function getNonce() {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
          script-src 'nonce-${nonce}' ${webview.cspSource} 'unsafe-eval'; 
          style-src ${webview.cspSource} 'unsafe-inline'; 
          font-src ${webview.cspSource}; 
          img-src ${webview.cspSource} data:;
          connect-src ${webview.cspSource} 'self';">
    <title>GitHub Style Agent - Professional</title>
    <style nonce="${nonce}">
      :root {
        --vscode-editor-background: #1e1e1e;
        --vscode-editor-foreground: #d4d4d4;
        --vscode-sideBar-background: #252526;
        --vscode-sideBar-border: #3e3e42;
        --vscode-button-background: #0e639c;
        --vscode-button-hoverBackground: #1177bb;
        --vscode-input-background: #3c3c3c;
        --vscode-input-border: #3e3e42;
        --vscode-focusBorder: #007fd4;
        --vscode-textLink-foreground: #3794ff;
      }
      
      .monaco-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 400px;
        overflow: hidden;
      }
      
      #editorContainer {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
      }
      
      .welcome-screen {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2;
        background: var(--vscode-editor-background);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
        --vscode-progressBar-background: #0e70c0;
        --vscode-notifications-background: #252526;
        --vscode-notifications-border: #3e3e42;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        background: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        height: 100vh;
        overflow: hidden;
        font-size: 13px;
      }

      .main-container {
        display: flex;
        height: 100vh;
      }

      /* Enhanced Left Panel */
      .config-panel {
        width: 350px;
        background: var(--vscode-sideBar-background);
        border-right: 1px solid var(--vscode-sideBar-border);
        padding: 16px;
        overflow-y: auto;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .config-section {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 16px;
        border: 1px solid var(--vscode-sideBar-border);
      }

      .config-section h3 {
        color: var(--vscode-textLink-foreground);
        font-size: 13px;
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
        font-size: 11px;
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--vscode-editor-foreground);
        opacity: 0.9;
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 6px 8px;
        background: var(--vscode-input-background);
        border: 1px solid var(--vscode-input-border);
        border-radius: 3px;
        color: var(--vscode-editor-foreground);
        font-size: 12px;
        font-family: inherit;
        transition: border-color 0.2s;
      }

      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: var(--vscode-focusBorder);
        box-shadow: 0 0 0 1px var(--vscode-focusBorder);
      }

      .form-group textarea {
        resize: vertical;
        min-height: 60px;
      }

      .checkbox-group {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 0;
      }

      .checkbox-group input[type="checkbox"] {
        width: auto;
        margin: 0;
      }

      .checkbox-group label {
        margin: 0;
        font-size: 12px;
        cursor: pointer;
      }

      .generate-btn {
        width: 100%;
        padding: 10px 16px;
        background: var(--vscode-button-background);
        border: none;
        border-radius: 3px;
        color: white;
        font-weight: 500;
        font-size: 13px;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .generate-btn:hover:not(:disabled) {
        background: var(--vscode-button-hoverBackground);
      }

      .generate-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* Progress Section */
      .progress-section {
        background: var(--vscode-notifications-background);
        border: 1px solid var(--vscode-notifications-border);
        border-radius: 6px;
        padding: 12px;
        margin-top: 16px;
      }

      .auth-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.2);
        margin-bottom: 8px;
      }

      .auth-status.success {
        color: #4caf50;
      }

      .auth-status.pending {
        color: #ffc107;
      }

      .auth-status.error {
        color: #f44336;
      }

      .repo-list {
        margin-top: 12px;
        max-height: 200px;
        overflow-y: auto;
      }

      .repo-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.05);
        margin-bottom: 4px;
        font-size: 12px;
        transition: transform 0.3s ease;
      }

      .repo-item.analyzed {
        transform: translateY(-100%);
        opacity: 0;
      }

      .repo-progress {
        color: var(--vscode-textLink-foreground);
      }

      .cache-section {
        margin-top: 16px;
        padding: 12px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
      }

      .cache-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .progress-bar {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
        margin: 8px 0;
      }

      .progress-fill {
        height: 100%;
        background: var(--vscode-progressBar-background);
        border-radius: 2px;
        transition: width 0.3s ease;
        width: 0%;
      }

      .progress-text {
        font-size: 11px;
        opacity: 0.8;
        margin-top: 4px;
      }

      /* Style Profile Display */
      .style-profile {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        padding: 8px;
        margin-top: 8px;
        font-size: 11px;
      }

      .style-item {
        display: flex;
        justify-content: space-between;
        padding: 2px 0;
      }

      .style-value {
        color: var(--vscode-textLink-foreground);
        font-weight: 500;
      }

      /* Enhanced Right Panel */
      .code-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: var(--vscode-editor-background);
        min-width: 0;
      }

      .code-header {
        background: var(--vscode-sideBar-background);
        border-bottom: 1px solid var(--vscode-sideBar-border);
        padding: 8px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 35px;
      }

      .file-tabs {
        display: flex;
        gap: 2px;
        flex: 1;
        overflow-x: auto;
      }

      .file-tab {
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--vscode-sideBar-border);
        border-bottom: none;
        border-radius: 3px 3px 0 0;
        cursor: pointer;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        transition: all 0.2s;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 6px;
        max-width: 150px;
      }

      .file-tab.active {
        background: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        border-bottom: 1px solid var(--vscode-editor-background);
        margin-bottom: -1px;
      }

      .file-tab:hover:not(.active) {
        background: rgba(255, 255, 255, 0.1);
        color: var(--vscode-editor-foreground);
      }

      .file-tab .file-name {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-tab .close-btn {
        opacity: 0.6;
        cursor: pointer;
        padding: 2px;
        border-radius: 2px;
        font-size: 10px;
        line-height: 1;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .file-tab .close-btn:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
      }

      .code-actions {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      .action-btn {
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--vscode-sideBar-border);
        border-radius: 3px;
        color: var(--vscode-editor-foreground);
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      }

      .action-btn:hover {
        background: var(--vscode-button-background);
        border-color: var(--vscode-button-background);
      }

      /* Monaco Container */
      .monaco-container {
        flex: 1;
        border: none;
        overflow: hidden;
        position: relative;
      }

      /* Welcome Screen */
      .welcome-screen {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 40px;
        background: var(--vscode-editor-background);
      }

      .welcome-screen h2 {
        color: var(--vscode-textLink-foreground);
        margin-bottom: 16px;
        font-size: 24px;
        font-weight: 300;
      }

      .welcome-screen p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        line-height: 1.5;
        max-width: 400px;
      }

      .welcome-screen .logo {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.8;
      }

      /* Loading States */
      .loading-spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: var(--vscode-textLink-foreground);
        animation: spin 1s ease-in-out infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* Notifications */
      .notification {
        position: fixed;
        top: 16px;
        right: 16px;
        background: var(--vscode-notifications-background);
        border: 1px solid var(--vscode-notifications-border);
        border-radius: 6px;
        padding: 12px 16px;
        max-width: 300px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .notification.success {
        border-left: 3px solid #4caf50;
      }

      .notification.error {
        border-left: 3px solid #f44336;
      }

      .notification.info {
        border-left: 3px solid var(--vscode-textLink-foreground);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .main-container {
          flex-direction: column;
        }
        
        .config-panel {
          width: 100%;
          height: 40vh;
          border-right: none;
          border-bottom: 1px solid var(--vscode-sideBar-border);
        }
        
        .code-panel {
          height: 60vh;
        }
      }

      /* Status Indicators */
      .status-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        margin-top: 4px;
        opacity: 0.8;
      }

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4caf50;
      }

      .status-dot.loading {
        background: #ff9800;
        animation: pulse 1.5s infinite;
      }

      .status-dot.error {
        background: #f44336;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* Scrollbar Styling */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      ::-webkit-scrollbar-track {
        background: var(--vscode-editor-background);
      }

      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    </style>
</head>
<body>
    <div class="main-container">
        <!-- Enhanced Left Configuration Panel -->
        <div class="config-panel">
            <!-- GitHub Analysis Section -->
            <div class="config-section">
                <div id="githubAuthStatus" class="auth-status pending">
                    <span>GitHub Authentication</span>
                    <span id="githubAuthIcon">⏳</span>
                </div>
                <div id="openaiAuthStatus" class="auth-status pending">
                    <span>OpenAI Authentication</span>
                    <span id="openaiAuthIcon">⏳</span>
                </div>
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
                    <div style="font-weight: 600; margin-bottom: 6px; color: var(--vscode-textLink-foreground);">Detected Style:</div>
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
                    <textarea id="codeSpec" placeholder="Describe your project in detail..."></textarea>
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
            <div class="config-section progress-section" id="progressSection" style="display: none;">
                <h3>⚡ Progress</h3>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">Ready to analyze...</div>
                
                <!-- Repository Analysis List -->
                <div id="repoList" class="repo-list" style="display: none;">
                    <!-- Repository items will be added here dynamically -->
                </div>
            </div>
            
            <!-- Style Cache Section -->
            <div class="config-section cache-section" id="cacheSection" style="display: none;">
                <h3>📦 Style Cache</h3>
                <div class="style-profile">
                    <!-- Style profile details will be added here -->
                </div>
                <div class="cache-actions">
                    <button class="action-btn" onclick="clearStyleCache()">
                        🗑️ Clear Cache
                    </button>
                    <button class="action-btn" onclick="exportStyleProfile()">
                        💾 Export Style
                    </button>
                </div>
            </div>
            
            <!-- Generate Button -->
            <button class="generate-btn" id="generateBtn" onclick="startGeneration()">
                🚀 Analyze & Generate
            </button>
        </div>
        
        <!-- Enhanced Right Code Panel -->
        <div class="code-panel">
            <div class="code-header">
                <div class="file-tabs" id="fileTabs">
                    <!-- File tabs will be dynamically added here -->
                </div>
                
                <div class="code-actions" id="codeActions" style="display: none;">
                    <button class="action-btn" onclick="saveProject()" title="Save Project">
                        💾 Save
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
                    <div class="logo">🧠</div>
                    <h2>GitHub Style Agent</h2>
                    <p>Configure your GitHub credentials and project requirements, then generate code that matches your personal coding style.</p>
                </div>
                <!-- This div will contain the actual Monaco editor -->
                <div id="editorContainer" style="width: 100%; height: 100%; display: none;"></div>
            </div>
        </div>
    </div>

    <!-- Monaco Editor Integration -->
    <script nonce="${nonce}" src="${monacoLoaderUri.toString()}"></script>
    <script nonce="${nonce}">
        // Global variables
        let monacoEditor = null;
        let currentFiles = {};
        let activeFile = null;
        let styleProfile = null;
        
        // VS Code API
        const vscode = acquireVsCodeApi();
        
        // Monaco Editor setup with proper error handling
        require.config({ 
            paths: { 
                vs: '${monacoUri.toString()}' 
            }
        });
        
        // Initialize Monaco Editor with better error handling
        try {
            require(['vs/editor/editor.main'], function () {
                console.log('✅ Monaco Editor loaded successfully');
                
                // Create the editor when files are added
                window.monacoReady = true;
                
                // Log success to help with debugging
                showNotification('Monaco Editor loaded successfully', 'success');
                
                // If there are already files, make sure they're displayed
                if (Object.keys(currentFiles).length > 0 && activeFile) {
                    switchToFile(activeFile);
                }
            }, function(error) {
                console.error('❌ Failed to load Monaco Editor:', error);
                showNotification('Failed to load Monaco Editor. Using fallback text editor: ' + (error.message || 'Unknown error'), 'error');
            });
        } catch (e) {
            console.error('❌ Exception during Monaco Editor initialization:', e);
            showNotification('Exception during Monaco Editor initialization: ' + (e.message || 'Unknown error'), 'error');
        }
        
        // Create Monaco Editor instance with enhanced debugging
        function createMonacoEditor(content = '', language = 'javascript') {
            console.log('Creating Monaco Editor with language:', language);
            const editorContainer = document.getElementById('editorContainer');
            
            if (!editorContainer) {
                console.error('Editor container element not found!');
                showNotification('Error: Editor container not found', 'error');
                return null;
            }
            
            // Make sure the welcome screen is hidden
            hideWelcomeScreen();
            
            // Make sure the editor container is visible
            editorContainer.style.display = 'block';
            console.log('Editor container dimensions:', editorContainer.offsetWidth, 'x', editorContainer.offsetHeight);
            
            try {
                // Check if monaco is available
                if (!window.monaco) {
                    console.error('Monaco namespace not available!');
                    showNotification('Error: Monaco editor not loaded properly', 'error');
                    createFallbackEditor(content);
                    return null;
                }
                
                console.log('Creating Monaco editor instance...');
                monacoEditor = monaco.editor.create(editorContainer, {
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
                    contextmenu: true,
                    mouseWheelZoom: true,
                    quickSuggestions: true,
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: 'on',
                    tabCompletion: 'on',
                    wordBasedSuggestions: true,
                    parameterHints: { enabled: true },
                    autoIndent: 'full',
                    formatOnType: true,
                    formatOnPaste: true,
                    dragAndDrop: true,
                    links: true,
                    colorDecorators: true,
                    lightbulb: { enabled: true },
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        useShadows: false,
                        verticalHasArrows: false,
                        horizontalHasArrows: false,
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10
                    }
                });
                
                // Auto-save on content change
                monacoEditor.onDidChangeModelContent(() => {
                    if (activeFile && currentFiles[activeFile]) {
                        currentFiles[activeFile].content = monacoEditor.getValue();
                    }
                });
                
                // Focus management
                monacoEditor.onDidFocusEditorText(() => {
                    console.log('Editor focused');
                });
                
                console.log('✅ Monaco Editor instance created');
                return monacoEditor;
                
            } catch (error) {
                console.error('❌ Error creating Monaco Editor:', error);
                showNotification('Error creating Monaco Editor: ' + error.message, 'error');
                return null;
            }
        }
        
        // File management functions
        function addFile(fileName, content, language = 'javascript') {
            if (!fileName) return;
            
            currentFiles[fileName] = { content, language };
            updateFileTabs();
            switchToFile(fileName);
            showCodeActions();
            
            showNotification('Added file: ' + fileName, 'success');
        }
        
        function switchToFile(fileName) {
            if (!currentFiles[fileName]) {
                console.error('File not found:', fileName);
                return;
            }
            
            activeFile = fileName;
            const file = currentFiles[fileName];
            console.log('Switching to file:', fileName, 'Monaco ready:', window.monacoReady);
            
            if (window.monacoReady) {
                try {
                    if (monacoEditor) {
                        console.log('Using existing Monaco editor instance');
                        // Create new model for the file
                        const model = monaco.editor.createModel(file.content, file.language);
                        monacoEditor.setModel(model);
                    } else {
                        console.log('Creating new Monaco editor instance');
                        createMonacoEditor(file.content, file.language);
                    }
                } catch (e) {
                    console.error('Error switching file in Monaco:', e);
                    // Fallback to textarea if Monaco fails
                    createFallbackEditor(file.content);
                    showNotification('Error switching file in Monaco editor: ' + e.message, 'error');
                }
            } else {
                console.log('Monaco not ready, using fallback editor');
                // Fallback to textarea if Monaco isn't ready
                createFallbackEditor(file.content);
            }
            
            updateFileTabs();
            hideWelcomeScreen();
        }
        
        function closeFile(fileName, event) {
            if (event) {
                event.stopPropagation();
            }
            
            delete currentFiles[fileName];
            
            if (activeFile === fileName) {
                const remainingFiles = Object.keys(currentFiles);
                if (remainingFiles.length > 0) {
                    switchToFile(remainingFiles[0]);
                } else {
                    showWelcomeScreen();
                    hideCodeActions();
                    activeFile = null;
                    if (monacoEditor) {
                        monacoEditor.dispose();
                        monacoEditor = null;
                    }
                }
            }
            
            updateFileTabs();
            showNotification('Closed file: ' + fileName, 'info');
        }
        
        function updateFileTabs() {
            const tabsContainer = document.getElementById('fileTabs');
            tabsContainer.innerHTML = '';
            
            Object.keys(currentFiles).forEach(fileName => {
                const tab = document.createElement('div');
                tab.className = \`file-tab \${fileName === activeFile ? 'active' : ''}\`;
                
                // Get file icon based on extension
                const icon = getFileIcon(fileName);
                
                tab.innerHTML = \`
                    <span class="file-icon">\${icon}</span>
                    <span class="file-name" title="\${fileName}">\${fileName}</span>
                    <span class="close-btn" onclick="closeFile('\${fileName}', event)" title="Close">✕</span>
                \`;
                
                tab.onclick = (e) => {
                    if (!e.target.classList.contains('close-btn')) {
                        switchToFile(fileName);
                    }
                };
                
                tabsContainer.appendChild(tab);
            });
        }
        
        function getFileIcon(fileName) {
            const ext = fileName.split('.').pop()?.toLowerCase();
            const iconMap = {
                js: '🟨', jsx: '🔷', ts: '🔵', tsx: '🔷',
                html: '🟠', css: '🎨', scss: '🎨',
                json: '📄', md: '📝', txt: '📄',
                py: '🐍', java: '☕', php: '🐘',
                vue: '💚', svelte: '🧡', go: '🐹',
                rs: '🦀', cpp: '⚙️', c: '⚙️'
            };
            return iconMap[ext] || '📄';
        }
        
        function showWelcomeScreen() {
            const welcomeScreen = document.getElementById('welcomeScreen');
            const container = document.getElementById('monacoContainer');
            
            if (monacoEditor) {
                monacoEditor.dispose();
                monacoEditor = null;
            }
            
            container.innerHTML = '';
            container.appendChild(welcomeScreen);
            welcomeScreen.style.display = 'flex';
        }
        
        function hideWelcomeScreen() {
            console.log('Hiding welcome screen');
            const welcomeScreen = document.getElementById('welcomeScreen');
            if (welcomeScreen) {
                welcomeScreen.style.display = 'none';
                console.log('Welcome screen hidden');
            } else {
                console.error('Welcome screen element not found!');
            }
            
            // Make sure the Monaco container is visible
            const container = document.getElementById('monacoContainer');
            if (container) {
                container.style.display = 'block';
                container.style.height = '100%';
                container.style.width = '100%';
                console.log('Monaco container made visible');
            } else {
                console.error('Monaco container element not found!');
            }
            
            // Make sure the editor container is visible
            const editorContainer = document.getElementById('editorContainer');
            if (editorContainer) {
                editorContainer.style.display = 'block';
                console.log('Editor container made visible');
            } else {
                console.error('Editor container element not found!');
            }
        }
        
        function showCodeActions() {
            console.log('Showing code actions');
            const codeActions = document.getElementById('codeActions');
            if (codeActions) {
                codeActions.style.display = 'flex';
                console.log('Code actions shown');
            } else {
                console.error('Code actions element not found!');
            }
        }
        
        function hideCodeActions() {
            console.log('Hiding code actions');
            const codeActions = document.getElementById('codeActions');
            if (codeActions) {
                codeActions.style.display = 'none';
                console.log('Code actions hidden');
            } else {
                console.error('Code actions element not found!');
            }
        }
        
        // Fallback editor for when Monaco fails
        function createFallbackEditor(content) {
            const container = document.getElementById('monacoContainer');
            container.innerHTML = \`
                <textarea style="
                    width: 100%; 
                    height: 100%; 
                    background: var(--vscode-editor-background); 
                    color: var(--vscode-editor-foreground); 
                    border: none; 
                    font-family: 'Cascadia Code', 'Fira Code', monospace; 
                    font-size: 14px; 
                    padding: 16px; 
                    resize: none;
                    outline: none;
                " placeholder="Monaco Editor failed to load. Using fallback editor.">\${content}</textarea>
            \`;
        }
        
        // Progress management
        function updateProgress(progress, message) {
            const section = document.getElementById('progressSection');
            const fill = document.getElementById('progressFill');
            const text = document.getElementById('progressText');
            
            section.style.display = 'block';
            fill.style.width = progress + '%';
            text.textContent = message;
        }
        
        function hideProgress() {
            document.getElementById('progressSection').style.display = 'none';
        }
        
        // Notification system
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = \`notification \${type}\`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, type === 'error' ? 5000 : 3000);
        }
        
        // Types for message handling
        type AuthStatus = 'success' | 'error' | 'pending';
        type AuthType = 'github' | 'openai';

        // Authentication status management
        function updateAuthStatus(type: AuthType, status: AuthStatus, message?: string) {
            const element = document.getElementById(type + 'AuthStatus');
            const icon = document.getElementById(type + 'AuthIcon');
            
            if (!element || !icon) return;
            
            element.className = 'auth-status ' + status;
            switch (status) {
                case 'success':
                    icon.textContent = '✅';
                    break;
                case 'error':
                    icon.textContent = '❌';
                    break;
                case 'pending':
                    icon.textContent = '⏳';
                    break;
            }
            
            if (message) {
                showNotification(message, status === 'error' ? 'error' : 'info');
            }
        }

        // Repository analysis management
        function addRepoToList(repoName: string) {
            const repoList = document.getElementById('repoList');
            if (!repoList) return;
            
            repoList.style.display = 'block';
            
            const repoItem = document.createElement('div');
            repoItem.className = 'repo-item';
            repoItem.id = 'repo-' + repoName;
            repoItem.innerHTML = 
                '<span>' + repoName + '</span>' +
                '<span class="repo-progress">0%</span>';
            
            repoList.appendChild(repoItem);
        }

        function updateRepoProgress(repoName: string, progress: number) {
            const repoItem = document.getElementById('repo-' + repoName);
            if (!repoItem) return;
            
            const progressElement = repoItem.querySelector('.repo-progress');
            if (!progressElement) return;
            
            progressElement.textContent = progress + '%';
            
            if (progress === 100) {
                repoItem.classList.add('analyzed');
                setTimeout(() => repoItem.remove(), 500);
            }
        }

        // Style cache management
        interface StyleProfileData {
            indentStyle: string;
            indentSize: number;
            quoteStyle: string;
            useSemicolons: boolean;
            fileCount: number;
            reposAnalyzed?: number;
        }

        function updateStyleProfile(profile: StyleProfileData) {
            const styleProfile = document.getElementById('styleProfile');
            const cacheSection = document.getElementById('cacheSection');
            
            if (!styleProfile || !cacheSection) return;
            
            cacheSection.style.display = 'block';
            styleProfile.innerHTML = 
                '<div class="style-item">' +
                    '<span>Indentation:</span>' +
                    '<span class="style-value">' + profile.indentStyle + ' (' + (profile.indentSize || 2) + ')</span>' +
                '</div>' +
                '<div class="style-item">' +
                    '<span>Quotes:</span>' +
                    '<span class="style-value">' + profile.quoteStyle + '</span>' +
                '</div>' +
                '<div class="style-item">' +
                    '<span>Semicolons:</span>' +
                    '<span class="style-value">' + (profile.useSemicolons ? 'Yes' : 'No') + '</span>' +
                '</div>' +
                '<div class="style-item">' +
                    '<span>Files Analyzed:</span>' +
                    '<span class="style-value">' + profile.fileCount + '</span>' +
                '</div>' +
                (profile.reposAnalyzed ? 
                    '<div class="style-item">' +
                        '<span>Repositories Analyzed:</span>' +
                        '<span class="style-value">' + profile.reposAnalyzed + '</span>' +
                    '</div>' : '');
        }

        function clearStyleCache() {
            vscode.postMessage({ command: 'clearStyleCache' });
            document.getElementById('cacheSection').style.display = 'none';
            showNotification('Style cache cleared', 'info');
        }

        function exportStyleProfile() {
            vscode.postMessage({ command: 'exportStyleProfile' });
        }

        // Main generation function
        async function startGeneration() {
            const token = document.getElementById('githubToken').value.trim();
            const username = document.getElementById('githubUsername').value.trim();
            const openaiKey = document.getElementById('openaiKey').value.trim();
            const codeSpec = document.getElementById('codeSpec').value.trim();
            const maxRepos = parseInt(document.getElementById('maxRepos').value) || 10;
            
            // Validation
            if (!token || !username || !openaiKey || !codeSpec) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Disable button and show progress
            const btn = document.getElementById('generateBtn');
            btn.disabled = true;
            btn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
            
            try {
                // Reset UI state
                document.getElementById('repoList').innerHTML = '';
                document.getElementById('repoList').style.display = 'none';
                document.getElementById('cacheSection').style.display = 'none';
                updateAuthStatus('github', 'pending');
                updateAuthStatus('openai', 'pending');
                
                // Clear previous files
                Object.keys(currentFiles).forEach(fileName => {
                    if (monacoEditor) {
                        monacoEditor.dispose();
                        monacoEditor = null;
                    }
                });
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
                showNotification('Failed to start generation: ' + error.message, 'error');
                resetGenerateButton();
                updateAuthStatus('github', 'error');
                updateAuthStatus('openai', 'error');
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
            if (Object.keys(currentFiles).length === 0) {
                showNotification('No files to save', 'error');
                return;
            }
            
            vscode.postMessage({
                command: 'saveProject',
                files: currentFiles
            });
        }
        
        function exportFiles() {
            if (Object.keys(currentFiles).length === 0) {
                showNotification('No files to export', 'error');
                return;
            }
            
            vscode.postMessage({
                command: 'exportFiles',
                files: currentFiles
            });
        }
        
        function copyCurrentFile() {
            if (!activeFile || !currentFiles[activeFile]) {
                showNotification('No active file to copy', 'error');
                return;
            }
            
            vscode.postMessage({
                command: 'copyToClipboard',
                code: currentFiles[activeFile].content
            });
        }
        
        function downloadProject() {
            if (Object.keys(currentFiles).length === 0) {
                showNotification('No files to download', 'error');
                return;
            }
            
            vscode.postMessage({
                command: 'downloadProject',
                files: currentFiles
            });
        }
        
        // Message types
        interface AuthStatusMessage {
            command: 'authStatus';
            service: AuthType;
            status: AuthStatus;
            message?: string;
        }

        interface RepoAnalysisMessage {
            command: 'repoAnalysis';
            type: 'start' | 'progress';
            repoName: string;
            progress?: number;
        }

        interface StyleProfileMessage {
            command: 'styleProfile';
            profile: StyleProfileData;
        }

        interface GenerationCompleteMessage {
            command: 'generationComplete';
            success: boolean;
            error?: string;
        }

        interface ShowProgressMessage {
            command: 'showProgress';
            progress: number;
            message: string;
        }

        interface ShowStyleProfileMessage {
            command: 'showStyleProfile';
            profile: StyleProfileData;
        }

        interface ShowGeneratedFilesMessage {
            command: 'showGeneratedFiles';
            files: Record<string, GeneratedFile>;
        }

        interface ShowErrorMessage {
            command: 'showError';
            error: string;
        }

        interface SaveSuccessMessage {
            command: 'saveSuccess';
        }

        interface CopySuccessMessage {
            command: 'copySuccess';
        }

        type ExtensionMessage =
            | AuthStatusMessage
            | RepoAnalysisMessage
            | StyleProfileMessage
            | GenerationCompleteMessage
            | ShowProgressMessage
            | ShowStyleProfileMessage
            | ShowGeneratedFilesMessage
            | ShowErrorMessage
            | SaveSuccessMessage
            | CopySuccessMessage;

        // Message handling from extension
        window.addEventListener('message', (event: MessageEvent<ExtensionMessage>) => {
            const message = event.data;
            
            switch (message.command) {
                case 'authStatus':
                    updateAuthStatus(message.service, message.status, message.message);
                    break;
                    
                case 'repoAnalysis':
                    if (message.type === 'start') {
                        addRepoToList(message.repoName);
                    } else if (message.type === 'progress' && typeof message.progress === 'number') {
                        updateRepoProgress(message.repoName, message.progress);
                    }
                    break;
                    
                case 'styleProfile':
                    updateStyleProfile(message.profile);
                    break;
                    
                case 'generationComplete':
                    resetGenerateButton();
                    if (message.success) {
                        showNotification('Code generation completed successfully!', 'info');
                    } else {
                        showNotification('Code generation failed: ' + (message.error || 'Unknown error'), 'error');
                    }
                    break;
                    
                case 'showProgress':
                    updateProgress(message.progress, message.message);
                    break;
                    
                case 'showStyleProfile':
                    updateStyleProfile(message.profile);
                    break;
                    
                case 'showGeneratedFiles':
                    displayGeneratedFiles(message.files);
                    resetGenerateButton();
                    showNotification('Code generation completed!', 'success');
                    break;
                    
                case 'showError':
                    showNotification(message.error, 'error');
                    resetGenerateButton();
                    break;
                    
                case 'saveSuccess':
                    showNotification('Project saved successfully!', 'success');
                    break;
                    
                case 'copySuccess':
                    showNotification('Code copied to clipboard!', 'success');
                    break;
            }
        });
        
        function displayStyleProfile(profile: StyleProfileData) {
            const profileDiv = document.getElementById('styleProfile');
            const indentSpan = document.getElementById('indentStyle');
            const quoteSpan = document.getElementById('quoteStyle');
            const semicolonSpan = document.getElementById('semicolonStyle');
            const confidenceSpan = document.getElementById('confidenceLevel');
            
            profileDiv.style.display = 'block';
            indentSpan.textContent = profile.indentStyle;
            quoteSpan.textContent = profile.quoteStyle;
            semicolonSpan.textContent = profile.useSemicolons ? 'Yes' : 'No';
            confidenceSpan.textContent = profile.confidence ? 
                \`\${profile.confidence.level} (\${profile.confidence.percentage}%)\` : 'Unknown';
        }
        
        interface GeneratedFile {
            content: string;
            language: string;
        }

        function displayGeneratedFiles(files: Record<string, GeneratedFile>) {
            // Clear existing files
            currentFiles = {};
            
            // Hide welcome screen before adding files
            hideWelcomeScreen();
            showCodeActions();
            
            // Add each generated file
            Object.entries(files).forEach(([fileName, fileData]) => {
                const language = getLanguageFromFileName(fileName);
                addFile(fileName, fileData.content, language);
            });
            
            // Switch to the first file
            const firstFile = Object.keys(files)[0];
            if (firstFile) {
                switchToFile(firstFile);
            }
        }
        
        function getLanguageFromFileName(fileName: string): string {
            const ext = fileName.split('.').pop()?.toLowerCase();
            const languageMap = {
                js: 'javascript', jsx: 'javascript', 
                ts: 'typescript', tsx: 'typescript',
                py: 'python', java: 'java', 
                cpp: 'cpp', c: 'c', cs: 'csharp',
                php: 'php', rb: 'ruby', go: 'go', rs: 'rust',
                vue: 'vue', svelte: 'svelte',
                html: 'html', css: 'css', scss: 'scss', sass: 'scss',
                json: 'json', md: 'markdown', 
                yaml: 'yaml', yml: 'yaml',
                xml: 'xml', sql: 'sql', sh: 'shell'
            };
            return languageMap[ext] || 'plaintext';
        }
        
        // Initialize the interface
        console.log('🚀 GitHub Style Agent - Enhanced UI initialized');
        
        // Show welcome message
        setTimeout(() => {
            if (Object.keys(currentFiles).length === 0) {
                showNotification('Welcome to GitHub Style Agent! Configure your settings and start generating code.', 'info');
            }
        }, 1000);
    </script>
</body>
</html>`;
}
