/**
 * Inline form field error.
 *
 * `role="alert"` sits on a conditionally-rendered node, so it announces when
 * the error appears rather than on every keystroke. The `id` is required:
 * callers must point the input's aria-describedby at it.
 */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  )
}
