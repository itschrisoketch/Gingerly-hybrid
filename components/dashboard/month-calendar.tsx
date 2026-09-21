'use client'

import * as React from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { StatusBadge } from '@/components/ui/status-badge'
import { EventDialog } from '@/components/dashboard/event-dialog'
import {
  KIND,
  KIND_ORDER,
  byDateThenTime,
  formatEventTime,
  type CalendarEvent,
} from '@/lib/dashboard/calendar-events'
import { formatKes, isoDate, parseIsoDate } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * The portfolio month, what is on each day, and a way to add to it.
 *
 * Hand-built rather than driven by `components/ui/calendar`. That component
 * exists to pick ONE date and its cells are 44px squares with room for a number;
 * this one carries two or three events per day, a create affordance and a
 * selection state. Sharing them would have meant bending a picker into a planner
 * and getting a worse version of both.
 *
 * A day cell is a `div`, not a button, even though the whole cell is clickable.
 * It has to contain a second control — the + that opens the dialog on that date
 * — and a button inside a button is invalid HTML that browsers resolve by
 * dropping one of them. So selection is an absolutely positioned button filling
 * the cell, the content sits above it and ignores pointer events, and the + sits
 * above that.
 *
 * Weeks start Monday: rent is chased on working days, and a Sunday-first grid
 * splits the working week across two rows.
 *
 * `today` is passed in rather than read from the clock, so the server and client
 * agree and nothing rehydrates onto a different day at midnight.
 */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Chips shown in a cell before it collapses to a count. */
const MAX_CHIPS = 2

/** Rows in the Upcoming card. */
const UPCOMING = 6

