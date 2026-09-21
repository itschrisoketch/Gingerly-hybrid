import {
  sampleCollection,
  sampleCollectionMix,
  sampleDiary,
  sampleMaintenance,
  samplePayments,
  sampleTenants,
} from '@/lib/dashboard/sample-data'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * Everything the portfolio has on a date, in one list.
 *
 * Derived from the tenants, payments and maintenance already on the other
 * screens rather than stored separately, so the calendar cannot drift out of
 * agreement with them. A lease end shown here IS the lease end on the tenants
 * table; a contractor visit IS the scheduled job on the maintenance table.
 *
 * A plain module, not part of the client calendar: the page computes the banner
 * and the tiles from these on the server.
 */

export type EventKind =
  | 'rent'
  | 'visit'
  | 'inspection'
  | 'meeting'
  | 'viewing'
  | 'lease'
  | 'moveIn'

/** Kinds an agent can put in the diary themselves. Rent, lease ends and move-ins
 *  are consequences of other records, so they are not offered. */
export const CREATABLE_KINDS: EventKind[] = ['inspection', 'meeting', 'viewing', 'visit']

export interface CalendarEvent {
  id: string
  /** `YYYY-MM-DD`, local. */
  date: string
  kind: EventKind
  title: string
  /** The second line: who and where. */
  detail?: string
  /** Set on the rent event, which is an aggregate rather than one tenant's. */
  amount?: number
  urgent?: boolean
  /** 24-hour `HH:mm`. Absent means all day. */
  time?: string
  /** True for anything added in the browser this session, so the UI can be
   *  honest that it has not been saved anywhere. */
  draft?: boolean
}

export const KIND: Record<
  EventKind,
  { label: string; icon: IconName; dot: string; chip: string }
> = {
  rent: {
    label: 'Rent',
    icon: 'CreditCard',
    dot: 'bg-accent',
    chip: 'bg-accent/10 text-accent',
  },
  visit: {
    label: 'Contractor',
    icon: 'Wrench',
    dot: 'bg-warning',
    chip: 'bg-warning/10 text-warning-text',
  },
  inspection: {
    label: 'Inspection',
    icon: 'Eye',
    dot: 'bg-[hsl(var(--chart-2))]',
    chip: 'bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]',
  },
  meeting: {
    label: 'Meeting',
    icon: 'Users',
    dot: 'bg-navy-500',
    chip: 'bg-navy-500/10 text-navy-500 dark:bg-white/10 dark:text-white',
  },
  viewing: {
    label: 'Viewing',
    icon: 'Home',
    dot: 'bg-[hsl(var(--chart-5))]',
    chip: 'bg-[hsl(var(--chart-5))]/10 text-[hsl(var(--chart-5))]',
  },
  lease: {
    label: 'Lease ends',
    icon: 'FileText',
    dot: 'bg-destructive',
    chip: 'bg-destructive/10 text-destructive-text',
  },
  moveIn: {
    label: 'Move-in',
    icon: 'UserPlus',
    dot: 'bg-success',
    chip: 'bg-success/10 text-success-text',
  },
}

export const KIND_ORDER: EventKind[] = [
  'rent',
  'visit',
  'inspection',
  'meeting',
  'viewing',
  'lease',
  'moveIn',
]

/** Rent falls due on the 5th. One aggregate event, not 39 — a calendar cell
 *  cannot hold a tenant list, and the figure is the thing being tracked. */
const RENT_DUE_DAY = 5

