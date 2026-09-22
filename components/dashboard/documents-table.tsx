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
  FORMAT_ICON,
  KIND_LABEL,
  STATUS,
  STATUS_ORDER,
  daysUntil,
  expiringSoon,
  formatBytes,
} from '@/lib/dashboard/document-meta'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { IconName } from '@/lib/icons/icon-map'
import type {
  DocumentCategory,
  DocumentStatus,
  StoredDocument,
} from '@/lib/dashboard/sample-data'

/**
 * The document store.
 *
 * Everything the previous page offered is here: search, the category, property
 * and status filters, and View / Download / Share on each row. What changed is
 * that they work — the three filters were `<Select defaultValue="all">` with no
 * state behind them, so choosing a category did nothing at all.
 *
 * Added on top: expiry. A lease or a policy that runs out is the one thing a
 * filing cabinet can warn about that nothing else in the product would notice,
 * so it is a column, a filter and the page's banner.
 *
 * Sorted by what needs attention — expiring or lapsed first, then newest.
 */
type CategoryFilter = 'all' | DocumentCategory
type StatusFilter = 'all' | DocumentStatus

const COLUMNS = ['Document', 'Where', 'Added', 'Status'] as const
const PAGE_SIZE = 12

export function DocumentsTable({
  documents,
  asOf,
}: {
  documents: StoredDocument[]
  asOf: string
}) {
  const [category, setCategory] = React.useState<CategoryFilter>('all')
  const [property, setProperty] = React.useState('all')
  const [status, setStatus] = React.useState<StatusFilter>('all')
  const [query, setQuery] = React.useState('')
  const [onlyExpiring, setOnlyExpiring] = React.useState(false)

  const propertyNames = React.useMemo(
    () => [...new Set(documents.map((d) => d.property))].sort(),
    [documents],
  )

  const expiringCount = React.useMemo(
    () => documents.filter((d) => expiringSoon(d, asOf)).length,
    [documents, asOf],
  )

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return documents
      .filter((d) => {
        if (category !== 'all' && d.category !== category) return false
        if (property !== 'all' && d.property !== property) return false
        if (status !== 'all' && d.status !== status) return false
        if (onlyExpiring && !expiringSoon(d, asOf)) return false
        if (!q) return true
        return (
          d.title.toLowerCase().includes(q) ||
          d.property.toLowerCase().includes(q) ||
          (d.tenant?.toLowerCase().includes(q) ?? false) ||
          (d.unit?.toLowerCase().includes(q) ?? false) ||
          (d.note?.toLowerCase().includes(q) ?? false)
        )
      })
      .sort((a, b) => {
        const ax = expiringSoon(a, asOf) ? daysUntil(a.expiresAt!, asOf) : Infinity
        const bx = expiringSoon(b, asOf) ? daysUntil(b.expiresAt!, asOf) : Infinity
        if (ax !== bx) return ax - bx
        return b.uploadedAt.localeCompare(a.uploadedAt)
      })
  }, [documents, category, property, status, query, onlyExpiring, asOf])

  const totalBytes = rows.reduce((n, d) => n + d.bytes, 0)
  const paged = usePagedRows(
    rows,
    PAGE_SIZE,
    `${category}|${property}|${status}|${onlyExpiring}|${query.trim()}`,
  )

  function reset() {
    setQuery('')
    setCategory('all')
    setProperty('all')
    setStatus('all')
    setOnlyExpiring(false)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-4 space-y-0 pb-2">
        <div className="grid gap-1">
          <CardTitle>All documents</CardTitle>
          <CardDescription>
            <span className="tabular-nums">{rows.length}</span>{' '}
            {rows.length === 1 ? 'file' : 'files'} &middot;{' '}
            <span className="tabular-nums">{formatBytes(totalBytes)}</span>
          </CardDescription>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <Icon name="Search" className="h-4 w-4" />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, property or tenant"
                aria-label="Search documents by name, property, tenant or note"
                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              />
            </div>

            <FilterSelect
              label="Filter by category"
              value={category}
              onChange={(v) => setCategory(v as CategoryFilter)}
              allLabel="All categories"
              options={CATEGORY_ORDER.map((c) => ({
                value: c,
                label: CATEGORY[c].label,
                icon: CATEGORY[c].icon,
                count: documents.filter((d) => d.category === c).length,
              }))}
            />

            <FilterSelect
              label="Filter by property"
              value={property}
              onChange={setProperty}
              allLabel="All properties"
              options={propertyNames.map((n) => ({
                value: n,
                label: n,
                count: documents.filter((d) => d.property === n).length,
              }))}
            />

            <FilterSelect
              label="Filter by status"
              value={status}
              onChange={(v) => setStatus(v as StatusFilter)}
              allLabel="All statuses"
              options={STATUS_ORDER.map((s) => ({
                value: s,
                label: STATUS[s].label,
                count: documents.filter((d) => d.status === s).length,
              }))}
            />

            {expiringCount > 0 ? (
              <button
                type="button"
                aria-pressed={onlyExpiring}
                onClick={() => setOnlyExpiring((v) => !v)}
                className={cn(
                  'flex h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                  onlyExpiring
                    ? 'border-warning/50 bg-warning/10 text-warning-text'
                    : 'border-border text-muted-foreground hover:bg-muted',
                )}
              >
                <Icon name="Clock" className="h-4 w-4" />
                Expiring
                <span className="tabular-nums">{expiringCount}</span>
              </button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {rows.length === 0 ? (
          <EmptyState onReset={reset} />
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paged.rows.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-dashed border-border transition-colors last:border-b-0 hover:bg-muted/40"
                    >
                      <th scope="row" className="py-3 pr-6 text-left font-normal">
                        <span className="flex items-start gap-3">
                          <FormatTile doc={d} />
                          <span className="min-w-0">
                            <span className="block font-medium text-foreground">{d.title}</span>
                            <span className="block text-muted-foreground">
                              {KIND_LABEL[d.kind]} &middot; {CATEGORY[d.category].label} &middot;{' '}
                              <span className="tabular-nums">{formatBytes(d.bytes)}</span>
                            </span>
                            {d.note ? (
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {d.note}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </th>

                      <td className="py-3 pr-6">
                        <span className="block whitespace-nowrap text-foreground">
                          {d.unit ? `${d.unit}, ${d.property}` : d.property}
                        </span>
                        {d.tenant ? (
                          <span className="block text-muted-foreground">{d.tenant}</span>
                        ) : null}
                      </td>

                      <td className="whitespace-nowrap py-3 pr-6 text-muted-foreground tabular-nums">
                        {formatShortDate(d.uploadedAt)} {d.uploadedAt.slice(0, 4)}
                        <Expiry doc={d} asOf={asOf} />
                      </td>

                      <td className="whitespace-nowrap py-3 pr-6">
                        <StatusBadge tone={STATUS[d.status].tone}>
                          {STATUS[d.status].label}
                        </StatusBadge>
                      </td>

                      <td className="whitespace-nowrap py-3 text-right">
                        <RowActions doc={d} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Below sm the same rows become label/value cards. */}
            <ul className="sm:hidden">
              {paged.rows.map((d) => (
                <li
                  key={d.id}
                  className="space-y-2 border-b border-dashed border-border px-3 py-3 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <FormatTile doc={d} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{d.title}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {d.unit ? `${d.unit}, ${d.property}` : d.property}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <StatusBadge tone={STATUS[d.status].tone}>
                      {STATUS[d.status].label}
                    </StatusBadge>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {formatShortDate(d.uploadedAt)} &middot; {formatBytes(d.bytes)}
                    </span>
                    <Expiry doc={d} asOf={asOf} inline />
                  </div>

                  <RowActions doc={d} />
                </li>
              ))}
            </ul>

            <TablePagination paged={paged} noun={['file', 'files']} className="mt-2" />
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** Square tile with the file-type glyph — square is a thing, round is a person. */
function FormatTile({ doc }: { doc: StoredDocument }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
      title={doc.format.toUpperCase()}
    >
      <Icon name={FORMAT_ICON[doc.format]} className="h-[18px] w-[18px]" />
    </span>
  )
}

/** Only shown when it matters: within 60 days, or already lapsed. */
function Expiry({
  doc,
  asOf,
  inline,
}: {
  doc: StoredDocument
  asOf: string
  inline?: boolean
}) {
  if (!expiringSoon(doc, asOf) || !doc.expiresAt) return null
  const days = daysUntil(doc.expiresAt, asOf)
  const label = days < 0 ? `Lapsed ${Math.abs(days)}d ago` : days === 0 ? 'Expires today' : `Expires in ${days}d`

  return (
    <span className={cn('block', inline && 'inline-block')}>
      <StatusBadge tone={days < 0 ? 'danger' : 'warning'} icon="Clock" size="sm">
        {label}
      </StatusBadge>
    </span>
  )
}

/**
 * View, download and share — the three actions the previous page offered.
 *
 * None of them can do anything: there is no document store behind this, so
 * there is no file to open, stream or link to. They are disabled and say why on
 * hover, rather than being buttons that look live and silently fail.
 */
function RowActions({ doc }: { doc: StoredDocument }) {
  const actions: { label: string; icon: IconName }[] = [
    { label: 'View', icon: 'Eye' },
    { label: 'Download', icon: 'Download' },
    { label: 'Share', icon: 'Share' },
  ]

  return (
    <span className="inline-flex items-center gap-1">
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          disabled
          title={`${a.label} — no document store connected yet`}
          aria-label={`${a.label} ${doc.title} (unavailable: no document store connected)`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40"
        >
          <Icon name={a.icon} className="h-4 w-4" />
        </button>
      ))}
    </span>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  allLabel,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  allLabel: string
  options: { value: string; label: string; icon?: IconName; count: number }[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className="h-10 w-full min-w-[168px] rounded-lg border-border bg-card text-sm focus:ring-2 focus:ring-accent/40 focus:ring-offset-0 sm:w-auto [&>span]:line-clamp-none [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span]:whitespace-nowrap"
      >
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent align="start" className="min-w-[228px] rounded-xl">
        <SelectItem value="all" className="rounded-lg">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <Icon name="Filter" className="h-4 w-4 text-muted-foreground" />
            {allLabel}
          </span>
        </SelectItem>
        {options
          .filter((o) => o.count > 0)
          .map((o) => (
            <SelectItem key={o.value} value={o.value} className="rounded-lg">
              <span className="flex items-center gap-2 whitespace-nowrap">
                {o.icon ? <Icon name={o.icon} className="h-4 w-4 text-muted-foreground" /> : null}
                {o.label}
                <span className="ml-auto tabular-nums text-muted-foreground">{o.count}</span>
              </span>
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Icon name="FileText" className="h-6 w-6 text-muted-foreground" />
      <p className="font-medium text-foreground">Nothing matches these filters</p>
      <p className="max-w-[40ch] text-sm text-muted-foreground">
        Name, property, tenant and note are all searched.
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
