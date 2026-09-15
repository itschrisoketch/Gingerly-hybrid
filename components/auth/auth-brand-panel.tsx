'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '@/components/ui/icon'
import { HEADLINE_CLASS, HEADLINE_ACCENT_CLASS } from '@/components/auth/auth-heading'
import { cn } from '@/lib/utils'

/**
 * The brand panel beside the auth form: a photograph with the headline set over it.
 *
 * The image is self-hosted in /public rather than hotlinked from Unsplash's CDN.
 * This is the page between a user and their account, and it already refuses a
 * third-party request for its icons; taking one for a 293KB hero would be
 * inconsistent. Self-hosting also means no referrer leaks to a third party and
 * no dependency on their uptime.
 *
 * Photo: Hassan Kibwana (@kb_photographic) on Unsplash, cropped to 2:3 with
 * imgix face detection so the subject survives the portrait crop. The Unsplash
 * Licence covers commercial use and does not require attribution, so the credit
 * lives here rather than on the page. Keep this line if the file is replaced by
 * another Unsplash image — it is the only record of where the asset came from.
 *
 * Legibility over a photograph cannot be left to chance, so the text sits on a
 * navy scrim that is near-opaque behind the copy and clears at the top. White on
 * that base clears 4.5:1 regardless of what the photo does underneath — swapping
 * the image cannot silently break contrast.
 *
 * Purely decorative: nothing here is clickable or expandable.
 */
export function AuthBrandPanel() {
  const reduceMotion = useReducedMotion()

  const rise = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 14, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <aside className="relative hidden overflow-hidden rounded-2xl bg-navy-500 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <img
        src="/auth-panel.jpg"
        alt=""
        aria-hidden="true"
        // Decorative, so it carries an empty alt and is hidden from the
        // accessibility tree — the headline beside it says everything a
        // screen-reader user needs.
        className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
      />

      {/* Scrim: dense navy under the copy, easing towards the top so the
          photograph still reads. The top stop is 50%, not a lighter value that
          would look better on this particular image: combined with the flat
          wash below it that is 0.625 effective opacity, which puts white text on
          a worst-case blown-out highlight at 4.81:1 — past the 4.5:1 floor. At
          the 25% I first used it measured 3.14:1 and failed. Anything lighter
          makes the wordmark's legibility depend on which photo is loaded. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-navy-500 via-navy-500/85 to-navy-500/50"
      />

      {/* Flat wash carrying the rest of that budget, so the upper third cannot
          blow out behind the wordmark. */}
      <div aria-hidden="true" className="absolute inset-0 bg-navy-500/25" />

      <motion.div {...rise(0)} className="relative flex items-center gap-2 text-white">
        <Icon name="Building2" className="h-6 w-6" />
        <span className="text-lg font-medium tracking-tight">Gingerly</span>
      </motion.div>

      <motion.div {...rise(0.1)} className="relative space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100/90">
          Rental payments
        </p>
        <p className={cn('max-w-[15ch] text-[2.6rem] text-white', HEADLINE_CLASS)}>
          Collect Recurring Payments{' '}
          <span className={HEADLINE_ACCENT_CLASS}>Automatically</span>
        </p>
      </motion.div>

      <motion.p {...rise(0.2)} className="relative text-[11px] text-white/60">
        &copy; {new Date().getFullYear()} Gingerly
      </motion.p>
    </aside>
  )
}
