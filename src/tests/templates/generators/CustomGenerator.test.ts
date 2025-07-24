import { CustomGenerator } from '../../../templates/generators/CustomGenerator';
import { ProjectFile } from '../../../utils/FileUtils';
import { SimpleStyleProfile } from '../../../types';

describe('CustomGenerator', () => {
  let generator: CustomGenerator;
  let mockStyleProfile: SimpleStyleProfile;

  beforeEach(() => {
    generator = new CustomGenerator();
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

  describe('constructor', () => {
    it('should initialize with default features', () => {
      expect(generator).toBeInstanceOf(CustomGenerator);
      
      // Test default features by checking file structure
      const structure = generator.getFileStructure();
      expect(structure).toBeInstanceOf(Array);
    });

    it('should accept custom features in constructor', () => {
      const customFeatures = {
        typescript: true,
        eslint: true,
        prettier: false,
        docker: true,
        testing: true
      };
      
      const customGen = new CustomGenerator(customFeatures);
      expect(customGen).toBeInstanceOf(CustomGenerator);
    });
  });

  describe('setFeatures', () => {
    it('should update features configuration', () => {
      const features = {
        typescript: true,
        eslint: true,
        prettier: true,
        docker: false,
        testing: true
      };
      
      generator.setFeatures(features);
      
      // Verify features are applied by checking generated files
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      // Should include TypeScript config when typescript is enabled
      expect(filePaths).toContain('tsconfig.json');
      
      // Should include ESLint config when eslint is enabled
      expect(filePaths).toContain('.eslintrc.js');
      
      // Should include Prettier config when prettier is enabled
      expect(filePaths).toContain('.prettierrc');
      
      // Should not include Docker files when docker is disabled
      expect(filePaths).not.toContain('Dockerfile');
    });

    it('should handle partial feature updates', () => {
      generator.setFeatures({ typescript: true });
      
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      expect(filePaths).toContain('tsconfig.json');
    });
  });

  describe('getFileStructure', () => {
    it('should return basic project structure', () => {
      const structure = generator.getFileStructure();
      
      expect(structure).toBeInstanceOf(Array);
      expect(structure.length).toBeGreaterThan(0);
      
      // Check for core directories
      const directories = structure.filter(item => item.type === 'directory');
      const directoryPaths = directories.map(dir => dir.path);
      
      expect(directoryPaths).toContain('src');
      expect(directoryPaths).toContain('src/utils');
      
      // Check for core files
      const files = structure.filter(item => item.type === 'file');
      const filePaths = files.map(file => file.path);
      
      expect(filePaths).toContain('package.json');
      expect(filePaths).toContain('README.md');
      expect(filePaths).toContain('.gitignore');
    });

    it('should include TypeScript files when typescript feature is enabled', () => {
      generator.setFeatures({ typescript: true });
      
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      expect(filePaths).toContain('tsconfig.json');
      expect(filePaths).toContain('src/types/index.ts');
      expect(filePaths).toContain('src/index.ts');
    });

    it('should include ESLint files when eslint feature is enabled', () => {
      generator.setFeatures({ eslint: true });
      
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      expect(filePaths).toContain('.eslintrc.js');
      expect(filePaths).toContain('.eslintignore');
    });

    it('should include Prettier files when prettier feature is enabled', () => {
      generator.setFeatures({ prettier: true });
      
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      expect(filePaths).toContain('.prettierrc');
      expect(filePaths).toContain('.prettierignore');
    });

    it('should include Docker files when docker feature is enabled', () => {
      generator.setFeatures({ docker: true });
      
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      expect(filePaths).toContain('Dockerfile');
      expect(filePaths).toContain('.dockerignore');
    });

    it('should include test files when testing feature is enabled', () => {
      generator.setFeatures({ testing: true });
      
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      expect(filePaths).toContain('tests/example.test.js');
      expect(filePaths).toContain('jest.config.js');
    });
  });

  describe('getDependencies', () => {
    it('should return basic dependencies', () => {
      const dependencies = generator.getDependencies();
      
      expect(dependencies).toHaveProperty('lodash');
      expect(dependencies).toHaveProperty('axios');
      
      // Check version format
      Object.values(dependencies).forEach(version => {
        expect(version).toMatch(/^\^?\d+\.\d+\.\d+/);
      });
    });

    it('should include TypeScript dependencies when typescript is enabled', () => {
      generator.setFeatures({ typescript: true });
      
      const devDependencies = generator.getDevDependencies();
      
      expect(devDependencies).toHaveProperty('typescript');
      expect(devDependencies).toHaveProperty('@types/node');
    });
  });

  describe('getDevDependencies', () => {
    it('should return development dependencies', () => {
      const devDependencies = generator.getDevDependencies();
      
      expect(devDependencies).toHaveProperty('nodemon');
      
      // Check version format
      Object.values(devDependencies).forEach(version => {
        expect(version).toMatch(/^\^?\d+\.\d+\.\d+/);
      });
    });

    it('should include ESLint dependencies when eslint is enabled', () => {
      generator.setFeatures({ eslint: true });
      
      const devDependencies = generator.getDevDependencies();
      
      expect(devDependencies).toHaveProperty('eslint');
    });

    it('should include Prettier dependencies when prettier is enabled', () => {
      generator.setFeatures({ prettier: true });
      
      const devDependencies = generator.getDevDependencies();
      
      expect(devDependencies).toHaveProperty('prettier');
    });

    it('should include testing dependencies when testing is enabled', () => {
      generator.setFeatures({ testing: true });
      
      const devDependencies = generator.getDevDependencies();
      
      expect(devDependencies).toHaveProperty('jest');
    });
  });

  describe('getScripts', () => {
    it('should return basic npm scripts', () => {
      const scripts = generator.getScripts();
      
      expect(scripts).toHaveProperty('start');
      expect(scripts).toHaveProperty('dev');
      
      expect(scripts.dev).toContain('nodemon');
    });

    it('should include TypeScript scripts when typescript is enabled', () => {
      generator.setFeatures({ typescript: true });
      
      const scripts = generator.getScripts();
      
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('type-check');
      expect(scripts.build).toContain('tsc');
    });

    it('should include ESLint scripts when eslint is enabled', () => {
      generator.setFeatures({ eslint: true });
      
      const scripts = generator.getScripts();
      
      expect(scripts).toHaveProperty('lint');
      expect(scripts).toHaveProperty('lint:fix');
      expect(scripts.lint).toContain('eslint');
    });

    it('should include Prettier scripts when prettier is enabled', () => {
      generator.setFeatures({ prettier: true });
      
      const scripts = generator.getScripts();
      
      expect(scripts).toHaveProperty('format');
      expect(scripts).toHaveProperty('format:check');
      expect(scripts.format).toContain('prettier');
    });

    it('should include test scripts when testing is enabled', () => {
      generator.setFeatures({ testing: true });
      
      const scripts = generator.getScripts();
      
      expect(scripts).toHaveProperty('test');
      expect(scripts).toHaveProperty('test:watch');
      expect(scripts.test).toContain('jest');
    });

    it('should include Docker scripts when docker is enabled', () => {
      generator.setFeatures({ docker: true });
      
      const scripts = generator.getScripts();
      
      expect(scripts).toHaveProperty('docker:build');
      expect(scripts).toHaveProperty('docker:run');
      expect(scripts['docker:build']).toContain('docker build');
    });
  });

  describe('generateMainFile', () => {
    it('should generate JavaScript main file by default', () => {
      const mainContent = generator.generateMainFile();
      
      expect(mainContent).toContain('console.log(\'Hello, Custom Project!\');');
      expect(mainContent).toContain('// Main application entry point');
    });

    it('should generate TypeScript main file when typescript is enabled', () => {
      generator.setFeatures({ typescript: true });
      
      const mainContent = generator.generateMainFile();
      
      expect(mainContent).toContain('interface AppConfig');
      expect(mainContent).toContain(': AppConfig');
      expect(mainContent).toContain('const config: AppConfig');
    });
  });

  describe('generateHelperFile', () => {
    it('should generate utility helper functions', () => {
      const helperContent = generator.generateHelperFile();
      
      expect(helperContent).toContain('export const formatDate = (');
      expect(helperContent).toContain('export const debounce = (');
      expect(helperContent).toContain('export const deepClone = (');
    });

    it('should include TypeScript types when typescript is enabled', () => {
      generator.setFeatures({ typescript: true });
      
      const helperContent = generator.generateHelperFile();
      
      expect(helperContent).toContain(': string');
      expect(helperContent).toContain(': number');
      expect(helperContent).toContain('interface');
    });
  });

  describe('generateConfigFile', () => {
    it('should generate basic configuration', () => {
      const configContent = generator.generateConfigFile();
      
      expect(configContent).toContain('module.exports = {');
      expect(configContent).toContain('env: process.env.NODE_ENV || \'development\'');
      expect(configContent).toContain('port: process.env.PORT || 3000');
    });

    it('should generate TypeScript configuration when typescript is enabled', () => {
      generator.setFeatures({ typescript: true });
      
      const configContent = generator.generateConfigFile();
      
      expect(configContent).toContain('interface Config');
      expect(configContent).toContain('export const config: Config');
    });
  });

  describe('generateTestFile', () => {
    it('should generate basic test file', () => {
      const testContent = generator.generateTestFile();
      
      expect(testContent).toContain('describe(\'Example Test Suite\'');
      expect(testContent).toContain('it(\'should pass basic test\'');
      expect(testContent).toContain('expect(true).toBe(true)');
    });

    it('should include TypeScript types when typescript is enabled', () => {
      generator.setFeatures({ typescript: true });
      
      const testContent = generator.generateTestFile();
      
      expect(testContent).toContain('import { describe, it, expect } from \'@jest/globals\'');
    });
  });

  describe('generateEnvFile', () => {
    it('should generate environment variables template', () => {
      const envContent = generator.generateEnvFile();
      
      expect(envContent).toContain('NODE_ENV=development');
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('# Application Configuration');
    });

    it('should include additional variables based on features', () => {
      generator.setFeatures({ docker: true });
      
      const envContent = generator.generateEnvFile();
      
      expect(envContent).toContain('# Docker Configuration');
    });
  });

  describe('generateSetupGuide', () => {
    it('should generate comprehensive setup guide', () => {
      const setupGuide = generator.generateSetupGuide();
      
      expect(setupGuide).toContain('# Setup Guide');
      expect(setupGuide).toContain('## Prerequisites');
      expect(setupGuide).toContain('## Installation');
      expect(setupGuide).toContain('## Development');
      expect(setupGuide).toContain('npm install');
      expect(setupGuide).toContain('npm run dev');
    });

    it('should include feature-specific setup instructions', () => {
      generator.setFeatures({ 
        typescript: true, 
        docker: true, 
        testing: true 
      });
      
      const setupGuide = generator.generateSetupGuide();
      
      expect(setupGuide).toContain('TypeScript');
      expect(setupGuide).toContain('Docker');
      expect(setupGuide).toContain('Testing');
      expect(setupGuide).toContain('npm run build');
      expect(setupGuide).toContain('npm test');
      expect(setupGuide).toContain('docker build');
    });
  });

  describe('generateTsConfig', () => {
    it('should generate TypeScript configuration', () => {
      const tsConfig = generator.generateTsConfig();
      
      expect(tsConfig).toContain('"compilerOptions"');
      expect(tsConfig).toContain('"target": "ES2020"');
      expect(tsConfig).toContain('"module": "commonjs"');
      expect(tsConfig).toContain('"strict": true');
      expect(tsConfig).toContain('"esModuleInterop": true');
      expect(tsConfig).toContain('"skipLibCheck": true');
      expect(tsConfig).toContain('"forceConsistentCasingInFileNames": true');
    });

    it('should include appropriate include and exclude patterns', () => {
      const tsConfig = generator.generateTsConfig();
      
      expect(tsConfig).toContain('"include"');
      expect(tsConfig).toContain('"exclude"');
      expect(tsConfig).toContain('"src/**/*"');
      expect(tsConfig).toContain('"node_modules"');
    });
  });

  describe('generateTypeDefinitions', () => {
    it('should generate TypeScript type definitions', () => {
      const typeDefinitions = generator.generateTypeDefinitions();
      
      expect(typeDefinitions).toContain('export interface User');
      expect(typeDefinitions).toContain('export interface ApiResponse');
      expect(typeDefinitions).toContain('export type Status =');
      expect(typeDefinitions).toContain('export type Environment =');
    });

    it('should include common utility types', () => {
      const typeDefinitions = generator.generateTypeDefinitions();
      
      expect(typeDefinitions).toContain('export type Nullable<T>');
      expect(typeDefinitions).toContain('export type Optional<T>');
    });
  });

  describe('generateEslintConfig', () => {
    it('should generate ESLint configuration', () => {
      const eslintConfig = generator.generateEslintConfig();
      
      expect(eslintConfig).toContain('module.exports = {');
      expect(eslintConfig).toContain('env: {');
      expect(eslintConfig).toContain('node: true');
      expect(eslintConfig).toContain('es2021: true');
      expect(eslintConfig).toContain('extends: [');
      expect(eslintConfig).toContain('\'eslint:recommended\'');
    });

    it('should include TypeScript configuration when typescript is enabled', () => {
      generator.setFeatures({ typescript: true });
      
      const eslintConfig = generator.generateEslintConfig();
      
      expect(eslintConfig).toContain('@typescript-eslint/recommended');
      expect(eslintConfig).toContain('parser: \'@typescript-eslint/parser\'');
      expect(eslintConfig).toContain('plugins: [\'@typescript-eslint\']');
    });
  });

  describe('generatePrettierConfig', () => {
    it('should generate Prettier configuration', () => {
      const prettierConfig = generator.generatePrettierConfig();
      
      expect(prettierConfig).toContain('"semi": true');
      expect(prettierConfig).toContain('"trailingComma": "es5"');
      expect(prettierConfig).toContain('"singleQuote": true');
      expect(prettierConfig).toContain('"printWidth": 80');
      expect(prettierConfig).toContain('"tabWidth": 2');
    });

    it('should apply style profile settings when available', () => {
      generator.setStyleProfile(mockStyleProfile);
      
      const prettierConfig = generator.generatePrettierConfig();
      
      expect(prettierConfig).toContain('"singleQuote": true'); // Based on mockStyleProfile
      expect(prettierConfig).toContain('"tabWidth": 2'); // Based on mockStyleProfile
    });
  });

  describe('generateDockerfile', () => {
    it('should generate Dockerfile', () => {
      const dockerfile = generator.generateDockerfile();
      
      expect(dockerfile).toContain('FROM node:');
      expect(dockerfile).toContain('WORKDIR /app');
      expect(dockerfile).toContain('COPY package*.json ./');
      expect(dockerfile).toContain('RUN npm install');
      expect(dockerfile).toContain('COPY . .');
      expect(dockerfile).toContain('EXPOSE 3000');
      expect(dockerfile).toContain('CMD ["npm", "start"]');
    });

    it('should include TypeScript build steps when typescript is enabled', () => {
      generator.setFeatures({ typescript: true });
      
      const dockerfile = generator.generateDockerfile();
      
      expect(dockerfile).toContain('RUN npm run build');
    });
  });

  describe('generateDockerignore', () => {
    it('should generate .dockerignore file', () => {
      const dockerignore = generator.generateDockerignore();
      
      expect(dockerignore).toContain('node_modules');
      expect(dockerignore).toContain('npm-debug.log*');
      expect(dockerignore).toContain('.git');
      expect(dockerignore).toContain('.gitignore');
      expect(dockerignore).toContain('README.md');
      expect(dockerignore).toContain('.env');
      expect(dockerignore).toContain('.nyc_output');
      expect(dockerignore).toContain('coverage');
    });
  });

  describe('generateReadme', () => {
    it('should generate comprehensive README', () => {
      const readme = generator.generateReadme();
      
      expect(readme).toContain('# Custom Project');
      expect(readme).toContain('## Features');
      expect(readme).toContain('## Installation');
      expect(readme).toContain('## Usage');
      expect(readme).toContain('## Development');
      expect(readme).toContain('npm install');
      expect(readme).toContain('npm run dev');
    });

    it('should include feature-specific documentation', () => {
      generator.setFeatures({ 
        typescript: true, 
        eslint: true, 
        prettier: true, 
        docker: true, 
        testing: true 
      });
      
      const readme = generator.generateReadme();
      
      expect(readme).toContain('TypeScript');
      expect(readme).toContain('ESLint');
      expect(readme).toContain('Prettier');
      expect(readme).toContain('Docker');
      expect(readme).toContain('Testing');
    });
  });

  describe('integration scenarios', () => {
    it('should generate complete TypeScript project', () => {
      generator.setFeatures({ 
        typescript: true, 
        eslint: true, 
        prettier: true, 
        testing: true 
      });
      
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      // TypeScript files
      expect(filePaths).toContain('tsconfig.json');
      expect(filePaths).toContain('src/index.ts');
      expect(filePaths).toContain('src/types/index.ts');
      
      // ESLint files
      expect(filePaths).toContain('.eslintrc.js');
      
      // Prettier files
      expect(filePaths).toContain('.prettierrc');
      
      // Test files
      expect(filePaths).toContain('tests/example.test.js');
      expect(filePaths).toContain('jest.config.js');
      
      // Check dependencies
      const devDeps = generator.getDevDependencies();
      expect(devDeps).toHaveProperty('typescript');
      expect(devDeps).toHaveProperty('eslint');
      expect(devDeps).toHaveProperty('prettier');
      expect(devDeps).toHaveProperty('jest');
    });

    it('should generate complete Docker project', () => {
      generator.setFeatures({ docker: true });
      
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      expect(filePaths).toContain('Dockerfile');
      expect(filePaths).toContain('.dockerignore');
      
      const scripts = generator.getScripts();
      expect(scripts).toHaveProperty('docker:build');
      expect(scripts).toHaveProperty('docker:run');
    });

    it('should handle all features enabled', () => {
      generator.setFeatures({ 
        typescript: true, 
        eslint: true, 
        prettier: true, 
        docker: true, 
        testing: true 
      });
      
      const structure = generator.getFileStructure();
      expect(structure.length).toBeGreaterThan(15); // Should have many files
      
      const scripts = generator.getScripts();
      expect(Object.keys(scripts).length).toBeGreaterThan(8); // Should have many scripts
      
      const devDeps = generator.getDevDependencies();
      expect(Object.keys(devDeps).length).toBeGreaterThan(5); // Should have many dev dependencies
    });
  });

  describe('error handling', () => {
    it('should handle invalid features gracefully', () => {
      expect(() => {
        generator.setFeatures({ invalidFeature: true } as any);
      }).not.toThrow();
    });

    it('should handle empty features object', () => {
      expect(() => {
        generator.setFeatures({});
      }).not.toThrow();
      
      const structure = generator.getFileStructure();
      expect(structure.length).toBeGreaterThan(0);
    });

    it('should handle null features', () => {
      expect(() => {
        generator.setFeatures(null as any);
      }).not.toThrow();
    });
  });
});