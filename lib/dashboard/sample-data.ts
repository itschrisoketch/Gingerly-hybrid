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
  /* Paid + late + due count LET units, so they sum to 39, not to `unitsTotal`.
     The 3 vacant units owe nobody anything. This read 34 and summed to 42,
     which quietly asserted a fully-let portfolio three units larger than the
     one `samplePortfolio` describes. */
  unitsPaid: 31,
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

export type PropertyKind = 'apartment' | 'house'

export interface Property {
  id: string
  name: string
  /** Nairobi neighbourhood. Two properties can share a name; none share an area. */
  area: string
  kind: PropertyKind
  units: number
  occupied: number
  /** Rent due this period from the let units, in KES. */
  monthlyRent: number
  /** Units past the due date. The reason an agent opens this page. */
  unitsLate: number
}

/**
 * The portfolio, property by property.
 *
 * Deliberately reconciled with the figures above rather than invented beside
 * them: these twelve sum to `samplePortfolio` (12 properties, 42 units, 39
 * occupied), their rent sums to `sampleCollection.expected` (2,940,000), and
 * their late units sum to `sampleCollection.unitsLate` (4). A properties page
 * that disagreed with the dashboard it is reached from would read as a bug in
 * review, and the arithmetic is the whole point of the screen.
 *
 * The three properties that appear in `sampleTransactions` are the first three
 * here, so a payment on the dashboard resolves to a property that exists.
 */
export const sampleProperties: Property[] = [
  { id: 'p1',  name: 'Brookside Apartments',  area: 'Westlands',   kind: 'apartment', units: 8, occupied: 8, monthlyRent: 600_000, unitsLate: 2 },
  { id: 'p2',  name: 'Kileleshwa Court',      area: 'Kileleshwa',  kind: 'apartment', units: 6, occupied: 6, monthlyRent: 396_000, unitsLate: 1 },
  { id: 'p3',  name: 'Riverside Gardens',     area: 'Riverside',   kind: 'apartment', units: 6, occupied: 5, monthlyRent: 290_000, unitsLate: 1 },
  { id: 'p4',  name: 'Lavington Mews',        area: 'Lavington',   kind: 'apartment', units: 4, occupied: 4, monthlyRent: 380_000, unitsLate: 0 },
  { id: 'p5',  name: 'Kilimani Heights',      area: 'Kilimani',    kind: 'apartment', units: 4, occupied: 3, monthlyRent: 216_000, unitsLate: 0 },
  { id: 'p6',  name: 'Ngong Road Villas',     area: 'Ngong Road',  kind: 'house',     units: 3, occupied: 3, monthlyRent: 255_000, unitsLate: 0 },
  { id: 'p7',  name: 'Parklands Terrace',     area: 'Parklands',   kind: 'apartment', units: 3, occupied: 3, monthlyRent: 162_000, unitsLate: 0 },
  { id: 'p8',  name: 'Karen Cottages',        area: 'Karen',       kind: 'house',     units: 2, occupied: 2, monthlyRent: 240_000, unitsLate: 0 },
  { id: 'p9',  name: 'South B Maisonettes',   area: 'South B',     kind: 'house',     units: 2, occupied: 1, monthlyRent: 45_000,  unitsLate: 0 },
  { id: 'p10', name: 'Langata Rise',          area: "Lang'ata",    kind: 'apartment', units: 2, occupied: 2, monthlyRent: 96_000,  unitsLate: 0 },
  { id: 'p11', name: 'Runda Homestead',       area: 'Runda',       kind: 'house',     units: 1, occupied: 1, monthlyRent: 180_000, unitsLate: 0 },
  { id: 'p12', name: 'Muthaiga Close',        area: 'Muthaiga',    kind: 'house',     units: 1, occupied: 1, monthlyRent: 80_000,  unitsLate: 0 },
]

export type TenantStatus = 'paid' | 'due' | 'late'

export interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  /** Matches a `sampleProperties` name. */
  property: string
  unit: string
  /** Rent for this unit this period, in KES. */
  rent: number
  status: TenantStatus
  /** ISO date. */
  moveIn: string
  /** ISO date. Leases here run a year. */
  leaseEnd: string
}

/**
 * One tenant per let unit.
 *
 * Reconciled with everything above, and the arithmetic is checked rather than
 * eyeballed — `scripts/verify-sample-data.mjs`, run by `pnpm verify:data`:
 *
 * - 39 tenants, one per occupied unit in `sampleProperties`.
 * - Per property, the tenants' rent sums to that property's `monthlyRent` and
 *   their late count matches its `unitsLate`.
 * - 4 late and 4 due, summing to the 555,000 outstanding; the 31 paid sum to
 *   `sampleCollection.collected`.
 * - The six tenants in `sampleTransactions` appear here on the same unit for the
 *   same amount, so a payment on the dashboard resolves to a real person.
 *
 * Emails use `example.com`, which is reserved by RFC 2606 for exactly this and
 * cannot deliver to anybody. Phone numbers are Kenyan-shaped and invented.
 *
 * No tenant rating. The page this replaced scored each person out of five, which
 * was fabricated, and a star rating on a human being attached to their housing
 * is not a thing this product should render even when the number is real.
 */
