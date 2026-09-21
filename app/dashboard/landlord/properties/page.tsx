import { PageBanner } from '@/components/dashboard/page-banner'
import { PropertyModal } from '@/components/dashboard/property-modal'
import { PropertiesTable } from '@/components/dashboard/properties-table'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { formatKes } from '@/lib/format'
import {
  IS_SAMPLE_DATA,
  sampleCollection,
  sampleProperties,
} from '@/lib/dashboard/sample-data'

/**
 * Properties.
 *
 * Built to the same order as the dashboard: state the situation in one line, the
 * banner for what needs doing, the figures, then the detail. The banner and the
 * tiles are the same objects the dashboard uses, on purpose — three screens that
 * share a system should be built from shared parts, and the variation comes from
 * what each page puts in them rather than from each page inventing a treatment.
 *
 * The figures are derived from the list rather than stated beside it, so the
 * tiles cannot disagree with the table under them — the commonest way a screen
 * like this goes quietly wrong.
 */
export default function PropertiesPage() {
  const properties = sampleProperties

  const units = properties.reduce((n, p) => n + p.units, 0)
  const occupied = properties.reduce((n, p) => n + p.occupied, 0)
  const rentDue = properties.reduce((n, p) => n + p.monthlyRent, 0)
  const unitsLate = properties.reduce((n, p) => n + p.unitsLate, 0)
  const vacant = units - occupied
  const withVacancies = properties.filter((p) => p.occupied < p.units).length

  const figures: Figure[] = [
    { label: 'Properties', value: String(properties.length), icon: 'Building2' },
    {
      label: 'Units let',
      value: `${occupied} of ${units}`,
      icon: 'Home',
      ratio: { current: occupied, total: units },
    },
    { label: 'Rent due', value: formatKes(rentDue), icon: 'CreditCard', compact: true },
    { label: 'Units late', value: String(unitsLate), icon: 'AlertTriangle' },
  ]

  return (
    <div className="space-y-6">

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Properties</h1>
            {IS_SAMPLE_DATA ? <SampleDataChip detail="This portfolio is a placeholder for design review. No properties endpoint exists yet, so nothing here reflects real accounts." /> : null}
          </div>
          {/* The scope of the portfolio, stated once, rather than a panel of its
              own. The gap belongs to the banner below. */}
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{units}</span> units
            across <span className="tabular-nums">{properties.length}</span> properties in{' '}
            {sampleCollection.periodLabel}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <PropertyModal />
        </div>
      </header>

      {/* Vacancy is this page's exception, where arrears are the dashboard's. An
          empty unit earns nothing and is the one thing an agent opens the
          properties list to fix. */}
      {vacant > 0 ? (
        <PageBanner
          id="properties-banner"
          eyebrow="Standing empty"
          title={
            <>
              {vacant} {vacant === 1 ? 'unit needs' : 'units need'} a tenant
            </>
          }
          description={
            <>
              Across <span className="tabular-nums">{withVacancies}</span>{' '}
              {withVacancies === 1 ? 'property' : 'properties'}, earning nothing this month
            </>
          }
          action={{ href: '/dashboard/landlord/tenants', label: 'Find tenants' }}
        />
      ) : null}

      <StatTiles
        figures={figures}
        label={`Portfolio in ${sampleCollection.periodLabel}`}
        id="properties-figures"
      />

      <PropertiesTable properties={properties} />
    </div>
  )
}
