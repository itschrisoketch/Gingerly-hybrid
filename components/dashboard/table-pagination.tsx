'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Pagination for the dashboard tables.
 *
 * One component and one hook, shared, so the tenants and properties tables
 * cannot drift into behaving differently — the page-resets-on-filter rule below
 * is the kind of thing that gets fixed in one copy and not the other.
 *
 * Numbers rather than prev/next alone. A rent roll is read by position as often
 * as by scrolling ("the late ones are on the first page"), and with four pages a
 * numbered control costs nothing and saves three clicks.
 */

const WINDOW = 7

export interface Paged<T> {
  rows: T[]
  page: number
  pageCount: number
  setPage: (n: number) => void
  /** 1-indexed position of the first row shown, for the "Showing" line. */
  from: number
  to: number
  total: number
}

/**
 * Slices rows for the current page.
 *
 * Two correctness rules, both of which produce an empty table when missed:
 *
 * 1. Filtering resets to page 1. Sitting on page 4 and then searching for a name
 *    that returns three matches otherwise shows nothing at all, and the table
 *    looks broken rather than filtered. `resetKey` is whatever string describes
 *    the current filter state; when it changes, the page goes back to 1. This is
 *    the render-phase state adjustment React documents, not an effect, so the
 *    reset lands in the same commit as the new rows rather than a frame later.
 * 2. The page is clamped on read. A row count that shrinks below the current
 *    page — deleting the last row on page 4 — would otherwise leave the slice
 *    past the end of the array.
 */
export function usePagedRows<T>(rows: T[], pageSize: number, resetKey: string): Paged<T> {
  const [state, setState] = React.useState({ key: resetKey, page: 1 })

  if (state.key !== resetKey) {
    setState({ key: resetKey, page: 1 })
  }

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const page = Math.min(state.page, pageCount)
  const start = (page - 1) * pageSize

  return {
    rows: rows.slice(start, start + pageSize),
    page,
    pageCount,
    setPage: (n) => setState({ key: resetKey, page: Math.min(Math.max(n, 1), pageCount) }),
    from: rows.length === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, rows.length),
    total: rows.length,
  }
}

/** Page numbers with gaps, e.g. `1 … 4 5 6 … 12`. Whole range while it fits. */
function pageList(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= WINDOW) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }

  const span = 1
  const pages = new Set([1, pageCount, page])
  for (let i = page - span; i <= page + span; i++) {
    if (i > 1 && i < pageCount) pages.add(i)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  let previous = 0
  for (const n of sorted) {
    // A gap standing in for exactly one page is wasted: the ellipsis is as wide
    // as the number it hides, and the number is clickable.
    if (n - previous === 2) out.push(previous + 1)
    else if (previous && n - previous > 2) out.push('gap')
    out.push(n)
    previous = n
  }
  return out
}

export function TablePagination<T>({
  paged,
  noun,
  className,
}: {
  paged: Paged<T>
  /** What is being counted, as [singular, plural]. Both are given rather than
   *  adding an "s", which turns "property" into "propertys". */
  noun: [one: string, many: string]
  className?: string
}) {
  const { page, pageCount, setPage, from, to, total } = paged

  // One page of results needs no controls, but the count is still worth stating.
  const showControls = pageCount > 1

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-dashed border-border px-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-0',
        className,
      )}
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing <span className="tabular-nums text-foreground">{from}</span>–
        <span className="tabular-nums text-foreground">{to}</span> of{' '}
        <span className="tabular-nums text-foreground">{total}</span>{' '}
        {total === 1 ? noun[0] : noun[1]}
      </p>

      {showControls ? (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <Step
            direction="previous"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          />

          {pageList(page, pageCount).map((n, i) =>
            n === 'gap' ? (
              <span
                key={`gap-${i}`}
                aria-hidden="true"
                className="px-1 text-sm text-muted-foreground"
              >
                &hellip;
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-label={`Page ${n}`}
                aria-current={n === page ? 'page' : undefined}
                className={cn(
                  'h-10 min-w-10 rounded-lg px-2 text-sm tabular-nums transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                  n === page
                    ? 'bg-accent font-medium text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {n}
              </button>
            ),
          )}

          <Step
            direction="next"
            disabled={page === pageCount}
            onClick={() => setPage(page + 1)}
          />
        </nav>
      ) : null}
    </div>
  )
}

function Step({
  direction,
  disabled,
  onClick,
}: {
  direction: 'previous' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'previous' ? 'Previous page' : 'Next page'}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon
        name={direction === 'previous' ? 'ChevronLeft' : 'ChevronRight'}
        className="h-4 w-4"
      />
    </button>
  )
}
