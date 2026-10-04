import { CalendarWorkspace } from '@/components/dashboard/calendar/calendar-workspace'
import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { formatKes } from '@/lib/format'
import { IS_SAMPLE_DATA } from '@/lib/dashboard/sample-data'
import {
  KIND,
  byDateThenTime,
  eventsWithin,
  formatEventTime,
  tenancyEvents,
  TENANT_CREATABLE_KINDS,
} from '@/lib/dashboard/calendar-events'
import { formatFullDate, me, myJobs } from '@/lib/dashboard/tenant-view'

/**
 * The tenant's diary.
 *
 * Built to the design in the shared snippet: four views behind a switcher, a
 * period title with prev / Today / next beside it, one search that filters every
 * view, removable filter chips, and a hover preview on an event. The shell is
 * CalendarWorkspace, which records what was taken from that snippet and what was
 * changed — filtering by event kind rather than by colour, no drag-and-drop
 * against an API with no calendar endpoint, and working hours rather than all
 * twenty-four.
 *
 * The page it replaces listed four hardcoded entries, one of them a visit from
 * Mike Johnson, and had no month grid at all. These events are derived from
 * Grace's own records — her rent on her due day, her booked contractor, her
 * move-in and her lease end — so the diary cannot drift from the tenancy.
 *
 * Her rent falls on the 1st. The agent's calendar puts rent on the 5th, which is
 * the portfolio's aggregate collection date; two different facts that share a
 * word, which is why the tenant diary is derived separately rather than filtered
 * out of the portfolio one.
 */

/** The diary is drawn relative to this, so server and client agree. */
const TODAY = '2026-09-21'
const WEEK = 7

export default function TenantCalendarPage() {
  const events = tenancyEvents({
    unit: me.unit,
    property: me.property,
    rent: me.rent,
    moveIn: me.moveIn,
    leaseEnd: me.leaseEnd,
    jobs: myJobs,
  })

  const upcoming = events.filter((e) => e.date >= TODAY).sort(byDateThenTime)
  const thisWeek = eventsWithin(events, TODAY, WEEK)
  const next = upcoming[0]
  const nextVisit = upcoming.find((e) => e.kind === 'visit')
  const nextRent = upcoming.find((e) => e.kind === 'rent')

  const figures: Figure[] = [
    { label: 'This week', value: String(thisWeek.length), icon: 'CalendarDays' },
    {
      label: 'Next rent',
      value: nextRent ? formatFullDate(nextRent.date).replace(/ \d{4}$/, '') : '—',
      icon: 'CreditCard',
      compact: true,
    },
    {
      label: 'Contractor due',
      value: nextVisit ? formatFullDate(nextVisit.date).replace(/ \d{4}$/, '') : 'None booked',
      icon: 'Wrench',
      compact: true,
    },
    { label: 'Ahead of you', value: String(upcoming.length), icon: 'List' },
  ]

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Calendar</h1>
          {IS_SAMPLE_DATA ? (
            <SampleDataChip detail="This diary is derived from placeholder tenancy records for design review. No calendar endpoint exists yet, so nothing here is a real booking." />
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything dated on {me.unit}, {me.property} &middot;{' '}
          <span className="tabular-nums">{thisWeek.length}</span> in the next seven days
        </p>
      </header>

      {next ? (
        <PageBanner
          id="calendar-banner"
          tone={next.kind === 'visit' ? 'attention' : 'calm'}
          icon={next.kind === 'visit' ? undefined : KIND[next.kind].icon}
          eyebrow={next.date === TODAY ? 'Today' : `Next · ${KIND[next.kind].label}`}
          title={next.title}
          description={
            <>
              {formatFullDate(next.date)} &middot; {formatEventTime(next.time)}
              {next.amount ? <> &middot; {formatKes(next.amount)}</> : null}
              {next.detail ? <> &middot; {next.detail}</> : null}
            </>
          }
        />
      ) : null}

      <StatTiles figures={figures} label="Your diary" id="calendar-figures" />

      <CalendarWorkspace
        events={events}
        today={TODAY}
        emptyLabel="Nothing matches that"
        createKinds={TENANT_CREATABLE_KINDS}
        properties={[me.property]}
        createLabel="New entry"
        titlePlaceholder="Meet the agent about the lease"
        notePlaceholder="Anything you want to remember about it"
      />
    </div>
  )
}
