import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { formatKes, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Transaction, TxStatus } from '@/lib/dashboard/sample-data'

/**
 * Recent rent payments.
 *
 * Shares the chart card's construction so the two sections read as one system:
 * Card, a CardHeader holding title and description in a grid with the control
 * pushed right, and CardContent below — with no rule between them.
 *
 * Rows are separated by a dashed rule, matching the dashed grid in the chart
 * card beside it. Dashed reads as a lighter mark than solid at the same colour,
 * so the list keeps its structure without the stack of hard lines it had when
 * every row carried a solid divider. The header still separates from the body by
 * spacing alone, and the card has no other rule inside it.
 *
 * Numbers right, text left, both tabular. Status is carried by the word itself
 * rather than a coloured dot beside it: the label already names the state, so the
 * dot repeated it. The pill colours are the contrast-checked `-text` tokens,
 * since `--success` and `--warning` are fill colours and measure 3.33 and 2.79
 * against the 4.5 floor when used as text.
 */

const STATUS: Record<TxStatus, { label: string; pill: string }> = {
  paid: { label: 'Paid', pill: 'bg-success/10 text-success-text' },
  pending: { label: 'Pending', pill: 'bg-warning/10 text-warning-text' },
  failed: { label: 'Failed', pill: 'bg-destructive/10 text-destructive-text' },
}

function StatusPill({ status }: { status: TxStatus }) {
  const s = STATUS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        s.pill,
      )}
    >
      {s.label}
    </span>
  )
}

const COLUMNS = ['Tenant', 'Method', 'When', 'Status'] as const

export function RecentTransactions({ rows }: { rows: Transaction[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex items-center gap-2 space-y-0 pb-2 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Recent payments</CardTitle>
          <CardDescription>Across all properties</CardDescription>
        </div>
        <Link
          href="/dashboard/landlord/payments"
          className="hidden h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:ml-auto sm:flex"
        >
          View all
          <Icon name="ArrowRight" className="h-4 w-4" />
        </Link>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    {COLUMNS.map((h) => (
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
                        <span className="block font-medium text-foreground">{row.tenant}</span>
                        <span className="block text-muted-foreground">
                          {row.unit}, {row.property}
                        </span>
                      </th>
                      <td className="whitespace-nowrap py-3 pr-6 text-muted-foreground">
                        {row.method}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-6 text-muted-foreground tabular-nums">
                        {formatRelativeTime(row.at)}
                      </td>
                      <td className="py-3 pr-6">
                        <StatusPill status={row.status} />
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

                  {row.note ? <p className="text-sm text-muted-foreground">{row.note}</p> : null}
                </li>
              ))}
            </ul>

            {/* The header's "View all" is hidden below sm, so the link lives here
                on a phone rather than being unreachable. */}
            <Link
              href="/dashboard/landlord/payments"
              className="mt-2 flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:hidden"
            >
              View all payments
              <Icon name="ArrowRight" className="h-4 w-4" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
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
