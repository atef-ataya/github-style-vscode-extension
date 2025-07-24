import { Configuration, ConfigurationUtils, EnvironmentConfig } from '../../config/Configuration';
import * as vscode from 'vscode';

// Mock VS Code workspace configuration
const mockWorkspaceConfig = {
  get: jest.fn(),
  update: jest.fn(),
  has: jest.fn()
};

const mockWorkspace = {
  getConfiguration: jest.fn(() => mockWorkspaceConfig),
  onDidChangeConfiguration: jest.fn(() => ({ dispose: jest.fn() }))
};

(vscode.workspace as any) = mockWorkspace;

describe('Configuration', () => {
  let config: Configuration;

  beforeEach(() => {
    // Reset singleton instance
    (Configuration as any).instance = undefined;
    jest.clearAllMocks();
    
    // Setup default mock returns
    mockWorkspaceConfig.get.mockReturnValue({});
    
    config = Configuration.getInstance();
  });

  afterEach(() => {
    config.dispose();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = Configuration.getInstance();
      const instance2 = Configuration.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the configuration', () => {
      const configData = config.getConfig();
      const configData2 = config.getConfig();
      
      expect(configData).toEqual(configData2);
      expect(configData).not.toBe(configData2); // Should be different objects
    });

    it('should return default configuration values', () => {
      const configData = config.getConfig();
      
      expect(configData.github.apiUrl).toBe('https://api.github.com');
      expect(configData.openai.model).toBe('gpt-4');
      expect(configData.cache.enabled).toBe(true);
      expect(configData.generation.maxRepositories).toBe(10);
    });
  });

  describe('getSection', () => {
    it('should return a specific configuration section', () => {
      const githubConfig = config.getSection('github');
      
      expect(githubConfig).toHaveProperty('token');
      expect(githubConfig).toHaveProperty('apiUrl');
      expect(githubConfig).toHaveProperty('timeout');
    });

    it('should return a copy of the section', () => {
      const section1 = config.getSection('github');
      const section2 = config.getSection('github');
      
      expect(section1).toEqual(section2);
      expect(section1).not.toBe(section2);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration with valid data', async () => {
      const updates = {
        github: {
          token: 'ghp_test_token',
          timeout: 45000
        }
      };
      
      await config.updateConfig(updates);
      
      const updatedConfig = config.getConfig();
      expect(updatedConfig.github.token).toBe('ghp_test_token');
      expect(updatedConfig.github.timeout).toBe(45000);
    });

    it('should save updates to VS Code settings', async () => {
      const updates = {
        github: {
          token: 'ghp_test_token'
        }
      };
      
      await config.updateConfig(updates);
      
      expect(mockWorkspaceConfig.update).toHaveBeenCalledWith(
        'github.token',
        'ghp_test_token',
        vscode.ConfigurationTarget.Global
      );
    });

    it('should reject invalid configuration', async () => {
      const invalidUpdates = {
        github: {
          token: 'invalid_token_format'
        },
        openai: {
          apiKey: 'invalid_key_format'
        }
      };
      
      await expect(config.updateConfig(invalidUpdates)).rejects.toThrow();
    });

    it('should notify watchers on successful update', async () => {
      const watcher = jest.fn();
      config.addWatcher(watcher);
      
      const updates = {
        github: {
          token: 'ghp_valid_token'
        }
      };
      
      await config.updateConfig(updates);
      
      expect(watcher).toHaveBeenCalledWith(
        expect.objectContaining({
          github: expect.objectContaining({
            token: 'ghp_valid_token'
          })
        })
      );
    });
  });

  describe('updateSection', () => {
    it('should update a specific section', async () => {
      await config.updateSection('github', {
        token: 'ghp_section_token',
        timeout: 60000
      });
      
      const githubConfig = config.getSection('github');
      expect(githubConfig.token).toBe('ghp_section_token');
      expect(githubConfig.timeout).toBe(60000);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset configuration to default values', async () => {
      // First update some values
      await config.updateConfig({
        github: { token: 'ghp_test_token' }
      });
      
      // Then reset
      await config.resetToDefaults();
      
      const configData = config.getConfig();
      expect(configData.github.token).toBe('');
      expect(configData.github.apiUrl).toBe('https://api.github.com');
    });
  });

  describe('validateCurrentConfig', () => {
    it('should validate configuration and return errors for missing required fields', () => {
      const validation = config.validateCurrentConfig();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('GitHub token is required');
      expect(validation.errors).toContain('OpenAI API key is required');
    });

    it('should return valid for properly configured settings', async () => {
      await config.updateConfig({
        github: { token: 'ghp_valid_token' },
        openai: { apiKey: 'sk-valid_key' }
      });
      
      const validation = config.validateCurrentConfig();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should return warnings for suboptimal settings', async () => {
      await config.updateConfig({
        github: { 
          token: 'ghp_valid_token',
          timeout: 500 // Very low timeout
        },
        openai: { 
          apiKey: 'sk-valid_key',
          maxTokens: 50 // Very low token count
        }
      });
      
      const validation = config.validateCurrentConfig();
      
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(w => w.includes('timeout'))).toBe(true);
      expect(validation.warnings.some(w => w.includes('tokens'))).toBe(true);
    });
  });

  describe('watchers', () => {
    it('should add and remove watchers', () => {
      const watcher1 = jest.fn();
      const watcher2 = jest.fn();
      
      const unsubscribe1 = config.addWatcher(watcher1);
      const unsubscribe2 = config.addWatcher(watcher2);
      
      // Trigger a change
      (config as any).notifyWatchers();
      
      expect(watcher1).toHaveBeenCalled();
      expect(watcher2).toHaveBeenCalled();
      
      // Unsubscribe first watcher
      unsubscribe1();
      jest.clearAllMocks();
      
      // Trigger another change
      (config as any).notifyWatchers();
      
      expect(watcher1).not.toHaveBeenCalled();
      expect(watcher2).toHaveBeenCalled();
    });
  });

  describe('JSON operations', () => {
    it('should export configuration as JSON with sensitive data masked', () => {
      const json = config.toJSON();
      const parsed = JSON.parse(json);
      
      expect(parsed.github.token).toBe('');
      expect(parsed.openai.apiKey).toBe('');
      expect(parsed.github.apiUrl).toBe('https://api.github.com');
    });

    it('should import configuration from JSON', async () => {
      const configJson = JSON.stringify({
        github: {
          token: 'ghp_imported_token',
          timeout: 25000
        },
        openai: {
          apiKey: 'sk-imported_key',
          temperature: 0.5
        }
      });
      
      await config.importFromJSON(configJson);
      
      const updatedConfig = config.getConfig();
      expect(updatedConfig.github.token).toBe('ghp_imported_token');
      expect(updatedConfig.github.timeout).toBe(25000);
      expect(updatedConfig.openai.apiKey).toBe('sk-imported_key');
      expect(updatedConfig.openai.temperature).toBe(0.5);
    });

    it('should handle invalid JSON during import', async () => {
      const invalidJson = '{ invalid json }';
      
      await expect(config.importFromJSON(invalidJson)).rejects.toThrow();
    });
  });

  describe('VS Code integration', () => {
    it('should load configuration from VS Code settings', () => {
      mockWorkspaceConfig.get.mockImplementation((key) => {
        if (key === 'github') {
          return { token: 'ghp_vscode_token', timeout: 35000 };
        }
        if (key === 'openai') {
          return { apiKey: 'sk-vscode_key', model: 'gpt-3.5-turbo' };
        }
        return {};
      });
      
      // Create new instance to trigger loading
      (Configuration as any).instance = undefined;
      const newConfig = Configuration.getInstance();
      
      const configData = newConfig.getConfig();
      expect(configData.github.token).toBe('ghp_vscode_token');
      expect(configData.github.timeout).toBe(35000);
      expect(configData.openai.apiKey).toBe('sk-vscode_key');
      expect(configData.openai.model).toBe('gpt-3.5-turbo');
      
      newConfig.dispose();
    });

    it('should setup configuration change listener', () => {
      expect(mockWorkspace.onDidChangeConfiguration).toHaveBeenCalled();
    });
  });
});

