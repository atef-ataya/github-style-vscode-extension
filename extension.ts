// File: extension.ts
// Entry point for the CodeStyle VS Code Extension

import * as vscode from 'vscode';

import { getWebviewContent } from './webviewContent';
import {
  analyzeMultipleReposPatterns,
  generateCodeSample,
} from './CodeStyleEngine';

// Type definitions for webview messages
interface BaseMessage {
  command: string;
}

interface AnalyzeAndGenerateMessage extends BaseMessage {
  command: 'analyzeAndGenerate';
  token: string;
  openaiKey: string;
  username: string;
  spec: string;
  maxRepos?: number;
  analysisDepth?: 'basic' | 'detailed';
}

interface SaveToFileMessage extends BaseMessage {
  command: 'saveToFile';
  code: string;
}

interface CopyToClipboardMessage extends BaseMessage {
  command: 'copyToClipboard';
  code: string;
}

function isAnalyzeAndGenerateMessage(message: BaseMessage): message is AnalyzeAndGenerateMessage {
  return message.command === 'analyzeAndGenerate';
}

function isSaveToFileMessage(message: BaseMessage): message is SaveToFileMessage {
  return message.command === 'saveToFile';
}

function isCopyToClipboardMessage(message: BaseMessage): message is CopyToClipboardMessage {
  return message.command === 'copyToClipboard';
}

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    'codestyle.generate',
    async (): Promise<void> => {
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
            // Panel disposed - cleanup if needed
          },
          null,
          context.subscriptions
        );

        panel.webview.onDidReceiveMessage(
          (message: BaseMessage): void => {
            void (async (): Promise<void> => {
              if (isAnalyzeAndGenerateMessage(message)) {
                await handleAnalyzeAndGenerate(message, panel);
              } else if (isSaveToFileMessage(message)) {
                await handleSaveToFile(message, panel);
              } else if (isCopyToClipboardMessage(message)) {
                await handleCopyToClipboard(message, panel);
              }
            })();
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

async function handleAnalyzeAndGenerate(
  message: AnalyzeAndGenerateMessage,
  panel: vscode.WebviewPanel
): Promise<void> {
  try {
    if (!message.token || !message.openaiKey || !message.username || !message.spec) {
      const errorMsg = 'Missing required parameters. Please provide all required fields.';
      void vscode.window.showErrorMessage(`CodeStyle error: ${errorMsg}`);
      void panel.webview.postMessage({
        command: 'showError',
        error: errorMsg,
      });
      return;
    }

    void vscode.window.showInformationMessage(
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
    void panel.webview.postMessage({
      command: 'showResult',
      result: generatedCode,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    void vscode.window.showErrorMessage(`CodeStyle error: ${errorMessage}`);

    // Also send error to the webview panel
    void panel.webview.postMessage({
      command: 'showError',
      error: errorMessage,
    });
  }
}

async function handleSaveToFile(
  message: SaveToFileMessage,
  panel: vscode.WebviewPanel
): Promise<void> {
  try {
    if (!message.code) {
      throw new Error('No code to save');
    }

    // Show save dialog
    const uri = await vscode.window.showSaveDialog({
      filters: {
        JavaScript: ['js'],
        TypeScript: ['ts'],
        Python: ['py'],
        Java: ['java'],
        'C#': ['cs'],
        'All Files': ['*'],
      },
    });

    if (uri) {
      // Write to file
      await vscode.workspace.fs.writeFile(
        uri,
        Buffer.from(message.code, 'utf8')
      );

      // Show success message
      void vscode.window.showInformationMessage('Code saved successfully!');
      void panel.webview.postMessage({
        command: 'saveSuccess',
        message: 'Code saved successfully!',
      });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    void vscode.window.showErrorMessage(`Error saving file: ${errorMessage}`);
    void panel.webview.postMessage({
      command: 'showError',
      error: errorMessage,
    });
  }
}

async function handleCopyToClipboard(
  message: CopyToClipboardMessage,
  panel: vscode.WebviewPanel
): Promise<void> {
  try {
    if (!message.code) {
      throw new Error('No code to copy');
    }

    // Copy to clipboard using vscode.env.clipboard
    await vscode.env.clipboard.writeText(message.code);

    // Show success message
    void vscode.window.showInformationMessage('Code copied to clipboard!');
    void panel.webview.postMessage({
      command: 'copySuccess',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    void vscode.window.showErrorMessage(`Error copying to clipboard: ${errorMessage}`);
    void panel.webview.postMessage({
      command: 'showError',
      error: errorMessage,
    });
  }
}

export function deactivate(): void {
  // Cleanup if needed
}