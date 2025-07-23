#!/usr/bin/env node

/**
 * Fix Monaco Editor integration in VS Code extension
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Monaco Editor integration...');

function fixWebviewContent() {
  console.log('\n1. Fixing webviewContent.ts for Monaco paths...');
  
  const webviewPath = './webviewContent.ts';
  if (!fs.existsSync(webviewPath)) {
    console.error(`❌ ${webviewPath} not found`);
    return false;
  }
  
  let content = fs.readFileSync(webviewPath, 'utf8');
  
  // Check if Monaco paths are already correct
  if (content.includes("'out', 'vs', 'loader.js'") && 
      content.includes("'out', 'vs'") && 
      content.includes('monaco.editor.create')) {
    console.log('   ✅ Monaco paths already correctly configured');
    return true;
  }
  
  // Create enhanced webview content with Monaco Editor
  const enhancedContent = `// Enhanced webviewContent.ts with Monaco Editor integration
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

  return \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
          script-src 'nonce-\${nonce}' \${webview.cspSource} 'unsafe-eval'; 
          style-src \${webview.cspSource} 'unsafe-inline'; 
          img-src \${webview.cspSource} https:; 
          font-src \${webview.cspSource};">
    <title>CodeStyle Generator</title>

    <!-- Monaco Editor CSS -->
    <link rel="stylesheet" href="\${monacoUri}/editor/editor.main.css" />

    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            padding: 0;
            margin: 0;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        
        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding: 20px;
            box-sizing: border-box;
        }
        
        .header {
            margin-bottom: 20px;
        }
        
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 400;
            color: var(--vscode-editor-foreground);
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: var(--vscode-editor-foreground);
        }
        
        input[type="text"],
        input[type="password"],
        textarea,
        select {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid var(--vscode-dropdown-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 2px;
            font-size: 14px;
        }
        
        textarea {
            resize: vertical;
            min-height: 100px;
        }
        
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 12px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        }
        
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .options-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .checkbox-group {
            display: flex;
            align-items: center;
            margin-right: 15px;
        }
        
        .checkbox-group input[type="checkbox"] {
            margin-right: 5px;
        }
        
        .tabs {
            display: flex;
            border-bottom: 1px solid var(--vscode-panel-border);
            margin-bottom: 15px;
        }
        
        .tab {
            padding: 8px 16px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
        }
        
        .tab.active {
            border-bottom-color: var(--vscode-focusBorder);
            font-weight: 500;
        }
        
        .tab-content {
            display: none;
            flex: 1;
            overflow: auto;
        }
        
        .tab-content.active {
            display: flex;
            flex-direction: column;
        }
        
        .editor-container {
            flex: 1;
            border: 1px solid var(--vscode-panel-border);
            overflow: hidden;
            margin-bottom: 15px;
        }
        
        #monaco-container {
            height: 100%;
            min-height: 300px;
        }
        
        .file-explorer {
            width: 250px;
            border-right: 1px solid var(--vscode-panel-border);
            overflow: auto;
        }
        
        .file-item {
            padding: 5px 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
        }
        
        .file-item:hover {
            background-color: var(--vscode-list-hoverBackground);
        }
        
        .file-item.active {
            background-color: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
        }
        
        .file-icon {
            margin-right: 5px;
            font-size: 14px;
        }
        
        .status-bar {
            padding: 5px 10px;
            font-size: 12px;
            background-color: var(--vscode-statusBar-background);
            color: var(--vscode-statusBar-foreground);
            display: flex;
            justify-content: space-between;
        }
        
        .loading {
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid var(--vscode-progressBar-background);
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            margin-right: 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CodeStyle Generator</h1>
        </div>
        
        <div class="form-group">
            <label for="openai-key">OpenAI API Key</label>
            <input type="password" id="openai-key" placeholder="sk-..." />
        </div>
        
        <div class="form-group">
            <label for="github-username">GitHub Username (optional)</label>
            <input type="text" id="github-username" placeholder="Enter GitHub username to analyze their repos" />
        </div>
        
        <div class="form-group">
            <label for="max-repos">Max Repos to Analyze</label>
            <input type="number" id="max-repos" value="3" min="1" max="10" />
        </div>
        
        <div class="form-group">
            <label for="spec">Project Specification</label>
            <textarea id="spec" placeholder="Describe the project you want to generate..."></textarea>
        </div>
        
        <div class="form-group">
            <label>Generation Options</label>
            <div class="options-container">
                <div class="checkbox-group">
                    <input type="checkbox" id="include-tests" />
                    <label for="include-tests">Include Tests</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="include-comments" checked />
                    <label for="include-comments">Include Comments</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="use-typescript" checked />
                    <label for="use-typescript">Use TypeScript</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="init-git" checked />
                    <label for="init-git">Initialize Git</label>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label for="template">Project Template</label>
            <select id="template">
                <option value="node">Node.js</option>
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="express">Express API</option>
                <option value="html">HTML/CSS/JS</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="model">Model</label>
            <select id="model">
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="complexity">Complexity</label>
            <select id="complexity">
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="complex">Complex</option>
            </select>
        </div>
        
        <button id="generate-btn">Generate Project</button>
        
        <div id="loading" class="loading">
            <div class="spinner"></div>
            <span id="status-message">Analyzing repositories...</span>
        </div>
        
        <div id="result-container" style="display: none; margin-top: 20px;">
            <div class="tabs">
                <div class="tab active" data-tab="editor">Code Editor</div>
                <div class="tab" data-tab="files">Files</div>
            </div>
            
            <div class="tab-content active" data-tab-content="editor">
                <div class="editor-container">
                    <div id="monaco-container"></div>
                </div>
                
                <div class="form-group">
                    <button id="save-btn">Save Project</button>
                    <button id="export-btn">Export Files</button>
                    <button id="download-btn">Download as ZIP</button>
                </div>
            </div>
            
            <div class="tab-content" data-tab-content="files">
                <div id="file-list"></div>
            </div>
        </div>
        
        <div class="status-bar">
            <span id="status">Ready</span>
            <span id="file-info"></span>
        </div>
    </div>

    <!-- Monaco Editor JS -->
    <script src="\${monacoLoaderUri}" nonce="\${nonce}"></script>
    
    <script nonce="\${nonce}">
        const vscode = acquireVsCodeApi();
        let editor;
        let currentFile = null;
        let projectFiles = {};
        
        // Initialize Monaco Editor
        require.config({ paths: { vs: '\${monacoUri.toString().replace(/^\/([A-Za-z]):/, '$1:')}' } });
        
        require(['vs/editor/editor.main'], function() {
            // Create Monaco editor instance
            editor = monaco.editor.create(document.getElementById('monaco-container'), {
                value: '// Code will appear here after generation',
                language: 'javascript',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                roundedSelection: true,
                selectOnLineNumbers: true,
                wordWrap: 'on'
            });
            
            // Handle editor content changes
            editor.onDidChangeModelContent(() => {
                if (currentFile) {
                    projectFiles[currentFile].content = editor.getValue();
                }
            });
        });
        
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                document.querySelector(\`.tab-content[data-tab-content="\${tab.dataset.tab}"]\`).classList.add('active');
            });
        });
        
        // Generate button click handler
        document.getElementById('generate-btn').addEventListener('click', () => {
            const openaiKey = document.getElementById('openai-key').value;
            const githubUsername = document.getElementById('github-username').value;
            const maxRepos = parseInt(document.getElementById('max-repos').value, 10);
            const spec = document.getElementById('spec').value;
            const includeTests = document.getElementById('include-tests').checked;
            const includeComments = document.getElementById('include-comments').checked;
            const useTypeScript = document.getElementById('use-typescript').checked;
            const initGit = document.getElementById('init-git').checked;
            const template = document.getElementById('template').value;
            const model = document.getElementById('model').value;
            const complexity = document.getElementById('complexity').value;
            
            if (!openaiKey) {
                alert('Please enter your OpenAI API key');
                return;
            }
            
            if (!spec) {
                alert('Please enter a project specification');
                return;
            }
            
            // Show loading indicator
            document.getElementById('loading').style.display = 'flex';
            document.getElementById('generate-btn').disabled = true;
            document.getElementById('status').textContent = 'Generating...';
            
            // Send message to extension
            vscode.postMessage({
                command: 'analyzeAndGenerate',
                token: Math.random().toString(36).substring(2),
                openaiKey,
                username: githubUsername,
                spec,
                maxRepos,
                options: {
                    model,
                    complexity,
                    includeTests,
                    includeComments,
                    template,
                    useTypeScript,
                    initGit
                }
            });
        });
        
        // Save button click handler
        document.getElementById('save-btn').addEventListener('click', () => {
            vscode.postMessage({
                command: 'saveProject',
                files: projectFiles
            });
        });
        
        // Export button click handler
        document.getElementById('export-btn').addEventListener('click', () => {
            vscode.postMessage({
                command: 'exportFiles',
                files: projectFiles
            });
        });
        
        // Download button click handler
        document.getElementById('download-btn').addEventListener('click', () => {
            vscode.postMessage({
                command: 'downloadProject',
                files: projectFiles
            });
        });
        
        // Handle messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'generationComplete':
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('generate-btn').disabled = false;
                    document.getElementById('result-container').style.display = 'block';
                    document.getElementById('status').textContent = 'Generation complete';
                    
                    // Store generated files
                    projectFiles = message.files;
                    
                    // Update file list
                    updateFileList(projectFiles);
                    
                    // Set first file as current
                    const firstFile = Object.keys(projectFiles)[0];
                    if (firstFile) {
                        setCurrentFile(firstFile);
                    }
                    break;
                    
                case 'showError':
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('generate-btn').disabled = false;
                    document.getElementById('status').textContent = 'Error';
                    alert(message.error);
                    break;
                    
                case 'updateStatus':
                    document.getElementById('status-message').textContent = message.status;
                    document.getElementById('status').textContent = message.status;
                    break;
                    
                case 'saveComplete':
                    document.getElementById('status').textContent = 'Project saved';
                    break;
            }
        });
        
        // Update file list in the UI
        function updateFileList(files) {
            const fileList = document.getElementById('file-list');
            fileList.innerHTML = '';
            
            Object.keys(files).sort().forEach(filename => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.dataset.filename = filename;
                
                const fileIcon = document.createElement('span');
                fileIcon.className = 'file-icon';
                fileIcon.textContent = '📄';
                
                const fileText = document.createElement('span');
                fileText.textContent = filename;
                
                fileItem.appendChild(fileIcon);
                fileItem.appendChild(fileText);
                
                fileItem.addEventListener('click', () => {
                    setCurrentFile(filename);
                });
                
                fileList.appendChild(fileItem);
            });
        }
        
        // Set current file and update editor
        function setCurrentFile(filename) {
            currentFile = filename;
            
            // Update active file in the list
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.filename === filename) {
                    item.classList.add('active');
                }
            });
            
            // Update editor content and language
            const file = projectFiles[filename];
            if (file) {
                const language = getLanguageFromFilename(filename);
                
                // Update the model
                const oldModel = editor.getModel();
                const newModel = monaco.editor.createModel(file.content, language);
                editor.setModel(newModel);
                if (oldModel) {
                    oldModel.dispose();
                }
                
                // Update file info in status bar
                document.getElementById('file-info').textContent = \`\${filename} | \${language}\`;
            }
        }
        
        // Get language ID from filename
        function getLanguageFromFilename(filename) {
            const ext = filename.split('.').pop().toLowerCase();
            
            const languageMap = {
                'js': 'javascript',
                'ts': 'typescript',
                'jsx': 'javascript',
                'tsx': 'typescript',
                'html': 'html',
                'css': 'css',
                'json': 'json',
                'md': 'markdown',
                'vue': 'html',
                'py': 'python',
                'java': 'java',
                'c': 'c',
                'cpp': 'cpp',
                'cs': 'csharp',
                'go': 'go',
                'rb': 'ruby',
                'php': 'php',
                'sh': 'shell',
                'yaml': 'yaml',
                'yml': 'yaml',
                'xml': 'xml',
                'sql': 'sql',
                'swift': 'swift',
                'kt': 'kotlin',
                'rs': 'rust'
            };
            
            return languageMap[ext] || 'plaintext';
        }
    </script>
</body>
</html>\`;
}
`;
  
  // Backup the original file
  const backupPath = './webviewContent.ts.bak';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(webviewPath, backupPath);
    console.log(`   ✓ Backed up original file to ${backupPath}`);
  }
  
  // Write the enhanced content
  fs.writeFileSync(webviewPath, enhancedContent);
  console.log('   ✓ Updated webviewContent.ts with Monaco Editor integration');
  
  return true;
}

function fixExtensionTs() {
  console.log('\n2. Fixing extension.ts for proper webview configuration...');
  
  const extensionPath = './extension.ts';
  if (!fs.existsSync(extensionPath)) {
    console.error(`❌ ${extensionPath} not found`);
    return false;
  }
  
  let content = fs.readFileSync(extensionPath, 'utf8');
  
  // Check if localResourceRoots already includes out directory
  if (content.includes('localResourceRoots') && 
      content.includes("'out'") && 
      content.includes('console.log(\'Extension URI:')) {
    console.log('   ✓ Extension.ts already configured correctly');
    return true;
  }
  
  // Add debugging logs to extension.ts
  const panelCreationRegex = /const panel = vscode\.window\.createWebviewPanel\([\s\S]*?\);\s*\n/;
  
  if (panelCreationRegex.test(content)) {
    const replacement = `$&
        // Log extension URI and resource roots for debugging
        console.log('Extension URI:', context.extensionUri.fsPath);
        console.log('Resource Roots:', [
          vscode.Uri.joinPath(context.extensionUri, 'out').fsPath,
          vscode.Uri.joinPath(context.extensionUri, 'node_modules').fsPath,
          context.extensionUri.fsPath,
        ]);
`;
    
    content = content.replace(panelCreationRegex, replacement);
    
    // Backup the original file
    const backupPath = './extension.ts.bak';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(extensionPath, backupPath);
      console.log(`   ✓ Backed up original file to ${backupPath}`);
    }
    
    // Write the updated content
    fs.writeFileSync(extensionPath, content);
    console.log('   ✓ Updated extension.ts with debugging logs');
    
    return true;
  } else {
    console.error('❌ Could not find panel creation code in extension.ts');
    return false;
  }
}

function updatePackageJson() {
  console.log('\n3. Updating package.json scripts...');
  
  const packagePath = './package.json';
  if (!fs.existsSync(packagePath)) {
    console.error(`❌ ${packagePath} not found`);
    return false;
  }
  
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  } catch (error) {
    console.error(`❌ Error parsing package.json: ${error.message}`);
    return false;
  }
  
  // Check if scripts are already updated
  if (packageJson.scripts && 
      packageJson.scripts['build:monaco'] === 'node scripts/copy-monaco.js' && 
      packageJson.scripts['prebuild'] && 
      packageJson.scripts['prebuild'].includes('build:monaco')) {
    console.log('   ✓ Package.json scripts already configured correctly');
    return true;
  }
  
  // Backup the original file
  const backupPath = './package.json.bak';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(packagePath, backupPath);
    console.log(`   ✓ Backed up original file to ${backupPath}`);
  }
  
  // Update scripts
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  packageJson.scripts['build:monaco'] = 'node scripts/copy-monaco.js';
  
  if (!packageJson.scripts['prebuild']) {
    packageJson.scripts['prebuild'] = 'npm run clean && npm run build:monaco';
  } else if (!packageJson.scripts['prebuild'].includes('build:monaco')) {
    packageJson.scripts['prebuild'] += ' && npm run build:monaco';
  }
  
  // Write the updated package.json
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('   ✓ Updated package.json scripts');
  
  return true;
}

function createCopyMonacoScript() {
  console.log('\n4. Creating Monaco copy script...');
  
  const scriptsDir = './scripts';
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
    console.log(`   ✓ Created scripts directory`);
  }
  
  const scriptPath = './scripts/copy-monaco.js';
  
  // Check if script already exists
  if (fs.existsSync(scriptPath)) {
    const content = fs.readFileSync(scriptPath, 'utf8');
    if (content.includes('copyMonacoFiles') && content.includes('Cross-platform script')) {
      console.log('   ✓ Monaco copy script already exists');
      return true;
    }
  }
  
  // Create the script
  const scriptContent = `#!/usr/bin/env node

/**
 * Cross-platform script to copy Monaco Editor files
 */

