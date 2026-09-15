/**
 * Merchant (Landlord) Types
 *
 * Shapes verified against the live OpenAPI spec.
 * NOTE: registration takes a single `full_name`, while update takes
 * `first_name`/`last_name`. That asymmetry is the backend's, not a typo here.
 */

import type { ApiEnvelope } from './api.types'

/**
 * Merchant Registration — POST /merchants/register
 */
export interface MerchantRegistrationData {
  // Required
  full_name: string
  email: string
  msisdn: string
  password: string

  // Optional business details
  business_name?: string
  property_name?: string
  num_units?: number
  address?: string
  city?: string
  state?: string
  zip_code?: string

  // Optional payout details
  bank_name?: string
  account_no?: string
  account_holder_name?: string
  routing_number?: string
}

export type MerchantRegistrationResponse = ApiEnvelope

/**
 * Merchant Entity
 *
 * UNVERIFIED SHAPE — same OTP blocker as Customer. All fields optional by
 * design; tighten once a real GET /merchants/my-account body is observed.
 */
export interface Merchant {
  id?: string
  merchant_id?: string
  full_name?: string
  first_name?: string
  last_name?: string
  email?: string
  msisdn?: string
  is_verified?: boolean
  is_active?: boolean
  business_name?: string
  property_name?: string
  num_units?: number
  address?: string
  city?: string
  state?: string
  zip_code?: string
  bank_name?: string
  account_no?: string
  account_holder_name?: string
  routing_number?: string
  erp?: boolean
  erp_name?: string
  created_at?: string
  updated_at?: string
}

/**
 * GET /merchants/my-account
 */
export interface MerchantAccountResponse extends ApiEnvelope, Merchant {
  merchant?: Merchant
  account?: Merchant
}

/**
 * Merchant Update — PATCH /merchants/update/{merchant_id}
 * The spec accepts ONLY these four fields.
 */
export interface MerchantUpdateData {
  first_name?: string
  last_name?: string
  erp?: boolean
  erp_name?: string
}

export type MerchantUpdateResponse = ApiEnvelope & {
  merchant?: Merchant
}
