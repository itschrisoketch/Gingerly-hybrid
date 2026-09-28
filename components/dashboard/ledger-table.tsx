import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import { formatKes } from '@/lib/format'
import type { PaymentStatus, TxMethod } from '@/lib/dashboard/sample-data'

/**
 * A run of payments, as a table on a screen and as cards on a phone.
 *
 * Extracted from recent-transactions.tsx when the tenant home needed the same
 * object. The two differ only in what the first column is — an agent is looking
 * at *who* paid, a tenant at *which month* — so that is a prop rather than a
 * second component. Everything that makes this table what it is, the dashed row
 * rules, the failed-amount strikethrough, the phone layout and the two
 * placements of "View all", is shared.
 *
 * `StatusBadge` carries both a tone and a word, so status is never signalled by
 * colour alone — PRODUCT.md rule 5.
 */

export interface LedgerRow {
  id: string
  /** First column, bold: a tenant's name, or the period a payment covers. */
  primary: string
  /** Under it, quieter: the unit and property, or the M-Pesa reference. */
  secondary?: string
  method?: TxMethod
  /** ISO timestamp. Absent where nothing was attempted. */
  at?: string
  status: PaymentStatus
  /** Why it failed, or why the amount is unusual. */
  note?: string
  amount: number
}

const TONE: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  pending: 'warning',
  late: 'danger',
  failed: 'danger',
}

const LABEL: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  late: 'Late',
  failed: 'Failed',
}

export function LedgerTable({
  title,
  description,
  primaryHeading,
  whenHeading = 'When',
  rows,
  href,
  viewAllLabel,
  formatWhen,
  empty,
}: {
  title: string
  description: string
  /** Heading over the first column, e.g. "Tenant" or "Period". */
  primaryHeading: string
  whenHeading?: string
  rows: LedgerRow[]
  /** Omit on a page that IS the full list — it should not link to itself. */
  href?: string
  viewAllLabel?: string
  /** How a timestamp reads on this screen — relative for an agent watching
   *  today, an actual date for a tenant looking back over a year. */
  formatWhen: (at: string) => string
  empty: { title: string; detail: string }
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex items-center gap-2 space-y-0 pb-2 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {href ? (
          <Link
            href={href}
            className="hidden h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:ml-auto sm:flex"
          >
            View all
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        ) : null}
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <Icon name="CreditCard" className="h-6 w-6 text-muted-foreground" />
            <p className="font-medium text-foreground">{empty.title}</p>
            <p className="max-w-[40ch] text-sm text-muted-foreground">{empty.detail}</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    {[primaryHeading, 'Method', whenHeading, 'Status'].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="pb-3 pr-6 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                    <th
                      scope="col"
                      className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-dashed border-border transition-colors last:border-b-0 hover:bg-muted/40"
                    >
                      <th scope="row" className="py-3 pr-6 text-left font-normal">
                        <span className="block font-medium text-foreground">{row.primary}</span>
                        {row.secondary ? (
                          <span className="block text-muted-foreground">{row.secondary}</span>
                        ) : null}
                      </th>
                      <td className="whitespace-nowrap py-3 pr-6 text-muted-foreground">
                        {row.method ?? '—'}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-6 text-muted-foreground tabular-nums">
                        {row.at ? formatWhen(row.at) : '—'}
                      </td>
                      <td className="py-3 pr-6">
                        <StatusBadge tone={TONE[row.status]} size="sm">
                          {LABEL[row.status]}
                        </StatusBadge>
                        {row.note ? (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {row.note}
                          </span>
                        ) : null}
                      </td>
                      <td
                        className={cn(
                          'whitespace-nowrap py-3 text-right font-medium tabular-nums',
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

            {/* Below sm the same rows become label/value cards. */}
            <ul className="sm:hidden">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="space-y-2 border-b border-dashed border-border px-3 py-3 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{row.primary}</p>
                      {row.secondary ? (
                        <p className="truncate text-sm text-muted-foreground">{row.secondary}</p>
                      ) : null}
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
                    <StatusBadge tone={TONE[row.status]} size="sm">
                      {LABEL[row.status]}
                    </StatusBadge>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {row.method ?? '—'}
                      {row.at ? ` · ${formatWhen(row.at)}` : null}
                    </span>
                  </div>

                  {row.note ? <p className="text-sm text-muted-foreground">{row.note}</p> : null}
                </li>
              ))}
            </ul>

            {/* The header's "View all" is hidden below sm, so the link lives here
                on a phone rather than being unreachable. */}
            {href ? (
              <Link
                href={href}
                className="mt-2 flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:hidden"
              >
                {viewAllLabel}
                <Icon name="ArrowRight" className="h-4 w-4" />
              </Link>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
