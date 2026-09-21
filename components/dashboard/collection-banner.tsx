import { Icon } from '@/components/ui/icon'
import { PageBanner } from '@/components/dashboard/page-banner'
import { formatKes } from '@/lib/format'

/**
 * The banner that tells an agent what to do next.
 *
 * The navy shell lives in PageBanner now, which the properties and tenants
 * screens also use. This file is what is specific to the dashboard: the rent
 * still owed, and what happens when nothing is owed.
 *
 * When nothing is outstanding it changes rather than disappearing, so the
 * absence of work is itself reported instead of leaving a gap where a banner
 * used to be.
 *
 * Deliberately not congratulatory in the clear state. "All rent collected" is a
 * fact worth stating once; a trophy and an exclamation mark would be the
 * celebratory register PRODUCT.md rules out, on a screen about other people's
 * housing.
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
    <PageBanner
      id="banner-heading"
      eyebrow="Needs your attention"
      title={
        <>
          {unitsLate} {unitsLate === 1 ? 'unit is' : 'units are'} late this month
        </>
      }
      description={
        <>
          <span className="tabular-nums">{formatKes(outstanding)}</span> outstanding, with{' '}
          <span className="tabular-nums">{daysLeft}</span>{' '}
          {daysLeft === 1 ? 'day' : 'days'} left in {periodLabel}
        </>
      }
      action={{ href: '/dashboard/landlord/payments?filter=late', label: 'Send reminders' }}
    />
  )
}
