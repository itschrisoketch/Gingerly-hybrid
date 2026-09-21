'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { isoDate, parseIsoDate, formatLongDate } from '@/lib/format'

/**
 * Pick the date the lease renewals are measured from.
 *
 * The date lives in the URL rather than in component state, for three reasons:
 * a chosen date survives a refresh, it can be linked to a colleague, and the
 * page stays a Server Component that reads `searchParams` instead of becoming a
 * client tree to hold one value.
 *
 * `useSearchParams` is deliberately not used. It forces the nearest parent into
 * a Suspense boundary, and this screen carries exactly one parameter, so the
 * next URL can be built from the pathname without reading the current query.
 * Revisit that if the table's filters ever move into the URL too.
 *
 * The label names what the date actually changes — renewals — rather than
 * saying "as of". Rent status here is a fixed snapshot of the current period; a
 * control implying the whole page re-times to an arbitrary date would be
 * promising something the data cannot do.
 */
export function DateCheck({
  value,
  defaultValue,
  param = 'as-of',
}: {
  /** The date currently in effect, as `YYYY-MM-DD`. */
  value: string
  /** Where "Reset" goes back to. */
  defaultValue: string
  param?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  const selected = parseIsoDate(value)

  function go(date: string) {
    setOpen(false)
    router.push(date === defaultValue ? pathname : `${pathname}?${param}=${date}`, {
      scroll: false,
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Renewals as of ${formatLongDate(value)}. Choose a different date.`}
          className="flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Icon name="CalendarDays" className="h-4 w-4 text-muted-foreground" />
          <span className="tabular-nums">Renewals as of {formatLongDate(value)}</span>
          <Icon name="ChevronDown" className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => d && go(isoDate(d))}
          initialFocus
        />

        <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-3">
          <p className="max-w-[24ch] text-xs text-muted-foreground">
            Leases ending within 60 days of this date are marked for renewal.
          </p>
          <button
            type="button"
            onClick={() => go(defaultValue)}
            disabled={value === defaultValue}
            className="h-9 shrink-0 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:text-muted-foreground/50"
          >
            Reset
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
