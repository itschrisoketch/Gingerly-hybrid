/**
 * Validations Index
 * Re-exports all validation schemas for convenient importing
 */

// Auth schemas
export {
  loginSchema,
  forgotPasswordSchema,
  otpVerifySchema,
  changePasswordSchema,
  resetPasswordSchema,
  verifyAccountSchema,
  resendVerificationOtpSchema,
  requestAccountActivationSchema,
  accountActivationSchema,
} from './auth.schema'

export type {
  LoginFormData,
  ForgotPasswordFormData,
  OtpVerifyFormData,
  ChangePasswordFormData,
  ResetPasswordFormData,
  VerifyAccountFormData,
  ResendVerificationOtpFormData,
  RequestAccountActivationFormData,
  AccountActivationFormData,
} from './auth.schema'

// Customer schemas
export {
  msisdnSchema,
  passwordSchema,
  customerRegistrationSchema,
  customerUpdateSchema,
  toCustomerRegistrationPayload,
} from './customer.schema'

export type {
  CustomerRegistrationFormData,
  CustomerUpdateFormData,
} from './customer.schema'

// Merchant schemas
export {
  merchantRegistrationSchema,
  merchantUpdateSchema,
  toMerchantRegistrationPayload,
} from './merchant.schema'

export type {
  MerchantRegistrationFormData,
  MerchantUpdateFormData,
} from './merchant.schema'
