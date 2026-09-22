import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { formatKes } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * The dashboard's opening block, as one ranked grid rather than three stacked
 * bands.
 *
 * WHAT THIS REPLACES, and why. The page used to open with a full-width banner,
 * then four identical portfolio tiles, then the two metric cards — three
 * consecutive rows of near-equal visual weight, so nothing was emphasised and
 * the one urgent fact sat at the same size as the count of landlords. DESIGN.md
 * lists "identical card grids; the hero-metric template" under Banned; this is
 * that rule applied rather than a new direction.
 *
 * The two ProgressMetricCards are NOT absorbed here. They carry a period
 * selector, a peak/low readout and a month-on-month delta — real behaviour that
 * would have to be thrown away to flatten them into tiles. They stay below.
 *
 * SIZE CARRIES MEANING. The collection shortfall takes half the grid and both
 * rows because it is the only thing on this screen anyone can act on. Occupancy
 * takes the wide tile because it is a ratio, and a ratio is not the same kind of
 * fact as a count — the same reasoning stat-tiles.tsx already uses to give it
 * the meter variant. The three bare counts are equal because they genuinely are
 * equal: three numbers of the same kind, and pretending otherwise by sizing them
 * differently would be decoration.
 *
 * NO SPARKLINE ON OCCUPANCY. A bar strip was tried here and removed. Occupancy
 * runs 33–39 of 42, so every bar scaled against the portfolio lands between 78%
 * and 93% of the strip height and the result reads as a barcode rather than a
 * trend. The only way to make it look like a chart is to truncate the baseline,
 * which turns a stable portfolio into a dramatic one — a lie the layout would
 * tell for free. The meter already encodes the ratio; a second illegible
 * encoding of the same fact adds nothing. Rent collected, which actually moves,
 * keeps its full chart in the metric card below.
 *
 * COLOUR. The attention panel keeps `teal-600`, the ground PageBanner
 * established, rather than the navy first sketched for it. Two reasons: the
 * contrast on teal-600 is already solved and documented (white 6.64:1,
 * white/80 4.88:1, teal-50 eyebrow 6.23:1, white button with navy-500 text
 * 15.17:1), and properties/tenants open with the same teal object — making this
 * one navy would break the only cue that says "this is the thing to deal with"
 * across screens. `--teal-600` is theme-invariant, which is correct for a filled
 * brand surface.
 *
 * THE HATCH. The diagonal stripe overlay is here at Chris's explicit request,
 * after I flagged that DESIGN.md bans gradient grounds and decoration-only
 * flourishes. Recording the call so it is not "fixed" back out by someone
 * reading the Banned list alone. It is kept as honest as a decoration can be:
 * masked to fade out of the top-right corner so it never sits behind the figure
 * or the button, `aria-hidden`, and `pointer-events-none`.
 *
 * Tailwind here is v3.4, so the mask is the arbitrary property
 * `[mask-image:…]` — v4's `mask-[…]` shorthand silently generates nothing.
 */

export interface PortfolioBentoProps {
  landlords: number
  properties: number
  units: number
  occupied: number
  unitsLate: number
  outstanding: number
  daysLeft: number
  periodLabel: string
}

export function PortfolioBento({
  landlords,
  properties,
  units,
  occupied,
  unitsLate,
  outstanding,
  daysLeft,
  periodLabel,
}: PortfolioBentoProps) {
  const vacant = Math.max(units - occupied, 0)
  const pctLet = units > 0 ? Math.round((occupied / units) * 100) : 0

  // grid-rows-[auto_auto], not grid-rows-2: the latter is repeat(2, 1fr), which
  // forces both rows to the height of the taller one and stretched the three
  // count tiles to match the occupancy tile for no reason — that alone was ~50px
  // of dead space inside the panel beside them.
  return (
    <section
      aria-labelledby="bento-heading"
      className="grid gap-4 md:grid-cols-6 md:grid-rows-[auto_auto]"
    >
      <h2 id="bento-heading" className="sr-only">
        Portfolio and collection summary
      </h2>

      <AttentionPanel
        unitsLate={unitsLate}
        outstanding={outstanding}
        daysLeft={daysLeft}
        periodLabel={periodLabel}
      />

      <OccupancyPanel
        occupied={occupied}
        units={units}
        vacant={vacant}
        pctLet={pctLet}
      />

      <CountTile label="Landlords" value={landlords} icon="Users" />
      <CountTile label="Properties" value={properties} icon="Building2" />
      <CountTile label="Units" value={units} icon="Home" />
    </section>
  )
}

