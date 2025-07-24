import * as vscode from 'vscode';
import { ErrorHandler, ERROR_CODES, ErrorSeverity } from '../utils/ErrorHandler';

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  github: GitHubConfig;
  openai: OpenAIConfig;
  cache: CacheConfig;
  generation: GenerationConfig;
  ui: UIConfig;
  performance: PerformanceConfig;
  logging: LoggingConfig;
}

/**
 * GitHub API configuration
 */
export interface GitHubConfig {
  token: string;
  apiUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  rateLimit: {
    requestsPerHour: number;
    burstLimit: number;
  };
}

/**
 * OpenAI API configuration
 */
export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean;
  memoryLimit: number; // MB
  diskLimit: number; // MB
  defaultTTL: number; // seconds
  cleanupInterval: number; // seconds
  cacheDirectory: string;
}

/**
 * Code generation configuration
 */
export interface GenerationConfig {
  maxRepositories: number;
  analysisDepth: number;
  includeTests: boolean;
  includeDocumentation: boolean;
  codeStyle: {
    indentation: 'spaces' | 'tabs';
    indentSize: number;
    lineEnding: 'lf' | 'crlf';
    maxLineLength: number;
  };
  templates: {
    customTemplatesPath: string;
    enableCustomTemplates: boolean;
  };
}

/**
 * UI configuration
 */
export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  showProgressDetails: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  notifications: {
    showSuccess: boolean;
    showWarnings: boolean;
    showErrors: boolean;
  };
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  maxConcurrentRequests: number;
  requestTimeout: number;
  batchSize: number;
  enableParallelProcessing: boolean;
  memoryThreshold: number; // MB
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableFileLogging: boolean;
  logDirectory: string;
  maxLogFiles: number;
  maxLogSize: number; // MB
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Centralized configuration manager using singleton pattern
 */
export class Configuration {
  private static instance: Configuration;
  private config: EnvironmentConfig;
  private watchers: ((config: EnvironmentConfig) => void)[] = [];
  private configChangeListener?: vscode.Disposable;

  private constructor() {
    this.config = this.loadDefaultConfig();
    this.loadFromVSCodeSettings();
    this.setupConfigWatcher();
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): Configuration {
    if (!this.instance) {
      this.instance = new Configuration();
    }
    return this.instance;
  }

  /**
   * Get the current configuration
   */
  getConfig(): EnvironmentConfig {
    return { ...this.config }; // Return a copy to prevent mutations
  }

  /**
   * Get a specific configuration section
   */
  getSection<T extends keyof EnvironmentConfig>(section: T): EnvironmentConfig[T] {
    return { ...this.config[section] };
  }

  /**
   * Update configuration
   */
  async updateConfig(updates: Partial<EnvironmentConfig>): Promise<void> {
    try {
      // Validate the updates
      const tempConfig = { ...this.config, ...updates };
      const validation = this.validateConfig(tempConfig);
      
      if (!validation.isValid) {
        throw ErrorHandler.createError(
          ERROR_CODES.INVALID_CONFIG,
          `Configuration validation failed: ${validation.errors.join(', ')}`,
          'Configuration.updateConfig',
          ErrorSeverity.MEDIUM,
          { errors: validation.errors, warnings: validation.warnings }
        );
      }

      // Apply updates
      this.config = tempConfig;
      
      // Save to VS Code settings
      await this.saveToVSCodeSettings(updates);
      
      // Notify watchers
      this.notifyWatchers();
      
    } catch (error) {
      ErrorHandler.handle(error, 'Configuration.updateConfig');
    }
  }

  /**
   * Update a specific configuration section
   */
  async updateSection<T extends keyof EnvironmentConfig>(
    section: T,
    updates: Partial<EnvironmentConfig[T]>
  ): Promise<void> {
    const sectionConfig = { ...this.config[section], ...updates };
    await this.updateConfig({ [section]: sectionConfig } as Partial<EnvironmentConfig>);
  }

  /**
   * Reset configuration to defaults
   */
  async resetToDefaults(): Promise<void> {
    this.config = this.loadDefaultConfig();
    await this.saveAllToVSCodeSettings();
    this.notifyWatchers();
  }

  /**
   * Validate the current configuration
   */
  validateCurrentConfig(): ConfigValidationResult {
    return this.validateConfig(this.config);
  }

