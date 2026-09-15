import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { formatKes, formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ArrearsRow } from '@/lib/dashboard/sample-data'

/**
 * Units in arrears — the agent's actual work.
 *
 * Placed above portfolio totals because a count of properties is not something
 * anyone acts on, and an unpaid unit is. Each row carries the one action that
 * moves it forward rather than a menu of options.
 *
 * Rows are a list, not a card each: they are compared against one another, and
 * fourteen bordered boxes would make scanning the amounts harder, not easier.
 * On narrow screens the row stacks rather than truncating the tenant's name.
 *
 * Lateness is encoded in text as well as colour, so it survives both a
 * monochrome display and a colour-blind reader.
 */
export function ArrearsList({ rows }: { rows: ArrearsRow[] }) {
  return (
    <section aria-labelledby="arrears-heading" className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border px-5 py-4 sm:px-6">
        <h2 id="arrears-heading" className="text-base font-semibold text-foreground">
          Needs chasing
        </h2>
        {rows.length > 0 ? (
          <p className="text-sm text-muted-foreground tabular-nums">
            {rows.length} {rows.length === 1 ? 'unit' : 'units'}
          </p>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{row.tenant}</p>
                <p className="truncate text-sm text-muted-foreground">
                  Unit {row.unit} &middot; {row.property}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="sm:text-right">
                  <p className="font-medium text-foreground tabular-nums">
                    {formatKes(row.amount)}
                  </p>
                  <p
                    className={cn(
                      'text-sm tabular-nums',
                      row.daysLate >= 14 ? 'text-destructive-text' : 'text-warning-text',
                    )}
                  >
                    {row.daysLate} days late
                  </p>
                </div>

                <Link
                  href={`/dashboard/landlord/messages?tenant=${encodeURIComponent(row.tenant)}`}
                  className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <Icon name="Send" className="h-4 w-4" />
                  <span>Remind</span>
                </Link>
              </div>

              <p className="text-sm text-muted-foreground sm:hidden">
                {row.lastContacted
                  ? `Last reminded ${formatShortDate(row.lastContacted)}`
                  : 'Never reminded'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/**
 * Empty state that says what it means. "Nothing here" would leave the agent
 * wondering whether the data failed to load.
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Icon name="CheckCircle" className="h-6 w-6 text-success-text" />
      <p className="font-medium text-foreground">Every unit has paid</p>
      <p className="max-w-[40ch] text-sm text-muted-foreground">
        Nothing is outstanding for this period. Units appear here the day after
        rent is due.
      </p>
    </div>
  )
}
