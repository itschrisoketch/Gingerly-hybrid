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

/**
 * "Today, 09:12" / "Yesterday, 16:20" / "13 Sep, 18:55".
 *
 * Recent activity is read relative to now, so the two most common cases are
 * named rather than dated. `en-GB` gives a 24-hour clock, which is what Kenyan
 * bank and M-Pesa statements use.
 */
export function formatRelativeTime(iso: string, now = new Date()): string {
  const d = new Date(iso)
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)

  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000)

  if (days === 0) return `Today, ${time}`
  if (days === 1) return `Yesterday, ${time}`
  return `${SHORT_DATE.format(d)}, ${time}`
}
