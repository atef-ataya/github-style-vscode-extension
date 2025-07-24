/**
 * Centralized error handling system for the GitHub Style Agent
 * Provides consistent error formatting, logging, and user-friendly messages
 */

/**
 * Standard API error interface
 */
export interface ApiError {
  code: string;
  message: string;
  context: string;
  timestamp: Date;
  severity: ErrorSeverity;
  details?: Record<string, any>;
  stack?: string;
  userMessage?: string;
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories for better classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  API = 'api',
  FILE_SYSTEM = 'file_system',
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  PARSING = 'parsing',
  GENERATION = 'generation',
  CONFIGURATION = 'configuration',
  UNKNOWN = 'unknown'
}

/**
 * Error codes for specific error types
 */
export const ERROR_CODES = {
  // Validation errors
  INVALID_TOKEN: 'INVALID_TOKEN',
  INVALID_API_KEY: 'INVALID_API_KEY',
  INVALID_USERNAME: 'INVALID_USERNAME',
  INVALID_CONFIG: 'INVALID_CONFIG',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
  
  // API errors
  API_ERROR: 'API_ERROR',
  GITHUB_API_ERROR: 'GITHUB_API_ERROR',
  OPENAI_API_ERROR: 'OPENAI_API_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  
  // File system errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_ACCESS_DENIED: 'FILE_ACCESS_DENIED',
  DIRECTORY_NOT_FOUND: 'DIRECTORY_NOT_FOUND',
  DISK_FULL: 'DISK_FULL',
  
  // Generation errors
  GENERATION_FAILED: 'GENERATION_FAILED',
  TEMPLATE_ERROR: 'TEMPLATE_ERROR',
  PARSING_ERROR: 'PARSING_ERROR',
  
  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

/**
 * Centralized error handler class
 */
export class ErrorHandler {
  private static errorLog: ApiError[] = [];
  private static maxLogSize = 1000;
  private static onError?: (error: ApiError) => void;

  /**
   * Set a global error callback
   */
  static setErrorCallback(callback: (error: ApiError) => void): void {
    this.onError = callback;
  }

  /**
   * Handle an error and throw a normalized ApiError
   */
  static handle(error: unknown, context: string, category?: ErrorCategory): never {
    const apiError = this.normalizeError(error, context, category);
    this.logError(apiError);
    
    if (this.onError) {
      this.onError(apiError);
    }
    
    throw apiError;
  }

  /**
   * Handle an error without throwing (for logging purposes)
   */
  static handleSilent(error: unknown, context: string, category?: ErrorCategory): ApiError {
    const apiError = this.normalizeError(error, context, category);
    this.logError(apiError);
    
    if (this.onError) {
      this.onError(apiError);
    }
    
    return apiError;
  }

  /**
   * Create a new ApiError
   */
  static createError(
    code: string,
    message: string,
    context: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: Record<string, any>,
    userMessage?: string
  ): ApiError {
    return {
      code,
      message,
      context,
      timestamp: new Date(),
      severity,
      details,
      userMessage: userMessage || this.getUserFriendlyMessage(code, message)
    };
  }

  /**
   * Normalize any error to ApiError format
   */
  private static normalizeError(
    error: unknown,
    context: string,
    category?: ErrorCategory
  ): ApiError {
    // If already an ApiError, return as is
    if (this.isApiError(error)) {
      return { ...error, context: error.context || context };
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      const code = this.determineErrorCode(error, category);
      const severity = this.determineSeverity(error, category);
      
      return {
        code,
        message: error.message,
        context,
        timestamp: new Date(),
        severity,
        stack: error.stack,
        userMessage: this.getUserFriendlyMessage(code, error.message)
      };
    }

    // Handle HTTP errors
    if (this.isHttpError(error)) {
      const code = this.getHttpErrorCode(error.status);
      const severity = error.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
      
      return {
        code,
        message: error.message || `HTTP ${error.status}`,
        context,
        timestamp: new Date(),
        severity,
        details: { status: error.status, statusText: error.statusText },
        userMessage: this.getUserFriendlyMessage(code, error.message)
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        code: ERROR_CODES.UNKNOWN_ERROR,
        message: error,
        context,
        timestamp: new Date(),
        severity: ErrorSeverity.MEDIUM,
        userMessage: this.getUserFriendlyMessage(ERROR_CODES.UNKNOWN_ERROR, error)
      };
    }

    // Handle unknown error types
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: 'An unknown error occurred',
      context,
      timestamp: new Date(),
      severity: ErrorSeverity.MEDIUM,
      details: { originalError: error },
      userMessage: 'An unexpected error occurred. Please try again.'
    };
  }

  /**
   * Log an error to the internal log
   */
  private static logError(error: ApiError): void {
    // Add to error log
    this.errorLog.push(error);
    
    // Maintain log size limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Console logging based on severity
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error(`[${error.code}] ${error.context}: ${error.message}`, error.details);
        if (error.stack) {
          console.error(error.stack);
        }
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(`[${error.code}] ${error.context}: ${error.message}`, error.details);
        break;
      case ErrorSeverity.LOW:
        console.info(`[${error.code}] ${error.context}: ${error.message}`);
        break;
    }
  }

  /**
   * Get recent errors from the log
   */
  static getRecentErrors(count: number = 10): ApiError[] {
    return this.errorLog.slice(-count);
  }

  /**
   * Get errors by severity
   */
  static getErrorsBySeverity(severity: ErrorSeverity): ApiError[] {
    return this.errorLog.filter(error => error.severity === severity);
  }

  /**
   * Clear the error log
   */
  static clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): ErrorStats {
    const stats: ErrorStats = {
      total: this.errorLog.length,
      bySeverity: {
        [ErrorSeverity.LOW]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.CRITICAL]: 0
      },
      byCode: {},
      recent: this.errorLog.slice(-5)
    };

    for (const error of this.errorLog) {
      stats.bySeverity[error.severity]++;
      stats.byCode[error.code] = (stats.byCode[error.code] || 0) + 1;
    }

    return stats;
  }

  /**
   * Check if an object is an ApiError
   */
  private static isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      'context' in error &&
      'timestamp' in error &&
      'severity' in error
    );
  }

  /**
   * Check if an object is an HTTP error
   */
  private static isHttpError(error: unknown): error is { status: number; statusText?: string; message?: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as any).status === 'number'
    );
  }

  /**
   * Determine error code based on error type and category
   */
  private static determineErrorCode(error: Error, category?: ErrorCategory): string {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_CODES.NETWORK_ERROR;
    }
    if (message.includes('timeout')) {
      return ERROR_CODES.TIMEOUT;
    }
    if (message.includes('connection refused')) {
      return ERROR_CODES.CONNECTION_REFUSED;
    }
    
    // File system errors
    if (message.includes('enoent') || message.includes('file not found')) {
      return ERROR_CODES.FILE_NOT_FOUND;
    }
    if (message.includes('eacces') || message.includes('permission denied')) {
      return ERROR_CODES.FILE_ACCESS_DENIED;
    }
    if (message.includes('enospc') || message.includes('disk full')) {
      return ERROR_CODES.DISK_FULL;
    }
    
    // API errors
    if (message.includes('unauthorized') || message.includes('401')) {
      return ERROR_CODES.UNAUTHORIZED;
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return ERROR_CODES.FORBIDDEN;
    }
    if (message.includes('not found') || message.includes('404')) {
      return ERROR_CODES.NOT_FOUND;
    }
    if (message.includes('rate limit')) {
      return ERROR_CODES.RATE_LIMITED;
    }
    
    // Category-based codes
    if (category) {
      switch (category) {
        case ErrorCategory.VALIDATION:
          return ERROR_CODES.INVALID_CONFIG;
        case ErrorCategory.NETWORK:
          return ERROR_CODES.NETWORK_ERROR;
        case ErrorCategory.API:
          return ERROR_CODES.API_ERROR;
        case ErrorCategory.FILE_SYSTEM:
          return ERROR_CODES.FILE_NOT_FOUND;
        case ErrorCategory.GENERATION:
          return ERROR_CODES.GENERATION_FAILED;
        default:
          return ERROR_CODES.INTERNAL_ERROR;
      }
    }
    
    return ERROR_CODES.INTERNAL_ERROR;
  }

  /**
   * Determine error severity
   */
  private static determineSeverity(error: Error, category?: ErrorCategory): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    // Critical errors
    if (message.includes('critical') || message.includes('fatal')) {
      return ErrorSeverity.CRITICAL;
    }
    
    // High severity errors
    if (message.includes('unauthorized') || message.includes('forbidden') ||
        message.includes('disk full') || message.includes('out of memory')) {
      return ErrorSeverity.HIGH;
    }
    
    // Low severity errors
    if (message.includes('warning') || message.includes('deprecated')) {
      return ErrorSeverity.LOW;
    }
    
    return ErrorSeverity.MEDIUM;
  }

  /**
   * Get HTTP error code based on status
   */
  private static getHttpErrorCode(status: number): string {
    switch (status) {
      case 401:
        return ERROR_CODES.UNAUTHORIZED;
      case 403:
        return ERROR_CODES.FORBIDDEN;
      case 404:
        return ERROR_CODES.NOT_FOUND;
      case 429:
        return ERROR_CODES.RATE_LIMITED;
      default:
        return status >= 500 ? ERROR_CODES.API_ERROR : ERROR_CODES.NETWORK_ERROR;
    }
  }

  /**
   * Get user-friendly error message
   */
  private static getUserFriendlyMessage(code: string, originalMessage: string): string {
    const userMessages: Record<string, string> = {
      [ERROR_CODES.INVALID_TOKEN]: 'Please check your GitHub token and try again.',
      [ERROR_CODES.INVALID_API_KEY]: 'Please check your OpenAI API key and try again.',
      [ERROR_CODES.INVALID_USERNAME]: 'Please enter a valid GitHub username.',
      [ERROR_CODES.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
      [ERROR_CODES.TIMEOUT]: 'The request timed out. Please try again.',
      [ERROR_CODES.UNAUTHORIZED]: 'Authentication failed. Please check your credentials.',
      [ERROR_CODES.FORBIDDEN]: 'Access denied. You may not have permission to access this resource.',
      [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
      [ERROR_CODES.RATE_LIMITED]: 'Rate limit exceeded. Please wait a moment before trying again.',
      [ERROR_CODES.FILE_NOT_FOUND]: 'The specified file or directory was not found.',
      [ERROR_CODES.FILE_ACCESS_DENIED]: 'Permission denied. Unable to access the file or directory.',
      [ERROR_CODES.GENERATION_FAILED]: 'Code generation failed. Please try again with different parameters.',
      [ERROR_CODES.PARSING_ERROR]: 'Failed to parse the response. The data may be corrupted.',
      [ERROR_CODES.INTERNAL_ERROR]: 'An internal error occurred. Please try again.',
      [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
    };

    return userMessages[code] || originalMessage || 'An error occurred. Please try again.';
  }
}

/**
 * Error statistics interface
 */
export interface ErrorStats {
  total: number;
  bySeverity: Record<ErrorSeverity, number>;
  byCode: Record<string, number>;
  recent: ApiError[];
}

/**
 * Utility functions for common error scenarios
 */
export class ErrorUtils {
  /**
   * Create a validation error
   */
  static validationError(field: string, value: any, context: string): ApiError {
    return ErrorHandler.createError(
      ERROR_CODES.INVALID_CONFIG,
      `Invalid ${field}: ${value}`,
      context,
      ErrorSeverity.MEDIUM,
      { field, value },
      `Please provide a valid ${field}.`
    );
  }

  /**
   * Create a network error
   */
  static networkError(message: string, context: string, details?: Record<string, any>): ApiError {
    return ErrorHandler.createError(
      ERROR_CODES.NETWORK_ERROR,
      message,
      context,
      ErrorSeverity.HIGH,
      details,
      'Network connection failed. Please check your internet connection and try again.'
    );
  }

  /**
   * Create an API error
   */
  static apiError(service: string, message: string, context: string, status?: number): ApiError {
    const code = status ? ErrorHandler['getHttpErrorCode'](status) : ERROR_CODES.API_ERROR;
    return ErrorHandler.createError(
      code,
      `${service} API error: ${message}`,
      context,
      status && status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      { service, status },
      `Failed to connect to ${service}. Please try again later.`
    );
  }

  /**
   * Create a file system error
   */
  static fileSystemError(operation: string, path: string, context: string): ApiError {
    return ErrorHandler.createError(
      ERROR_CODES.FILE_ACCESS_DENIED,
      `Failed to ${operation} file: ${path}`,
      context,
      ErrorSeverity.MEDIUM,
      { operation, path },
      `Unable to ${operation} the file. Please check file permissions.`
    );
  }

  /**
   * Create a generation error
   */
  static generationError(stage: string, message: string, context: string): ApiError {
    return ErrorHandler.createError(
      ERROR_CODES.GENERATION_FAILED,
      `Generation failed at ${stage}: ${message}`,
      context,
      ErrorSeverity.MEDIUM,
      { stage },
      `Code generation failed. Please try again with different parameters.`
    );
  }
}

/**
 * Decorator for automatic error handling
 */
export function handleErrors(context: string, category?: ErrorCategory) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        ErrorHandler.handle(error, `${target.constructor.name}.${propertyKey}`, category);
      }
    };

    return descriptor;
  };
}