#!/usr/bin/env node

/**
 * Install Monaco Editor and update package.json
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('📦 Installing Monaco Editor for enhanced UI...\n');

try {
  // Install Monaco Editor
  console.log('Installing monaco-editor...');
  execSync('npm install monaco-editor', { stdio: 'inherit' });

  // Update package.json scripts
  console.log('Updating package.json scripts...');

  const packagePath = './package.json';
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Add enhanced scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'build:monaco':
      'copy /node_modules/monaco-editor/min/vs/loader.js ./out/vs/',
    prebuild: 'npm run clean && npm run build:monaco',
    'dev:enhanced': 'npm run build && code --extensionDevelopmentPath=.',
  };

  // Add new dependencies for enhanced features
  packageJson.dependencies = {
    ...packageJson.dependencies,
    'monaco-editor': '^latest',
  };

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  console.log('\n✅ Monaco Editor installed successfully!');
  console.log('\n🎨 Enhanced UI Features Added:');
  console.log('   • Monaco Editor (VS Code-like editing)');
  console.log('   • Multi-file tab interface');
  console.log('   • Syntax highlighting for all languages');
  console.log('   • Project scaffolding and file management');
  console.log('   • Professional download/export options');

  console.log('\n🚀 Next Steps:');
  console.log('1. npm run build         # Build with Monaco Editor');
  console.log('2. Press F5 in VS Code   # Test the enhanced UI');
  console.log('3. Try generating a project template!');
} catch (error) {
  console.error('\n❌ Error installing Monaco Editor:', error.message);
  console.log('\n🔄 Try manual installation:');
  console.log('npm install monaco-editor');
  process.exit(1);
}
