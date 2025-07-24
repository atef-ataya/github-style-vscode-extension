# GitHub Style Agent Test Suite

This directory contains the comprehensive test suite for the GitHub Style Agent VS Code extension. The test suite is built using Jest and provides extensive coverage for all core functionality.

## 📁 Directory Structure

```
src/tests/
├── README.md                           # This file
├── jest.config.js                      # Jest configuration
├── setup.ts                           # Test environment setup
├── run-tests.js                       # Test runner script
├── core/                              # Core functionality tests
│   ├── CodeStyleEngine.test.ts        # Code style analysis tests
│   ├── ProgressManager.test.ts        # Progress management tests
│   └── ProgressTracker.test.ts        # Progress tracking tests
├── utils/                             # Utility function tests
│   └── ErrorHandler.test.ts           # Error handling tests
├── config/                            # Configuration tests
│   └── Configuration.test.ts          # Configuration management tests
└── templates/                         # Template generation tests
    ├── ProjectTemplates.test.ts       # Template management tests
    └── generators/                    # Generator-specific tests
        ├── BaseGenerator.test.ts      # Base generator tests
        ├── ReactGenerator.test.ts     # React generator tests
        ├── ExpressGenerator.test.ts   # Express generator tests
        └── CustomGenerator.test.ts    # Custom generator tests
```

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- Jest (installed as dev dependency)

### Running Tests

#### Using the Test Runner Script

```bash
# Run all tests
node src/tests/run-tests.js

# Run specific test suite
node src/tests/run-tests.js --suite core

# Run tests with coverage
node src/tests/run-tests.js --coverage

# Run tests in watch mode
node src/tests/run-tests.js --watch

# Run specific test pattern
node src/tests/run-tests.js --testNamePattern "ErrorHandler"
```

#### Using Jest Directly

```bash
# Run all tests
npx jest --config src/tests/jest.config.js

# Run with coverage
npx jest --config src/tests/jest.config.js --coverage

# Run specific test file
npx jest --config src/tests/jest.config.js core/ProgressManager.test.ts
```

## 📋 Test Suites

### Available Test Suites

| Suite | Description | Pattern |
|-------|-------------|----------|
| `unit` | All unit tests (default) | `**/*.test.{js,ts}` |
| `core` | Core functionality tests | `core/**/*.test.{js,ts}` |
| `utils` | Utility function tests | `utils/**/*.test.{js,ts}` |
| `config` | Configuration tests | `config/**/*.test.{js,ts}` |
| `templates` | Template generation tests | `templates/**/*.test.{js,ts}` |
| `generators` | Generator-specific tests | `templates/generators/**/*.test.{js,ts}` |

### Test Suite Examples

```bash
# Run core functionality tests
node src/tests/run-tests.js --suite core

# Run template generation tests
node src/tests/run-tests.js --suite templates

# Run generator tests with coverage
node src/tests/run-tests.js --suite generators --coverage
```

## 🛠️ Test Runner Options

### Command Line Options

| Option | Short | Description |
|--------|-------|-------------|
| `--help` | `-h` | Show help message |
| `--suite <name>` | `-s` | Run specific test suite |
| `--watch` | `-w` | Run tests in watch mode |
| `--coverage` | `-c` | Generate coverage report |
| `--verbose` | `-v` | Verbose output |
| `--silent` | | Silent output (errors only) |
| `--updateSnapshots` | `-u` | Update test snapshots |
| `--bail` | `-b` | Stop on first test failure |
| `--no-parallel` | | Disable parallel test execution |
| `--maxWorkers <num>` | | Maximum number of worker processes |
| `--testNamePattern <pattern>` | `-t` | Run tests matching name pattern |
| `--testPathPattern <pattern>` | | Run tests matching path pattern |

### Usage Examples

```bash
# Run tests with detailed output
node src/tests/run-tests.js --verbose

# Run tests and stop on first failure
node src/tests/run-tests.js --bail

# Run tests matching specific pattern
node src/tests/run-tests.js --testNamePattern "should generate"

# Run tests for specific file pattern
node src/tests/run-tests.js --testPathPattern "Generator"

# Run tests with limited workers
node src/tests/run-tests.js --maxWorkers 2
```

## 📊 Coverage Reports

Coverage reports are generated in the `src/coverage/` directory when using the `--coverage` flag.

### Coverage Thresholds

