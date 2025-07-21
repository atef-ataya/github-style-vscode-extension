#!/usr/bin/env node

/**
 * Setup script for GitHub Style Agent VS Code Extension
 * Helps with initial project configuration and validation
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${description} exists`, 'green');
    return true;
  } else {
    log(`✗ ${description} missing: ${filePath}`, 'red');
    return false;
  }
}

function checkEnvFile() {
  const envPath = '.env';
  const envExamplePath = '.env.example';
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      log('Creating .env file from .env.example...', 'yellow');
      fs.copyFileSync(envExamplePath, envPath);
      log('✓ .env file created. Please update it with your API keys.', 'green');
    } else {
      log('✗ Neither .env nor .env.example found', 'red');
      return false;
    }
  } else {
    log('✓ .env file exists', 'green');
  }
  
  // Check if .env has required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['GITHUB_TOKEN', 'GITHUB_USERNAME', 'OPENAI_API_KEY'];
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(varName + '=') || envContent.includes(varName + '=your_')) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    log(`⚠ Please configure these environment variables in .env:`, 'yellow');
    missingVars.forEach(varName => {
      log(`  - ${varName}`, 'yellow');
    });
    return false;
  }
  
  return true;
}

function checkDirectoryStructure() {
  const requiredDirs = [
    'src',
    'src/analyzers',
    'src/generators',
    'src/types',
    'src/utils',
    'out'
  ];
  
  let allExist = true;
  
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      log(`Creating directory: ${dir}`, 'yellow');
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  return allExist;
}

function validatePackageJson() {
  if (!fs.existsSync('package.json')) {
    log('✗ package.json not found', 'red');
    return false;
  }
  
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredScripts = ['build', 'compile', 'lint', 'test', 'type-check'];
    const missingScripts = [];
    
    for (const script of requiredScripts) {
      if (!pkg.scripts || !pkg.scripts[script]) {
        missingScripts.push(script);
      }
    }
    
    if (missingScripts.length > 0) {
      log(`⚠ Missing package.json scripts:`, 'yellow');
      missingScripts.forEach(script => {
        log(`  - ${script}`, 'yellow');
      });
      return false;
    }
    
    log('✓ package.json scripts are configured correctly', 'green');
    return true;
  } catch (error) {
    log('✗ Error reading package.json: ' + error.message, 'red');
    return false;
  }
}

function runSetup() {
  log(colors.bold + '🚀 GitHub Style Agent Setup' + colors.reset);
  log('=====================================\n');
  
  let setupOk = true;
  
  // Check essential files
  log('📁 Checking project structure...', 'blue');
  setupOk &= checkFileExists('package.json', 'Package configuration');
  setupOk &= checkFileExists('tsconfig.json', 'TypeScript configuration');
  setupOk &= checkFileExists('.eslintrc.json', 'ESLint configuration');
  setupOk &= checkFileExists('extension.ts', 'Extension entry point');
  setupOk &= checkFileExists('CodeStyleEngine.ts', 'Core engine');
  
  // Check directory structure
  log('\n📂 Checking directory structure...', 'blue');
  checkDirectoryStructure();
  
  // Validate package.json
  log('\n📦 Validating package.json...', 'blue');
  setupOk &= validatePackageJson();
  
  // Check environment configuration
  log('\n🔧 Checking environment configuration...', 'blue');
  const envOk = checkEnvFile();
  
  log('\n' + '='.repeat(40));
  
  if (setupOk && envOk) {
    log('🎉 Setup complete! All checks passed.', 'green');
    log('\nNext steps:', 'blue');
    log('1. Run: npm install', 'yellow');
    log('2. Run: npm run build', 'yellow');
    log('3. Press F5 in VS Code to test the extension', 'yellow');
  } else if (setupOk && !envOk) {
    log('⚠ Setup mostly complete, but environment needs configuration.', 'yellow');
    log('\nPlease update your .env file with valid API keys, then run:', 'blue');
    log('1. npm install', 'yellow');
    log('2. npm run build', 'yellow');
  } else {
    log('❌ Setup incomplete. Please fix the issues above.', 'red');
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  runSetup();
}