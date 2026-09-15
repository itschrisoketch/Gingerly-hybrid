/**
 * ⚠️ SAMPLE DATA — NOT REAL, NOT FROM THE API.
 *
 * No dashboard endpoints exist yet. `lib/api/services/merchant.service.ts`
 * exposes register, update, getMyAccount, getById and list — there is nothing
 * behind collection totals, arrears, or portfolio counts.
 *
 * Everything here is invented so the interface can be designed and reviewed. It
 * is isolated in one file, named unmistakably, and the dashboard renders a
 * visible notice while it is in use, because a plausible figure on a rent
 * dashboard is indistinguishable from a real one to the person reading it.
 *
 * When the endpoints land: replace the imports in the page with real queries and
 * delete this file. The notice disappears with it.
 */

export const IS_SAMPLE_DATA = true

/** Rent collection for the current period, in KES minor-unit-free shillings. */
export const sampleCollection = {
  periodLabel: 'September 2026',
  expected: 2_940_000,
  collected: 2_385_000,
  unitsTotal: 42,
  unitsPaid: 34,
  /** Past the due date. */
  unitsLate: 4,
  /** Not yet due this period. */
  unitsDue: 4,
  /** Days remaining in the collection window. */
  daysLeft: 6,
}

export type TxStatus = 'paid' | 'pending' | 'failed'
export type TxMethod = 'M-Pesa' | 'Bank transfer' | 'Card'

export interface Transaction {
  id: string
  tenant: string
  unit: string
  property: string
  amount: number
  method: TxMethod
  status: TxStatus
  /** ISO timestamp. */
  at: string
  /** Present on failures, so the row can say what to do about it. */
  note?: string
}

export const sampleTransactions: Transaction[] = [
  { id: 't1', tenant: 'Grace Wanjiku', unit: 'A2', property: 'Brookside Apartments', amount: 72_000, method: 'M-Pesa', status: 'paid', at: '2026-09-15T09:12:00Z' },
  { id: 't2', tenant: 'Daniel Kimani', unit: '9', property: 'Kileleshwa Court', amount: 64_000, method: 'M-Pesa', status: 'paid', at: '2026-09-15T07:48:00Z' },
  { id: 't3', tenant: 'Peter Njoroge', unit: 'B4', property: 'Brookside Apartments', amount: 85_000, method: 'Bank transfer', status: 'failed', at: '2026-09-14T16:20:00Z', note: 'Insufficient funds' },
  { id: 't4', tenant: 'Mercy Achieng', unit: '7C', property: 'Riverside Gardens', amount: 55_000, method: 'M-Pesa', status: 'pending', at: '2026-09-14T14:05:00Z' },
  { id: 't5', tenant: 'Samuel Otieno', unit: '14', property: 'Kileleshwa Court', amount: 68_000, method: 'Card', status: 'paid', at: '2026-09-14T11:32:00Z' },
  { id: 't6', tenant: 'Alice Muthoni', unit: 'C1', property: 'Riverside Gardens', amount: 60_000, method: 'M-Pesa', status: 'paid', at: '2026-09-13T18:55:00Z' },
]

export const samplePortfolio = {
  landlords: 3,
  properties: 12,
  units: 42,
  occupied: 39,
}

/** Monthly rent collected, in KES. Twelve points so a 7/14/30 window has data. */
export const sampleCollectionTrend = [
  { value: 1_980_000, date: 'Oct 2025' },
  { value: 2_050_000, date: 'Nov 2025' },
  { value: 2_120_000, date: 'Dec 2025' },
  { value: 1_940_000, date: 'Jan 2026' },
  { value: 2_210_000, date: 'Feb 2026' },
  { value: 2_305_000, date: 'Mar 2026' },
  { value: 2_180_000, date: 'Apr 2026' },
  { value: 2_420_000, date: 'May 2026' },
  { value: 2_390_000, date: 'Jun 2026' },
  { value: 2_510_000, date: 'Jul 2026' },
  { value: 2_460_000, date: 'Aug 2026' },
  { value: 2_385_000, date: 'Sep 2026' },
]

/** Units occupied, same periods. */
export const sampleOccupancyTrend = [
  { value: 34, date: 'Oct 2025' },
  { value: 35, date: 'Nov 2025' },
  { value: 35, date: 'Dec 2025' },
  { value: 33, date: 'Jan 2026' },
  { value: 36, date: 'Feb 2026' },
  { value: 37, date: 'Mar 2026' },
  { value: 36, date: 'Apr 2026' },
  { value: 38, date: 'May 2026' },
  { value: 38, date: 'Jun 2026' },
  { value: 39, date: 'Jul 2026' },
  { value: 39, date: 'Aug 2026' },
  { value: 39, date: 'Sep 2026' },
]
