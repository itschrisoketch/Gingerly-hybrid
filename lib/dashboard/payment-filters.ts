import type { Payment } from '@/lib/dashboard/sample-data'

/**
 * The payments table's status filter, in a plain module.
 *
 * Deliberately NOT in `payments-table.tsx`. That file is `'use client'`, and a
 * runtime value exported from a client module is a client reference to any
 * Server Component that imports it — `PAYMENT_FILTERS.includes(...)` on the
 * server then throws, and because `loading.tsx` renders null the page comes back
 * as a blank 200 rather than an error. A `type` export would have been fine,
 * since types are erased; the array is not.
 *
 * This is the second time this bit in this codebase — see `initials()` in
 * `lib/format.ts`, which is here for the same reason.
 */
export type PaymentFilter = 'all' | 'paid' | 'pending' | 'late'

export const PAYMENT_FILTERS: PaymentFilter[] = ['all', 'paid', 'pending', 'late']

export const FILTER_LABEL: Record<PaymentFilter, string> = {
  all: 'All',
  paid: 'Paid',
  pending: 'Pending',
  late: 'Past due',
}

/** `late` means "past due", which covers a failed attempt as well as no attempt
 *  at all. That is the sense the dashboard and tenants banners link with. */
export function matchesFilter(p: Payment, f: PaymentFilter): boolean {
  if (f === 'all') return true
  if (f === 'late') return p.status === 'late' || p.status === 'failed'
  return p.status === f
}

export function isPaymentFilter(value: unknown): value is PaymentFilter {
  return typeof value === 'string' && (PAYMENT_FILTERS as string[]).includes(value)
}
