'use client'

import * as React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  TablePagination,
  usePagedRows,
} from '@/components/dashboard/table-pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatKes, formatShortDate, initials } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Tenant, TenantStatus } from '@/lib/dashboard/sample-data'

/**
 * Tenants, as a table.
 *
 * Third screen built to the payments table's construction, and the reason that
 * construction is worth keeping: an agent who has learned to read one of these
 * can read all three. Card, header with the controls pushed right, dashed row
 * separators, numbers right and tabular, and the whole thing collapsing to
 * label/value cards below `sm`.
 *
 * What this replaced was 39 people rendered as 39 nested glass cards inside four
 * duplicated tab panels — roughly 600px of scrolling per eight tenants, with no
 * way to compare two of them. Rent, status and lease end are the columns you
 * sort a rent roll by, so they are columns.
 *
 * Paginated, because a rent roll grows without limit and the whole point of the
 * sort order is that what matters is at the top. The page size is deliberately
 * larger than the number of exceptions this portfolio has, so arrears never span
 * a page boundary in the common case.
 *
 * The avatar is initials, not a photo. There is no tenant-photo endpoint and
 * PRODUCT.md forbids plausible placeholders, so a stock face would be inventing
 * a person's appearance. Initials still do the real work here, which is letting
 * the eye find the row it was on after looking away.
 */

const STATUS: Record<
  TenantStatus,
  { label: string; tone: StatusTone; icon: IconName; rank: number }
> = {
  late: { label: 'Late', tone: 'danger', icon: 'AlertTriangle', rank: 0 },
  due: { label: 'Due', tone: 'warning', icon: 'Clock', rank: 1 },
  paid: { label: 'Paid', tone: 'success', icon: 'CheckCircle', rank: 2 },
}

function StatusPill({ status }: { status: TenantStatus }) {
  const s = STATUS[status]
  return (
    <StatusBadge tone={s.tone} icon={s.icon}>
      {s.label}
    </StatusBadge>
  )
}

type Filter = 'all' | TenantStatus

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'late', label: 'Late' },
  { value: 'due', label: 'Due' },
  { value: 'paid', label: 'Paid' },
]

const COLUMNS = ['Tenant', 'Unit', 'Lease ends', 'Status'] as const

const PAGE_SIZE = 12

/** Inside 60 days of the period the dashboard is reporting on. */
function leaseEndsSoon(iso: string, from: Date): boolean {
  const days = (new Date(iso).getTime() - from.getTime()) / 86_400_000
  return days >= 0 && days <= 60
}

