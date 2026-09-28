import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * The navy banner that opens a dashboard screen.
 *
 * Lifted out of CollectionBanner so every screen states its outstanding action
 * in the same object rather than each page inventing its own treatment. Brand
 * teal ground, white copy, a white action button.
 *
 * Colour notes, measured rather than eyeballed, per PRODUCT.md rule 4. Teal is a
 * far tighter ground than the navy this replaced, and the values had to move:
 *
 * - `teal-600` (185 81% 24%), NOT `teal-500`. White on teal-500 measures 4.95:1,
 *   which passes the 4.5 floor with nothing to spare, and every tint on top of
 *   it fails — the supporting line at white/70 drops to 3.26. On teal-600 white
 *   is 6.64, which leaves room for the rest of the banner to exist.
 * - Supporting line at white/80: 4.88 on teal-600, versus 4.13 at white/70.
 * - Eyebrow in `teal-50`: 6.23. The old teal-100 eyebrow measures 4.14 here and
 *   fails; it only worked because navy was a much darker ground.
 * - The action stays a WHITE button with NAVY text, 15.17:1. Navy is now the
 *   contrast colour rather than the ground, which is the one thing that gets
 *   easier when the banner turns teal.
 *
 * `--teal-600` is not redefined for dark mode, which is correct for a filled
 * brand surface: the banner stays teal in both themes and the white copy holds
 * its contrast either way. `--accent` would NOT work here — it lightens to
 * 187 100% 40% in dark mode, where white on it measures 2.50 and fails outright.
 */
export function PageBanner({
  id,
  eyebrow,
  title,
  description,
  action,
  leading,
  tone = 'attention',
  icon,
}: {
  id: string
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
  action?: { href: string; label: string }
  /** Optional visual before the copy, e.g. a group of avatars. */
  leading?: React.ReactNode
  /**
   * `attention` is the teal ground above — something is outstanding.
   * `calm` is the same object on a card ground, for when nothing is.
   *
   * A settled state used to render as a thin one-line strip, which said the
   * right words in a shape that read as a footnote. Nothing being owed is worth
   * the same room as something being owed: a tenant opening this page to check
   * whether they have paid is asking the same question either way, and the
   * answer should not be harder to find when it is good news. Same geometry,
   * different register.
   */
  tone?: 'attention' | 'calm'
  /** Shown before the copy on the calm tone, e.g. a tick. */
  icon?: IconName
}) {
  const attention = tone === 'attention'

  return (
    <section
      aria-labelledby={id}
      className={cn(
        'overflow-hidden rounded-2xl px-5 py-5 sm:px-6',
        attention ? 'bg-teal-600 text-white' : 'border border-border bg-card',
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {leading}
          {/* Brand teal, not success green. The tick was the only non-brand
              colour on the screen, and "nothing outstanding" is a state of this
              product rather than a semantic success — green here competed with
              the paid pills in the table below, which ARE semantic. Matches the
              icon square in stat-tiles.tsx. */}
          {!attention && icon ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Icon name={icon} className="h-5 w-5" />
            </span>
          ) : null}

          <div className="min-w-0">
            <p
              className={cn(
                'text-xs font-semibold uppercase tracking-[0.14em]',
                attention ? 'text-teal-50' : 'text-muted-foreground',
              )}
            >
              {eyebrow}
            </p>

            <h2
              id={id}
              className={cn(
                'mt-2 text-lg font-medium sm:text-xl',
                !attention && 'text-foreground',
              )}
            >
              {title}
            </h2>

            {description ? (
              <p
                className={cn(
                  'mt-1 text-sm',
                  attention ? 'text-white/80' : 'text-muted-foreground',
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {action ? (
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
        ) : null}
      </div>
    </section>
  )
}
