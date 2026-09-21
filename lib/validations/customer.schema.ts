/**
 * Customer Validation Schemas
 * Zod schemas for customer (tenant) related forms
 *
 * Fields mirror POST /customers/register exactly. `confirm_password` is the
 * only client-side extra — the API rejects nothing, but it ignores it, so
 * strip it before sending (see toCustomerRegistrationPayload).
 */

import { z } from 'zod'
import type { CustomerRegistrationData } from '@/lib/api/types/customer.types'

/** Shared phone rule. The backend expects an MSISDN, e.g. 254700000001. */
export const msisdnSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number')

/** Shared password rule. */
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

/**
 * Customer Registration Schema
 */
export const customerRegistrationSchema = z
  .object({
    first_name: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must not exceed 50 characters'),
    last_name: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must not exceed 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    msisdn: msisdnSchema,
    password: passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your password'),

    // Optional tenancy details
    apartment_name: z.string().max(120).optional().or(z.literal('')),
    unit_number: z.string().max(50).optional().or(z.literal('')),
    monthly_rent: z.coerce
      .number()
      .nonnegative('Rent cannot be negative')
      .optional(),
    billing_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type CustomerRegistrationFormData = z.infer<typeof customerRegistrationSchema>

/**
 * Map form values to the API payload: drop confirm_password and any blank
 * optional field, so we never send empty strings the backend has to interpret.
 */
export function toCustomerRegistrationPayload(
  form: CustomerRegistrationFormData
): CustomerRegistrationData {
  const { confirm_password, ...rest } = form
  void confirm_password

  const payload: CustomerRegistrationData = {
    first_name: rest.first_name,
    last_name: rest.last_name,
    email: rest.email,
    msisdn: rest.msisdn,
    password: rest.password,
  }

  if (rest.apartment_name) payload.apartment_name = rest.apartment_name
  if (rest.unit_number) payload.unit_number = rest.unit_number
  if (rest.billing_date) payload.billing_date = rest.billing_date
  if (typeof rest.monthly_rent === 'number' && !Number.isNaN(rest.monthly_rent)) {
    payload.monthly_rent = rest.monthly_rent
  }

  return payload
}

/**
 * Customer Update Schema
 * PATCH /customers/update accepts ONLY these two fields.
 */
export const customerUpdateSchema = z.object({
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
})

export type CustomerUpdateFormData = z.infer<typeof customerUpdateSchema>
