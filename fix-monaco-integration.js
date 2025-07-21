#!/usr/bin/env node

/**
 * Cross-Platform Monaco Editor Fix Script
 * Fixes the Monaco Editor integration issues in your VS Code extension
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Monaco Editor integration...\n');

// Create scripts directory if it doesn't exist
function createScriptsDirectory() {
  const scriptsDir = './scripts';
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
    console.log('✓ Created scripts directory');
  }
}

// Create cross-platform Monaco copy script
function createMonacoCopyScript() {
  console.log('1. Creating cross-platform Monaco copy script...');

  const copyScript = `#!/usr/bin/env node

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
  
  const monacoSrc = './node_modules/monaco-editor/min';
  const monacoDest = './out';
  
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
    // Copy the vs directory (contains Monaco Editor)
    const vsSrc = path.join(monacoSrc, 'vs');
    const vsDest = path.join(monacoDest, 'vs');
    
    if (fs.existsSync(vsDest)) {
      // Remove existing vs directory
      fs.rmSync(vsDest, { recursive: true, force: true });
    }
    
    copyRecursiveSync(vsSrc, vsDest);
    console.log('✓ Monaco Editor files copied successfully');
    
    // Verify critical files exist
    const loaderPath = path.join(vsDest, 'loader.js');
    const editorPath = path.join(vsDest, 'editor');
    
    if (fs.existsSync(loaderPath) && fs.existsSync(editorPath)) {
      console.log('✓ Monaco Editor installation verified');
    } else {
      throw new Error('Critical Monaco files missing after copy');
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

  fs.writeFileSync('./scripts/copy-monaco.js', copyScript);
  console.log('   ✓ Created scripts/copy-monaco.js');
}

// Update package.json with correct scripts
function updatePackageJsonScripts() {
  console.log('2. Updating package.json scripts...');

  const packagePath = './package.json';
  if (!fs.existsSync(packagePath)) {
    console.error('❌ package.json not found');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Update scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'build:monaco': 'node scripts/copy-monaco.js',
    'verify:monaco': 'node scripts/verify-monaco.js',
    prebuild: 'npm run clean && npm run build:monaco',
    postbuild: 'npm run verify:monaco',
    'dev:enhanced': 'npm run build && code --extensionDevelopmentPath=.',
  };

  // Ensure monaco-editor is in dependencies
  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }
  packageJson.dependencies['monaco-editor'] = '^0.45.0';

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('   ✓ Updated package.json scripts');
  return true;
}

// Create Monaco verification script
function createVerificationScript() {
  console.log('3. Creating Monaco verification script...');

  const verifyScript = `#!/usr/bin/env node

/**
 * Verify Monaco Editor installation
 */

const fs = require('fs');
const path = require('path');

function verifyMonacoInstallation() {
  console.log('🔍 Verifying Monaco Editor installation...');
  
  const requiredFiles = [
    './out/vs/loader.js',
    './out/vs/editor/editor.main.js',
    './out/vs/editor/editor.main.css',
    './out/vs/base/worker/workerMain.js'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log('✓ ' + file);
    } else {
      console.log('❌ ' + file + ' - MISSING');
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    console.log('\\n✅ Monaco Editor verification successful!');
    
    // Check file sizes to ensure they're not empty
    const loaderSize = fs.statSync('./out/vs/loader.js').size;
    const editorSize = fs.statSync('./out/vs/editor/editor.main.js').size;
    
    if (loaderSize > 1000 && editorSize > 100000) {
      console.log('✓ File sizes look correct');
      console.log('  - loader.js: ' + Math.round(loaderSize/1024) + 'KB');
      console.log('  - editor.main.js: ' + Math.round(editorSize/1024) + 'KB');
    } else {
      console.log('⚠️ Some files appear to be incomplete');
    }
    
  } else {
    console.log('\\n❌ Monaco Editor verification failed!');
    console.log('Run: npm run build:monaco');
    process.exit(1);
  }
}

if (require.main === module) {
  verifyMonacoInstallation();
}