export function TenantsTable({
  tenants,
  asOf,
}: {
  tenants: Tenant[]
  /** ISO date the lease warnings are measured from. Passed in rather than read
   *  from the clock so the server and client agree and nothing rehydrates into
   *  a different answer at midnight. */
  asOf: string
}) {
  const [filter, setFilter] = React.useState<Filter>('all')
  const [property, setProperty] = React.useState('all')
  const [query, setQuery] = React.useState('')

  const from = React.useMemo(() => new Date(asOf), [asOf])

  const propertyNames = React.useMemo(
    () => [...new Set(tenants.map((t) => t.property))].sort(),
    [tenants],
  )

  const counts = React.useMemo(() => {
    const scope = property === 'all' ? tenants : tenants.filter((t) => t.property === property)
    return {
      all: scope.length,
      late: scope.filter((t) => t.status === 'late').length,
      due: scope.filter((t) => t.status === 'due').length,
      paid: scope.filter((t) => t.status === 'paid').length,
    }
  }, [tenants, property])

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return tenants
      .filter((t) => {
        if (filter !== 'all' && t.status !== filter) return false
        if (property !== 'all' && t.property !== property) return false
        if (!q) return true
        return (
          t.name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.property.toLowerCase().includes(q) ||
          t.unit.toLowerCase().includes(q)
        )
      })
      // Exceptions before totals: late first, then due, then paid. Within a
      // status, by name, so the order is stable and a row stays where it was.
      .sort(
        (a, b) =>
          STATUS[a.status].rank - STATUS[b.status].rank || a.name.localeCompare(b.name),
      )
  }, [tenants, filter, property, query])

  const rentShown = rows.reduce((n, t) => n + t.rent, 0)

  const paged = usePagedRows(rows, PAGE_SIZE, `${filter}|${property}|${query.trim()}`)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-4 space-y-0 pb-2">
        <div className="grid gap-1">
          <CardTitle>Tenants</CardTitle>
          <CardDescription>
            <span className="tabular-nums">{rows.length}</span>{' '}
            {rows.length === 1 ? 'tenant' : 'tenants'} &middot;{' '}
            <span className="tabular-nums">{formatKes(rentShown)}</span> of rent
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
            query={query}
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
                      Rent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paged.rows.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-dashed border-border transition-colors last:border-b-0 hover:bg-muted/40"
                    >
                      <th scope="row" className="py-3 pr-6 text-left font-normal">
                        <span className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback>{initials(t.name)}</AvatarFallback>
                          </Avatar>
                          <span className="min-w-0">
                            <span className="block font-medium text-foreground">
                              {t.name}
                            </span>
                            <span className="block truncate text-muted-foreground">
                              {t.email}
                            </span>
                          </span>
                        </span>
                      </th>
                      <td className="py-3 pr-6">
                        <span className="block whitespace-nowrap text-foreground">
                          {t.unit}
                        </span>
                        <span className="block text-muted-foreground">{t.property}</span>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-6 text-muted-foreground tabular-nums">
                        {formatShortDate(t.leaseEnd)} {new Date(t.leaseEnd).getFullYear()}
                        {leaseEndsSoon(t.leaseEnd, from) ? <RenewalMark /> : null}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-6">
                        <StatusPill status={t.status} />
                      </td>
                      <td className="whitespace-nowrap py-3 text-right font-medium text-foreground tabular-nums">
                        {formatKes(t.rent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Below sm the same rows become label/value cards. */}
            <ul className="sm:hidden">
              {paged.rows.map((t) => (
                <li
                  key={t.id}
                  className="space-y-2 border-b border-dashed border-border px-3 py-3 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>{initials(t.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{t.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {t.unit}, {t.property}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 font-medium text-foreground tabular-nums">
                      {formatKes(t.rent)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <StatusPill status={t.status} />
                    <span className="text-sm text-muted-foreground tabular-nums">
                      Lease ends {formatShortDate(t.leaseEnd)}{' '}
                      {new Date(t.leaseEnd).getFullYear()}
                    </span>
                    {leaseEndsSoon(t.leaseEnd, from) ? <RenewalMark /> : null}
                  </div>
                </li>
              ))}
            </ul>

            <TablePagination paged={paged} noun={['tenant', 'tenants']} className="mt-2" />
          </>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * A lease inside 60 days of running out. Marked in words, not by colouring the
 * date: PRODUCT.md rule 5, and a date that turns amber tells a person who cannot
 * see the difference precisely nothing.
 */
function RenewalMark() {
  return (
    <StatusBadge tone="warning" icon="CalendarDays" size="sm" className="ml-2">
      Renewal due
    </StatusBadge>
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
        placeholder="Search name, email or unit"
        aria-label="Search tenants by name, email, property or unit"
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
  value: Filter
  onChange: (next: Filter) => void
  counts: Record<Filter, number>
}) {
  return (
    <div
      role="group"
      aria-label="Filter by payment status"
      className="flex w-full items-center gap-0.5 rounded-lg bg-muted/70 p-0.5 lg:w-auto"
    >
      {FILTERS.map((f) => {
        const selected = value === f.value
        return (
          <button
            key={f.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(f.value)}
            className={cn(
              'flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm transition-colors duration-200 lg:flex-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
              selected
                ? 'bg-card font-medium text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
            <span className="tabular-nums text-muted-foreground">{counts[f.value]}</span>
          </button>
        )
      })}
    </div>
  )
}

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Icon name="Users" className="h-6 w-6 text-muted-foreground" />
      <p className="font-medium text-foreground">
        {query ? 'No tenants match that search' : 'No tenants match these filters'}
      </p>
      <p className="max-w-[40ch] text-sm text-muted-foreground">
        Name, email, property and unit are all searched.
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
