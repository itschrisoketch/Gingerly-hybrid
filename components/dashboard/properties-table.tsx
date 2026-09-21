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
  TablePagination,
  usePagedRows,
} from '@/components/dashboard/table-pagination'
import { formatKes } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Property, PropertyKind } from '@/lib/dashboard/sample-data'

/**
 * The portfolio as a table.
 *
 * Shares the payments table's construction so the two screens read as one
 * system: Card, a CardHeader whose title and description sit in a grid with the
 * controls pushed right, CardContent below, no rule between them, and rows
 * separated by a dashed border rather than a solid one.
 *
 * A table and not a grid of property cards. Every column here is comparable
 * across rows — units, occupancy, arrears, rent — and comparison down a column
 * is the thing an agent came to do. Cards put each property in its own box and
 * make that scan impossible; they are the right shape for things with a photo
 * and a story, and a property on this screen has neither.
 *
 * Numbers right, text left, both tabular. Arrears carry the contrast-checked
 * `-text` tokens, matching the payment status pills.
 *
 * Each row carries a square icon tile where the tenants table carries a round
 * avatar. The shape is the distinction, and it is consistent across the product:
 * round is a person, square is a place. It also keeps two tables built to the
 * same construction from reading as the same table with the words swapped.
 *
 * Rows do not navigate. There is no per-property page yet, and a row that
 * highlights under the cursor and then swallows the click is worse than a row
 * that never offered. The hover tint is the same one the payments rows use, for
 * tracking across a wide row, and it stops there.
 */

type Filter = 'all' | PropertyKind

const FILTERS: { value: Filter; label: string; icon: 'Building2' | 'Building' | 'Home' }[] = [
  { value: 'all', label: 'All', icon: 'Building2' },
  { value: 'apartment', label: 'Apartments', icon: 'Building' },
  { value: 'house', label: 'Houses', icon: 'Home' },
]

const KIND_LABEL: Record<PropertyKind, string> = {
  apartment: 'Apartment',
  house: 'House',
}

const COLUMNS = ['Property', 'Type', 'Occupancy', 'Collection'] as const

/* Matched to the tenants table so the two behave identically at the same row
   count. Twelve properties is one page today; a managing agent's portfolio is
   the thing on this screen most likely to grow. */
const PAGE_SIZE = 12

