'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { StatusBadge, type StatusTone } from '@/components/ui/status-badge'
import type { IconName } from '@/lib/icons/icon-map'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TablePagination, usePagedRows } from '@/components/dashboard/table-pagination'
import { formatKes, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  FILTER_LABEL,
  PAYMENT_FILTERS,
  matchesFilter,
  type PaymentFilter,
} from '@/lib/dashboard/payment-filters'
import type { Payment, PaymentStatus } from '@/lib/dashboard/sample-data'

/**
 * This period's rent, unit by unit.
 *
 * Built to the same construction as the tenants and properties tables. The
 * difference is what a row means: not a payment that happened, but the rent owed
 * on one unit and whatever has or has not arrived against it. A ledger of
 * successful transactions cannot show an absence, and the absences are the
 * reason an agent opens this screen.
 *
 * That is also what makes `?filter=late` a real destination. The "Send
 * reminders" button on the dashboard and tenants banners points here; if this
 * listed only completed payments, the one thing those buttons promise would be
 * the one thing the page could not show.
 *
 * Sort order is arrears first, then the unsettled, then what has landed —
 * PRODUCT.md rule 1. Within a group, newest attempt first, with the never-
 * attempted rows last because they have no timestamp to sort by.
 */

const STATUS: Record<
  PaymentStatus,
  { label: string; tone: StatusTone; icon: IconName; rank: number; hint?: string }
> = {
  late: { label: 'Late', tone: 'danger', icon: 'AlertTriangle', rank: 0 },
  failed: {
    label: 'Failed',
    tone: 'danger',
    icon: 'XCircle',
    rank: 1,
    hint: 'Attempted, did not go through',
  },
  pending: { label: 'Pending', tone: 'warning', icon: 'Clock', rank: 2 },
  paid: { label: 'Paid', tone: 'success', icon: 'CheckCircle', rank: 3 },
}

function StatusPill({ status }: { status: PaymentStatus }) {
  const s = STATUS[status]
  return (
    <StatusBadge tone={s.tone} icon={s.icon} title={s.hint}>
      {s.label}
    </StatusBadge>
  )
}


const COLUMNS = ['Unit', 'Method', 'When', 'Status'] as const

const PAGE_SIZE = 12

