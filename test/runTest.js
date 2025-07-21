/**
 * Test Runner for Monaco Editor Tests
 */

const path = require('path');
const { runTests } = require('./monaco-test');

async function main() {
  try {
    // Run the tests
    const success = await runTests();
    
    // Exit with appropriate code
    process.exit(success ? 0 : 1);
  } catch (err) {
    console.error('Failed to run tests:', err);
    process.exit(1);
  }
}

main();