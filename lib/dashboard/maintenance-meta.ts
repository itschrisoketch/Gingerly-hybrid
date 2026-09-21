import type {
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceStatus,
} from '@/lib/dashboard/sample-data'
import type { StatusTone } from '@/components/ui/status-badge'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * Labels, icons and ordering for maintenance.
 *
 * A plain module, NOT part of the client table component. A runtime value
 * exported from a `'use client'` file becomes a client reference to any Server
 * Component that imports it, and the page reads these to build its banner and
 * tiles. That has bitten this codebase twice already — see `initials()` in
 * `lib/format.ts` and `payment-filters.ts`.
 *
 * Icons are Material Symbols, resolved through `components/ui/icon.tsx`. A
 * category reads faster as a glyph than as a word in a dense list, which is the
 * one job an icon has here — the label is always beside it, so the icon is never
 * carrying the meaning alone.
 */

export const CATEGORY: Record<
  MaintenanceCategory,
  { label: string; icon: IconName }
> = {
  plumbing: { label: 'Plumbing', icon: 'Droplets' },
  electrical: { label: 'Electrical', icon: 'Zap' },
  heating: { label: 'Heating & water', icon: 'Thermometer' },
  structural: { label: 'Structural', icon: 'Home' },
  security: { label: 'Doors & security', icon: 'Shield' },
  other: { label: 'Other', icon: 'Wrench' },
}

export const CATEGORY_ORDER = Object.keys(CATEGORY) as MaintenanceCategory[]

/**
 * `rank` sorts the list: unassigned first, then work in flight, then done.
 * PRODUCT.md rule 1 — the exceptions are the rows that need a decision today.
 */
export const STATUS: Record<
  MaintenanceStatus,
  { label: string; tone: StatusTone; icon: IconName; rank: number }
> = {
  open: { label: 'Open', tone: 'danger', icon: 'AlertCircle', rank: 0 },
  in_progress: { label: 'In progress', tone: 'progress', icon: 'Activity', rank: 1 },
  scheduled: { label: 'Scheduled', tone: 'info', icon: 'CalendarDays', rank: 2 },
  resolved: { label: 'Resolved', tone: 'success', icon: 'CheckCircle', rank: 3 },
}

export const STATUS_ORDER = ['open', 'in_progress', 'scheduled', 'resolved'] as const

/**
 * Priority is a word, never a colour on its own — PRODUCT.md rule 5. Only
 * `urgent` gets a mark at all; three coloured priorities on twenty rows would
 * make the column decoration and bury the two that matter.
 */
export const PRIORITY: Record<MaintenancePriority, { label: string }> = {
  urgent: { label: 'Urgent' },
  normal: { label: 'Normal' },
  low: { label: 'Low' },
}

/** Whole days between two ISO timestamps. */
export function daysBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

export const isOpenStatus = (s: MaintenanceStatus) => s !== 'resolved'

/** `?status=` on the maintenance page. Lives here, not in the client table, so
 *  the Server Component can validate the URL before handing it over. */
export type StatusFilter = 'all' | MaintenanceStatus

export function isStatusFilter(value: unknown): value is StatusFilter {
  return typeof value === 'string' && ['all', ...STATUS_ORDER].includes(value as StatusFilter)
}
