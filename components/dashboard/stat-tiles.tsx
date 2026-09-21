import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * The KPI tile row, as a shape rather than a fixed set of figures.
 *
 * Built to the dashboard-design KPI-tile pattern: label, an icon in a tinted
 * square, the figure large beneath. Four tiles on a wide screen, two on a phone.
 *
 * Extracted from PortfolioCards once a second screen needed the same row with
 * different figures. Two hand-copied versions of a tile diverge on the first
 * change to either — a 2xl here, a p-4 there — and the pages stop reading as one
 * system, which is the only thing the tile is for.
 *
 * A figure carrying a `ratio` renders the pattern's progress-bar variant rather
 * than another identical box, because a ratio is not the same kind of fact as a
 * count. "39" on its own means nothing; "39 of 42, 93%" is the number an agent
 * acts on, and giving it a different shape is also what stops the row reading as
 * four interchangeable boxes.
 *
 * Tiles never link. A row of figures where some navigate and some do not teaches
 * nothing except to try every one, and a hover state that promises a page which
 * does not exist is a lie the layout tells for free.
 */

export interface Figure {
  label: string
  value: string
  icon: IconName
  /** Set on a ratio to get the meter variant. */
  ratio?: { current: number; total: number }
  /** Wording under the meter: `ratioVerb` "let" and `ratioNoun` "vacant" give
   *  "93% let, 3 vacant". */
  ratioVerb?: string
  ratioNoun?: string
  /** Money and long values need the smaller size to survive a phone column. */
  compact?: boolean
}

export function StatTiles({
  figures,
  label,
  id,
}: {
  figures: Figure[]
  /** Names the group for screen readers; never shown. */
  label: string
  id: string
}) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="sr-only">
        {label}
      </h2>

      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {figures.map((f) => (
          <StatTile key={f.label} figure={f} />
        ))}
      </dl>
    </section>
  )
}

/**
 * One tile. Exported so a page that wants a different arrangement than the
 * four-across row — the properties page stacks two of these beside its
 * occupancy panel — gets the same object rather than a hand-copied lookalike.
 */
export function StatTile({ figure: f }: { figure: Figure }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
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
          f.ratio || f.compact ? 'text-2xl' : 'text-3xl',
        )}
      >
        {f.value}
      </dd>

      {f.ratio ? (
        <RatioBar {...f.ratio} verb={f.ratioVerb ?? 'let'} noun={f.ratioNoun ?? 'vacant'} />
      ) : null}
    </div>
  )
}

function RatioBar({
  current,
  total,
  verb,
  noun,
  label,
}: {
  current: number
  total: number
  verb: string
  noun: string
  label?: string
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  const remainder = total - current

  return (
    <div className="mt-3 space-y-1.5">
      <div
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${pct} percent ${verb}`}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-sm text-muted-foreground tabular-nums">
        {pct}% {verb}
        {remainder > 0 ? `, ${remainder} ${noun}` : ''}
      </p>
    </div>
  )
}
