/**
 * Application error types and utilities
 */

export type AppError = {
  code?: string | number;
  userMessage: string;
  devMessage?: string;
  retryable?: boolean;
  originalError?: unknown;
};

/**
 * Convert any error to a standardized AppError
 */
export function toAppError(
  error: unknown,
  userMessage: string = 'Ein unerwarteter Fehler ist aufgetreten',
  options: {
    code?: string | number;
    retryable?: boolean;
  } = {}
): AppError {
  // Handle undefined/null
  if (!error) {
    return {
      code: options.code,
      userMessage,
      retryable: options.retryable ?? false,
    };
  }

  // Already an AppError
  if (typeof error === 'object' && 'userMessage' in error) {
    return error as AppError;
  }

  // Extract details from error object
  const code = 
    (error as any)?.code ?? 
    (error as any)?.status ?? 
    (error as any)?.statusCode ??
    options.code;
    
  const devMessage = 
    (error as any)?.message ?? 
    (error as any)?.toString() ?? 
    'Unknown error';

  // Determine if error is retryable (default: server errors and rate limits)
  const retryable = options.retryable ?? 
    (code && (Number(code) >= 500 || Number(code) === 429));

  return {
    code,
    userMessage,
    devMessage,
    retryable,
    originalError: error,
  };
}

/**
 * Check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' && 
    error !== null && 
    'userMessage' in error &&
    typeof (error as any).userMessage === 'string'
  );
}

/**
 * Create a retryable error
 */
export function createRetryableError(message: string, code?: string | number): AppError {
  return {
    code,
    userMessage: message,
    retryable: true,
  };
}

/**
 * Create a non-retryable error
 */
export function createError(message: string, code?: string | number): AppError {
  return {
    code,
    userMessage: message,
    retryable: false,
  };
}
