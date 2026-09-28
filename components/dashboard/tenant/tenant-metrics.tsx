'use client'

import ProgressMetricCard, { type SeriesPoint } from '@/components/ui/progress-metric-card'
import { formatKes } from '@/lib/format'

/**
 * The tenant's metric card — the same component the agent dashboard opens its
 * second band with, so the two read as one product.
 *
 * ONE card, not two. The agent has two because it has two genuinely different
 * series, rent collected and units occupied. A tenancy has one thing that
 * moves: what has been paid into it. Adding a second card to match the shape of
 * the other screen would be decoration, and this codebase has already thrown
 * away one chart — the occupancy sparkline — for exactly that reason.
 *
 * The series is cumulative rather than monthly. Rent is the same figure every
 * month, so a monthly series is a flat line that tells a tenant nothing.
 *
 * Client component for the same reason DashboardMetrics is one:
 * `valueFormatter` is a function, and functions cannot cross the RSC boundary.
 * Marking this file puts the formatter on the same side as the component that
 * calls it, and leaves the page a Server Component.
 */
export function TenantMetrics({
  series,
  paidToDate,
  monthsPaid,
}: {
  series: SeriesPoint[]
  paidToDate: number
  monthsPaid: number
}) {
  return (
    <ProgressMetricCard
      title="Rent paid"
      size="sm"
      unit="KES"
      data={series}
      period="This tenancy"
      total={formatKes(paidToDate)}
      totalCaption={`Across ${monthsPaid} ${monthsPaid === 1 ? 'month' : 'months'}`}
      deltaLabel="vs last month"
      showTrend={false}
      valueFormatter={formatKes}
    />
  )
}
