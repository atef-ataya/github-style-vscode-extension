import { CodeStyleEngine } from '../../core/CodeStyleEngine';
import { AnalysisDepth, SimpleStyleProfile } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('CodeStyleEngine', () => {
  let engine: CodeStyleEngine;
  let mockWorkspaceRoot: string;

  beforeEach(() => {
    engine = new CodeStyleEngine();
    mockWorkspaceRoot = '/mock/workspace';
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default fs mocks
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('');
    mockFs.readdirSync.mockReturnValue([]);
    mockFs.statSync.mockReturnValue({
      isDirectory: () => false,
      isFile: () => true
    } as any);
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(engine).toBeInstanceOf(CodeStyleEngine);
    });
  });

  describe('analyzeWorkspace', () => {
    it('should analyze workspace with shallow depth', async () => {
      const mockFiles = [
        'src/index.js',
        'src/utils.js',
        'package.json'
      ];
      
      mockFs.readdirSync.mockImplementation((dirPath: any) => {
        if (dirPath === mockWorkspaceRoot) {
          return ['src', 'package.json'] as any;
        }
        if (dirPath === path.join(mockWorkspaceRoot, 'src')) {
          return ['index.js', 'utils.js'] as any;
        }
        return [] as any;
      });
      
      mockFs.statSync.mockImplementation((filePath: any) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.json')) {
          return { isDirectory: () => false, isFile: () => true } as any;
        }
        return { isDirectory: () => true, isFile: () => false } as any;
      });
      
      mockFs.readFileSync.mockImplementation((filePath: any) => {
        if (filePath.endsWith('index.js')) {
          return `const utils = require('./utils');

function main() {
    console.log('Hello, World!');
}

main();`;
        }
        if (filePath.endsWith('utils.js')) {
          return `function formatDate(date) {
  return date.toISOString();
}

module.exports = { formatDate };`;
        }
        if (filePath.endsWith('package.json')) {
          return JSON.stringify({
            name: 'test-project',
            version: '1.0.0',
            main: 'src/index.js'
          });
        }
        return '';
      });
      
      const result = await engine.analyzeWorkspace(mockWorkspaceRoot, AnalysisDepth.SHALLOW);
      
      expect(result).toBeDefined();
      expect(result.indentStyle).toBeDefined();
      expect(result.indentSize).toBeDefined();
      expect(result.lineEnding).toBeDefined();
      expect(result.quoteStyle).toBeDefined();
      expect(result.semicolons).toBeDefined();
      expect(result.trailingCommas).toBeDefined();
      expect(result.bracketSpacing).toBeDefined();
      expect(result.arrowParens).toBeDefined();
    });

    it('should analyze workspace with deep depth', async () => {
      mockFs.readdirSync.mockImplementation((dirPath: any) => {
        if (dirPath === mockWorkspaceRoot) {
          return ['src', 'tests', 'package.json'] as any;
        }
        if (dirPath.includes('src')) {
          return ['index.js', 'components', 'utils'] as any;
        }
        if (dirPath.includes('tests')) {
          return ['index.test.js'] as any;
        }
        return ['helper.js'] as any;
      });
      
      mockFs.statSync.mockImplementation((filePath: any) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.json')) {
          return { isDirectory: () => false, isFile: () => true } as any;
        }
        return { isDirectory: () => true, isFile: () => false } as any;
      });
      
      mockFs.readFileSync.mockReturnValue(`const example = {
  name: "test",
  value: 42
};`);
      
      const result = await engine.analyzeWorkspace(mockWorkspaceRoot, AnalysisDepth.DEEP);
      
      expect(result).toBeDefined();
      expect(typeof result.indentStyle).toBe('string');
      expect(typeof result.indentSize).toBe('number');
    });

    it('should handle workspace with mixed file types', async () => {
      mockFs.readdirSync.mockReturnValue(['index.js', 'styles.css', 'config.json', 'README.md'] as any);
      
      mockFs.statSync.mockReturnValue({
        isDirectory: () => false,
        isFile: () => true
      } as any);
      
      mockFs.readFileSync.mockImplementation((filePath: any) => {
        if (filePath.endsWith('.js')) {
          return `function test() {
  return "hello";
}`;
        }
        if (filePath.endsWith('.css')) {
          return `.class {
  color: red;
}`;
        }
        if (filePath.endsWith('.json')) {
          return `{
  "name": "test"
}`;
        }
        return 'Some content';
      });
      
      const result = await engine.analyzeWorkspace(mockWorkspaceRoot, AnalysisDepth.SHALLOW);
      
      expect(result).toBeDefined();
    });

    it('should handle empty workspace', async () => {
      mockFs.readdirSync.mockReturnValue([]);
      
      const result = await engine.analyzeWorkspace(mockWorkspaceRoot, AnalysisDepth.SHALLOW);
      
      expect(result).toBeDefined();
      // Should return default values when no files to analyze
      expect(result.indentStyle).toBe('spaces');
      expect(result.indentSize).toBe(2);
    });

    it('should handle non-existent workspace', async () => {
      mockFs.existsSync.mockReturnValue(false);
      
      await expect(engine.analyzeWorkspace('/non/existent/path', AnalysisDepth.SHALLOW))
        .rejects.toThrow();
    });
  });

  describe('analyzeFile', () => {
    it('should analyze JavaScript file', async () => {
      const jsContent = `const config = {
    name: 'test',
    value: 42,
    items: [
        'item1',
        'item2'
    ]
};`;
      
      mockFs.readFileSync.mockReturnValue(jsContent);
      
      const result = await engine.analyzeFile('/path/to/file.js');
      
      expect(result).toBeDefined();
      expect(result.indentStyle).toBe('spaces');
      expect(result.indentSize).toBe(4);
      expect(result.quoteStyle).toBe('single');
      expect(result.semicolons).toBe(true);
      expect(result.trailingCommas).toBe(false);
    });

    it('should analyze TypeScript file', async () => {
      const tsContent = `interface Config {
  name: string;
  value: number;
}

const config: Config = {
  name: "test",
  value: 42
};`;
      
      mockFs.readFileSync.mockReturnValue(tsContent);
      
      const result = await engine.analyzeFile('/path/to/file.ts');
      
      expect(result).toBeDefined();
      expect(result.indentStyle).toBe('spaces');
      expect(result.indentSize).toBe(2);
      expect(result.quoteStyle).toBe('double');
      expect(result.semicolons).toBe(true);
    });

    it('should analyze CSS file', async () => {
      const cssContent = `.container {
    display: flex;
    flex-direction: column;
    padding: 16px;
}`;
      
      mockFs.readFileSync.mockReturnValue(cssContent);
      
      const result = await engine.analyzeFile('/path/to/styles.css');
      
      expect(result).toBeDefined();
      expect(result.indentStyle).toBe('spaces');
      expect(result.indentSize).toBe(4);
      expect(result.semicolons).toBe(true);
    });

    it('should analyze JSON file', async () => {
      const jsonContent = `{
  "name": "test-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0"
  }
}`;
      
      mockFs.readFileSync.mockReturnValue(jsonContent);
      
      const result = await engine.analyzeFile('/path/to/package.json');
      
      expect(result).toBeDefined();
      expect(result.indentStyle).toBe('spaces');
      expect(result.indentSize).toBe(2);
      expect(result.quoteStyle).toBe('double');
    });

    it('should handle file with tabs', async () => {
      const tabContent = `function test() {
\tconsole.log("hello");
\treturn true;
}`;
      
      mockFs.readFileSync.mockReturnValue(tabContent);
      
      const result = await engine.analyzeFile('/path/to/file.js');
      
      expect(result.indentStyle).toBe('tabs');
    });

    it('should handle file with mixed quotes', async () => {
      const mixedQuotesContent = `const single = 'hello';
const double = "world";
const template = \`template\`;`;
      
      mockFs.readFileSync.mockReturnValue(mixedQuotesContent);
      
      const result = await engine.analyzeFile('/path/to/file.js');
      
      expect(result.quoteStyle).toMatch(/single|double/);
    });

    it('should handle non-existent file', async () => {
      mockFs.existsSync.mockReturnValue(false);
      
      await expect(engine.analyzeFile('/non/existent/file.js'))
        .rejects.toThrow();
    });

    it('should handle binary file', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File is binary');
      });
      
      await expect(engine.analyzeFile('/path/to/image.png'))
        .rejects.toThrow();
    });
  });

  describe('detectIndentStyle', () => {
    it('should detect spaces', () => {
      const content = `function test() {
    return true;
}`;
      
      const result = engine.detectIndentStyle(content);
      
      expect(result.style).toBe('spaces');
      expect(result.size).toBe(4);
    });

    it('should detect tabs', () => {
      const content = `function test() {
\treturn true;
}`;
      
      const result = engine.detectIndentStyle(content);
      
      expect(result.style).toBe('tabs');
      expect(result.size).toBe(1);
    });

    it('should detect 2-space indentation', () => {
      const content = `{
  "name": "test",
  "nested": {
    "value": true
  }
}`;
      
      const result = engine.detectIndentStyle(content);
      
      expect(result.style).toBe('spaces');
      expect(result.size).toBe(2);
    });

    it('should handle mixed indentation', () => {
      const content = `function test() {
    // 4 spaces
\t// 1 tab
  // 2 spaces
}`;
      
      const result = engine.detectIndentStyle(content);
      
      // Should return the most common style
      expect(result.style).toMatch(/spaces|tabs/);
    });

    it('should handle no indentation', () => {
      const content = `console.log('hello');
console.log('world');`;
      
      const result = engine.detectIndentStyle(content);
      
      expect(result.style).toBe('spaces');
      expect(result.size).toBe(2); // Default
    });
  });

  describe('detectQuoteStyle', () => {
    it('should detect single quotes', () => {
      const content = `const message = 'hello world';
const name = 'test';`;
      
      const result = engine.detectQuoteStyle(content);
      
      expect(result).toBe('single');
    });

    it('should detect double quotes', () => {
      const content = `const message = "hello world";
const name = "test";`;
      
      const result = engine.detectQuoteStyle(content);
      
      expect(result).toBe('double');
    });

    it('should handle mixed quotes', () => {
      const content = `const single = 'hello';
const double = "world";
const another = 'test';`;
      
      const result = engine.detectQuoteStyle(content);
      
      expect(result).toBe('single'); // More single quotes
    });

    it('should handle template literals', () => {
      const content = `const template = \`hello \${name}\`;
const regular = 'world';`;
      
      const result = engine.detectQuoteStyle(content);
      
      expect(result).toBe('single'); // Template literals don't count
    });

    it('should handle no quotes', () => {
      const content = `const number = 42;
const boolean = true;`;
      
      const result = engine.detectQuoteStyle(content);
      
      expect(result).toBe('single'); // Default
    });
  });

  describe('detectSemicolons', () => {
    it('should detect semicolons present', () => {
      const content = `const a = 1;
const b = 2;
function test() { return true; }`;
      
      const result = engine.detectSemicolons(content);
      
      expect(result).toBe(true);
    });

    it('should detect semicolons absent', () => {
      const content = `const a = 1
const b = 2
function test() { return true }`;
      
      const result = engine.detectSemicolons(content);
      
      expect(result).toBe(false);
    });

    it('should handle mixed semicolon usage', () => {
      const content = `const a = 1;
const b = 2
const c = 3;`;
      
      const result = engine.detectSemicolons(content);
      
      expect(result).toBe(true); // More with semicolons
    });

    it('should handle for loops correctly', () => {
      const content = `for (let i = 0; i < 10; i++) {
  console.log(i)
}`;
      
      const result = engine.detectSemicolons(content);
      
      expect(result).toBe(false); // for loop semicolons don't count
    });
  });

  describe('detectTrailingCommas', () => {
    it('should detect trailing commas present', () => {
      const content = `const obj = {
  a: 1,
  b: 2,
};
const arr = [
  'item1',
  'item2',
];`;
      
      const result = engine.detectTrailingCommas(content);
      
      expect(result).toBe(true);
    });

    it('should detect trailing commas absent', () => {
      const content = `const obj = {
  a: 1,
  b: 2
};
const arr = [
  'item1',
  'item2'
];`;
      
      const result = engine.detectTrailingCommas(content);
      
      expect(result).toBe(false);
    });

    it('should handle single-line objects', () => {
      const content = `const obj = { a: 1, b: 2 };
const arr = ['item1', 'item2'];`;
      
      const result = engine.detectTrailingCommas(content);
      
      expect(result).toBe(false); // Single-line doesn't count
    });

    it('should handle function parameters', () => {
      const content = `function test(
  param1,
  param2,
) {
  return true;
}`;
      
      const result = engine.detectTrailingCommas(content);
      
      expect(result).toBe(true);
    });
  });

  describe('detectBracketSpacing', () => {
    it('should detect bracket spacing present', () => {
      const content = `const obj = { a: 1, b: 2 };
const arr = [ 'item1', 'item2' ];`;
      
      const result = engine.detectBracketSpacing(content);
      
      expect(result).toBe(true);
    });

    it('should detect bracket spacing absent', () => {
      const content = `const obj = {a: 1, b: 2};
const arr = ['item1', 'item2'];`;
      
      const result = engine.detectBracketSpacing(content);
      
      expect(result).toBe(false);
    });

    it('should handle mixed bracket spacing', () => {
      const content = `const obj1 = { a: 1 };
const obj2 = {b: 2};
const obj3 = { c: 3 };`;
      
      const result = engine.detectBracketSpacing(content);
      
      expect(result).toBe(true); // More with spacing
    });

    it('should handle empty objects', () => {
      const content = `const empty1 = {};
const empty2 = { };`;
      
      const result = engine.detectBracketSpacing(content);
      
      expect(typeof result).toBe('boolean');
    });
  });

  describe('detectArrowParens', () => {
    it('should detect arrow parens always', () => {
      const content = `const fn1 = (x) => x * 2;
const fn2 = (a, b) => a + b;
const fn3 = (item) => item.name;`;
      
      const result = engine.detectArrowParens(content);
      
      expect(result).toBe('always');
    });

    it('should detect arrow parens avoid', () => {
      const content = `const fn1 = x => x * 2;
const fn2 = (a, b) => a + b;
const fn3 = item => item.name;`;
      
      const result = engine.detectArrowParens(content);
      
      expect(result).toBe('avoid');
    });

    it('should handle mixed arrow parens', () => {
      const content = `const fn1 = (x) => x * 2;
const fn2 = y => y * 3;
const fn3 = (z) => z * 4;`;
      
      const result = engine.detectArrowParens(content);
      
      expect(result).toBe('always'); // More with parens
    });

    it('should handle no arrow functions', () => {
      const content = `function test() { return true; }
const obj = { method: function() {} };`;
      
      const result = engine.detectArrowParens(content);
      
      expect(result).toBe('avoid'); // Default
    });
  });

  describe('detectLineEnding', () => {
    it('should detect LF line endings', () => {
      const content = 'line1\nline2\nline3';
      
      const result = engine.detectLineEnding(content);
      
      expect(result).toBe('lf');
    });

    it('should detect CRLF line endings', () => {
      const content = 'line1\r\nline2\r\nline3';
      
      const result = engine.detectLineEnding(content);
      
      expect(result).toBe('crlf');
    });

    it('should detect CR line endings', () => {
      const content = 'line1\rline2\rline3';
      
      const result = engine.detectLineEnding(content);
      
      expect(result).toBe('cr');
    });

    it('should handle mixed line endings', () => {
      const content = 'line1\nline2\r\nline3\n';
      
      const result = engine.detectLineEnding(content);
      
      expect(result).toBe('lf'); // More LF
    });

    it('should handle single line', () => {
      const content = 'single line content';
      
      const result = engine.detectLineEnding(content);
      
      expect(result).toBe('lf'); // Default
    });
  });

  describe('mergeProfiles', () => {
    it('should merge multiple profiles', () => {
      const profile1: SimpleStyleProfile = {
        indentStyle: 'spaces',
        indentSize: 2,
        lineEnding: 'lf',
        quoteStyle: 'single',
        semicolons: true,
        trailingCommas: false,
        bracketSpacing: true,
        arrowParens: 'avoid'
      };
      
      const profile2: SimpleStyleProfile = {
        indentStyle: 'spaces',
        indentSize: 4,
        lineEnding: 'lf',
        quoteStyle: 'double',
        semicolons: true,
        trailingCommas: true,
        bracketSpacing: false,
        arrowParens: 'always'
      };
      
      const merged = engine.mergeProfiles([profile1, profile2]);
      
      expect(merged.indentStyle).toBe('spaces'); // Common
      expect(merged.lineEnding).toBe('lf'); // Common
      expect(merged.semicolons).toBe(true); // Common
      
      // For conflicting values, should use most common or first
      expect(typeof merged.indentSize).toBe('number');
      expect(typeof merged.quoteStyle).toBe('string');
    });

    it('should handle single profile', () => {
      const profile: SimpleStyleProfile = {
        indentStyle: 'tabs',
        indentSize: 1,
        lineEnding: 'crlf',
        quoteStyle: 'double',
        semicolons: false,
        trailingCommas: true,
        bracketSpacing: false,
        arrowParens: 'always'
      };
      
      const merged = engine.mergeProfiles([profile]);
      
      expect(merged).toEqual(profile);
    });

    it('should handle empty profiles array', () => {
      const merged = engine.mergeProfiles([]);
      
      expect(merged.indentStyle).toBe('spaces');
      expect(merged.indentSize).toBe(2);
      expect(merged.lineEnding).toBe('lf');
      expect(merged.quoteStyle).toBe('single');
      expect(merged.semicolons).toBe(true);
      expect(merged.trailingCommas).toBe(false);
      expect(merged.bracketSpacing).toBe(true);
      expect(merged.arrowParens).toBe('avoid');
    });
  });

  describe('integration scenarios', () => {
    it('should analyze real-world JavaScript project', async () => {
      const mockProjectStructure = {
        'package.json': JSON.stringify({ name: 'test-project' }),
        'src/index.js': `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
        'src/utils/helpers.js': `function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

module.exports = {
  formatDate,
  validateEmail
};`
      };
      
      mockFs.readdirSync.mockImplementation((dirPath: any) => {
        if (dirPath === mockWorkspaceRoot) {
          return ['src', 'package.json'] as any;
        }
        if (dirPath.includes('src')) {
          return ['index.js', 'utils'] as any;
        }
        if (dirPath.includes('utils')) {
          return ['helpers.js'] as any;
        }
        return [] as any;
      });
      
      mockFs.statSync.mockImplementation((filePath: any) => {
        const fileName = path.basename(filePath);
        if (fileName.includes('.')) {
          return { isDirectory: () => false, isFile: () => true } as any;
        }
        return { isDirectory: () => true, isFile: () => false } as any;
      });
      
      mockFs.readFileSync.mockImplementation((filePath: any) => {
        const relativePath = filePath.replace(mockWorkspaceRoot + path.sep, '').replace(/\\/g, '/');
        return mockProjectStructure[relativePath as keyof typeof mockProjectStructure] || '';
      });
      
      const result = await engine.analyzeWorkspace(mockWorkspaceRoot, AnalysisDepth.DEEP);
      
      expect(result).toBeDefined();
      expect(result.indentStyle).toBe('spaces');
      expect(result.indentSize).toBe(2);
      expect(result.quoteStyle).toBe('single');
      expect(result.semicolons).toBe(true);
    });

    it('should analyze TypeScript React project', async () => {
      const mockTsProject = {
        'package.json': JSON.stringify({ name: 'react-app' }),
        'src/App.tsx': `import React from 'react';
import { Component } from './Component';

interface AppProps {
  title: string;
}

const App: React.FC<AppProps> = ({ title }) => {
  return (
    <div className="app">
      <h1>{title}</h1>
      <Component />
    </div>
  );
};

export default App;`,
        'src/Component.tsx': `import React, { useState } from "react";

interface ComponentState {
  count: number;
}

const Component: React.FC = () => {
  const [state, setState] = useState<ComponentState>({
    count: 0,
  });

  const handleClick = () => {
    setState(prev => ({
      ...prev,
      count: prev.count + 1,
    }));
  };

  return (
    <button onClick={handleClick}>
      Count: {state.count}
    </button>
  );
};

export default Component;`
      };
      
      mockFs.readdirSync.mockImplementation((dirPath: any) => {
        if (dirPath === mockWorkspaceRoot) {
          return ['src', 'package.json'] as any;
        }
        if (dirPath.includes('src')) {
          return ['App.tsx', 'Component.tsx'] as any;
        }
        return [] as any;
      });
      
      mockFs.statSync.mockImplementation((filePath: any) => {
        const fileName = path.basename(filePath);
        if (fileName.includes('.')) {
          return { isDirectory: () => false, isFile: () => true } as any;
        }
        return { isDirectory: () => true, isFile: () => false } as any;
      });
      
      mockFs.readFileSync.mockImplementation((filePath: any) => {
        const relativePath = filePath.replace(mockWorkspaceRoot + path.sep, '').replace(/\\/g, '/');
        return mockTsProject[relativePath as keyof typeof mockTsProject] || '';
      });
      
      const result = await engine.analyzeWorkspace(mockWorkspaceRoot, AnalysisDepth.DEEP);
      
      expect(result).toBeDefined();
      expect(result.indentStyle).toBe('spaces');
      expect(result.indentSize).toBe(2);
      expect(result.semicolons).toBe(true);
      expect(result.trailingCommas).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle file read errors gracefully', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      await expect(engine.analyzeFile('/path/to/file.js'))
        .rejects.toThrow();
    });

    it('should handle invalid file paths', async () => {
      await expect(engine.analyzeFile(''))
        .rejects.toThrow();
    });

    it('should handle workspace with permission issues', async () => {
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      await expect(engine.analyzeWorkspace(mockWorkspaceRoot, AnalysisDepth.SHALLOW))
        .rejects.toThrow();
    });
  });
});