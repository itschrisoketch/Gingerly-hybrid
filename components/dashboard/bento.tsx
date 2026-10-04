import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * The bento primitives, shared by every dashboard that opens with one.
 *
 * Extracted from portfolio-bento.tsx when the tenant home needed the same
 * treatment. Copying the markup across was the obvious move and the wrong one:
 * this codebase already had two hand-synced copies of a switch, and the copy
 * that was not being looked at is the one that grew a bug nobody saw. One set
 * of pieces, composed differently per screen.
 *
 * WHAT IS SHARED is the shape, not the content. Each dashboard decides what
 * deserves the big panel, what is a ratio and what is a bare count; these only
 * guarantee that a landlord tile and a tenant tile are the same object.
 *
 * SIZE CARRIES MEANING, and it is the composing screen's job to use it: the
 * half-grid panel is for the one thing the reader can act on, the wide tile is
 * for a ratio (a ratio is not the same kind of fact as a count), and the small
 * tiles are for bare numbers of the same kind — equal because they genuinely
 * are equal.
 */

/**
 * The grid. Two rows on desktop, sized to content.
 *
 * `grid-rows-[auto_auto]`, never `grid-rows-2`: the latter compiles to
 * `repeat(2, minmax(0,1fr))`, which forces both rows to the height of the
 * taller one and stretches the small tiles to match the wide one — around 50px
 * of dead space inside the tall panel beside them.
 */
export function BentoGrid({
  id,
  label,
  children,
}: {
  id: string
  /** Names the block for screen readers; never shown. */
  label: string
  children: React.ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-4 md:grid-cols-6 md:grid-rows-[auto_auto]"
    >
      <h2 id={id} className="sr-only">
        {label}
      </h2>
      {children}
    </section>
  )
}

/**
 * The half-grid panel: the one thing on the screen worth acting on.
 *
 * Two tones. `attention` is the filled teal ground PageBanner established, with
 * contrast already solved and documented — white 6.64:1, white/80 4.88:1,
 * teal-50 eyebrow 6.23:1, and a white button with navy-500 text at 15.17:1.
 * `calm` is a plain card, for when there is nothing to chase; the panel changes
 * rather than vanishing, so the absence of work is reported instead of leaving
 * a hole in the grid.
 *
 * The diagonal hatch is here at Chris's explicit request, after it was flagged
 * that DESIGN.md bans gradient grounds and decoration-only flourishes.
 * Recording that so it is not "fixed" back out by someone reading the Banned
 * list alone. It is masked to fade out of the top-right, so it never sits
 * behind the figure or the button, and is `aria-hidden` and
 * `pointer-events-none`.
 *
 * Tailwind here is v3.4, so the mask is the arbitrary property
 * `[mask-image:…]` — v4's `mask-[…]` shorthand silently generates nothing.
 */
export function BentoPanel({
  tone = 'attention',
  eyebrow,
  figure,
  supporting,
  action,
  footnote,
  children,
}: {
  tone?: 'attention' | 'calm'
  eyebrow: string
  /** The number or short phrase that leads. */
  figure: React.ReactNode
  supporting?: React.ReactNode
  action?: { href: string; label: string }
  /** Sits beside the action, e.g. a countdown. */
  footnote?: React.ReactNode
  /** Replaces the action row entirely, for a panel with nothing to do. */
  children?: React.ReactNode
}) {
  const attention = tone === 'attention'

  return (
    <div
      className={cn(
        'md:col-span-3 md:row-span-2 flex flex-col justify-between gap-6 rounded-2xl p-6',
        attention
          ? 'relative overflow-hidden bg-teal-600 text-white'
          // Same teal tint as PageBanner's calm tone, so the two objects agree.
          : 'border border-accent/20 bg-accent/[0.05]',
      )}
    >
      {attention ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,#808080_0px_1px,transparent_1px_10px)] opacity-30 [-webkit-mask-image:radial-gradient(ellipse_80%_50%_at_100%_0%,#000_70%,transparent_110%)] [mask-image:radial-gradient(ellipse_80%_50%_at_100%_0%,#000_70%,transparent_110%)]"
        />
      ) : null}

      <div className="relative">
        <span
          className={cn(
            'inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
            attention ? 'bg-white/10 text-teal-50' : 'bg-muted text-muted-foreground',
          )}
        >
          {eyebrow}
        </span>

        {/* The figure leads, not the sentence. */}
        <p
          className={cn(
            'mt-4 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl',
            !attention && 'text-foreground',
          )}
        >
          {figure}
        </p>

        {supporting ? (
          <p className={cn('mt-2 text-sm', attention ? 'text-white/80' : 'text-muted-foreground')}>
            {supporting}
          </p>
        ) : null}
      </div>

      {children ?? (
        action ? (
          <div className="relative flex flex-wrap items-center gap-4">
            <Link
              href={action.href}
              className={cn(
                'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                attention
                  ? 'bg-white text-navy-500 hover:bg-white/90 focus-visible:ring-white/70 focus-visible:ring-offset-teal-600'
                  : 'bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent/40 focus-visible:ring-offset-background',
              )}
            >
              {action.label}
              <Icon name="ArrowRight" className="h-4 w-4" />
            </Link>
            {footnote ? (
              <p className={cn('text-sm', attention ? 'text-white/80' : 'text-muted-foreground')}>
                {footnote}
              </p>
            ) : null}
          </div>
        ) : null
      )}
    </div>
  )
}

/**
 * The wide tile: a ratio, with the percentage set against the count and a
 * meter under it. Wide because a ratio is not the same kind of fact as a count.
 */
export function BentoRatioTile({
  label,
  value,
  percent,
  caption,
}: {
  label: string
  /** The count form, e.g. "39 of 42". */
  value: string
  percent: number
  caption: string
}) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-muted p-5 md:col-span-3">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
        <p className="text-3xl font-semibold tracking-tight text-accent-text tabular-nums">
          {percent}%
        </p>
      </div>

      <div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground tabular-nums">{caption}</p>
      </div>
    </div>
  )
}

/**
 * A bare count. Never a link: a row of figures where some navigate and some do
 * not teaches nothing except to try every one.
 */
export function BentoCountTile({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: IconName
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
