#!/usr/bin/env node

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
    console.log('\n✅ Monaco Editor verification successful!');
    
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
    console.log('\n❌ Monaco Editor verification failed!');
    console.log('Run: npm run build:monaco');
    process.exit(1);
  }
}

if (require.main === module) {
  verifyMonacoInstallation();
}

module.exports = { verifyMonacoInstallation };
