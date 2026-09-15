'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
              <Input id="tenant-first-name" placeholder="John" {...register('first_name')} />
              <FieldError message={errors.first_name?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-last-name">Last Name</Label>
              <Input id="tenant-last-name" placeholder="Doe" {...register('last_name')} />
              <FieldError message={errors.last_name?.message} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-email">Email</Label>
            <Input
              id="tenant-email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-phone">Phone</Label>
            <Input id="tenant-phone" placeholder="254700000000" {...register('msisdn')} />
            <FieldError message={errors.msisdn?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-password">Password</Label>
            <Input
              id="tenant-password"
              type="password"
              placeholder="Create a password"
              {...register('password')}
            />
            <PasswordStrengthIndicator password={password || ''} />
            <FieldError message={errors.password?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-confirm-password">Confirm Password</Label>
            <Input
              id="tenant-confirm-password"
              type="password"
              placeholder="Re-enter your password"
              {...register('confirm_password')}
            />
            <FieldError message={errors.confirm_password?.message} />
          </div>
          <Button type="button" onClick={goToStepTwo} className="w-full">
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
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
            <Input
              id="tenant-apartment"
              placeholder="Sunset Apartments"
              {...register('apartment_name')}
            />
            <FieldError message={errors.apartment_name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-unit">Unit Number</Label>
            <Input id="tenant-unit" placeholder="3B" {...register('unit_number')} />
            <FieldError message={errors.unit_number?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenant-rent">Monthly Rent</Label>
              <Input
                id="tenant-rent"
                type="number"
                min="0"
                step="any"
                placeholder="25000"
                {...register('monthly_rent')}
              />
              <FieldError message={errors.monthly_rent?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-billing-date">Billing Date</Label>
              <Input id="tenant-billing-date" type="date" {...register('billing_date')} />
              <FieldError message={errors.billing_date?.message} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onStepChange(1)}
              className="flex-1"
              disabled={isLoading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
