/**
 * Auth Hooks
 * React hooks for authentication operations
 */

'use client'

import { useRouter } from 'next/navigation'
import { authService, customerService, merchantService } from '@/lib/api/services'
import { tokenManager } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'
import { useAuth } from '@/contexts/auth-context'
import { useMutation, type MutationOptions } from './use-mutation'
import {
  toCustomerRegistrationPayload,
  toMerchantRegistrationPayload,
  type LoginFormData,
  type CustomerRegistrationFormData,
  type MerchantRegistrationFormData,
} from '@/lib/validations'
import type { MessageResponse } from '@/lib/api/types'
import type {
  LoginResponse,
  ForgotPasswordResponse,
  VerifyOtpResponse,
  ChangePasswordResponse,
} from '@/lib/api/types'

/** Where each role lands after signing in. */
export const DASHBOARD_PATHS = {
  customer: '/dashboard/tenant',
  merchant: '/dashboard/landlord',
} as const

/**
 * Login Hook
 *
 * Order matters: the service stores tokens, the context then hydrates session
 * state, and only then do we navigate. Redirecting first would land on a
 * protected route while the context still reads as logged-out, and the route
 * guard would bounce the user straight back to /login.
 */
export function useLogin(
  options?: MutationOptions<LoginResponse, LoginFormData>
) {
  const router = useRouter()
  const { login: hydrateSession } = useAuth()

  return useMutation<LoginResponse, LoginFormData>(
    async (credentials) => {
      const response = await authService.login(credentials)

      // If the body did not carry tokens we are not actually signed in.
      // Fail loudly rather than navigating into a dashboard that will 401.
      if (!tokenManager.getAccessToken()) {
        throw new ApiError(
          response.msg || 'Login did not return an access token.',
          502,
          'NO_TOKEN_IN_LOGIN_RESPONSE'
        )
      }

      await hydrateSession(credentials.login_type)
      return response
    },
    {
      successMessage: 'Welcome back!',
      onSuccess: (response, variables) => {
        router.push(DASHBOARD_PATHS[variables.login_type])
        options?.onSuccess?.(response, variables)
      },
      ...options,
    }
  )
}

/**
 * Customer (tenant) registration.
 * The account is created INACTIVE — the user must verify by OTP before login.
 */
export function useRegisterCustomer(
  options?: MutationOptions<MessageResponse, CustomerRegistrationFormData>
) {
  return useMutation<MessageResponse, CustomerRegistrationFormData>(
    async (form) => customerService.register(toCustomerRegistrationPayload(form)),
    {
      successMessage: 'Account created. Check your phone for a verification code.',
      ...options,
    }
  )
}

/**
 * Merchant (landlord) registration.
 * The account is created INACTIVE — the user must verify by OTP before login.
 */
export function useRegisterMerchant(
  options?: MutationOptions<MessageResponse, MerchantRegistrationFormData>
) {
  return useMutation<MessageResponse, MerchantRegistrationFormData>(
    async (form) => merchantService.register(toMerchantRegistrationPayload(form)),
    {
      successMessage: 'Account created. Check your phone for a verification code.',
      ...options,
    }
  )
}

/**
 * Verify a new account with the OTP sent by SMS.
 */
export function useVerifyAccount(
  options?: MutationOptions<MessageResponse, { msisdn: string; otp: string }>
) {
  return useMutation<MessageResponse, { msisdn: string; otp: string }>(
    async (data) => authService.verifyAccount(data),
    {
      successMessage: 'Account verified. You can sign in now.',
      ...options,
    }
  )
}

/**
 * Resend the verification OTP.
 */
export function useResendVerificationOtp(
  options?: MutationOptions<MessageResponse, { msisdn: string }>
) {
  return useMutation<MessageResponse, { msisdn: string }>(
    async (data) => authService.resendVerificationOtp(data),
    {
      successMessage: 'Verification code sent',
      ...options,
    }
  )
}

/**
 * Start the password reset flow.
 */
export function useForgotPassword(
  options?: MutationOptions<ForgotPasswordResponse, { msisdn: string }>
) {
  return useMutation<ForgotPasswordResponse, { msisdn: string }>(
    async (data) => authService.forgotPassword(data),
    {
      successMessage: 'Reset code sent to your phone',
      ...options,
    }
  )
}

/**
 * Verify the password reset OTP. Needs the token from the forgot-password step.
 */
export function useVerifyOtp(
  options?: MutationOptions<VerifyOtpResponse, { otp: string; token: string }>
) {
  return useMutation<VerifyOtpResponse, { otp: string; token: string }>(
    async ({ otp, token }) => authService.verifyForgotPasswordOtp({ otp }, token),
    {
      successMessage: 'Code verified',
      ...options,
    }
  )
}

/**
 * Set a new password during the reset flow (unauthenticated, token-scoped).
 */
export function useResetPassword(
  options?: MutationOptions<
    ChangePasswordResponse,
    { new_password: string; confirm_password: string; token: string }
  >
) {
  return useMutation<
    ChangePasswordResponse,
    { new_password: string; confirm_password: string; token: string }
  >(
    async ({ token, ...data }) => authService.resetPassword(data, token),
    {
      successMessage: 'Password reset successfully',
      ...options,
    }
  )
}

/**
 * Change the password of the logged-in user.
 */
export function useChangePassword(
  options?: MutationOptions<
    ChangePasswordResponse,
    { new_password: string; confirm_password: string }
  >
) {
  return useMutation<
    ChangePasswordResponse,
    { new_password: string; confirm_password: string }
  >(
    async (data) => authService.changePassword(data),
    {
      successMessage: 'Password changed successfully',
      ...options,
    }
  )
}

/**
 * Logout.
 */
export function useLogout(options?: { onSuccess?: () => void }) {
  const { logout } = useAuth()

  return useMutation<void, void>(
    async () => {
      await logout()
    },
    {
      showSuccessToast: false,
      onSuccess: () => {
        options?.onSuccess?.()
      },
    }
  )
}
