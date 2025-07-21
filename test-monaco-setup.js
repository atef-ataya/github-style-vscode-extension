#!/usr/bin/env node

/**
 * Test script to verify Monaco Editor installation
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Monaco Editor installation...');

let success = true;
let issues = [];

// Check if monaco-editor is installed
try {
  const packageJsonPath = './package.json';
  if (!fs.existsSync(packageJsonPath)) {
    success = false;
    issues.push('package.json not found');
  } else {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check dependencies
    if (!packageJson.dependencies || !packageJson.dependencies['monaco-editor']) {
      success = false;
      issues.push('monaco-editor not found in dependencies');
    }
    
    // Check scripts
    if (!packageJson.scripts || !packageJson.scripts['build:monaco']) {
      success = false;
      issues.push('build:monaco script not found');
    }
    
    if (!packageJson.scripts || !packageJson.scripts['prebuild'] || 
        !packageJson.scripts['prebuild'].includes('build:monaco')) {
      success = false;
      issues.push('prebuild script not configured correctly');
    }
  }
  
  // Check if monaco-editor is installed in node_modules
  const monacoPath = './node_modules/monaco-editor';
  if (!fs.existsSync(monacoPath)) {
    success = false;
    issues.push('monaco-editor not found in node_modules');
  }
  
  // Check if webviewContent.ts references monaco-editor
  const webviewPath = './webviewContent.ts';
  if (!fs.existsSync(webviewPath)) {
    success = false;
    issues.push('webviewContent.ts not found');
  } else {
    const webviewContent = fs.readFileSync(webviewPath, 'utf8');
    if (!webviewContent.includes('monaco-editor')) {
      success = false;
      issues.push('webviewContent.ts does not reference monaco-editor');
    }
  }
  
  // Check if out/vs directory exists (will be created during build)
  const outVsPath = './out/vs';
  if (!fs.existsSync(outVsPath)) {
    console.log('⚠️ Note: out/vs directory not found. This will be created when you run npm run build.');
  }
  
  if (success) {
    console.log('\n✅ Monaco Editor is properly installed and configured!');
    console.log('\n🚀 Next steps:');
    console.log('1. Run npm run build to complete the setup');
    console.log('2. Press F5 in VS Code to test the extension');
  } else {
    console.log('\n❌ Monaco Editor installation issues detected:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    console.log('\n🔄 Please run the installation script again:');
    console.log('   node install-monaco.js');
  }
  
} catch (error) {
  console.error('\n❌ Error verifying Monaco Editor installation:', error.message);
  process.exit(1);
}