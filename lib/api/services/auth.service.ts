/**
 * Auth Service
 * Handles all authentication-related API calls
 */

import { httpClient, tokenManager } from '../client'
import { API_ENDPOINTS } from '../config'
import type { MessageResponse } from '../types'
import type {
  AuthTokens,
  LoginCredentials,
  LoginResponse,
  ForgotPasswordData,
  ForgotPasswordResponse,
  VerifyOtpData,
  VerifyOtpResponse,
  ChangePasswordData,
  ChangePasswordResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  VerifyAccountData,
  ResendVerificationOtpData,
  RequestAccountActivationData,
  AccountActivationData,
  SecureAccountResponse,
} from '../types/auth.types'

/**
 * Pull tokens out of a login response.
 *
 * The documented shape is { access: { token, refresh_token } }, but this could
 * not be confirmed against the live API (all new accounts start inactive and
 * activation needs an OTP we cannot receive). The flat variant is accepted too
 * so a small backend difference doesn't silently drop the session.
 */
function extractTokens(response: LoginResponse): AuthTokens | null {
  const access = response.access
  if (access?.token) {
    return { token: access.token, refresh_token: access.refresh_token ?? '' }
  }

  const flat = response as unknown as Partial<AuthTokens>
  if (flat.token) {
    return { token: flat.token, refresh_token: flat.refresh_token ?? '' }
  }

  return null
}

export const authService = {
  /**
   * Login. Stores tokens on success.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
      { skipAuth: true }
    )

    const tokens = extractTokens(response)
    if (tokens) {
      tokenManager.setTokens(tokens.token, tokens.refresh_token)
      tokenManager.setUserType(response.login_type || credentials.login_type)
    }

    return response
  },

  /**
   * Get the logged-in user's profile, whichever type they are.
   */
  async getMyAccount(): Promise<MessageResponse & Record<string, unknown>> {
    return httpClient.get(API_ENDPOINTS.AUTH.MY_ACCOUNT)
  },

  /**
   * Start the password reset flow — sends an OTP to the phone number.
   */
  async forgotPassword(
    data: ForgotPasswordData
  ): Promise<ForgotPasswordResponse> {
    return httpClient.post<ForgotPasswordResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data,
      { skipAuth: true }
    )
  },

  /**
   * Verify the password-reset OTP.
   * Requires the token issued by the forgot-password step.
   */
  async verifyForgotPasswordOtp(
    data: VerifyOtpData,
    token: string
  ): Promise<VerifyOtpResponse> {
    return httpClient.post<VerifyOtpResponse>(
      API_ENDPOINTS.AUTH.VERIFY_FORGOT_PASSWORD_OTP,
      data,
      { skipAuth: true, skipRefresh: true },
      token
    )
  },

  /**
   * Set a new password after OTP verification (unauthenticated reset flow).
   */
  async resetPassword(
    data: ResetPasswordData,
    token: string
  ): Promise<ResetPasswordResponse> {
    return httpClient.post<ResetPasswordResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data,
      { skipAuth: true, skipRefresh: true },
      token
    )
  },

  /**
   * Change the password of the currently logged-in user.
   */
  async changePassword(
    data: ChangePasswordData
  ): Promise<ChangePasswordResponse> {
    return httpClient.post<ChangePasswordResponse>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data
    )
  },

  /**
   * Verify a newly registered account with the OTP sent to the phone.
   */
  async verifyAccount(data: VerifyAccountData): Promise<MessageResponse> {
    return httpClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.VERIFY_ACCOUNT,
      data,
      { skipAuth: true }
    )
  },

  /**
   * Resend the verification OTP (SMS + email).
   */
  async resendVerificationOtp(
    data: ResendVerificationOtpData
  ): Promise<MessageResponse> {
    return httpClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION_OTP,
      data,
      { skipAuth: true }
    )
  },

  /**
   * Ask for an OTP to re-activate a deactivated account.
   */
  async requestAccountActivation(
    data: RequestAccountActivationData
  ): Promise<MessageResponse> {
    return httpClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.REQUEST_ACCOUNT_ACTIVATION,
      data,
      { skipAuth: true }
    )
  },

  /**
   * Complete re-activation with the OTP.
   */
  async activateAccount(data: AccountActivationData): Promise<MessageResponse> {
    return httpClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.ACCOUNT_ACTIVATION,
      data,
      { skipAuth: true }
    )
  },

  /**
   * DANGER — this DEACTIVATES the account. It is the "my account is
   * compromised" action, and the user must re-activate via OTP afterwards.
   * Always confirm with the user before calling it.
   */
  async deactivateCompromisedAccount(): Promise<SecureAccountResponse> {
    return httpClient.post<SecureAccountResponse>(
      API_ENDPOINTS.AUTH.SECURE_ACCOUNT
    )
  },

  /**
   * Logout. Tells the backend, then clears local state either way —
   * a failed round-trip must never strand the user in a logged-in UI.
   */
  async logout(): Promise<void> {
    try {
      await httpClient.post<MessageResponse>(
        API_ENDPOINTS.AUTH.LOGOUT,
        undefined,
        { skipRefresh: true }
      )
    } catch {
      // Ignore — local logout below is what matters to the user.
    } finally {
      tokenManager.clearTokens()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'))
      }
    }
  },

  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken()
  },
}
