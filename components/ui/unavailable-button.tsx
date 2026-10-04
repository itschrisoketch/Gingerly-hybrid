import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * A control that exists but cannot act yet.
 *
 * Lifted out of settings-shell.tsx, which is where it started, because it is
 * the answer everywhere in this product rather than only on that screen. Large
 * parts of the API are not built, and the rule when rebuilding a page is that
 * every feature survives it. Deleting a button because its endpoint is missing
 * loses the information that the feature is meant to exist at all — the next
 * person reads the page as the spec and never puts it back.
 *
 * So the control stays, disabled, carrying the reason. Three things make that
 * honest rather than decorative:
 *
 * - `disabled` with `pointer-events-none`, so it cannot be clicked into doing
 *   nothing.
 * - `title` for a pointer, and an `aria-label` that states the action AND the
 *   reason, so a screen reader is told why rather than just hearing a disabled
 *   button it cannot explain.
 * - Reduced opacity, so it reads as unavailable before anyone tries it.
 *
 * `iconOnly` is for table and list rows, where a row of worded buttons would
 * outweigh the row itself. The accessible name is unchanged — it is only the
 * visible label that goes.
 */
export function UnavailableButton({
  children,
  reason,
  icon,
  iconOnly,
  className,
}: {
  children: string
  reason: string
  icon?: IconName
  iconOnly?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      disabled
      title={reason}
      aria-label={`${children} — ${reason}`}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border text-sm font-medium text-muted-foreground disabled:pointer-events-none disabled:opacity-50',
        iconOnly ? 'h-8 w-8 justify-center' : 'h-10 px-4',
        className,
      )}
    >
      {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
      {iconOnly ? null : children}
    </button>
  )
}