export function MonthCalendar({
  events,
  today,
  properties,
}: {
  events: CalendarEvent[]
  /** ISO date treated as "today". */
  today: string
  /** Offered in the new-entry dialog. */
  properties: string[]
}) {
  const todayDate = React.useMemo(() => parseIsoDate(today), [today])
  const [month, setMonth] = React.useState(() => startOfMonth(todayDate))
  const [selected, setSelected] = React.useState(today)

  // Entries added in this tab. There is no endpoint, so they live here and are
  // labelled as drafts rather than being passed off as booked.
  const [drafts, setDrafts] = React.useState<CalendarEvent[]>([])
  const [dialogDate, setDialogDate] = React.useState<string | null>(null)

  const all = React.useMemo(
    () => [...events, ...drafts].sort(byDateThenTime),
    [events, drafts],
  )

  const byDate = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of all) {
      const list = map.get(e.date)
      if (list) list.push(e)
      else map.set(e.date, [e])
    }
    return map
  }, [all])

  const days = React.useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
      }),
    [month],
  )

  const upcoming = React.useMemo(
    () => all.filter((e) => e.date >= today).slice(0, UPCOMING),
    [all, today],
  )

  function openDialog(date: string) {
    setSelected(date)
    setDialogDate(date)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {format(month, 'MMMM')}
              </h2>
              <span className="text-lg text-muted-foreground tabular-nums">
                {format(month, 'yyyy')}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <NavButton
                label="Previous month"
                icon="ChevronLeft"
                onClick={() => setMonth((m) => addMonths(m, -1))}
              />
              <button
                type="button"
                onClick={() => {
                  setMonth(startOfMonth(todayDate))
                  setSelected(today)
                }}
                className="h-9 rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Today
              </button>
              <NavButton
                label="Next month"
                icon="ChevronRight"
                onClick={() => setMonth((m) => addMonths(m, 1))}
              />
            </div>
          </div>

          <div className="grid grid-cols-7 border-t border-border">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="border-b border-border px-1 py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{d[0]}</span>
              </div>
            ))}

            {days.map((day) => {
              const key = isoDate(day)
              const dayEvents = byDate.get(key) ?? []
              const outside = !isSameMonth(day, month)
              const isToday = isSameDay(day, todayDate)
              const isSelected = key === selected

              return (
                <div
                  key={key}
                  className={cn(
                    'group relative min-h-[64px] border-b border-r border-border transition-colors sm:min-h-[108px]',
                    '[&:nth-child(7n+7)]:border-r-0',
                    outside ? 'bg-muted/30' : 'hover:bg-muted/40',
                    isSelected && 'bg-accent/[0.07] hover:bg-accent/10',
                  )}
                >
                  {/* Selection fills the cell and sits beneath the content. */}
                  <button
                    type="button"
                    onClick={() => setSelected(key)}
                    onDoubleClick={() => openDialog(key)}
                    aria-current={isToday ? 'date' : undefined}
                    aria-pressed={isSelected}
                    aria-label={`${format(day, 'd MMMM yyyy')}, ${dayEvents.length} ${
                      dayEvents.length === 1 ? 'entry' : 'entries'
                    }. Double-click to add one.`}
                    className="absolute inset-0 z-0 rounded-none focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50"
                  />

                  <div className="pointer-events-none relative z-10 flex h-full flex-col gap-1 p-1.5 sm:p-2">
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm tabular-nums',
                        outside && 'text-muted-foreground/50',
                        !outside && !isToday && 'text-foreground',
                        isToday && 'bg-accent font-semibold text-accent-foreground',
                      )}
                    >
                      {format(day, 'd')}
                    </span>

                    {/* Chips on a laptop, dots on a phone: three chips in a 48px
                        column would be three lines of clipped text. */}
                    <span className="hidden min-w-0 flex-col gap-1 sm:flex">
                      {dayEvents.slice(0, MAX_CHIPS).map((e) => (
                        <span
                          key={e.id}
                          className={cn(
                            'flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] font-medium',
                            KIND[e.kind].chip,
                            e.draft && 'ring-1 ring-inset ring-current/40',
                          )}
                        >
                          <Icon name={KIND[e.kind].icon} className="h-3 w-3 shrink-0" />
                          {e.time ? (
                            <span className="shrink-0 tabular-nums opacity-80">{e.time}</span>
                          ) : null}
                          <span className="truncate">{e.title}</span>
                        </span>
                      ))}
                      {dayEvents.length > MAX_CHIPS ? (
                        <span className="px-1 text-[11px] text-muted-foreground tabular-nums">
                          +{dayEvents.length - MAX_CHIPS} more
                        </span>
                      ) : null}
                    </span>

                    <span className="flex flex-wrap gap-0.5 sm:hidden">
                      {dayEvents.slice(0, 4).map((e) => (
                        <span
                          key={e.id}
                          aria-hidden="true"
                          className={cn('h-1.5 w-1.5 rounded-full', KIND[e.kind].dot)}
                        />
                      ))}
                    </span>
                  </div>

                  {/* Create on this day. Visible on hover and whenever focused,
                      so it is reachable by keyboard rather than hover-only. */}
                  <button
                    type="button"
                    onClick={() => openDialog(key)}
                    aria-label={`Add an entry on ${format(day, 'd MMMM yyyy')}`}
                    className={cn(
                      'absolute right-1 top-1 z-20 hidden h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors',
                      'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                      'sm:flex sm:opacity-0 group-hover:sm:opacity-100 focus-visible:sm:opacity-100',
                    )}
                  >
                    <Icon name="Plus" className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Legend. Identity is never the dot alone — each is named. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 text-xs text-muted-foreground sm:px-6">
            {KIND_ORDER.map((k) => (
              <span key={k} className="flex items-center gap-1.5">
                <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', KIND[k].dot)} />
                {KIND[k].label}
              </span>
            ))}
          </div>
        </Card>

        <Agenda
          date={selected}
          events={byDate.get(selected) ?? []}
          today={today}
          onAdd={() => openDialog(selected)}
        />
      </div>

      <Upcoming events={upcoming} today={today} />

      <EventDialog
        date={dialogDate ?? selected}
        open={dialogDate !== null}
        onOpenChange={(next) => setDialogDate(next ? (dialogDate ?? selected) : null)}
        onCreate={(e) => setDrafts((d) => [...d, e])}
        properties={properties}
      />
    </div>
  )
}

function NavButton({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: 'ChevronLeft' | 'ChevronRight'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  )
}

