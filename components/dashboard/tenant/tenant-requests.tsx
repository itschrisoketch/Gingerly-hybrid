'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'
import { StatusBadge, type StatusTone } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import type {
  MaintenanceCategory,
  MaintenanceRequest,
  MaintenanceStatus,
} from '@/lib/dashboard/sample-data'
import { formatFullDate } from '@/lib/dashboard/tenant-view'

/**
 * The tenant's own maintenance requests, with the search and filters working.
 *
 * The page this replaces had a search box, a status filter and a type filter,
 * none of which were wired to anything — the same defect class as the documents
 * filters and the FAQ search. They work here.
 *
 * Scoped down from the agent's table deliberately rather than reusing it. An
 * agent is triaging other people's jobs across a portfolio, so they need the
 * tenant, the unit and the property on every row; a tenant has one unit and
 * already knows which. What is left is the job, where it has got to, and when
 * somebody is coming — so this is a list, not a table.
 */

const STATUS: Record<MaintenanceStatus, { label: string; tone: StatusTone; icon: IconKey }> = {
  open: { label: 'Reported', tone: 'warning', icon: 'Clock' },
  scheduled: { label: 'Visit booked', tone: 'info', icon: 'CalendarDays' },
  in_progress: { label: 'In progress', tone: 'progress', icon: 'Wrench' },
  resolved: { label: 'Resolved', tone: 'success', icon: 'CheckCircle' },
}

type IconKey = 'Clock' | 'CalendarDays' | 'Wrench' | 'CheckCircle'

const CATEGORIES: MaintenanceCategory[] = [
  'plumbing',
  'electrical',
  'heating',
  'structural',
  'security',
  'other',
]

type StatusFilter = 'all' | 'live' | MaintenanceStatus

export function TenantRequests({ requests }: { requests: MaintenanceRequest[] }) {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<StatusFilter>('all')
  const [category, setCategory] = React.useState<MaintenanceCategory | 'all'>('all')

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return requests.filter((r) => {
      if (status === 'live' && r.status === 'resolved') return false
      if (status !== 'all' && status !== 'live' && r.status !== status) return false
      if (category !== 'all' && r.category !== category) return false
      if (!q) return true
      // The note and the contractor are searched too: "what did Otieno do" is
      // how someone actually looks for an old job.
      return [r.title, r.category, r.note, r.assignee]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [requests, query, status, category])

  const reset = () => {
    setQuery('')
    setStatus('all')
    setCategory('all')
  }

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center">
        <div className="relative lg:w-72">
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
            placeholder="Search your requests"
            aria-label="Search requests by title, type, note or contractor"
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Chip active={status === 'all'} onClick={() => setStatus('all')}>
            All
          </Chip>
          <Chip active={status === 'live'} onClick={() => setStatus('live')}>
            Still open
          </Chip>
          <Chip active={status === 'resolved'} onClick={() => setStatus('resolved')}>
            Resolved
          </Chip>
        </div>

        <label className="lg:ml-auto">
          <span className="sr-only">Filter by type</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as MaintenanceCategory | 'all')}
            className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <option value="all">All types</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <Icon name="Wrench" className="h-6 w-6 text-muted-foreground" />
          <p className="font-medium text-foreground">
            {requests.length === 0
              ? 'You have not reported anything yet'
              : 'Nothing matches these filters'}
          </p>
          <p className="max-w-[44ch] text-sm text-muted-foreground">
            {requests.length === 0
              ? 'Anything you report about the unit will be tracked here, from the day you raise it to the day it is fixed.'
              : 'Titles, types, notes and contractors are all searched.'}
          </p>
          {requests.length > 0 ? (
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
          {rows.map((r, i) => {
            const s = STATUS[r.status]
            return (
              <li
                key={r.id}
                className={cn(
                  'flex flex-col gap-2 px-5 py-4',
                  i < rows.length - 1 && 'rule-b [--rule-inset:0px]',
                )}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className="text-sm font-medium text-foreground">{r.title}</h3>
                  <StatusBadge tone={s.tone} icon={s.icon} size="sm">
                    {s.label}
                  </StatusBadge>
                  {r.priority === 'urgent' ? (
                    <StatusBadge tone="danger" size="sm">
                      Urgent
                    </StatusBadge>
                  ) : null}
                </div>

                {r.note ? (
                  <p className="max-w-[80ch] text-sm text-muted-foreground">{r.note}</p>
                ) : null}

                {/* The one line that answers "so what happens now". A booked
                    visit names the day and the firm; everything else states
                    where it got to. */}
                <p className="text-xs text-muted-foreground">
                  <span className="capitalize">{r.category}</span> &middot; reported{' '}
                  {formatFullDate(r.raisedAt)}
                  {r.status === 'scheduled' || r.status === 'in_progress' ? (
                    <>
                      {' '}
                      &middot;{' '}
                      <span className="font-medium text-foreground">
                        {r.assignee} visiting {formatFullDate(r.scheduledFor!)}
                        {r.scheduledTime ? ` at ${r.scheduledTime}` : null}
                      </span>
                    </>
                  ) : null}
                  {r.status === 'resolved' && r.resolvedAt ? (
                    <> &middot; fixed {formatFullDate(r.resolvedAt)}</>
                  ) : null}
                </p>
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
