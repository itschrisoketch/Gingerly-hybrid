import { MonthCalendar } from '@/components/dashboard/month-calendar'
import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import {
  eventsWithin,
  portfolioEvents,
  type EventKind,
} from '@/lib/dashboard/calendar-events'
import { formatKes } from '@/lib/format'
import { IS_SAMPLE_DATA, sampleProperties } from '@/lib/dashboard/sample-data'

/**
 * Calendar.
 *
 * Same frame as every other screen — title, banner, tiles — around a month grid
 * instead of a table. The frame is what makes the dashboard one product; the
 * thing inside it should be the shape of the data, and a month is not rows.
 *
 * Nothing here is stored as a calendar. Every entry is derived from a record
 * that already exists on another page: rent from the payment ledger, visits from
 * scheduled maintenance, lease ends and move-ins from the tenants. A date shown
 * here IS that record's date, so the calendar cannot drift away from the screens
 * it summarises.
 */

/** Treated as today, so the server and client agree on which cell is highlighted. */
const TODAY = '2026-09-21'

/** The banner's horizon. A week is what an agent plans against. */
const WEEK = 7

export default function CalendarPage() {
  const events = portfolioEvents()
  const week = eventsWithin(events, TODAY, WEEK)
  const month = events.filter((e) => e.date.startsWith(TODAY.slice(0, 7)))

  const countOf = (kind: EventKind) => week.filter((e) => e.kind === kind).length
  const rentThisWeek = week.find((e) => e.kind === 'rent')

  // The week's makeup, phrased as a list rather than four separate numbers —
  // "2 contractor visits and a lease ending" is the sentence an agent would say.
  const WORDS: Record<string, [one: string, many: string]> = {
    visit: ['contractor visit', 'contractor visits'],
    inspection: ['inspection', 'inspections'],
    meeting: ['meeting', 'meetings'],
    viewing: ['viewing', 'viewings'],
    lease: ['lease ending', 'leases ending'],
    moveIn: ['move-in', 'move-ins'],
  }

  const parts = (['visit', 'inspection', 'meeting', 'viewing', 'lease', 'moveIn'] as EventKind[])
    .map((k) => ({ k, n: countOf(k) }))
    .filter((p) => p.n > 0)
    .map(({ k, n }) => `${n} ${WORDS[k][n === 1 ? 0 : 1]}`)

  const todayEvents = events.filter((e) => e.date === TODAY)

  const figures: Figure[] = [
    { label: 'Today', value: String(todayEvents.length), icon: 'CalendarDays' },
    { label: 'This week', value: String(week.length), icon: 'Calendar' },
    {
      label: 'Visits & viewings',
      value: String(
        month.filter((e) => e.kind === 'visit' || e.kind === 'viewing').length,
      ),
      icon: 'Wrench',
    },
    {
      label: 'Inspections',
      value: String(month.filter((e) => e.kind === 'inspection').length),
      icon: 'Eye',
    },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Calendar</h1>
            {IS_SAMPLE_DATA ? (
              <SampleDataChip detail="Every date here is derived from placeholder tenants, payments and maintenance for design review. No calendar endpoint exists yet." />
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{week.length}</span>{' '}
            {week.length === 1 ? 'entry' : 'entries'} in the next{' '}
            <span className="tabular-nums">{WEEK}</span> days
          </p>
        </div>
      </header>

      {week.length > 0 ? (
        <PageBanner
          id="calendar-banner"
          eyebrow="The week ahead"
          // Rent outranks everything when it falls this week; otherwise the
          // headline is what the week actually consists of, named. Stating "5
          // things" and then "5 contractor visits" underneath says it twice.
          title={
            rentThisWeek ? (
              <>Rent falls due on {monthDay(rentThisWeek.date)}</>
            ) : (
              <>{capitalise(sentence(parts))}</>
            )
          }
          description={
            rentThisWeek ? (
              <>
                <span className="tabular-nums">{formatKes(rentThisWeek.amount ?? 0)}</span>{' '}
                across the portfolio
                {parts.length > 0 ? <> &middot; also {sentence(parts)}</> : null}
              </>
            ) : (
              <>
                Between {monthDay(TODAY)} and {monthDay(lastDayOfWindow(TODAY, WEEK))}
              </>
            )
          }
          action={{ href: '/dashboard/landlord/maintenance', label: 'Open maintenance' }}
        />
      ) : null}

      <StatTiles figures={figures} label="Scheduled" id="calendar-figures" />

      <MonthCalendar
        events={events}
        today={TODAY}
        properties={sampleProperties.map((p) => p.name)}
      />
    </div>
  )
}

/** "22 September" — the banner names a day, the grid shows the month. */
function monthDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' }).format(
    new Date(y, m - 1, d),
  )
}

/** The last day the banner's window covers, inclusive. */
function lastDayOfWindow(from: string, days: number): string {
  const [y, m, d] = from.split('-').map(Number)
  const end = new Date(y, m - 1, d + days - 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** ["a", "b", "c"] -> "a, b and c". */
function sentence(parts: string[]): string {
  if (parts.length === 1) return parts[0]
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}
