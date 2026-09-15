'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { AuthInput } from '@/components/auth/auth-input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthIndicator } from '@/components/password-strength-indicator'
import { FieldError } from '@/components/auth/field-error'
import { useRegisterCustomer } from '@/lib/hooks/api'
import {
  customerRegistrationSchema,
  type CustomerRegistrationFormData,
} from '@/lib/validations'

/** Fields validated before the user may leave step 1. */
const STEP_ONE_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'msisdn',
  'password',
  'confirm_password',
] as const

interface TenantSignupFormProps {
  step: number
  onStepChange: (step: number) => void
}

export function TenantSignupForm({ step, onStepChange }: TenantSignupFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<CustomerRegistrationFormData>({
    resolver: zodResolver(customerRegistrationSchema),
    mode: 'onBlur',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      msisdn: '',
      password: '',
      confirm_password: '',
      apartment_name: '',
      unit_number: '',
      billing_date: '',
    },
  })

  const { mutate: registerCustomer, isLoading } = useRegisterCustomer({
    onSuccess: (_response, variables) => {
      // The account is created inactive — send the user straight to the
      // OTP screen rather than a dashboard they cannot reach yet.
      router.push(`/verify-account?msisdn=${encodeURIComponent(variables.msisdn)}`)
    },
  })

  const password = watch('password')

  const goToStepTwo = async () => {
    const valid = await trigger(STEP_ONE_FIELDS)
    if (valid) onStepChange(2)
  }

  const onSubmit = async (data: CustomerRegistrationFormData) => {
    await registerCustomer(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenant-first-name">First Name</Label>
              <AuthInput
                id="tenant-first-name"
                placeholder="John"
                autoComplete="given-name"
                aria-invalid={errors.first_name ? true : undefined}
                aria-describedby={errors.first_name ? 'first_name-error' : undefined}
                {...register('first_name')}
              />
              <FieldError id="first_name-error" message={errors.first_name?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-last-name">Last Name</Label>
              <AuthInput
                id="tenant-last-name"
                placeholder="Doe"
                autoComplete="family-name"
                aria-invalid={errors.last_name ? true : undefined}
                aria-describedby={errors.last_name ? 'last_name-error' : undefined}
                {...register('last_name')}
              />
              <FieldError id="last_name-error" message={errors.last_name?.message} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-email">Email</Label>
            <AuthInput
              id="tenant-email"
              type="email"
              placeholder="john@example.com"
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            <FieldError id="email-error" message={errors.email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-phone">Phone</Label>
            <AuthInput
              id="tenant-phone"
              placeholder="254700000000"
              autoComplete="tel"
              aria-invalid={errors.msisdn ? true : undefined}
              aria-describedby={errors.msisdn ? 'msisdn-error' : undefined}
              {...register('msisdn')}
            />
            <FieldError id="msisdn-error" message={errors.msisdn?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-password">Password</Label>
            <AuthInput
              id="tenant-password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
            <PasswordStrengthIndicator password={password || ''} />
            <FieldError id="password-error" message={errors.password?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-confirm-password">Confirm Password</Label>
            <AuthInput
              id="tenant-confirm-password"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              aria-invalid={errors.confirm_password ? true : undefined}
              aria-describedby={errors.confirm_password ? 'confirm_password-error' : undefined}
              {...register('confirm_password')}
            />
            <FieldError id="confirm_password-error" message={errors.confirm_password?.message} />
          </div>
          <Button type="button" onClick={goToStepTwo} className="h-12 rounded-xl text-[15px] w-full">
            Continue
            <Icon name="ChevronRight" className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tell us about your tenancy. You can skip this and add it later.
          </p>
          <div className="space-y-2">
            <Label htmlFor="tenant-apartment">Apartment Name</Label>
            <AuthInput
              id="tenant-apartment"
              placeholder="Sunset Apartments"
              autoComplete="off"
              aria-invalid={errors.apartment_name ? true : undefined}
              aria-describedby={errors.apartment_name ? 'apartment_name-error' : undefined}
              {...register('apartment_name')}
            />
            <FieldError id="apartment_name-error" message={errors.apartment_name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-unit">Unit Number</Label>
            <AuthInput
              id="tenant-unit"
              placeholder="3B"
              autoComplete="off"
              aria-invalid={errors.unit_number ? true : undefined}
              aria-describedby={errors.unit_number ? 'unit_number-error' : undefined}
              {...register('unit_number')}
            />
            <FieldError id="unit_number-error" message={errors.unit_number?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenant-rent">Monthly Rent</Label>
              <AuthInput
                id="tenant-rent"
                type="number"
                min="0"
                step="any"
                placeholder="25000"
                autoComplete="off"
                aria-invalid={errors.monthly_rent ? true : undefined}
                aria-describedby={errors.monthly_rent ? 'monthly_rent-error' : undefined}
                {...register('monthly_rent')}
              />
              <FieldError id="monthly_rent-error" message={errors.monthly_rent?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-billing-date">Billing Date</Label>
              <AuthInput
                id="tenant-billing-date"
                type="date"
                autoComplete="off"
                aria-invalid={errors.billing_date ? true : undefined}
                aria-describedby={errors.billing_date ? 'billing_date-error' : undefined}
                {...register('billing_date')}
              />
              <FieldError id="billing_date-error" message={errors.billing_date?.message} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onStepChange(1)}
              className="h-12 rounded-xl text-[15px] flex-1"
              disabled={isLoading}
            >
              <Icon name="ChevronLeft" className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="h-12 rounded-xl text-[15px] flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
