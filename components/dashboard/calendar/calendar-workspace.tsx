'use client'

import * as React from 'react'
import {
  addDays,
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

import { EventChip } from '@/components/dashboard/calendar/event-chip'
import { EventDialog } from '@/components/dashboard/event-dialog'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { isoDate, parseIsoDate } from '@/lib/format'
import {
  KIND,
  KIND_ORDER,
  byDateThenTime,
  formatEventTime,
  type CalendarEvent,
  type EventKind,
} from '@/lib/dashboard/calendar-events'

/**
 * The calendar, in four views, built to the shared snippet's design.
 *
 * WHAT CAME FROM IT: the view switcher (a button group on a screen, a select on
 * a phone), the prev / Today / next cluster beside the period title, a search
 * that filters every view at once, dropdown-style filters with a count on the
 * trigger, removable chips for whatever is active, and the hover preview on an
 * event. All of that was missing here — the existing month grid could only page
 * between months.
 *
 * WHAT WAS CHANGED, and why each one:
 *
 * - FILTER BY KIND, not by colour, tag and category. The snippet had three
 *   independent taxonomies, all author-assigned. This product already has one
 *   that means something — rent, contractor, inspection, viewing, meeting,
 *   lease, move-in — and it carries the colour and the icon with it. Filtering
 *   by "Blue" would tell a tenant nothing about their own flat.
 *
 * - NO DRAG AND DROP. There is no calendar endpoint. An event dragged to a new
 *   day would spring back on reload, and rent dates and lease ends are
 *   consequences of other records rather than things anyone may move.
 *
 * - THE DAY AND WEEK VIEWS SHOW WORKING HOURS, not all 24. The snippet renders
 *   midnight to midnight, which here would be mostly empty rows: these events
 *   are either all-day (rent, lease end) or in working hours (a contractor at
 *   10:00). All-day events are pinned above the grid rather than being dropped,
 *   which a 24-row hour grid would otherwise do to them silently.
 *
 * - WEEKS START MONDAY. Carried over from the month grid this replaces: rent is
 *   chased on working days, and a Sunday-first grid splits the working week
 *   across two rows.
 *
 * `today` is passed in rather than read from the clock, so the server and the
 * client agree and nothing rehydrates onto a different day at midnight.
 */

export type CalendarView = 'month' | 'week' | 'day' | 'list'

const VIEWS: { value: CalendarView; label: string; icon: 'CalendarDays' | 'LayoutDashboard' | 'Clock' | 'List' }[] = [
  { value: 'month', label: 'Month', icon: 'CalendarDays' },
  { value: 'week', label: 'Week', icon: 'LayoutDashboard' },
  { value: 'day', label: 'Day', icon: 'Clock' },
  { value: 'list', label: 'List', icon: 'List' },
]

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Chips in a month cell before it collapses to a count. */
const MAX_CHIPS = 2

/** The hours the day and week grids draw. */
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7) // 07:00 – 19:00

