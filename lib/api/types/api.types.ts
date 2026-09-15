/**
 * Base API Types
 * Common types used across all API interactions
 *
 * IMPORTANT — response envelope
 * The Gingerly API returns a FLAT payload, not a { success, message, data }
 * wrapper. Verified live:
 *
 *   POST /customers/register -> 201 { "msg": "account created successfully",
 *                                     "success": true }
 *   POST /auth/login (bad)   -> 404 { "msg": "user not registered!",
 *                                     "success": false }
 *
 * Payload fields sit alongside `msg`/`success` at the top level, so responses
 * extend ApiEnvelope rather than nesting under `.data`.
 */

/**
 * Fields present on every JSON response from the API.
 *
 * Both are optional: some error paths (e.g. flask-jwt's
 * `{"msg": "Missing Authorization Header"}`) omit `success` entirely.
 */
export interface ApiEnvelope {
  success?: boolean
  msg?: string
}

/**
 * A response carrying no payload beyond the envelope — the shape most
 * mutations return (register, verify, resend OTP, logout...).
 */
export type MessageResponse = ApiEnvelope

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Request configuration options
 */
export interface RequestConfig {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined>
  timeout?: number
  skipAuth?: boolean
  /** Skip the automatic refresh-and-retry on 401. Used by the refresh call itself. */
  skipRefresh?: boolean
}

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
