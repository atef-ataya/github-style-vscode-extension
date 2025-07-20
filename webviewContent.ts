// File: webviewContent.ts
import * as vscode from 'vscode';

export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CodeStyle Code Generator</title>
    <style>
      :root {
        --background-color: #1e1e1e;
        --input-background: #2d2d2d;
        --text-color: #d4d4d4;
        --primary-color: #007acc;
        --error-color: #f44336;
        --success-color: #4caf50;
        --border-radius: 4px;
      }
      
      body {
        background-color: var(--background-color);
        color: var(--text-color);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        padding: 1.5rem;
        line-height: 1.6;
        max-width: 900px;
        margin: 0 auto;
      }
      
      .container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      
      input, textarea, button {
        width: 100%;
        padding: 0.75rem;
        margin: 0.25rem 0 0.75rem;
        border-radius: var(--border-radius);
        border: 1px solid #444;
        font-size: 14px;
        transition: all 0.2s ease;
      }
      
      input:focus, textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.25);
      }
      
      input, textarea {
        background-color: var(--input-background);
        color: #ffffff;
      }
      
      button {
        background-color: var(--primary-color);
        color: #ffffff;
        cursor: pointer;
        font-weight: 600;
        border: none;
        transition: background-color 0.2s ease;
      }
      
      button:hover {
        background-color: #0066b3;
      }
      
      button:active {
        background-color: #005999;
      }
      
      pre {
        background: var(--input-background);
        padding: 1.25rem;
        overflow-x: auto;
        border-radius: var(--border-radius);
        white-space: pre-wrap;
        word-wrap: break-word;
        border: 1px solid #444;
        font-family: 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace;
      }
      
      label span {
        margin-left: 4px;
        color: #888;
        cursor: help;
      }
      
      #loadingSpinner {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 1rem 0;
        padding: 0.75rem;
        background-color: rgba(0, 122, 204, 0.1);
        border-radius: var(--border-radius);
      }
      
      #errorMessage {
        color: var(--error-color);
        margin: 1rem 0;
        padding: 0.75rem;
        background-color: rgba(244, 67, 54, 0.1);
        border-radius: var(--border-radius);
        display: none;
      }
      
      #errorMessage:not(:empty) {
        display: block;
      }
      
      h3 {
        margin-top: 2rem;
        border-bottom: 1px solid #444;
        padding-bottom: 0.5rem;
      }
      
      .result-section {
        margin-top: 2rem;
      }
      
      .code-actions {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      
      .action-button {
        background-color: #2d2d2d;
        color: #d4d4d4;
        border: 1px solid #444;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        width: auto;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      
      .action-button:hover {
        background-color: #3d3d3d;
        border-color: var(--primary-color);
      }
      
      .footer {
        margin-top: 2rem;
        text-align: center;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>CodeStyle Code Generator</h2>
      <p>Generate code that matches your personal coding style by analyzing your GitHub repositories.</p>
      
      <div class="form-group">
        <label for="token">
          GitHub Token:
          <span title="Required for accessing your GitHub repositories">ℹ️</span>
        </label>
        <input type="password" id="token" placeholder="ghp_..." />
      </div>

      <div class="form-group">
        <label for="openaiKey">
          OpenAI API Key:
          <span title="Required for code generation">ℹ️</span>
        </label>
        <input type="password" id="openaiKey" placeholder="sk-..." />
      </div>

      <div class="form-group">
        <label for="username">
          GitHub Username:
          <span title="Analyzes up to N public repos from this GitHub account">ℹ️</span>
        </label>
        <input type="text" id="username" placeholder="e.g. atef-ataya" />
      </div>

      <div class="form-group">
        <label for="maxRepos">
          Max Repositories to Analyze:
          <span title="Higher values increase accuracy but take longer">ℹ️</span>
        </label>
        <input type="number" id="maxRepos" placeholder="10" value="10" min="1" max="50" />
      </div>

      <div class="form-group">
        <label for="spec">What do you want to build?</label>
        <textarea id="spec" rows="4" placeholder="e.g. Create a REST API for weather service in Node.js"></textarea>
      </div>

      <button onclick="submitData()">🚀 Analyze & Generate</button>

      <div id="loadingSpinner" style="display:none;">
        <progress></progress>
        <span>Analyzing your GitHub style and generating code...</span>
      </div>

      <div id="errorMessage"></div>

      <div class="result-section">
        <h3>🧠 Generated Code:</h3>
        <div class="code-actions" style="display: none;">
          <button onclick="saveToFile()" class="action-button">💾 Save to File</button>
          <button onclick="copyToClipboard()" class="action-button">📋 Copy to Clipboard</button>
        </div>
        <pre id="output">(awaiting generation...)</pre>
      </div>
      
      <div class="footer">
        <p><small>CodeStyle Code Generator - Powered by OpenAI</small></p>
      </div>
    </div>

    <script>
      const vscode = acquireVsCodeApi();
      const loadingSpinner = document.getElementById('loadingSpinner');

      function toggleLoading(show) {
        loadingSpinner.style.display = show ? 'block' : 'none';
      }

      function displayError(msg) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
          errorDiv.textContent = "❌ CodeStyle Error: " + msg;
          errorDiv.style.display = 'block';
        }
      }
      
      function saveToFile() {
        const code = document.getElementById('output').textContent;
        if (!code || code === '(awaiting generation...)') {
          displayError('No code to save');
          return;
        }
        
        vscode.postMessage({
          command: 'saveToFile',
          code: code
        });
      }
      
      function copyToClipboard() {
        const code = document.getElementById('output').textContent;
        if (!code || code === '(awaiting generation...)') {
          displayError('No code to copy');
          return;
        }
        
        // Use the VSCode API to copy to clipboard
        vscode.postMessage({
          command: 'copyToClipboard',
          code: code
        });
      }

      function submitData() {
        // Clear previous errors
        document.getElementById('errorMessage').textContent = '';
        
        // Validate inputs
        const token = document.getElementById('token').value.trim();
        const openaiKey = document.getElementById('openaiKey').value.trim();
        const username = document.getElementById('username').value.trim();
        const spec = document.getElementById('spec').value.trim();
        const maxRepos = parseInt(document.getElementById('maxRepos').value) || 10;
        
        // Validation checks
        if (!token) {
          displayError('GitHub token is required');
          return;
        }
        
        if (!openaiKey) {
          displayError('OpenAI API key is required');
          return;
        }
        
        if (!username) {
          displayError('GitHub username is required');
          return;
        }
        
        if (!spec) {
          displayError('Please specify what you want to build');
          return;
        }
        
        // Show loading spinner
        toggleLoading(true);
        
        // Send message to extension
        vscode.postMessage({
          command: 'analyzeAndGenerate',
          token,
          openaiKey,
          username,
          spec,
          maxRepos
        });
      }

      window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
          case 'showResult':
            document.getElementById('output').textContent = message.result;
            toggleLoading(false);
            // Show action buttons
            document.querySelector('.code-actions').style.display = 'flex';
            // Scroll to the result
            document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
            break;
          case 'showError':
            displayError(message.error);
            toggleLoading(false);
            break;
          case 'showLoading':
            toggleLoading(true);
            // Hide action buttons while loading
            document.querySelector('.code-actions').style.display = 'none';
            if (message.message) {
              document.querySelector('#loadingSpinner span').textContent = message.message;
            }
            break;
          case 'updateStyleProfile':
            // Could display the detected style profile in the future
            console.log('Style profile updated:', message.styleProfile);
            break;
          case 'updateGeneratedCode':
            document.getElementById('output').textContent = message.generatedCode;
            toggleLoading(false);
            // Show action buttons
            document.querySelector('.code-actions').style.display = 'flex';
            // Scroll to the result
            document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
            break;
          case 'saveSuccess':
            // Show success message when file is saved
            const successMsg = document.createElement('div');
            successMsg.textContent = '✅ ' + message.message;
            successMsg.style.color = 'var(--success-color)';
            successMsg.style.padding = '0.75rem';
            successMsg.style.marginTop = '1rem';
            successMsg.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            successMsg.style.borderRadius = 'var(--border-radius)';
            // Remove after 3 seconds
            setTimeout(() => successMsg.remove(), 3000);
            document.querySelector('.result-section').appendChild(successMsg);
            break;
          case 'copySuccess':
            // Show success message when code is copied
            const copyMsg = document.createElement('div');
            copyMsg.textContent = '✅ Code copied to clipboard';
            copyMsg.style.color = 'var(--success-color)';
            copyMsg.style.padding = '0.75rem';
            copyMsg.style.marginTop = '1rem';
            copyMsg.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            copyMsg.style.borderRadius = 'var(--border-radius)';
            // Remove after 3 seconds
            setTimeout(() => copyMsg.remove(), 3000);
            document.querySelector('.result-section').appendChild(copyMsg);
            break;
          default:
            console.log('Unknown command:', message.command);
        }
      });
    </script>
  </body>
  </html>
`;
}
