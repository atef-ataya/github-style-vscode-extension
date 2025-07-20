// File: extension.ts
// Entry point for the CodeStyle VS Code Extension

import * as vscode from 'vscode';
import { getWebviewContent } from './webviewContent';
import { analyzeMultipleReposPatterns, generateCodeSample } from './CodeStyleEngine';

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeStyle extension is now active!');
  
  const disposable = vscode.commands.registerCommand(
    'codestyle.generate',
    async () => {
      try {
        const panel = vscode.window.createWebviewPanel(
          'codeStylePanel',
          'CodeStyle Code Generator',
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
        
        // Handle panel disposal
        panel.onDidDispose(
          () => {
            console.log('CodeStyle panel disposed');
          },
          null,
          context.subscriptions
        );

      panel.webview.onDidReceiveMessage(
        async (message) => {
          switch (message.command) {
            case 'analyzeAndGenerate':
              try {
                if (!message.token || !message.openaiKey || !message.username || !message.spec) {
                  const errorMsg = 'Missing required parameters. Please provide all required fields.';
                  vscode.window.showErrorMessage(`CodeStyle error: ${errorMsg}`);
                  panel.webview.postMessage({
                    command: 'showError',
                    error: errorMsg,
                  });
                  return;
                }
                
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
                  openaiKey,
                  patterns,
                  spec
                );

                // Send result back to webview
                panel.webview.postMessage({
                  command: 'showResult',
                  result: generatedCode,
                });
              } catch (err: any) {
                vscode.window.showErrorMessage(
                  `CodeStyle error: ${err.message || err}`
                );

                // Also send error to the webview panel
                panel.webview.postMessage({
                  command: 'showError',
                  error: err.message || String(err),
                });
              }
              break;
              
            case 'saveToFile':
              try {
                if (!message.code) {
                  throw new Error('No code to save');
                }
                
                // Show save dialog
                const uri = await vscode.window.showSaveDialog({
                  filters: {
                    'JavaScript': ['js'],
                    'TypeScript': ['ts'],
                    'Python': ['py'],
                    'Java': ['java'],
                    'C#': ['cs'],
                    'All Files': ['*']
                  }
                });
                
                if (uri) {
                  // Write to file
                  await vscode.workspace.fs.writeFile(
                    uri,
                    Buffer.from(message.code, 'utf8')
                  );
                  
                  // Show success message
                  vscode.window.showInformationMessage('Code saved successfully!');
                  panel.webview.postMessage({
                    command: 'saveSuccess',
                    message: 'Code saved successfully!'
                  });
                }
              } catch (err: any) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                vscode.window.showErrorMessage(`Error saving file: ${errorMessage}`);
                panel.webview.postMessage({
                  command: 'showError',
                  error: errorMessage,
                });
              }
              break;
              
            case 'copyToClipboard':
              try {
                if (!message.code) {
                  throw new Error('No code to copy');
                }
                
                // Copy to clipboard using vscode.env.clipboard
                await vscode.env.clipboard.writeText(message.code);
                
                // Show success message
                vscode.window.showInformationMessage('Code copied to clipboard!');
                panel.webview.postMessage({
                  command: 'copySuccess'
                });
              } catch (err: any) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                vscode.window.showErrorMessage(`Error copying to clipboard: ${errorMessage}`);
                panel.webview.postMessage({
                  command: 'showError',
                  error: errorMessage,
                });
              }
              break;
              
            default:
              console.log(`Unhandled command: ${message.command}`);
          }
        },
        undefined,
        context.subscriptions
      );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`CodeStyle error: ${errorMessage}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
