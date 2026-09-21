/**
 * API Hooks Index
 * Re-exports all API hooks for convenient importing
 */

export { useMutation } from './use-mutation'
export type { MutationOptions, MutationResult } from './use-mutation'

export {
  DASHBOARD_PATHS,
  useLogin,
  useRegisterCustomer,
  useRegisterMerchant,
  useVerifyAccount,
  useResendVerificationOtp,
  useForgotPassword,
  useVerifyOtp,
  useResetPassword,
  useChangePassword,
  useLogout,
} from './use-auth'
