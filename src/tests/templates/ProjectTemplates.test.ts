import { ProjectTemplates } from '../../templates/ProjectTemplates';
import { BaseGenerator } from '../../templates/generators/BaseGenerator';
import { ReactGenerator } from '../../templates/generators/ReactGenerator';
import { ExpressGenerator } from '../../templates/generators/ExpressGenerator';
import { CustomGenerator } from '../../templates/generators/CustomGenerator';
import { SimpleStyleProfile } from '../../types';
import { ProjectFile } from '../../utils/FileUtils';

// Mock the generators
jest.mock('../../templates/generators/ReactGenerator');
jest.mock('../../templates/generators/ExpressGenerator');
jest.mock('../../templates/generators/CustomGenerator');

const MockReactGenerator = ReactGenerator as jest.MockedClass<typeof ReactGenerator>;
const MockExpressGenerator = ExpressGenerator as jest.MockedClass<typeof ExpressGenerator>;
const MockCustomGenerator = CustomGenerator as jest.MockedClass<typeof CustomGenerator>;

describe('ProjectTemplates', () => {
  let projectTemplates: ProjectTemplates;
  let mockStyleProfile: SimpleStyleProfile;
  let mockProjectFiles: ProjectFile[];

  beforeEach(() => {
    projectTemplates = new ProjectTemplates();
    
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

    mockProjectFiles = [
      {
        path: 'src/index.js',
        content: 'console.log("Hello World");',
        type: 'file'
      },
      {
        path: 'package.json',
        content: JSON.stringify({ name: 'test-project' }),
        type: 'file'
      }
    ];

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    MockReactGenerator.mockImplementation(() => ({
      setStyleProfile: jest.fn(),
      generateProject: jest.fn().mockResolvedValue(mockProjectFiles),
      getFileStructure: jest.fn().mockReturnValue([]),
      getDependencies: jest.fn().mockReturnValue({}),
      getDevDependencies: jest.fn().mockReturnValue({}),
      getScripts: jest.fn().mockReturnValue({})
    } as any));

    MockExpressGenerator.mockImplementation(() => ({
      setStyleProfile: jest.fn(),
      generateProject: jest.fn().mockResolvedValue(mockProjectFiles),
      getFileStructure: jest.fn().mockReturnValue([]),
      getDependencies: jest.fn().mockReturnValue({}),
      getDevDependencies: jest.fn().mockReturnValue({}),
      getScripts: jest.fn().mockReturnValue({})
    } as any));

    MockCustomGenerator.mockImplementation(() => ({
      setStyleProfile: jest.fn(),
      setFeatures: jest.fn(),
      generateProject: jest.fn().mockResolvedValue(mockProjectFiles),
      getFileStructure: jest.fn().mockReturnValue([]),
      getDependencies: jest.fn().mockReturnValue({}),
      getDevDependencies: jest.fn().mockReturnValue({}),
      getScripts: jest.fn().mockReturnValue({})
    } as any));
  });

  describe('constructor', () => {
    it('should initialize with available templates', () => {
      expect(projectTemplates).toBeInstanceOf(ProjectTemplates);
    });
  });

  describe('getAvailableTemplates', () => {
    it('should return list of available templates', () => {
      const templates = projectTemplates.getAvailableTemplates();
      
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
      
      // Check for expected template types
      const templateNames = templates.map(t => t.name);
      expect(templateNames).toContain('React');
      expect(templateNames).toContain('Express');
      expect(templateNames).toContain('Custom');
    });

    it('should return templates with required properties', () => {
      const templates = projectTemplates.getAvailableTemplates();
      
      templates.forEach(template => {
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('tags');
        expect(template).toHaveProperty('features');
        
        expect(typeof template.name).toBe('string');
        expect(typeof template.description).toBe('string');
        expect(typeof template.category).toBe('string');
        expect(Array.isArray(template.tags)).toBe(true);
        expect(Array.isArray(template.features)).toBe(true);
      });
    });

    it('should include template metadata', () => {
      const templates = projectTemplates.getAvailableTemplates();
      const reactTemplate = templates.find(t => t.name === 'React');
      
      expect(reactTemplate).toBeDefined();
      expect(reactTemplate?.category).toBe('Frontend');
      expect(reactTemplate?.tags).toContain('React');
      expect(reactTemplate?.tags).toContain('TypeScript');
      expect(reactTemplate?.features).toContain('Component-based architecture');
    });
  });

  describe('generateProject', () => {
    it('should generate React project', async () => {
      const result = await projectTemplates.generateProject(
        'React',
        '/test/path',
        mockStyleProfile
      );
      
      expect(MockReactGenerator).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProjectFiles);
      
      const mockInstance = MockReactGenerator.mock.instances[0];
      expect(mockInstance.setStyleProfile).toHaveBeenCalledWith(mockStyleProfile);
      expect(mockInstance.generateProject).toHaveBeenCalledWith('/test/path');
    });

    it('should generate Express project', async () => {
      const result = await projectTemplates.generateProject(
        'Express',
        '/test/path',
        mockStyleProfile
      );
      
      expect(MockExpressGenerator).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProjectFiles);
      
      const mockInstance = MockExpressGenerator.mock.instances[0];
      expect(mockInstance.setStyleProfile).toHaveBeenCalledWith(mockStyleProfile);
      expect(mockInstance.generateProject).toHaveBeenCalledWith('/test/path');
    });

    it('should generate Custom project', async () => {
      const result = await projectTemplates.generateProject(
        'Custom',
        '/test/path',
        mockStyleProfile
      );
      
      expect(MockCustomGenerator).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProjectFiles);
      
      const mockInstance = MockCustomGenerator.mock.instances[0];
      expect(mockInstance.setStyleProfile).toHaveBeenCalledWith(mockStyleProfile);
      expect(mockInstance.generateProject).toHaveBeenCalledWith('/test/path');
    });

    it('should generate Custom project with features', async () => {
      const customFeatures = {
        typescript: true,
        eslint: true,
        prettier: false,
        docker: true,
        testing: true
      };
      
      const result = await projectTemplates.generateProject(
        'Custom',
        '/test/path',
        mockStyleProfile,
        customFeatures
      );
      
      expect(MockCustomGenerator).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProjectFiles);
      
      const mockInstance = MockCustomGenerator.mock.instances[0];
      expect(mockInstance.setStyleProfile).toHaveBeenCalledWith(mockStyleProfile);
      expect(mockInstance.setFeatures).toHaveBeenCalledWith(customFeatures);
      expect(mockInstance.generateProject).toHaveBeenCalledWith('/test/path');
    });

    it('should throw error for unknown template', async () => {
      await expect(
        projectTemplates.generateProject(
          'UnknownTemplate',
          '/test/path',
          mockStyleProfile
        )
      ).rejects.toThrow('Unknown template: UnknownTemplate');
    });

    it('should handle generator errors', async () => {
      const mockError = new Error('Generator failed');
      MockReactGenerator.mockImplementation(() => ({
        setStyleProfile: jest.fn(),
        generateProject: jest.fn().mockRejectedValue(mockError)
      } as any));
      
      await expect(
        projectTemplates.generateProject(
          'React',
          '/test/path',
          mockStyleProfile
        )
      ).rejects.toThrow('Generator failed');
    });
  });

  describe('getTemplateInfo', () => {
    it('should return React template info', () => {
      const info = projectTemplates.getTemplateInfo('React');
      
      expect(info).toBeDefined();
      expect(info.name).toBe('React');
      expect(info.category).toBe('Frontend');
      expect(info.description).toContain('React');
      expect(info.tags).toContain('React');
      expect(info.features).toContain('Component-based architecture');
    });

    it('should return Express template info', () => {
      const info = projectTemplates.getTemplateInfo('Express');
      
      expect(info).toBeDefined();
      expect(info.name).toBe('Express');
      expect(info.category).toBe('Backend');
      expect(info.description).toContain('Express');
      expect(info.tags).toContain('Express');
      expect(info.features).toContain('RESTful API structure');
    });

    it('should return Custom template info', () => {
      const info = projectTemplates.getTemplateInfo('Custom');
      
      expect(info).toBeDefined();
      expect(info.name).toBe('Custom');
      expect(info.category).toBe('General');
      expect(info.description).toContain('customizable');
      expect(info.tags).toContain('Flexible');
      expect(info.features).toContain('Configurable features');
    });

    it('should throw error for unknown template', () => {
      expect(() => {
        projectTemplates.getTemplateInfo('UnknownTemplate');
      }).toThrow('Template not found: UnknownTemplate');
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return Frontend templates', () => {
      const frontendTemplates = projectTemplates.getTemplatesByCategory('Frontend');
      
      expect(frontendTemplates).toBeInstanceOf(Array);
      expect(frontendTemplates.length).toBeGreaterThan(0);
      
      const templateNames = frontendTemplates.map(t => t.name);
      expect(templateNames).toContain('React');
      
      frontendTemplates.forEach(template => {
        expect(template.category).toBe('Frontend');
      });
    });

    it('should return Backend templates', () => {
      const backendTemplates = projectTemplates.getTemplatesByCategory('Backend');
      
      expect(backendTemplates).toBeInstanceOf(Array);
      expect(backendTemplates.length).toBeGreaterThan(0);
      
      const templateNames = backendTemplates.map(t => t.name);
      expect(templateNames).toContain('Express');
      
      backendTemplates.forEach(template => {
        expect(template.category).toBe('Backend');
      });
    });

    it('should return General templates', () => {
      const generalTemplates = projectTemplates.getTemplatesByCategory('General');
      
      expect(generalTemplates).toBeInstanceOf(Array);
      expect(generalTemplates.length).toBeGreaterThan(0);
      
      const templateNames = generalTemplates.map(t => t.name);
      expect(templateNames).toContain('Custom');
      
      generalTemplates.forEach(template => {
        expect(template.category).toBe('General');
      });
    });

    it('should return empty array for unknown category', () => {
      const unknownTemplates = projectTemplates.getTemplatesByCategory('Unknown');
      
      expect(unknownTemplates).toBeInstanceOf(Array);
      expect(unknownTemplates.length).toBe(0);
    });
  });

  describe('getTemplatesByTag', () => {
    it('should return templates with React tag', () => {
      const reactTemplates = projectTemplates.getTemplatesByTag('React');
      
      expect(reactTemplates).toBeInstanceOf(Array);
      expect(reactTemplates.length).toBeGreaterThan(0);
      
      reactTemplates.forEach(template => {
        expect(template.tags).toContain('React');
      });
    });

    it('should return templates with TypeScript tag', () => {
      const tsTemplates = projectTemplates.getTemplatesByTag('TypeScript');
      
      expect(tsTemplates).toBeInstanceOf(Array);
      expect(tsTemplates.length).toBeGreaterThan(0);
      
      tsTemplates.forEach(template => {
        expect(template.tags).toContain('TypeScript');
      });
    });

    it('should return templates with Node.js tag', () => {
      const nodeTemplates = projectTemplates.getTemplatesByTag('Node.js');
      
      expect(nodeTemplates).toBeInstanceOf(Array);
      expect(nodeTemplates.length).toBeGreaterThan(0);
      
      nodeTemplates.forEach(template => {
        expect(template.tags).toContain('Node.js');
      });
    });

    it('should return empty array for unknown tag', () => {
      const unknownTemplates = projectTemplates.getTemplatesByTag('UnknownTag');
      
      expect(unknownTemplates).toBeInstanceOf(Array);
      expect(unknownTemplates.length).toBe(0);
    });
  });

  describe('validateTemplate', () => {
    it('should validate existing template', () => {
      expect(projectTemplates.validateTemplate('React')).toBe(true);
      expect(projectTemplates.validateTemplate('Express')).toBe(true);
      expect(projectTemplates.validateTemplate('Custom')).toBe(true);
    });

    it('should not validate non-existing template', () => {
      expect(projectTemplates.validateTemplate('UnknownTemplate')).toBe(false);
      expect(projectTemplates.validateTemplate('')).toBe(false);
      expect(projectTemplates.validateTemplate('react')).toBe(false); // Case sensitive
    });

    it('should handle null and undefined', () => {
      expect(projectTemplates.validateTemplate(null as any)).toBe(false);
      expect(projectTemplates.validateTemplate(undefined as any)).toBe(false);
    });
  });

  describe('getTemplateGenerator', () => {
    it('should return React generator', () => {
      const generator = projectTemplates.getTemplateGenerator('React');
      
      expect(MockReactGenerator).toHaveBeenCalledTimes(1);
      expect(generator).toBeDefined();
    });

    it('should return Express generator', () => {
      const generator = projectTemplates.getTemplateGenerator('Express');
      
      expect(MockExpressGenerator).toHaveBeenCalledTimes(1);
      expect(generator).toBeDefined();
    });

    it('should return Custom generator', () => {
      const generator = projectTemplates.getTemplateGenerator('Custom');
      
      expect(MockCustomGenerator).toHaveBeenCalledTimes(1);
      expect(generator).toBeDefined();
    });

    it('should throw error for unknown template', () => {
      expect(() => {
        projectTemplates.getTemplateGenerator('UnknownTemplate');
      }).toThrow('Unknown template: UnknownTemplate');
    });
  });

  describe('getTemplatePreview', () => {
    beforeEach(() => {
      const mockFileStructure = [
        { path: 'src', type: 'directory' },
        { path: 'src/index.js', type: 'file' },
        { path: 'package.json', type: 'file' },
        { path: 'README.md', type: 'file' }
      ];
      
      MockReactGenerator.mockImplementation(() => ({
        getFileStructure: jest.fn().mockReturnValue(mockFileStructure),
        getDependencies: jest.fn().mockReturnValue({ react: '^18.0.0' }),
        getDevDependencies: jest.fn().mockReturnValue({ '@types/react': '^18.0.0' }),
        getScripts: jest.fn().mockReturnValue({ start: 'react-scripts start' })
      } as any));
    });

    it('should return React template preview', () => {
      const preview = projectTemplates.getTemplatePreview('React');
      
      expect(preview).toBeDefined();
      expect(preview.fileStructure).toBeInstanceOf(Array);
      expect(preview.dependencies).toBeDefined();
      expect(preview.devDependencies).toBeDefined();
      expect(preview.scripts).toBeDefined();
      
      expect(preview.fileStructure.length).toBeGreaterThan(0);
      expect(preview.dependencies).toHaveProperty('react');
      expect(preview.devDependencies).toHaveProperty('@types/react');
      expect(preview.scripts).toHaveProperty('start');
    });

    it('should return Express template preview', () => {
      MockExpressGenerator.mockImplementation(() => ({
        getFileStructure: jest.fn().mockReturnValue([
          { path: 'src', type: 'directory' },
          { path: 'src/app.js', type: 'file' }
        ]),
        getDependencies: jest.fn().mockReturnValue({ express: '^4.18.0' }),
        getDevDependencies: jest.fn().mockReturnValue({ nodemon: '^2.0.0' }),
        getScripts: jest.fn().mockReturnValue({ start: 'node src/app.js' })
      } as any));
      
      const preview = projectTemplates.getTemplatePreview('Express');
      
      expect(preview).toBeDefined();
      expect(preview.dependencies).toHaveProperty('express');
      expect(preview.devDependencies).toHaveProperty('nodemon');
      expect(preview.scripts).toHaveProperty('start');
    });

    it('should throw error for unknown template', () => {
      expect(() => {
        projectTemplates.getTemplatePreview('UnknownTemplate');
      }).toThrow('Unknown template: UnknownTemplate');
    });
  });

  describe('searchTemplates', () => {
    it('should search templates by name', () => {
      const results = projectTemplates.searchTemplates('React');
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      
      const reactTemplate = results.find(t => t.name === 'React');
      expect(reactTemplate).toBeDefined();
    });

    it('should search templates by description', () => {
      const results = projectTemplates.searchTemplates('web application');
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search templates by tags', () => {
      const results = projectTemplates.searchTemplates('TypeScript');
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      
      results.forEach(template => {
        const matchesTag = template.tags.some(tag => 
          tag.toLowerCase().includes('typescript')
        );
        const matchesName = template.name.toLowerCase().includes('typescript');
        const matchesDescription = template.description.toLowerCase().includes('typescript');
        
        expect(matchesTag || matchesName || matchesDescription).toBe(true);
      });
    });

    it('should search templates by features', () => {
      const results = projectTemplates.searchTemplates('API');
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = projectTemplates.searchTemplates('NonExistentTerm');
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(0);
    });

    it('should handle case insensitive search', () => {
      const lowerResults = projectTemplates.searchTemplates('react');
      const upperResults = projectTemplates.searchTemplates('REACT');
      const mixedResults = projectTemplates.searchTemplates('React');
      
      expect(lowerResults.length).toBe(upperResults.length);
      expect(upperResults.length).toBe(mixedResults.length);
    });

    it('should handle empty search term', () => {
      const results = projectTemplates.searchTemplates('');
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete React project generation workflow', async () => {
      // Get template info
      const info = projectTemplates.getTemplateInfo('React');
      expect(info.name).toBe('React');
      
      // Validate template
      expect(projectTemplates.validateTemplate('React')).toBe(true);
      
      // Get preview
      const preview = projectTemplates.getTemplatePreview('React');
      expect(preview).toBeDefined();
      
      // Generate project
      const result = await projectTemplates.generateProject(
        'React',
        '/test/path',
        mockStyleProfile
      );
      
      expect(result).toEqual(mockProjectFiles);
      expect(MockReactGenerator).toHaveBeenCalledTimes(2); // Once for preview, once for generation
    });

    it('should handle template search and generation', async () => {
      // Search for templates
      const searchResults = projectTemplates.searchTemplates('Express');
      expect(searchResults.length).toBeGreaterThan(0);
      
      const expressTemplate = searchResults.find(t => t.name === 'Express');
      expect(expressTemplate).toBeDefined();
      
      // Generate found template
      const result = await projectTemplates.generateProject(
        expressTemplate!.name,
        '/test/path',
        mockStyleProfile
      );
      
      expect(result).toEqual(mockProjectFiles);
    });

    it('should handle category filtering and generation', async () => {
      // Get backend templates
      const backendTemplates = projectTemplates.getTemplatesByCategory('Backend');
      expect(backendTemplates.length).toBeGreaterThan(0);
      
      const expressTemplate = backendTemplates.find(t => t.name === 'Express');
      expect(expressTemplate).toBeDefined();
      
      // Generate backend template
      const result = await projectTemplates.generateProject(
        expressTemplate!.name,
        '/test/path',
        mockStyleProfile
      );
      
      expect(result).toEqual(mockProjectFiles);
    });
  });

  describe('error handling', () => {
    it('should handle generator instantiation errors', () => {
      MockReactGenerator.mockImplementation(() => {
        throw new Error('Generator instantiation failed');
      });
      
      expect(() => {
        projectTemplates.getTemplateGenerator('React');
      }).toThrow('Generator instantiation failed');
    });

    it('should handle invalid template names gracefully', () => {
      expect(() => {
        projectTemplates.getTemplateInfo('');
      }).toThrow('Template not found: ');
      
      expect(() => {
        projectTemplates.getTemplateGenerator('');
      }).toThrow('Unknown template: ');
    });

    it('should handle null and undefined inputs', () => {
      expect(projectTemplates.validateTemplate(null as any)).toBe(false);
      expect(projectTemplates.validateTemplate(undefined as any)).toBe(false);
      
      expect(projectTemplates.searchTemplates(null as any)).toEqual([]);
      expect(projectTemplates.searchTemplates(undefined as any)).toEqual([]);
    });
  });
});