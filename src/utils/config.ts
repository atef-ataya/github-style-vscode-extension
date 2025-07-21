/**
 * Configuration management utilities
 */

import * as dotenv from 'dotenv';

import { EnvironmentConfig, DEFAULT_CONFIG } from '../types';

import { validateEnvironment, logError } from './errorHandler';

// Load environment variables
dotenv.config();

/**
 * Gets the current environment configuration
 */
export function getConfig(): EnvironmentConfig {
  // Validate required environment variables
  const validationErrors = validateEnvironment();
  if (validationErrors.length > 0) {
    validationErrors.forEach(error => logError(error, 'CONFIG'));
    throw new Error(
      'Missing required environment variables. Check your .env file.'
    );
  }

  return {
    githubToken: process.env.GITHUB_TOKEN!,
    githubUsername: process.env.GITHUB_USERNAME!,
    openaiApiKey: process.env.OPENAI_API_KEY!,
    openaiModel: process.env.OPENAI_MODEL || DEFAULT_CONFIG.openaiModel!,
    maxReposToAnalyze: parseInt(
      process.env.MAX_REPOS_TO_ANALYZE ||
        String(DEFAULT_CONFIG.maxReposToAnalyze!),
      10
    ),
    analysisDepth:
      (process.env.ANALYSIS_DEPTH as 'basic' | 'detailed') ||
      DEFAULT_CONFIG.analysisDepth!,
    apiTimeout: parseInt(
      process.env.API_TIMEOUT || String(DEFAULT_CONFIG.apiTimeout!),
      10
    ),
    debug: process.env.DEBUG === 'true' || DEFAULT_CONFIG.debug!,
    cacheDir: process.env.CACHE_DIR || DEFAULT_CONFIG.cacheDir!,
  };
}

/**
 * Validates configuration values
 */
export function validateConfig(config: EnvironmentConfig): string[] {
  const errors: string[] = [];

  // Validate GitHub token format
  if (
    !config.githubToken.startsWith('ghp_') &&
    !config.githubToken.startsWith('github_pat_')
  ) {
    errors.push('GITHUB_TOKEN should start with "ghp_" or "github_pat_"');
  }

  // Validate OpenAI API key format
  if (!config.openaiApiKey.startsWith('sk-')) {
    errors.push('OPENAI_API_KEY should start with "sk-"');
  }

  // Validate numeric values
  if (
    config.maxReposToAnalyze &&
    (config.maxReposToAnalyze < 1 || config.maxReposToAnalyze > 100)
  ) {
    errors.push('MAX_REPOS_TO_ANALYZE should be between 1 and 100');
  }

  if (
    config.apiTimeout &&
    (config.apiTimeout < 1000 || config.apiTimeout > 300000)
  ) {
    errors.push('API_TIMEOUT should be between 1000 and 300000 milliseconds');
  }

  // Validate analysis depth
  if (
    config.analysisDepth &&
    !['basic', 'detailed'].includes(config.analysisDepth)
  ) {
    errors.push('ANALYSIS_DEPTH should be either "basic" or "detailed"');
  }

  return errors;
}

/**
 * Gets a safe configuration object (without sensitive data) for logging
 */
export function getSafeConfig(
  config: EnvironmentConfig
): Record<string, unknown> {
  const safeConfig: Record<string, unknown> = {
    githubUsername: config.githubUsername,
    openaiModel: config.openaiModel,
    maxReposToAnalyze: config.maxReposToAnalyze,
    analysisDepth: config.analysisDepth,
    apiTimeout: config.apiTimeout,
    debug: config.debug,
    cacheDir: config.cacheDir,
  };

  // Add redacted sensitive fields
  if (config.githubToken) {
    safeConfig.githubToken = '[REDACTED]';
  }
  if (config.openaiApiKey) {
    safeConfig.openaiApiKey = '[REDACTED]';
  }

  return safeConfig;
}

/**
 * Logs the current configuration (safely)
 */
export function logConfig(): void {
  try {
    const config = getConfig();
    const safeConfig = getSafeConfig(config);

    if (config.debug) {
      console.log(
        'Current configuration:',
        JSON.stringify(safeConfig, null, 2)
      );
    }

    // Validate configuration
    const configErrors = validateConfig(config);
    if (configErrors.length > 0) {
      console.warn('Configuration warnings:');
      configErrors.forEach(error => console.warn(`  - ${error}`));
    }
  } catch (error) {
    console.error('Failed to load configuration:', error);
  }
}

/**
 * Creates a sample .env file content
 */
export function generateEnvTemplate(): string {
  return `# GitHub Configuration
# Create a personal access token at: https://github.com/settings/tokens
# Required scopes: repo (for private repos) or public_repo (for public repos only)
GITHUB_TOKEN=ghp_your_github_personal_access_token_here

# Your GitHub username
GITHUB_USERNAME=your-github-username

# OpenAI Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_openai_api_key_here

# Optional: OpenAI model to use (default: gpt-3.5-turbo)
# OPENAI_MODEL=gpt-4

# Analysis Configuration
# Maximum number of repositories to analyze (default: 20)
MAX_REPOS_TO_ANALYZE=20

# Analysis depth: 'basic' or 'detailed' (default: detailed)
ANALYSIS_DEPTH=detailed

# Optional: Timeout for API requests in milliseconds (default: 30000)
# API_TIMEOUT=30000

# Optional: Enable debug logging (default: false)
# DEBUG=true

# Optional: Cache directory for storing analysis results (default: ./cache)
# CACHE_DIR=./cache
`;
}

// Initialize configuration logging on module load
if (process.env.NODE_ENV !== 'test') {
  logConfig();
}