describe('ConfigurationUtils', () => {
  const mockConfig: EnvironmentConfig = {
    github: {
      token: 'test-token',
      apiUrl: 'https://api.github.com',
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      rateLimit: { requestsPerHour: 5000, burstLimit: 100 }
    },
    openai: {
      apiKey: 'test-key',
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 60000,
      maxRetries: 3,
      retryDelay: 2000
    },
    cache: {
      enabled: true,
      memoryLimit: 100,
      diskLimit: 500,
      defaultTTL: 3600,
      cleanupInterval: 300,
      cacheDirectory: '/cache'
    },
    generation: {
      maxRepositories: 10,
      analysisDepth: 3,
      includeTests: true,
      includeDocumentation: true,
      codeStyle: {
        indentation: 'spaces',
        indentSize: 2,
        lineEnding: 'lf',
        maxLineLength: 100
      },
      templates: {
        customTemplatesPath: '/templates',
        enableCustomTemplates: false
      }
    },
    ui: {
      theme: 'auto',
      showProgressDetails: true,
      autoRefresh: true,
      refreshInterval: 30,
      notifications: {
        showSuccess: true,
        showWarnings: true,
        showErrors: true
      }
    },
    performance: {
      maxConcurrentRequests: 5,
      requestTimeout: 30000,
      batchSize: 10,
      enableParallelProcessing: true,
      memoryThreshold: 512
    },
    logging: {
      level: 'info',
      enableFileLogging: false,
      logDirectory: '/logs',
      maxLogFiles: 10,
      maxLogSize: 10
    }
  };

  describe('getValue', () => {
    it('should get nested configuration values', () => {
      const value = ConfigurationUtils.getValue(mockConfig, 'github.timeout', 0);
      expect(value).toBe(30000);
    });

    it('should return default value for non-existent paths', () => {
      const value = ConfigurationUtils.getValue(mockConfig, 'nonexistent.path', 'default');
      expect(value).toBe('default');
    });

    it('should handle deep nested paths', () => {
      const value = ConfigurationUtils.getValue(mockConfig, 'generation.codeStyle.indentSize', 0);
      expect(value).toBe(2);
    });
  });

  describe('hasValue', () => {
    it('should return true for existing paths', () => {
      expect(ConfigurationUtils.hasValue(mockConfig, 'github.token')).toBe(true);
      expect(ConfigurationUtils.hasValue(mockConfig, 'generation.codeStyle.indentation')).toBe(true);
    });

    it('should return false for non-existent paths', () => {
      expect(ConfigurationUtils.hasValue(mockConfig, 'nonexistent.path')).toBe(false);
      expect(ConfigurationUtils.hasValue(mockConfig, 'github.nonexistent')).toBe(false);
    });
  });

  describe('mergeConfigs', () => {
    it('should merge configuration objects', () => {
      const override = {
        github: {
          timeout: 45000,
          maxRetries: 5
        },
        openai: {
          temperature: 0.8
        }
      };

      const merged = ConfigurationUtils.mergeConfigs(mockConfig, override);

      expect(merged.github.timeout).toBe(45000);
      expect(merged.github.maxRetries).toBe(5);
      expect(merged.github.token).toBe('test-token'); // Should preserve original
      expect(merged.openai.temperature).toBe(0.8);
      expect(merged.openai.model).toBe('gpt-4'); // Should preserve original
    });

    it('should handle primitive value overrides', () => {
      const override = {
        cache: {
          enabled: false
        }
      };

      const merged = ConfigurationUtils.mergeConfigs(mockConfig, override);

      expect(merged.cache.enabled).toBe(false);
      expect(merged.cache.memoryLimit).toBe(100); // Should preserve original
    });
  });

  describe('createBackup', () => {
    it('should create a configuration backup with masked sensitive data', () => {
      const backup = ConfigurationUtils.createBackup(mockConfig);
      const parsed = JSON.parse(backup);

      expect(parsed.github.token).toBe('***');
      expect(parsed.openai.apiKey).toBe('***');
      expect(parsed.github.apiUrl).toBe('https://api.github.com');
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.version).toBe('1.0.0');
    });

    it('should handle empty sensitive fields', () => {
      const configWithEmptySecrets = {
        ...mockConfig,
        github: { ...mockConfig.github, token: '' },
        openai: { ...mockConfig.openai, apiKey: '' }
      };

      const backup = ConfigurationUtils.createBackup(configWithEmptySecrets);
      const parsed = JSON.parse(backup);

      expect(parsed.github.token).toBe('');
      expect(parsed.openai.apiKey).toBe('');
    });
  });
});