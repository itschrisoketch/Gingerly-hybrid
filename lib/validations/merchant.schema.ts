/**
 * Merchant Validation Schemas
 * Zod schemas for merchant (landlord) related forms
 *
 * POST /merchants/register takes a single `full_name`, while
 * PATCH /merchants/update/{id} takes first_name/last_name. That asymmetry is
 * the backend's; the schemas below match it rather than papering over it.
 */

import { z } from 'zod'
import { msisdnSchema, passwordSchema } from './customer.schema'
import type { MerchantRegistrationData } from '@/lib/api/types/merchant.types'

/**
 * Merchant Registration Schema
 */
export const merchantRegistrationSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    msisdn: msisdnSchema,
    password: passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your password'),

    // Optional business details
    business_name: z.string().max(120).optional().or(z.literal('')),
    property_name: z.string().max(120).optional().or(z.literal('')),
    num_units: z.coerce
      .number()
      .int('Number of units must be a whole number')
      .nonnegative('Number of units cannot be negative')
      .optional(),
    address: z.string().max(200).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    state: z.string().max(100).optional().or(z.literal('')),
    zip_code: z.string().max(20).optional().or(z.literal('')),

    // Optional payout details
    bank_name: z.string().max(120).optional().or(z.literal('')),
    account_no: z.string().max(50).optional().or(z.literal('')),
    account_holder_name: z.string().max(120).optional().or(z.literal('')),
    routing_number: z.string().max(50).optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type MerchantRegistrationFormData = z.infer<typeof merchantRegistrationSchema>

/**
 * Map form values to the API payload: drop confirm_password and blank optionals.
 */
export function toMerchantRegistrationPayload(
  form: MerchantRegistrationFormData
): MerchantRegistrationData {
  const payload: MerchantRegistrationData = {
    full_name: form.full_name,
    email: form.email,
    msisdn: form.msisdn,
    password: form.password,
  }

  const optionalText = [
    'business_name',
    'property_name',
    'address',
    'city',
    'state',
    'zip_code',
    'bank_name',
    'account_no',
    'account_holder_name',
    'routing_number',
  ] as const

  optionalText.forEach((key) => {
    const value = form[key]
    if (value) payload[key] = value
  })

  if (typeof form.num_units === 'number' && !Number.isNaN(form.num_units)) {
    payload.num_units = form.num_units
  }

  return payload
}

/**
 * Merchant Update Schema
 * PATCH /merchants/update/{merchant_id} accepts ONLY these four fields.
 */
export const merchantUpdateSchema = z
  .object({
    first_name: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must not exceed 50 characters')
      .optional(),
    last_name: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must not exceed 50 characters')
      .optional(),
    erp: z.boolean().optional(),
    erp_name: z.string().max(120).optional(),
  })
  .refine((data) => !data.erp || (data.erp && data.erp_name), {
    message: 'ERP name is required when ERP is enabled',
    path: ['erp_name'],
  })

export type MerchantUpdateFormData = z.infer<typeof merchantUpdateSchema>