  /**
   * Add a configuration change watcher
   */
  addWatcher(callback: (config: EnvironmentConfig) => void): () => void {
    this.watchers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.watchers.indexOf(callback);
      if (index > -1) {
        this.watchers.splice(index, 1);
      }
    };
  }

  /**
   * Get configuration as JSON string
   */
  toJSON(): string {
    // Remove sensitive information
    const safeConfig = { ...this.config };
    safeConfig.github.token = safeConfig.github.token ? '***' : '';
    safeConfig.openai.apiKey = safeConfig.openai.apiKey ? '***' : '';
    
    return JSON.stringify(safeConfig, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  async importFromJSON(jsonString: string): Promise<void> {
    try {
      const importedConfig = JSON.parse(jsonString) as Partial<EnvironmentConfig>;
      await this.updateConfig(importedConfig);
    } catch (error) {
      ErrorHandler.handle(
        new Error(`Failed to import configuration: ${error}`),
        'Configuration.importFromJSON'
      );
    }
  }

  /**
   * Export configuration to file
   */
  async exportToFile(filePath: string): Promise<void> {
    try {
      const fs = require('fs').promises;
      await fs.writeFile(filePath, this.toJSON(), 'utf8');
    } catch (error) {
      ErrorHandler.handle(
        new Error(`Failed to export configuration: ${error}`),
        'Configuration.exportToFile'
      );
    }
  }

  /**
   * Import configuration from file
   */
  async importFromFile(filePath: string): Promise<void> {
    try {
      const fs = require('fs').promises;
      const jsonString = await fs.readFile(filePath, 'utf8');
      await this.importFromJSON(jsonString);
    } catch (error) {
      ErrorHandler.handle(
        new Error(`Failed to import configuration from file: ${error}`),
        'Configuration.importFromFile'
      );
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.configChangeListener) {
      this.configChangeListener.dispose();
    }
    this.watchers = [];
  }

  /**
   * Load default configuration
   */
  private loadDefaultConfig(): EnvironmentConfig {
    return {
      github: {
        token: '',
        apiUrl: 'https://api.github.com',
        timeout: 30000,
        maxRetries: 3,
        retryDelay: 1000,
        rateLimit: {
          requestsPerHour: 5000,
          burstLimit: 100
        }
      },
      openai: {
        apiKey: '',
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
        cacheDirectory: ''
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
          customTemplatesPath: '',
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
        logDirectory: '',
        maxLogFiles: 10,
        maxLogSize: 10
      }
    };
  }

  /**
   * Load configuration from VS Code settings
   */
  private loadFromVSCodeSettings(): void {
    const config = vscode.workspace.getConfiguration('githubStyleAgent');
    
    // Load each section
    this.loadGitHubConfig(config);
    this.loadOpenAIConfig(config);
    this.loadCacheConfig(config);
    this.loadGenerationConfig(config);
    this.loadUIConfig(config);
    this.loadPerformanceConfig(config);
    this.loadLoggingConfig(config);
  }

  /**
   * Load GitHub configuration from VS Code settings
   */
  private loadGitHubConfig(config: vscode.WorkspaceConfiguration): void {
    const github = config.get('github', {});
    this.config.github = {
      ...this.config.github,
      ...github
    };
  }

  /**
   * Load OpenAI configuration from VS Code settings
   */
  private loadOpenAIConfig(config: vscode.WorkspaceConfiguration): void {
    const openai = config.get('openai', {});
    this.config.openai = {
      ...this.config.openai,
      ...openai
    };
  }

  /**
   * Load cache configuration from VS Code settings
   */
  private loadCacheConfig(config: vscode.WorkspaceConfiguration): void {
    const cache = config.get('cache', {});
    this.config.cache = {
      ...this.config.cache,
      ...cache
    };
  }

  /**
   * Load generation configuration from VS Code settings
   */
  private loadGenerationConfig(config: vscode.WorkspaceConfiguration): void {
    const generation = config.get('generation', {});
    this.config.generation = {
      ...this.config.generation,
      ...generation
    };
  }

  /**
   * Load UI configuration from VS Code settings
   */
  private loadUIConfig(config: vscode.WorkspaceConfiguration): void {
    const ui = config.get('ui', {});
    this.config.ui = {
      ...this.config.ui,
      ...ui
    };
  }

  /**
   * Load performance configuration from VS Code settings
   */
  private loadPerformanceConfig(config: vscode.WorkspaceConfiguration): void {
    const performance = config.get('performance', {});
    this.config.performance = {
      ...this.config.performance,
      ...performance
    };
  }

  /**
   * Load logging configuration from VS Code settings
   */
  private loadLoggingConfig(config: vscode.WorkspaceConfiguration): void {
    const logging = config.get('logging', {});
    this.config.logging = {
      ...this.config.logging,
      ...logging
    };
  }

  /**
   * Save configuration updates to VS Code settings
   */
  private async saveToVSCodeSettings(updates: Partial<EnvironmentConfig>): Promise<void> {
    const config = vscode.workspace.getConfiguration('githubStyleAgent');
    
    for (const [section, values] of Object.entries(updates)) {
      if (values && typeof values === 'object') {
        for (const [key, value] of Object.entries(values)) {
          await config.update(`${section}.${key}`, value, vscode.ConfigurationTarget.Global);
        }
      }
    }
  }

  /**
   * Save all configuration to VS Code settings
   */
  private async saveAllToVSCodeSettings(): Promise<void> {
    await this.saveToVSCodeSettings(this.config);
  }

  /**
   * Setup configuration change watcher
   */
  private setupConfigWatcher(): void {
    this.configChangeListener = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('githubStyleAgent')) {
        this.loadFromVSCodeSettings();
        this.notifyWatchers();
      }
    });
  }

  /**
   * Notify all watchers of configuration changes
   */
  private notifyWatchers(): void {
    for (const watcher of this.watchers) {
      try {
        watcher(this.getConfig());
      } catch (error) {
        console.error('Error in configuration watcher:', error);
      }
    }
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: EnvironmentConfig): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate GitHub configuration
    if (!config.github.token) {
      errors.push('GitHub token is required');
    } else if (!config.github.token.startsWith('ghp_') && !config.github.token.startsWith('github_pat_')) {
      errors.push('Invalid GitHub token format');
    }

    if (config.github.timeout < 1000) {
      warnings.push('GitHub timeout is very low, may cause request failures');
    }

    // Validate OpenAI configuration
    if (!config.openai.apiKey) {
      errors.push('OpenAI API key is required');
    } else if (!config.openai.apiKey.startsWith('sk-')) {
      errors.push('Invalid OpenAI API key format');
    }

    if (config.openai.maxTokens < 100) {
      warnings.push('OpenAI max tokens is very low, may affect generation quality');
    }

    // Validate cache configuration
    if (config.cache.memoryLimit < 10) {
      warnings.push('Memory cache limit is very low, may affect performance');
    }

    if (config.cache.diskLimit < 50) {
      warnings.push('Disk cache limit is very low, may affect performance');
    }

    // Validate generation configuration
    if (config.generation.maxRepositories < 1) {
      errors.push('Maximum repositories must be at least 1');
    }

    if (config.generation.maxRepositories > 50) {
      warnings.push('High repository count may cause performance issues');
    }

    // Validate performance configuration
    if (config.performance.maxConcurrentRequests < 1) {
      errors.push('Maximum concurrent requests must be at least 1');
    }

    if (config.performance.maxConcurrentRequests > 20) {
      warnings.push('High concurrent request count may cause rate limiting');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Utility functions for configuration management
 */
export class ConfigurationUtils {
  /**
   * Get a configuration value with type safety
   */
  static getValue<T>(
    config: EnvironmentConfig,
    path: string,
    defaultValue: T
  ): T {
    const keys = path.split('.');
    let value: any = config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Check if a configuration path exists
   */
  static hasValue(config: EnvironmentConfig, path: string): boolean {
    const keys = path.split('.');
    let value: any = config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return false;
      }
    }
    
    return value !== undefined;
  }

  /**
   * Merge configuration objects
   */
  static mergeConfigs(
    base: EnvironmentConfig,
    override: Partial<EnvironmentConfig>
  ): EnvironmentConfig {
    const merged = { ...base };
    
    for (const [key, value] of Object.entries(override)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        merged[key as keyof EnvironmentConfig] = {
          ...merged[key as keyof EnvironmentConfig],
          ...value
        } as any;
      } else {
        merged[key as keyof EnvironmentConfig] = value as any;
      }
    }
    
    return merged;
  }

  /**
   * Create a configuration backup
   */
  static createBackup(config: EnvironmentConfig): string {
    const backup = {
      ...config,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    // Remove sensitive data
    backup.github.token = backup.github.token ? '***' : '';
    backup.openai.apiKey = backup.openai.apiKey ? '***' : '';
    
    return JSON.stringify(backup, null, 2);
  }
}

/**
 * Global configuration instance
 */
export const config = Configuration.getInstance();