export function PaymentsTable({
  payments,
  initialFilter = 'all',
}: {
  payments: Payment[]
  /** Read from `?filter=` on the server so an incoming link lands on the right
   *  view. Client state takes over once the agent touches the control. */
  initialFilter?: PaymentFilter
}) {
  const [filter, setFilter] = React.useState<PaymentFilter>(initialFilter)
  const [property, setProperty] = React.useState('all')
  const [query, setQuery] = React.useState('')

  const propertyNames = React.useMemo(
    () => [...new Set(payments.map((p) => p.property))].sort(),
    [payments],
  )

  const counts = React.useMemo(() => {
    const scope = property === 'all' ? payments : payments.filter((p) => p.property === property)
    return Object.fromEntries(
      PAYMENT_FILTERS.map((f) => [f, scope.filter((p) => matchesFilter(p, f)).length]),
    ) as Record<PaymentFilter, number>
  }, [payments, property])

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return payments
      .filter((p) => {
        if (!matchesFilter(p, filter)) return false
        if (property !== 'all' && p.property !== property) return false
        if (!q) return true
        return (
          p.tenant.toLowerCase().includes(q) ||
          p.unit.toLowerCase().includes(q) ||
          p.property.toLowerCase().includes(q) ||
          (p.reference?.toLowerCase().includes(q) ?? false)
        )
      })
      .sort(
        (a, b) =>
          STATUS[a.status].rank - STATUS[b.status].rank ||
          (b.at ?? '').localeCompare(a.at ?? '') ||
          a.tenant.localeCompare(b.tenant),
      )
  }, [payments, filter, property, query])

  const shown = rows.reduce((n, p) => n + p.amount, 0)
  const paged = usePagedRows(rows, PAGE_SIZE, `${filter}|${property}|${query.trim()}`)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-4 space-y-0 pb-2">
        <div className="grid gap-1">
          <CardTitle>Rent this period</CardTitle>
          <CardDescription>
            <span className="tabular-nums">{rows.length}</span>{' '}
            {rows.length === 1 ? 'unit' : 'units'} &middot;{' '}
            <span className="tabular-nums">{formatKes(shown)}</span>
          </CardDescription>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchField value={query} onChange={setQuery} />

            <Select value={property} onValueChange={setProperty}>
              <SelectTrigger
                aria-label="Filter by property"
                className="h-10 w-full rounded-lg border-border bg-card text-sm focus:ring-2 focus:ring-accent/40 focus:ring-offset-0 sm:w-[200px]"
              >
                <SelectValue placeholder="All properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All properties</SelectItem>
                {propertyNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <StatusFilter value={filter} onChange={setFilter} counts={counts} />
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {rows.length === 0 ? (
          <EmptyState
            onReset={() => {
              setQuery('')
              setFilter('all')
              setProperty('all')
            }}
          />
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
                  {paged.rows.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-dashed border-border transition-colors last:border-b-0 hover:bg-muted/40"
                    >
                      <th scope="row" className="py-3 pr-6 text-left font-normal">
                        <span className="block font-medium text-foreground">{p.tenant}</span>
                        <span className="block text-muted-foreground">
                          {p.unit}, {p.property}
                        </span>
                      </th>
                      <td className="whitespace-nowrap py-3 pr-6 text-muted-foreground">
                        {p.method ?? <span aria-label="No payment attempted">&mdash;</span>}
                        {p.reference ? (
                          <span className="block font-mono text-xs text-muted-foreground/80">
                            {p.reference}
                          </span>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-6 text-muted-foreground tabular-nums">
                        {p.at ? (
                          formatRelativeTime(p.at)
                        ) : (
                          <span className="text-muted-foreground/70">Not attempted</span>
                        )}
                      </td>
                      <td className="py-3 pr-6">
                        <StatusPill status={p.status} />
                        {p.note ? (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {p.note}
                          </span>
                        ) : null}
                      </td>
                      <td
                        className={cn(
                          'whitespace-nowrap py-3 text-right font-medium tabular-nums',
                          p.status === 'paid' ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {formatKes(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Below sm the same rows become label/value cards. */}
            <ul className="sm:hidden">
              {paged.rows.map((p) => (
                <li
                  key={p.id}
                  className="space-y-2 border-b border-dashed border-border px-3 py-3 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{p.tenant}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {p.unit}, {p.property}
                      </p>
                    </div>
                    <p
                      className={cn(
                        'shrink-0 font-medium tabular-nums',
                        p.status === 'paid' ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {formatKes(p.amount)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <StatusPill status={p.status} />
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {p.at ? `${p.method} · ${formatRelativeTime(p.at)}` : 'Not attempted'}
                    </span>
                  </div>

                  {p.note ? (
                    <p className="text-sm text-muted-foreground">{p.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>

            <TablePagination paged={paged} noun={['unit', 'units']} className="mt-2" />
          </>
        )}
      </CardContent>
    </Card>
  )
}

function SearchField({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  return (
    <div className="relative sm:w-64">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      >
        <Icon name="Search" className="h-4 w-4" />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search name, unit or code"
        aria-label="Search payments by tenant, unit, property or reference"
        className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
    </div>
  )
}

function StatusFilter({
  value,
  onChange,
  counts,
}: {
  value: PaymentFilter
  onChange: (next: PaymentFilter) => void
  counts: Record<PaymentFilter, number>
}) {
  return (
    <div
      role="group"
      aria-label="Filter by payment status"
      className="flex w-full items-center gap-0.5 rounded-lg bg-muted/70 p-0.5 lg:w-auto"
    >
      {PAYMENT_FILTERS.map((f) => {
        const selected = value === f
        return (
          <button
            key={f}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(f)}
            className={cn(
              'flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm transition-colors duration-200 lg:flex-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
              selected
                ? 'bg-card font-medium text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {FILTER_LABEL[f]}
            <span className="tabular-nums text-muted-foreground">{counts[f]}</span>
          </button>
        )
      })}
    </div>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Icon name="CreditCard" className="h-6 w-6 text-muted-foreground" />
      <p className="font-medium text-foreground">Nothing matches these filters</p>
      <p className="max-w-[40ch] text-sm text-muted-foreground">
        Tenant, unit, property and M-Pesa code are all searched.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        Clear filters
      </button>
    </div>
  )
}
