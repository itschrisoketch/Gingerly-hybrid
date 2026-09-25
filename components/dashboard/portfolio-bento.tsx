import {
  BentoCountTile,
  BentoGrid,
  BentoPanel,
  BentoRatioTile,
} from '@/components/dashboard/bento'
import { Icon } from '@/components/ui/icon'
import { formatKes } from '@/lib/format'

/**
 * The landlord dashboard's opening block, as one ranked grid rather than three
 * stacked bands.
 *
 * WHAT THIS REPLACED, and why. The page used to open with a full-width banner,
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
 * The shapes now live in bento.tsx, because the tenant home opens with the same
 * treatment. This file is only the answer to "which facts belong at the top of
 * the agent's dashboard, and which of them deserves the big panel".
 *
 * NO SPARKLINE ON OCCUPANCY. A bar strip was tried here and removed. Occupancy
 * runs 33–39 of 42, so every bar scaled against the portfolio lands between 78%
 * and 93% of the strip height and the result reads as a barcode rather than a
 * trend. The only way to make it look like a chart is to truncate the baseline,
 * which turns a stable portfolio into a dramatic one — a lie the layout would
 * tell for free. The meter already encodes the ratio.
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
  const clear = unitsLate === 0

  return (
    <BentoGrid id="bento-heading" label="Portfolio and collection summary">
      {clear ? (
        <BentoPanel
          tone="calm"
          eyebrow="Collection"
          figure="All collected"
          supporting={`All rent for ${periodLabel} is in. Nothing needs chasing today.`}
        >
          {/* Deliberately not congratulatory: no trophy, no exclamation mark,
              on a screen about other people's housing. */}
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Icon name="CheckCircle" className="mt-0.5 h-5 w-5 shrink-0 text-success-text" />
            Nothing is outstanding this period.
          </p>
        </BentoPanel>
      ) : (
        <BentoPanel
          eyebrow="Needs your attention"
          figure={formatKes(outstanding)}
          supporting={
            <>
              outstanding across <span className="tabular-nums">{unitsLate}</span>{' '}
              {unitsLate === 1 ? 'unit' : 'units'} in {periodLabel}
            </>
          }
          action={{ href: '/dashboard/landlord/payments?filter=late', label: 'Send reminders' }}
          footnote={
            <>
              <span className="tabular-nums">{daysLeft}</span>{' '}
              {daysLeft === 1 ? 'day' : 'days'} left
            </>
          }
        />
      )}

      <BentoRatioTile
        label="Occupied"
        value={`${occupied} of ${units}`}
        percent={pctLet}
        caption={`${vacant} vacant`}
      />

      <BentoCountTile label="Landlords" value={String(landlords)} icon="Users" />
      <BentoCountTile label="Properties" value={String(properties)} icon="Building2" />
      <BentoCountTile label="Units" value={String(units)} icon="Home" />
    </BentoGrid>
  )
}
