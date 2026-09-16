import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { formatKes, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Transaction, TxMethod, TxStatus } from '@/lib/dashboard/sample-data'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * Recent rent payments.
 *
 * Two lines per row, and no rule between rows. The previous version drew a
 * border under every entry and ran to four lines apiece, which turned a short
 * list into a dense grid of horizontal rules — the eye spent longer separating
 * rows than reading them. Whitespace does that job here, and the only rule left
 * is the one under the header.
 *
 * Each row opens with the payment method as an icon, which is what makes the
 * second line short enough to fit: an M-Pesa mark carries what the word "M-Pesa"
 * was spending a column on. The method is still named in the icon's accessible
 * label, so nothing is conveyed by glyph alone.
 *
 * Status rides on the amount rather than taking its own column: a struck-through
 * figure with a red mark says "failed" faster than a separate pill does, and it
 * removes a whole column from the row.
 */

const METHOD: Record<TxMethod, IconName> = {
  'M-Pesa': 'Smartphone',
  'Bank transfer': 'Building',
  Card: 'CreditCard',
}

const STATUS: Record<TxStatus, { label: string; icon: IconName; className: string }> = {
  paid: { label: 'Paid', icon: 'CheckCircle', className: 'text-success-text' },
  pending: { label: 'Pending', icon: 'Clock', className: 'text-warning-text' },
  failed: { label: 'Failed', icon: 'AlertCircle', className: 'text-destructive-text' },
}

export function RecentTransactions({ rows }: { rows: Transaction[] }) {
  return (
    <section aria-labelledby="tx-heading" className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <h2 id="tx-heading" className="text-base font-semibold text-foreground">
          Recent payments
        </h2>
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
        <ul className="p-2 sm:p-3">
          {rows.map((row) => {
            const status = STATUS[row.status]
            const failed = row.status === 'failed'

            return (
              <li key={row.id}>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50">
                  <span
                    role="img"
                    aria-label={row.method}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  >
                    <Icon name={METHOD[row.method]} className="h-[18px] w-[18px]" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{row.tenant}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {row.unit}, {row.property}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        'text-sm font-medium tabular-nums',
                        failed ? 'text-muted-foreground line-through' : 'text-foreground',
                      )}
                    >
                      {formatKes(row.amount)}
                    </p>
                    <p
                      className={cn(
                        'flex items-center justify-end gap-1 text-sm tabular-nums',
                        failed ? status.className : 'text-muted-foreground',
                      )}
                    >
                      <Icon
                        name={status.icon}
                        className={cn('h-3.5 w-3.5', !failed && status.className)}
                      />
                      <span className="sr-only">{status.label}. </span>
                      <span>{failed ? (row.note ?? status.label) : formatRelativeTime(row.at)}</span>
                    </p>
                  </div>
                </div>
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
