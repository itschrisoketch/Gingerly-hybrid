'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'
import { StatusBadge } from '@/components/ui/status-badge'
import { UnavailableButton } from '@/components/ui/unavailable-button'
import { cn } from '@/lib/utils'
import {
  CATEGORY,
  FORMAT_ICON,
  KIND_LABEL,
  STATUS,
  formatBytes,
} from '@/lib/dashboard/document-meta'
import type { DocumentCategory, StoredDocument } from '@/lib/dashboard/sample-data'
import { formatFullDate } from '@/lib/dashboard/tenant-view'

/**
 * The tenant's own filed documents.
 *
 * Scoped down from the agent's DocumentsTable rather than reusing it. That one
 * has a "Where" column and a property filter, which answer a question a tenant
 * does not have — they have one unit and already know which. What is left is
 * what the document is, when it was filed and how big it is, which is a list
 * rather than a table.
 *
 * The agent's three filters become one. Category is the only one that sorts a
 * handful of documents usefully; filtering five items by status would be a
 * control that mostly returns everything.
 *
 * ⚠️ Nothing opens yet. Download and Share are present but disabled, each
 * carrying the reason. They were briefly deleted on the grounds that a dead
 * button is worse than none, which was the wrong call: removing a control
 * because its endpoint is missing loses the fact that the feature is meant to
 * exist, and the next person reads the page as the spec. Every feature survives
 * a rebuild — see components/ui/unavailable-button.tsx.
 */
export function TenantDocuments({ documents }: { documents: StoredDocument[] }) {
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState<DocumentCategory | 'all'>('all')

  const present = React.useMemo(
    () => [...new Set(documents.map((d) => d.category))],
    [documents],
  )

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return documents
      .filter((d) => {
        if (category !== 'all' && d.category !== category) return false
        if (!q) return true
        return [d.title, d.note, KIND_LABEL[d.kind], CATEGORY[d.category].label]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      })
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  }, [documents, query, category])

  const reset = () => {
    setQuery('')
    setCategory('all')
  }

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
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
            placeholder="Search your documents"
            aria-label="Search documents by title, note, kind or category"
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Chip active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </Chip>
          {present.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {CATEGORY[c].label}
            </Chip>
          ))}
        </div>

        <p className="text-xs text-muted-foreground sm:ml-auto">
          <span className="tabular-nums">{rows.length}</span> of{' '}
          <span className="tabular-nums">{documents.length}</span>
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <Icon name="FileText" className="h-6 w-6 text-muted-foreground" />
          <p className="font-medium text-foreground">
            {documents.length === 0 ? 'Nothing filed yet' : 'Nothing matches that'}
          </p>
          <p className="max-w-[44ch] text-sm text-muted-foreground">
            {documents.length === 0
              ? 'Your lease and anything else filed against your tenancy will appear here.'
              : 'Titles, notes, kinds and categories are all searched.'}
          </p>
          {documents.length > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="mt-2 flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <ul>
          {rows.map((d, i) => {
            const status = STATUS[d.status]
            return (
              <li
                key={d.id}
                className={cn(
                  'flex items-start gap-3 px-5 py-4',
                  i < rows.length - 1 && 'rule-b',
                )}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon name={FORMAT_ICON[d.format]} className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <p className="text-sm font-medium text-foreground">{d.title}</p>
                    <StatusBadge tone={status.tone} size="sm">
                      {status.label}
                    </StatusBadge>
                  </div>

                  {d.note ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">{d.note}</p>
                  ) : null}

                  <p className="mt-1 text-xs text-muted-foreground">
                    {KIND_LABEL[d.kind]} &middot; {CATEGORY[d.category].label} &middot; filed{' '}
                    {formatFullDate(d.uploadedAt)}
                    {d.expiresAt ? <> &middot; expires {formatFullDate(d.expiresAt)}</> : null}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatBytes(d.bytes)}
                  </span>
                  <UnavailableButton
                    icon="Download"
                    iconOnly
                    reason="No document store connected yet, so there is nothing to download"
                  >
                    {`Download ${d.title}`}
                  </UnavailableButton>
                  <UnavailableButton
                    icon="Share"
                    iconOnly
                    reason="No document store connected yet, so there is nothing to share"
                  >
                    {`Share ${d.title}`}
                  </UnavailableButton>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-10 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        active
          ? 'bg-accent text-accent-foreground'
          : 'border border-border text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
