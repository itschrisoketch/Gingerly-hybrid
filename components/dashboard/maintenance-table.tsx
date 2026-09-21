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
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TablePagination, usePagedRows } from '@/components/dashboard/table-pagination'
import {
  CATEGORY,
  CATEGORY_ORDER,
  STATUS,
  STATUS_ORDER,
  daysBetween,
  type StatusFilter,
} from '@/lib/dashboard/maintenance-meta'
import { formatRelativeTime, formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type {
  MaintenanceCategory,
  MaintenanceRequest,
  MaintenanceStatus,
} from '@/lib/dashboard/sample-data'

/**
 * Reported maintenance, as a table.
 *
 * Fourth screen on the same construction as payments, tenants and properties, so
 * an agent who can read one can read all of them. What differs is the sort: jobs
 * are ordered unassigned first, then in flight, then scheduled, then done, and
 * within a state by how long they have been waiting. The oldest untouched job is
 * therefore always the first row, which is the one question this page exists to
 * answer.
 *
 * Age is shown as a number of days rather than a date for anything unresolved.
 * "Raised 14 Sep" needs arithmetic before it means anything; "7 days" is the
 * thing an agent is actually judging, and it is the number a tenant will quote
 * back to them.
 *
 * Category carries a Material Symbol beside its label. The glyph is a scanning
 * aid only — the word is always next to it, so nothing depends on recognising
 * the icon, and the status pill is a word too rather than a colour.
 */
type CategoryFilter = 'all' | MaintenanceCategory

const COLUMNS = ['Request', 'Where', 'Waiting', 'Status'] as const
const PAGE_SIZE = 12

export function MaintenanceTable({
  requests,
  asOf,
  initialStatus = 'all',
}: {
  requests: MaintenanceRequest[]
  /** ISO date the "waiting" ages are measured from. */
  asOf: string
  /** Read from `?status=` on the server, so the banner's link lands on the jobs
   *  it was talking about. Client state takes over once a filter is touched. */
  initialStatus?: StatusFilter
}) {
  const [status, setStatus] = React.useState<StatusFilter>(initialStatus)
  const [category, setCategory] = React.useState<CategoryFilter>('all')
  const [query, setQuery] = React.useState('')

  const counts = React.useMemo(() => {
    const scope = category === 'all' ? requests : requests.filter((r) => r.category === category)
    return {
      all: scope.length,
      ...Object.fromEntries(
        STATUS_ORDER.map((s) => [s, scope.filter((r) => r.status === s).length]),
      ),
    } as Record<StatusFilter, number>
  }, [requests, category])

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return requests
      .filter((r) => {
        if (status !== 'all' && r.status !== status) return false
        if (category !== 'all' && r.category !== category) return false
        if (!q) return true
        return (
          r.title.toLowerCase().includes(q) ||
          r.tenant.toLowerCase().includes(q) ||
          r.property.toLowerCase().includes(q) ||
          r.unit.toLowerCase().includes(q) ||
          (r.assignee?.toLowerCase().includes(q) ?? false)
        )
      })
      .sort(
        (a, b) =>
          STATUS[a.status].rank - STATUS[b.status].rank ||
          // Oldest first within a state: the longest wait is the worst wait.
          a.raisedAt.localeCompare(b.raisedAt),
      )
  }, [requests, status, category, query])

  const paged = usePagedRows(rows, PAGE_SIZE, `${status}|${category}|${query.trim()}`)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-4 space-y-0 pb-2">
        <div className="grid gap-1">
          <CardTitle>Reported maintenance</CardTitle>
          <CardDescription>
            <span className="tabular-nums">{rows.length}</span>{' '}
            {rows.length === 1 ? 'request' : 'requests'}, oldest first
          </CardDescription>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchField value={query} onChange={setQuery} />
            <CategorySelect value={category} onChange={setCategory} requests={requests} />
          </div>

          <StatusFilterGroup value={status} onChange={setStatus} counts={counts} />
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {rows.length === 0 ? (
          <EmptyState
            onReset={() => {
              setQuery('')
              setStatus('all')
              setCategory('all')
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
                      Assigned to
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paged.rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-dashed border-border transition-colors last:border-b-0 hover:bg-muted/40"
                    >
                      <th scope="row" className="py-3 pr-6 text-left font-normal">
                        <span className="flex items-start gap-3">
                          <CategoryTile category={r.category} />
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-medium text-foreground">{r.title}</span>
                              {r.priority === 'urgent' ? <UrgentMark /> : null}
                            </span>
                            <span className="block text-muted-foreground">
                              {CATEGORY[r.category].label}
                            </span>
                            {r.note ? (
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {r.note}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </th>

                      <td className="py-3 pr-6">
                        <span className="block whitespace-nowrap text-foreground">
                          {r.unit}, {r.property}
                        </span>
                        <span className="block text-muted-foreground">{r.tenant}</span>
                      </td>

                      <td className="whitespace-nowrap py-3 pr-6">
                        <Waiting request={r} asOf={asOf} />
                      </td>

                      <td className="whitespace-nowrap py-3 pr-6">
                        <StatusPill status={r.status} />
                      </td>

                      <td className="whitespace-nowrap py-3 text-right">
                        {r.assignee ? (
                          <span className="text-foreground">{r.assignee}</span>
                        ) : (
                          <span className="text-muted-foreground">Nobody yet</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Below sm the same rows become label/value cards. */}
            <ul className="sm:hidden">
              {paged.rows.map((r) => (
                <li
                  key={r.id}
                  className="space-y-2 border-b border-dashed border-border px-3 py-3 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <CategoryTile category={r.category} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-foreground">{r.title}</span>
                        {r.priority === 'urgent' ? <UrgentMark /> : null}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {r.unit}, {r.property} &middot; {r.tenant}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <StatusPill status={r.status} />
                    <Waiting request={r} asOf={asOf} />
                    <span className="text-sm text-muted-foreground">
                      {r.assignee ?? 'Nobody yet'}
                    </span>
                  </div>

                  {r.note ? (
                    <p className="text-sm text-muted-foreground">{r.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>

            <TablePagination paged={paged} noun={['request', 'requests']} className="mt-2" />
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** Square tile, matching the properties table: square is a thing, round is a person. */
function CategoryTile({ category }: { category: MaintenanceCategory }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
    >
      <Icon name={CATEGORY[category].icon} className="h-[18px] w-[18px]" />
    </span>
  )
}

function StatusPill({ status }: { status: MaintenanceStatus }) {
  const s = STATUS[status]
  return (
    <StatusBadge tone={s.tone} icon={s.icon}>
      {s.label}
    </StatusBadge>
  )
}

/** Urgent is the only priority that gets a mark, and it is a word. */
function UrgentMark() {
  return (
    <StatusBadge tone="danger" icon="AlertTriangle" size="sm">
      Urgent
    </StatusBadge>
  )
}

/**
 * How long this has been waiting. Resolved jobs report how long they took
 * instead, because the age of a finished job is not a number anyone acts on.
 */
function Waiting({ request, asOf }: { request: MaintenanceRequest; asOf: string }) {
  if (request.status === 'resolved' && request.resolvedAt) {
    const took = daysBetween(request.raisedAt, request.resolvedAt)
    return (
      <span className="text-muted-foreground tabular-nums">
        {took === 0 ? 'Same day' : `${took} ${took === 1 ? 'day' : 'days'}`}
        <span className="block text-xs text-muted-foreground/80">
          closed {formatShortDate(request.resolvedAt)}
        </span>
      </span>
    )
  }

  const days = daysBetween(request.raisedAt, asOf)
  return (
    <span
      className={cn(
        'tabular-nums',
        days >= 7 ? 'font-medium text-warning-text' : 'text-foreground',
      )}
    >
      {days === 0 ? 'Today' : `${days} ${days === 1 ? 'day' : 'days'}`}
      <span className="block text-xs font-normal text-muted-foreground">
        {formatRelativeTime(request.raisedAt, new Date(asOf))}
      </span>
    </span>
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
        placeholder="Search job, tenant or contractor"
        aria-label="Search maintenance by job, tenant, property or contractor"
        className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
    </div>
  )
}

/**
 * Category picker.
 *
 * Six options with icons, so it is a select rather than another segmented row —
 * six inline choices beside a search field and a status filter would not fit a
 * laptop, let alone a phone.
 *
 * The trigger overrides `[&>span]:line-clamp-1` from the base SelectTrigger:
 * that sets `display: -webkit-box` on the value span, which stops an icon and a
 * label sitting on one row. Width is content-driven with a floor so the longest
 * option ("Heating & water") never wraps.
 */
function CategorySelect({
  value,
  onChange,
  requests,
}: {
  value: CategoryFilter
  onChange: (next: CategoryFilter) => void
  requests: MaintenanceRequest[]
}) {
  const counts = React.useMemo(() => {
    const out: Record<string, number> = { all: requests.length }
    for (const c of CATEGORY_ORDER) {
      out[c] = requests.filter((r) => r.category === c).length
    }
    return out
  }, [requests])

  return (
    <Select value={value} onValueChange={(v) => onChange(v as CategoryFilter)}>
      <SelectTrigger
        aria-label="Filter by category"
        className="h-10 w-full min-w-[196px] rounded-lg border-border bg-card text-sm focus:ring-2 focus:ring-accent/40 focus:ring-offset-0 sm:w-auto [&>span]:line-clamp-none [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span]:whitespace-nowrap"
      >
        <SelectValue placeholder="All categories" />
      </SelectTrigger>

      <SelectContent align="start" className="min-w-[224px] rounded-xl">
        <SelectItem value="all" className="rounded-lg">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <Icon name="Filter" className="h-4 w-4 text-muted-foreground" />
            All categories
            <span className="ml-auto tabular-nums text-muted-foreground">{counts.all}</span>
          </span>
        </SelectItem>

        {CATEGORY_ORDER.filter((c) => counts[c] > 0).map((c) => (
          <SelectItem key={c} value={c} className="rounded-lg">
            <span className="flex items-center gap-2 whitespace-nowrap">
              <Icon name={CATEGORY[c].icon} className="h-4 w-4 text-muted-foreground" />
              {CATEGORY[c].label}
              <span className="ml-auto tabular-nums text-muted-foreground">{counts[c]}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function StatusFilterGroup({
  value,
  onChange,
  counts,
}: {
  value: StatusFilter
  onChange: (next: StatusFilter) => void
  counts: Record<StatusFilter, number>
}) {
  const options: StatusFilter[] = ['all', ...STATUS_ORDER]

  return (
    <div
      role="group"
      aria-label="Filter by status"
      className="flex w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-muted/70 p-0.5 lg:w-auto"
    >
      {options.map((o) => {
        const selected = value === o
        const label = o === 'all' ? 'All' : STATUS[o].label
        return (
          <button
            key={o}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o)}
            className={cn(
              'flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm transition-colors duration-200 lg:flex-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
              selected
                ? 'bg-card font-medium text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
            <span className="tabular-nums text-muted-foreground">{counts[o]}</span>
          </button>
        )
      })}
    </div>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Icon name="Wrench" className="h-6 w-6 text-muted-foreground" />
      <p className="font-medium text-foreground">Nothing matches these filters</p>
      <p className="max-w-[40ch] text-sm text-muted-foreground">
        Job, tenant, property and contractor are all searched.
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
