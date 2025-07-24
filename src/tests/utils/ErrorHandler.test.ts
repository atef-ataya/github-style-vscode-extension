import { ErrorHandler, ErrorSeverity, ERROR_CODES, ApiError, ErrorUtils } from '../../utils/ErrorHandler';

describe('ErrorHandler', () => {
  beforeEach(() => {
    ErrorHandler.clearErrorLog();
  });

  describe('createError', () => {
    it('should create a properly formatted ApiError', () => {
      const error = ErrorHandler.createError(
        ERROR_CODES.INVALID_TOKEN,
        'Test error message',
        'test context',
        ErrorSeverity.HIGH,
        { testDetail: 'value' },
        'User friendly message'
      );

      expect(error).toMatchObject({
        code: ERROR_CODES.INVALID_TOKEN,
        message: 'Test error message',
        context: 'test context',
        severity: ErrorSeverity.HIGH,
        details: { testDetail: 'value' },
        userMessage: 'User friendly message'
      });
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should generate user-friendly message when not provided', () => {
      const error = ErrorHandler.createError(
        ERROR_CODES.NETWORK_ERROR,
        'Connection failed',
        'test context'
      );

      expect(error.userMessage).toBe('Network connection failed. Please check your internet connection.');
    });
  });

  describe('normalizeError', () => {
    it('should handle standard Error objects', () => {
      const originalError = new Error('Test error');
      
      try {
        ErrorHandler.handle(originalError, 'test context');
      } catch (apiError) {
        expect(apiError).toMatchObject({
          message: 'Test error',
          context: 'test context',
          severity: ErrorSeverity.MEDIUM
        });
        expect(apiError.stack).toBeDefined();
      }
    });

    it('should handle HTTP errors', () => {
      const httpError = {
        status: 404,
        statusText: 'Not Found',
        message: 'Resource not found'
      };

      try {
        ErrorHandler.handle(httpError, 'API call');
      } catch (apiError) {
        expect(apiError).toMatchObject({
          code: ERROR_CODES.NOT_FOUND,
          message: 'Resource not found',
          context: 'API call',
          details: { status: 404, statusText: 'Not Found' }
        });
      }
    });

    it('should handle string errors', () => {
      try {
        ErrorHandler.handle('Simple error message', 'test context');
      } catch (apiError) {
        expect(apiError).toMatchObject({
          code: ERROR_CODES.UNKNOWN_ERROR,
          message: 'Simple error message',
          context: 'test context',
          severity: ErrorSeverity.MEDIUM
        });
      }
    });

    it('should handle unknown error types', () => {
      const unknownError = { someProperty: 'value' };
      
      try {
        ErrorHandler.handle(unknownError, 'test context');
      } catch (apiError) {
        expect(apiError).toMatchObject({
          code: ERROR_CODES.UNKNOWN_ERROR,
          message: 'An unknown error occurred',
          context: 'test context',
          details: { originalError: unknownError }
        });
      }
    });
  });

  describe('error code determination', () => {
    it('should identify network errors', () => {
      const networkError = new Error('Network request failed');
      
      try {
        ErrorHandler.handle(networkError, 'test');
      } catch (apiError) {
        expect(apiError.code).toBe(ERROR_CODES.NETWORK_ERROR);
      }
    });

    it('should identify timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      
      try {
        ErrorHandler.handle(timeoutError, 'test');
      } catch (apiError) {
        expect(apiError.code).toBe(ERROR_CODES.TIMEOUT);
      }
    });

    it('should identify file system errors', () => {
      const fileError = new Error('ENOENT: file not found');
      
      try {
        ErrorHandler.handle(fileError, 'test');
      } catch (apiError) {
        expect(apiError.code).toBe(ERROR_CODES.FILE_NOT_FOUND);
      }
    });

    it('should identify permission errors', () => {
      const permissionError = new Error('EACCES: permission denied');
      
      try {
        ErrorHandler.handle(permissionError, 'test');
      } catch (apiError) {
        expect(apiError.code).toBe(ERROR_CODES.FILE_ACCESS_DENIED);
      }
    });
  });

  describe('severity determination', () => {
    it('should assign critical severity for critical errors', () => {
      const criticalError = new Error('Critical system failure');
      
      try {
        ErrorHandler.handle(criticalError, 'test');
      } catch (apiError) {
        expect(apiError.severity).toBe(ErrorSeverity.CRITICAL);
      }
    });

    it('should assign high severity for auth errors', () => {
      const authError = new Error('Unauthorized access');
      
      try {
        ErrorHandler.handle(authError, 'test');
      } catch (apiError) {
        expect(apiError.severity).toBe(ErrorSeverity.HIGH);
      }
    });

    it('should assign low severity for warnings', () => {
      const warningError = new Error('Warning: deprecated method');
      
      try {
        ErrorHandler.handle(warningError, 'test');
      } catch (apiError) {
        expect(apiError.severity).toBe(ErrorSeverity.LOW);
      }
    });
  });

  describe('handleSilent', () => {
    it('should handle errors without throwing', () => {
      const error = new Error('Test error');
      
      expect(() => {
        const apiError = ErrorHandler.handleSilent(error, 'test context');
        expect(apiError).toMatchObject({
          message: 'Test error',
          context: 'test context'
        });
      }).not.toThrow();
    });
  });

  describe('error logging', () => {
    it('should log errors to internal log', () => {
      const error = new Error('Test error');
      
      try {
        ErrorHandler.handle(error, 'test context');
      } catch {
        // Expected to throw
      }
      
      const recentErrors = ErrorHandler.getRecentErrors(1);
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0].message).toBe('Test error');
    });

    it('should maintain log size limit', () => {
      // Create more errors than the log limit
      for (let i = 0; i < 1005; i++) {
        try {
          ErrorHandler.handle(new Error(`Error ${i}`), 'test');
        } catch {
          // Expected to throw
        }
      }
      
      const allErrors = ErrorHandler.getRecentErrors(2000);
      expect(allErrors.length).toBeLessThanOrEqual(1000);
    });

    it('should filter errors by severity', () => {
      try {
        ErrorHandler.handle(new Error('Critical error'), 'test');
      } catch {
        // Expected
      }
      
      try {
        ErrorHandler.handle(new Error('Warning message'), 'test');
      } catch {
        // Expected
      }
      
      const criticalErrors = ErrorHandler.getErrorsBySeverity(ErrorSeverity.CRITICAL);
      const lowErrors = ErrorHandler.getErrorsBySeverity(ErrorSeverity.LOW);
      
      expect(criticalErrors.length).toBeGreaterThan(0);
      expect(lowErrors.length).toBeGreaterThan(0);
    });
  });

  describe('error statistics', () => {
    it('should provide accurate error statistics', () => {
      // Create errors of different severities
      try {
        ErrorHandler.handle(new Error('Critical error'), 'test');
      } catch {
        // Expected
      }
      
      try {
        ErrorHandler.handle(new Error('Network error'), 'test');
      } catch {
        // Expected
      }
      
      const stats = ErrorHandler.getErrorStats();
      
      expect(stats.total).toBe(2);
      expect(stats.bySeverity).toBeDefined();
      expect(stats.byCode).toBeDefined();
      expect(stats.recent).toHaveLength(2);
    });
  });

  describe('error callback', () => {
    it('should call error callback when set', () => {
      const callback = jest.fn();
      ErrorHandler.setErrorCallback(callback);
      
      try {
        ErrorHandler.handle(new Error('Test error'), 'test');
      } catch {
        // Expected
      }
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          context: 'test'
        })
      );
    });
  });
});

