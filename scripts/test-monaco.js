#!/usr/bin/env node

/**
 * Test Monaco Editor integration
 */

console.log('🧪 Testing Monaco Editor integration...');

// Test 1: Check if Monaco files exist
const fs = require('fs');

console.log('\n1. Checking Monaco files...');
const { verifyMonacoInstallation } = require('./verify-monaco');
verifyMonacoInstallation();

// Test 2: Check webview content
console.log('\n2. Checking webview content...');
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
console.log('\n3. Checking package.json...');
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

console.log('\n🎉 Test complete! If all items show ✓, Monaco Editor should work.');
console.log('\nNext steps:');
console.log('1. npm run build');
console.log('2. Press F5 in VS Code to test the extension');
