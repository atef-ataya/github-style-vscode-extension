"use strict";
// File: extension.ts
// Entry point for the TRAE AI VS Code Extension
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const webviewContent_1 = require("./webviewContent");
const traeEngine_1 = require("./traeEngine");
function activate(context) {
    const disposable = vscode.commands.registerCommand('trae-ai.generate', async () => {
        const panel = vscode.window.createWebviewPanel('traeAiPanel', 'GitStyle AI Code Generator', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        panel.webview.html = (0, webviewContent_1.getWebviewContent)(panel.webview, context.extensionUri);
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'analyzeAndGenerate':
                    try {
                        vscode.window.showInformationMessage('🔍 Analyzing your GitHub style and generating code...');
                        const { token, openaiKey, username, spec, maxRepos = 10, analysisDepth = 'detailed', } = message;
                        // Fetch style patterns across multiple public repositories for the user
                        const patterns = await (0, traeEngine_1.analyzeMultipleReposPatterns)(token, username, maxRepos, analysisDepth);
                        // Generate final code using OpenAI + user style
                        const generatedCode = await (0, traeEngine_1.generateCodeSample)(patterns, spec, openaiKey);
                        // Send result back to webview
                        panel.webview.postMessage({
                            command: 'showResult',
                            result: generatedCode,
                        });
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`TRAE AI error: ${err.message || err}`);
                        // Also send error to the webview panel
                        panel.webview.postMessage({
                            command: 'showError',
                            error: err.message || String(err),
                        });
                    }
                    break;
            }
        }, undefined, context.subscriptions);
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
