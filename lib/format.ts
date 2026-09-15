/**
 * Kenyan shillings, no decimals.
 *
 * Rent is quoted in whole shillings; showing `.00` on every figure adds two
 * characters of noise to every row without adding information. `en-KE` renders
 * the symbol as `Ksh`.
 */
const KES = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
})

export function formatKes(amount: number): string {
  return KES.format(amount)
}

/**
 * A short, human date: "9 Sep". The year is omitted deliberately — these appear
 * in dense rows about the current period, where the year is never in question.
 */
const SHORT_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
})

export function formatShortDate(iso: string): string {
  return SHORT_DATE.format(new Date(iso))
}
