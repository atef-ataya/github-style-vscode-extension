// src/templates/generators/GeneratorFactory.ts
import { BaseGenerator, GenerationConfig } from './BaseGenerator';
import { ExpressGenerator } from './ExpressGenerator';
import { ReactGenerator } from './ReactGenerator';
import { CustomGenerator } from './CustomGenerator';

export type GeneratorType = 'express-api' | 'react-app' | 'custom';

export interface GeneratorInfo {
  type: GeneratorType;
  name: string;
  description: string;
  features: string[];
  defaultDependencies: string[];
  defaultDevDependencies: string[];
}

/**
 * Factory class for creating project generators
 * Implements the factory pattern for generator instantiation
 */
export class GeneratorFactory {
  private static readonly GENERATOR_INFO: Record<GeneratorType, GeneratorInfo> = {
    'express-api': {
      type: 'express-api',
      name: 'Express.js API',
      description: 'RESTful API server built with Express.js',
      features: ['REST API', 'Middleware Support', 'Error Handling', 'CORS', 'Security Headers'],
      defaultDependencies: ['express', 'cors', 'helmet', 'dotenv'],
      defaultDevDependencies: ['nodemon', 'jest', '@types/express', '@types/cors', 'typescript']
    },
    'react-app': {
      type: 'react-app',
      name: 'React Application',
      description: 'Modern React application with TypeScript',
      features: ['React 18', 'TypeScript', 'CSS Modules', 'ESLint', 'Prettier'],
      defaultDependencies: ['react', 'react-dom'],
      defaultDevDependencies: ['@types/react', '@types/react-dom', 'typescript', 'vite', '@vitejs/plugin-react']
    },
    'custom': {
      type: 'custom',
      name: 'Custom Project',
      description: 'Custom project with user-defined structure',
      features: ['Flexible Structure', 'Custom Templates'],
      defaultDependencies: [],
      defaultDevDependencies: []
    }
  };

  /**
   * Create a generator instance based on type
   */
  static create(type: GeneratorType, config: GenerationConfig): BaseGenerator {
    // Merge default dependencies with user-provided ones
    const generatorInfo = this.GENERATOR_INFO[type];
    if (generatorInfo) {
      config.dependencies = [
        ...generatorInfo.defaultDependencies,
        ...(config.dependencies || [])
      ];
      config.devDependencies = [
        ...generatorInfo.defaultDevDependencies,
        ...(config.devDependencies || [])
      ];
    }

    switch (type) {
      case 'express-api':
        return new ExpressGenerator(config);
      case 'react-app':
        return new ReactGenerator(config);
      case 'custom':
        return new CustomGenerator(config);
      default:
        throw new Error(`Unknown generator type: ${type}`);
    }
  }

  /**
   * Get information about a specific generator type
   */
  static getGeneratorInfo(type: GeneratorType): GeneratorInfo {
    const info = this.GENERATOR_INFO[type];
    if (!info) {
      throw new Error(`Unknown generator type: ${type}`);
    }
    return { ...info }; // Return a copy to prevent mutation
  }

  /**
   * Get all available generator types
   */
  static getAvailableGenerators(): GeneratorInfo[] {
    return Object.values(this.GENERATOR_INFO).map(info => ({ ...info }));
  }

  /**
   * Check if a generator type is supported
   */
  static isSupported(type: string): type is GeneratorType {
    return type in this.GENERATOR_INFO;
  }

  /**
   * Validate generator configuration
   */
  static validateConfig(type: GeneratorType, config: GenerationConfig): string[] {
    const errors: string[] = [];

    if (!config.projectName?.trim()) {
      errors.push('Project name is required');
    }

    if (!config.styleProfile) {
      errors.push('Style profile is required');
    }

    // Type-specific validations
    switch (type) {
      case 'express-api':
        // Express-specific validations can be added here
        break;
      case 'react-app':
        // React-specific validations can be added here
        break;
      case 'custom':
        // Custom project validations can be added here
        break;
    }

    return errors;
  }

  /**
   * Create a generator with validation
   */
  static createWithValidation(type: GeneratorType, config: GenerationConfig): BaseGenerator {
    const errors = this.validateConfig(type, config);
    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    return this.create(type, config);
  }
}