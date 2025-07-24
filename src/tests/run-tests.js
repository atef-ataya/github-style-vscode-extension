#!/usr/bin/env node

/**
 * Test Runner for GitHub Style Agent
 * 
 * This script provides a comprehensive test runner with various options
 * for running the test suite in different configurations.
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to colorize console output
function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Helper function to print section headers
function printHeader(text) {
  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize(`  ${text}`, 'bright'));
  console.log(colorize('='.repeat(60), 'cyan') + '\n');
}

// Helper function to print status messages
function printStatus(text, status = 'info') {
  const statusColors = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red'
  };
  
  const prefix = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✗'
  };
  
  console.log(colorize(`${prefix[status]} ${text}`, statusColors[status]));
}

// Configuration
const config = {
  testDir: path.join(__dirname),
  jestConfig: path.join(__dirname, 'jest.config.js'),
  setupFile: path.join(__dirname, 'setup.ts'),
  coverageDir: path.join(__dirname, '../coverage'),
  reportsDir: path.join(__dirname, '../reports')
};

// Test suites configuration
const testSuites = {
  unit: {
    name: 'Unit Tests',
    pattern: '**/*.test.{js,ts}',
    description: 'Run all unit tests'
  },
  core: {
    name: 'Core Tests',
    pattern: 'core/**/*.test.{js,ts}',
    description: 'Run core functionality tests'
  },
  utils: {
    name: 'Utils Tests',
    pattern: 'utils/**/*.test.{js,ts}',
    description: 'Run utility function tests'
  },
  config: {
    name: 'Config Tests',
    pattern: 'config/**/*.test.{js,ts}',
    description: 'Run configuration tests'
  },
  templates: {
    name: 'Templates Tests',
    pattern: 'templates/**/*.test.{js,ts}',
    description: 'Run template generation tests'
  },
  generators: {
    name: 'Generators Tests',
    pattern: 'templates/generators/**/*.test.{js,ts}',
    description: 'Run generator tests'
  }
};

// Command line argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    suite: 'unit',
    watch: false,
    coverage: false,
    verbose: false,
    silent: false,
    updateSnapshots: false,
    bail: false,
    parallel: true,
    maxWorkers: undefined,
    testNamePattern: undefined,
    testPathPattern: undefined,
    help: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--suite':
      case '-s':
        options.suite = args[++i];
        break;
      case '--watch':
      case '-w':
        options.watch = true;
        break;
      case '--coverage':
      case '-c':
        options.coverage = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--silent':
        options.silent = true;
        break;
      case '--updateSnapshots':
      case '-u':
        options.updateSnapshots = true;
        break;
      case '--bail':
      case '-b':
        options.bail = true;
        break;
      case '--no-parallel':
        options.parallel = false;
        break;
      case '--maxWorkers':
        options.maxWorkers = parseInt(args[++i]);
        break;
      case '--testNamePattern':
      case '-t':
        options.testNamePattern = args[++i];
        break;
      case '--testPathPattern':
        options.testPathPattern = args[++i];
        break;
      default:
        if (arg.startsWith('--')) {
          printStatus(`Unknown option: ${arg}`, 'warning');
        } else {
          // Treat as test path pattern
          options.testPathPattern = arg;
        }
    }
  }
  
  return options;
}

// Display help information
function showHelp() {
  printHeader('GitHub Style Agent Test Runner');
  
  console.log(colorize('Usage:', 'bright'));
  console.log('  node run-tests.js [options]\n');
  
  console.log(colorize('Options:', 'bright'));
  console.log('  -h, --help              Show this help message');
  console.log('  -s, --suite <name>      Run specific test suite (default: unit)');
  console.log('  -w, --watch             Run tests in watch mode');
  console.log('  -c, --coverage          Generate coverage report');
  console.log('  -v, --verbose           Verbose output');
  console.log('  --silent                Silent output (errors only)');
  console.log('  -u, --updateSnapshots   Update test snapshots');
  console.log('  -b, --bail              Stop on first test failure');
  console.log('  --no-parallel           Disable parallel test execution');
  console.log('  --maxWorkers <num>      Maximum number of worker processes');
  console.log('  -t, --testNamePattern   Run tests matching name pattern');
  console.log('  --testPathPattern       Run tests matching path pattern\n');
  
  console.log(colorize('Available Test Suites:', 'bright'));
  Object.entries(testSuites).forEach(([key, suite]) => {
    console.log(`  ${colorize(key.padEnd(12), 'cyan')} ${suite.description}`);
  });
  
  console.log('\n' + colorize('Examples:', 'bright'));
  console.log('  node run-tests.js --suite core --coverage');
  console.log('  node run-tests.js --watch --testNamePattern "ErrorHandler"');
  console.log('  node run-tests.js --testPathPattern "generators"');
  console.log('  node run-tests.js --bail --verbose\n');
}

