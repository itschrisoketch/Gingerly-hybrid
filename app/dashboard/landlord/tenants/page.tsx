import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar'
import { DateCheck } from '@/components/dashboard/date-check'
import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { TenantsTable } from '@/components/dashboard/tenants-table'
import { TenantOnboardingModal } from '@/components/dashboard/tenant-onboarding-modal'
import { formatKes, initials, isValidIsoDate } from '@/lib/format'
import {
  IS_SAMPLE_DATA,
  sampleCollection,
  sampleProperties,
  sampleTenants,
  type Tenant,
} from '@/lib/dashboard/sample-data'

/**
 * Tenants.
 *
 * Same order and the same parts as the dashboard and the properties page: the
 * situation in one line, the banner for what needs doing, the figures, then the
 * detail. What changes between the screens is what goes in them — arrears on the
 * dashboard, vacancy on properties, and the people in arrears here.
 *
 * The banner carries their faces. It is the one thing this page can put in the
 * banner that the others cannot, and it is the useful version of the fact: a
 * count says four, and the version an agent acts on is which four.
 *
 * Every figure is derived from `sampleTenants` rather than stated beside it, so
 * nothing here can disagree with the table below.
 */

/** The period the dashboard reports on. Lease warnings are measured from here
 *  rather than from `new Date()`, so the server and the client agree and nothing
 *  rehydrates into a different answer at midnight. The agent can move it with
 *  the date picker in the header, which writes `?as-of=`. */
const DEFAULT_AS_OF = '2026-09-17'

/** Faces on the banner before the group collapses into a count. */
const SHOWN = 5

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  // Validated rather than trusted: a hand-edited `?as-of=banana` would otherwise
  // put every lease comparison against an Invalid Date and silently mark none.
  const raw = params['as-of']
  const asOf = isValidIsoDate(raw) ? raw : DEFAULT_AS_OF

  const tenants = sampleTenants

  const paid = tenants.filter((t) => t.status === 'paid')
  const late = tenants.filter((t) => t.status === 'late')
  const rentRoll = tenants.reduce((n, t) => n + t.rent, 0)
  const collected = paid.reduce((n, t) => n + t.rent, 0)
  const outstanding = late.reduce((n, t) => n + t.rent, 0)
  const properties = new Set(tenants.map((t) => t.property)).size

  const figures: Figure[] = [
    { label: 'Tenants', value: String(tenants.length), icon: 'Users' },
    {
      label: 'Paid this month',
      value: `${paid.length} of ${tenants.length}`,
      icon: 'CheckCircle',
      ratio: { current: paid.length, total: tenants.length },
      ratioVerb: 'paid',
      ratioNoun: 'still to pay',
    },
    {
      label: 'Rent collected',
      value: formatKes(collected),
      icon: 'CreditCard',
      compact: true,
    },
    {
      label: 'Still out',
      value: formatKes(rentRoll - collected),
      icon: 'AlertTriangle',
      compact: true,
    },
  ]

  return (
    <div className="space-y-6">

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tenants</h1>
            {IS_SAMPLE_DATA ? <SampleDataChip detail="These tenants are placeholders for design review. No tenants endpoint exists yet, so none of these people, contacts or balances are real." /> : null}
          </div>
          {/* The one line of context that matters, stated once: how many people,
              where, and how much of their rent is still out. */}
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {tenants.length}
            </span>{' '}
            tenants across <span className="tabular-nums">{properties}</span> properties
            &middot;{' '}
            <span className="tabular-nums">{formatKes(rentRoll - collected)}</span> still
            out in {sampleCollection.periodLabel}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <DateCheck value={asOf} defaultValue={DEFAULT_AS_OF} />
          <TenantOnboardingModal properties={sampleProperties.map((p) => p.name)} />
        </div>
      </header>

      {late.length > 0 ? (
        <PageBanner
          id="tenants-banner"
          eyebrow="Past due"
          title={
            <>
              {late.length} {late.length === 1 ? 'tenant is' : 'tenants are'} late
            </>
          }
          description={
            <>
              {/* "In arrears", not "outstanding": the dashboard banner uses
                  outstanding for everything unpaid, which includes rent that is
                  not late yet and is a different, larger number. Two banners in
                  one product cannot use one word for two figures. */}
              <span className="tabular-nums">{formatKes(outstanding)}</span> in arrears,
              past the due date in {sampleCollection.periodLabel}
              {/* The avatars are decorative to a screen reader; the names belong
                  in the text that replaces them. */}
              <span className="sr-only">: {late.map((t) => t.name).join(', ')}</span>
            </>
          }
          action={{
            href: '/dashboard/landlord/payments?filter=late',
            label: 'Send reminders',
          }}
          leading={<LateFaces tenants={late} />}
        />
      ) : null}

      <StatTiles
        figures={figures}
        label={`Tenants in ${sampleCollection.periodLabel}`}
        id="tenants-figures"
      />

      <TenantsTable tenants={tenants} asOf={asOf} />
    </div>
  )
}

/**
 * The late tenants' initials, on the navy banner.
 *
 * The fallback is overridden to white-on-translucent-white: the default teal
 * tint is built for the card surface and disappears against the teal banner. The
 * separating ring becomes the banner colour for the same reason — it is meant to
 * read as the ground showing between the circles.
 *
 * white/15, not white/20. Every point of alpha lightens the ground and eats the
 * white initials' contrast: on teal-600 white/15 measures 4.76:1 and white/20
 * drops to 4.26, under the 4.5 floor.
 *
 * Hidden below `sm`, where the banner's copy and its button already fill the
 * width and five overlapping circles would push the figure onto a third line.
 */
function LateFaces({ tenants }: { tenants: Tenant[] }) {
  const shown = tenants.slice(0, SHOWN)
  const rest = tenants.length - shown.length

  return (
    <AvatarGroup
      aria-hidden="true"
      className="hidden shrink-0 [&>*]:ring-teal-600 sm:flex"
    >
      {shown.map((t) => (
        <Avatar key={t.id}>
          <AvatarFallback className="bg-white/15 text-white">
            {initials(t.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {rest > 0 ? (
        <AvatarGroupCount className="bg-white/10 text-white">+{rest}</AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  )
}