describe('ErrorUtils', () => {
  describe('validationError', () => {
    it('should create a validation error', () => {
      const error = ErrorUtils.validationError('username', 'invalid-user', 'user input');
      
      expect(error).toMatchObject({
        code: ERROR_CODES.INVALID_CONFIG,
        message: 'Invalid username: invalid-user',
        context: 'user input',
        severity: ErrorSeverity.MEDIUM,
        details: { field: 'username', value: 'invalid-user' },
        userMessage: 'Please provide a valid username.'
      });
    });
  });

  describe('networkError', () => {
    it('should create a network error', () => {
      const error = ErrorUtils.networkError(
        'Connection failed',
        'API call',
        { endpoint: '/api/test' }
      );
      
      expect(error).toMatchObject({
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Connection failed',
        context: 'API call',
        severity: ErrorSeverity.HIGH,
        details: { endpoint: '/api/test' }
      });
    });
  });

  describe('apiError', () => {
    it('should create an API error', () => {
      const error = ErrorUtils.apiError(
        'GitHub',
        'Rate limit exceeded',
        'repository fetch',
        429
      );
      
      expect(error).toMatchObject({
        code: ERROR_CODES.RATE_LIMITED,
        message: 'GitHub API error: Rate limit exceeded',
        context: 'repository fetch',
        details: { service: 'GitHub', status: 429 }
      });
    });
  });

  describe('fileSystemError', () => {
    it('should create a file system error', () => {
      const error = ErrorUtils.fileSystemError(
        'read',
        '/path/to/file.txt',
        'file operation'
      );
      
      expect(error).toMatchObject({
        code: ERROR_CODES.FILE_ACCESS_DENIED,
        message: 'Failed to read file: /path/to/file.txt',
        context: 'file operation',
        details: { operation: 'read', path: '/path/to/file.txt' }
      });
    });
  });

  describe('generationError', () => {
    it('should create a generation error', () => {
      const error = ErrorUtils.generationError(
        'template processing',
        'Invalid template syntax',
        'code generation'
      );
      
      expect(error).toMatchObject({
        code: ERROR_CODES.GENERATION_FAILED,
        message: 'Generation failed at template processing: Invalid template syntax',
        context: 'code generation',
        details: { stage: 'template processing' }
      });
    });
  });
});