function iso(y: number, m: number, d: number): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${y}-${pad(m)}-${pad(d)}`
}

/**
 * Builds the events for a window of months around `anchor`.
 *
 * Rent is generated per month because it recurs; everything else comes from a
 * record that already exists and is simply placed on its own date.
 */
export function buildEvents(fromYear: number, monthsBefore = 6, monthsAfter = 12) {
  const events: CalendarEvent[] = []

  const dueUnits = samplePayments.length
  const currentDue = samplePayments.reduce((n, p) => n + p.amount, 0)

  /* What was actually due in each month we have history for. The rent event used
     to carry the CURRENT period's figure on every month in the window, so a
     reader scrolling back to last November was told it billed exactly what
     September bills — which is false, and is the kind of plausible wrong number
     PRODUCT.md rule 2 exists to keep off this product. Months inside the mix use
     their own total; later months are a forecast and say so; months before the
     history starts get no rent marker at all, because we do not know. */
  const dueByMonth = new Map(
    sampleCollectionMix.map((m) => [m.month, m.onTime + m.late + m.unpaid]),
  )
  const firstKnown = sampleCollectionMix[0]?.month ?? ''
  const currentMonth = sampleCollectionMix[sampleCollectionMix.length - 1]?.month ?? ''

  const start = new Date(fromYear, 0, 1)
  for (let i = -monthsBefore; i <= monthsAfter; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key < firstKnown) continue

    const known = dueByMonth.get(key)
    const forecast = key > currentMonth
    events.push({
      id: `rent-${key}`,
      date: iso(d.getFullYear(), d.getMonth() + 1, RENT_DUE_DAY),
      kind: 'rent',
      title: forecast ? 'Rent due (expected)' : 'Rent due',
      detail: forecast
        ? `${dueUnits} units, at the current rent roll`
        : `${dueUnits} units across the portfolio`,
      amount: known ?? currentDue,
    })
  }

  for (const m of sampleMaintenance) {
    if (!m.scheduledFor) continue
    events.push({
      id: `visit-${m.id}`,
      date: m.scheduledFor,
      kind: 'visit',
      title: m.title,
      detail: `${m.assignee} · ${m.unit}, ${m.property}`,
      urgent: m.priority === 'urgent',
      time: m.scheduledTime,
    })
  }

  for (const d of sampleDiary) {
    events.push({
      id: `diary-${d.id}`,
      date: d.date,
      kind: d.kind,
      title: d.title,
      detail: [d.unit ? `${d.unit}, ${d.property}` : d.property, d.tenant, d.note]
        .filter(Boolean)
        .join(' · '),
      time: d.time,
    })
  }

  for (const t of sampleTenants) {
    events.push({
      id: `lease-${t.id}`,
      date: t.leaseEnd,
      kind: 'lease',
      title: `${t.name}'s lease ends`,
      detail: `${t.unit}, ${t.property}`,
    })
    events.push({
      id: `movein-${t.id}`,
      date: t.moveIn,
      kind: 'moveIn',
      title: `${t.name} moved in`,
      detail: `${t.unit}, ${t.property}`,
    })
  }

  return events.sort(byDateThenTime)
}

/** The default window, anchored on the period the dashboard reports. */
export function portfolioEvents(): CalendarEvent[] {
  return buildEvents(Number(sampleCollection.periodLabel.split(' ')[1]))
}

/** Chronological: by date, then all-day first, then by clock time. */
export function byDateThenTime(a: CalendarEvent, b: CalendarEvent): number {
  return (
    a.date.localeCompare(b.date) ||
    Number(Boolean(a.time)) - Number(Boolean(b.time)) ||
    (a.time ?? '').localeCompare(b.time ?? '') ||
    a.title.localeCompare(b.title)
  )
}

/** "09:00" -> "09:00", absent -> "All day". */
export function formatEventTime(time?: string): string {
  return time ?? 'All day'
}

export function eventsOn(events: CalendarEvent[], date: string): CalendarEvent[] {
  return events.filter((e) => e.date === date)
}

/** Events in `[from, from + days)`, for the "this week" banner. */
export function eventsWithin(
  events: CalendarEvent[],
  from: string,
  days: number,
): CalendarEvent[] {
  const start = new Date(`${from}T00:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + days)
  return events.filter((e) => {
    const d = new Date(`${e.date}T00:00:00`)
    return d >= start && d < end
  })
}