export function CalendarWorkspace({
  events,
  today,
  defaultView = 'month',
  emptyLabel = 'Nothing in the diary',
  createKinds,
  properties = [],
  createLabel = 'New entry',
  titlePlaceholder,
  notePlaceholder,
}: {
  events: CalendarEvent[]
  /** ISO date treated as today. */
  today: string
  defaultView?: CalendarView
  emptyLabel?: string
  /** Which kinds this caller may add. Omit to hide the create affordance
   *  entirely — a calendar nobody may write to should not offer a button. */
  createKinds?: EventKind[]
  properties?: string[]
  createLabel?: string
  titlePlaceholder?: string
  notePlaceholder?: string
}) {
  const todayDate = parseIsoDate(today)
  const [view, setView] = React.useState<CalendarView>(defaultView)
  const [cursor, setCursor] = React.useState(todayDate)
  const [query, setQuery] = React.useState('')
  const [kinds, setKinds] = React.useState<EventKind[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)

  /* Entries added here live in this tab and vanish on reload, because there is
     no calendar endpoint. They are kept apart from `events` and marked as
     drafts on the grid rather than being mixed in and passed off as booked. */
  const [drafts, setDrafts] = React.useState<CalendarEvent[]>([])
  const all = React.useMemo(
    () => [...events, ...drafts].sort(byDateThenTime),
    [events, drafts],
  )

  const present = React.useMemo(
    () => KIND_ORDER.filter((k) => all.some((e) => e.kind === k)),
    [all],
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((e) => {
      if (kinds.length > 0 && !kinds.includes(e.kind)) return false
      if (!q) return true
      return [e.title, e.detail, KIND[e.kind].label]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [all, query, kinds])

  const hasFilters = kinds.length > 0 || query.trim().length > 0
  const clearAll = () => {
    setKinds([])
    setQuery('')
  }

  const move = (dir: -1 | 1) => {
    setCursor((c) => {
      if (view === 'month') return addMonths(c, dir)
      if (view === 'week') return addDays(c, dir * 7)
      if (view === 'day') return addDays(c, dir)
      return c
    })
  }

  const periodLabel =
    view === 'month'
      ? format(cursor, 'MMMM yyyy')
      : view === 'week'
        ? `Week of ${format(startOfWeek(cursor, { weekStartsOn: 1 }), 'd MMM')}`
        : view === 'day'
          ? format(cursor, 'EEEE d MMMM yyyy')
          : 'Everything'

  return (
    <section className="space-y-4">
      {/* Header: period, navigation, view switcher */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {periodLabel}
          </h2>

          {view !== 'list' ? (
            <div className="flex items-center gap-1.5">
              <NavButton icon="ChevronLeft" label="Previous" onClick={() => move(-1)} />
              <button
                type="button"
                onClick={() => setCursor(todayDate)}
                className="h-8 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Today
              </button>
              <NavButton icon="ChevronRight" label="Next" onClick={() => move(1)} />
            </div>
          ) : null}
        </div>

        {/* Phone: a select. Screen: a button group. Straight from the snippet —
            four buttons do not fit a phone, and a select is the native control
            for picking one of four. */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:hidden">
            <span className="sr-only">Calendar view</span>
            <select
              value={view}
              onChange={(e) => setView(e.target.value as CalendarView)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {VIEWS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label} view
                </option>
              ))}
            </select>
          </label>

          <div
            role="group"
            aria-label="Calendar view"
            className="hidden items-center gap-1 rounded-xl border border-border bg-card p-1 sm:flex"
          >
            {VIEWS.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => setView(v.value)}
                aria-pressed={view === v.value}
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                  view === v.value
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <Icon name={v.icon} className="h-4 w-4" />
                {v.label}
              </button>
            ))}
          </div>

          {createKinds ? (
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <Icon name="Plus" className="h-4 w-4" />
              {createLabel}
            </button>
          ) : null}
        </div>
      </div>

      {/* Search and kind filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
            placeholder="Search the diary"
            aria-label="Search events by title, detail or type"
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {present.map((k) => {
            const on = kinds.includes(k)
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setKinds((prev) => (on ? prev.filter((x) => x !== k) : [...prev, k]))
                }
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                  on
                    ? 'bg-accent text-accent-foreground'
                    : 'border border-border text-muted-foreground hover:bg-muted',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn('h-2 w-2 rounded-full', on ? 'bg-accent-foreground' : KIND[k].dot)}
                />
                {KIND[k].label}
              </button>
            )
          })}

          {hasFilters ? (
            <button
              type="button"
              onClick={clearAll}
              className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <Icon name="X" className="h-3.5 w-3.5" />
              Clear
            </button>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground sm:ml-auto">
          <span className="tabular-nums">{filtered.length}</span> of{' '}
          <span className="tabular-nums">{all.length}</span> shown
        </p>
      </div>

      {createKinds ? (
        <EventDialog
          date={isoDate(view === 'month' ? todayDate : cursor)}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreate={(e) => setDrafts((prev) => [...prev, e])}
          properties={properties}
          kinds={createKinds}
          title={createLabel}
          titlePlaceholder={titlePlaceholder}
          notePlaceholder={notePlaceholder}
        />
      ) : null}

      {view === 'month' ? (
        <MonthGrid events={filtered} cursor={cursor} todayDate={todayDate} />
      ) : view === 'week' ? (
        <WeekGrid events={filtered} cursor={cursor} todayDate={todayDate} />
      ) : view === 'day' ? (
        <DayGrid events={filtered} cursor={cursor} />
      ) : (
        <ListGrid events={filtered} today={today} emptyLabel={emptyLabel} />
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */

function NavButton({
  icon,
  label,
  onClick,
}: {
  icon: 'ChevronLeft' | 'ChevronRight'
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  )
}

function MonthGrid({
  events,
  cursor,
  todayDate,
}: {
  events: CalendarEvent[]
  cursor: Date
  todayDate: Date
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* The grid is inset from the card rather than each cell being inset from
          its neighbour. Cell rules have to meet or the line breaks into
          disconnected dashes; insetting the container keeps them continuous
          while still stopping them short of the card's own edge. */}
      <div className="px-2 sm:px-3">
        <div className="grid grid-cols-7 border-b border-dashed border-border">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d.charAt(0)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = isoDate(day)
          const dayEvents = events.filter((e) => e.date === key).sort(byDateThenTime)
          const outside = !isSameMonth(day, cursor)
          const isToday = isSameDay(day, todayDate)

          return (
            <div
              key={key}
              className={cn(
                'min-h-24 space-y-1 border-b border-dashed border-border p-1.5 sm:min-h-28',
                outside && 'bg-muted/30',
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums',
                  outside && 'text-muted-foreground/60',
                  !outside && !isToday && 'text-foreground',
                  isToday && 'bg-accent font-semibold text-accent-foreground',
                )}
                aria-current={isToday ? 'date' : undefined}
              >
                {format(day, 'd')}
              </div>

              {dayEvents.slice(0, MAX_CHIPS).map((e) => (
                <EventChip key={e.id} event={e} />
              ))}
              {dayEvents.length > MAX_CHIPS ? (
                <p className="px-1 text-[10px] text-muted-foreground">
                  +{dayEvents.length - MAX_CHIPS} more
                </p>
              ) : null}
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}

function WeekGrid({
  events,
  cursor,
  todayDate,
}: {
  events: CalendarEvent[]
  cursor: Date
  todayDate: Date
}) {
  const start = startOfWeek(cursor, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <div className="min-w-[640px] px-2 sm:px-3">
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-dashed border-border">
          <div />
          {days.map((d) => (
            <div
              key={isoDate(d)}
              className={cn(
                'px-2 py-2 text-center text-xs',
                isSameDay(d, todayDate) ? 'text-accent-text' : 'text-muted-foreground',
              )}
            >
              <div className="font-medium">{format(d, 'EEE')}</div>
              <div className="tabular-nums">{format(d, 'd MMM')}</div>
            </div>
          ))}
        </div>

        {/* All-day events sit above the hour grid rather than being dropped.
            Rent and lease ends have no clock time, and an hour grid has nowhere
            to put them. */}
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-dashed border-border">
          <div className="px-2 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            All day
          </div>
          {days.map((d) => {
            const key = isoDate(d)
            const allDay = events.filter((e) => e.date === key && !e.time)
            return (
              <div key={key} className="space-y-1 p-1">
                {allDay.map((e) => (
                  <EventChip key={e.id} event={e} />
                ))}
              </div>
            )
          })}
        </div>

        {HOURS.map((h) => (
          <div key={h} className="grid grid-cols-[3.5rem_repeat(7,1fr)]">
            <div className="border-b border-dashed border-border px-2 py-2 text-[10px] text-muted-foreground tabular-nums">
              {String(h).padStart(2, '0')}:00
            </div>
            {days.map((d) => {
              const key = isoDate(d)
              const slot = events.filter(
                (e) => e.date === key && e.time && Number(e.time.slice(0, 2)) === h,
              )
              return (
                <div
                  key={`${key}-${h}`}
                  className="min-h-12 space-y-1 border-b border-dashed border-border p-1"
                >
                  {slot.map((e) => (
                    <EventChip key={e.id} event={e} />
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function DayGrid({ events, cursor }: { events: CalendarEvent[]; cursor: Date }) {
  const key = isoDate(cursor)
  const onDay = events.filter((e) => e.date === key)
  const allDay = onDay.filter((e) => !e.time)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {allDay.length > 0 ? (
        <div className="flex gap-3 border-b border-dashed border-border p-3">
          <span className="w-14 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
            All day
          </span>
          <div className="flex-1 space-y-1">
            {allDay.map((e) => (
              <EventChip key={e.id} event={e} variant="row" />
            ))}
          </div>
        </div>
      ) : null}

      {HOURS.map((h) => {
        const slot = onDay.filter((e) => e.time && Number(e.time.slice(0, 2)) === h)
        return (
          <div key={h} className="flex border-b border-dashed border-border last:border-b-0">
            <span className="w-14 shrink-0 px-3 py-3 text-xs text-muted-foreground tabular-nums">
              {String(h).padStart(2, '0')}:00
            </span>
            <div className="min-h-14 flex-1 space-y-1 p-2">
              {slot.map((e) => (
                <EventChip key={e.id} event={e} variant="row" />
              ))}
            </div>
          </div>
        )
      })}

      {onDay.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Nothing on this day.
        </p>
      ) : null}
    </div>
  )
}

function ListGrid({
  events,
  today,
  emptyLabel,
}: {
  events: CalendarEvent[]
  today: string
  emptyLabel: string
}) {
  // Upcoming first, because a diary is read forwards; past events stay
  // reachable below rather than being hidden.
  const upcoming = events.filter((e) => e.date >= today).sort(byDateThenTime)
  const past = events.filter((e) => e.date < today).sort(byDateThenTime).reverse()

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <Icon name="CalendarDays" className="h-6 w-6 text-muted-foreground" />
        <p className="font-medium text-foreground">{emptyLabel}</p>
        <p className="max-w-[40ch] text-sm text-muted-foreground">
          Titles, details and types are all searched.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Section title="Coming up" rows={upcoming} today={today} />
      {past.length > 0 ? <Section title="Already happened" rows={past} today={today} muted /> : null}
    </div>
  )
}

function Section({
  title,
  rows,
  today,
  muted,
}: {
  title: string
  rows: CalendarEvent[]
  today: string
  muted?: boolean
}) {
  if (rows.length === 0) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <h3 className="px-5 pt-4 text-sm font-medium text-foreground">{title}</h3>
      <ul className="mt-2">
        {rows.map((e, i) => {
          const k = KIND[e.kind]
          return (
            <li
              key={e.id}
              className={cn(
                'flex items-start gap-3 px-5 py-3',
                i < rows.length - 1 && 'rule-b',
                muted && 'opacity-70',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  k.chip,
                )}
              >
                <Icon name={k.icon} className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{e.title}</p>
                {e.detail ? (
                  <p className="truncate text-xs text-muted-foreground">{e.detail}</p>
                ) : null}
              </div>

              <div className="shrink-0 text-right">
                <p
                  className={cn(
                    'text-xs tabular-nums',
                    e.date === today ? 'font-medium text-accent-text' : 'text-muted-foreground',
                  )}
                >
                  {format(parseIsoDate(e.date), 'd MMM yyyy')}
                </p>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  {formatEventTime(e.time)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