function DraftMark() {
  return (
    <StatusBadge
      tone="neutral"
      icon="Edit"
      size="sm"
      title="Kept in this tab only — there is no calendar endpoint yet"
    >
      Draft
    </StatusBadge>
  )
}

/**
 * The selected day in full.
 *
 * The grid can only ever show a truncated title; this is where a day is read. A
 * panel rather than a popover, because here the day is the subject — a popover
 * would cover the grid the moment you wanted to compare two days.
 */
function Agenda({
  date,
  events,
  today,
  onAdd,
}: {
  date: string
  events: CalendarEvent[]
  today: string
  onAdd: () => void
}) {
  const d = parseIsoDate(date)
  const isToday = date === today

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            {isToday ? 'Today' : format(d, 'EEEE')}
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
            {format(d, 'd MMMM yyyy')}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {events.length === 0
              ? 'Nothing scheduled'
              : `${events.length} ${events.length === 1 ? 'entry' : 'entries'}`}
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Icon name="Plus" className="h-4 w-4" />
          Add
        </button>
      </div>

      <CardContent className="flex-1 p-0">
        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <Icon name="CalendarDays" className="h-6 w-6 text-muted-foreground" />
            <p className="max-w-[28ch] text-sm text-muted-foreground">
              Nothing falls on this day. Add an inspection, a viewing or a meeting.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-dashed divide-border">
            {events.map((e) => (
              <li key={e.id} className="flex gap-3 px-5 py-4">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    KIND[e.kind].chip,
                  )}
                >
                  <Icon name={KIND[e.kind].icon} className="h-[18px] w-[18px]" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="font-medium text-foreground">{e.title}</p>
                    {e.urgent ? (
                      <StatusBadge tone="danger" icon="AlertTriangle" size="sm">
                        Urgent
                      </StatusBadge>
                    ) : null}
                    {e.draft ? <DraftMark /> : null}
                  </div>

                  {e.detail ? (
                    <p className="text-sm text-muted-foreground">{e.detail}</p>
                  ) : null}
                  {e.amount ? (
                    <p className="mt-0.5 text-sm font-medium text-foreground tabular-nums">
                      {formatKes(e.amount)}
                    </p>
                  ) : null}

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon name="Clock" className="h-3 w-3" />
                    <span className="tabular-nums">{formatEventTime(e.time)}</span>
                    <span aria-hidden="true">·</span>
                    {KIND[e.kind].label}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * What is coming, regardless of which month is on screen.
 *
 * The grid answers "what does this month look like"; this answers "what is
 * next", which is a different question and the one asked most often. Without it
 * the only way to see into next month is to navigate away from this one.
 */
function Upcoming({ events, today }: { events: CalendarEvent[]; today: string }) {
  if (events.length === 0) return null

  return (
    <Card>
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Next up</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          The next {events.length} {events.length === 1 ? 'entry' : 'entries'}, whatever month
          they fall in
        </p>
      </div>

      <ul className="divide-y divide-dashed divide-border">
        {events.map((e) => {
          const d = parseIsoDate(e.date)
          return (
            <li key={e.id} className="flex items-center gap-4 px-5 py-3 sm:px-6">
              <div className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-border py-1">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {format(d, 'MMM')}
                </span>
                <span className="text-base font-semibold text-foreground tabular-nums">
                  {format(d, 'd')}
                </span>
              </div>

              <span
                aria-hidden="true"
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  KIND[e.kind].chip,
                )}
              >
                <Icon name={KIND[e.kind].icon} className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-foreground">{e.title}</span>
                  {e.date === today ? (
                    <StatusBadge tone="progress" icon="Clock" size="sm">
                      Today
                    </StatusBadge>
                  ) : null}
                  {e.draft ? <DraftMark /> : null}
                </p>
                {e.detail ? (
                  <p className="truncate text-sm text-muted-foreground">{e.detail}</p>
                ) : null}
              </div>

              <span className="hidden shrink-0 text-sm text-muted-foreground tabular-nums sm:block">
                {formatEventTime(e.time)}
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
