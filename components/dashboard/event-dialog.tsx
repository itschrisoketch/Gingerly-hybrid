'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CREATABLE_KINDS,
  KIND,
  type CalendarEvent,
  type EventKind,
} from '@/lib/dashboard/calendar-events'
import { formatLongDate } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Put something in the diary on a given day.
 *
 * Opened from a day cell's + button, from the agenda panel, or from the header,
 * and always prefilled with the date it was opened from — the whole point of
 * creating from the grid is not having to retype the day you just clicked.
 *
 * Only the kinds an agent actually schedules are offered. Rent, lease ends and
 * move-ins are consequences of a payment, a tenancy and a move; inventing one
 * here would put a date on the calendar that contradicts the record it came
 * from, so they are not in the list.
 *
 * ⚠️ Nothing is persisted. There is no calendar endpoint, so a saved entry lives
 * in this browser tab and disappears on reload. The dialog says so, and every
 * entry made this way is marked as a draft on the grid rather than being
 * presented as though it were booked.
 */
const FIELD =
  'h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40'

export function EventDialog({
  date,
  open,
  onOpenChange,
  onCreate,
  properties,
}: {
  /** `YYYY-MM-DD` the entry will land on. */
  date: string
  open: boolean
  onOpenChange: (next: boolean) => void
  onCreate: (event: CalendarEvent) => void
  properties: string[]
}) {
  const [kind, setKind] = React.useState<EventKind>('inspection')
  const [title, setTitle] = React.useState('')
  const [property, setProperty] = React.useState('')
  const [time, setTime] = React.useState('')
  const [allDay, setAllDay] = React.useState(false)
  const [note, setNote] = React.useState('')

  // Reset each time it opens, so yesterday's half-filled entry never reappears.
  React.useEffect(() => {
    if (open) {
      setKind('inspection')
      setTitle('')
      setProperty('')
      setTime('')
      setAllDay(false)
      setNote('')
    }
  }, [open])

  const canSave = title.trim().length > 0

  function save() {
    if (!canSave) return
    onCreate({
      id: `draft-${date}-${Date.now()}`,
      date,
      kind,
      title: title.trim(),
      detail: [property, note.trim()].filter(Boolean).join(' · ') || undefined,
      time: allDay || !time ? undefined : time,
      draft: true,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-[520px] sm:rounded-2xl">
        <DialogHeader className="space-y-1 p-6 pb-4 pr-12">
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            New entry
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {formatLongDate(date)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">Kind</legend>
            <div className="grid grid-cols-2 gap-2">
              {CREATABLE_KINDS.map((k) => {
                const selected = kind === k
                return (
                  <label
                    key={k}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-sm transition-colors',
                      'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40',
                      selected ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted/50',
                    )}
                  >
                    <input
                      type="radio"
                      name="event-kind"
                      value={k}
                      checked={selected}
                      onChange={() => setKind(k)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        KIND[k].chip,
                      )}
                    >
                      <Icon name={KIND[k].icon} className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-foreground">{KIND[k].label}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor="event-title" className="block text-sm font-medium text-foreground">
              What is it
            </label>
            <input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={FIELD}
              placeholder="Quarterly inspection"
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="event-property"
                className="block text-sm font-medium text-foreground"
              >
                Property
              </label>
              <Select value={property} onValueChange={setProperty}>
                <SelectTrigger
                  id="event-property"
                  className="h-10 w-full rounded-lg border-border bg-card text-sm focus:ring-2 focus:ring-accent/40 focus:ring-offset-0 [&>span]:line-clamp-none [&>span]:whitespace-nowrap"
                >
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent className="max-h-[260px] min-w-[240px] rounded-xl">
                  {properties.map((name) => (
                    <SelectItem key={name} value={name} className="rounded-lg">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="event-time" className="block text-sm font-medium text-foreground">
                Time
              </label>
              <input
                id="event-time"
                type="time"
                value={time}
                disabled={allDay}
                onChange={(e) => setTime(e.target.value)}
                className={cn(FIELD, 'tabular-nums disabled:opacity-50')}
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-[hsl(var(--accent))]"
                />
                All day
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="event-note" className="block text-sm font-medium text-foreground">
              Note
            </label>
            <textarea
              id="event-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={cn(FIELD, 'h-auto py-2')}
              placeholder="Anything the contractor or tenant needs to know"
            />
          </div>

          <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-foreground">
            <Icon name="AlertTriangle" className="mt-px h-4 w-4 shrink-0 text-warning-text" />
            <span>
              There is no calendar endpoint yet, so this is kept in the page only. It shows on
              the grid marked <span className="font-medium">Draft</span> and is gone on reload.
            </span>
          </p>
        </div>

        <DialogFooter className="gap-2 border-t border-border px-6 py-4 sm:space-x-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-50"
          >
            <Icon name="Plus" className="h-4 w-4" />
            Add to calendar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
