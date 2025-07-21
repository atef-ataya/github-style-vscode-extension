#!/usr/bin/env node

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
