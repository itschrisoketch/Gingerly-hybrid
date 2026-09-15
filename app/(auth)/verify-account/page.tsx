'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { AuthInput } from '@/components/auth/auth-input'
import { AuthHeading } from '@/components/auth/auth-heading'
import { Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/auth/field-error'
import { useVerifyAccount, useResendVerificationOtp } from '@/lib/hooks/api'
import { verifyAccountSchema, type VerifyAccountFormData } from '@/lib/validations'

/**
 * Account verification.
 *
 * New accounts are created inactive: POST /customers/register returns
 * { msg, success } and login then fails with "user account is inactive".
 * The OTP is delivered by SMS to the msisdn — which is why this screen keys
 * on the phone number rather than the email address.
 */
function VerifyAccountContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [resent, setResent] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VerifyAccountFormData>({
    resolver: zodResolver(verifyAccountSchema),
    defaultValues: {
      msisdn: searchParams.get('msisdn') || '',
      otp: '',
    },
  })

  const { mutate: verify, isLoading } = useVerifyAccount({
    onSuccess: () => router.push('/login'),
  })

  const { mutate: resend, isLoading: isResending } = useResendVerificationOtp({
    onSuccess: () => setResent(true),
  })

  const msisdn = watch('msisdn')

  const onSubmit = async (data: VerifyAccountFormData) => {
    await verify(data)
  }

  return (
    // No min-h-screen or max-w wrapper here: app/(auth)/layout.tsx owns page framing.
    <div className="space-y-8">
      <AuthHeading accent="account" description="Enter the 6-digit code we sent by SMS.">
        Verify your
      </AuthHeading>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="msisdn">Phone number</Label>
            <AuthInput
              id="msisdn"
              type="tel"
              autoComplete="tel"
              placeholder="254700000000"
              aria-invalid={errors.msisdn ? true : undefined}
              aria-describedby={errors.msisdn ? 'msisdn-error' : undefined}
              {...register('msisdn')}
            />
            <FieldError id="msisdn-error" message={errors.msisdn?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp">Verification code</Label>
            <AuthInput
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className="tracking-[0.35em]"
              aria-invalid={errors.otp ? true : undefined}
              aria-describedby={errors.otp ? 'otp-error' : undefined}
              {...register('otp')}
            />
            <FieldError id="otp-error" message={errors.otp?.message} />
          </div>
        </div>

        <Button type="submit" className="h-12 w-full rounded-xl text-[15px]" disabled={isLoading}>
          {isLoading ? (
            <>
              <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify account'
          )}
        </Button>
      </form>

      <div className="space-y-3 text-center text-sm text-muted-foreground">
        <div>
          {resent ? (
            <span>Code sent again.</span>
          ) : (
            <button
              type="button"
              onClick={() => msisdn && resend({ msisdn })}
              disabled={!msisdn || isResending}
              className="cursor-pointer font-medium text-foreground underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResending ? 'Sending...' : "Didn't get a code? Resend"}
            </button>
          )}
        </div>
        <div>
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={null}>
      <VerifyAccountContent />
    </Suspense>
  )
}
