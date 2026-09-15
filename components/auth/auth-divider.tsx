/**
 * Labelled rule, e.g. "or create an account".
 *
 * Two flex rules either side of the label, rather than a full-width line with
 * the label absolutely positioned over a background-coloured chip. The chip
 * approach only looks right while the label's background exactly matches what
 * sits behind it — it breaks the moment the surface is tinted or themed.
 *
 * The rule is decorative, so the text carries the meaning on its own.
 */
export function AuthDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground">{children}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  )
}