const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function copyMonacoFiles() {
  console.log('📦 Copying Monaco Editor files...');
  
  const monacoSrc = path.join(__dirname, '..', 'node_modules', 'monaco-editor', 'min');
  const monacoDest = path.join(__dirname, '..', 'out');
  
  if (!fs.existsSync(monacoSrc)) {
    console.error('❌ Monaco Editor not found in node_modules');
    console.log('Run: npm install monaco-editor');
    process.exit(1);
  }
  
  // Ensure output directory exists
  if (!fs.existsSync(monacoDest)) {
    fs.mkdirSync(monacoDest, { recursive: true });
  }
  
  try {
    // Copy the entire min directory contents to out
    const vsSrc = path.join(monacoSrc, 'vs');
    const vsDest = path.join(monacoDest, 'vs');
    
    if (fs.existsSync(vsDest)) {
      // Remove existing vs directory
      fs.rmSync(vsDest, { recursive: true, force: true });
    }
    
    console.log(\`Copying from: \${vsSrc}\`);
    console.log(\`Copying to: \${vsDest}\`);
    
    copyRecursiveSync(vsSrc, vsDest);
    
    // Verify critical files exist
    const criticalFiles = [
      path.join(vsDest, 'loader.js'),
      path.join(vsDest, 'editor', 'editor.main.js'),
      path.join(vsDest, 'editor', 'editor.main.css'),
      path.join(vsDest, 'base', 'worker', 'workerMain.js')
    ];
    
    let allExist = true;
    for (const file of criticalFiles) {
      if (fs.existsSync(file)) {
        console.log(\`✓ \${path.relative(monacoDest, file)}\`);
      } else {
        console.error(\`❌ Missing: \${path.relative(monacoDest, file)}\`);
        allExist = false;
      }
    }
    
    if (allExist) {
      console.log('✅ Monaco Editor files copied successfully!');
    } else {
      throw new Error('Some critical Monaco files are missing');
    }
    
  } catch (error) {
    console.error('❌ Error copying Monaco files:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  copyMonacoFiles();
}

module.exports = { copyMonacoFiles };
`;
  
  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, '755');
  console.log(`   ✓ Created Monaco copy script at ${scriptPath}`);
  
  return true;
}

function runFixes() {
  console.log('=== Monaco Editor Integration Fix ===\n');
  
  const webviewFixed = fixWebviewContent();
  const extensionFixed = fixExtensionTs();
  const packageJsonUpdated = updatePackageJson();
  const copyScriptCreated = createCopyMonacoScript();
  
  console.log('\n=== Fix Summary ===');
  console.log(`Webview Content: ${webviewFixed ? '✅' : '❌'}`);
  console.log(`Extension Configuration: ${extensionFixed ? '✅' : '❌'}`);
  console.log(`Package.json Scripts: ${packageJsonUpdated ? '✅' : '❌'}`);
  console.log(`Monaco Copy Script: ${copyScriptCreated ? '✅' : '❌'}`);
  
  if (webviewFixed && extensionFixed && packageJsonUpdated && copyScriptCreated) {
    console.log('\n✅ All fixes applied successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run clean');
    console.log('2. Run: npm run build');
    console.log('3. Run: npm run dev:enhanced');
    console.log('\nIf you still experience issues, check the Developer Tools console in VS Code for errors.');
  } else {
    console.log('\n❌ Some fixes failed. Please check the errors above.');
  }
}

runFixes();