export const sampleTenants: Tenant[] = [
  { id: 'tn1', name: 'Grace Wanjiku', email: 'grace.wanjiku@example.com', phone: '+254 712 091 387', property: 'Brookside Apartments', unit: 'A2', rent: 72_000, status: 'paid', moveIn: '2026-01-15', leaseEnd: '2027-01-14' },
  { id: 'tn2', name: 'Peter Njoroge', email: 'peter.njoroge@example.com', phone: '+254 712 183 387', property: 'Brookside Apartments', unit: 'B4', rent: 85_000, status: 'late', moveIn: '2025-12-01', leaseEnd: '2026-11-30' },
  { id: 'tn3', name: 'Esther Nyambura', email: 'esther.nyambura@example.com', phone: '+254 712 276 000', property: 'Brookside Apartments', unit: 'A1', rent: 78_000, status: 'late', moveIn: '2026-04-01', leaseEnd: '2027-03-31' },
  { id: 'tn4', name: 'James Mwangi', email: 'james.mwangi@example.com', phone: '+254 712 369 226', property: 'Brookside Apartments', unit: 'A3', rent: 75_000, status: 'due', moveIn: '2025-11-01', leaseEnd: '2026-10-31' },
  { id: 'tn5', name: 'Caroline Chebet', email: 'caroline.chebet@example.com', phone: '+254 712 463 065', property: 'Brookside Apartments', unit: 'A4', rent: 72_000, status: 'paid', moveIn: '2026-06-01', leaseEnd: '2027-05-31' },
  { id: 'tn6', name: 'Brian Ochieng', email: 'brian.ochieng@example.com', phone: '+254 712 557 517', property: 'Brookside Apartments', unit: 'B1', rent: 70_000, status: 'paid', moveIn: '2026-03-01', leaseEnd: '2027-02-28' },
  { id: 'tn7', name: 'Faith Wairimu', email: 'faith.wairimu@example.com', phone: '+254 712 652 582', property: 'Brookside Apartments', unit: 'B2', rent: 76_000, status: 'paid', moveIn: '2026-08-01', leaseEnd: '2027-07-31' },
  { id: 'tn8', name: 'Dennis Kariuki', email: 'dennis.kariuki@example.com', phone: '+254 712 748 260', property: 'Brookside Apartments', unit: 'B3', rent: 72_000, status: 'paid', moveIn: '2026-01-01', leaseEnd: '2026-12-31' },
  { id: 'tn9', name: 'Daniel Kimani', email: 'daniel.kimani@example.com', phone: '+254 712 844 551', property: 'Kileleshwa Court', unit: '9', rent: 64_000, status: 'paid', moveIn: '2026-05-01', leaseEnd: '2027-04-30' },
  { id: 'tn10', name: 'Samuel Otieno', email: 'samuel.otieno@example.com', phone: '+254 712 941 455', property: 'Kileleshwa Court', unit: '14', rent: 68_000, status: 'paid', moveIn: '2026-07-01', leaseEnd: '2027-06-30' },
  { id: 'tn11', name: 'Lucy Njeri', email: 'lucy.njeri@example.com', phone: '+254 713 038 972', property: 'Kileleshwa Court', unit: '3', rent: 66_000, status: 'late', moveIn: '2025-11-01', leaseEnd: '2026-10-31' },
  { id: 'tn12', name: 'Anthony Mutua', email: 'anthony.mutua@example.com', phone: '+254 713 137 102', property: 'Kileleshwa Court', unit: '5', rent: 66_000, status: 'due', moveIn: '2026-09-01', leaseEnd: '2027-08-31' },
  { id: 'tn13', name: 'Winnie Adhiambo', email: 'winnie.adhiambo@example.com', phone: '+254 713 235 845', property: 'Kileleshwa Court', unit: '11', rent: 66_000, status: 'paid', moveIn: '2026-02-01', leaseEnd: '2027-01-31' },
  { id: 'tn14', name: 'Collins Kiprop', email: 'collins.kiprop@example.com', phone: '+254 713 335 201', property: 'Kileleshwa Court', unit: '12', rent: 66_000, status: 'paid', moveIn: '2026-04-01', leaseEnd: '2027-03-31' },
  { id: 'tn15', name: 'Mercy Achieng', email: 'mercy.achieng@example.com', phone: '+254 713 435 170', property: 'Riverside Gardens', unit: '7C', rent: 55_000, status: 'due', moveIn: '2026-03-01', leaseEnd: '2027-02-28' },
  { id: 'tn16', name: 'Alice Muthoni', email: 'alice.muthoni@example.com', phone: '+254 713 535 752', property: 'Riverside Gardens', unit: 'C1', rent: 60_000, status: 'paid', moveIn: '2025-12-01', leaseEnd: '2026-11-30' },
  { id: 'tn17', name: 'Victor Omondi', email: 'victor.omondi@example.com', phone: '+254 713 636 947', property: 'Riverside Gardens', unit: 'A3', rent: 58_000, status: 'late', moveIn: '2026-06-01', leaseEnd: '2027-05-31' },
  { id: 'tn18', name: 'Rose Kamau', email: 'rose.kamau@example.com', phone: '+254 713 738 755', property: 'Riverside Gardens', unit: 'B2', rent: 59_000, status: 'paid', moveIn: '2026-10-01', leaseEnd: '2027-09-30' },
  { id: 'tn19', name: 'Kelvin Barasa', email: 'kelvin.barasa@example.com', phone: '+254 713 841 176', property: 'Riverside Gardens', unit: 'C4', rent: 58_000, status: 'paid', moveIn: '2026-05-01', leaseEnd: '2027-04-30' },
  { id: 'tn20', name: 'Nancy Wangari', email: 'nancy.wangari@example.com', phone: '+254 713 944 210', property: 'Lavington Mews', unit: '1', rent: 95_000, status: 'paid', moveIn: '2026-07-01', leaseEnd: '2027-06-30' },
  { id: 'tn21', name: 'George Kiplagat', email: 'george.kiplagat@example.com', phone: '+254 714 047 857', property: 'Lavington Mews', unit: '2', rent: 95_000, status: 'paid', moveIn: '2026-01-01', leaseEnd: '2026-12-31' },
  { id: 'tn22', name: 'Beatrice Akinyi', email: 'beatrice.akinyi@example.com', phone: '+254 714 152 117', property: 'Lavington Mews', unit: '3', rent: 95_000, status: 'paid', moveIn: '2026-11-01', leaseEnd: '2027-10-31' },
  { id: 'tn23', name: 'Patrick Maina', email: 'patrick.maina@example.com', phone: '+254 714 256 990', property: 'Lavington Mews', unit: '4', rent: 95_000, status: 'paid', moveIn: '2026-04-01', leaseEnd: '2027-03-31' },
  { id: 'tn24', name: 'Sylvia Cherono', email: 'sylvia.cherono@example.com', phone: '+254 714 362 476', property: 'Kilimani Heights', unit: '2A', rent: 72_000, status: 'due', moveIn: '2025-11-01', leaseEnd: '2026-10-31' },
  { id: 'tn25', name: 'Martin Gitonga', email: 'martin.gitonga@example.com', phone: '+254 714 468 575', property: 'Kilimani Heights', unit: '2B', rent: 72_000, status: 'paid', moveIn: '2026-08-01', leaseEnd: '2027-07-31' },
  { id: 'tn26', name: 'Joyce Wambui', email: 'joyce.wambui@example.com', phone: '+254 714 575 287', property: 'Kilimani Heights', unit: '3A', rent: 72_000, status: 'paid', moveIn: '2026-03-01', leaseEnd: '2027-02-28' },
  { id: 'tn27', name: 'Eric Mbugua', email: 'eric.mbugua@example.com', phone: '+254 714 682 612', property: 'Ngong Road Villas', unit: 'Villa 1', rent: 85_000, status: 'paid', moveIn: '2026-06-01', leaseEnd: '2027-05-31' },
  { id: 'tn28', name: 'Priscilla Nekesa', email: 'priscilla.nekesa@example.com', phone: '+254 714 790 550', property: 'Ngong Road Villas', unit: 'Villa 2', rent: 85_000, status: 'paid', moveIn: '2026-02-01', leaseEnd: '2027-01-31' },
  { id: 'tn29', name: 'Hassan Abdi', email: 'hassan.abdi@example.com', phone: '+254 714 899 101', property: 'Ngong Road Villas', unit: 'Villa 3', rent: 85_000, status: 'paid', moveIn: '2026-09-01', leaseEnd: '2027-08-31' },
  { id: 'tn30', name: 'Zainab Yusuf', email: 'zainab.yusuf@example.com', phone: '+254 715 008 265', property: 'Parklands Terrace', unit: '1B', rent: 54_000, status: 'paid', moveIn: '2026-05-01', leaseEnd: '2027-04-30' },
  { id: 'tn31', name: 'Stephen Ndung\'u', email: 'stephen.ndungu@example.com', phone: '+254 715 118 042', property: 'Parklands Terrace', unit: '2C', rent: 54_000, status: 'paid', moveIn: '2025-12-01', leaseEnd: '2026-11-30' },
  { id: 'tn32', name: 'Millicent Auma', email: 'millicent.auma@example.com', phone: '+254 715 228 432', property: 'Parklands Terrace', unit: '3D', rent: 54_000, status: 'paid', moveIn: '2026-07-01', leaseEnd: '2027-06-30' },
  { id: 'tn33', name: 'Angela Mutiso', email: 'angela.mutiso@example.com', phone: '+254 715 339 435', property: 'Karen Cottages', unit: 'Cottage A', rent: 120_000, status: 'paid', moveIn: '2026-04-01', leaseEnd: '2027-03-31' },
  { id: 'tn34', name: 'Ian Rotich', email: 'ian.rotich@example.com', phone: '+254 715 451 051', property: 'Karen Cottages', unit: 'Cottage B', rent: 120_000, status: 'paid', moveIn: '2026-10-01', leaseEnd: '2027-09-30' },
  { id: 'tn35', name: 'Dorcas Kilonzo', email: 'dorcas.kilonzo@example.com', phone: '+254 715 563 280', property: 'South B Maisonettes', unit: '2', rent: 45_000, status: 'paid', moveIn: '2026-03-01', leaseEnd: '2027-02-28' },
  { id: 'tn36', name: 'Tabitha Moraa', email: 'tabitha.moraa@example.com', phone: '+254 715 676 122', property: 'Langata Rise', unit: '1A', rent: 48_000, status: 'paid', moveIn: '2026-06-01', leaseEnd: '2027-05-31' },
  { id: 'tn37', name: 'Felix Onyango', email: 'felix.onyango@example.com', phone: '+254 715 789 577', property: 'Langata Rise', unit: '1B', rent: 48_000, status: 'paid', moveIn: '2026-01-01', leaseEnd: '2026-12-31' },
  { id: 'tn38', name: 'Nicholas Waweru', email: 'nicholas.waweru@example.com', phone: '+254 715 903 645', property: 'Runda Homestead', unit: 'Main house', rent: 180_000, status: 'paid', moveIn: '2026-08-01', leaseEnd: '2027-07-31' },
  { id: 'tn39', name: 'Hellen Chepkoech', email: 'hellen.chepkoech@example.com', phone: '+254 716 018 326', property: 'Muthaiga Close', unit: 'Main house', rent: 80_000, status: 'paid', moveIn: '2026-05-01', leaseEnd: '2027-04-30' },
]

