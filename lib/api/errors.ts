/**
 * API Error Handling
 * Custom error classes and error handling utilities
 */

import { toast } from 'sonner'

/**
 * Base API Error
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Network Error - Connection issues
 */
export class NetworkError extends Error {
  constructor(message = 'Unable to connect to server. Please check your internet connection.') {
    super(message)
    this.name = 'NetworkError'
  }
}

/**
 * Timeout Error
 */
export class TimeoutError extends Error {
  constructor(message = 'Request timed out. Please try again.') {
    super(message)
    this.name = 'TimeoutError'
  }
}

/**
 * Authentication Error - 401 responses
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed. Please log in again.') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

/**
 * Validation Error - 400/422 responses
 */
export class ValidationError extends ApiError {
  constructor(
    message = 'Validation failed',
    public errors: Record<string, string[]> = {}
  ) {
    super(message, 422, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

/**
 * Error messages by status code
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please wait a moment.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable.',
  503: 'Service temporarily unavailable.',
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof NetworkError) {
    return error.message
  }

  if (error instanceof TimeoutError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Handle API error with toast notification
 */
export function handleApiError(error: unknown, customMessage?: string): void {
  const message = customMessage || getErrorMessage(error)

  if (error instanceof AuthenticationError) {
    toast.error('Session Expired', {
      description: message,
    })
    return
  }

  if (error instanceof ValidationError) {
    const firstError = Object.values(error.errors)[0]?.[0]
    toast.error('Validation Error', {
      description: firstError || message,
    })
    return
  }

  if (error instanceof NetworkError) {
    toast.error('Connection Error', {
      description: message,
    })
    return
  }

  if (error instanceof TimeoutError) {
    toast.error('Request Timeout', {
      description: message,
    })
    return
  }

  if (error instanceof ApiError) {
    toast.error('Error', {
      description: message,
    })
    return
  }

  toast.error('Error', {
    description: message,
  })
}

/**
 * Parse error from API response
 */
export function parseApiError(
  status: number,
  data: Record<string, unknown> | null
): ApiError {
  // The Gingerly API reports failures in `msg`. The other keys are kept as
  // fallbacks for flask-jwt and any endpoint that words it differently.
  const message =
    (data?.msg as string) ||
    (data?.message as string) ||
    (data?.error as string) ||
    (data?.detail as string) ||
    ERROR_MESSAGES[status] ||
    'An error occurred'

  if (status === 401) {
    return new AuthenticationError(message)
  }

  if (status === 422 || status === 400) {
    const errors = (data?.errors as Record<string, string[]>) || {}
    return new ValidationError(message, errors)
  }

  // The API answers some auth failures with 404 + a meaningful `msg`
  // ("user not registered!", "user account is inactive"). Treat those as
  // authentication problems so the UI shows the real reason.
  if (status === 404 && data?.msg) {
    return new ApiError(message, 404, 'AUTH_LOOKUP_FAILED', data)
  }

  return new ApiError(
    message,
    status,
    data?.code as string | undefined,
    data as Record<string, unknown> | undefined
  )
}