// Validate test environment
function validateEnvironment() {
  printStatus('Validating test environment...', 'info');
  
  // Check if Jest config exists
  if (!fs.existsSync(config.jestConfig)) {
    printStatus(`Jest config not found: ${config.jestConfig}`, 'error');
    return false;
  }
  
  // Check if setup file exists
  if (!fs.existsSync(config.setupFile)) {
    printStatus(`Setup file not found: ${config.setupFile}`, 'error');
    return false;
  }
  
  // Check if test directory exists
  if (!fs.existsSync(config.testDir)) {
    printStatus(`Test directory not found: ${config.testDir}`, 'error');
    return false;
  }
  
  // Create coverage and reports directories if they don't exist
  [config.coverageDir, config.reportsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      printStatus(`Created directory: ${dir}`, 'info');
    }
  });
  
  printStatus('Environment validation passed', 'success');
  return true;
}

// Build Jest command
function buildJestCommand(options) {
  const jestArgs = [
    '--config', config.jestConfig,
    '--rootDir', path.dirname(config.testDir)
  ];
  
  // Test pattern based on suite
  if (testSuites[options.suite]) {
    jestArgs.push('--testPathPatterns', testSuites[options.suite].pattern);
  } else if (options.suite !== 'unit') {
    printStatus(`Unknown test suite: ${options.suite}`, 'warning');
    printStatus('Available suites: ' + Object.keys(testSuites).join(', '), 'info');
  }
  
  // Additional test path pattern
  if (options.testPathPattern) {
    jestArgs.push('--testPathPatterns', options.testPathPattern);
  }
  
  // Test name pattern
  if (options.testNamePattern) {
    jestArgs.push('--testNamePattern', options.testNamePattern);
  }
  
  // Coverage
  if (options.coverage) {
    jestArgs.push('--coverage');
    jestArgs.push('--coverageDirectory', config.coverageDir);
  }
  
  // Watch mode
  if (options.watch) {
    jestArgs.push('--watch');
  }
  
  // Verbose output
  if (options.verbose) {
    jestArgs.push('--verbose');
  }
  
  // Silent output
  if (options.silent) {
    jestArgs.push('--silent');
  }
  
  // Update snapshots
  if (options.updateSnapshots) {
    jestArgs.push('--updateSnapshot');
  }
  
  // Bail on first failure
  if (options.bail) {
    jestArgs.push('--bail');
  }
  
  // Parallel execution
  if (!options.parallel) {
    jestArgs.push('--runInBand');
  }
  
  // Max workers
  if (options.maxWorkers) {
    jestArgs.push('--maxWorkers', options.maxWorkers.toString());
  }
  
  return jestArgs;
}

// Run tests
function runTests(options) {
  const suite = testSuites[options.suite] || { name: 'Custom Tests' };
  
  printHeader(`Running ${suite.name}`);
  
  if (!validateEnvironment()) {
    process.exit(1);
  }
  
  const jestArgs = buildJestCommand(options);
  
  printStatus(`Executing: npx jest ${jestArgs.join(' ')}`, 'info');
  
  try {
    if (options.watch) {
      // For watch mode, use spawn to keep the process interactive
      const jestProcess = spawn('npx', ['jest', ...jestArgs], {
        stdio: 'inherit',
        cwd: path.dirname(config.testDir)
      });
      
      jestProcess.on('exit', (code) => {
        process.exit(code);
      });
    } else {
      // For regular runs, use execSync
      execSync(`npx jest ${jestArgs.join(' ')}`, {
        stdio: 'inherit',
        cwd: path.dirname(config.testDir)
      });
      
      printStatus('Tests completed successfully', 'success');
      
      if (options.coverage) {
        printStatus(`Coverage report generated in: ${config.coverageDir}`, 'info');
      }
    }
  } catch (error) {
    printStatus('Tests failed', 'error');
    process.exit(1);
  }
}

// Display test statistics
function showTestStats() {
  printHeader('Test Suite Statistics');
  
  Object.entries(testSuites).forEach(([key, suite]) => {
    const pattern = path.join(config.testDir, suite.pattern.replace('**/', ''));
    const testFiles = [];
    
    try {
      // Simple file counting (this is a basic implementation)
      const findTestFiles = (dir, pattern) => {
        if (!fs.existsSync(dir)) return [];
        
        const files = [];
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            files.push(...findTestFiles(fullPath, pattern));
          } else if (item.endsWith('.test.js') || item.endsWith('.test.ts')) {
            files.push(fullPath);
          }
        });
        
        return files;
      };
      
      const suiteDir = path.join(config.testDir, key === 'unit' ? '' : key);
      const files = findTestFiles(suiteDir, suite.pattern);
      
      console.log(`${colorize(suite.name.padEnd(20), 'cyan')} ${files.length} test files`);
    } catch (error) {
      console.log(`${colorize(suite.name.padEnd(20), 'cyan')} Unable to count files`);
    }
  });
  
  console.log();
}

// Main function
function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }
  
  // Special command to show test statistics
  if (options.suite === 'stats') {
    showTestStats();
    return;
  }
  
  runTests(options);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  printStatus(`Uncaught exception: ${error.message}`, 'error');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  printStatus(`Unhandled rejection: ${reason}`, 'error');
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main();
}

module.exports = {
  runTests,
  testSuites,
  config
};