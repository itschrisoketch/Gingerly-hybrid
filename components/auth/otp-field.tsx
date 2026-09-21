'use client'

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { cn } from '@/lib/utils'

interface OtpFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

/**
 * Six-slot verification code entry.
 *
 * Built on `input-otp` rather than six hand-rolled inputs, because the two
 * things that matter here are the two things hand-rolled versions almost always
 * break: pasting a code, and iOS/Android autofilling it from the SMS. WCAG 2.2
 * "Accessible Authentication (Minimum)" treats requiring manual transcription
 * with no alternative as a failure, so paste is a requirement, not a nicety.
 *
 * Under the hood this is a single real input with the slots painted over it, so
 * paste, autofill, and the software keyboard all behave as they would on any
 * text field, and there is one tab stop rather than six.
 *
 * Slot styling mirrors components/auth/auth-input.tsx — same height, radius,
 * resting fill and teal focus treatment — so the screen reads as one system.
 */
export function OtpField({ value, onChange, disabled, invalid, describedBy }: OtpFieldProps) {
  return (
    <InputOTP
      id="otp"
      maxLength={6}
      value={value}
      onChange={onChange}
      disabled={disabled}
      // Enables SMS autofill on iOS and Android. Keep it.
      autoComplete="one-time-code"
      inputMode="numeric"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      containerClassName="gap-2.5"
    >
      <InputOTPGroup className="gap-2.5">
        {Array.from({ length: 6 }, (_, i) => (
          <InputOTPSlot
            key={i}
            index={i}
            className={cn(
              // Override the vendor component's joined-box treatment: each slot
              // is its own field here, matching AuthInput's geometry.
              'h-14 w-full rounded-xl border text-lg font-medium',
              'first:rounded-xl last:rounded-xl border-l',
              'transition-[background-color,border-color,box-shadow] duration-200 ease-out',
              invalid
                ? 'border-destructive/70 bg-destructive/[0.03]'
                : 'border-border/70 bg-muted/30',
            )}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}
