/**
 * Comprehensive error handling system for Paperbag
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  PROCESSING = 'PROCESSING',
  UPLOAD = 'UPLOAD',
  API = 'API',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  retryable: boolean;
}

export class PaperbagError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly details?: any;
  public readonly retryable: boolean;
  public readonly timestamp: Date;

  constructor(
    type: ErrorType,
    message: string,
    code?: string,
    details?: any,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'PaperbagError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.retryable = retryable;
    this.timestamp = new Date();
  }
}

/**
 * Error handler for different types of errors
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle and categorize errors
   */
  handleError(error: unknown, context?: string): AppError {
    let appError: AppError;

    if (error instanceof PaperbagError) {
      appError = {
        type: error.type,
        message: error.message,
        code: error.code,
        details: error.details,
        timestamp: error.timestamp,
        retryable: error.retryable
      };
    } else if (error instanceof Error) {
      // Categorize generic errors
      const type = this.categorizeError(error);
      appError = {
        type,
        message: error.message,
        code: error.name,
        details: { stack: error.stack, context },
        timestamp: new Date(),
        retryable: this.isRetryableError(error)
      };
    } else {
      appError = {
        type: ErrorType.UNKNOWN,
        message: 'An unknown error occurred',
        details: { originalError: error, context },
        timestamp: new Date(),
        retryable: false
      };
    }

    // Log error
    this.logError(appError);
    
    // Report to external service if needed
    this.reportError(appError);

    return appError;
  }

  /**
   * Categorize errors based on message and context
   */
  private categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorType.NETWORK;
    }
    
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return ErrorType.AUTHENTICATION;
    }
    
    if (message.includes('forbidden') || message.includes('permission')) {
      return ErrorType.AUTHORIZATION;
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    
    if (message.includes('upload') || message.includes('file')) {
      return ErrorType.UPLOAD;
    }
    
    if (message.includes('api') || message.includes('openai')) {
      return ErrorType.API;
    }
    
    if (message.includes('processing') || message.includes('generation')) {
      return ErrorType.PROCESSING;
    }
    
    return ErrorType.UNKNOWN;
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Network errors are usually retryable
    if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
      return true;
    }
    
    // Server errors (5xx) are retryable
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
      return true;
    }
    
    // Rate limiting is retryable
    if (message.includes('rate limit') || message.includes('429')) {
      return true;
    }
    
    return false;
  }

  /**
   * Log error for debugging
   */
  private logError(error: AppError): void {
    this.errorLog.push(error);
    console.error(`[${error.type}] ${error.message}`, error.details);
    
    // Keep only last 100 errors in memory
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }

  /**
   * Report error to external service
   */
  private reportError(error: AppError): void {
    // In production, you might want to send to Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
      console.warn('Error reporting not implemented yet');
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.';
      
      case ErrorType.AUTHENTICATION:
        return 'Please sign in to continue.';
      
      case ErrorType.AUTHORIZATION:
        return 'You don\'t have permission to perform this action.';
      
      case ErrorType.VALIDATION:
        return error.message || 'Please check your input and try again.';
      
      case ErrorType.UPLOAD:
        return 'Failed to upload image. Please try again with a different file.';
      
      case ErrorType.API:
        return 'Service temporarily unavailable. Please try again in a few minutes.';
      
      case ErrorType.PROCESSING:
        return 'Image processing failed. Please try again with a different image.';
      
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  /**
   * Get error log for debugging
   */
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

/**
 * Retry mechanism for retryable errors
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
}

/**
 * Error boundary component for React
 */
export function createErrorBoundary(fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>) {
  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      const errorHandler = ErrorHandler.getInstance();
      errorHandler.handleError(error, `ErrorBoundary: ${errorInfo.componentStack}`);
    }

    render() {
      if (this.state.hasError) {
        if (fallbackComponent) {
          const FallbackComponent = fallbackComponent;
          return (
            <FallbackComponent
              error={this.state.error!}
              retry={() => this.setState({ hasError: false, error: undefined })}
            />
          );
        }

        return (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <button onClick={() => this.setState({ hasError: false, error: undefined })}>
              Try again
            </button>
          </div>
        );
      }

      return this.props.children;
    }
  };
}