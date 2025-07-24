import { BaseGenerator, GenerationConfig, GenerationResult } from './BaseGenerator';
import { ProjectFile } from '../../utils/FileUtils';

/**
 * Generator for custom projects
 * Creates a flexible project structure based on user specifications
 */
export class CustomGenerator extends BaseGenerator {
  constructor(config: GenerationConfig) {
    super(config);
  }

  async generate(): Promise<GenerationResult> {
    try {
      const errors = this.validateConfig();
      if (errors.length > 0) {
        return {
          success: false,
          files: [],
          errors
        }; 
      }

      const files: ProjectFile[] = [
        {
          path: 'package.json',
          content: this.createPackageJson()
        },
        {
          path: 'README.md',
          content: this.createReadme()
        },
        {
          path: '.gitignore',
          content: this.createGitignore()
        },
        {
          path: 'src/index.js',
          content: this.applyStyleProfile(this.createMainFile())
        },
        {
          path: 'src/utils/helpers.js',
          content: this.applyStyleProfile(this.createHelpers())
        },
        {
          path: 'src/config/index.js',
          content: this.applyStyleProfile(this.createConfig())
        },
        {
          path: 'tests/index.test.js',
          content: this.applyStyleProfile(this.createTests())
        },
        {
          path: '.env.example',
          content: this.createEnvExample()
        },
        {
          path: 'docs/SETUP.md',
          content: this.createSetupGuide()
        }
      ];

      // Add additional files based on configuration
      if (this.config.features?.includes('typescript')) {
        files.push(
          {
            path: 'tsconfig.json',
            content: this.createTsConfig()
          },
          {
            path: 'src/types/index.ts',
            content: this.applyStyleProfile(this.createTypes())
          }
        );
      }

      if (this.config.features?.includes('eslint')) {
        files.push({
          path: '.eslintrc.js',
          content: this.createEslintConfig()
        });
      }

      if (this.config.features?.includes('prettier')) {
        files.push({
          path: '.prettierrc',
          content: this.createPrettierConfig()
        });
      }

      if (this.config.features?.includes('docker')) {
        files.push(
          {
            path: 'Dockerfile',
            content: this.createDockerfile()
          },
          {
            path: '.dockerignore',
            content: this.createDockerignore()
          }
        );
      }

      return {
        success: true,
        files,
        message: 'Custom project generated successfully'
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        errors: [`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  getFileList(): string[] {
    const baseFiles = [
      'package.json',
      'README.md',
      '.gitignore',
      'src/index.js',
      'src/utils/helpers.js',
      'src/config/index.js',
      'tests/index.test.js',
      '.env.example',
      'docs/SETUP.md'
    ];

    const conditionalFiles: string[] = [];

    if (this.config.features?.includes('typescript')) {
      conditionalFiles.push('tsconfig.json', 'src/types/index.ts');
    }

    if (this.config.features?.includes('eslint')) {
      conditionalFiles.push('.eslintrc.js');
    }

    if (this.config.features?.includes('prettier')) {
      conditionalFiles.push('.prettierrc');
    }

    if (this.config.features?.includes('docker')) {
      conditionalFiles.push('Dockerfile', '.dockerignore');
    }

    return [...baseFiles, ...conditionalFiles];
  }

  getDependencies(): { dependencies: string[]; devDependencies: string[] } {
    const baseDependencies: string[] = [];
    const baseDevDependencies = ['jest', 'nodemon'];

    // Add dependencies based on features
    if (this.config.features?.includes('typescript')) {
      baseDevDependencies.push('typescript', '@types/node', 'ts-node');
    }

    if (this.config.features?.includes('eslint')) {
      baseDevDependencies.push('eslint');
      if (this.config.features?.includes('typescript')) {
        baseDevDependencies.push('@typescript-eslint/eslint-plugin', '@typescript-eslint/parser');
      }
    }

    if (this.config.features?.includes('prettier')) {
      baseDevDependencies.push('prettier');
      if (this.config.features?.includes('eslint')) {
        baseDevDependencies.push('eslint-config-prettier', 'eslint-plugin-prettier');
      }
    }

    // Add custom dependencies from config
    if (this.config.dependencies) {
      baseDependencies.push(...this.config.dependencies);
    }

    if (this.config.devDependencies) {
      baseDevDependencies.push(...this.config.devDependencies);
    }

    return {
      dependencies: baseDependencies,
      devDependencies: baseDevDependencies
    };
  }

  protected getScripts(): Record<string, string> {
    const baseScripts: Record<string, string> = {
      start: 'node src/index.js',
      dev: 'nodemon src/index.js',
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:coverage': 'jest --coverage'
    };

    if (this.config.features?.includes('typescript')) {
      baseScripts.start = 'node dist/index.js';
      baseScripts.dev = 'ts-node src/index.ts';
      baseScripts.build = 'tsc';
      baseScripts['build:watch'] = 'tsc --watch';
    }

    if (this.config.features?.includes('eslint')) {
      baseScripts.lint = 'eslint src/**/*.{js,ts}';
      baseScripts['lint:fix'] = 'eslint src/**/*.{js,ts} --fix';
    }

    if (this.config.features?.includes('prettier')) {
      baseScripts.format = 'prettier --write src/**/*.{js,ts,json,md}';
      baseScripts['format:check'] = 'prettier --check src/**/*.{js,ts,json,md}';
    }

    if (this.config.features?.includes('docker')) {
      baseScripts['docker:build'] = 'docker build -t ' + (this.config.projectName || 'custom-app') + ' .';
      baseScripts['docker:run'] = 'docker run -p 3000:3000 ' + (this.config.projectName || 'custom-app');
    }

    return baseScripts;
  }

  private createMainFile(): string {
    const isTypeScript = this.config.features?.includes('typescript');
    const extension = isTypeScript ? 'ts' : 'js';
    
    return this.processTemplate(`${isTypeScript ? "import { config } from './config/index';\nimport { logger } from './utils/helpers';" : "const { config } = require('./config');\nconst { logger } = require('./utils/helpers');"}

/**
 * {{ projectName }} - Main Entry Point
 * {{ description }}
 */

class Application {
  constructor() {
    this.name = '{{ projectName }}';
    this.version = '1.0.0';
  }

  async start() {
    try {
      logger.info(\`Starting \${this.name} v\${this.version}\`);
      logger.info('Configuration loaded:', config);
      
      // Initialize your application logic here
      await this.initialize();
      
      logger.info('Application started successfully');
    } catch (error) {
      logger.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  async initialize() {
    // Add your initialization logic here
    logger.info('Initializing application components...');
    
    // Example: Setup database connection, load plugins, etc.
    await this.setupComponents();
    
    logger.info('Application components initialized');
  }

  async setupComponents() {
    // Setup your application components
    // This is where you would initialize:
    // - Database connections
    // - External service clients
    // - Background jobs
    // - Event listeners
    // etc.
    
    return Promise.resolve();
  }

  async shutdown() {
    logger.info('Shutting down application...');
    // Cleanup logic here
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  const app = new Application();
  await app.shutdown();
});

process.on('SIGTERM', async () => {
  const app = new Application();
  await app.shutdown();
});

// Start the application
if (require.main === module) {
  const app = new Application();
  app.start();
}

${isTypeScript ? 'export default Application;' : 'module.exports = Application;'}
`);
  }

  private createHelpers(): string {
    const isTypeScript = this.config.features?.includes('typescript');
    
    return this.processTemplate(`${isTypeScript ? '// TypeScript utility functions and helpers' : '// JavaScript utility functions and helpers'}

/**
 * Logger utility for consistent logging across the application
 */
${isTypeScript ? 'export ' : ''}class Logger {
  ${isTypeScript ? 'private ' : ''}prefix${isTypeScript ? ': string' : ''};

  constructor(prefix${isTypeScript ? ': string' : ''} = '{{ projectName }}') {
    this.prefix = prefix;
  }

  info(message${isTypeScript ? ': string' : ''}, ...args${isTypeScript ? ': any[]' : ''}) {
    console.log(\`[\${this.prefix}] INFO: \${message}\`, ...args);
  }

  warn(message${isTypeScript ? ': string' : ''}, ...args${isTypeScript ? ': any[]' : ''}) {
    console.warn(\`[\${this.prefix}] WARN: \${message}\`, ...args);
  }

  error(message${isTypeScript ? ': string' : ''}, ...args${isTypeScript ? ': any[]' : ''}) {
    console.error(\`[\${this.prefix}] ERROR: \${message}\`, ...args);
  }

  debug(message${isTypeScript ? ': string' : ''}, ...args${isTypeScript ? ': any[]' : ''}) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(\`[\${this.prefix}] DEBUG: \${message}\`, ...args);
    }
  }
}

/**
 * Utility functions for common operations
 */
${isTypeScript ? 'export ' : ''}const utils = {
  /**
   * Sleep for a specified number of milliseconds
   */
  sleep(ms${isTypeScript ? ': number' : ''})${isTypeScript ? ': Promise<void>' : ''} {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Generate a random string of specified length
   */
  randomString(length${isTypeScript ? ': number' : ''} = 10)${isTypeScript ? ': string' : ''} {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Deep clone an object
   */
  deepClone(obj${isTypeScript ? ': any' : ''})${isTypeScript ? ': any' : ''} {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  },

  /**
   * Format bytes to human readable string
   */
  formatBytes(bytes${isTypeScript ? ': number' : ''}, decimals${isTypeScript ? ': number' : ''} = 2)${isTypeScript ? ': string' : ''} {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  /**
   * Validate email format
   */
  isValidEmail(email${isTypeScript ? ': string' : ''})${isTypeScript ? ': boolean' : ''} {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Capitalize first letter of a string
   */
  capitalize(str${isTypeScript ? ': string' : ''})${isTypeScript ? ': string' : ''} {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};

// Create logger instance
${isTypeScript ? 'export ' : ''}const logger = new Logger();

${isTypeScript ? '' : `
// CommonJS exports
module.exports = {
  Logger,
  logger,
  utils
};
`}
`);
  }

  private createConfig(): string {
    const isTypeScript = this.config.features?.includes('typescript');
    
    return this.processTemplate(`${isTypeScript ? '// Configuration management for {{ projectName }}' : '// Configuration management for {{ projectName }}'}

${isTypeScript ? 'interface Config {\n  app: {\n    name: string;\n    version: string;\n    port: number;\n    environment: string;\n  };\n  database?: {\n    url: string;\n    options: Record<string, any>;\n  };\n  api?: {\n    baseUrl: string;\n    timeout: number;\n  };\n  logging: {\n    level: string;\n    format: string;\n  };\n}\n\n' : ''}
/**
 * Application configuration
 * Loads configuration from environment variables with fallback defaults
 */
${isTypeScript ? 'export ' : ''}const config${isTypeScript ? ': Config' : ''} = {
  app: {
    name: process.env.APP_NAME || '{{ projectName }}',
    version: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Database configuration (if needed)
  database: {
    url: process.env.DATABASE_URL || 'sqlite://./data.db',
    options: {
      logging: process.env.NODE_ENV === 'development',
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '5', 10),
        min: parseInt(process.env.DB_POOL_MIN || '0', 10),
        idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
      }
    }
  },
  
  // API configuration (if needed)
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.API_TIMEOUT || '5000', 10)
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  }
};

/**
 * Validate configuration
 */
${isTypeScript ? 'export ' : ''}function validateConfig()${isTypeScript ? ': void' : ''} {
  const required = ['app.name', 'app.port'];
  
  for (const key of required) {
    const value = key.split('.').reduce((obj, k) => obj && obj[k], config);
    if (!value) {
      throw new Error(\`Missing required configuration: \${key}\`);
    }
  }
  
  // Validate port range
  if (config.app.port < 1 || config.app.port > 65535) {
    throw new Error('Port must be between 1 and 65535');
  }
}

// Validate configuration on load
validateConfig();

${isTypeScript ? '' : `
// CommonJS exports
module.exports = {
  config,
  validateConfig
};
`}
`);
  }

  private createTests(): string {
    const isTypeScript = this.config.features?.includes('typescript');
    
    return this.processTemplate(`${isTypeScript ? "import Application from '../src/index';\nimport { logger, utils } from '../src/utils/helpers';\nimport { config } from '../src/config';" : "const Application = require('../src/index');\nconst { logger, utils } = require('../src/utils/helpers');\nconst { config } = require('../src/config');"}

describe('{{ projectName }}', () => {
  describe('Application', () => {
    let app${isTypeScript ? ': Application' : ''};

    beforeEach(() => {
      app = new Application();
    });

    test('should create application instance', () => {
      expect(app).toBeInstanceOf(Application);
      expect(app.name).toBe('{{ projectName }}');
      expect(app.version).toBe('1.0.0');
    });

    test('should initialize successfully', async () => {
      await expect(app.initialize()).resolves.not.toThrow();
    });
  });

  describe('Logger', () => {
    test('should log messages with correct format', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      logger.info('Test message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[{{ projectName }}] INFO: Test message')
      );
      
      consoleSpy.mockRestore();
    });

    test('should log errors with correct format', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      logger.error('Test error');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[{{ projectName }}] ERROR: Test error')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Utils', () => {
    test('should generate random string of correct length', () => {
      const randomStr = utils.randomString(10);
      expect(randomStr).toHaveLength(10);
      expect(typeof randomStr).toBe('string');
    });

    test('should validate email correctly', () => {
      expect(utils.isValidEmail('test@example.com')).toBe(true);
      expect(utils.isValidEmail('invalid-email')).toBe(false);
      expect(utils.isValidEmail('test@')).toBe(false);
      expect(utils.isValidEmail('@example.com')).toBe(false);
    });

    test('should capitalize string correctly', () => {
      expect(utils.capitalize('hello')).toBe('Hello');
      expect(utils.capitalize('WORLD')).toBe('WORLD');
      expect(utils.capitalize('')).toBe('');
    });

    test('should format bytes correctly', () => {
      expect(utils.formatBytes(0)).toBe('0 Bytes');
      expect(utils.formatBytes(1024)).toBe('1 KB');
      expect(utils.formatBytes(1048576)).toBe('1 MB');
      expect(utils.formatBytes(1073741824)).toBe('1 GB');
    });

    test('should deep clone objects', () => {
      const original = {
        name: 'test',
        nested: {
          value: 42,
          array: [1, 2, 3]
        }
      };
      
      const cloned = utils.deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.nested).not.toBe(original.nested);
      expect(cloned.nested.array).not.toBe(original.nested.array);
    });

    test('should handle sleep function', async () => {
      const start = Date.now();
      await utils.sleep(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some tolerance
    });
  });

  describe('Configuration', () => {
    test('should load default configuration', () => {
      expect(config.app.name).toBe('{{ projectName }}');
      expect(config.app.version).toBe('1.0.0');
      expect(typeof config.app.port).toBe('number');
      expect(config.app.environment).toBeDefined();
    });

    test('should have valid port number', () => {
      expect(config.app.port).toBeGreaterThan(0);
      expect(config.app.port).toBeLessThanOrEqual(65535);
    });

    test('should have logging configuration', () => {
      expect(config.logging.level).toBeDefined();
      expect(config.logging.format).toBeDefined();
    });
  });
});
`);
  }

  private createEnvExample(): string {
    return this.processTemplate(`# {{ projectName }} Environment Variables

# Application Configuration
APP_NAME={{ projectName }}
APP_VERSION=1.0.0
PORT=3000
NODE_ENV=development

# Database Configuration (if using database)
DATABASE_URL=sqlite://./data.db
DB_POOL_MAX=5
DB_POOL_MIN=0
DB_POOL_IDLE=10000

# API Configuration (if using external APIs)
API_BASE_URL=http://localhost:3000
API_TIMEOUT=5000

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=combined

# Security (add as needed)
# JWT_SECRET=your-jwt-secret-here
# ENCRYPTION_KEY=your-encryption-key-here

# External Services (add as needed)
# REDIS_URL=redis://localhost:6379
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your-email@example.com
# SMTP_PASS=your-email-password

# Feature Flags (optional)
# ENABLE_ANALYTICS=true
# ENABLE_DEBUG=false
# ENABLE_CACHE=true
`);
  }

  private createSetupGuide(): string {
    return this.processTemplate(`# {{ projectName }} Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
${this.config.features?.includes('docker') ? '- Docker (optional)' : ''}

## Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone <repository-url>
   cd {{ projectName }}
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Setup environment:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edit the \`.env\` file with your specific configuration.

4. **Run the application:**
   \`\`\`bash
   npm run dev
   \`\`\`

## Development

### Available Scripts

- \`npm start\` - Start the application in production mode
- \`npm run dev\` - Start the application in development mode with auto-reload
- \`npm test\` - Run tests
- \`npm run test:watch\` - Run tests in watch mode
- \`npm run test:coverage\` - Run tests with coverage report
${this.config.features?.includes('typescript') ? '- \`npm run build\` - Build TypeScript to JavaScript\n- \`npm run build:watch\` - Build TypeScript in watch mode' : ''}
${this.config.features?.includes('eslint') ? '- \`npm run lint\` - Run ESLint\n- \`npm run lint:fix\` - Run ESLint with auto-fix' : ''}
${this.config.features?.includes('prettier') ? '- \`npm run format\` - Format code with Prettier\n- \`npm run format:check\` - Check code formatting' : ''}

### Project Structure

\`\`\`
{{ projectName }}/
├── src/
│   ├── index.${this.config.features?.includes('typescript') ? 'ts' : 'js'}           # Main application entry point
│   ├── config/
│   │   └── index.${this.config.features?.includes('typescript') ? 'ts' : 'js'}      # Configuration management
│   ├── utils/
│   │   └── helpers.${this.config.features?.includes('typescript') ? 'ts' : 'js'}   # Utility functions
${this.config.features?.includes('typescript') ? '│   └── types/\n│       └── index.ts      # TypeScript type definitions' : ''}
├── tests/
│   └── index.test.${this.config.features?.includes('typescript') ? 'ts' : 'js'}   # Test files
├── docs/
│   └── SETUP.md          # This file
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Project dependencies and scripts
├── README.md           # Project documentation
${this.config.features?.includes('typescript') ? '├── tsconfig.json       # TypeScript configuration' : ''}
${this.config.features?.includes('eslint') ? '├── .eslintrc.js        # ESLint configuration' : ''}
${this.config.features?.includes('prettier') ? '├── .prettierrc         # Prettier configuration' : ''}
${this.config.features?.includes('docker') ? '├── Dockerfile          # Docker container configuration\n└── .dockerignore       # Docker ignore rules' : ''}
\`\`\`

### Configuration

The application uses environment variables for configuration. See \`.env.example\` for all available options.

#### Required Variables

- \`APP_NAME\` - Application name
- \`PORT\` - Port number for the application

#### Optional Variables

- \`NODE_ENV\` - Environment (development, production, test)
- \`LOG_LEVEL\` - Logging level (debug, info, warn, error)
- \`DATABASE_URL\` - Database connection string (if using database)

### Testing

This project uses Jest for testing. Test files should be placed in the \`tests/\` directory.

#### Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`

#### Writing Tests

- Place test files in the \`tests/\` directory
- Use the naming convention \`*.test.${this.config.features?.includes('typescript') ? 'ts' : 'js'}\`
- Follow the existing test patterns for consistency

${this.config.features?.includes('docker') ? '### Docker\n\nThis project includes Docker support for containerized deployment.\n\n#### Building the Docker Image\n\n\`\`\`bash\nnpm run docker:build\n\`\`\`\n\n#### Running with Docker\n\n\`\`\`bash\nnpm run docker:run\n\`\`\`\n\n#### Docker Compose (if needed)\n\nCreate a \`docker-compose.yml\` file for multi-service setups:\n\n\`\`\`yaml\nversion: \'3.8\'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n    volumes:\n      - ./data:/app/data\n\`\`\`\n\n' : ''}### Deployment

#### Production Build

${this.config.features?.includes('typescript') ? '1. Build the TypeScript code:\n   \`\`\`bash\n   npm run build\n   \`\`\`\n\n2. Start the application:\n   \`\`\`bash\n   npm start\n   \`\`\`' : 'Start the application:\n\`\`\`bash\nnpm start\n\`\`\`'}

#### Environment Variables

Make sure to set all required environment variables in your production environment.

#### Process Management

Consider using a process manager like PM2 for production deployments:

\`\`\`bash
npm install -g pm2
pm2 start ${this.config.features?.includes('typescript') ? 'dist/index.js' : 'src/index.js'} --name "{{ projectName }}"
\`\`\`

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the \`PORT\` environment variable
   - Kill the process using the port: \`lsof -ti:3000 | xargs kill\`

2. **Module not found errors**
   - Run \`npm install\` to ensure all dependencies are installed
   - Clear npm cache: \`npm cache clean --force\`

${this.config.features?.includes('typescript') ? '3. **TypeScript compilation errors**\n   - Check \`tsconfig.json\` configuration\n   - Ensure all type definitions are installed\n   - Run \`npm run build\` to see detailed error messages\n\n' : ''}3. **Test failures**
   - Ensure test environment is properly configured
   - Check for conflicting global installations
   - Run tests in isolation: \`npm test -- --runInBand\`

### Getting Help

- Check the project README.md for additional information
- Review the test files for usage examples
- Check the issue tracker for known problems

## Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/new-feature\`
3. Make your changes and add tests
4. Run the test suite: \`npm test\`
${this.config.features?.includes('eslint') ? '5. Run linting: \`npm run lint\`' : ''}
${this.config.features?.includes('prettier') ? '6. Format code: \`npm run format\`' : ''}
7. Commit your changes: \`git commit -am \'Add new feature\'\`
8. Push to the branch: \`git push origin feature/new-feature\`
9. Create a Pull Request
`);
  }

  private createTsConfig(): string {
    return `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "tests"
  ]
}
`;
  }

  private createTypes(): string {
    return this.processTemplate(`// Type definitions for {{ projectName }}

export interface AppConfig {
  app: {
    name: string;
    version: string;
    port: number;
    environment: string;
  };
  database?: {
    url: string;
    options: Record<string, any>;
  };
  api?: {
    baseUrl: string;
    timeout: number;
  };
  logging: {
    level: string;
    format: string;
  };
}

export interface LoggerInterface {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

export interface UtilityFunctions {
  sleep(ms: number): Promise<void>;
  randomString(length?: number): string;
  deepClone(obj: any): any;
  formatBytes(bytes: number, decimals?: number): string;
  isValidEmail(email: string): boolean;
  capitalize(str: string): string;
}

export interface ApplicationInterface {
  name: string;
  version: string;
  start(): Promise<void>;
  initialize(): Promise<void>;
  setupComponents(): Promise<void>;
  shutdown(): Promise<void>;
}

// Common data types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type Environment = 'development' | 'production' | 'test';

// Event types (if using event system)
export interface AppEvent {
  type: string;
  payload?: any;
  timestamp: Date;
}

export interface EventHandler<T = any> {
  (event: AppEvent & { payload: T }): void | Promise<void>;
}
`);
  }

  private createEslintConfig(): string {
    const isTypeScript = this.config.features?.includes('typescript');
    const hasPrettier = this.config.features?.includes('prettier');
    
    return `module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'${isTypeScript ? ',\n    \'@typescript-eslint/recommended\'' : ''}${hasPrettier ? ',\n    \'prettier\'' : ''}
  ],${isTypeScript ? '\n  parser: \'@typescript-eslint/parser\',\n  parserOptions: {\n    ecmaVersion: 12,\n    sourceType: \'module\'\n  },\n  plugins: [\'@typescript-eslint\'],\n' : '\n  parserOptions: {\n    ecmaVersion: 12,\n    sourceType: \'module\'\n  },\n'}
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error'${isTypeScript ? ',\n    \'@typescript-eslint/no-unused-vars\': \'error\',\n    \'@typescript-eslint/no-explicit-any\': \'warn\',\n    \'@typescript-eslint/explicit-function-return-type\': \'off\',\n    \'@typescript-eslint/explicit-module-boundary-types\': \'off\'' : ''}
  },
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/']
};
`;
  }

  private createPrettierConfig(): string {
    return `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
`;
  }

  private createDockerfile(): string {
    const isTypeScript = this.config.features?.includes('typescript');
    
    return this.processTemplate(`# {{ projectName }} Dockerfile

# Use official Node.js runtime as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

${isTypeScript ? '# Development stage\nFROM base AS development\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# Production stage\nFROM base AS production\n' : '# Copy application code\nCOPY . .\n\n'}
# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S {{ projectName }} -u 1001

# Change ownership of app directory
RUN chown -R {{ projectName }}:nodejs /app
USER {{ projectName }}

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
CMD ["npm", "start"]
`);
  }

  private createDockerignore(): string {
    return `node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.coverage
.vscode
.idea
*.log
tests
.eslintrc.js
.prettierrc
tsconfig.json
.dockerignore
Dockerfile
dist
build
`;
  }

  protected createReadme(): string {
    return this.processTemplate(`# {{ projectName }}

{{ description }}

## Features

- 🚀 **Modern JavaScript/Node.js** - Built with latest standards
- 📦 **Modular Architecture** - Clean and maintainable code structure
- 🧪 **Testing Ready** - Jest testing framework included
- 📝 **Comprehensive Logging** - Built-in logging utilities
- ⚙️ **Configuration Management** - Environment-based configuration
- 🔧 **Development Tools** - Hot reload and development scripts
${this.config.features?.includes('typescript') ? '- 🔷 **TypeScript** - Type-safe development' : ''}
${this.config.features?.includes('eslint') ? '- 🔍 **ESLint** - Code linting and quality checks' : ''}
${this.config.features?.includes('prettier') ? '- 🎨 **Prettier** - Code formatting' : ''}
${this.config.features?.includes('docker') ? '- 🐳 **Docker** - Containerization support' : ''}

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
${this.config.features?.includes('docker') ? '- Docker (optional)' : ''}

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone <repository-url>
   cd {{ projectName }}
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Setup environment:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edit the \`.env\` file with your configuration.

4. **Start development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

## Scripts

- \`npm start\` - Start the application
- \`npm run dev\` - Start with auto-reload
- \`npm test\` - Run tests
- \`npm run test:watch\` - Run tests in watch mode
- \`npm run test:coverage\` - Run tests with coverage
${this.config.features?.includes('typescript') ? '- \`npm run build\` - Build TypeScript\n- \`npm run build:watch\` - Build in watch mode' : ''}
${this.config.features?.includes('eslint') ? '- \`npm run lint\` - Run ESLint\n- \`npm run lint:fix\` - Fix ESLint issues' : ''}
${this.config.features?.includes('prettier') ? '- \`npm run format\` - Format code\n- \`npm run format:check\` - Check formatting' : ''}
${this.config.features?.includes('docker') ? '- \`npm run docker:build\` - Build Docker image\n- \`npm run docker:run\` - Run Docker container' : ''}

## Project Structure

\`\`\`
{{ projectName }}/
├── src/
│   ├── index.${this.config.features?.includes('typescript') ? 'ts' : 'js'}           # Main application entry
│   ├── config/
│   │   └── index.${this.config.features?.includes('typescript') ? 'ts' : 'js'}      # Configuration
│   ├── utils/
│   │   └── helpers.${this.config.features?.includes('typescript') ? 'ts' : 'js'}   # Utility functions
${this.config.features?.includes('typescript') ? '│   └── types/\n│       └── index.ts      # Type definitions' : ''}
├── tests/
│   └── index.test.${this.config.features?.includes('typescript') ? 'ts' : 'js'}   # Tests
├── docs/
│   └── SETUP.md          # Setup guide
├── .env.example          # Environment template
├── package.json          # Dependencies
└── README.md            # This file
\`\`\`

## Configuration

The application uses environment variables for configuration. See \`.env.example\` for available options.

### Required Variables

- \`APP_NAME\` - Application name
- \`PORT\` - Server port (default: 3000)

### Optional Variables

- \`NODE_ENV\` - Environment (development/production/test)
- \`LOG_LEVEL\` - Logging level (debug/info/warn/error)
- \`DATABASE_URL\` - Database connection (if needed)

## Testing

This project uses Jest for testing:

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
\`\`\`

## API Documentation

*Add your API documentation here when you implement endpoints*

### Example Endpoints

- \`GET /health\` - Health check
- \`GET /api/status\` - Application status

${this.config.features?.includes('docker') ? '## Docker\n\n### Building the Image\n\n\`\`\`bash\ndocker build -t {{ projectName }} .\n\`\`\`\n\n### Running the Container\n\n\`\`\`bash\ndocker run -p 3000:3000 -e NODE_ENV=production {{ projectName }}\n\`\`\`\n\n### Docker Compose\n\n\`\`\`yaml\nversion: \'3.8\'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n      - PORT=3000\n\`\`\`\n\n' : ''}## Deployment

### Production Build

${this.config.features?.includes('typescript') ? '1. Build the application:\n   \`\`\`bash\n   npm run build\n   \`\`\`\n\n2. Start the production server:\n   \`\`\`bash\n   npm start\n   \`\`\`' : 'Start the production server:\n\`\`\`bash\nnpm start\n\`\`\`'}

### Environment Setup

Ensure all required environment variables are set in your production environment.

### Process Management

For production deployments, consider using PM2:

\`\`\`bash
npm install -g pm2
pm2 start ${this.config.features?.includes('typescript') ? 'dist/index.js' : 'src/index.js'} --name "{{ projectName }}"
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/new-feature\`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: \`npm test\`
${this.config.features?.includes('eslint') ? '6. Run linting: \`npm run lint\`' : ''}
7. Commit your changes: \`git commit -am \'Add new feature\'\`
8. Push to the branch: \`git push origin feature/new-feature\`
9. Create a Pull Request

## License

{{ license }}

## Support

For support and questions:

- Create an issue in the repository
- Check the documentation in the \`docs/\` directory
- Review the setup guide: \`docs/SETUP.md\`

## Changelog

### v1.0.0
- Initial release
- Basic project structure
- Configuration management
- Testing setup
- Development tools
`);
  }
}