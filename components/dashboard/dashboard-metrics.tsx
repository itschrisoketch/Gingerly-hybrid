'use client'

import ProgressMetricCard, { type SeriesPoint } from '@/components/ui/progress-metric-card'
import { formatKes } from '@/lib/format'

/**
 * The dashboard's two metric cards.
 *
 * This wrapper exists for one reason: ProgressMetricCard takes `valueFormatter`
 * as a function, and the dashboard page is a Server Component. Functions cannot
 * be serialised across the RSC boundary, so passing `formatKes` from the page
 * throws at runtime — a failure TypeScript does not catch, because it is a
 * Next.js serialisation rule rather than a type error.
 *
 * Marking this `'use client'` puts the formatters on the same side of the
 * boundary as the component that calls them, and leaves the page a Server
 * Component. The alternative, making the whole page client-side, would ship the
 * entire dashboard to the browser to solve a two-function problem.
 */
const MONTH_PERIODS = [
  { label: 'Past 6 months', points: 6 },
  { label: 'Past 12 months' },
]

export function DashboardMetrics({
  collectionTrend,
  occupancyTrend,
  occupied,
  units,
}: {
  collectionTrend: SeriesPoint[]
  occupancyTrend: SeriesPoint[]
  occupied: number
  units: number
}) {
  const latestCollected = collectionTrend[collectionTrend.length - 1]?.value ?? 0

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ProgressMetricCard
        title="Rent collected"
        size="sm"
        unit="KES"
        data={collectionTrend}
        period="Past 12 months"
        periodOptions={MONTH_PERIODS}
        total={formatKes(latestCollected)}
        totalCaption="This month"
        deltaLabel="vs last month"
        valueFormatter={formatKes}
      />
      <ProgressMetricCard
        title="Units occupied"
        size="sm"
        unit="units"
        accent="teal"
        data={occupancyTrend}
        period="Past 12 months"
        periodOptions={MONTH_PERIODS}
        total={`${occupied} of ${units}`}
        totalCaption="Units let this month"
        deltaLabel="vs last month"
        valueFormatter={(n) => `${Math.round(n)}`}
      />
    </div>
  )
}
