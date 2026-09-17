import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { CollectionBanner } from '@/components/dashboard/collection-banner'
import { PortfolioCards } from '@/components/dashboard/portfolio-cards'
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { CollectionMixChart } from '@/components/dashboard/collection-mix-chart'
import { formatKes } from '@/lib/format'
import {
  IS_SAMPLE_DATA,
  sampleCollection,
  sampleDailyInflow,
  sampleCollectionTrend,
  sampleOccupancyTrend,
  samplePortfolio,
  sampleTransactions,
} from '@/lib/dashboard/sample-data'

/**
 * Agent dashboard.
 *
 * Metrics lead, then the payment ledger, then portfolio reference figures.
 *
 * Order runs from what to do, to what you have, to how it is moving, to the
 * detail: a navy action banner, portfolio tiles, two metric cards carrying their
 * own trends, a stacked area chart, then the payments table.
 *
 * Sections differ in form on purpose, so the page is not one box repeated.
 * Weight comes from what each section is rather than from giving everything the
 * same treatment.
 */
export default function LandlordDashboard() {
  const { landlords, properties, units, occupied } = samplePortfolio
  const outstanding = Math.max(sampleCollection.expected - sampleCollection.collected, 0)

  return (
    <div className="space-y-6">
      {IS_SAMPLE_DATA ? <SampleDataNotice /> : null}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          {/* The one line of context that matters, stated once, rather than a
              panel of its own: what is still owed and how long is left. */}
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {formatKes(outstanding)}
            </span>{' '}
            outstanding in {sampleCollection.periodLabel} &middot;{' '}
            <span className="tabular-nums">{sampleCollection.daysLeft}</span> days left
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

      <CollectionBanner
        unitsLate={sampleCollection.unitsLate}
        outstanding={outstanding}
        daysLeft={sampleCollection.daysLeft}
        periodLabel={sampleCollection.periodLabel}
      />

      <PortfolioCards
        landlords={landlords}
        properties={properties}
        units={units}
        occupied={occupied}
      />

      <DashboardMetrics
        collectionTrend={sampleCollectionTrend}
        occupancyTrend={sampleOccupancyTrend}
        occupied={occupied}
        units={units}
      />

      <CollectionMixChart data={sampleDailyInflow} />

      <RecentTransactions rows={sampleTransactions} />
    </div>
  )
}

/**
 * Visible for as long as the figures are invented.
 *
 * A plausible number on a rent dashboard is indistinguishable from a real one,
 * and what rides on the difference is somebody's housing.
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
