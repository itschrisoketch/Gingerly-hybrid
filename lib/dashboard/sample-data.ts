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
  /** Days remaining in the collection window. */
  daysLeft: 6,
}

export interface ArrearsRow {
  id: string
  unit: string
  property: string
  tenant: string
  amount: number
  daysLate: number
  /** Last time anyone contacted this tenant, ISO date, or null if never. */
  lastContacted: string | null
}

export const sampleArrears: ArrearsRow[] = [
  {
    id: '1',
    unit: 'B4',
    property: 'Brookside Apartments',
    tenant: 'Peter Njoroge',
    amount: 85_000,
    daysLate: 19,
    lastContacted: '2026-09-09',
  },
  {
    id: '2',
    unit: 'A2',
    property: 'Brookside Apartments',
    tenant: 'Grace Wanjiku',
    amount: 72_000,
    daysLate: 12,
    lastContacted: null,
  },
  {
    id: '3',
    unit: '14',
    property: 'Kileleshwa Court',
    tenant: 'Samuel Otieno',
    amount: 68_000,
    daysLate: 9,
    lastContacted: '2026-09-12',
  },
  {
    id: '4',
    unit: '7C',
    property: 'Riverside Gardens',
    tenant: 'Mercy Achieng',
    amount: 55_000,
    daysLate: 4,
    lastContacted: '2026-09-13',
  },
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
