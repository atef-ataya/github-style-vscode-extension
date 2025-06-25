"use strict";
// File: webviewContent.ts
// Generates the HTML content for the TRAE AI WebView (dark-themed)
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebviewContent = void 0;
function getWebviewContent(webview, extensionUri) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
      </style>
    </head>
    <body>
      <h2>🔍 TRAE AI — GitHub Style Code Generator</h2>

      <label>GitHub Token:</label>
      <input type="password" id="token" placeholder="ghp_..." />

      <label>OpenAI API Key:</label>
      <input type="password" id="openaiKey" placeholder="sk-..." />

      <label>Repository URL:</label>
      <input type="text" id="repoUrl" placeholder="https://github.com/yourname/yourrepo" />

      <label>What do you want to build?</label>
      <textarea id="spec" rows="4" placeholder="e.g. Generate a simple user auth API using Express"></textarea>

      <button onclick="submitData()">🚀 Analyze & Generate</button>

      <h3>🧠 Generated Code:</h3>
      <pre id="output">(awaiting generation...)</pre>

      <script>
        const vscode = acquireVsCodeApi();

        function submitData() {
          const token = document.getElementById('token').value;
          const openaiKey = document.getElementById('openaiKey').value;
          const repoUrl = document.getElementById('repoUrl').value;
          const spec = document.getElementById('spec').value;

          vscode.postMessage({
            command: 'analyzeAndGenerate',
            token,
            openaiKey,
            repoUrl,
            spec
          });
        }

        window.addEventListener('message', event => {
          const message = event.data;
          if (message.command === 'showResult') {
            document.getElementById('output').textContent = message.result;
          }
        });
      </script>
    </body>
    </html>
  `;
}
exports.getWebviewContent = getWebviewContent;
