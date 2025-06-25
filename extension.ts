// File: extension.ts
// Entry point for the TRAE AI VS Code Extension

import * as vscode from 'vscode';
import { getWebviewContent } from './webviewContent';
import { analyzeMultipleReposPatterns, generateCodeSample } from './traeEngine';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'trae-ai.generate',
    async () => {
      const panel = vscode.window.createWebviewPanel(
        'traeAiPanel',
        'GitStyle AI Code Generator',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      panel.webview.html = getWebviewContent(
        panel.webview,
        context.extensionUri
      );

      panel.webview.onDidReceiveMessage(
        async (message) => {
          switch (message.command) {
            case 'analyzeAndGenerate':
              try {
                vscode.window.showInformationMessage(
                  '🔍 Analyzing your GitHub style and generating code...'
                );

                const {
                  token,
                  openaiKey,
                  username,
                  spec,
                  maxRepos = 10,
                  analysisDepth = 'detailed',
                } = message;

                // Fetch style patterns across multiple public repositories for the user
                const patterns = await analyzeMultipleReposPatterns(
                  token,
                  username,
                  maxRepos,
                  analysisDepth
                );

                // Generate final code using OpenAI + user style
                const generatedCode = await generateCodeSample(
                  patterns,
                  spec,
                  openaiKey
                );

                // Send result back to webview
                panel.webview.postMessage({
                  command: 'showResult',
                  result: generatedCode,
                });
              } catch (err: any) {
                vscode.window.showErrorMessage(
                  `TRAE AI error: ${err.message || err}`
                );

                // Also send error to the webview panel
                panel.webview.postMessage({
                  command: 'showError',
                  error: err.message || String(err),
                });
              }
              break;
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
