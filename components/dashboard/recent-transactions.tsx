import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { formatKes, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Transaction, TxStatus } from '@/lib/dashboard/sample-data'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * Recent rent payments.
 *
 * A ledger, not a set of cards. These rows exist to be compared — amount against
 * amount, time against time — and six bordered boxes would break the column
 * alignment that makes a ledger scannable. Figures are tabular so the digits line
 * up down the page.
 *
 * Status is a word plus a mark, never a colour on its own. Failed rows carry the
 * reason inline, because "failed" without "insufficient funds" leaves the agent
 * with a second question and no way to answer it.
 *
 * Below `sm` the row folds into two lines rather than truncating a tenant's name
 * to fit four columns onto a phone.
 */

const STATUS: Record<TxStatus, { label: string; icon: IconName; className: string }> = {
  paid: { label: 'Paid', icon: 'CheckCircle', className: 'text-success-text' },
  pending: { label: 'Pending', icon: 'Clock', className: 'text-warning-text' },
  failed: { label: 'Failed', icon: 'AlertCircle', className: 'text-destructive-text' },
}

export function RecentTransactions({ rows }: { rows: Transaction[] }) {
  return (
    <section aria-labelledby="tx-heading" className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4 sm:px-6">
        <div>
          <h2 id="tx-heading" className="text-base font-semibold text-foreground">
            Recent payments
          </h2>
          <p className="text-sm text-muted-foreground">Across all properties</p>
        </div>
        <Link
          href="/dashboard/landlord/payments"
          className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          View all
          <Icon name="ArrowRight" className="h-4 w-4" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="border-t border-border">
          {rows.map((row) => {
            const status = STATUS[row.status]
            return (
              <li
                key={row.id}
                className="flex flex-col gap-2 border-b border-border px-5 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{row.tenant}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    Unit {row.unit} &middot; {row.property}
                  </p>
                </div>

                <div className="hidden w-36 shrink-0 sm:block">
                  <p className="text-sm text-foreground">{row.method}</p>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {formatRelativeTime(row.at)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:w-44 sm:shrink-0 sm:justify-end">
                  <p
                    className={cn(
                      'text-sm font-medium tabular-nums sm:order-2 sm:w-28 sm:text-right',
                      row.status === 'failed' ? 'text-muted-foreground line-through' : 'text-foreground',
                    )}
                  >
                    {formatKes(row.amount)}
                  </p>
                  <p
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 text-sm sm:order-1',
                      status.className,
                    )}
                  >
                    <Icon name={status.icon} className="h-4 w-4" />
                    <span>{status.label}</span>
                  </p>
                </div>

                {/* The failure reason and, on phones, the details the wide
                    columns carry. */}
                <p className="text-sm text-muted-foreground sm:hidden">
                  {row.method} &middot; {formatRelativeTime(row.at)}
                </p>
                {row.note ? (
                  <p className="text-sm text-destructive-text sm:sr-only">{row.note}</p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 border-t border-border px-6 py-12 text-center">
      <Icon name="CreditCard" className="h-6 w-6 text-muted-foreground" />
      <p className="font-medium text-foreground">No payments yet this period</p>
      <p className="max-w-[40ch] text-sm text-muted-foreground">
        Payments appear here as tenants pay, usually within a minute of an M-Pesa
        confirmation.
      </p>
    </div>
  )
}
