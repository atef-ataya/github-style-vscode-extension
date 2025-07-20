// Basic test file

function sum(a, b) {
  return a + b;
}

// Simple test assertion
const result = sum(1, 2);
if (result !== 3) {
  console.error('Test failed: sum(1, 2) should equal 3');
  process.exit(1);
}

console.log('All tests passed!');