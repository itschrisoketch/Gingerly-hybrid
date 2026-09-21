import { MaintenanceTable } from '@/components/dashboard/maintenance-table'
import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import {
  daysBetween,
  isOpenStatus,
  isStatusFilter,
} from '@/lib/dashboard/maintenance-meta'
import { IS_SAMPLE_DATA, sampleMaintenance } from '@/lib/dashboard/sample-data'

/**
 * Maintenance.
 *
 * Built from the same parts as the rest of the dashboard — title, banner, tiles,
 * table — with this page's own exception in the banner. What it replaced was 631
 * lines of gradient cards and four duplicated tab panels.
 *
 * The exception here is not volume, it is waiting. A tenant with no hot water
 * does not care how many jobs are open; they care how long theirs has sat. So
 * the banner leads with the unassigned jobs and the longest wait among them, and
 * the table sorts oldest-unassigned first.
 *
 * Every figure is derived from the request list, so the tiles cannot disagree
 * with the table beneath them.
 */

/** Ages are measured from here rather than the clock, so the server and client
 *  agree and nothing rehydrates into a different number at midnight. */
const AS_OF = '2026-09-21'

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const status = isStatusFilter(params.status) ? params.status : 'all'

  const requests = sampleMaintenance

  const live = requests.filter((r) => isOpenStatus(r.status))
  const unassigned = requests.filter((r) => r.status === 'open')
  const urgent = live.filter((r) => r.priority === 'urgent')
  const resolved = requests.filter((r) => r.status === 'resolved' && r.resolvedAt)

  const longestWait = unassigned.reduce(
    (worst, r) => Math.max(worst, daysBetween(r.raisedAt, AS_OF)),
    0,
  )

  // Median, not mean: one job that waited on dry weather for a fortnight would
  // drag an average into saying something untrue about a typical repair.
  const times = resolved.map((r) => daysBetween(r.raisedAt, r.resolvedAt!)).sort((a, b) => a - b)
  const median = times.length
    ? times.length % 2
      ? times[(times.length - 1) / 2]
      : Math.round((times[times.length / 2 - 1] + times[times.length / 2]) / 2)
    : 0

  const figures: Figure[] = [
    { label: 'Open jobs', value: String(live.length), icon: 'Wrench' },
    {
      label: 'Resolved',
      value: `${resolved.length} of ${requests.length}`,
      icon: 'CheckCircle',
      ratio: { current: resolved.length, total: requests.length },
      ratioVerb: 'closed',
      ratioNoun: 'still open',
    },
    {
      label: 'Typical repair',
      value: `${median} ${median === 1 ? 'day' : 'days'}`,
      icon: 'Clock',
    },
    { label: 'Urgent', value: String(urgent.length), icon: 'AlertTriangle' },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Maintenance
            </h1>
            {IS_SAMPLE_DATA ? (
              <SampleDataChip detail="These jobs are placeholders for design review. No maintenance endpoint exists yet, so no request, tenant or contractor here is real." />
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{live.length}</span>{' '}
            {live.length === 1 ? 'job' : 'jobs'} still open of{' '}
            <span className="tabular-nums">{requests.length}</span> reported
          </p>
        </div>
      </header>

      {/* Unassigned work is the exception, not open work: a scheduled job has
          somebody on it and a date, an open one has neither. */}
      {unassigned.length > 0 ? (
        <PageBanner
          id="maintenance-banner"
          eyebrow="Nobody assigned"
          title={
            <>
              {unassigned.length} {unassigned.length === 1 ? 'job has' : 'jobs have'} no
              contractor yet
            </>
          }
          description={
            <>
              The oldest has been waiting{' '}
              <span className="tabular-nums">{longestWait}</span>{' '}
              {longestWait === 1 ? 'day' : 'days'}
              {urgent.length > 0 ? (
                <>
                  {' '}
                  &middot; <span className="tabular-nums">{urgent.length}</span> open{' '}
                  {urgent.length === 1 ? 'job is' : 'jobs are'} marked urgent
                </>
              ) : null}
            </>
          }
          action={{
            href: '/dashboard/landlord/maintenance?status=open',
            label: 'Show them',
          }}
        />
      ) : null}

      <StatTiles figures={figures} label="Maintenance" id="maintenance-figures" />

      <MaintenanceTable requests={requests} asOf={AS_OF} initialStatus={status} />
    </div>
  )
}
