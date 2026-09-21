/**
 * Auth Types
 * Types for authentication-related API operations
 *
 * Request shapes below are taken from the live OpenAPI spec.
 * NOTE: every OTP endpoint keys on `msisdn`, NOT `email`.
 */

import type { ApiEnvelope } from './api.types'

/**
 * Login
 */
export type LoginType = 'customer' | 'merchant'

export interface LoginCredentials {
  email: string
  password: string
  /** Optional per the spec, but always sent so the UI can route by role. */
  login_type: LoginType
}

/** The `access` object nested in a successful login response. */
export interface AuthTokens {
  token: string
  refresh_token: string
}

/**
 * UNVERIFIED SHAPE — the success body could not be observed live because
 * every new account starts inactive and activation needs an OTP delivered by
 * SMS/email (see docs/backend-questions.md). Taken from the API spec document;
 * its error envelope matched reality exactly, so this is credible but unproven.
 * `parseLoginResponse` in auth.service.ts tolerates the alternatives.
 */
export interface LoginResponse extends ApiEnvelope {
  access?: AuthTokens
  login_type?: string
}

/**
 * Password reset — forgot-password issues an OTP, /verify exchanges it,
 * then reset-password sets the new value.
 *
 * Both /forgot-password/verify and /reset-password require an Authorization
 * header, so the token returned by the previous step must be passed along.
 */
export interface ForgotPasswordData {
  msisdn: string
}

export type ForgotPasswordResponse = ApiEnvelope & {
  /** Short-lived token for the verify step, when the backend issues one. */
  token?: string
}

export interface VerifyOtpData {
  otp: string
}

export type VerifyOtpResponse = ApiEnvelope & {
  token?: string
}

export interface ChangePasswordData {
  new_password: string
  confirm_password: string
}

export type ChangePasswordResponse = ApiEnvelope

export interface ResetPasswordData {
  new_password: string
  confirm_password: string
}

export type ResetPasswordResponse = ApiEnvelope

/**
 * Account verification / activation — all keyed on msisdn.
 */
export interface VerifyAccountData {
  msisdn: string
  otp: string
}

export interface ResendVerificationOtpData {
  msisdn: string
}

export interface RequestAccountActivationData {
  email: string
  msisdn: string
}

export interface AccountActivationData {
  msisdn: string
  otp: string
}

/**
 * Token refresh. Requires the refresh token in the Authorization header.
 */
export interface RefreshTokenResponse extends ApiEnvelope {
  access?: AuthTokens
  /** Some backends return a bare token instead of an `access` object. */
  token?: string
}

/**
 * DANGER: /auth/secure-account DEACTIVATES the account. It is the
 * "my account is compromised, lock it down" action, not a 2FA toggle.
 */
export type SecureAccountResponse = ApiEnvelope
