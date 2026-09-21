import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * The status badge used everywhere in the dashboard.
 *
 * One component, one vocabulary. Before this, payments, tenants, maintenance,
 * properties and the calendar each defined their own pill classes inline, so
 * "Paid", "Resolved" and "Success" were three hand-written variations on the
 * same idea and would drift the first time any of them changed.
 *
 * COLOUR IS NOT TAKEN FROM THE REFERENCE DESIGN. The palette it came with —
 * `#EAA65D` on `bg-orange-50` and friends — measures 1.96:1 for Pending, 1.84
 * for In review and 2.26 for Success against their own tints. Six of its seven
 * states fail the 4.5 floor PRODUCT.md sets, and Pending at 1.96 is close to
 * invisible. The FORM is kept exactly: a rounded tinted pill, a filled glyph,
 * a semibold label. The values are this product's tokens, each one solved
 * against its own 10% tint in both themes and recorded in globals.css.
 *
 * Every badge is an icon AND a word, never a colour alone — PRODUCT.md rule 5.
 * The icon is decorative; the label carries the meaning.
 */

export type StatusTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'progress'
  | 'info'
  | 'neutral'

const TONE: Record<StatusTone, string> = {
  success: 'bg-success/10 text-success-text',
  warning: 'bg-warning/10 text-warning-text',
  danger: 'bg-destructive/10 text-destructive-text',
  progress: 'bg-accent/10 text-accent-text',
  info: 'bg-info/10 text-info-text',
  neutral: 'bg-muted text-neutral-text',
}

const SIZE = {
  sm: 'h-6 gap-1 px-2 text-xs [&_svg]:h-3 [&_svg]:w-3',
  default: 'h-7 gap-1.5 px-2.5 text-xs [&_svg]:h-3.5 [&_svg]:w-3.5',
  lg: 'h-9 gap-2 px-3.5 text-sm [&_svg]:h-4 [&_svg]:w-4',
} as const

export function StatusBadge({
  tone,
  icon,
  children,
  size = 'default',
  className,
  title,
}: {
  tone: StatusTone
  icon?: IconName
  children: React.ReactNode
  size?: keyof typeof SIZE
  className?: string
  /** Hover copy for a state whose label is necessarily short. */
  title?: string
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-lg font-semibold',
        TONE[tone],
        SIZE[size],
        className,
      )}
    >
      {/* Decorative: the label beside it carries the meaning, and Icon
          already hides itself from assistive tech when given no title. */}
      {icon ? <Icon name={icon} /> : null}
      {children}
    </span>
  )
}