/**
 * Collection state for the current period.
 *
 * `paid` and `pending` settle or will; `failed` is an attempt that did not go
 * through; `late` is past the due date with no attempt at all. Failed and late
 * are both arrears — the difference is whether the tenant tried, which is the
 * difference between a retry and a phone call.
 */
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'late'

export interface Payment {
  id: string
  tenant: string
  unit: string
  property: string
  /** Rent due for the unit this period, in KES. */
  amount: number
  status: PaymentStatus
  /** Absent on `late`: there was no attempt to carry a method. */
  method?: TxMethod
  /** ISO timestamp of the attempt. Absent on `late`. */
  at?: string
  /** M-Pesa style confirmation code. Only on settled payments. */
  reference?: string
  /** Why it failed, so the row can say what to do about it. */
  note?: string
}

/**
 * One row per let unit, newest attempt first.
 *
 * Not a log of successful transactions — the rent an agent most needs to see is
 * the rent that has NOT arrived, and a ledger of payments that happened cannot
 * show an absence. So the unpaid units are rows here too, carrying no method and
 * no timestamp, which is what makes `?filter=late` a real destination for the
 * "Send reminders" buttons on the dashboard and tenants banners.
 *
 * Reconciled with `sampleTenants` and checked by `pnpm verify:data`: one row per
 * tenant at that tenant's rent, the paid rows summing to
 * `sampleCollection.collected`, and the status counts matching
 * `sampleCollection`. The six rows that also appear in `sampleTransactions`
 * carry the same method and timestamp, so the dashboard's recent-payments card
 * and this ledger describe the same moments rather than two versions of them.
 */