The test suite maintains the following coverage thresholds:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Viewing Coverage Reports

```bash
# Generate coverage report
node src/tests/run-tests.js --coverage

# Open HTML coverage report
open src/coverage/lcov-report/index.html
```

## 🧪 Test Categories

### Unit Tests

Test individual functions and methods in isolation:
- **ErrorHandler**: Error handling and logging
- **Configuration**: Settings management
- **ProgressTracker**: Progress tracking functionality
- **ProgressManager**: Progress management coordination

### Integration Tests

Test component interactions:
- **CodeStyleEngine**: File analysis and style detection
- **ProjectTemplates**: Template management and generation
- **Generators**: Project generation workflows

### Mock Strategy

The test suite uses comprehensive mocking:
- **VS Code API**: Mocked for extension testing
- **File System**: Mocked for safe testing
- **Network Requests**: Mocked for reliability
- **External Dependencies**: Mocked for isolation

## 📝 Writing Tests

### Test File Structure

```typescript
import { YourClass } from '../../path/to/YourClass';

describe('YourClass', () => {
  let instance: YourClass;

  beforeEach(() => {
    instance = new YourClass();
    // Setup mocks
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should do something', () => {
      // Test implementation
      expect(result).toBe(expected);
    });

    it('should handle error cases', () => {
      // Error case testing
      expect(() => instance.method()).toThrow();
    });
  });
});
```

### Best Practices

1. **Descriptive Test Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Follow the AAA pattern
3. **Mock External Dependencies**: Isolate units under test
4. **Test Edge Cases**: Include error conditions and edge cases
5. **Clean Setup/Teardown**: Use `beforeEach`/`afterEach` for clean state

### Example Test

```typescript
describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  describe('createError', () => {
    it('should create error with correct properties', () => {
      const error = errorHandler.createError(
        'TEST_ERROR',
        'Test message',
        ErrorSeverity.HIGH
      );

      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.timestamp).toBeInstanceOf(Date);
    });
  });
});
```

## 🔧 Configuration

### Jest Configuration

The Jest configuration is located in `jest.config.js` and includes:
- TypeScript support
- Module name mapping
- Coverage settings
- Test environment setup

### Environment Setup

The `setup.ts` file configures:
- VS Code API mocks
- Global test utilities
- Environment variables
- Mock implementations

## 🐛 Debugging Tests

### Running Individual Tests

```bash
# Run specific test file
npx jest core/ProgressManager.test.ts

# Run specific test case
npx jest --testNamePattern "should create progress tracker"

# Run with debugging output
npx jest --verbose --no-cache
```

### VS Code Debugging

1. Open VS Code
2. Set breakpoints in test files
3. Use "Debug Jest Tests" configuration
4. Run debugger

### Common Issues

1. **Mock Issues**: Ensure mocks are properly reset between tests
2. **Async Tests**: Use `async/await` or return promises
3. **File Path Issues**: Use absolute paths in test configurations
4. **Memory Leaks**: Clean up resources in `afterEach`

## 📈 Performance Testing

### Test Performance

```bash
# Run tests with timing information
node src/tests/run-tests.js --verbose

# Run tests without parallel execution for debugging
node src/tests/run-tests.js --no-parallel

# Limit worker processes
node src/tests/run-tests.js --maxWorkers 1
```

### Benchmarking

For performance-critical components, consider:
- Timing assertions
- Memory usage monitoring
- Load testing scenarios

## 🚀 Continuous Integration

### CI Configuration

```yaml
# Example GitHub Actions configuration
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: node src/tests/run-tests.js --coverage
      - run: node src/tests/run-tests.js --suite core
```

### Pre-commit Hooks

```bash
# Run tests before commit
npm run test:pre-commit

# Run specific test suite
npm run test:core
```

## 📚 Additional Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [TypeScript Testing](https://typescript-eslint.io/docs/linting/troubleshooting#testing)

### Tools
- [Jest Runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner) - VS Code extension
- [Coverage Gutters](https://marketplace.visualstudio.com/items?itemName=ryanluker.vscode-coverage-gutters) - Coverage visualization

## 🤝 Contributing

When adding new tests:
1. Follow the existing directory structure
2. Use descriptive test names
3. Include both positive and negative test cases
4. Update this README if adding new test suites
5. Ensure tests pass in CI environment

## 📄 License

This test suite is part of the GitHub Style Agent project and follows the same license terms.