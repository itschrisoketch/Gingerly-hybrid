import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { ReportIssue } from '@/components/dashboard/tenant/report-issue'
import { TenantRequests } from '@/components/dashboard/tenant/tenant-requests'
import { Icon } from '@/components/ui/icon'
import { IS_SAMPLE_DATA } from '@/lib/dashboard/sample-data'
import { daysBetween, formatFullDate, me, myJobs, tenancy } from '@/lib/dashboard/tenant-view'

/**
 * The tenant's maintenance.
 *
 * Mirrors its sibling, the agent's maintenance screen — banner, figure row,
 * then the list.
 *
 * The page this replaces was about a different building and different people:
 * jobs assigned to Mike Johnson, Sarah Davis and Lisa Chen, dated 2024, with
 * HVAC among the request types. The contractors in this product are Kenyan
 * firms, the jobs are Grace's own, and a Nairobi apartment has no central
 * heating to service.
 *
 * Its search box and its two filters were all inert — `Select` elements and an
 * `Input` with no state behind them, the same defect class as the documents
 * filters and the FAQ search. They work now.
 *
 * On reporting: there is no maintenance endpoint, so the form that used to sit
 * here could not submit. Rather than keep a dead form, the page routes to the
 * person who can actually act — the agent — and says why. A form that discards
 * what someone types about a fault in their home is worse than no form.
 */

/** Ages and visit dates count from here, so server and client agree. */
const AS_OF = '2026-09-21'

export default function TenantMaintenancePage() {
  const jobs = [...myJobs].sort((a, b) => (a.raisedAt < b.raisedAt ? 1 : -1))
  const live = jobs.filter((j) => j.status !== 'resolved')
  const resolved = jobs.filter((j) => j.status === 'resolved')
  const booked = jobs.find((j) => j.status === 'scheduled' || j.status === 'in_progress')

  // How long the resolved ones took, as a median rather than a mean: one job
  // that sat for a month would otherwise make the typical wait look twice what
  // a tenant should expect.
  const turnarounds = resolved
    .filter((j) => j.resolvedAt)
    .map((j) => daysBetween(j.raisedAt, j.resolvedAt!))
    .sort((a, b) => a - b)
  const typical = turnarounds.length
    ? turnarounds[Math.floor(turnarounds.length / 2)]
    : null

  const figures: Figure[] = [
    { label: 'Still open', value: String(live.length), icon: 'Wrench' },
    { label: 'Resolved', value: String(resolved.length), icon: 'CheckCircle' },
    {
      label: 'Typical repair',
      value: typical === null ? '—' : `${typical} ${typical === 1 ? 'day' : 'days'}`,
      icon: 'Clock',
      compact: true,
    },
    { label: 'Reported in all', value: String(jobs.length), icon: 'FileText' },
  ]

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Maintenance</h1>
          {IS_SAMPLE_DATA ? (
            <SampleDataChip detail="These requests are placeholders for design review. No maintenance endpoint exists yet, so nothing can be reported from here and no contractor has really been booked." />
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything raised on {me.unit}, {me.property} &middot;{' '}
          <span className="tabular-nums">{live.length}</span> still open
        </p>
      </header>

      {booked ? (
        <PageBanner
          id="maintenance-banner"
          eyebrow="Visit booked"
          title={booked.title}
          description={
            <>
              {booked.assignee} is coming {formatFullDate(booked.scheduledFor!)}
              {booked.scheduledTime ? ` at ${booked.scheduledTime}` : null} &middot; somebody will
              need to let them in
            </>
          }
        />
      ) : live.length > 0 ? (
        <PageBanner
          id="maintenance-banner"
          eyebrow="Waiting on a contractor"
          title={
            <>
              {live.length} {live.length === 1 ? 'request has' : 'requests have'} no visit booked
              yet
            </>
          }
          description="Your agent assigns a contractor and books the day; you will see it here once they have."
        />
      ) : (
        <PageBanner
          id="maintenance-banner"
          tone="calm"
          icon="CheckCircle"
          eyebrow="Nothing outstanding"
          title="No open requests on your unit"
          description={
            typical === null
              ? 'Anything you report will be tracked here from the day you raise it.'
              : `Repairs here have typically taken ${typical} ${typical === 1 ? 'day' : 'days'}.`
          }
        />
      )}

      <StatTiles figures={figures} label="Your requests" id="maintenance-figures" />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TenantRequests requests={jobs} />
        </div>
        <div>
          <ReportIssue agentName={tenancy.agent.name} agentPhone={tenancy.agent.phone} />
        </div>
      </div>
    </div>
  )
}