export const samplePayments: Payment[] = [
  { id: 'pay1', tenant: 'Sylvia Cherono', unit: '2A', property: 'Kilimani Heights', amount: 72_000, status: 'pending', method: 'M-Pesa', at: '2026-09-16T14:04:00Z' },
  { id: 'pay2', tenant: 'James Mwangi', unit: 'A3', property: 'Brookside Apartments', amount: 75_000, status: 'pending', method: 'M-Pesa', at: '2026-09-15T16:04:00Z' },
  { id: 'pay3', tenant: 'Grace Wanjiku', unit: 'A2', property: 'Brookside Apartments', amount: 72_000, status: 'paid', method: 'M-Pesa', at: '2026-09-15T09:12:00Z', reference: 'U2RHPDHPDN' },
  { id: 'pay4', tenant: 'Daniel Kimani', unit: '9', property: 'Kileleshwa Court', amount: 64_000, status: 'paid', method: 'M-Pesa', at: '2026-09-15T07:48:00Z', reference: '0EQKX7LAMF' },
  { id: 'pay5', tenant: 'Anthony Mutua', unit: '5', property: 'Kileleshwa Court', amount: 66_000, status: 'pending', method: 'M-Pesa', at: '2026-09-14T17:55:00Z' },
  { id: 'pay6', tenant: 'Patrick Maina', unit: '4', property: 'Lavington Mews', amount: 95_000, status: 'paid', method: 'M-Pesa', at: '2026-09-14T17:50:00Z', reference: '6LWZLW39BU' },
  { id: 'pay7', tenant: 'Peter Njoroge', unit: 'B4', property: 'Brookside Apartments', amount: 85_000, status: 'failed', method: 'Bank transfer', at: '2026-09-14T16:20:00Z', note: 'Insufficient funds' },
  { id: 'pay8', tenant: 'Mercy Achieng', unit: '7C', property: 'Riverside Gardens', amount: 55_000, status: 'pending', method: 'M-Pesa', at: '2026-09-14T14:05:00Z' },
  { id: 'pay9', tenant: 'Samuel Otieno', unit: '14', property: 'Kileleshwa Court', amount: 68_000, status: 'paid', method: 'Card', at: '2026-09-14T11:32:00Z', reference: 'HNBH74TYEE' },
  { id: 'pay10', tenant: 'Beatrice Akinyi', unit: '3', property: 'Lavington Mews', amount: 95_000, status: 'paid', method: 'Bank transfer', at: '2026-09-14T08:36:00Z', reference: 'MR8A120MVA' },
  { id: 'pay11', tenant: 'Alice Muthoni', unit: 'C1', property: 'Riverside Gardens', amount: 60_000, status: 'paid', method: 'M-Pesa', at: '2026-09-13T18:55:00Z', reference: 'VXGFVXKU3F' },
  { id: 'pay12', tenant: 'Lucy Njeri', unit: '3', property: 'Kileleshwa Court', amount: 66_000, status: 'failed', method: 'M-Pesa', at: '2026-09-12T08:41:00Z', note: 'Request cancelled by user' },
  { id: 'pay13', tenant: 'Dennis Kariuki', unit: 'B3', property: 'Brookside Apartments', amount: 72_000, status: 'paid', method: 'Card', at: '2026-09-11T07:45:00Z', reference: 'QBM84Z1UW7' },
  { id: 'pay14', tenant: 'Nicholas Waweru', unit: 'Main house', property: 'Runda Homestead', amount: 180_000, status: 'paid', method: 'M-Pesa', at: '2026-09-09T07:00:00Z', reference: 'AK0J4AC09E' },
  { id: 'pay15', tenant: 'Brian Ochieng', unit: 'B1', property: 'Brookside Apartments', amount: 70_000, status: 'paid', method: 'Card', at: '2026-09-08T14:49:00Z', reference: 'PJPJFML548' },
  { id: 'pay16', tenant: 'Zainab Yusuf', unit: '1B', property: 'Parklands Terrace', amount: 54_000, status: 'paid', method: 'Card', at: '2026-09-07T16:58:00Z', reference: 'PECQHR9UBG' },
  { id: 'pay17', tenant: 'Collins Kiprop', unit: '12', property: 'Kileleshwa Court', amount: 66_000, status: 'paid', method: 'M-Pesa', at: '2026-09-07T08:58:00Z', reference: 'VDKVK5QMV2' },
  { id: 'pay18', tenant: 'Nancy Wangari', unit: '1', property: 'Lavington Mews', amount: 95_000, status: 'paid', method: 'M-Pesa', at: '2026-09-07T08:06:00Z', reference: '0ABGRPYRH3' },
  { id: 'pay19', tenant: 'Ian Rotich', unit: 'Cottage B', property: 'Karen Cottages', amount: 120_000, status: 'paid', method: 'Bank transfer', at: '2026-09-06T09:59:00Z', reference: '3RNNFZ8099' },
  { id: 'pay20', tenant: 'Millicent Auma', unit: '3D', property: 'Parklands Terrace', amount: 54_000, status: 'paid', method: 'M-Pesa', at: '2026-09-06T09:46:00Z', reference: 'A2XP1UWH7B' },
  { id: 'pay21', tenant: 'Caroline Chebet', unit: 'A4', property: 'Brookside Apartments', amount: 72_000, status: 'paid', method: 'M-Pesa', at: '2026-09-05T16:48:00Z', reference: 'PJ926ESXE3' },
  { id: 'pay22', tenant: 'Stephen Ndung\'u', unit: '2C', property: 'Parklands Terrace', amount: 54_000, status: 'paid', method: 'Bank transfer', at: '2026-09-05T15:21:00Z', reference: 'XYEPZ2FBE6' },
  { id: 'pay23', tenant: 'George Kiplagat', unit: '2', property: 'Lavington Mews', amount: 95_000, status: 'paid', method: 'M-Pesa', at: '2026-09-05T10:07:00Z', reference: 'SPV5L081MN' },
  { id: 'pay24', tenant: 'Joyce Wambui', unit: '3A', property: 'Kilimani Heights', amount: 72_000, status: 'paid', method: 'M-Pesa', at: '2026-09-05T09:04:00Z', reference: 'RU53R5D1C1' },
  { id: 'pay25', tenant: 'Angela Mutiso', unit: 'Cottage A', property: 'Karen Cottages', amount: 120_000, status: 'paid', method: 'Card', at: '2026-09-04T18:06:00Z', reference: 'B55MP43TEU' },
  { id: 'pay26', tenant: 'Rose Kamau', unit: 'B2', property: 'Riverside Gardens', amount: 59_000, status: 'paid', method: 'M-Pesa', at: '2026-09-04T17:49:00Z', reference: '06RJ4YJ7RT' },
  { id: 'pay27', tenant: 'Hassan Abdi', unit: 'Villa 3', property: 'Ngong Road Villas', amount: 85_000, status: 'paid', method: 'Bank transfer', at: '2026-09-04T16:10:00Z', reference: 'DRRPNCP9UZ' },
  { id: 'pay28', tenant: 'Hellen Chepkoech', unit: 'Main house', property: 'Muthaiga Close', amount: 80_000, status: 'paid', method: 'Bank transfer', at: '2026-09-04T15:02:00Z', reference: '8JLHH4F3SL' },
  { id: 'pay29', tenant: 'Dorcas Kilonzo', unit: '2', property: 'South B Maisonettes', amount: 45_000, status: 'paid', method: 'M-Pesa', at: '2026-09-04T08:28:00Z', reference: 'SR79ZNWAEN' },
  { id: 'pay30', tenant: 'Felix Onyango', unit: '1B', property: 'Langata Rise', amount: 48_000, status: 'paid', method: 'Bank transfer', at: '2026-09-03T18:50:00Z', reference: 'UZB9HEWWAV' },
  { id: 'pay31', tenant: 'Faith Wairimu', unit: 'B2', property: 'Brookside Apartments', amount: 76_000, status: 'paid', method: 'M-Pesa', at: '2026-09-03T18:34:00Z', reference: '4G2PU28MMM' },
  { id: 'pay32', tenant: 'Winnie Adhiambo', unit: '11', property: 'Kileleshwa Court', amount: 66_000, status: 'paid', method: 'M-Pesa', at: '2026-09-03T17:41:00Z', reference: 'JKLF4MJUCL' },
  { id: 'pay33', tenant: 'Kelvin Barasa', unit: 'C4', property: 'Riverside Gardens', amount: 58_000, status: 'paid', method: 'Bank transfer', at: '2026-09-03T10:49:00Z', reference: '1XSVYQKS6Y' },
  { id: 'pay34', tenant: 'Priscilla Nekesa', unit: 'Villa 2', property: 'Ngong Road Villas', amount: 85_000, status: 'paid', method: 'Card', at: '2026-09-03T09:41:00Z', reference: 'WUXH6TXN31' },
  { id: 'pay35', tenant: 'Tabitha Moraa', unit: '1A', property: 'Langata Rise', amount: 48_000, status: 'paid', method: 'Bank transfer', at: '2026-09-02T18:03:00Z', reference: '99SW6JXU5A' },
  { id: 'pay36', tenant: 'Martin Gitonga', unit: '2B', property: 'Kilimani Heights', amount: 72_000, status: 'paid', method: 'M-Pesa', at: '2026-09-02T10:38:00Z', reference: '6P9CW2J9SG' },
  { id: 'pay37', tenant: 'Eric Mbugua', unit: 'Villa 1', property: 'Ngong Road Villas', amount: 85_000, status: 'paid', method: 'M-Pesa', at: '2026-09-01T11:59:00Z', reference: '9KUNMSCY9Y' },
  { id: 'pay38', tenant: 'Esther Nyambura', unit: 'A1', property: 'Brookside Apartments', amount: 78_000, status: 'late' },
  { id: 'pay39', tenant: 'Victor Omondi', unit: 'A3', property: 'Riverside Gardens', amount: 58_000, status: 'late' },
]

