import { ReactGenerator } from '../../../templates/generators/ReactGenerator';
import { ProjectFile } from '../../../utils/FileUtils';
import { SimpleStyleProfile } from '../../../types';

describe('ReactGenerator', () => {
  let generator: ReactGenerator;
  let mockStyleProfile: SimpleStyleProfile;

  beforeEach(() => {
    generator = new ReactGenerator();
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
    it('should return complete React project structure', () => {
      const structure = generator.getFileStructure();
      
      expect(structure).toBeInstanceOf(Array);
      expect(structure.length).toBeGreaterThan(0);
      
      // Check for essential directories
      const directories = structure.filter(item => item.type === 'directory');
      const directoryPaths = directories.map(dir => dir.path);
      
      expect(directoryPaths).toContain('src');
      expect(directoryPaths).toContain('src/components');
      expect(directoryPaths).toContain('src/hooks');
      expect(directoryPaths).toContain('src/utils');
      expect(directoryPaths).toContain('src/types');
      expect(directoryPaths).toContain('src/styles');
      expect(directoryPaths).toContain('public');
      
      // Check for essential files
      const files = structure.filter(item => item.type === 'file');
      const filePaths = files.map(file => file.path);
      
      expect(filePaths).toContain('src/main.tsx');
      expect(filePaths).toContain('src/App.tsx');
      expect(filePaths).toContain('package.json');
      expect(filePaths).toContain('index.html');
      expect(filePaths).toContain('vite.config.ts');
      expect(filePaths).toContain('tsconfig.json');
    });

    it('should include configuration files', () => {
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      expect(filePaths).toContain('.gitignore');
      expect(filePaths).toContain('README.md');
      expect(filePaths).toContain('tsconfig.node.json');
      expect(filePaths).toContain('.env.example');
    });

    it('should include test files', () => {
      const structure = generator.getFileStructure();
      const filePaths = structure.filter(item => item.type === 'file').map(file => file.path);
      
      expect(filePaths).toContain('src/App.test.tsx');
      expect(filePaths).toContain('src/setupTests.ts');
    });
  });

  describe('getDependencies', () => {
    it('should return essential React dependencies', () => {
      const dependencies = generator.getDependencies();
      
      expect(dependencies).toHaveProperty('react');
      expect(dependencies).toHaveProperty('react-dom');
      expect(dependencies).toHaveProperty('react-router-dom');
      
      // Check version format
      Object.values(dependencies).forEach(version => {
        expect(version).toMatch(/^\^?\d+\.\d+\.\d+/);
      });
    });

    it('should include utility dependencies', () => {
      const dependencies = generator.getDependencies();
      
      expect(dependencies).toHaveProperty('axios');
      expect(dependencies).toHaveProperty('clsx');
    });
  });

  describe('getDevDependencies', () => {
    it('should return development dependencies', () => {
      const devDependencies = generator.getDevDependencies();
      
      expect(devDependencies).toHaveProperty('@vitejs/plugin-react');
      expect(devDependencies).toHaveProperty('vite');
      expect(devDependencies).toHaveProperty('typescript');
      expect(devDependencies).toHaveProperty('@types/react');
      expect(devDependencies).toHaveProperty('@types/react-dom');
      
      // Check version format
      Object.values(devDependencies).forEach(version => {
        expect(version).toMatch(/^\^?\d+\.\d+\.\d+/);
      });
    });

    it('should include testing dependencies', () => {
      const devDependencies = generator.getDevDependencies();
      
      expect(devDependencies).toHaveProperty('@testing-library/react');
      expect(devDependencies).toHaveProperty('@testing-library/jest-dom');
      expect(devDependencies).toHaveProperty('@testing-library/user-event');
      expect(devDependencies).toHaveProperty('vitest');
      expect(devDependencies).toHaveProperty('jsdom');
    });

    it('should include linting dependencies', () => {
      const devDependencies = generator.getDevDependencies();
      
      expect(devDependencies).toHaveProperty('eslint');
      expect(devDependencies).toHaveProperty('@typescript-eslint/eslint-plugin');
      expect(devDependencies).toHaveProperty('@typescript-eslint/parser');
      expect(devDependencies).toHaveProperty('eslint-plugin-react');
      expect(devDependencies).toHaveProperty('eslint-plugin-react-hooks');
    });
  });

  describe('getScripts', () => {
    it('should return npm scripts for React project', () => {
      const scripts = generator.getScripts();
      
      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('preview');
      expect(scripts).toHaveProperty('test');
      expect(scripts).toHaveProperty('lint');
      
      expect(scripts.dev).toContain('vite');
      expect(scripts.build).toContain('vite build');
      expect(scripts.test).toContain('vitest');
      expect(scripts.lint).toContain('eslint');
    });

    it('should include additional utility scripts', () => {
      const scripts = generator.getScripts();
      
      expect(scripts).toHaveProperty('test:ui');
      expect(scripts).toHaveProperty('test:coverage');
      expect(scripts).toHaveProperty('lint:fix');
      expect(scripts).toHaveProperty('type-check');
    });
  });

  describe('generateMainFile', () => {
    it('should generate main.tsx with proper React setup', () => {
      const mainContent = generator.generateMainFile();
      
      expect(mainContent).toContain('import React from \'react\'');
      expect(mainContent).toContain('import ReactDOM from \'react-dom/client\'');
      expect(mainContent).toContain('import App from \'./App\'');
      expect(mainContent).toContain('import \'./styles/index.css\'');
      
      expect(mainContent).toContain('ReactDOM.createRoot(');
      expect(mainContent).toContain('document.getElementById(\'root\')');
      expect(mainContent).toContain('<React.StrictMode>');
      expect(mainContent).toContain('<App />');
    });

    it('should include proper TypeScript types', () => {
      const mainContent = generator.generateMainFile();
      
      expect(mainContent).toContain('as HTMLElement');
      expect(mainContent).toContain('.render(');
    });
  });

  describe('generateAppComponent', () => {
    it('should generate App.tsx with proper structure', () => {
      const appContent = generator.generateAppComponent();
      
      expect(appContent).toContain('import React from \'react\'');
      expect(appContent).toContain('import { BrowserRouter as Router, Routes, Route } from \'react-router-dom\'');
      expect(appContent).toContain('import \'./App.css\'');
      
      expect(appContent).toContain('const App: React.FC = () => {');
      expect(appContent).toContain('return (');
      expect(appContent).toContain('<Router>');
      expect(appContent).toContain('<Routes>');
      expect(appContent).toContain('export default App');
    });

    it('should include sample routes', () => {
      const appContent = generator.generateAppComponent();
      
      expect(appContent).toContain('<Route path="/" element=');
      expect(appContent).toContain('Welcome to React');
    });

    it('should include navigation', () => {
      const appContent = generator.generateAppComponent();
      
      expect(appContent).toContain('<nav>');
      expect(appContent).toContain('<Link to="/">');
    });
  });

  describe('generateComponent', () => {
    it('should generate functional component', () => {
      const componentContent = generator.generateComponent('Button', 'functional');
      
      expect(componentContent).toContain('import React from \'react\'');
      expect(componentContent).toContain('interface ButtonProps');
      expect(componentContent).toContain('const Button: React.FC<ButtonProps> = (');
      expect(componentContent).toContain('export default Button');
    });

    it('should generate component with props interface', () => {
      const componentContent = generator.generateComponent('Card', 'functional');
      
      expect(componentContent).toContain('interface CardProps');
      expect(componentContent).toContain('children?: React.ReactNode');
      expect(componentContent).toContain('className?: string');
    });

    it('should generate component with CSS module import', () => {
      const componentContent = generator.generateComponent('Header', 'functional');
      
      expect(componentContent).toContain('import styles from \'./Header.module.css\'');
      expect(componentContent).toContain('className={styles.header}');
    });

    it('should handle different component types', () => {
      const functionalComponent = generator.generateComponent('Functional', 'functional');
      const classComponent = generator.generateComponent('Class', 'class');
      
      expect(functionalComponent).toContain('const Functional: React.FC');
      expect(classComponent).toContain('class Class extends React.Component');
    });
  });

  describe('generateHook', () => {
    it('should generate custom hook with proper structure', () => {
      const hookContent = generator.generateHook('useCounter');
      
      expect(hookContent).toContain('import { useState, useCallback } from \'react\'');
      expect(hookContent).toContain('export const useCounter = (');
      expect(hookContent).toContain('const [count, setCount] = useState');
      expect(hookContent).toContain('const increment = useCallback');
      expect(hookContent).toContain('return { count, increment, decrement, reset }');
    });

    it('should generate hook with TypeScript types', () => {
      const hookContent = generator.generateHook('useApi');
      
      expect(hookContent).toContain('interface UseApiReturn');
      expect(hookContent).toContain(': UseApiReturn');
    });

    it('should handle different hook types', () => {
      const stateHook = generator.generateHook('useState');
      const effectHook = generator.generateHook('useEffect');
      
      expect(stateHook).toContain('useState');
      expect(effectHook).toContain('useEffect');
    });
  });

  describe('generateUtility', () => {
    it('should generate utility functions', () => {
      const utilContent = generator.generateUtility('helpers');
      
      expect(utilContent).toContain('export const formatDate = (');
      expect(utilContent).toContain('export const debounce = (');
      expect(utilContent).toContain('export const classNames = (');
    });

    it('should include TypeScript types for utilities', () => {
      const utilContent = generator.generateUtility('api');
      
      expect(utilContent).toContain('interface ApiResponse');
      expect(utilContent).toContain('export const apiClient = {');
    });
  });

  describe('generateTypes', () => {
    it('should generate TypeScript type definitions', () => {
      const typesContent = generator.generateTypes();
      
      expect(typesContent).toContain('export interface User');
      expect(typesContent).toContain('export interface ApiResponse');
      expect(typesContent).toContain('export type Theme =');
      expect(typesContent).toContain('export type Status =');
    });

    it('should include common React types', () => {
      const typesContent = generator.generateTypes();
      
      expect(typesContent).toContain('export interface ComponentProps');
      expect(typesContent).toContain('children?: React.ReactNode');
    });
  });

  describe('generateTestFile', () => {
    it('should generate component test file', () => {
      const testContent = generator.generateTestFile('App');
      
      expect(testContent).toContain('import { render, screen } from \'@testing-library/react\'');
      expect(testContent).toContain('import { describe, it, expect } from \'vitest\'');
      expect(testContent).toContain('import App from \'./App\'');
      expect(testContent).toContain('describe(\'App\', () => {');
      expect(testContent).toContain('it(\'renders without crashing\'');
    });

    it('should include user interaction tests', () => {
      const testContent = generator.generateTestFile('Button');
      
      expect(testContent).toContain('import userEvent from \'@testing-library/user-event\'');
      expect(testContent).toContain('await userEvent.click');
    });

    it('should include accessibility tests', () => {
      const testContent = generator.generateTestFile('Form');
      
      expect(testContent).toContain('screen.getByRole');
      expect(testContent).toContain('screen.getByLabelText');
    });
  });

  describe('generateConfigFile', () => {
    it('should generate Vite configuration', () => {
      const viteConfig = generator.generateConfigFile('vite');
      
      expect(viteConfig).toContain('import { defineConfig } from \'vite\'');
      expect(viteConfig).toContain('import react from \'@vitejs/plugin-react\'');
      expect(viteConfig).toContain('export default defineConfig({');
      expect(viteConfig).toContain('plugins: [react()]');
    });

    it('should generate TypeScript configuration', () => {
      const tsConfig = generator.generateConfigFile('typescript');
      
      expect(tsConfig).toContain('"compilerOptions"');
      expect(tsConfig).toContain('"target": "ES2020"');
      expect(tsConfig).toContain('"lib": ["ES2020", "DOM", "DOM.Iterable"]');
      expect(tsConfig).toContain('"allowJs": false');
      expect(tsConfig).toContain('"skipLibCheck": true');
      expect(tsConfig).toContain('"esModuleInterop": false');
      expect(tsConfig).toContain('"allowSyntheticDefaultImports": true');
      expect(tsConfig).toContain('"strict": true');
      expect(tsConfig).toContain('"forceConsistentCasingInFileNames": true');
      expect(tsConfig).toContain('"module": "ESNext"');
      expect(tsConfig).toContain('"moduleResolution": "bundler"');
      expect(tsConfig).toContain('"resolveJsonModule": true');
      expect(tsConfig).toContain('"isolatedModules": true');
      expect(tsConfig).toContain('"noEmit": true');
      expect(tsConfig).toContain('"jsx": "react-jsx"');
    });

    it('should generate ESLint configuration', () => {
      const eslintConfig = generator.generateConfigFile('eslint');
      
      expect(eslintConfig).toContain('module.exports = {');
      expect(eslintConfig).toContain('extends: [');
      expect(eslintConfig).toContain('@typescript-eslint/recommended');
      expect(eslintConfig).toContain('plugin:react/recommended');
      expect(eslintConfig).toContain('plugin:react-hooks/recommended');
    });

    it('should generate Vitest configuration', () => {
      const vitestConfig = generator.generateConfigFile('vitest');
      
      expect(vitestConfig).toContain('import { defineConfig } from \'vitest/config\'');
      expect(vitestConfig).toContain('test: {');
      expect(vitestConfig).toContain('environment: \'jsdom\'');
      expect(vitestConfig).toContain('setupFiles: [\'./src/setupTests.ts\']');
    });
  });

  describe('generateEnvFile', () => {
    it('should generate environment variables template', () => {
      const envContent = generator.generateEnvFile();
      
      expect(envContent).toContain('VITE_APP_TITLE=React App');
      expect(envContent).toContain('VITE_API_URL=http://localhost:3001');
      expect(envContent).toContain('VITE_APP_VERSION=1.0.0');
    });

    it('should include development-specific variables', () => {
      const envContent = generator.generateEnvFile();
      
      expect(envContent).toContain('VITE_DEV_MODE=true');
      expect(envContent).toContain('VITE_LOG_LEVEL=debug');
    });
  });

  describe('generateReadme', () => {
    it('should generate comprehensive README', () => {
      const readme = generator.generateReadme();
      
      expect(readme).toContain('# React TypeScript App');
      expect(readme).toContain('## Features');
      expect(readme).toContain('## Getting Started');
      expect(readme).toContain('## Available Scripts');
      expect(readme).toContain('## Project Structure');
      expect(readme).toContain('## Testing');
    });

    it('should include setup instructions', () => {
      const readme = generator.generateReadme();
      
      expect(readme).toContain('npm install');
      expect(readme).toContain('npm run dev');
      expect(readme).toContain('npm run build');
      expect(readme).toContain('npm test');
    });

    it('should include technology stack information', () => {
      const readme = generator.generateReadme();
      
      expect(readme).toContain('React 18');
      expect(readme).toContain('TypeScript');
      expect(readme).toContain('Vite');
      expect(readme).toContain('React Router');
      expect(readme).toContain('Vitest');
    });
  });

  describe('generateIndexHtml', () => {
    it('should generate proper HTML template', () => {
      const htmlContent = generator.generateIndexHtml();
      
      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('<html lang="en">');
      expect(htmlContent).toContain('<meta charset="UTF-8" />');
      expect(htmlContent).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0" />');
      expect(htmlContent).toContain('<title>React TypeScript App</title>');
      expect(htmlContent).toContain('<div id="root"></div>');
      expect(htmlContent).toContain('<script type="module" src="/src/main.tsx"></script>');
    });

    it('should include favicon and meta tags', () => {
      const htmlContent = generator.generateIndexHtml();
      
      expect(htmlContent).toContain('<link rel="icon"');
      expect(htmlContent).toContain('<meta name="description"');
    });
  });

  describe('generateStyles', () => {
    it('should generate CSS styles', () => {
      const cssContent = generator.generateStyles('global');
      
      expect(cssContent).toContain('* {');
      expect(cssContent).toContain('box-sizing: border-box');
      expect(cssContent).toContain('body {');
      expect(cssContent).toContain('font-family:');
    });

    it('should generate component-specific styles', () => {
      const componentCss = generator.generateStyles('component');
      
      expect(componentCss).toContain('.component {');
      expect(componentCss).toContain('/* Component styles */');
    });

    it('should generate CSS modules', () => {
      const moduleCss = generator.generateStyles('module');
      
      expect(moduleCss).toContain('/* CSS Module */');
      expect(moduleCss).toContain('.container {');
    });
  });

  describe('integration with style profile', () => {
    beforeEach(() => {
      generator.setStyleProfile(mockStyleProfile);
    });

    it('should apply style profile to generated TypeScript files', () => {
      const appContent = generator.generateAppComponent();
      const formatted = generator.formatCode(appContent, 'typescript');
      
      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should apply style profile to JSON files', () => {
      const packageJson = generator.generatePackageJson('test-react-app');
      const formatted = generator.formatCode(packageJson, 'json');
      
      expect(formatted).toContain('\n'); // Should be formatted with newlines
      expect(formatted).toContain('  '); // Should have proper indentation
    });
  });

  describe('error handling', () => {
    it('should handle empty component names gracefully', () => {
      expect(() => {
        generator.generateComponent('', 'functional');
      }).not.toThrow();
    });

    it('should handle invalid component types', () => {
      const component = generator.generateComponent('Test', 'invalid' as any);
      expect(component).toBeDefined();
      expect(component.length).toBeGreaterThan(0);
    });

    it('should handle invalid config types', () => {
      const config = generator.generateConfigFile('invalid');
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
      const publicFiles = files.filter(file => file.startsWith('public/'));
      
      expect(srcFiles.length).toBeGreaterThan(0);
      
      // Ensure src directory exists if src files exist
      if (srcFiles.length > 0) {
        expect(directories).toContain('src');
      }
      
      // Ensure public directory exists if public files exist
      if (publicFiles.length > 0) {
        expect(directories).toContain('public');
      }
    });

    it('should include TypeScript files with proper extensions', () => {
      const structure = generator.getFileStructure();
      const tsFiles = structure.filter(item => 
        item.type === 'file' && (item.path.endsWith('.ts') || item.path.endsWith('.tsx'))
      );
      
      expect(tsFiles.length).toBeGreaterThan(0);
      
      // Check that React components use .tsx extension
      const reactFiles = tsFiles.filter(file => 
        file.path.includes('App.tsx') || file.path.includes('main.tsx')
      );
      
      expect(reactFiles.length).toBeGreaterThan(0);
    });
  });
});