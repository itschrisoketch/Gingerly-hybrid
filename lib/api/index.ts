/**
 * API Module Index
 * Main entry point for all API-related exports
 */

// Configuration
export { apiConfig, API_ENDPOINTS, STORAGE_KEYS } from './config'
export type { Environment, ApiConfig, UserType } from './config'

// HTTP Client
export { httpClient, tokenManager } from './client'

// Error Handling
export {
  ApiError,
  NetworkError,
  TimeoutError,
  AuthenticationError,
  ValidationError,
  getErrorMessage,
  handleApiError,
  parseApiError,
} from './errors'

// Services
export {
  authService,
  customerService,
  merchantService,
  extractCustomer,
  extractMerchant,
} from './services'

// Types
export * from './types'
