import { LedgerTable, type LedgerRow } from '@/components/dashboard/ledger-table'
import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { formatKes } from '@/lib/format'
import { IS_SAMPLE_DATA } from '@/lib/dashboard/sample-data'
import {
  daysBetween,
  formatDueDate,
  formatFullDate,
  formatPeriod,
  isPeriodSettled,
  me,
  myPayments,
  paidToDate,
  periodOf,
  rentDueDate,
  upcomingPayments,
} from '@/lib/dashboard/tenant-view'

/**
 * The tenant's rent.
 *
 * Mirrors its sibling — the agent's payments screen — rather than the tenant
 * home: banner, figure row, then the ledger. The table itself is the shared
 * LedgerTable, with the period in the first column instead of a tenant name.
 *
 * What was here quoted "$1,200" against a card ending 4242, listed May, June
 * and July 2024 as upcoming, and offered a Download receipt button on every
 * row. None of it was true: the currency is KES, most rent in this product
 * arrives by M-Pesa, the dates were two years stale, and there is no receipts
 * endpoint to download anything from.
 *
 * Upcoming rent is now derived from the lease, so it cannot go stale the way a
 * hardcoded list of three months did.
 *
 * On the actions: there is no payments endpoint, no stored payment method and
 * no receipt store on this API. Every control that implied otherwise says so
 * instead of silently doing nothing — the same treatment the settings screen
 * gives its read-only tabs.
 */

/** Everything here counts from this date, so server and client agree. */
const AS_OF = '2026-09-21'

export default function TenantPaymentsPage() {
  const settled = isPeriodSettled(AS_OF)
  const due = rentDueDate(AS_OF)
  const daysToDue = daysBetween(AS_OF, due)
  const upcoming = upcomingPayments(AS_OF)

  const paid = myPayments.filter((p) => p.status === 'paid')
  const remaining = upcoming.reduce((sum, u) => sum + u.amount, 0)
  const methodCounts = paid.reduce<Record<string, number>>((acc, p) => {
    if (p.method) acc[p.method] = (acc[p.method] ?? 0) + 1
    return acc
  }, {})
  const usualMethod =
    Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const monthsTotal = paid.length + upcoming.length

  const figures: Figure[] = [
    {
      label: 'Paid so far',
      value: formatKes(paidToDate()),
      icon: 'CheckCircle',
      compact: true,
    },
    {
      label: 'Months paid',
      value: `${paid.length} of ${monthsTotal}`,
      icon: 'CalendarDays',
      ratio: { current: paid.length, total: monthsTotal },
      ratioVerb: 'paid',
      ratioNoun: 'to go',
    },
    {
      label: 'Left on lease',
      value: formatKes(remaining),
      icon: 'Clock',
      compact: true,
    },
    { label: 'You usually pay by', value: usualMethod, icon: 'Smartphone', compact: true },
  ]

  const ledger: LedgerRow[] = myPayments.map((p) => ({
    id: p.id,
    primary: formatPeriod(p.period),
    secondary: p.note ?? p.reference,
    method: p.method,
    at: p.at,
    status: p.status,
    amount: p.amount,
  }))

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Payments</h1>
          {IS_SAMPLE_DATA ? (
            <SampleDataChip detail="This history is a placeholder for design review. No payments endpoint exists yet, so no rent can be paid from here and none of these references are real." />
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">
            {formatKes(me.rent)}
          </span>{' '}
          a month for {me.unit}, {me.property} &middot; next due{' '}
          <span className="tabular-nums">{formatDueDate(due)}</span>
        </p>
      </header>

      {settled ? (
        <section
          aria-labelledby="rent-state"
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 sm:px-6"
        >
          <Icon name="CheckCircle" className="h-5 w-5 shrink-0 text-success-text" />
          <h2 id="rent-state" className="text-sm font-medium text-foreground">
            {formatPeriod(periodOf(AS_OF))} rent is paid
          </h2>
          <p className="text-sm text-muted-foreground">
            Nothing is owed. Your next rent is due {formatDueDate(due)}.
          </p>
        </section>
      ) : (
        <PageBanner
          id="rent-state"
          eyebrow={daysToDue < 0 ? 'Overdue' : 'Rent due'}
          title={
            <>
              {formatKes(me.rent)} for {formatPeriod(periodOf(due))}
            </>
          }
          description={
            daysToDue < 0 ? (
              <>
                Was due {formatDueDate(due)},{' '}
                <span className="tabular-nums">{Math.abs(daysToDue)}</span>{' '}
                {Math.abs(daysToDue) === 1 ? 'day' : 'days'} ago
              </>
            ) : (
              <>
                Due {formatDueDate(due)}, in{' '}
                <span className="tabular-nums">{daysToDue}</span>{' '}
                {daysToDue === 1 ? 'day' : 'days'}
              </>
            )
          }
        />
      )}

      <StatTiles figures={figures} label="Your rent" id="payments-figures" />

      {/* Said once, at the top of the two things it governs, rather than as a
          disabled button on every row pretending to be a control. */}
      <p className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0" />
        Rent cannot be paid from here yet, and receipts cannot be downloaded — there is no
        payments endpoint on the API. Pay your agent by M-Pesa or bank transfer as usual, and
        it will appear below.
      </p>

      <LedgerTable
        title="Your payments"
        description={`Every month since you moved in on ${formatFullDate(me.moveIn)}`}
        primaryHeading="Period"
        whenHeading="Paid"
        rows={ledger}
        formatWhen={formatFullDate}
        empty={{
          title: 'No payments yet',
          detail: 'Your rent will appear here once the first payment goes through.',
        }}
      />

      <section className="rounded-2xl border border-border bg-card">
        <header className="p-5">
          <h2 className="text-sm font-medium text-foreground">Still to come</h2>
          <p className="text-sm text-muted-foreground">
            Worked out from your lease, which ends {formatFullDate(me.leaseEnd)}.
          </p>
        </header>

        {upcoming.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-muted-foreground">
            Nothing further falls due before your lease ends.
          </p>
        ) : (
          <ul>
            {upcoming.map((u, i) => (
              <li
                key={u.period}
                className={cn(
                  'flex items-center justify-between gap-4 px-5 py-3',
                  i < upcoming.length - 1 && 'rule-b [--rule-inset:0px]',
                )}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {formatPeriod(u.period)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    due {formatFullDate(u.due)}
                    {u.partMonth ? ' · part month, lease ends mid-month' : null}
                  </p>
                </div>
                <span className="text-sm font-medium text-foreground tabular-nums">
                  {formatKes(u.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
