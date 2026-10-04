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
   * Kept so callers need not all change at once, but it no longer alters the
   * ground. Every banner is the solid teal one — Chris's call, stated twice:
   * the tinted variant did not read as the same object, and a settled state is
   * worth the same presence as an outstanding one. What the tone still does is
   * decide the ICON treatment, since a tick belongs on a settled banner and
   * nothing belongs on one that already carries an action.
   */
  tone?: 'attention' | 'calm'
  /** Shown before the copy on the calm tone, e.g. a tick. */
  icon?: IconName
}) {
  // The ground no longer varies. `attention` only decides whether the leading
  // icon square is drawn.
  const attention = tone === 'attention'

  return (
    <section
      aria-labelledby={id}
      // One ground for every banner, solid teal — the treatment the maintenance
      // screen uses. A tinted variant was tried for settled states and did not
      // read as the same object beside it.
      className="overflow-hidden rounded-2xl bg-teal-600 px-5 py-5 text-white sm:px-6"
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
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
              <Icon name={icon} className="h-5 w-5" />
            </span>
          ) : null}

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-50">
              {eyebrow}
            </p>

            <h2 id={id} className="mt-2 text-lg font-medium sm:text-xl">
              {title}
            </h2>

            {description ? (
              <p className="mt-1 text-sm text-white/80">{description}</p>
            ) : null}
          </div>
        </div>

        {action ? (
          <Link
            href={action.href}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-navy-500 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-600"
          >
            {action.label}
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </section>
  )
}
