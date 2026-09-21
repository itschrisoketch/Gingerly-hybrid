import { PageBanner } from '@/components/dashboard/page-banner'
import { PaymentsTable } from '@/components/dashboard/payments-table'
import { isPaymentFilter } from '@/lib/dashboard/payment-filters'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { formatKes } from '@/lib/format'
import {
  IS_SAMPLE_DATA,
  sampleCollection,
  samplePayments,
} from '@/lib/dashboard/sample-data'

/**
 * Payments.
 *
 * Built from the same parts as the other three screens — title, banner, tiles,
 * table — with this page's own content in them. What is specific here is that
 * the table is the rent DUE this period rather than a log of money received, so
 * the units that have paid nothing are rows rather than omissions.
 *
 * This is where "Send reminders" lands from the dashboard and tenants banners.
 * The `?filter=late` those links carry is read here and handed to the table as
 * its opening view, so the button arrives at the four units it was talking
 * about rather than at an unfiltered list the agent has to re-find them in.
 */
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const filter = isPaymentFilter(params.filter) ? params.filter : 'all'

  const payments = samplePayments
  const paid = payments.filter((p) => p.status === 'paid')
  const pending = payments.filter((p) => p.status === 'pending')
  const overdue = payments.filter((p) => p.status === 'late' || p.status === 'failed')

  const expected = payments.reduce((n, p) => n + p.amount, 0)
  const collected = paid.reduce((n, p) => n + p.amount, 0)
  const arrears = overdue.reduce((n, p) => n + p.amount, 0)
  const outstanding = expected - collected

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Payments</h1>
            {IS_SAMPLE_DATA ? (
              <SampleDataChip detail="This ledger is a placeholder for design review. No payments endpoint exists yet, so no money, reference or tenant here is real." />
            ) : null}
          </div>
          {/* Where collection stands, stated once. */}
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {formatKes(collected)}
            </span>{' '}
            collected of <span className="tabular-nums">{formatKes(expected)}</span> due in{' '}
            {sampleCollection.periodLabel}
          </p>
        </div>
      </header>

      {/* The banner's action filters this page rather than leaving it, because
          the thing to do about arrears is to look at them. */}
      {overdue.length > 0 ? (
        <PageBanner
          id="payments-banner"
          eyebrow="Past due"
          title={
            <>
              {overdue.length} {overdue.length === 1 ? 'unit is' : 'units are'} past due
            </>
          }
          description={
            <>
              <span className="tabular-nums">{formatKes(arrears)}</span> in arrears, with{' '}
              <span className="tabular-nums">{sampleCollection.daysLeft}</span>{' '}
              {sampleCollection.daysLeft === 1 ? 'day' : 'days'} left in{' '}
              {sampleCollection.periodLabel}
            </>
          }
          action={{ href: '/dashboard/landlord/payments?filter=late', label: 'Show them' }}
        />
      ) : null}

      <StatTiles
        figures={
          [
            {
              label: 'Collected',
              value: formatKes(collected),
              icon: 'CheckCircle',
              compact: true,
            },
            {
              label: 'Units paid',
              value: `${paid.length} of ${payments.length}`,
              icon: 'PieChart',
              ratio: { current: paid.length, total: payments.length },
              ratioVerb: 'paid',
              ratioNoun: 'outstanding',
            },
            {
              label: 'Awaiting confirmation',
              value: formatKes(pending.reduce((n, p) => n + p.amount, 0)),
              icon: 'Clock',
              compact: true,
            },
            {
              label: 'Still out',
              value: formatKes(outstanding),
              icon: 'AlertTriangle',
              compact: true,
            },
          ] satisfies Figure[]
        }
        label={`Collection in ${sampleCollection.periodLabel}`}
        id="payments-figures"
      />

      <PaymentsTable payments={payments} initialFilter={filter} />
    </div>
  )
}
