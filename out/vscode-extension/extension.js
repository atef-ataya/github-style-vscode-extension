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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const webviewContent_1 = require("./webviewContent");
const traeEngine_1 = require("./traeEngine");
function activate(context) {
    const disposable = vscode.commands.registerCommand('trae-ai.generate', async () => {
        const panel = vscode.window.createWebviewPanel('traeAiPanel', 'TRAE AI Code Generator', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        panel.webview.html = (0, webviewContent_1.getWebviewContent)(panel.webview, context.extensionUri);
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'analyzeAndGenerate':
                    try {
                        vscode.window.showInformationMessage('Analyzing your GitHub style and generating code...');
                        const { repoUrl, token, spec, openaiKey } = message;
                        const patterns = await (0, traeEngine_1.analyzeRepoPatterns)(repoUrl, token);
                        const generatedCode = await (0, traeEngine_1.generateCodeSample)(patterns, spec, openaiKey);
                        panel.webview.postMessage({
                            command: 'showResult',
                            result: generatedCode,
                        });
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`TRAE AI error: ${err}`);
                    }
                    break;
            }
        }, undefined, context.subscriptions);
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
