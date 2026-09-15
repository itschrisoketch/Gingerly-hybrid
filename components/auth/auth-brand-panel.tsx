'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '@/components/ui/icon'
import { HEADLINE_ACCENT_CLASS } from '@/components/auth/auth-heading'

/**
 * Attribution supplied by the product owner.
 *
 * ⚠️ One thing still outstanding: /public/auth-panel.jpg is a stock photograph
 * of a different person, so this currently shows a model presented as Lucy
 * Maina. Replace it with a photograph of Lucy, used with her permission, before
 * this goes in front of customers. The quote should be her own words too.
 */
const TESTIMONIAL = {
  quote: 'Rent arrives on time now, and I stopped chasing anyone for it.',
  name: 'Lucy Maina',
  role: 'Agent, Brookside Apartments',
} as const

/**
 * The brand panel beside the auth form: a photograph with a testimonial set
 * across the bottom.
 *
 * The image is self-hosted in /public rather than hotlinked from Unsplash's CDN.
 * This page already refuses a third-party request for its icons; taking one for
 * the hero would be inconsistent, and self-hosting avoids leaking a referrer on
 * every sign-in.
 *
 * Source: Unsplash photo-1573496782432-8690d8148c46, recropped with an imgix
 * focal point (fp-y=0.62, fp-z=1.25) to push a visible conference badge — a
 * third party's name and brand — out of frame. Keep that crop if the file is
 * regenerated.
 *
 * Contrast is carried by the scrim, not by the photograph, so swapping the image
 * cannot silently make the text unreadable.
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
        className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
      />

      {/* Scrim: near-solid under the testimonial, easing off towards the top so
          the photograph still reads. The top stop is 50%, which with the flat
          wash below is 0.625 effective — white on a worst-case blown-out
          highlight measures 4.81:1, past the 4.5:1 floor. This image has a white
          wall behind her, so that worst case is the actual case here. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-navy-500 via-navy-500/90 to-navy-500/50"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-navy-500/25" />

      <motion.div {...rise(0)} className="relative flex items-center gap-2 text-white">
        <Icon name="Building2" className="h-6 w-6" />
        <span className="text-lg font-medium tracking-tight">Gingerly</span>
      </motion.div>

      {/* pb-12 lifts the quote clear of the panel's bottom edge so it sits in the
          lower third rather than against the corner radius. */}
      <motion.figure {...rise(0.12)} className="relative m-0 space-y-7 pb-12">
        {/* The quote mark is decorative; the blockquote carries the meaning. */}
        <span
          aria-hidden="true"
          className={`block text-7xl leading-none text-teal-100/40 ${HEADLINE_ACCENT_CLASS}`}
        >
          &ldquo;
        </span>

        <blockquote className="max-w-[22ch] text-[2.15rem] font-light leading-[1.22] tracking-[-0.02em] text-white [text-wrap:balance]">
          {TESTIMONIAL.quote}
        </blockquote>

        <figcaption className="flex flex-col gap-1">
          <span className="text-base font-medium text-white">{TESTIMONIAL.name}</span>
          <span className="text-base text-white/70">{TESTIMONIAL.role}</span>
        </figcaption>
      </motion.figure>
    </aside>
  )
}
