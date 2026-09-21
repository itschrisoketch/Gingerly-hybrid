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

/**
 * "Grace Wanjiku" -> "GW", "Otieno" -> "OT".
 *
 * First and last, because a middle name is not what anyone recognises a person
 * by. Falls back to the first two letters of a single name, and to nothing at
 * all for an empty string — an avatar reading "UN" for "Unknown" would be a name
 * this person does not have.
 *
 * Lives here rather than beside the Avatar component because both Server and
 * Client Components call it, and `components/ui/avatar.tsx` is `'use client'`.
 */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * `YYYY-MM-DD` from a Date, using its LOCAL parts.
 *
 * Not `toISOString().slice(0, 10)`: that converts to UTC first, so a date picked
 * in Nairobi (UTC+3) any time before 03:00 comes back as the previous day. The
 * calendar hands back midnight local, which is exactly the case that breaks.
 */
export function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * `YYYY-MM-DD` to a Date at local midnight.
 *
 * `new Date('2026-09-17')` parses as UTC midnight and then displays in local
 * time, which lands on the 16th anywhere west of Greenwich. Passing the parts
 * separately keeps the day the user actually picked.
 */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Rejects anything that is not a real `YYYY-MM-DD`, so a hand-edited URL
 *  cannot put the page into an Invalid Date. */
export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return isoDate(parseIsoDate(value)) === value
}

/** "17 Sep 2026" — the year is included here, unlike `formatShortDate`, because
 *  this date can be any year the picker allows. */
const LONG_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatLongDate(iso: string): string {
  return LONG_DATE.format(parseIsoDate(iso))
}

/**
 * "Ksh 2.39M", "Ksh 72K" — for places where the exact figure will not fit.
 *
 * Only ever used where the precise number is visible right beside it: the hole
 * of a donut whose segments are itemised underneath, a tick label on an axis
 * whose tooltip carries the full amount. Rent is somebody's money and a rounded
 * figure is not an acceptable substitute for it, only an acceptable label ON it.
 */
export function formatKesCompact(amount: number): string {
  const abs = Math.abs(amount)

  // Rounded from the integer, not via toFixed. 2_385_000 / 1e6 is 2.385, which
  // is held as 2.38499999…, so toFixed(2) rounds it DOWN to "2.38" and the label
  // under-reports the money by a shilling in the third digit. Scaling to an
  // integer first and rounding there gives 2.39.
  if (abs >= 1_000_000) {
    const hundredths = Math.round(amount / 10_000)
    return abs >= 10_000_000
      ? `Ksh ${Math.round(amount / 1_000_000)}M`
      : `Ksh ${hundredths / 100}M`
  }
  if (abs >= 1_000) {
    const tenths = Math.round(amount / 100)
    return abs >= 100_000
      ? `Ksh ${Math.round(amount / 1_000)}K`
      : `Ksh ${tenths / 10}K`
  }
  return formatKes(amount)
}
