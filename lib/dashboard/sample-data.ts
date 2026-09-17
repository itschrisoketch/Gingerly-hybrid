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

/**
 * Collection composition by month, in KES.
 *
 * Each month sums to the rent that was due, split by how it actually arrived.
 * This is the portfolio's health in one shape: a widening `late` band is the
 * leading indicator that a portfolio is drifting, and it shows up here months
 * before it shows up in a total, because the total can stay flat while the money
 * arrives later and later.
 */
export interface CollectionMixPoint {
  month: string
  onTime: number
  late: number
  unpaid: number
}

export const sampleCollectionMix: CollectionMixPoint[] = [
  { month: '2025-10', onTime: 1_760_000, late: 220_000, unpaid: 120_000 },
  { month: '2025-11', onTime: 1_810_000, late: 240_000, unpaid: 110_000 },
  { month: '2025-12', onTime: 1_690_000, late: 430_000, unpaid: 180_000 },
  { month: '2026-01', onTime: 1_640_000, late: 300_000, unpaid: 260_000 },
  { month: '2026-02', onTime: 1_920_000, late: 290_000, unpaid: 130_000 },
  { month: '2026-03', onTime: 2_010_000, late: 295_000, unpaid: 105_000 },
  { month: '2026-04', onTime: 1_880_000, late: 300_000, unpaid: 160_000 },
  { month: '2026-05', onTime: 2_090_000, late: 330_000, unpaid: 120_000 },
  { month: '2026-06', onTime: 2_020_000, late: 370_000, unpaid: 150_000 },
  { month: '2026-07', onTime: 2_100_000, late: 410_000, unpaid: 130_000 },
  { month: '2026-08', onTime: 1_990_000, late: 470_000, unpaid: 180_000 },
  { month: '2026-09', onTime: 1_915_000, late: 470_000, unpaid: 555_000 },
]

/**
 * Daily rent inflow, in KES.
 *
 * Split by whether the money arrived before the due date or after it. Daily
 * rather than monthly because that is the shape of the thing: rent lands in a
 * burst in the first few days of a month and then trickles, and a monthly total
 * flattens that into a single bar that shows none of it.
 *
 * Unpaid is deliberately not a third series here. Never-paid is not a daily
 * event — it is the absence of one, and only resolves at month end.
 */
export interface DailyInflowPoint {
  date: string
  onTime: number
  late: number
}

