'use client'

import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { Wordmark } from '@/components/wordmark'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSidebar } from '@/components/sidebar-provider'

/**
 * Dashboard header for widths where the sidebar is a drawer.
 *
 * Flat surface, real wordmark, no gradient tile behind the mark. The sticky
 * header adds the top safe-area inset to its own padding rather than sitting at
 * a bare 0, so it clears the status bar on a phone.
 */
export function MobileNav() {
  const { setIsOpen } = useSidebar()

  return (
    <header
      className="sticky z-40 border-b border-border bg-background md:hidden"
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex h-16 items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Icon name="Menu" className="h-5 w-5" />
          </button>

          <Link
            href="/"
            aria-label="Gingerly home"
            className="flex items-center rounded-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Wordmark className="h-[18px]" />
          </Link>
        </div>

        <ThemeToggle />
      </div>
    </header>
  )
}
