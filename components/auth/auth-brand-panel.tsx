'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '@/components/ui/icon'

/**
 * The dark brand panel beside the auth form.
 *
 * Depth is built from three cheap layers rather than a shader: a navy gradient
 * ground, a fluted vertical banding, and an off-centre teal glow. All three are
 * CSS, so the panel costs nothing to render and nothing to download — a WebGL
 * canvas would be a poor trade on the page standing between a user and their
 * account.
 *
 * Copy is the landing site's own line. There are deliberately no security
 * badges, payment-rail logos or customer quotes here: none of them could be
 * substantiated from the codebase, and inventing them on a payments signup is
 * not a design decision to make on a user's behalf.
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
      {/* Ground: a slow vertical lift out of the flat navy. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-black/25"
      />

      {/* Fluting: fine vertical banding, the CSS reading of ribbed glass. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 9px)',
        }}
      />

      {/* Glow: pushed off-centre so the panel is not symmetrical about its own middle. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-[120px]"
      />

      <motion.div {...rise(0)} className="relative flex items-center gap-2 text-white">
        <Icon name="Building2" className="h-6 w-6" />
        <span className="text-lg font-medium tracking-tight">Gingerly</span>
      </motion.div>

      <motion.div {...rise(0.1)} className="relative space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100/80">
          Rental payments
        </p>
        <p className="max-w-[16ch] text-[2.75rem] font-light leading-[1.08] tracking-[-0.03em] text-white [text-wrap:balance]">
          Collect Recurring Payments{' '}
          <span className="font-display italic font-normal">Automatically</span>
        </p>
      </motion.div>

      <motion.p {...rise(0.2)} className="relative text-xs text-white/40">
        &copy; {new Date().getFullYear()} Gingerly
      </motion.p>
    </aside>
  )
}
