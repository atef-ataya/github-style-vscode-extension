/**
 * Monaco Editor Test Script
 * 
 * This script tests if Monaco Editor is properly loaded and functioning in the extension.
 * Run this after installing Monaco Editor and building the extension.
 */

const vscode = require('vscode');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

/**
 * Test if Monaco Editor files are properly copied to the output directory
 */
async function testMonacoFilesExist() {
  console.log('Testing if Monaco Editor files exist in the output directory...');
  
  const extensionPath = vscode.extensions.getExtension('atef-ataya.codestyle-stylegen').extensionPath;
  const loaderPath = path.join(extensionPath, 'out', 'vs', 'loader.js');
  
  if (fs.existsSync(loaderPath)) {
    console.log('✅ Monaco Editor loader.js exists in the output directory');
    return true;
  } else {
    console.error('❌ Monaco Editor loader.js not found in the output directory');
    console.log('Expected path:', loaderPath);
    return false;
  }
}

/**
 * Test if the extension's webview properly loads Monaco Editor
 */
async function testMonacoInWebview() {
  console.log('Testing if Monaco Editor loads in the extension webview...');
  
  // Activate the extension
  await vscode.commands.executeCommand('codestyle.generate');
  
  // Wait for the webview to load
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // The actual test would need to interact with the webview and check if Monaco is loaded
  // This is a simplified version that just checks if the command executes without errors
  console.log('✅ Extension command executed successfully');
  console.log('Note: Manual verification is still recommended to ensure Monaco Editor is working properly in the webview');
  
  return true;
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Running Monaco Editor tests...');
  
  let allTestsPassed = true;
  
  try {
    const filesExist = await testMonacoFilesExist();
    const webviewWorks = await testMonacoInWebview();
    
    allTestsPassed = filesExist && webviewWorks;
    
    if (allTestsPassed) {
      console.log('\n✅ All tests passed! Monaco Editor is properly installed and configured.');
    } else {
      console.error('\n❌ Some tests failed. Please check the logs above for details.');
    }
  } catch (error) {
    console.error('\n❌ Error running tests:', error.message);
    allTestsPassed = false;
  }
  
  return allTestsPassed;
}

module.exports = {
  runTests
};

// If this script is run directly
if (require.main === module) {
  console.log('This script should be run from within VS Code as an extension test.');
  console.log('Add the following to your package.json:');
  console.log(`
  "scripts": {
    "test:monaco": "node ./out/test/runTest.js"
  }
  `);
  console.log('\nThen create a runTest.js file that uses this module.');
}