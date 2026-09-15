import { cn } from '@/lib/utils'

/**
 * The headline treatment shared by the page heading and the brand panel:
 * a light-weight sans line with one word in italic Instrument Serif.
 *
 * Exported so the two places that use it cannot drift apart. Size is not
 * included — that is contextual — but weight, leading and tracking are, because
 * those are what make the two read as the same voice.
 */
export const HEADLINE_CLASS = 'font-light leading-[1.08] tracking-[-0.025em] [text-wrap:balance]'

/**
 * The accent word.
 *
 * `font-display` is repeated wherever this is used rather than inherited: the
 * scoped `[data-auth-shell] :is(…span…)` rule in globals.css sets spans to the
 * body font at specificity (0,1,1), and only a class-level rule at (0,2,0)
 * outranks it. Without the class the italic word silently drops back to sans.
 */
export const HEADLINE_ACCENT_CLASS = 'font-display font-normal italic'

// Colour note: this uses the semantic `foreground` token rather than the fixed
// `navy-*` brand scale. globals.css does NOT redefine --navy-* inside `.dark`,
// so `text-navy-500` would render near-black text on the near-black dark
// background. The brand panel keeps `bg-navy-500` deliberately: it is a constant
// branded surface carrying white text, which reads correctly in both themes.

interface AuthHeadingProps {
  /** Leading text, set upright in the body sans. */
  children: React.ReactNode
  /** The single word set in italic serif. */
  accent: string
  description?: string
  className?: string
}

export function AuthHeading({ children, accent, description, className }: AuthHeadingProps) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {/* font-light is explicit: globals.css @layer base applies `font-bold` to
          every h1, which would fight the light treatment this shares with the
          brand panel. */}
      <h1 className={cn('text-[2.4rem] text-foreground', HEADLINE_CLASS)}>
        {children} <span className={HEADLINE_ACCENT_CLASS}>{accent}</span>
      </h1>
      {description ? (
        <p className="text-[15px] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
