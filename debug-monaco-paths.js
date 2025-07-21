#!/usr/bin/env node

/**
 * Debug Monaco Editor paths in VS Code extension
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Monaco Editor paths...\n');

// Check if extension files exist
function checkExtensionFiles() {
  console.log('1. Checking extension build output...');

  const extensionJs = './out/extension.js';
  const webviewJs = './out/webviewContent.js';

  if (fs.existsSync(extensionJs)) {
    console.log('   ✅ out/extension.js exists');
  } else {
    console.log('   ❌ out/extension.js missing - run npm run build');
  }

  if (fs.existsSync(webviewJs)) {
    console.log('   ✅ out/webviewContent.js exists');

    // Check if webview content includes Monaco paths
    const content = fs.readFileSync(webviewJs, 'utf8');
    if (content.includes('out/vs/loader.js')) {
      console.log('   ✅ Monaco loader path found in webview');
    } else {
      console.log('   ❌ Monaco loader path NOT found in webview');
    }
  } else {
    console.log('   ❌ out/webviewContent.js missing - run npm run build');
  }
}

// Check Monaco files
function checkMonacoFiles() {
  console.log('\n2. Checking Monaco Editor files...');

  const requiredFiles = [
    './out/vs/loader.js',
    './out/vs/editor/editor.main.js',
    './out/vs/editor/editor.main.css',
  ];

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const size = fs.statSync(file).size;
      console.log(`   ✅ ${file} (${Math.round(size / 1024)}KB)`);
    } else {
      console.log(`   ❌ ${file} - MISSING`);
    }
  });
}

// Check webview source
function checkWebviewSource() {
  console.log('\n3. Checking webview TypeScript source...');

  const webviewTs = './webviewContent.ts';
  if (fs.existsSync(webviewTs)) {
    const content = fs.readFileSync(webviewTs, 'utf8');

    // Check for Monaco integration markers
    const hasMonacoLoader = content.includes("'out', 'vs', 'loader.js'");
    const hasMonacoUri = content.includes("'out', 'vs'");
    const hasMonacoScript = content.includes('monaco.editor.create');
    const hasRequireConfig = content.includes('require.config');

    console.log(`   Monaco Loader Path: ${hasMonacoLoader ? '✅' : '❌'}`);
    console.log(`   Monaco URI Path: ${hasMonacoUri ? '✅' : '❌'}`);
    console.log(`   Monaco Script: ${hasMonacoScript ? '✅' : '❌'}`);
    console.log(`   Require Config: ${hasRequireConfig ? '✅' : '❌'}`);

    if (
      hasMonacoLoader &&
      hasMonacoUri &&
      hasMonacoScript &&
      hasRequireConfig
    ) {
      console.log('   ✅ Webview source appears correct');
    } else {
      console.log('   ❌ Webview source has issues');
    }
  } else {
    console.log('   ❌ webviewContent.ts not found');
  }
}

// Check package.json
function checkPackageJson() {
  console.log('\n4. Checking package.json configuration...');

  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

  if (pkg.dependencies && pkg.dependencies['monaco-editor']) {
    console.log(
      `   ✅ Monaco dependency: ${pkg.dependencies['monaco-editor']}`
    );
  } else {
    console.log('   ❌ Monaco dependency missing');
  }

  if (pkg.scripts && pkg.scripts['build:monaco']) {
    console.log('   ✅ build:monaco script configured');
  } else {
    console.log('   ❌ build:monaco script missing');
  }
}

// Generate debug HTML for manual testing
function generateDebugHtml() {
  console.log('\n5. Generating debug HTML...');

  const debugHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Monaco Debug Test</title>
    <style>
        body { background: #1e1e1e; color: #fff; font-family: monospace; }
        #container { width: 100%; height: 400px; border: 1px solid #555; }
        .log { background: #333; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Monaco Editor Debug Test</h1>
    <div id="log" class="log">Loading...</div>
    <div id="container"></div>
    
    <script src="./out/vs/loader.js"></script>
    <script>
        const log = document.getElementById('log');
        
        function addLog(message) {
            log.innerHTML += '<div>' + new Date().toLocaleTimeString() + ': ' + message + '</div>';
            console.log(message);
        }
        
        addLog('Starting Monaco test...');
        
        require.config({ 
            paths: { vs: './out/vs' },
            'vs/nls': {
                availableLanguages: {
                    '*': 'en'
                }
            }
        });
        
        addLog('Require.config set, loading editor...');
        
        require(['vs/editor/editor.main'], function () {
            addLog('✅ Monaco Editor loaded successfully!');
            
            try {
                const editor = monaco.editor.create(document.getElementById('container'), {
                    value: 'console.log("Monaco Editor is working!");',
                    language: 'javascript',
                    theme: 'vs-dark'
                });
                addLog('✅ Monaco Editor instance created successfully!');
            } catch (error) {
                addLog('❌ Error creating Monaco Editor: ' + error.message);
            }
        }, function(error) {
            addLog('❌ Failed to load Monaco Editor: ' + JSON.stringify(error));
        });
    </script>
</body>
</html>`;

  fs.writeFileSync('./debug-monaco.html', debugHtml);
  console.log('   ✅ Created debug-monaco.html');
  console.log(
    '   👉 Open debug-monaco.html in your browser to test Monaco directly'
  );
}

// Main execution
function debugMonacoPaths() {
  checkExtensionFiles();
  checkMonacoFiles();
  checkWebviewSource();
  checkPackageJson();
  generateDebugHtml();

  console.log('\n🎯 Summary:');
  console.log('If all items show ✅, Monaco should work in your extension.');
  console.log('\nNext debug steps:');
  console.log('1. Open debug-monaco.html in browser to test Monaco directly');
  console.log('2. Check VS Code Extension Development Host console (F12)');
  console.log('3. Right-click in webview → Inspect → Console tab');
  console.log('4. Look for Monaco loading errors or CSP violations');
}

debugMonacoPaths();
