/**
 * Auth Validation Schemas
 * Zod schemas for authentication-related forms
 *
 * NOTE: account verification and activation key on `msisdn`, not `email`.
 */

import { z } from 'zod'
import { msisdnSchema, passwordSchema } from './customer.schema'

/**
 * Digits in every OTP the backend sends, for account verification and
 * password reset alike. The spec's `otp` fields carry no length rule — only an
 * example of "123456" — but the codes actually delivered by SMS are 4 digits.
 * The OTP field, its validation and its copy all read from this.
 */
export const OTP_LENGTH = 4

const otpSchema = z
  .string()
  .min(1, 'OTP is required')
  .length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`)
  .regex(/^[0-9]+$/, 'OTP must contain only numbers')

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  // No strength rule here — an existing password must be accepted as-is,
  // whatever policy was in force when it was set.
  password: z.string().min(1, 'Password is required'),
  login_type: z.enum(['customer', 'merchant'], {
    required_error: 'Please select account type',
  }),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Forgot Password Schema — OTP goes to the phone number.
 */
export const forgotPasswordSchema = z.object({
  msisdn: msisdnSchema,
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

/**
 * OTP Verification Schema
 */
export const otpVerifySchema = z.object({
  otp: otpSchema,
})

export type OtpVerifyFormData = z.infer<typeof otpVerifySchema>

/**
 * Change / Reset Password Schema
 */
export const changePasswordSchema = z
  .object({
    new_password: passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export const resetPasswordSchema = changePasswordSchema
export type ResetPasswordFormData = ChangePasswordFormData

/**
 * Verify Account Schema — msisdn + otp.
 */
export const verifyAccountSchema = z.object({
  msisdn: msisdnSchema,
  otp: otpSchema,
})

export type VerifyAccountFormData = z.infer<typeof verifyAccountSchema>

/**
 * Resend Verification OTP Schema — msisdn only.
 */
export const resendVerificationOtpSchema = z.object({
  msisdn: msisdnSchema,
})

export type ResendVerificationOtpFormData = z.infer<
  typeof resendVerificationOtpSchema
>

/**
 * Request Account Activation Schema — needs both email and msisdn.
 */
export const requestAccountActivationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  msisdn: msisdnSchema,
})

export type RequestAccountActivationFormData = z.infer<
  typeof requestAccountActivationSchema
>

/**
 * Account Activation Schema — msisdn + otp.
 */
export const accountActivationSchema = verifyAccountSchema
export type AccountActivationFormData = VerifyAccountFormData
