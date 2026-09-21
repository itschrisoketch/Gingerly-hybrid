import { CollectionRadial } from '@/components/dashboard/collection-radial'
import { MethodDonut } from '@/components/dashboard/method-donut'
import { PageBanner } from '@/components/dashboard/page-banner'
import { PropertyCollectionChart } from '@/components/dashboard/property-collection-chart'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { formatKes } from '@/lib/format'
import {
  IS_SAMPLE_DATA,
  sampleCollection,
  sampleCollectionMix,
  samplePayments,
} from '@/lib/dashboard/sample-data'

/**
 * Analytics.
 *
 * Same frame as the other screens — title, banner, tiles — with charts where the
 * others have a table. What this page replaced had a grey box captioned
 * "Financial Trends Chart" where the chart should have been, so none of the
 * numbers on it were ever plotted.
 *
 * Three charts, three different jobs, which is the order the dataviz method puts
 * first: a composition for where collection stands, a parts-of-whole for how the
 * money arrives, and a stacked comparison for which properties carry the
 * portfolio and where the shortfalls sit. Colour is last and computed rather than chosen — see the validated
 * tokens in `app/globals.css`.
 *
 * Every figure is derived from `samplePayments`, so the charts cannot disagree
 * with the payments page they are drawn from.
 */
export default function AnalyticsPage() {
  const payments = samplePayments
  const paid = payments.filter((p) => p.status === 'paid')

  const expected = payments.reduce((n, p) => n + p.amount, 0)
  const collected = paid.reduce((n, p) => n + p.amount, 0)
  const rate = Math.round((collected / expected) * 100)

  // The baseline from CLOSED months only. September is still open, so it is
  // reported beside the baseline and never subtracted from it: a month with six
  // days to run is lower than a finished one by construction, and a headline
  // reading "13 points below average" would be an artefact of that, not a
  // finding. Comparing like for like needs collection-to-date for the same day
  // of each prior month, which the daily series does not go back far enough to
  // support — so the page states both numbers and leaves the inference alone.
  const history = sampleCollectionMix.map((m) => {
    const due = m.onTime + m.late + m.unpaid
    return { rate: (m.onTime + m.late) / due, onTime: m.onTime / due }
  })
  const priorMonths = history.slice(0, -1)
  const average = Math.round(
    (priorMonths.reduce((n, m) => n + m.rate, 0) / priorMonths.length) * 100,
  )
  const onTimeRate = Math.round(history[history.length - 1].onTime * 100)

  const figures: Figure[] = [
    {
      label: 'Collection rate',
      value: `${rate}%`,
      icon: 'Percent',
    },
    {
      // The baseline, not a delta against it, for the reason above.
      label: 'Closed months average',
      value: `${average}%`,
      icon: 'BarChart3',
    },
    { label: 'Paid on time', value: `${onTimeRate}%`, icon: 'Clock' },
    {
      label: 'Still out',
      value: formatKes(expected - collected),
      icon: 'AlertTriangle',
      compact: true,
    },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
            {IS_SAMPLE_DATA ? (
              <SampleDataChip detail="Every figure on this page is derived from placeholder data for design review. No analytics endpoint exists yet." />
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{rate}%</span> of{' '}
            <span className="tabular-nums">{formatKes(expected)}</span> collected in{' '}
            {sampleCollection.periodLabel}
          </p>
        </div>
      </header>

      {/* States where the month stands and what a finished month looks like,
          without asserting a trend between them. */}
      <PageBanner
        id="analytics-banner"
        eyebrow="Still collecting"
        title={
          <>
            {rate}% collected with {sampleCollection.daysLeft}{' '}
            {sampleCollection.daysLeft === 1 ? 'day' : 'days'} to go
          </>
        }
        description={
          <>
            The previous <span className="tabular-nums">{priorMonths.length}</span> months
            closed at <span className="tabular-nums">{average}%</span> on average.{' '}
            {sampleCollection.periodLabel} is still open, so the two are not yet a fair
            comparison.
          </>
        }
        action={{ href: '/dashboard/landlord/payments?filter=late', label: 'See what is out' }}
      />

      <StatTiles
        figures={figures}
        label={`Collection in ${sampleCollection.periodLabel}`}
        id="analytics-figures"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CollectionRadial
          collected={collected}
          expected={expected}
          periodLabel={sampleCollection.periodLabel}
        />
        <MethodDonut payments={payments} />
      </div>

      <PropertyCollectionChart payments={payments} />
    </div>
  )
}