export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'heating'
  | 'structural'
  | 'security'
  | 'other'

/** `open` has nobody on it yet; `scheduled` has a contractor and a date. */
export type MaintenanceStatus = 'open' | 'scheduled' | 'in_progress' | 'resolved'

export type MaintenancePriority = 'urgent' | 'normal' | 'low'

export interface MaintenanceRequest {
  id: string
  title: string
  category: MaintenanceCategory
  priority: MaintenancePriority
  status: MaintenanceStatus
  /** Matches a `sampleTenants` name, on that tenant's own unit. */
  tenant: string
  unit: string
  property: string
  /** ISO timestamp the tenant reported it. */
  raisedAt: string
  /** ISO timestamp. Present only on `resolved`. */
  resolvedAt?: string
  /** ISO date of the contractor's visit. Present once a job is `scheduled` or
   *  `in_progress` — which is what distinguishes those from `open`. */
  scheduledFor?: string
  /** 24-hour `HH:mm` slot for that visit. A booking with no time is not a
   *  booking anyone can keep. */
  scheduledTime?: string
  /** The contractor. Absent while a job is still unassigned. */
  assignee?: string
  /** What the agent needs to know before picking up the phone. */
  note?: string
}

/**
 * Maintenance reported by tenants, newest first.
 *
 * Every request belongs to a real tenant on that tenant's own unit, checked by
 * `pnpm verify:data`, so a job on this page resolves to a person on the tenants
 * page and a property on the properties page.
 *
 * The invariants that make the states mean something are checked too: only
 * `resolved` carries a `resolvedAt`, nothing is resolved before it was raised,
 * and `scheduled` and `in_progress` always have somebody assigned — an
 * in-progress job with no contractor is a status nobody can act on.
 */
