import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Rendered inside the field against its trailing edge — a reveal toggle, a unit, a status. */
  adornment?: React.ReactNode
}

/**
 * The auth flow's text field.
 *
 * The field is a container with a borderless input inside it, rather than a
 * bare styled `<input>`. That is what lets a control sit *within* the field —
 * the password reveal toggle — instead of floating over it with absolute
 * positioning and guessed offsets.
 *
 * Because focus now lands on the inner input while the visible border belongs
 * to the container, the focus treatment uses `focus-within`. Design intent is
 * unchanged: a recessed muted slot at rest that lifts to the page ground on
 * focus, with a low-opacity teal halo behind it.
 *
 * Invalid styling reads `aria-invalid`, which the pages already set from React
 * Hook Form. Visual state and accessible state are the same state, so they
 * cannot drift, and the error is never signalled by colour alone.
 *
 * Height is 48px, comfortably past the 44px minimum touch target.
 */
const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, adornment, ...props }, ref) => {
    // React renders aria-invalid={true} as the string "true"; accept either.
    const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true'

    return (
      <div
        className={cn(
          'flex h-12 items-center gap-2 rounded-xl border px-4',
          'transition-[background-color,border-color,box-shadow] duration-200 ease-out',
          // ring-offset-0 is deliberate: the inherited global focus style uses an
          // offset ring, which leaves a hard gap that reads like an OS dialog.
          'focus-within:bg-background focus-within:ring-4 focus-within:ring-offset-0',
          // The container dims with the control it wraps.
          'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
          invalid
            ? 'border-destructive/70 bg-destructive/[0.03] focus-within:border-destructive focus-within:ring-destructive/10'
            : 'border-border/70 bg-muted/30 focus-within:border-accent focus-within:ring-accent/10',
          className,
        )}
      >
        <input
          ref={ref}
          className={cn(
            'w-full min-w-0 bg-transparent text-[15px] text-foreground outline-none',
            'placeholder:text-muted-foreground/50',
            'disabled:cursor-not-allowed',
          )}
          {...props}
        />
        {adornment ? <div className="flex shrink-0 items-center">{adornment}</div> : null}
      </div>
    )
  },
)
AuthInput.displayName = 'AuthInput'

export { AuthInput }
