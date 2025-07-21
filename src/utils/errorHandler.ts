/**
 * Centralized error handling utilities
 */

import { ApiError, AnalysisError, Result, AsyncResult } from '../types';

/**
 * Creates a standardized API error
 */
export function createApiError(
  message: string,
  code: string,
  statusCode?: number | undefined,
  details?: unknown
): ApiError {
  return {
    message,
    code,
    ...(statusCode !== undefined && { statusCode }),
    ...(details !== undefined && { details }),
  };
}

/**
 * Creates a standardized analysis error
 */
export function createAnalysisError(
  message: string,
  code: string,
  step: 'fetch' | 'parse' | 'analyze',
  repository?: string | undefined,
  file?: string | undefined,
  statusCode?: number | undefined,
  details?: unknown
): AnalysisError {
  return {
    message,
    code,
    step,
    ...(statusCode !== undefined && { statusCode }),
    ...(details !== undefined && { details }),
    ...(repository !== undefined && { repository }),
    ...(file !== undefined && { file }),
  };
}

/**
 * Wraps a function to return a Result type instead of throwing
 */
export function safeExecute<T>(
  fn: () => T,
  errorCode = 'EXECUTION_ERROR'
): Result<T> {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    const apiError = createApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      errorCode,
      undefined,
      error
    );
    return { success: false, error: apiError };
  }
}

/**
 * Wraps an async function to return an AsyncResult type instead of throwing
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  errorCode = 'ASYNC_EXECUTION_ERROR'
): AsyncResult<T> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const apiError = createApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      errorCode,
      undefined,
      error
    );
    return { success: false, error: apiError };
  }
}

/**
 * Logs errors in a consistent format
 */
export function logError(
  error: ApiError | AnalysisError,
  context?: string
): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';

  console.error(
    `[${timestamp}]${contextStr} Error ${error.code}: ${error.message}`
  );

  if ('repository' in error && error.repository) {
    console.error(`  Repository: ${error.repository}`);
  }

  if ('file' in error && error.file) {
    console.error(`  File: ${error.file}`);
  }

  if ('step' in error) {
    console.error(`  Step: ${error.step}`);
  }

  if (error.statusCode) {
    console.error(`  Status Code: ${error.statusCode}`);
  }

  if (error.details && process.env.DEBUG === 'true') {
    console.error('  Details:', error.details);
  }
}

/**
 * Handles GitHub API errors specifically
 */
export function handleGitHubError(
  error: unknown,
  repository?: string
): ApiError {
  if (error && typeof error === 'object' && 'status' in error) {
    const githubError = error as { status: number; message?: string };

    switch (githubError.status) {
      case 401:
        return createApiError(
          'GitHub authentication failed. Please check your token.',
          'GITHUB_AUTH_ERROR',
          401,
          error
        );
      case 403:
        return createApiError(
          'GitHub API rate limit exceeded or insufficient permissions.',
          'GITHUB_RATE_LIMIT',
          403,
          error
        );
      case 404:
        return createApiError(
          `Repository not found: ${repository || 'unknown'}`,
          'GITHUB_NOT_FOUND',
          404,
          error
        );
      default:
        return createApiError(
          `GitHub API error: ${githubError.message || 'Unknown error'}`,
          'GITHUB_API_ERROR',
          githubError.status,
          error
        );
    }
  }

  return createApiError(
    error instanceof Error ? error.message : 'Unknown GitHub error',
    'GITHUB_UNKNOWN_ERROR',
    undefined,
    error
  );
}

/**
 * Handles OpenAI API errors specifically
 */
export function handleOpenAIError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'status' in error) {
    const openaiError = error as { status: number; message?: string };

    switch (openaiError.status) {
      case 401:
        return createApiError(
          'OpenAI authentication failed. Please check your API key.',
          'OPENAI_AUTH_ERROR',
          401,
          error
        );
      case 429:
        return createApiError(
          'OpenAI API rate limit exceeded. Please try again later.',
          'OPENAI_RATE_LIMIT',
          429,
          error
        );
      case 400:
        return createApiError(
          'Invalid request to OpenAI API. Please check your input.',
          'OPENAI_BAD_REQUEST',
          400,
          error
        );
      default:
        return createApiError(
          `OpenAI API error: ${openaiError.message || 'Unknown error'}`,
          'OPENAI_API_ERROR',
          openaiError.status,
          error
        );
    }
  }

  return createApiError(
    error instanceof Error ? error.message : 'Unknown OpenAI error',
    'OPENAI_UNKNOWN_ERROR',
    undefined,
    error
  );
}

/**
 * Validates environment configuration and returns errors if any
 */
export function validateEnvironment(): ApiError[] {
  const errors: ApiError[] = [];

  if (!process.env.GITHUB_TOKEN) {
    errors.push(
      createApiError(
        'GITHUB_TOKEN environment variable is required',
        'MISSING_GITHUB_TOKEN'
      )
    );
  }

  if (!process.env.GITHUB_USERNAME) {
    errors.push(
      createApiError(
        'GITHUB_USERNAME environment variable is required',
        'MISSING_GITHUB_USERNAME'
      )
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    errors.push(
      createApiError(
        'OPENAI_API_KEY environment variable is required',
        'MISSING_OPENAI_API_KEY'
      )
    );
  }

  return errors;
}
