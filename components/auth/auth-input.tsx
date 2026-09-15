import * as React from 'react'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * The auth flow's text field.
 *
 * Design intent: the field reads as a recessed slot at rest — a soft muted fill
 * with a quiet border — and lifts on focus, the fill going to the page ground
 * while a teal halo blooms behind it. That rest/active contrast is what makes it
 * feel considered rather than like a default browser control, and it costs no
 * extra markup.
 *
 * The invalid styling keys off `aria-invalid`, which the pages already set from
 * React Hook Form's error state. Nothing extra to pass and nothing to keep in
 * sync: the visual state and the accessible state are the same state. It also
 * means the error is never conveyed by colour alone — there is a border change,
 * a fill tint, and the FieldError text beneath.
 *
 * Height is 48px, comfortably past the 44px minimum touch target.
 */
const AuthInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      className={cn(
        'h-12 rounded-xl border-border/70 bg-muted/30 px-4 text-[15px]',
        'placeholder:text-muted-foreground/50',
        // Only the properties that actually change are transitioned, so the
        // browser is not invalidating layout on every focus.
        'transition-[background-color,border-color,box-shadow] duration-200 ease-out',
        // Focus: teal border plus a wide, low-opacity halo. ring-offset-0 is
        // deliberate — the inherited global focus style uses an offset ring,
        // which leaves a hard gap that reads like an OS dialog.
        'focus-visible:border-accent focus-visible:bg-background',
        'focus-visible:ring-4 focus-visible:ring-accent/10 focus-visible:ring-offset-0',
        // Invalid, driven entirely by the aria-invalid the form already sets.
        'aria-[invalid=true]:border-destructive/70 aria-[invalid=true]:bg-destructive/[0.03]',
        'focus-visible:aria-[invalid=true]:border-destructive',
        'focus-visible:aria-[invalid=true]:ring-destructive/10',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
AuthInput.displayName = 'AuthInput'

export { AuthInput }
