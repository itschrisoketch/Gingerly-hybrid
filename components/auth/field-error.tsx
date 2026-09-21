import { Icon } from '@/components/ui/icon'

/**
 * Inline form field error.
 *
 * `role="alert"` sits on a conditionally-rendered node, so it announces when
 * the error appears rather than on every keystroke. The `id` is required:
 * callers must point the input's aria-describedby at it.
 *
 * The icon is decorative — `Icon` omits it from the accessibility tree unless
 * given a title — because the message text already carries the meaning. It is
 * here so the error is scannable at a glance and so the state is not signalled
 * by colour alone.
 */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-[13px] leading-snug text-destructive"
    >
      <Icon name="AlertCircle" className="mt-px h-3.5 w-3.5" />
      <span>{message}</span>
    </p>
  )
}
