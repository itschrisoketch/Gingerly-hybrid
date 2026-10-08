'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { formatKes } from '@/lib/format'
import { KIND, formatEventTime, type CalendarEvent } from '@/lib/dashboard/calendar-events'

/**
 * One event, with the hover card from the shared snippet.
 *
 * The preview is the idea worth taking: a month cell can only hold a title, and
 * the question a reader actually has — what time, who, how much — needed a click
 * to answer. Hovering answers it without leaving the grid.
 *
 * Three departures from the snippet it came from:
 *
 * COLOUR COMES FROM THE EVENT, NOT A PICKER. The snippet let an event be Blue,
 * Green, Purple, Orange, Pink or Red, chosen by whoever made it. Here the colour
 * IS the kind — rent is accent, a contractor visit is warning, a lease end is
 * destructive — so it means something, and six arbitrary hues would both break
 * DESIGN.md's restrained palette and make the grid unreadable at a glance.
 *
 * NOT DRAGGABLE. The snippet's events can be dragged to another day. There is no
 * calendar endpoint here, so a dragged event would spring back on reload; worse,
 * rent dates and lease ends are consequences of other records and are not movable
 * at all. A control that appears to reschedule a contractor and does not is worse
 * than no control.
 *
 * KEYBOARD AS WELL AS HOVER. The snippet shows the preview on mouse only. This
 * one is a button, so focus opens it too, and `aria-describedby` points at the
 * preview so a screen reader gets the same detail rather than just the title.
 */
export function EventChip({
  event,
  variant = 'compact',
  onSelect,
}: {
  event: CalendarEvent
  /** `compact` is a month cell, `row` is a list or day line. */
  variant?: 'compact' | 'row'
  onSelect?: (event: CalendarEvent) => void
}) {
  const [open, setOpen] = React.useState(false)
  const k = KIND[event.kind]
  const previewId = `event-preview-${event.id}`

  const show = () => setOpen(true)
  const hide = () => setOpen(false)

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <button
        type="button"
        onClick={() => onSelect?.(event)}
        aria-describedby={open ? previewId : undefined}
        className={cn(
          'w-full truncate rounded text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
          k.chip,
          variant === 'compact' ? 'px-1.5 py-0.5 text-[11px] font-medium' : 'px-2 py-1 text-xs font-medium',
        )}
      >
        {event.time ? <span className="tabular-nums">{event.time} </span> : null}
        {event.title}
      </button>

      {open ? (
        <div
          id={previewId}
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-border bg-popover p-3 shadow-lg"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-tight text-foreground">{event.title}</p>
            <span className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', k.dot)} />
          </div>

          {event.detail ? (
            <p className="mt-1 text-xs text-muted-foreground">{event.detail}</p>
          ) : null}

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon name="Clock" className="h-3.5 w-3.5" />
            <span className="tabular-nums">{formatEventTime(event.time)}</span>
            {event.amount ? (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="font-medium tabular-nums text-foreground">
                  {formatKes(event.amount)}
                </span>
              </>
            ) : null}
          </div>

          <span
            className={cn(
              'mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
              k.chip,
            )}
          >
            <Icon name={k.icon} className="h-3 w-3" />
            {k.label}
          </span>
        </div>
      ) : null}
    </div>
  )
}
