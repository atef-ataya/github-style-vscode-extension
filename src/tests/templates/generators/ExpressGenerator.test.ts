import { ExpressGenerator } from '../../../templates/generators/ExpressGenerator';
import { ProjectFile } from '../../../utils/FileUtils';
import { SimpleStyleProfile } from '../../../types';

describe('ExpressGenerator', () => {
  let generator: ExpressGenerator;
  let mockStyleProfile: SimpleStyleProfile;

  beforeEach(() => {
    generator = new ExpressGenerator();
    mockStyleProfile = {
      indentStyle: 'spaces',
      indentSize: 2,
      lineEnding: 'lf',
      quoteStyle: 'single',
      semicolons: true,
      trailingCommas: true,
      bracketSpacing: true,
      arrowParens: 'avoid'
    };
  });

  describe('getFileStructure', () => {
    it('should return complete Express.js project structure', () => {
      const structure = generator.getFileStructure();
      
      expect(structure).toBeInstanceOf(Array);
      expect(structure.length).toBeGreaterThan(0);
      
      // Check for essential directories
      const directories = structure.filter(item => item.type === 'directory');
      const directoryPaths = directories.map(dir => dir.path);
      
      expect(directoryPaths).toContain('src');
      expect(directoryPaths).toContain('src/routes');
      expect(directoryPaths).toContain('src/middleware');
      expect(directoryPaths).toContain('src/controllers');
      expect(directoryPaths).toContain('src/models');
      expect(directoryPaths).toContain('src/config');
      expect(directoryPaths).toContain('tests');
      
      // Check for essential files
      const files = structure.filter(item => item.type === 'file');
      const filePaths = files.map(file => file.path);
      
      expect(filePaths).toContain('src/app.js');
      expect(filePaths).toContain('src/server.js');
      expect(filePaths).toContain('package.json');
      expect(filePaths).toContain('.env.example');
      expect(filePaths).toContain('README.md');
    });

    it('should include all necessary configuration files', () => {
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      expect(filePaths).toContain('.gitignore');
      expect(filePaths).toContain('.env.example');
      expect(filePaths).toContain('src/config/database.js');
      expect(filePaths).toContain('src/config/cors.js');
    });

    it('should include test files', () => {
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      expect(filePaths).toContain('tests/app.test.js');
      expect(filePaths).toContain('tests/routes.test.js');
    });
  });

  describe('getDependencies', () => {
    it('should return essential Express.js dependencies', () => {
      const dependencies = generator.getDependencies();
      
      expect(dependencies).toHaveProperty('express');
      expect(dependencies).toHaveProperty('cors');
      expect(dependencies).toHaveProperty('helmet');
      expect(dependencies).toHaveProperty('morgan');
      expect(dependencies).toHaveProperty('dotenv');
      expect(dependencies).toHaveProperty('express-rate-limit');
      
      // Check version format
      Object.values(dependencies).forEach(version => {
        expect(version).toMatch(/^\^?\d+\.\d+\.\d+/);
      });
    });

    it('should include database and validation dependencies', () => {
      const dependencies = generator.getDependencies();
      
      expect(dependencies).toHaveProperty('mongoose');
      expect(dependencies).toHaveProperty('joi');
      expect(dependencies).toHaveProperty('bcryptjs');
      expect(dependencies).toHaveProperty('jsonwebtoken');
    });
  });

  describe('getDevDependencies', () => {
    it('should return development dependencies', () => {
      const devDependencies = generator.getDevDependencies();
      
      expect(devDependencies).toHaveProperty('nodemon');
      expect(devDependencies).toHaveProperty('jest');
      expect(devDependencies).toHaveProperty('supertest');
      expect(devDependencies).toHaveProperty('eslint');
      
      // Check version format
      Object.values(devDependencies).forEach(version => {
        expect(version).toMatch(/^\^?\d+\.\d+\.\d+/);
      });
    });
  });

  describe('getScripts', () => {
    it('should return npm scripts for Express.js project', () => {
      const scripts = generator.getScripts();
      
      expect(scripts).toHaveProperty('start');
      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('test');
      expect(scripts).toHaveProperty('lint');
      
      expect(scripts.start).toContain('node');
      expect(scripts.dev).toContain('nodemon');
      expect(scripts.test).toContain('jest');
      expect(scripts.lint).toContain('eslint');
    });

    it('should include additional utility scripts', () => {
      const scripts = generator.getScripts();
      
      expect(scripts).toHaveProperty('test:watch');
      expect(scripts).toHaveProperty('lint:fix');
    });
  });

  describe('generateMainFile', () => {
    it('should generate Express app.js with proper structure', () => {
      const appContent = generator.generateMainFile();
      
      expect(appContent).toContain('const express = require(\'express\')');
      expect(appContent).toContain('const cors = require(\'cors\')');
      expect(appContent).toContain('const helmet = require(\'helmet\')');
      expect(appContent).toContain('const morgan = require(\'morgan\')');
      expect(appContent).toContain('const rateLimit = require(\'express-rate-limit\')');
      
      expect(appContent).toContain('const app = express()');
      expect(appContent).toContain('app.use(express.json())');
      expect(appContent).toContain('app.use(cors())');
      expect(appContent).toContain('app.use(helmet())');
      
      expect(appContent).toContain('module.exports = app');
    });

    it('should include middleware setup', () => {
      const appContent = generator.generateMainFile();
      
      expect(appContent).toContain('app.use(morgan(\'combined\'))');
      expect(appContent).toContain('app.use(rateLimit(');
      expect(appContent).toContain('app.use(express.urlencoded');
    });

    it('should include route setup', () => {
      const appContent = generator.generateMainFile();
      
      expect(appContent).toContain('app.use(\'/api\', require(\'./routes\'))');
      expect(appContent).toContain('app.get(\'/\', (req, res)');
    });

    it('should include error handling', () => {
      const appContent = generator.generateMainFile();
      
      expect(appContent).toContain('app.use((err, req, res, next)');
      expect(appContent).toContain('res.status(500)');
    });
  });

  describe('generateServerFile', () => {
    it('should generate server.js with proper setup', () => {
      const serverContent = generator.generateServerFile();
      
      expect(serverContent).toContain('require(\'dotenv\').config()');
      expect(serverContent).toContain('const app = require(\'./app\')');
      expect(serverContent).toContain('const PORT = process.env.PORT || 3000');
      expect(serverContent).toContain('app.listen(PORT');
      expect(serverContent).toContain('console.log(`Server running on port ${PORT}`)');
    });

    it('should include graceful shutdown handling', () => {
      const serverContent = generator.generateServerFile();
      
      expect(serverContent).toContain('process.on(\'SIGTERM\'');
      expect(serverContent).toContain('process.on(\'SIGINT\'');
    });
  });

  describe('generateRouteFile', () => {
    it('should generate basic route structure', () => {
      const routeContent = generator.generateRouteFile();
      
      expect(routeContent).toContain('const express = require(\'express\')');
      expect(routeContent).toContain('const router = express.Router()');
      expect(routeContent).toContain('module.exports = router');
    });

    it('should include sample routes', () => {
      const routeContent = generator.generateRouteFile();
      
      expect(routeContent).toContain('router.get(\'/\', (req, res)');
      expect(routeContent).toContain('router.get(\'/health\', (req, res)');
    });

    it('should include route documentation', () => {
      const routeContent = generator.generateRouteFile();
      
      expect(routeContent).toContain('// API Routes');
      expect(routeContent).toContain('// Health check endpoint');
    });
  });

  describe('generateMiddleware', () => {
    it('should generate authentication middleware', () => {
      const authMiddleware = generator.generateMiddleware('auth');
      
      expect(authMiddleware).toContain('const jwt = require(\'jsonwebtoken\')');
      expect(authMiddleware).toContain('const authenticateToken = (req, res, next)');
      expect(authMiddleware).toContain('jwt.verify(token');
      expect(authMiddleware).toContain('module.exports = { authenticateToken }');
    });

    it('should generate validation middleware', () => {
      const validationMiddleware = generator.generateMiddleware('validation');
      
      expect(validationMiddleware).toContain('const Joi = require(\'joi\')');
      expect(validationMiddleware).toContain('const validateRequest = (schema)');
      expect(validationMiddleware).toContain('const { error } = schema.validate');
    });

    it('should generate error handling middleware', () => {
      const errorMiddleware = generator.generateMiddleware('error');
      
      expect(errorMiddleware).toContain('const errorHandler = (err, req, res, next)');
      expect(errorMiddleware).toContain('res.status(err.status || 500)');
    });

    it('should handle unknown middleware types', () => {
      const unknownMiddleware = generator.generateMiddleware('unknown');
      
      expect(unknownMiddleware).toContain('// Custom middleware');
      expect(unknownMiddleware).toContain('module.exports');
    });
  });

  describe('generateConfigFile', () => {
    it('should generate database configuration', () => {
      const dbConfig = generator.generateConfigFile('database');
      
      expect(dbConfig).toContain('const mongoose = require(\'mongoose\')');
      expect(dbConfig).toContain('const connectDB = async ()');
      expect(dbConfig).toContain('mongoose.connect(process.env.MONGODB_URI');
      expect(dbConfig).toContain('module.exports = connectDB');
    });

    it('should generate CORS configuration', () => {
      const corsConfig = generator.generateConfigFile('cors');
      
      expect(corsConfig).toContain('const corsOptions = {');
      expect(corsConfig).toContain('origin: process.env.ALLOWED_ORIGINS');
      expect(corsConfig).toContain('credentials: true');
      expect(corsConfig).toContain('module.exports = corsOptions');
    });

    it('should generate default configuration for unknown types', () => {
      const defaultConfig = generator.generateConfigFile('unknown');
      
      expect(defaultConfig).toContain('// Configuration file');
      expect(defaultConfig).toContain('module.exports');
    });
  });

  describe('generateTestFile', () => {
    it('should generate app test file', () => {
      const appTest = generator.generateTestFile('app');
      
      expect(appTest).toContain('const request = require(\'supertest\')');
      expect(appTest).toContain('const app = require(\'../src/app\')');
      expect(appTest).toContain('describe(\'Express App\'');
      expect(appTest).toContain('it(\'should respond to GET /\'');
    });

    it('should generate route test file', () => {
      const routeTest = generator.generateTestFile('routes');
      
      expect(routeTest).toContain('describe(\'API Routes\'');
      expect(routeTest).toContain('it(\'should return health status\'');
      expect(routeTest).toContain('expect(res.status).toBe(200)');
    });

    it('should generate default test for unknown types', () => {
      const defaultTest = generator.generateTestFile('unknown');
      
      expect(defaultTest).toContain('describe(\'Test Suite\'');
      expect(defaultTest).toContain('it(\'should pass\'');
    });
  });

  describe('generateEnvFile', () => {
    it('should generate environment variables template', () => {
      const envContent = generator.generateEnvFile();
      
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('NODE_ENV=development');
      expect(envContent).toContain('MONGODB_URI=mongodb://localhost:27017/myapp');
      expect(envContent).toContain('JWT_SECRET=your-secret-key');
      expect(envContent).toContain('ALLOWED_ORIGINS=http://localhost:3000');
    });

    it('should include database and security variables', () => {
      const envContent = generator.generateEnvFile();
      
      expect(envContent).toContain('DB_NAME=');
      expect(envContent).toContain('JWT_EXPIRES_IN=');
      expect(envContent).toContain('BCRYPT_ROUNDS=');
    });
  });

  describe('generateReadme', () => {
    it('should generate comprehensive README', () => {
      const readme = generator.generateReadme();
      
      expect(readme).toContain('# Express.js API');
      expect(readme).toContain('## Installation');
      expect(readme).toContain('## Usage');
      expect(readme).toContain('## API Endpoints');
      expect(readme).toContain('## Environment Variables');
      expect(readme).toContain('## Testing');
    });

    it('should include setup instructions', () => {
      const readme = generator.generateReadme();
      
      expect(readme).toContain('npm install');
      expect(readme).toContain('npm run dev');
      expect(readme).toContain('npm test');
      expect(readme).toContain('.env.example');
    });

    it('should include API documentation', () => {
      const readme = generator.generateReadme();
      
      expect(readme).toContain('GET /api');
      expect(readme).toContain('GET /api/health');
      expect(readme).toContain('Response:');
    });
  });

  describe('generateGitignore', () => {
    it('should generate appropriate .gitignore', () => {
      const gitignore = generator.generateGitignore();
      
      expect(gitignore).toContain('node_modules/');
      expect(gitignore).toContain('.env');
      expect(gitignore).toContain('*.log');
      expect(gitignore).toContain('coverage/');
      expect(gitignore).toContain('dist/');
    });

    it('should include OS and IDE specific ignores', () => {
      const gitignore = generator.generateGitignore();
      
      expect(gitignore).toContain('.DS_Store');
      expect(gitignore).toContain('Thumbs.db');
      expect(gitignore).toContain('.vscode/');
      expect(gitignore).toContain('.idea/');
    });
  });

  describe('integration with style profile', () => {
    beforeEach(() => {
      generator.setStyleProfile(mockStyleProfile);
    });

    it('should apply style profile to generated JavaScript files', () => {
      const appContent = generator.generateMainFile();
      const formatted = generator.formatCode(appContent, 'javascript');
      
      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should apply style profile to JSON files', () => {
      const packageJson = generator.generatePackageJson('test-express-app');
      const formatted = generator.formatCode(packageJson, 'json');
      
      expect(formatted).toContain('\n'); // Should be formatted with newlines
      expect(formatted).toContain('  '); // Should have proper indentation
    });
  });

  describe('error handling', () => {
    it('should handle empty project name gracefully', () => {
      expect(() => {
        generator.generatePackageJson('');
      }).not.toThrow();
    });

    it('should handle invalid middleware types', () => {
      const middleware = generator.generateMiddleware('');
      expect(middleware).toBeDefined();
      expect(middleware.length).toBeGreaterThan(0);
    });

    it('should handle invalid config types', () => {
      const config = generator.generateConfigFile('');
      expect(config).toBeDefined();
      expect(config.length).toBeGreaterThan(0);
    });
  });

  describe('file structure validation', () => {
    it('should have consistent file structure', () => {
      const structure = generator.getFileStructure();
      
      // Ensure all files have required properties
      structure.forEach(item => {
        expect(item).toHaveProperty('path');
        expect(item).toHaveProperty('type');
        expect(['file', 'directory']).toContain(item.type);
        
        if (item.type === 'file') {
          expect(item).toHaveProperty('content');
          expect(typeof item.content).toBe('string');
        }
      });
    });

    it('should have logical directory structure', () => {
      const structure = generator.getFileStructure();
      const directories = structure.filter(item => item.type === 'directory').map(dir => dir.path);
      const files = structure.filter(item => item.type === 'file').map(file => file.path);
      
      // Check that files are in appropriate directories
      const srcFiles = files.filter(file => file.startsWith('src/'));
      const testFiles = files.filter(file => file.startsWith('tests/'));
      
      expect(srcFiles.length).toBeGreaterThan(0);
      expect(testFiles.length).toBeGreaterThan(0);
      
      // Ensure src directory exists if src files exist
      if (srcFiles.length > 0) {
        expect(directories).toContain('src');
      }
      
      // Ensure tests directory exists if test files exist
      if (testFiles.length > 0) {
        expect(directories).toContain('tests');
      }
    });
  });
});