/**
 * API Configuration
 * Environment-specific settings for the Gingerly API client
 *
 * Endpoint paths below are verified against the live OpenAPI spec at
 * https://api.gingerly.africa/apispec.json (44 paths, basePath /api/v1).
 * Do not add trailing slashes — the backend does not redirect, it 404s.
 */

export type Environment = 'development' | 'staging' | 'production'

export interface ApiConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

/**
 * HTTPS is required. The browser blocks plain-HTTP XHR from an HTTPS page as
 * mixed content, so an http:// fallback would fail silently in any deployed
 * environment. Keep every fallback below on https://.
 */
const DEFAULT_BASE_URL = 'https://api.gingerly.africa/api/v1'

const configs: Record<Environment, ApiConfig> = {
  development: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  staging: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  production: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL,
    timeout: 30000,
    retryAttempts: 2,
    retryDelay: 500,
  },
}

const currentEnv = (process.env.NEXT_PUBLIC_APP_ENV as Environment) || 'development'

export const apiConfig = configs[currentEnv]

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    MY_ACCOUNT: '/auth/my-account',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_FORGOT_PASSWORD_OTP: '/auth/forgot-password/verify',
    CHANGE_PASSWORD: '/auth/change-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_ACCOUNT: '/auth/verify-account',
    RESEND_VERIFICATION_OTP: '/auth/resend-verification-otp',
    REQUEST_ACCOUNT_ACTIVATION: '/auth/request-account-activation',
    ACCOUNT_ACTIVATION: '/auth/account-activation',
    /**
     * DANGER: this DEACTIVATES the account (used when a breach is suspected).
     * It is not a 2FA / "harden my account" action. Never wire it to anything
     * a user could click casually.
     */
    SECURE_ACCOUNT: '/auth/secure-account',
  },
  // Customers (Tenants)
  CUSTOMERS: {
    REGISTER: '/customers/register',
    /** id travels as a ?id= query param, NOT a path segment. */
    UPDATE: '/customers/update',
    MY_ACCOUNT: '/customers/my-account',
  },
  // Merchants (Landlords)
  MERCHANTS: {
    REGISTER: '/merchants/register',
    /** merchant_id IS a path segment here — inconsistent with customers on purpose. */
    UPDATE: (id: string) => `/merchants/update/${id}`,
    MY_ACCOUNT: '/merchants/my-account',
    LIST: '/merchants',
    DETAIL: (id: string) => `/merchants/${id}`,
    VERIFY: '/merchants/verify',
  },
} as const

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'gingerly_access_token',
  REFRESH_TOKEN: 'gingerly_refresh_token',
  USER_TYPE: 'gingerly_user_type',
} as const

/**
 * User Types
 */
export type UserType = 'customer' | 'merchant'
