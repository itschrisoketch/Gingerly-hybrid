import { Icon } from '@/components/ui/icon'
import { formatKes } from '@/lib/format'

/**
 * Rent collected against rent expected, for the current period.
 *
 * This leads the page because it answers the agent's first question in one
 * glance. It is deliberately not four stat tiles: the shortfall is the number
 * that gets acted on, so it is the number that gets the size, and the rest sits
 * around it as context rather than competing for the same weight.
 *
 * The measure is a `meter`, not a `progressbar` — this is a reading against a
 * known range, not a task advancing towards completion.
 */
export function CollectionSummary({
  periodLabel,
  expected,
  collected,
  unitsPaid,
  unitsTotal,
  daysLeft,
}: {
  periodLabel: string
  expected: number
  collected: number
  unitsPaid: number
  unitsTotal: number
  daysLeft: number
}) {
  const outstanding = Math.max(expected - collected, 0)
  const pct = expected > 0 ? Math.round((collected / expected) * 100) : 0
  const unitsOutstanding = unitsTotal - unitsPaid

  return (
    <section
      aria-labelledby="collection-heading"
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="collection-heading" className="text-sm font-medium text-muted-foreground">
          Collected in {periodLabel}
        </h2>
        <p className="text-sm text-muted-foreground">
          {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
        </p>
      </div>

      {/* The outstanding amount is the headline, not the collected amount: it is
          the one number that implies an action. */}
      <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
        <p className="text-4xl font-semibold tracking-tight text-foreground tabular-nums sm:text-5xl">
          {formatKes(outstanding)}
        </p>
        <p className="pb-1 text-sm text-muted-foreground">still outstanding</p>
      </div>

      <div className="mt-5 space-y-2">
        <div
          role="meter"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct} percent of expected rent collected`}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm">
          <p className="text-foreground tabular-nums">
            <span className="font-medium">{formatKes(collected)}</span>
            <span className="text-muted-foreground"> of {formatKes(expected)}</span>
          </p>
          <p className="text-muted-foreground tabular-nums">
            {unitsPaid} of {unitsTotal} units paid
          </p>
        </div>
      </div>

      {unitsOutstanding > 0 ? (
        <p className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
          <Icon name="AlertCircle" className="h-4 w-4 shrink-0 text-warning-text" />
          <span>
            {unitsOutstanding} {unitsOutstanding === 1 ? 'unit has' : 'units have'} not paid yet
          </span>
        </p>
      ) : null}
    </section>
  )
}
