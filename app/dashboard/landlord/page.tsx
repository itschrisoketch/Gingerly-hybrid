import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { CollectionSummary } from '@/components/dashboard/collection-summary'
import { ArrearsList } from '@/components/dashboard/arrears-list'
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics'
import {
  IS_SAMPLE_DATA,
  sampleArrears,
  sampleCollection,
  sampleCollectionTrend,
  sampleOccupancyTrend,
  samplePortfolio,
} from '@/lib/dashboard/sample-data'

/**
 * Agent dashboard.
 *
 * Ordered by what gets acted on: outstanding rent, then the units behind it,
 * then the trends that give them context. The previous version opened with a
 * congratulatory banner and four matching stat tiles, which is the arrangement
 * every admin template ships with and answers no question the agent has.
 *
 * The four tabs are gone. Two of them, Properties and Tenants, pointed at the
 * same destinations as the sidebar, so the page was competing with the app's own
 * navigation.
 */
export default function LandlordDashboard() {
  const { landlords, properties, units, occupied } = samplePortfolio

  return (
    <div className="space-y-6">
      {IS_SAMPLE_DATA ? <SampleDataNotice /> : null}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Rent collection across {properties} properties
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/landlord/properties"
            className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Icon name="Plus" className="h-4 w-4" />
            Add property
          </Link>
          <Link
            href="/dashboard/landlord/tenants"
            className="flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Icon name="UserPlus" className="h-4 w-4" />
            Invite landlord
          </Link>
        </div>
      </header>

      <CollectionSummary {...sampleCollection} />

      <ArrearsList rows={sampleArrears} />

      <DashboardMetrics
        collectionTrend={sampleCollectionTrend}
        occupancyTrend={sampleOccupancyTrend}
        occupied={occupied}
        units={units}
      />

      {/* Portfolio reads as one strip rather than four matching tiles. These are
          reference figures, not decisions; a bordered card each would claim a
          weight they do not have. */}
      <section
        aria-labelledby="portfolio-heading"
        className="rounded-2xl border border-border bg-card p-5 sm:p-6"
      >
        <h2 id="portfolio-heading" className="text-base font-semibold text-foreground">
          Portfolio
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
          <PortfolioFigure label="Landlords" value={landlords} />
          <PortfolioFigure label="Properties" value={properties} />
          <PortfolioFigure label="Units" value={units} />
          <PortfolioFigure label="Occupied" value={occupied} note={`${units - occupied} vacant`} />
        </dl>
      </section>
    </div>
  )
}

function PortfolioFigure({
  label,
  value,
  note,
}: {
  label: string
  value: number
  note?: string
}) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-2xl font-semibold text-foreground tabular-nums">
        {value}
        {note ? (
          <span className="ml-2 align-middle text-sm font-normal text-muted-foreground">
            {note}
          </span>
        ) : null}
      </dd>
    </div>
  )
}

/**
 * Visible for as long as the figures are invented.
 *
 * A plausible number on a rent dashboard is indistinguishable from a real one,
 * and what rides on the difference is somebody's housing. This says so plainly
 * and disappears when lib/dashboard/sample-data.ts does.
 */
function SampleDataNotice() {
  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-foreground"
    >
      <Icon name="AlertTriangle" className="mt-px h-4 w-4 shrink-0 text-warning-text" />
      <span>
        <span className="font-medium">Sample data.</span> These figures are placeholders for
        design review. No dashboard endpoints exist yet, so nothing here reflects real accounts.
      </span>
    </p>
  )
}
