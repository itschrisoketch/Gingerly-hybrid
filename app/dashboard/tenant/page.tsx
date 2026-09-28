import Link from 'next/link'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { TenancyBento } from '@/components/dashboard/tenant/tenancy-bento'
import { TenantMetrics } from '@/components/dashboard/tenant/tenant-metrics'
import { LedgerTable, type LedgerRow } from '@/components/dashboard/ledger-table'
import { Icon } from '@/components/ui/icon'
import { formatKes } from '@/lib/format'
import { IS_SAMPLE_DATA } from '@/lib/dashboard/sample-data'
import {
  daysBetween,
  formatDueDate,
  formatFullDate,
  formatPeriod,
  isPeriodSettled,
  me,
  myDocuments,
  myJobs,
  myPayments,
  myThread,
  paidToDate,
  paidToDateSeries,
  rentDueDate,
  periodOf,
} from '@/lib/dashboard/tenant-view'

/**
 * Tenant home.
 *
 * The first of the nine tenant screens onto the system the landlord side
 * already uses — same shell, same banner, same figure row — so the two halves
 * of the product stop looking like two products.
 *
 * The copy was the larger problem. This page greeted "Sarah", quoted "$1,200"
 * twenty-one times across the tenant section, and put her on "Main Street".
 * None of that exists in Gingerly, which is Kenyan, bills in KES and collects
 * over M-Pesa. It is now about Grace Wanjiku in A2 Brookside Apartments — a
 * tenant who is already in the landlord's own data, so the payment the agent
 * sees in their ledger is the same record she sees in hers.
 *
 * Every feature of the old page survives: pay rent, contact the agent, the
 * rent-due alert, the rent figure, the next payment date and countdown, the
 * payment method, payment history, the apartment details, the lease
 * information, and the documents. What changed is that they are now derived
 * rather than hardcoded, so they agree with each other.
 *
 * The one thing deliberately dropped is the "Autopay is enabled" line. There is
 * no autopay in this product and no endpoint that could turn one on; telling a
 * tenant their rent will pay itself is the sort of false reassurance that ends
 * with someone being charged a late fee.
 */

/** Everything on this page counts from here, so server and client agree. */
const AS_OF = '2026-09-21'

export default function TenantHome() {
  const settled = isPeriodSettled(AS_OF)
  const due = rentDueDate(AS_OF)
  const daysToDue = daysBetween(AS_OF, due)
  const thisPeriod = myPayments.find((p) => p.period === periodOf(AS_OF))

  const openJobs = myJobs.filter((j) => j.status !== 'resolved')

  // Her own history in the shared ledger shape. The first column is the period
  // rather than a name: on this screen the tenant is not the question, the
  // month is.
  const ledger: LedgerRow[] = myPayments.slice(0, 6).map((p) => ({
    id: p.id,
    primary: formatPeriod(p.period),
    // The reference is copyable; the part-month note is prose and is not.
    secondary: p.note ?? p.reference,
    copyable: !p.note && Boolean(p.reference),
    copyLabel: `${p.method ?? 'payment'} reference`,
    method: p.method,
    at: p.at,
    status: p.status,
    amount: p.amount,
  }))

  // Lease progress in whole months, from the tenancy itself rather than a
  // hardcoded twelve — a lease is not always a year.
  const monthsTotal = Math.max(Math.round(daysBetween(me.moveIn, me.leaseEnd) / 30), 1)
  const monthsElapsed = Math.min(
    Math.max(Math.round(daysBetween(me.moveIn, AS_OF) / 30), 0),
    monthsTotal,
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {me.name.split(' ')[0]}&rsquo;s home
            </h1>
            {IS_SAMPLE_DATA ? (
              <SampleDataChip detail="This tenancy is a placeholder for design review. No tenant endpoint exists yet, so no rent can actually be paid and nothing here reflects a real account." />
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Unit <span className="font-medium text-foreground">{me.unit}</span>,{' '}
            {me.property} &middot;{' '}
            <span className="tabular-nums">{formatKes(me.rent)}</span> a month
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/tenant/payments"
            className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Icon name="CreditCard" className="h-4 w-4" />
            Pay rent
          </Link>
          <Link
            href="/dashboard/tenant/messages"
            className="flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Icon name="MessageSquare" className="h-4 w-4" />
            Contact agent
          </Link>
        </div>
      </header>

      <TenancyBento
        rent={me.rent}
        settled={settled}
        periodLabel={formatPeriod(settled ? periodOf(AS_OF) : periodOf(due))}
        dueLabel={formatDueDate(due)}
        daysToDue={daysToDue}
        paidMethod={thisPeriod?.method}
        paidAmount={thisPeriod?.amount}
        monthsElapsed={monthsElapsed}
        monthsTotal={monthsTotal}
        leaseEndLabel={formatFullDate(me.leaseEnd)}
        openRequests={openJobs.length}
        documents={myDocuments.length}
        unreadMessages={myThread?.unread ?? 0}
      />

      <TenantMetrics
        series={paidToDateSeries()}
        paidToDate={paidToDate()}
        monthsPaid={myPayments.filter((p) => p.status === 'paid').length}
      />

      <LedgerTable
        title="Your payments"
        description={`Unit ${me.unit}, ${me.property}`}
        primaryHeading="Period"
        whenHeading="Paid"
        rows={ledger}
        href="/dashboard/tenant/payments"
        viewAllLabel="View all payments"
        formatWhen={(at) => formatFullDate(at)}
        empty={{
          title: 'No payments yet',
          detail: 'Your rent will appear here once the first payment goes through.',
        }}
      />
    </div>
  )
}