export function PropertiesTable({ properties }: { properties: Property[] }) {
  const [filter, setFilter] = React.useState<Filter>('all')
  const [query, setQuery] = React.useState('')

  const counts = React.useMemo(
    () => ({
      all: properties.length,
      apartment: properties.filter((p) => p.kind === 'apartment').length,
      house: properties.filter((p) => p.kind === 'house').length,
    }),
    [properties],
  )

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return properties.filter((p) => {
      if (filter !== 'all' && p.kind !== filter) return false
      if (!q) return true
      // Name and area both: an agent looking for the Kilimani property may not
      // remember that it is called Kilimani Heights.
      return p.name.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)
    })
  }, [properties, filter, query])

  const shownUnits = rows.reduce((n, p) => n + p.units, 0)

  const paged = usePagedRows(rows, PAGE_SIZE, `${filter}|${query.trim()}`)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-4 space-y-0 pb-2">
        <div className="grid gap-1">
          <CardTitle>All properties</CardTitle>
          <CardDescription>
            <span className="tabular-nums">{rows.length}</span>{' '}
            {rows.length === 1 ? 'property' : 'properties'},{' '}
            <span className="tabular-nums">{shownUnits}</span>{' '}
            {shownUnits === 1 ? 'unit' : 'units'}
          </CardDescription>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SearchField value={query} onChange={setQuery} />
          <KindFilter value={filter} onChange={setFilter} counts={counts} />
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {rows.length === 0 ? (
          <EmptyState query={query} onClear={() => setQuery('')} />
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
                      Rent due
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
                        <span className="flex items-center gap-3">
                          <KindTile kind={p.kind} />
                          <span className="min-w-0">
                            <span className="block font-medium text-foreground">
                              {p.name}
                            </span>
                            <span className="block text-muted-foreground">{p.area}</span>
                          </span>
                        </span>
                      </th>
                      <td className="whitespace-nowrap py-3 pr-6 text-muted-foreground">
                        {KIND_LABEL[p.kind]}
                      </td>
                      <td className="py-3 pr-6">
                        <OccupancyCell occupied={p.occupied} units={p.units} />
                      </td>
                      <td className="whitespace-nowrap py-3 pr-6">
                        <ArrearsMark unitsLate={p.unitsLate} />
                      </td>
                      <td className="whitespace-nowrap py-3 text-right font-medium text-foreground tabular-nums">
                        {formatKes(p.monthlyRent)}
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
                    <div className="flex min-w-0 items-center gap-3">
                      <KindTile kind={p.kind} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{p.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {p.area} &middot; {KIND_LABEL[p.kind]}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 font-medium text-foreground tabular-nums">
                      {formatKes(p.monthlyRent)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <ArrearsMark unitsLate={p.unitsLate} />
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {p.occupied} of {p.units} let
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <TablePagination paged={paged} noun={['property', 'properties']} className="mt-2" />
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** Square, muted, structural — the counterpart to a tenant's round teal avatar. */
function KindTile({ kind }: { kind: PropertyKind }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
    >
      <Icon name={kind === 'house' ? 'Home' : 'Building'} className="h-[18px] w-[18px]" />
    </span>
  )
}

/**
 * Occupancy as a figure with the meter beneath it, matching the ratio tile at
 * the top of the page. The bar is what makes a part-empty property findable in a
 * column of full ones without reading a single number.
 */
function OccupancyCell({ occupied, units }: { occupied: number; units: number }) {
  const pct = units > 0 ? Math.round((occupied / units) * 100) : 0

  return (
    <div className="w-28 space-y-1.5">
      <span className="block whitespace-nowrap text-foreground tabular-nums">
        {occupied} of {units}
        <span className="text-muted-foreground"> &middot; {pct}%</span>
      </span>
      <div
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct} percent let`}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn('h-full rounded-full', pct === 100 ? 'bg-accent' : 'bg-accent/60')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Arrears, and only arrears.
 *
 * A pill on every row would make the column decorative — twelve green badges
 * teach nothing, and the four that matter stop standing out. Properties that are
 * paid up say so in plain muted text and get out of the way.
 */
function ArrearsMark({ unitsLate }: { unitsLate: number }) {
  if (unitsLate === 0) {
    return (
      <StatusBadge tone="success" icon="CheckCircle">
        Paid up
      </StatusBadge>
    )
  }

  return (
    <StatusBadge tone="warning" icon="AlertTriangle">
      <span className="tabular-nums">{unitsLate}</span>
      <span>late</span>
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
    <div className="relative sm:max-w-xs sm:flex-1">
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
        placeholder="Search by name or area"
        aria-label="Search properties by name or area"
        className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
    </div>
  )
}

/**
 * Type filter as a segmented control, matching the chart card's view switch:
 * a muted track, the selected half lifted onto the card surface.
 *
 * Three mutually exclusive options with counts attached, rather than a dropdown,
 * because the counts are half the information — "Houses 5" answers a question
 * before it is clicked, and a closed select answers nothing.
 */
function KindFilter({
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
      aria-label="Filter by property type"
      className="flex w-full items-center gap-0.5 self-start rounded-lg bg-muted/70 p-0.5 sm:w-auto"
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
              'flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm transition-colors duration-200 sm:flex-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
              selected
                ? 'bg-card font-medium text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon name={f.icon} className="h-4 w-4" />
            {f.label}
            <span className="tabular-nums text-muted-foreground">{counts[f.value]}</span>
          </button>
        )
      })}
    </div>
  )
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Icon name="Building2" className="h-6 w-6 text-muted-foreground" />
      <p className="font-medium text-foreground">
        {query ? 'No properties match that search' : 'No properties of this type'}
      </p>
      <p className="max-w-[40ch] text-sm text-muted-foreground">
        {query
          ? 'Names and areas are both searched, so check the spelling of either.'
          : 'Add a property and it appears here straight away.'}
      </p>
      {query ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Clear search
        </button>
      ) : null}
    </div>
  )
}
