'use client'

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { cn } from '@/lib/utils'
import { OTP_LENGTH } from '@/lib/validations'

interface OtpFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

/**
 * Verification code entry, one slot per digit (OTP_LENGTH).
 *
 * Built on `input-otp` rather than hand-rolled per-digit inputs, because the two
 * things that matter here are the two things hand-rolled versions almost always
 * break: pasting a code, and iOS/Android autofilling it from the SMS. WCAG 2.2
 * "Accessible Authentication (Minimum)" treats requiring manual transcription
 * with no alternative as a failure, so paste is a requirement, not a nicety.
 *
 * Under the hood this is a single real input with the slots painted over it, so
 * paste, autofill, and the software keyboard all behave as they would on any
 * text field, and there is one tab stop rather than one per digit.
 *
 * Slot styling mirrors components/auth/auth-input.tsx — same height, radius,
 * resting fill and teal focus treatment — so the screen reads as one system.
 */
export function OtpField({ value, onChange, disabled, invalid, describedBy }: OtpFieldProps) {
  return (
    <InputOTP
      id="otp"
      maxLength={OTP_LENGTH}
      value={value}
      onChange={onChange}
      disabled={disabled}
      // Enables SMS autofill on iOS and Android. Keep it.
      autoComplete="one-time-code"
      inputMode="numeric"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      containerClassName="w-full gap-2.5"
    >
      {/*
        The group must be a full-width flex line and the slots must flex within
        it. Sizing a slot with `w-full` instead collapses it to a hairline: the
        group is shrink-to-fit, so its width is derived from the slots, and a
        percentage width resolving against that is circular.
      */}
      <InputOTPGroup className="flex w-full gap-2.5">
        {Array.from({ length: OTP_LENGTH }, (_, i) => (
          <InputOTPSlot
            key={i}
            index={i}
            className={cn(
              // Override the vendor component's joined-box treatment: each slot
              // is its own field here, matching AuthInput's geometry.
              'h-14 w-auto min-w-0 flex-1 rounded-xl border text-lg font-medium',
              // The vendor rounds only the outer corners of a joined row; these
              // outrank it on specificity so every slot keeps the same radius.
              'first:rounded-xl last:rounded-xl',
              'transition-[background-color,border-color,box-shadow] duration-200 ease-out',
              // Focus mirrors AuthInput: lift to the page ground, low-opacity
              // halo, no offset gap. ring-offset-0 cancels the vendor's offset.
              'ring-offset-0 data-[active=true]:bg-background data-[active=true]:ring-4',
              invalid
                ? 'border-destructive/70 bg-destructive/[0.03] data-[active=true]:border-destructive data-[active=true]:ring-destructive/10'
                : 'border-border/70 bg-muted/30 data-[active=true]:border-accent data-[active=true]:ring-accent/10',
            )}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}