export const sampleDailyInflow: DailyInflowPoint[] = [
  { date: '2026-06-20', onTime: 4276, late: 17336 },
  { date: '2026-06-21', onTime: 2332, late: 10927 },
  { date: '2026-06-22', onTime: 13318, late: 55148 },
  { date: '2026-06-23', onTime: 9281, late: 38266 },
  { date: '2026-06-24', onTime: 10040, late: 41440 },
  { date: '2026-06-25', onTime: 8731, late: 35966 },
  { date: '2026-06-26', onTime: 5882, late: 24052 },
  { date: '2026-06-27', onTime: 3957, late: 16002 },
  { date: '2026-06-28', onTime: 4114, late: 19446 },
  { date: '2026-06-29', onTime: 10887, late: 44982 },
  { date: '2026-06-30', onTime: 7950, late: 32700 },
  { date: '2026-07-01', onTime: 583216, late: 6043 },
  { date: '2026-07-02', onTime: 542136, late: 11920 },
  { date: '2026-07-03', onTime: 374609, late: 8185 },
  { date: '2026-07-04', onTime: 312594, late: 9814 },
  { date: '2026-07-05', onTime: 83774, late: 2777 },
  { date: '2026-07-06', onTime: 46000, late: 60500 },
  { date: '2026-07-07', onTime: 26200, late: 33275 },
  { date: '2026-07-08', onTime: 54240, late: 71830 },
  { date: '2026-07-09', onTime: 27080, late: 34485 },
  { date: '2026-07-10', onTime: 22480, late: 28160 },
  { date: '2026-07-11', onTime: 21240, late: 26455 },
  { date: '2026-07-12', onTime: 7056, late: 9988 },
  { date: '2026-07-13', onTime: 11437, late: 47282 },
  { date: '2026-07-14', onTime: 10260, late: 42360 },
  { date: '2026-07-15', onTime: 7983, late: 32838 },
  { date: '2026-07-16', onTime: 12966, late: 53676 },
  { date: '2026-07-17', onTime: 8137, late: 33482 },
  { date: '2026-07-18', onTime: 10920, late: 45120 },
  { date: '2026-07-19', onTime: 2932, late: 13797 },
  { date: '2026-07-20', onTime: 10986, late: 45396 },
  { date: '2026-07-21', onTime: 6509, late: 26674 },
  { date: '2026-07-22', onTime: 9556, late: 39416 },
  { date: '2026-07-23', onTime: 12383, late: 51238 },
  { date: '2026-07-24', onTime: 8918, late: 36748 },
  { date: '2026-07-25', onTime: 5849, late: 23914 },
  { date: '2026-07-26', onTime: 4006, late: 18931 },
  { date: '2026-07-27', onTime: 9259, late: 38174 },
  { date: '2026-07-28', onTime: 3946, late: 15956 },
  { date: '2026-07-29', onTime: 10381, late: 42866 },
  { date: '2026-07-30', onTime: 10524, late: 43464 },
  { date: '2026-07-31', onTime: 4463, late: 18118 },
  { date: '2026-08-01', onTime: 684512, late: 10426 },
  { date: '2026-08-02', onTime: 179230, late: 4030 },
  { date: '2026-08-03', onTime: 412516, late: 11488 },
  { date: '2026-08-04', onTime: 283698, late: 6241 },
  { date: '2026-08-05', onTime: 245050, late: 7942 },
  { date: '2026-08-06', onTime: 51240, late: 67705 },
  { date: '2026-08-07', onTime: 51440, late: 67980 },
  { date: '2026-08-08', onTime: 38040, late: 49555 },
  { date: '2026-08-09', onTime: 18536, late: 28028 },
  { date: '2026-08-10', onTime: 25800, late: 32725 },
  { date: '2026-08-11', onTime: 34960, late: 45320 },
  { date: '2026-08-12', onTime: 35960, late: 46695 },
  { date: '2026-08-13', onTime: 3946, late: 15956 },
  { date: '2026-08-14', onTime: 4925, late: 20050 },
  { date: '2026-08-15', onTime: 5772, late: 23592 },
  { date: '2026-08-16', onTime: 1900, late: 8866 },
  { date: '2026-08-17', onTime: 8742, late: 36012 },
  { date: '2026-08-18', onTime: 5145, late: 20970 },
  { date: '2026-08-19', onTime: 7752, late: 31872 },
  { date: '2026-08-20', onTime: 4155, late: 16830 },
  { date: '2026-08-21', onTime: 4298, late: 17428 },
  { date: '2026-08-22', onTime: 10997, late: 45442 },
  { date: '2026-08-23', onTime: 3929, late: 18563 },
  { date: '2026-08-24', onTime: 9039, late: 37254 },
  { date: '2026-08-25', onTime: 5838, late: 23868 },
  { date: '2026-08-26', onTime: 13769, late: 57034 },
  { date: '2026-08-27', onTime: 8720, late: 35920 },
  { date: '2026-08-28', onTime: 5211, late: 21246 },
  { date: '2026-08-29', onTime: 9138, late: 37668 },
  { date: '2026-08-30', onTime: 3540, late: 16704 },
  { date: '2026-08-31', onTime: 9996, late: 41256 },
  { date: '2026-09-01', onTime: 557008, late: 4909 },
  { date: '2026-09-02', onTime: 472073, late: 7618 },
  { date: '2026-09-03', onTime: 399605, late: 10363 },
  { date: '2026-09-04', onTime: 266156, late: 4072 },
  { date: '2026-09-05', onTime: 264900, late: 11425 },
  { date: '2026-09-06', onTime: 9632, late: 14036 },
  { date: '2026-09-07', onTime: 51560, late: 68145 },
  { date: '2026-09-08', onTime: 23600, late: 29700 },
  { date: '2026-09-09', onTime: 48600, late: 64075 },
  { date: '2026-09-10', onTime: 50720, late: 66990 },
  { date: '2026-09-11', onTime: 38600, late: 50325 },
  { date: '2026-09-12', onTime: 30160, late: 38720 },
  { date: '2026-09-13', onTime: 1238, late: 5701 },
  { date: '2026-09-14', onTime: 7906, late: 32516 },
  { date: '2026-09-15', onTime: 13901, late: 57586 },
  { date: '2026-09-16', onTime: 10876, late: 44936 },
  { date: '2026-09-17', onTime: 13087, late: 54182 },
]
