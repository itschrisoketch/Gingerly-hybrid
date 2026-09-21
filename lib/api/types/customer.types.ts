/**
 * Customer (Tenant) Types
 *
 * Shapes verified against the live OpenAPI spec. The previous version of this
 * file described a KYC model (id_type, gender, date_of_birth, postal_code...)
 * that the API does not accept. The real model is a RENTAL one: who you are,
 * plus which unit you occupy and what you pay.
 */

import type { ApiEnvelope } from './api.types'

/**
 * Customer Registration — POST /customers/register
 * Verified live: returns 201 { msg, success } with no customer object.
 */
export interface CustomerRegistrationData {
  // Required
  first_name: string
  last_name: string
  email: string
  msisdn: string
  password: string

  // Optional tenancy details
  apartment_name?: string
  unit_number?: string
  monthly_rent?: number
  /** ISO date, e.g. "2026-10-01". */
  billing_date?: string
}

export type CustomerRegistrationResponse = ApiEnvelope

/**
 * Customer Entity
 *
 * UNVERIFIED SHAPE — GET /customers/my-account needs an activated account,
 * which is blocked on OTP delivery (see docs/backend-questions.md). Fields
 * below mirror the registration model. Everything is optional so a surprise
 * payload degrades instead of crashing; tighten once a real body is observed.
 */
export interface Customer {
  id?: string
  first_name?: string
  last_name?: string
  email?: string
  msisdn?: string
  is_verified?: boolean
  is_active?: boolean
  apartment_name?: string
  unit_number?: string
  monthly_rent?: number
  billing_date?: string
  created_at?: string
  updated_at?: string
}

/**
 * GET /customers/my-account
 * The customer may arrive at the top level or nested under `customer` —
 * `extractCustomer` in customer.service.ts handles both.
 */
export interface CustomerAccountResponse extends ApiEnvelope, Customer {
  customer?: Customer
  account?: Customer
}

/**
 * Customer Update — PATCH /customers/update?id=<id>
 * The spec accepts ONLY these two fields.
 */
export interface CustomerUpdateData {
  first_name?: string
  last_name?: string
}

export type CustomerUpdateResponse = ApiEnvelope & {
  customer?: Customer
}
