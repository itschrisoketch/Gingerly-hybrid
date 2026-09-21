'use client'

import * as React from 'react'
import { AuthInput, type AuthInputProps } from '@/components/auth/auth-input'
import { Icon } from '@/components/ui/icon'

/**
 * Password field with a reveal toggle.
 *
 * WCAG 2.2 "Accessible Authentication" discourages making people transcribe
 * secrets blind, and letting someone read back what they typed is the cheapest
 * way to cut failed sign-ins on a phone keyboard. The toggle is a real button:
 * keyboard reachable, with an accessible name that changes with its state, so a
 * screen-reader user knows which way it is set without seeing the icon.
 *
 * The icon itself is decorative — the button's aria-label carries the meaning.
 */
const AuthPasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<AuthInputProps, 'type' | 'adornment'>
>((props, ref) => {
  const [revealed, setRevealed] = React.useState(false)

  return (
    <AuthInput
      ref={ref}
      type={revealed ? 'text' : 'password'}
      adornment={
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? 'Hide password' : 'Show password'}
          aria-pressed={revealed}
          // -mr-1.5 pulls the 32px hit area back so the glyph still reads as
          // sitting on the field's 16px inset.
          className="-mr-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <Icon name={revealed ? 'EyeOff' : 'Eye'} className="h-4 w-4" />
        </button>
      }
      {...props}
    />
  )
})
AuthPasswordInput.displayName = 'AuthPasswordInput'

export { AuthPasswordInput }