export const sampleMaintenance: MaintenanceRequest[] = [
  { id: 'mr1', title: 'Kitchen tap dripping continuously', category: 'plumbing', priority: 'normal', status: 'resolved', tenant: 'Grace Wanjiku', unit: 'A2', property: 'Brookside Apartments', raisedAt: '2026-08-14T08:20:00Z', resolvedAt: '2026-08-16T11:05:00Z', assignee: 'Otieno Plumbing' },
  { id: 'mr2', title: 'No hot water in the shower', category: 'heating', priority: 'urgent', status: 'in_progress', tenant: 'Peter Njoroge', unit: 'B4', property: 'Brookside Apartments', raisedAt: '2026-09-17T06:45:00Z', scheduledFor: '2026-09-22', scheduledTime: '09:00', assignee: 'Kamau Heating', note: 'Replacement element ordered, fitting Tuesday' },
  { id: 'mr3', title: 'Bedroom socket sparking', category: 'electrical', priority: 'urgent', status: 'open', tenant: 'Esther Nyambura', unit: 'A1', property: 'Brookside Apartments', raisedAt: '2026-09-20T19:10:00Z', note: 'Tenant advised to stop using the socket' },
  { id: 'mr4', title: 'Bathroom door will not lock', category: 'security', priority: 'normal', status: 'scheduled', tenant: 'Mercy Achieng', unit: '7C', property: 'Riverside Gardens', raisedAt: '2026-09-15T13:30:00Z', scheduledFor: '2026-09-23', scheduledTime: '11:00', assignee: 'Fix-It Nairobi' },
  { id: 'mr5', title: 'Ceiling stain spreading after the rain', category: 'structural', priority: 'normal', status: 'in_progress', tenant: 'Daniel Kimani', unit: '9', property: 'Kileleshwa Court', raisedAt: '2026-09-12T09:05:00Z', scheduledFor: '2026-09-25', scheduledTime: '08:30', assignee: 'Mwangi Builders', note: 'Roof inspected, waiting on dry weather' },
  { id: 'mr6', title: 'Blocked kitchen sink', category: 'plumbing', priority: 'normal', status: 'resolved', tenant: 'Alice Muthoni', unit: 'C1', property: 'Riverside Gardens', raisedAt: '2026-09-08T17:40:00Z', resolvedAt: '2026-09-09T10:15:00Z', assignee: 'Otieno Plumbing' },
  { id: 'mr7', title: 'Security light at the gate not working', category: 'electrical', priority: 'normal', status: 'resolved', tenant: 'Samuel Otieno', unit: '14', property: 'Kileleshwa Court', raisedAt: '2026-09-05T20:00:00Z', resolvedAt: '2026-09-07T08:30:00Z', assignee: 'Bright Spark Electrical' },
  { id: 'mr8', title: 'Water pressure very low in the mornings', category: 'plumbing', priority: 'low', status: 'open', tenant: 'Lucy Njeri', unit: '3', property: 'Kileleshwa Court', raisedAt: '2026-09-19T07:15:00Z' },
  { id: 'mr9', title: 'Front gate intercom silent', category: 'security', priority: 'normal', status: 'open', tenant: 'Victor Omondi', unit: 'A3', property: 'Riverside Gardens', raisedAt: '2026-09-18T16:25:00Z' },
  { id: 'mr10', title: 'Extractor fan rattling loudly', category: 'other', priority: 'low', status: 'scheduled', tenant: 'Nancy Wangari', unit: '1', property: 'Lavington Mews', raisedAt: '2026-09-16T11:50:00Z', scheduledFor: '2026-09-29', scheduledTime: '14:00', assignee: 'Fix-It Nairobi' },
  { id: 'mr11', title: 'Toilet cistern running', category: 'plumbing', priority: 'normal', status: 'resolved', tenant: 'James Mwangi', unit: 'A3', property: 'Brookside Apartments', raisedAt: '2026-09-02T09:30:00Z', resolvedAt: '2026-09-03T14:20:00Z', assignee: 'Otieno Plumbing' },
  { id: 'mr12', title: 'Window latch broken in the lounge', category: 'structural', priority: 'low', status: 'resolved', tenant: 'Caroline Chebet', unit: 'A4', property: 'Brookside Apartments', raisedAt: '2026-08-28T15:10:00Z', resolvedAt: '2026-09-01T09:45:00Z', assignee: 'Mwangi Builders' },
  { id: 'mr13', title: 'Hallway bulbs keep blowing', category: 'electrical', priority: 'low', status: 'resolved', tenant: 'Brian Ochieng', unit: 'B1', property: 'Brookside Apartments', raisedAt: '2026-08-25T18:05:00Z', resolvedAt: '2026-08-27T12:00:00Z', assignee: 'Bright Spark Electrical' },
  { id: 'mr14', title: 'Fridge not cooling', category: 'other', priority: 'normal', status: 'resolved', tenant: 'Faith Wairimu', unit: 'B2', property: 'Brookside Apartments', raisedAt: '2026-09-10T12:35:00Z', resolvedAt: '2026-09-13T16:40:00Z', assignee: 'Cool Tech Appliances' },
  { id: 'mr15', title: 'Shower drain slow', category: 'plumbing', priority: 'low', status: 'scheduled', tenant: 'Anthony Mutua', unit: '5', property: 'Kileleshwa Court', raisedAt: '2026-09-14T08:55:00Z', scheduledFor: '2026-09-24', scheduledTime: '10:30', assignee: 'Otieno Plumbing' },
  { id: 'mr16', title: 'Balcony railing loose', category: 'structural', priority: 'urgent', status: 'scheduled', tenant: 'Sylvia Cherono', unit: '2A', property: 'Kilimani Heights', raisedAt: '2026-09-19T10:20:00Z', scheduledFor: '2026-09-22', scheduledTime: '08:00', assignee: 'Mwangi Builders', note: 'Balcony not to be used until fixed' },
  { id: 'mr17', title: 'Boiler making knocking noise', category: 'heating', priority: 'normal', status: 'open', tenant: 'Martin Gitonga', unit: '2B', property: 'Kilimani Heights', raisedAt: '2026-09-20T07:30:00Z' },
  { id: 'mr18', title: 'Gutter overflowing at the back', category: 'structural', priority: 'normal', status: 'resolved', tenant: 'Eric Mbugua', unit: 'Villa 1', property: 'Ngong Road Villas', raisedAt: '2026-08-20T14:15:00Z', resolvedAt: '2026-08-24T11:30:00Z', assignee: 'Mwangi Builders' },
  { id: 'mr19', title: 'Bedroom window will not close fully', category: 'structural', priority: 'normal', status: 'resolved', tenant: 'Zainab Yusuf', unit: '1B', property: 'Parklands Terrace', raisedAt: '2026-09-04T10:05:00Z', resolvedAt: '2026-09-06T15:25:00Z', assignee: 'Fix-It Nairobi' },
  { id: 'mr20', title: 'Garden tap leaking at the joint', category: 'plumbing', priority: 'low', status: 'resolved', tenant: 'Angela Mutiso', unit: 'Cottage A', property: 'Karen Cottages', raisedAt: '2026-08-30T16:45:00Z', resolvedAt: '2026-09-02T09:10:00Z', assignee: 'Otieno Plumbing' },
]

