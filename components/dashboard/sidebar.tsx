'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarCtx,
  type SidebarLinkItem,
} from '@/components/ui/sidebar-shell'
import { Icon } from '@/components/ui/icon'
import { Wordmark } from '@/components/wordmark'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSidebar } from '@/components/sidebar-provider'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

const AGENT_LINKS: SidebarLinkItem[] = [
  { label: 'Dashboard', href: '/dashboard/landlord', icon: 'LayoutDashboard' },
  { label: 'Properties', href: '/dashboard/landlord/properties', icon: 'Building2' },
  { label: 'Tenants', href: '/dashboard/landlord/tenants', icon: 'Users' },
  { label: 'Payments', href: '/dashboard/landlord/payments', icon: 'CreditCard' },
  { label: 'Analytics', href: '/dashboard/landlord/analytics', icon: 'PieChart' },
  { label: 'Maintenance', href: '/dashboard/landlord/maintenance', icon: 'Wrench' },
  { label: 'Calendar', href: '/dashboard/landlord/calendar', icon: 'CalendarDays' },
  { label: 'Messages', href: '/dashboard/landlord/messages', icon: 'MessageSquare' },
  { label: 'Documents', href: '/dashboard/landlord/documents', icon: 'FileText' },
  { label: 'Settings', href: '/dashboard/landlord/settings', icon: 'Settings' },
  { label: 'Help', href: '/dashboard/landlord/help', icon: 'HelpCircle' },
]

const TENANT_LINKS: SidebarLinkItem[] = [
  { label: 'Dashboard', href: '/dashboard/tenant', icon: 'LayoutDashboard' },
  { label: 'My Home', href: '/dashboard/tenant/home', icon: 'Home' },
  { label: 'Payments', href: '/dashboard/tenant/payments', icon: 'CreditCard' },
  { label: 'Maintenance', href: '/dashboard/tenant/maintenance', icon: 'Wrench' },
  { label: 'Calendar', href: '/dashboard/tenant/calendar', icon: 'CalendarDays' },
  { label: 'Messages', href: '/dashboard/tenant/messages', icon: 'MessageSquare' },
  { label: 'Documents', href: '/dashboard/tenant/documents', icon: 'FileText' },
  { label: 'Settings', href: '/dashboard/tenant/settings', icon: 'Settings' },
  { label: 'Help', href: '/dashboard/tenant/help', icon: 'HelpCircle' },
]

/** Best available display name across the Customer and Merchant shapes. */
function displayName(user: unknown): string | null {
  if (!user || typeof user !== 'object') return null
  const u = user as Record<string, unknown>
  const full = typeof u.full_name === 'string' ? u.full_name.trim() : ''
  if (full) return full
  const first = typeof u.first_name === 'string' ? u.first_name.trim() : ''
  const last = typeof u.last_name === 'string' ? u.last_name.trim() : ''
  const joined = [first, last].filter(Boolean).join(' ')
  if (joined) return joined
  return typeof u.email === 'string' && u.email ? u.email : null
}

function initials(name: string): string {
  const parts = name.split(/[\s@.]+/).filter(Boolean)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, setIsOpen } = useSidebar()
  const { user, logout } = useAuth()

  const isAgent = pathname.includes('/landlord')
  const links = isAgent ? AGENT_LINKS : TENANT_LINKS

  const name = displayName(user)
  const closeOnMobile = () => {
    if (isMobile) setIsOpen(false)
  }

  const handleLogout = async () => {
    closeOnMobile()
    // The sidebar previously linked to /logout, a route that does not exist.
    // AuthProvider.logout clears the session and redirects to /login itself.
    await logout()
    router.refresh()
  }

  return (
    <Sidebar>
      <SidebarBody>
        <SidebarHeader />

        <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
          {links.map((link) => (
            <SidebarLink
              key={link.href}
              link={link}
              // Exact match only: every link shares the /dashboard/<role> prefix,
              // so startsWith would mark the dashboard root active everywhere.
              active={pathname === link.href}
              onNavigate={closeOnMobile}
            />
          ))}
        </nav>

        <SidebarFooter
          name={name}
          isAgent={isAgent}
          onLogout={handleLogout}
        />
      </SidebarBody>
    </Sidebar>
  )
}

function SidebarHeader() {
  const { expanded } = React.useContext(SidebarCtx)
  const reduceMotion = useReducedMotion()

  return (
    <Link
      href="/"
      className="flex h-12 shrink-0 items-center rounded-lg px-[11px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      aria-label="Gingerly home"
    >
      {/* Collapsed shows the diamond alone, cut from the same asset by
          Wordmark's markOnly crop rather than redrawn — the full lockup is
          3.45:1 and illegible in a 68px rail. */}
      {expanded ? (
        <motion.span
          key="full"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
          className="flex items-center"
        >
          <Wordmark className="h-8" />
        </motion.span>
      ) : (
        <Wordmark className="h-8" markOnly />
      )}
    </Link>
  )
}

function SidebarFooter({
  name,
  isAgent,
  onLogout,
}: {
  name: string | null
  isAgent: boolean
  onLogout: () => void
}) {
  const { expanded } = React.useContext(SidebarCtx)
  const reduceMotion = useReducedMotion()

  return (
    <div className="mt-2 shrink-0 space-y-1 border-t border-border pt-3">
      <div className="flex h-11 items-center gap-3 rounded-lg px-[13px]">
        <span
          className={cn(
            'flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full',
            'bg-accent/10 text-[11px] font-semibold uppercase text-accent',
          )}
          aria-hidden="true"
        >
          {name ? initials(name) : <Icon name="User" className="h-3.5 w-3.5" />}
        </span>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: reduceMotion ? 0 : 0.15 }}
              className="flex min-w-0 flex-col whitespace-nowrap"
            >
              {/* No invented fallback name here. If the profile has not loaded,
                  the row says so rather than showing a person who is not you. */}
              <span className="truncate text-sm font-medium text-foreground">
                {name ?? 'Signed in'}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {isAgent ? 'Agent' : 'Tenant'}
              </span>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex h-11 items-center gap-1 px-[5px]">
        <ThemeToggle />
        <button
          type="button"
          onClick={onLogout}
          aria-label="Log out"
          title="Log out"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Icon name="LogOut" className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  )
}
