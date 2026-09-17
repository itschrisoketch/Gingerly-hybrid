import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { formatKes } from '@/lib/format'

/**
 * The banner that tells an agent what to do next.
 *
 * Brand navy ground, teal eyebrow, white copy. It is not a decorative strip: it
 * states the one action outstanding right now, with the figure attached, and a
 * way to start it. When nothing is outstanding it changes rather than
 * disappearing, so the absence of work is itself reported instead of leaving a
 * gap where a banner used to be.
 *
 * Deliberately not congratulatory in the clear state. "All rent collected" is a
 * fact worth stating once; a trophy and an exclamation mark would be the
 * celebratory register PRODUCT.md rules out, on a screen about other people's
 * housing.
 *
 * Colour notes, all measured against the navy ground:
 * - white copy 15.21:1, the supporting line at white/70 8.09:1, teal-100 eyebrow
 *   12.69:1.
 * - The action is a WHITE button with navy text, not a teal one. There is no
 *   teal value that works here: at the brand's 29% it separates from navy by
 *   only 3.08:1, and lightening it far enough to read as a surface drops white
 *   text on it to 3.78 and below. White clears 15.21:1 in both directions.
 */
export function CollectionBanner({
  unitsLate,
  outstanding,
  daysLeft,
  periodLabel,
}: {
  unitsLate: number
  outstanding: number
  daysLeft: number
  periodLabel: string
}) {
  if (unitsLate === 0) {
    return (
      <section
        aria-labelledby="banner-heading"
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 sm:px-6"
      >
        <Icon name="CheckCircle" className="h-5 w-5 shrink-0 text-success-text" />
        <h2 id="banner-heading" className="text-sm font-medium text-foreground">
          All rent for {periodLabel} is collected
        </h2>
        <p className="text-sm text-muted-foreground">Nothing needs chasing today.</p>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="banner-heading"
      className="overflow-hidden rounded-2xl bg-navy-500 px-5 py-5 text-white sm:px-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-100">
            Needs your attention
          </p>

          <h2 id="banner-heading" className="mt-2 text-lg font-medium sm:text-xl">
            {unitsLate} {unitsLate === 1 ? 'unit is' : 'units are'} late this month
          </h2>

          <p className="mt-1 text-sm text-white/70">
            <span className="tabular-nums">{formatKes(outstanding)}</span> outstanding, with{' '}
            <span className="tabular-nums">{daysLeft}</span>{' '}
            {daysLeft === 1 ? 'day' : 'days'} left in {periodLabel}
          </p>
        </div>

        <Link
          href="/dashboard/landlord/payments?filter=late"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-navy-500 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-500"
        >
          Send reminders
          <Icon name="ArrowRight" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
