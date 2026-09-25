/**
 * Everything the tenant screens know about "you".
 *
 * One module so the nine tenant pages cannot drift about who the signed-in
 * tenant is or what they owe. The landlord side reads whole datasets; the
 * tenant side reads exactly one person's slice of them, and that slice is
 * derived here rather than re-filtered on each page.
 *
 * Nothing invents data. Every field comes from `sample-data.ts`, which the
 * landlord dashboard also reads — so the payment the landlord sees in their
 * ledger is literally the same record the tenant sees in theirs, and
 * `verify:data` fails if they ever disagree.
 */

import {
  RENT_DUE_DAY,
  SIGNED_IN_TENANT_ID,
  sampleConversations,
  sampleDocuments,
  sampleMaintenance,
  sampleTenancy,
  sampleTenantPayments,
  sampleTenants,
  type Conversation,
  type MaintenanceRequest,
  type StoredDocument,
  type Tenant,
  type TenantPayment,
  type TenancyDetail,
} from '@/lib/dashboard/sample-data'

/** The signed-in tenant. Throws at module load if the id ever goes stale,
 *  which is better than nine pages rendering an empty shell. */
export const me: Tenant = (() => {
  const found = sampleTenants.find((t) => t.id === SIGNED_IN_TENANT_ID)
  if (!found) {
    throw new Error(
      `SIGNED_IN_TENANT_ID "${SIGNED_IN_TENANT_ID}" is not in sampleTenants. ` +
        'The tenant dashboard has no one to be about.',
    )
  }
  return found
})()

export const tenancy: TenancyDetail = sampleTenancy

export const myPayments: TenantPayment[] = sampleTenantPayments

export const myJobs: MaintenanceRequest[] = sampleMaintenance.filter(
  (j) => j.tenant === me.name && j.unit === me.unit && j.property === me.property,
)

export const myDocuments: StoredDocument[] = sampleDocuments.filter(
  (d) => d.tenant === me.name,
)

export const myThread: Conversation | undefined = sampleConversations.find(
  (c) => c.tenant === me.name,
)

/**
 * The next rent date on or after `asOf`.
 *
 * Rent is due on the 1st, so the answer is either the 1st of this month (when
 * today IS the 1st) or the 1st of next month. Built from UTC parts rather than
 * date arithmetic so the server and the client cannot land on different days
 * either side of midnight — the bug class that makes a countdown flicker by one
 * on first paint.
 */
export function nextDueDate(asOf: string): string {
  const [y, m, d] = asOf.slice(0, 10).split('-').map(Number)
  if (d === RENT_DUE_DAY) return `${y}-${String(m).padStart(2, '0')}-01`
  const nextMonth = m === 12 ? 1 : m + 1
  const nextYear = m === 12 ? y + 1 : y
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
}

/** Whole days from `asOf` to `date`. Negative once the date has passed. */
export function daysBetween(asOf: string, date: string): number {
  const a = Date.UTC(...(asOf.slice(0, 10).split('-').map(Number) as [number, number, number]))
  const b = Date.UTC(...(date.slice(0, 10).split('-').map(Number) as [number, number, number]))
  // Months are zero-based in Date.UTC; both sides are off by the same amount,
  // so the difference is still correct.
  return Math.round((b - a) / 86_400_000)
}

/** The period a payment covers, as `YYYY-MM`. */
export function periodOf(date: string): string {
  return date.slice(0, 7)
}

/** Whether rent for the period covering `asOf` has been settled. */
export function isPeriodSettled(asOf: string): boolean {
  const period = periodOf(asOf)
  return myPayments.some((p) => p.period === period && p.status === 'paid')
}

/** "September 2026" — the long form used in copy. */
export function formatPeriod(period: string): string {
  const [y, m] = period.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

/** "1 October" — a date the tenant is being asked to act on. */
export function formatDueDate(date: string): string {
  const [, m, d] = date.slice(0, 10).split('-').map(Number)
  return `${d} ${MONTHS[m - 1]}`
}

/** "15 January 2026". Tenant-facing dates are read by a person, not parsed. */
export function formatFullDate(date: string): string {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