export type DiaryKind = 'inspection' | 'meeting' | 'viewing'

export interface DiaryEntry {
  id: string
  kind: DiaryKind
  title: string
  /** `YYYY-MM-DD`. */
  date: string
  /** 24-hour `HH:mm`, or absent for an all-day entry. */
  time?: string
  property: string
  unit?: string
  tenant?: string
  note?: string
}

/**
 * The agent's own diary: inspections, tenant meetings and viewings.
 *
 * These are the only calendar entries NOT derived from another record. Rent,
 * contractor visits, lease ends and move-ins all belong to a payment, a job or a
 * tenancy and are read from those; an inspection belongs to nothing but the
 * diary, so it is stored.
 *
 * Every entry still points at a real property, and at a real tenant where one is
 * involved, which `pnpm verify:data` checks — a viewing on a fully let unit or a
 * meeting with a tenant who does not exist would both be nonsense.
 */
export const sampleDiary: DiaryEntry[] = [
  { id: 'dy1', kind: 'inspection', title: 'Quarterly inspection', date: '2026-09-24', time: '10:00', property: 'Brookside Apartments', note: 'Communal areas and the roof after the ceiling report' },
  { id: 'dy2', kind: 'meeting', title: 'Lease renewal with Lucy Njeri', date: '2026-09-26', time: '15:00', property: 'Kileleshwa Court', unit: '3', tenant: 'Lucy Njeri', note: 'Lease ends 31 October' },
  { id: 'dy3', kind: 'viewing', title: 'Viewing — vacant 2-bed', date: '2026-09-23', time: '12:30', property: 'Riverside Gardens', note: 'Two applicants booked back to back' },
  { id: 'dy4', kind: 'meeting', title: 'Lease renewal with James Mwangi', date: '2026-09-28', time: '09:30', property: 'Brookside Apartments', unit: 'A3', tenant: 'James Mwangi', note: 'Lease ends 31 October' },
  { id: 'dy5', kind: 'inspection', title: 'Check-out inspection', date: '2026-10-02', time: '11:00', property: 'South B Maisonettes', note: 'Vacant unit, ahead of re-letting' },
  { id: 'dy6', kind: 'viewing', title: 'Viewing — Kilimani Heights', date: '2026-09-30', time: '16:00', property: 'Kilimani Heights', note: 'One vacant unit' },
  { id: 'dy7', kind: 'meeting', title: 'Landlord review — Q3 figures', date: '2026-10-06', property: 'Lavington Mews', note: 'All-day: three landlords, portfolio walkthrough' },
]
