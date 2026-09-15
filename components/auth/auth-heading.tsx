import { cn } from '@/lib/utils'

// Colour note: this uses the semantic `foreground` token rather than the fixed
// `navy-*` brand scale. globals.css does NOT redefine --navy-* inside `.dark`,
// so `text-navy-500` would render near-black text on the near-black dark
// background. The brand panel keeps `bg-navy-500` deliberately: it is a constant
// branded surface carrying white text, which reads correctly in both themes.

interface AuthHeadingProps {
  /** Leading text, set upright. */
  children: React.ReactNode
  /** The single word set in italic. */
  accent: string
  description?: string
  className?: string
}

/**
 * Page heading for the auth flow.
 *
 * The whole line is set in Instrument Serif, not just the accent word. Inter
 * Tight is a neutral grotesque and reads close to Arial at heading sizes, so
 * confining the serif to one word left the page looking like a default form.
 * The serif is where the brand's character actually lives — the landing site
 * leans on it for the same reason — so it carries the line and the accent word
 * turns italic within it.
 */
export function AuthHeading({ children, accent, description, className }: AuthHeadingProps) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {/* font-normal is explicit: globals.css @layer base applies `font-bold` to
          every h1, and Instrument Serif has only a 400 weight — synthesised bold
          would smear it. */}
      <h1 className="font-display text-[2.6rem] font-normal leading-[1.05] tracking-[-0.02em] text-foreground [text-wrap:balance]">
        {/* `font-display` is repeated on the span deliberately. The scoped
            `[data-auth-shell] :is(…span…)` rule in globals.css sets span to the
            body font at specificity (0,1,1); only the `.font-display` rule at
            (0,2,0) outranks it, so the accent word needs the class to stay serif. */}
        {children} <span className="font-display italic">{accent}</span>
      </h1>
      {description ? (
        <p className="text-[15px] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
