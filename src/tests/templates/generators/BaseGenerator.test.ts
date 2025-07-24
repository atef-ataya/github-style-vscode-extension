import { BaseGenerator } from '../../../templates/generators/BaseGenerator';
import { ProjectFile } from '../../../utils/FileUtils';
import { SimpleStyleProfile } from '../../../types';
import * as fs from 'fs';
import * as path from 'path';

// Mock the file system
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

// Concrete implementation for testing
class TestGenerator extends BaseGenerator {
  getFileStructure(): ProjectFile[] {
    return [
      {
        path: 'src/index.js',
        content: 'console.log("Hello World");',
        type: 'file'
      },
      {
        path: 'package.json',
        content: JSON.stringify({ name: 'test-project', version: '1.0.0' }, null, 2),
        type: 'file'
      },
      {
        path: 'src',
        type: 'directory'
      }
    ];
  }

  getDependencies(): Record<string, string> {
    return {
      'express': '^4.18.0',
      'lodash': '^4.17.21'
    };
  }

  getDevDependencies(): Record<string, string> {
    return {
      'jest': '^29.0.0',
      'typescript': '^5.0.0'
    };
  }

  getScripts(): Record<string, string> {
    return {
      'start': 'node src/index.js',
      'test': 'jest',
      'build': 'tsc'
    };
  }

  generateMainFile(): string {
    return 'console.log("Main file content");';
  }

  generateConfigFile(): string {
    return JSON.stringify({ config: 'test' }, null, 2);
  }

  generateTestFile(): string {
    return 'describe("test", () => { it("should work", () => { expect(true).toBe(true); }); });';
  }

  generateReadme(): string {
    return '# Test Project\n\nThis is a test project.';
  }
}

