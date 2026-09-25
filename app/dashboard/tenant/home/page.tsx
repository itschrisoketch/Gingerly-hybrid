import Link from 'next/link'
import {
  BentoCountTile,
  BentoGrid,
  BentoPanel,
  BentoRatioTile,
} from '@/components/dashboard/bento'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { Icon } from '@/components/ui/icon'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import { formatKes } from '@/lib/format'
import { IS_SAMPLE_DATA } from '@/lib/dashboard/sample-data'
import {
  daysBetween,
  formatFullDate,
  me,
  myJobs,
  tenancy,
} from '@/lib/dashboard/tenant-view'

/**
 * The tenant's unit.
 *
 * Opens with the same bento as every other dashboard here, out of bento.tsx.
 * The composition is the argument: the three bare counts a flat is described
 * by — bedrooms, bathrooms, floor area — are exactly what the small tiles are
 * for, since they are three numbers of the same kind and sizing them
 * differently would be decoration.
 *
 * The panel is the unit itself, and its action is reporting a fault, because
 * that is the only thing a tenant does *to* their unit. When something is
 * already open it turns to the attention tone and names it instead — an open
 * request is the one fact on this page that is waiting on somebody.
 *
 * What was here described a different building: a swimming pool, a fitness
 * centre, a rooftop terrace, a community lounge and bike storage, with a floor
 * area in square feet and a lease running through 2024. It is now Grace's
 * actual unit, in square metres, with the amenities a Nairobi block has and the
 * access hours the old page showed kept rather than dropped.
 *
 * Every feature survives: the unit details, the floor, the lease dates, the
 * rent, the deposit, the amenities with their hours, the maintenance history
 * and the route to raise a new request.
 */

/** Lease progress counts from here, so the server and client agree. */
const AS_OF = '2026-09-21'

export default function TenantUnitPage() {
  const openJobs = myJobs.filter((j) => j.status !== 'resolved')
  const history = [...myJobs].sort((a, b) => (a.raisedAt < b.raisedAt ? 1 : -1))

  const monthsTotal = Math.max(Math.round(daysBetween(me.moveIn, me.leaseEnd) / 30), 1)
  const monthsElapsed = Math.min(
    Math.max(Math.round(daysBetween(me.moveIn, AS_OF) / 30), 0),
    monthsTotal,
  )
  const pctElapsed = Math.round((monthsElapsed / monthsTotal) * 100)

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Your unit</h1>
          {IS_SAMPLE_DATA ? (
            <SampleDataChip detail="This unit is a placeholder for design review. No properties endpoint exists yet, so none of these details come from a real tenancy." />
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {me.unit}, {me.property} &middot; {tenancy.bedrooms} bed &middot;{' '}
          <span className="tabular-nums">{tenancy.areaSqm}</span> m&sup2;
        </p>
      </header>

      <BentoGrid id="unit-heading" label="Your unit and lease">
        {openJobs.length > 0 ? (
          <BentoPanel
            eyebrow={openJobs.length === 1 ? 'Open request' : 'Open requests'}
            figure={openJobs[0].title}
            supporting={
              <>
                Raised {formatFullDate(openJobs[0].raisedAt)}
                {openJobs.length > 1 ? ` · ${openJobs.length - 1} more open` : null}
              </>
            }
            action={{ href: '/dashboard/tenant/maintenance', label: 'View requests' }}
          />
        ) : (
          <BentoPanel
            tone="calm"
            eyebrow="Your unit"
            figure={me.unit}
            supporting={
              <>
                {me.property} &middot; floor{' '}
                <span className="tabular-nums">{tenancy.floor}</span> &middot;{' '}
                {tenancy.furnished ? 'furnished' : 'unfurnished'}
              </>
            }
            action={{ href: '/dashboard/tenant/maintenance', label: 'Report an issue' }}
            footnote="Nothing is currently open on this unit."
          />
        )}

        <BentoRatioTile
          label="Lease"
          value={`${monthsElapsed} of ${monthsTotal} months`}
          percent={pctElapsed}
          caption={`ends ${formatFullDate(me.leaseEnd)}`}
        />

        <BentoCountTile label="Bedrooms" value={String(tenancy.bedrooms)} icon="Home" />
        {/* Droplets, not Wrench: a wrench beside a number reads as "1 maintenance
            job", which is the one thing this tile does not mean. */}
        <BentoCountTile label="Bathrooms" value={String(tenancy.bathrooms)} icon="Droplets" />
        <BentoCountTile label="Sq metres" value={String(tenancy.areaSqm)} icon="Building2" />
      </BentoGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-foreground">Your lease</h2>
          <dl className="mt-4 space-y-3">
            <Row label="Moved in" value={formatFullDate(me.moveIn)} />
            <Row label="Lease ends" value={formatFullDate(me.leaseEnd)} />
            <Row label="Rent" value={`${formatKes(me.rent)} a month`} />
            <Row label="Deposit held" value={formatKes(tenancy.deposit)} />
            <Row label="Floor" value={String(tenancy.floor)} />
            <Row label="Furnished" value={tenancy.furnished ? 'Yes' : 'No'} last />
          </dl>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Your agent
          </h3>
          <p className="mt-2 text-sm text-foreground">{tenancy.agent.name}</p>
          <p className="text-sm text-muted-foreground tabular-nums">{tenancy.agent.phone}</p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-foreground">In the building</h2>
          <p className="text-sm text-muted-foreground">
            What is shared, and when you can use it.
          </p>
          <dl className="mt-4 space-y-3">
            {tenancy.amenities.map((a, i) => (
              <Row
                key={a.name}
                label={a.name}
                value={a.access}
                last={i === tenancy.amenities.length - 1}
              />
            ))}
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card">
        <header className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="text-sm font-medium text-foreground">Work on this unit</h2>
            <p className="text-sm text-muted-foreground">
              Everything raised since you moved in.
            </p>
          </div>
          <Link
            href="/dashboard/tenant/maintenance"
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Report an issue
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        </header>

        {history.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-muted-foreground">
            Nothing has been raised on this unit yet.
          </p>
        ) : (
          <ul>
            {history.map((j, i) => (
              <li
                key={j.id}
                className={cn(
                  'flex flex-col gap-1.5 px-5 py-4',
                  i < history.length - 1 && 'rule-b [--rule-inset:0px]',
                )}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className="text-sm font-medium text-foreground">{j.title}</h3>
                  <StatusBadge
                    tone={j.status === 'resolved' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {j.status === 'resolved' ? 'Resolved' : 'Open'}
                  </StatusBadge>
                </div>
                <p className="text-xs capitalize text-muted-foreground">
                  {j.category} &middot; raised {formatFullDate(j.raisedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 pb-3',
        !last && 'rule-b [--rule-inset:0px]',
      )}
    >
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground tabular-nums">{value}</dd>
    </div>
  )
}
