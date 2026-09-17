import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { formatKes, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Transaction, TxStatus } from '@/lib/dashboard/sample-data'

/**
 * Recent rent payments.
 *
 * Built to the dashboard-design table pattern: a toolbar carrying the title and
 * a row count, a real `<table>` with a proper header, divided rows with a hover
 * highlight, status as a dotted pill, amounts right-aligned and tabular, and a
 * stacked card list replacing the table below `sm`.
 *
 * Colours are the project's semantic tokens rather than the skill's raw
 * `emerald-50`/`gray-200` examples: the pills use the contrast-checked `-text`
 * variants, since `--success` and `--warning` are fill colours that measure 3.33
 * and 2.79 against the 4.5 floor when used as foreground.
 *
 * Numbers right, text left. Every status carries a word as well as a colour.
 */

// The dot uses bg-current so it takes the pill's text colour. That keeps it at
// the same measured contrast as the label instead of being a fourth value to
// verify, and the fill tokens were only clearing ~2.5:1 against their own tint.
const STATUS: Record<TxStatus, { label: string; pill: string; dot: string }> = {
  paid: {
    label: 'Paid',
    pill: 'bg-success/10 text-success-text',
    dot: 'bg-current',
  },
  pending: {
    label: 'Pending',
    pill: 'bg-warning/10 text-warning-text',
    dot: 'bg-current',
  },
  failed: {
    label: 'Failed',
    pill: 'bg-destructive/10 text-destructive-text',
    dot: 'bg-current',
  },
}

function StatusPill({ status }: { status: TxStatus }) {
  const s = STATUS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        s.pill,
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}

export function RecentTransactions({ rows }: { rows: Transaction[] }) {
  return (
    <section
      aria-labelledby="tx-heading"
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <h2 id="tx-heading" className="text-base font-semibold text-foreground">
            Recent payments
          </h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
            {rows.length}
          </span>
        </div>
        <Link
          href="/dashboard/landlord/payments"
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          View all
          <Icon name="ArrowRight" className="h-4 w-4" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Tenant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Method
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    When
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-muted/40">
                    <th scope="row" className="px-6 py-3.5 text-left font-normal">
                      <span className="block font-medium text-foreground">{row.tenant}</span>
                      <span className="block text-muted-foreground">
                        {row.unit}, {row.property}
                      </span>
                    </th>
                    <td className="whitespace-nowrap px-6 py-3.5 text-muted-foreground">
                      {row.method}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-muted-foreground tabular-nums">
                      {formatRelativeTime(row.at)}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusPill status={row.status} />
                      {row.note ? (
                        <span className="mt-1 block text-xs text-muted-foreground">{row.note}</span>
                      ) : null}
                    </td>
                    <td
                      className={cn(
                        'whitespace-nowrap px-6 py-3.5 text-right font-medium tabular-nums',
                        row.status === 'failed'
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground',
                      )}
                    >
                      {formatKes(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: the same rows as label/value cards. */}
          <ul className="divide-y divide-border sm:hidden">
            {rows.map((row) => (
              <li key={row.id} className="space-y-2 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{row.tenant}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {row.unit}, {row.property}
                    </p>
                  </div>
                  <p
                    className={cn(
                      'shrink-0 font-medium tabular-nums',
                      row.status === 'failed'
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground',
                    )}
                  >
                    {formatKes(row.amount)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <StatusPill status={row.status} />
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {row.method} &middot; {formatRelativeTime(row.at)}
                  </span>
                </div>

                {row.note ? (
                  <p className="text-sm text-muted-foreground">{row.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Icon name="CreditCard" className="h-6 w-6 text-muted-foreground" />
      <p className="font-medium text-foreground">No payments yet this period</p>
      <p className="max-w-[40ch] text-sm text-muted-foreground">
        Payments appear here as tenants pay, usually within a minute of an M-Pesa
        confirmation.
      </p>
    </div>
  )
}
