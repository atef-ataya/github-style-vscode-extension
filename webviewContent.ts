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
    <title>TRAE AI Code Generator</title>
    <style>
      body {
        background-color: #1e1e1e;
        color: #d4d4d4;
        font-family: Consolas, monospace;
        padding: 1rem;
      }
      input, textarea, button {
        width: 100%;
        padding: 0.5rem;
        margin: 0.5rem 0;
        border-radius: 4px;
        border: none;
      }
      input, textarea {
        background-color: #2d2d2d;
        color: #ffffff;
      }
      button {
        background-color: #007acc;
        color: #ffffff;
        cursor: pointer;
      }
      pre {
        background: #2d2d2d;
        padding: 1rem;
        overflow-x: auto;
        border-radius: 6px;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      label span {
        margin-left: 4px;
        color: #888;
        cursor: help;
      }
    </style>
  </head>
  <body>
    <title> GitStyle AI Code Generator</title>
    <label for="token">GitHub Token:</label>
    <input type="password" id="token" placeholder="ghp_..." />

    <label for="openaiKey">OpenAI API Key:</label>
    <input type="password" id="openaiKey" placeholder="sk-..." />

    <label for="username">
      GitHub Username:
      <span title="Analyzes up to N public repos from this GitHub account">ℹ️</span>
    </label>
    <input type="text" id="username" placeholder="e.g. atef-ataya" />

    <label for="maxRepos">
      Max Repositories to Analyze:
      <span title="Higher values increase accuracy but take longer">ℹ️</span>
    </label>
    <input type="number" id="maxRepos" placeholder="10" min="1" max="50" />

    <label for="spec">What do you want to build?</label>
    <textarea id="spec" rows="4" placeholder="e.g. Create a REST API for weather service in Node.js"></textarea>

    <button onclick="submitData()">🚀 Analyze & Generate</button>

    <div id="loadingSpinner" style="display:none; margin-top: 10px;">
      <progress></progress>
      <span>Analyzing your GitHub style and generating code...</span>
    </div>

    <div id="errorMessage" style="color: red; margin-top: 10px;"></div>

    <h3>🧠 Generated Code:</h3>
    <pre id="output">(awaiting generation...)</pre>

    <script>
      const vscode = acquireVsCodeApi();
      const loadingSpinner = document.getElementById('loadingSpinner');

      function toggleLoading(show) {
        loadingSpinner.style.display = show ? 'block' : 'none';
      }

      function displayError(msg) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
          errorDiv.textContent = "❌ TRAE AI Error: " + msg;
        }
      }

      function submitData() {
        toggleLoading(true);
        document.getElementById('errorMessage').textContent = '';

        const token = document.getElementById('token').value;
        const openaiKey = document.getElementById('openaiKey').value;
        const username = document.getElementById('username').value;
        const spec = document.getElementById('spec').value;
        const maxRepos = parseInt(document.getElementById('maxRepos').value) || 10;

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
            break;
          case 'showError':
            displayError(message.error);
            toggleLoading(false);
            break;
        }
      });
    </script>
  </body>
  </html>
`;
}
