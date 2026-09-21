import Link from 'next/link'
import { Icon } from '@/components/ui/icon'

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
}: {
  id: string
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
  action?: { href: string; label: string }
  /** Optional visual before the copy, e.g. a group of avatars. */
  leading?: React.ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      className="overflow-hidden rounded-2xl bg-teal-600 px-5 py-5 text-white sm:px-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {leading}

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
