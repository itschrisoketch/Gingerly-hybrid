import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { CollectionBanner } from '@/components/dashboard/collection-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
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

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
            {IS_SAMPLE_DATA ? <SampleDataChip /> : null}
          </div>
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
