'use client'

import * as React from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from '@/components/ui/icon'
import type { IconName } from '@/lib/icons/icon-map'
import { useSidebar } from '@/components/sidebar-provider'
import { cn } from '@/lib/utils'

/**
 * Collapsing sidebar shell.
 *
 * Desktop: a rail of icons that expands on hover or keyboard focus and collapses
 * when the pointer leaves. Expansion is driven by hover rather than a pinned
 * open/closed state so the nav costs no screen width at rest and no click to
 * consult.
 *
 * Focus expands it too, deliberately: a keyboard user tabbing into the nav would
 * otherwise be reading unlabelled icons.
 *
 * Mobile: a drawer over a scrim, opened from the existing sidebar provider so
 * the current MobileNav trigger keeps working unchanged.
 *
 * Note this file is separate from components/ui/sidebar.tsx, which is shadcn's
 * unrelated sidebar primitive — 763 lines, currently imported by nothing.
 */

const RAIL_WIDTH = 68
const PANEL_WIDTH = 252

interface SidebarContextValue {
  expanded: boolean
}
const SidebarCtx = React.createContext<SidebarContextValue>({ expanded: false })

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen, isMobile } = useSidebar()
  const [hovered, setHovered] = React.useState(false)
  const reduceMotion = useReducedMotion()

  // On mobile the drawer is always fully expanded when open; on desktop,
  // hover or focus-within decides.
  const expanded = isMobile ? true : hovered

  if (isMobile) {
    return (
      <SidebarCtx.Provider value={{ expanded }}>
        <AnimatePresence>
          {isOpen ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-40 bg-navy-500/40 md:hidden"
                aria-hidden="true"
              />
              <motion.aside
                initial={reduceMotion ? false : { x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: reduceMotion ? 0 : 0.28 }}
                className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background px-3 py-4 md:hidden"
              >
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close navigation"
                  className="absolute right-3 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon name="X" className="h-5 w-5" />
                </button>
                {children}
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>
      </SidebarCtx.Provider>
    )
  }

  return (
    <SidebarCtx.Provider value={{ expanded }}>
      <motion.aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setHovered(true)}
        onBlurCapture={(e) => {
          // Only collapse once focus has left the sidebar entirely.
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(false)
        }}
        animate={{ width: expanded ? PANEL_WIDTH : RAIL_WIDTH }}
        initial={false}
        transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: reduceMotion ? 0 : 0.22 }}
        className="relative z-30 hidden h-full shrink-0 flex-col overflow-hidden border-r border-border bg-background px-3 py-4 md:flex"
      >
        {children}
      </motion.aside>
    </SidebarCtx.Provider>
  )
}

export function SidebarBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex h-full flex-col', className)}>{children}</div>
}

export interface SidebarLinkItem {
  label: string
  href: string
  icon: IconName
  badge?: number
}

export function SidebarLink({
  link,
  active,
  onNavigate,
}: {
  link: SidebarLinkItem
  active?: boolean
  onNavigate?: () => void
}) {
  const { expanded } = React.useContext(SidebarCtx)
  const reduceMotion = useReducedMotion()

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      // The label is hidden while collapsed, so the accessible name comes from
      // the title attribute in that state rather than from nothing.
      title={expanded ? undefined : link.label}
      className={cn(
        'group relative flex h-11 shrink-0 items-center gap-3 rounded-lg px-[13px]',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        active
          ? 'bg-accent/10 text-accent'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {/* Active rail: a 3px marker that reads at collapsed width, where a
          background tint alone is easy to miss on a 68px strip. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent transition-opacity duration-200',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />

      <Icon name={link.icon} className="h-[18px] w-[18px] shrink-0" />

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
            className="flex min-w-0 flex-1 items-center justify-between gap-2 whitespace-nowrap text-sm font-medium"
          >
            <span className="truncate">{link.label}</span>
            {link.badge ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-foreground">
                {link.badge}
              </span>
            ) : null}
          </motion.span>
        ) : null}
      </AnimatePresence>

      {/* Collapsed state still needs to show that something is waiting. */}
      {!expanded && link.badge ? (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent"
        />
      ) : null}
    </Link>
  )
}

export { SidebarCtx }
