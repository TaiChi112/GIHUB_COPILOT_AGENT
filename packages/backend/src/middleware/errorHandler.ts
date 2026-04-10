import type { Context } from 'elysia';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  field?: string;
}

/**
 * Global error handler for Elysia
 */
export function errorHandler({ error, set }: { error: AppError; set: Context['set'] }) {
  console.error('Error:', error);

  // Default status code
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  const code = error.code || 'INTERNAL_ERROR';
  const field = error.field;

  // Handle specific error types
  if (message === 'Unauthorized') {
    statusCode = 401;
  } else if (message === 'Forbidden') {
    statusCode = 403;
  } else if (message.includes('not found') || message.includes('Not found')) {
    statusCode = 404;
  } else if (message.includes('already exists') || message.includes('duplicate')) {
    statusCode = 409;
  } else if (message.includes('validation') || message.includes('Invalid')) {
    statusCode = 400;
  }

  // Set response status
  set.status = statusCode;

  // Return error response
  return {
    error: {
      message,
      code,
      ...(field && { field }),
    },
  };
}

/**
 * Create an error with status code
 */
export function createError(message: string, statusCode: number, code?: string, field?: string): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.field = field;
  return error;
}
