#!/usr/bin/env node

/**
 * Debug Monaco Editor paths in VS Code extension
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Debugging Monaco Editor paths in VS Code extension...');

function checkMonacoFiles() {
  console.log('\n1. Checking Monaco Editor files in out directory...');
  
  const outDir = './out';
  const vsDir = path.join(outDir, 'vs');
  const loaderJs = path.join(vsDir, 'loader.js');
  const editorMainJs = path.join(vsDir, 'editor', 'editor.main.js');
  const editorMainCss = path.join(vsDir, 'editor', 'editor.main.css');
  
  if (!fs.existsSync(outDir)) {
    console.error(`❌ Output directory '${outDir}' does not exist`);
    return false;
  }
  
  if (!fs.existsSync(vsDir)) {
    console.error(`❌ Monaco directory '${vsDir}' does not exist`);
    return false;
  }
  
  console.log('Checking critical Monaco files:');
  const criticalFiles = [
    { path: loaderJs, name: 'loader.js' },
    { path: editorMainJs, name: 'editor.main.js' },
    { path: editorMainCss, name: 'editor.main.css' },
  ];
  
  let allExist = true;
  criticalFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      const stats = fs.statSync(file.path);
      console.log(`   ✅ ${file.name} (${formatBytes(stats.size)})`);
    } else {
      console.error(`   ❌ ${file.name} is missing`);
      allExist = false;
    }
  });
  
  return allExist;
}

function checkWebviewContent() {
  console.log('\n2. Checking webviewContent.ts for Monaco paths...');
  
  const webviewPath = './webviewContent.ts';
  if (!fs.existsSync(webviewPath)) {
    console.error(`❌ ${webviewPath} not found`);
    return false;
  }
  
  const content = fs.readFileSync(webviewPath, 'utf8');
  
  // Check for Monaco integration
  const hasMonacoLoader = content.includes("'out', 'vs', 'loader.js'");
  const hasMonacoUri = content.includes("'out', 'vs'");
  const hasMonacoScript = content.includes('monaco.editor.create');
  const hasRequireConfig = content.includes('require.config');
  
  console.log(`   Monaco Loader Path: ${hasMonacoLoader ? '✅' : '❌'}`);
  console.log(`   Monaco URI Path: ${hasMonacoUri ? '✅' : '❌'}`);
  console.log(`   Monaco Script: ${hasMonacoScript ? '✅' : '❌'}`);
  console.log(`   Require Config: ${hasRequireConfig ? '✅' : '❌'}`);
  
  return hasMonacoLoader && hasMonacoUri && hasMonacoScript;
}

function checkExtensionTs() {
  console.log('\n3. Checking extension.ts for webview configuration...');
  
  const extensionPath = './extension.ts';
  if (!fs.existsSync(extensionPath)) {
    console.error(`❌ ${extensionPath} not found`);
    return false;
  }
  
  const content = fs.readFileSync(extensionPath, 'utf8');
  
  // Check for proper webview configuration
  const hasLocalResourceRoots = content.includes('localResourceRoots');
  const hasOutDir = content.includes("'out'") || content.includes('"out"');
  const hasEnableScripts = content.includes('enableScripts: true');
  
  console.log(`   Local Resource Roots: ${hasLocalResourceRoots ? '✅' : '❌'}`);
  console.log(`   Out Directory in Roots: ${hasOutDir ? '✅' : '❌'}`);
  console.log(`   Enable Scripts: ${hasEnableScripts ? '✅' : '❌'}`);
  
  return hasLocalResourceRoots && hasOutDir && hasEnableScripts;
}

function checkCompiledFiles() {
  console.log('\n4. Checking compiled JavaScript files...');
  
  const outWebviewPath = './out/webviewContent.js';
  if (!fs.existsSync(outWebviewPath)) {
    console.error(`❌ ${outWebviewPath} not found - run npm run build`);
    return false;
  }
  
  const content = fs.readFileSync(outWebviewPath, 'utf8');
  
  // Check for Monaco paths in compiled JS
  const hasMonacoLoader = content.includes('out/vs/loader.js') || 
                          content.includes('out\\\\/vs\\\\/loader.js') || 
                          content.includes('"out", "vs", "loader.js"') ||
                          content.includes('\'out\', \'vs\', \'loader.js\'');
  const hasMonacoUri = content.includes('out/vs') || 
                       content.includes('out\\\\/vs') || 
                       content.includes('"out", "vs"') ||
                       content.includes('\'out\', \'vs\'');
  
  console.log(`   Monaco Loader Path in JS: ${hasMonacoLoader ? '✅' : '❌'}`);
  console.log(`   Monaco URI Path in JS: ${hasMonacoUri ? '✅' : '❌'}`);
  
  return hasMonacoLoader && hasMonacoUri;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function runDiagnostics() {
  console.log('\n=== Monaco Editor Integration Diagnostics ===\n');
  
  const monacoFilesOk = checkMonacoFiles();
  const webviewContentOk = checkWebviewContent();
  const extensionTsOk = checkExtensionTs();
  const compiledFilesOk = checkCompiledFiles();
  
  console.log('\n=== Diagnostics Summary ===');
  console.log(`Monaco Files: ${monacoFilesOk ? '✅' : '❌'}`);
  console.log(`Webview Content: ${webviewContentOk ? '✅' : '❌'}`);
  console.log(`Extension Configuration: ${extensionTsOk ? '✅' : '❌'}`);
  console.log(`Compiled Files: ${compiledFilesOk ? '✅' : '❌'}`);
  
  const allPassed = monacoFilesOk && webviewContentOk && extensionTsOk && compiledFilesOk;
  console.log(`\nOverall Status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (allPassed) {
    console.log('\n✅ All checks passed! Monaco Editor should be working correctly.');
    console.log('If you\'re still experiencing issues, try:');
    console.log('1. Restart VS Code');
    console.log('2. Run npm run clean && npm run build');
    console.log('3. Check the Developer Tools console in VS Code for errors');
  } else {
    console.log('\n❌ Some checks failed. Please fix the issues above.');
  }
}

runDiagnostics();