import Link from 'next/link'
import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { TenantHomePanel } from '@/components/dashboard/tenant/tenant-home-panel'
import { Icon } from '@/components/ui/icon'
import { formatKes } from '@/lib/format'
import { IS_SAMPLE_DATA } from '@/lib/dashboard/sample-data'
import {
  daysBetween,
  formatDueDate,
  formatPeriod,
  isPeriodSettled,
  me,
  myDocuments,
  myJobs,
  myPayments,
  nextDueDate,
  periodOf,
  tenancy,
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
  const due = nextDueDate(AS_OF)
  const daysToDue = daysBetween(AS_OF, due)
  const thisPeriod = myPayments.find((p) => p.period === periodOf(AS_OF))

  const openJobs = myJobs.filter((j) => j.status !== 'resolved')
  const lastPaid = myPayments.find((p) => p.status === 'paid')
  const leaseDaysLeft = daysBetween(AS_OF, me.leaseEnd)

  const figures: Figure[] = [
    {
      label: 'Monthly rent',
      value: formatKes(me.rent),
      icon: 'Home',
      compact: true,
    },
    {
      label: settled ? 'Next due' : 'Due now',
      value: formatDueDate(due),
      icon: 'CalendarDays',
    },
    {
      label: 'Open requests',
      value: String(openJobs.length),
      icon: 'Wrench',
    },
    {
      label: 'Lease ends',
      value: `${Math.max(Math.round(leaseDaysLeft / 30), 0)} mo`,
      icon: 'FileText',
    },
  ]

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

      {/* The banner is the rent state and nothing else. When this month is
          settled it says so rather than disappearing — a tenant checking
          whether they have paid should get an answer, not an absence. */}
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
            {formatKes(thisPeriod?.amount ?? me.rent)} received
            {thisPeriod?.method ? ` by ${thisPeriod.method}` : null}. Next rent is due{' '}
            {formatDueDate(due)}.
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
          action={{ href: '/dashboard/tenant/payments', label: 'Pay rent' }}
        />
      )}

      <StatTiles figures={figures} label="Your tenancy" id="tenant-figures" />

      <TenantHomePanel
        payments={myPayments.slice(0, 6)}
        documents={myDocuments}
        tenant={me}
        tenancy={tenancy}
        lastPaidMethod={lastPaid?.method}
      />
    </div>
  )
}