module.exports = { verifyMonacoInstallation };
`;

  fs.writeFileSync('./scripts/verify-monaco.js', verifyScript);
  console.log('   ✓ Created scripts/verify-monaco.js');
}

// Fix webview content to properly load Monaco
function fixWebviewContent() {
  console.log('4. Fixing webview content for Monaco Editor...');

  const webviewPath = './webviewContent.ts';
  if (!fs.existsSync(webviewPath)) {
    console.error('❌ webviewContent.ts not found');
    return false;
  }

  let content = fs.readFileSync(webviewPath, 'utf8');

  // Check if Monaco paths are already correct
  if (content.includes("'vs', 'loader.js'") && content.includes("'vs'")) {
    console.log('   ✓ Monaco paths already configured');
    return true;
  }

  // Fix Monaco Editor URIs
  const monacoLoaderRegex = /const monacoLoaderUri = .*?;/s;
  const monacoUriRegex = /const monacoUri = .*?;/s;

  if (monacoLoaderRegex.test(content) && monacoUriRegex.test(content)) {
    // Replace with correct paths
    content = content.replace(
      monacoLoaderRegex,
      'const monacoLoaderUri = webview.asWebviewUri(' +
        "vscode.Uri.joinPath(extensionUri, 'out', 'vs', 'loader.js')" +
        ');'
    );

    content = content.replace(
      monacoUriRegex,
      'const monacoUri = webview.asWebviewUri(' +
        "vscode.Uri.joinPath(extensionUri, 'out', 'vs')" +
        ');'
    );

    fs.writeFileSync(webviewPath, content);
    console.log('   ✓ Fixed Monaco Editor paths in webviewContent.ts');
    return true;
  }

  console.log('   ⚠️ Could not automatically fix webview content');
  return false;
}

// Create a test script to verify everything works
function createTestScript() {
  console.log('5. Creating test script...');

  const testScript = `#!/usr/bin/env node

/**
 * Test Monaco Editor integration
 */

console.log('🧪 Testing Monaco Editor integration...');

// Test 1: Check if Monaco files exist
const fs = require('fs');

console.log('\\n1. Checking Monaco files...');
const { verifyMonacoInstallation } = require('./verify-monaco');
verifyMonacoInstallation();

// Test 2: Check webview content
console.log('\\n2. Checking webview content...');
const webviewPath = '../webviewContent.ts';
if (fs.existsSync(webviewPath)) {
  const content = fs.readFileSync(webviewPath, 'utf8');
  if (content.includes('monaco-editor')) {
    console.log('✓ Webview references Monaco Editor');
  } else {
    console.log('❌ Webview does not reference Monaco Editor');
  }
  
  if (content.includes('vs/loader.js')) {
    console.log('✓ Loader script referenced');
  } else {
    console.log('❌ Loader script not properly referenced');
  }
} else {
  console.log('❌ webviewContent.ts not found');
}

// Test 3: Check package.json
console.log('\\n3. Checking package.json...');
const packagePath = '../package.json';
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (pkg.dependencies && pkg.dependencies['monaco-editor']) {
    console.log('✓ Monaco Editor dependency present');
  } else {
    console.log('❌ Monaco Editor dependency missing');
  }
  
  if (pkg.scripts && pkg.scripts['build:monaco']) {
    console.log('✓ Build script configured');
  } else {
    console.log('❌ Build script missing');
  }
} else {
  console.log('❌ package.json not found');
}

console.log('\\n🎉 Test complete! If all items show ✓, Monaco Editor should work.');
console.log('\\nNext steps:');
console.log('1. npm run build');
console.log('2. Press F5 in VS Code to test the extension');
`;

  fs.writeFileSync('./scripts/test-monaco.js', testScript);
  console.log('   ✓ Created scripts/test-monaco.js');
}

// Main execution
async function fixMonacoIntegration() {
  try {
    createScriptsDirectory();
    createMonacoCopyScript();
    updatePackageJsonScripts();
    createVerificationScript();
    fixWebviewContent();
    createTestScript();

    console.log('\n🎉 Monaco Editor integration fixes applied!');
    console.log('\n📋 What was fixed:');
    console.log('   • Cross-platform Monaco copy script');
    console.log('   • Updated package.json build scripts');
    console.log('   • Added verification and testing scripts');
    console.log('   • Fixed webview Monaco paths');

    console.log('\n🚀 Next steps:');
    console.log('1. npm install                    # Install dependencies');
    console.log('2. npm run build:monaco          # Copy Monaco files');
    console.log('3. npm run build                 # Build the extension');
    console.log('4. npm run verify:monaco         # Verify installation');
    console.log('5. Press F5 in VS Code           # Test the extension');

    console.log('\n🧪 To test the fix:');
    console.log('cd scripts && node test-monaco.js');

    console.log('\n⚠️ If you still see the old UI:');
    console.log('1. Close all VS Code windows');
    console.log('2. Reload VS Code');
    console.log('3. Try the extension again');
  } catch (error) {
    console.error('\n❌ Error applying Monaco fixes:', error.message);
    console.log('\n🔄 If you encounter issues:');
    console.log('1. Delete node_modules and package-lock.json');
    console.log('2. Run: npm install');
    console.log('3. Run this script again');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  fixMonacoIntegration();
}

module.exports = { fixMonacoIntegration };
