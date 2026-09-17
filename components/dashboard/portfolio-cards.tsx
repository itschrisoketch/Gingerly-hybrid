import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * Portfolio figures as cards.
 *
 * Built to the dashboard-design KPI-tile pattern: label, an icon in a tinted
 * square, the figure large beneath. Four tiles on a wide screen, two on a phone.
 *
 * Occupancy uses the pattern's progress-bar variant rather than a fourth
 * identical tile, because it is the only one of the four that is a ratio. "39"
 * on its own means nothing; "39 of 42, 93%" is the number an agent acts on, and
 * giving it a different shape is also what stops the row reading as four
 * interchangeable boxes.
 *
 * None of these are links. Three of the four would point at the same properties
 * page and the fourth has no page at all, so a hover state promising navigation
 * would be a lie.
 */

interface Figure {
  label: string
  value: string
  icon: IconName
  /** Present only on the ratio tile. */
  ratio?: { current: number; total: number }
}

export function PortfolioCards({
  landlords,
  properties,
  units,
  occupied,
}: {
  landlords: number
  properties: number
  units: number
  occupied: number
}) {
  const figures: Figure[] = [
    { label: 'Landlords', value: String(landlords), icon: 'Users' },
    { label: 'Properties', value: String(properties), icon: 'Building2' },
    { label: 'Units', value: String(units), icon: 'Home' },
    {
      label: 'Occupied',
      value: `${occupied} of ${units}`,
      icon: 'PieChart',
      ratio: { current: occupied, total: units },
    },
  ]

  return (
    <section aria-labelledby="portfolio-heading">
      <h2 id="portfolio-heading" className="sr-only">
        Portfolio
      </h2>

      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {figures.map((f) => (
          <div
            key={f.label}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <dt className="text-sm font-medium text-muted-foreground">{f.label}</dt>
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"
              >
                <Icon name={f.icon} className="h-[18px] w-[18px]" />
              </span>
            </div>

            <dd
              className={cn(
                'mt-3 font-semibold tracking-tight text-foreground tabular-nums',
                f.ratio ? 'text-2xl' : 'text-3xl',
              )}
            >
              {f.value}
            </dd>

            {f.ratio ? <OccupancyBar {...f.ratio} /> : null}
          </div>
        ))}
      </dl>
    </section>
  )
}

function OccupancyBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  const vacant = total - current

  return (
    <div className="mt-3 space-y-1.5">
      <div
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct} percent of units occupied`}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-sm text-muted-foreground tabular-nums">
        {pct}% let{vacant > 0 ? `, ${vacant} vacant` : ''}
      </p>
    </div>
  )
}
