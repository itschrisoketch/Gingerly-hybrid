import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'

/**
 * Portfolio figures as cards.
 *
 * The tile itself lives in StatTiles, which the properties page also uses. This
 * file is now only the answer to "which four figures belong at the top of the
 * agent's home page", which is the part that is actually about this screen.
 *
 * Occupancy takes the meter variant rather than a fourth identical tile, because
 * it is the only one of the four that is a ratio.
 */
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

  return <StatTiles figures={figures} label="Portfolio" id="portfolio-heading" />
}