describe('BaseGenerator', () => {
  let generator: TestGenerator;
  let mockStyleProfile: SimpleStyleProfile;

  beforeEach(() => {
    generator = new TestGenerator();
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

    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockPath.join.mockImplementation((...args) => args.join('/'));
    mockPath.dirname.mockImplementation((p) => p.split('/').slice(0, -1).join('/'));
    mockPath.resolve.mockImplementation((...args) => '/' + args.join('/'));
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockImplementation(() => {});
    mockFs.writeFileSync.mockImplementation(() => {});
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(generator).toBeInstanceOf(BaseGenerator);
      expect(generator).toBeInstanceOf(TestGenerator);
    });
  });

  describe('setStyleProfile', () => {
    it('should set the style profile', () => {
      generator.setStyleProfile(mockStyleProfile);
      
      // Test that style profile is applied by checking formatted code
      const formatted = generator.formatCode('const x=1', 'javascript');
      expect(formatted).toBeDefined();
    });

    it('should work without style profile', () => {
      const formatted = generator.formatCode('const x = 1;', 'javascript');
      expect(formatted).toBe('const x = 1;');
    });
  });

  describe('formatCode', () => {
    beforeEach(() => {
      generator.setStyleProfile(mockStyleProfile);
    });

    it('should format JavaScript code according to style profile', () => {
      const code = 'const x=1;const y=2';
      const formatted = generator.formatCode(code, 'javascript');
      
      expect(formatted).toContain('const x = 1;');
      expect(formatted).toContain('const y = 2;');
    });

    it('should format TypeScript code', () => {
      const code = 'interface User{name:string;age:number}';
      const formatted = generator.formatCode(code, 'typescript');
      
      expect(formatted).toContain('interface User');
      expect(formatted).toContain('name: string');
    });

    it('should format JSON code', () => {
      const code = '{"name":"test","version":"1.0.0"}';
      const formatted = generator.formatCode(code, 'json');
      
      expect(formatted).toContain('"name": "test"');
      expect(formatted).toContain('"version": "1.0.0"');
    });

    it('should handle CSS formatting', () => {
      const code = 'body{margin:0;padding:0}';
      const formatted = generator.formatCode(code, 'css');
      
      expect(formatted).toContain('body');
      expect(formatted).toContain('margin: 0');
    });

    it('should return original code for unsupported languages', () => {
      const code = 'some random text';
      const formatted = generator.formatCode(code, 'unknown' as any);
      
      expect(formatted).toBe(code);
    });

    it('should handle empty code', () => {
      const formatted = generator.formatCode('', 'javascript');
      expect(formatted).toBe('');
    });

    it('should handle malformed code gracefully', () => {
      const code = 'const x = {';
      const formatted = generator.formatCode(code, 'javascript');
      
      // Should not throw and return something reasonable
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('applyIndentation', () => {
    beforeEach(() => {
      generator.setStyleProfile(mockStyleProfile);
    });

    it('should apply spaces indentation', () => {
      const code = 'function test() {\nreturn true;\n}';
      const indented = generator.applyIndentation(code, 1);
      
      expect(indented).toContain('  function test()');
      expect(indented).toContain('  return true;');
    });

    it('should apply tabs indentation when configured', () => {
      const tabProfile = { ...mockStyleProfile, indentStyle: 'tabs' as const };
      generator.setStyleProfile(tabProfile);
      
      const code = 'function test() {\nreturn true;\n}';
      const indented = generator.applyIndentation(code, 1);
      
      expect(indented).toContain('\tfunction test()');
      expect(indented).toContain('\treturn true;');
    });

    it('should handle multiple indentation levels', () => {
      const code = 'if (true) {\nif (false) {\nreturn;\n}\n}';
      const indented = generator.applyIndentation(code, 2);
      
      expect(indented).toContain('    if (true)');
      expect(indented).toContain('      if (false)');
      expect(indented).toContain('        return;');
    });

    it('should handle empty lines', () => {
      const code = 'line1\n\nline3';
      const indented = generator.applyIndentation(code, 1);
      
      expect(indented).toContain('  line1');
      expect(indented).toContain('\n\n');
      expect(indented).toContain('  line3');
    });
  });

  describe('generatePackageJson', () => {
    it('should generate package.json with project details', () => {
      const packageJson = generator.generatePackageJson('test-project', '1.0.0', 'Test description');
      const parsed = JSON.parse(packageJson);
      
      expect(parsed.name).toBe('test-project');
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.description).toBe('Test description');
      expect(parsed.dependencies).toEqual({
        'express': '^4.18.0',
        'lodash': '^4.17.21'
      });
      expect(parsed.devDependencies).toEqual({
        'jest': '^29.0.0',
        'typescript': '^5.0.0'
      });
      expect(parsed.scripts).toEqual({
        'start': 'node src/index.js',
        'test': 'jest',
        'build': 'tsc'
      });
    });

    it('should handle empty dependencies and scripts', () => {
      // Create a generator with no dependencies
      class EmptyGenerator extends BaseGenerator {
        getFileStructure() { return []; }
        getDependencies() { return {}; }
        getDevDependencies() { return {}; }
        getScripts() { return {}; }
        generateMainFile() { return ''; }
        generateConfigFile() { return ''; }
        generateTestFile() { return ''; }
        generateReadme() { return ''; }
      }
      
      const emptyGen = new EmptyGenerator();
      const packageJson = emptyGen.generatePackageJson('empty-project');
      const parsed = JSON.parse(packageJson);
      
      expect(parsed.dependencies).toEqual({});
      expect(parsed.devDependencies).toEqual({});
      expect(parsed.scripts).toEqual({});
    });

    it('should use default values for optional parameters', () => {
      const packageJson = generator.generatePackageJson('test-project');
      const parsed = JSON.parse(packageJson);
      
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.description).toBe('');
    });
  });

  describe('generateProject', () => {
    const outputPath = '/test/output';
    const projectName = 'test-project';

    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(false);
    });

    it('should generate complete project structure', async () => {
      await generator.generateProject(outputPath, projectName);
      
      // Verify directories were created
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/output/src', { recursive: true });
      
      // Verify files were written
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/output/src/index.js',
        'console.log("Hello World");',
        'utf8'
      );
      
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/output/package.json',
        expect.stringContaining('"name": "test-project"'),
        'utf8'
      );
    });

    it('should handle existing directories', async () => {
      mockFs.existsSync.mockReturnValue(true);
      
      await generator.generateProject(outputPath, projectName);
      
      // Should still write files even if directories exist
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });

    it('should apply style profile to generated files', async () => {
      generator.setStyleProfile(mockStyleProfile);
      
      await generator.generateProject(outputPath, projectName);
      
      // Check that files were formatted according to style profile
      const writeFileCalls = mockFs.writeFileSync.mock.calls;
      const packageJsonCall = writeFileCalls.find(call => 
        call[0].toString().endsWith('package.json')
      );
      
      expect(packageJsonCall).toBeDefined();
      expect(packageJsonCall![1]).toContain('\n'); // Should be formatted
    });

    it('should handle file write errors gracefully', async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });
      
      await expect(generator.generateProject(outputPath, projectName))
        .rejects.toThrow('Write failed');
    });

    it('should handle directory creation errors', async () => {
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('Directory creation failed');
      });
      
      await expect(generator.generateProject(outputPath, projectName))
        .rejects.toThrow('Directory creation failed');
    });
  });

  describe('abstract method implementations', () => {
    it('should implement all required abstract methods', () => {
      expect(generator.getFileStructure()).toEqual([
        {
          path: 'src/index.js',
          content: 'console.log("Hello World");',
          type: 'file'
        },
        {
          path: 'package.json',
          content: JSON.stringify({ name: 'test-project', version: '1.0.0' }, null, 2),
          type: 'file'
        },
        {
          path: 'src',
          type: 'directory'
        }
      ]);
      
      expect(generator.getDependencies()).toEqual({
        'express': '^4.18.0',
        'lodash': '^4.17.21'
      });
      
      expect(generator.getDevDependencies()).toEqual({
        'jest': '^29.0.0',
        'typescript': '^5.0.0'
      });
      
      expect(generator.getScripts()).toEqual({
        'start': 'node src/index.js',
        'test': 'jest',
        'build': 'tsc'
      });
      
      expect(generator.generateMainFile()).toBe('console.log("Main file content");');
      expect(generator.generateConfigFile()).toBe(JSON.stringify({ config: 'test' }, null, 2));
      expect(generator.generateTestFile()).toContain('describe');
      expect(generator.generateReadme()).toContain('# Test Project');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very long file paths', async () => {
      const longPath = '/very/long/path/that/might/cause/issues/in/some/systems';
      
      await generator.generateProject(longPath, 'test');
      
      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle special characters in project names', async () => {
      const specialName = 'test-project_with.special-chars';
      
      await generator.generateProject('/test', specialName);
      
      const packageJsonCall = mockFs.writeFileSync.mock.calls.find(call => 
        call[0].toString().endsWith('package.json')
      );
      
      expect(packageJsonCall![1]).toContain(`"name": "${specialName}"`);
    });

    it('should handle empty file content', () => {
      const formatted = generator.formatCode('', 'javascript');
      expect(formatted).toBe('');
    });

    it('should handle null or undefined style profile gracefully', () => {
      generator.setStyleProfile(null as any);
      
      const formatted = generator.formatCode('const x = 1;', 'javascript');
      expect(formatted).toBe('const x = 1;');
    });
  });

  describe('integration scenarios', () => {
    it('should generate a complete project with style formatting', async () => {
      generator.setStyleProfile(mockStyleProfile);
      
      await generator.generateProject('/test/integration', 'integration-test');
      
      // Verify all expected files were created
      const writeCalls = mockFs.writeFileSync.mock.calls;
      const filePaths = writeCalls.map(call => call[0]);
      
      expect(filePaths).toContain('/test/integration/src/index.js');
      expect(filePaths).toContain('/test/integration/package.json');
      
      // Verify package.json content
      const packageJsonCall = writeCalls.find(call => 
        call[0].toString().endsWith('package.json')
      );
      const packageContent = JSON.parse(packageJsonCall![1] as string);
      
      expect(packageContent.name).toBe('integration-test');
      expect(packageContent.dependencies).toBeDefined();
      expect(packageContent.scripts).toBeDefined();
    });

    it('should handle mixed file types in file structure', async () => {
      // Test with a generator that has both files and directories
      await generator.generateProject('/test/mixed', 'mixed-project');
      
      // Verify directories were created
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/mixed/src', { recursive: true });
      
      // Verify files were written
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/test/mixed/src/index.js',
        'console.log("Hello World");',
        'utf8'
      );
    });
  });
});