import { cn } from '@/lib/utils'

// Colour note: this uses the semantic `foreground`/`accent` tokens rather than the
// fixed `navy-*`/`teal-*` brand scales. globals.css does NOT redefine --navy-* or
// --teal-* inside `.dark`, so `text-navy-500` would render near-black text on the
// near-black dark background. The brand panel keeps `bg-navy-500` deliberately: it is
// a constant branded surface carrying white text, which reads correctly in both themes.

interface AuthHeadingProps {
  /** Leading text, set in the body sans. */
  children: React.ReactNode
  /** The single word set in italic display serif. */
  accent: string
  description?: string
  className?: string
}

export function AuthHeading({ children, accent, description, className }: AuthHeadingProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* font-normal is explicit: globals.css @layer base applies `font-bold` to every
          h1, which is heavier than this display treatment intends. */}
      <h1 className="text-3xl font-normal leading-tight text-foreground [text-wrap:balance]">
        {children}{' '}
        <span className="font-display italic font-normal">{accent}</span>
      </h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