/**
 * The half-grid panel. Carries every prop the old CollectionBanner did,
 * including its clear state — when nothing is late the panel changes rather
 * than vanishing, so the absence of work is reported instead of leaving a hole
 * in the grid. Deliberately not congratulatory: no trophy, no exclamation mark,
 * on a screen about other people's housing.
 */
function AttentionPanel({
  unitsLate,
  outstanding,
  daysLeft,
  periodLabel,
}: {
  unitsLate: number
  outstanding: number
  daysLeft: number
  periodLabel: string
}) {
  // Was p-6 sm:p-8 with gap-8 and a 5xl figure, which pushed the panel past
  // 350px and made the grid feel top-heavy. The panel still leads the page; it
  // no longer dominates it.
  const shell =
    'md:col-span-3 md:row-span-2 flex flex-col justify-between gap-6 rounded-2xl p-6'

  if (unitsLate === 0) {
    return (
      <div className={cn(shell, 'border border-border bg-card')}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Collection
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            All collected
          </p>
        </div>
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Icon name="CheckCircle" className="mt-0.5 h-5 w-5 shrink-0 text-success-text" />
          All rent for {periodLabel} is in. Nothing needs chasing today.
        </p>
      </div>
    )
  }

  return (
    <div className={cn(shell, 'relative overflow-hidden bg-teal-600 text-white')}>
      {/* Masked so the stripes fade out before they reach the figure or the
          action; decoration must not sit under anything anyone has to read. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,#808080_0px_1px,transparent_1px_10px)] opacity-30 [-webkit-mask-image:radial-gradient(ellipse_80%_50%_at_100%_0%,#000_70%,transparent_110%)] [mask-image:radial-gradient(ellipse_80%_50%_at_100%_0%,#000_70%,transparent_110%)]"
      />

      <div className="relative">
        <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-50">
          Needs your attention
        </span>

        {/* The figure leads, not the sentence. The amount still owed is the
            number an agent is here to change. */}
        <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
          {formatKes(outstanding)}
        </p>
        <p className="mt-2 text-sm text-white/80">
          outstanding across{' '}
          <span className="tabular-nums">{unitsLate}</span>{' '}
          {unitsLate === 1 ? 'unit' : 'units'} in {periodLabel}
        </p>
      </div>

      <div className="relative flex flex-wrap items-center gap-4">
        <Link
          href="/dashboard/landlord/payments?filter=late"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-navy-500 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-600"
        >
          Send reminders
          <Icon name="ArrowRight" className="h-4 w-4" />
        </Link>
        <p className="text-sm text-white/80">
          <span className="tabular-nums">{daysLeft}</span>{' '}
          {daysLeft === 1 ? 'day' : 'days'} left
        </p>
      </div>
    </div>
  )
}

/**
 * The wide tile. A ratio, so it gets the meter and the percentage set against
 * the count rather than being a fourth identical number.
 */
function OccupancyPanel({
  occupied,
  units,
  vacant,
  pctLet,
}: {
  occupied: number
  units: number
  vacant: number
  pctLet: number
}) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-muted p-5 md:col-span-3">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Occupied
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
            {occupied} of {units}
          </p>
        </div>
        <p className="text-3xl font-semibold tracking-tight text-accent-text tabular-nums">
          {pctLet}%
        </p>
      </div>

      <div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pctLet}%` }} />
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground tabular-nums">
          {vacant} vacant
        </p>
      </div>
    </div>
  )
}

/**
 * A bare count. Never a link: a row of figures where some navigate and some do
 * not teaches nothing except to try every one.
 */
function CountTile({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: 'Users' | 'Building2' | 'Home'
}) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 md:col-span-1">
      <Icon name={icon} className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}
