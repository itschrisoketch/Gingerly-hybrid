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
import { useRegisterMerchant } from '@/lib/hooks/api'
import {
  merchantRegistrationSchema,
  type MerchantRegistrationFormData,
} from '@/lib/validations'

/** Fields validated before the user may leave step 1. */
const STEP_ONE_FIELDS = [
  'full_name',
  'email',
  'msisdn',
  'password',
  'confirm_password',
] as const

interface LandlordSignupFormProps {
  step: number
  onStepChange: (step: number) => void
}

export function LandlordSignupForm({ step, onStepChange }: LandlordSignupFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<MerchantRegistrationFormData>({
    resolver: zodResolver(merchantRegistrationSchema),
    mode: 'onBlur',
    defaultValues: {
      full_name: '',
      email: '',
      msisdn: '',
      password: '',
      confirm_password: '',
      business_name: '',
      property_name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      bank_name: '',
      account_no: '',
      account_holder_name: '',
      routing_number: '',
    },
  })

  const { mutate: registerMerchant, isLoading } = useRegisterMerchant({
    onSuccess: (_response, variables) => {
      router.push(`/verify-account?msisdn=${encodeURIComponent(variables.msisdn)}`)
    },
  })

  const password = watch('password')

  const goToStepTwo = async () => {
    const valid = await trigger(STEP_ONE_FIELDS)
    if (valid) onStepChange(2)
  }

  const onSubmit = async (data: MerchantRegistrationFormData) => {
    await registerMerchant(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="landlord-name">Full Name</Label>
            <AuthInput
              id="landlord-name"
              placeholder="John Doe"
              autoComplete="name"
              aria-invalid={errors.full_name ? true : undefined}
              aria-describedby={errors.full_name ? 'full_name-error' : undefined}
              {...register('full_name')}
            />
            <FieldError id="full_name-error" message={errors.full_name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-business-name">Business Name</Label>
            <AuthInput
              id="landlord-business-name"
              placeholder="Sunset Properties LLC"
              autoComplete="organization"
              aria-invalid={errors.business_name ? true : undefined}
              aria-describedby={errors.business_name ? 'business_name-error' : undefined}
              {...register('business_name')}
            />
            <FieldError id="business_name-error" message={errors.business_name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-email">Email</Label>
            <AuthInput
              id="landlord-email"
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
            <Label htmlFor="landlord-phone">Phone</Label>
            <AuthInput
              id="landlord-phone"
              placeholder="254700000000"
              autoComplete="tel"
              aria-invalid={errors.msisdn ? true : undefined}
              aria-describedby={errors.msisdn ? 'msisdn-error' : undefined}
              {...register('msisdn')}
            />
            <FieldError id="msisdn-error" message={errors.msisdn?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-password">Password</Label>
            <AuthInput
              id="landlord-password"
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
            <Label htmlFor="landlord-confirm-password">Confirm Password</Label>
            <AuthInput
              id="landlord-confirm-password"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="landlord-property-name">Property Name</Label>
              <AuthInput
                id="landlord-property-name"
                placeholder="Sunset Apartments"
                autoComplete="off"
                aria-invalid={errors.property_name ? true : undefined}
                aria-describedby={errors.property_name ? 'property_name-error' : undefined}
                {...register('property_name')}
              />
              <FieldError id="property_name-error" message={errors.property_name?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landlord-units">Number of Units</Label>
              <AuthInput
                id="landlord-units"
                type="number"
                min="0"
                placeholder="12"
                autoComplete="off"
                aria-invalid={errors.num_units ? true : undefined}
                aria-describedby={errors.num_units ? 'num_units-error' : undefined}
                {...register('num_units')}
              />
              <FieldError id="num_units-error" message={errors.num_units?.message} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-address">Property Address</Label>
            <AuthInput
              id="landlord-address"
              placeholder="123 Main Street"
              autoComplete="street-address"
              aria-invalid={errors.address ? true : undefined}
              aria-describedby={errors.address ? 'address-error' : undefined}
              {...register('address')}
            />
            <FieldError id="address-error" message={errors.address?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="landlord-city">City</Label>
              <AuthInput
                id="landlord-city"
                placeholder="Nairobi"
                autoComplete="address-level2"
                aria-invalid={errors.city ? true : undefined}
                aria-describedby={errors.city ? 'city-error' : undefined}
                {...register('city')}
              />
              <FieldError id="city-error" message={errors.city?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landlord-state">State / County</Label>
              <AuthInput
                id="landlord-state"
                placeholder="Nairobi County"
                autoComplete="address-level1"
                aria-invalid={errors.state ? true : undefined}
                aria-describedby={errors.state ? 'state-error' : undefined}
                {...register('state')}
              />
              <FieldError id="state-error" message={errors.state?.message} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-zip">Postal Code</Label>
            <AuthInput
              id="landlord-zip"
              placeholder="00100"
              autoComplete="postal-code"
              aria-invalid={errors.zip_code ? true : undefined}
              aria-describedby={errors.zip_code ? 'zip_code-error' : undefined}
              {...register('zip_code')}
            />
            <FieldError id="zip_code-error" message={errors.zip_code?.message} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onStepChange(1)}
              className="h-12 rounded-xl text-[15px] flex-1"
            >
              <Icon name="ChevronLeft" className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="button" onClick={() => onStepChange(3)} className="h-12 rounded-xl text-[15px] flex-1">
              Continue
              <Icon name="ChevronRight" className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Where should we send your rent payouts? You can add this later.
          </p>
          <div className="space-y-2">
            <Label htmlFor="landlord-bank-name">Bank Name</Label>
            <AuthInput
              id="landlord-bank-name"
              placeholder="Example Bank"
              autoComplete="off"
              aria-invalid={errors.bank_name ? true : undefined}
              aria-describedby={errors.bank_name ? 'bank_name-error' : undefined}
              {...register('bank_name')}
            />
            <FieldError id="bank_name-error" message={errors.bank_name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-account-name">Account Holder Name</Label>
            <AuthInput
              id="landlord-account-name"
              placeholder="John Doe or Business Name"
              autoComplete="off"
              aria-invalid={errors.account_holder_name ? true : undefined}
              aria-describedby={errors.account_holder_name ? 'account_holder_name-error' : undefined}
              {...register('account_holder_name')}
            />
            <FieldError id="account_holder_name-error" message={errors.account_holder_name?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="landlord-account-number">Account Number</Label>
              <AuthInput
                id="landlord-account-number"
                placeholder="000000000"
                autoComplete="off"
                aria-invalid={errors.account_no ? true : undefined}
                aria-describedby={errors.account_no ? 'account_no-error' : undefined}
                {...register('account_no')}
              />
              <FieldError id="account_no-error" message={errors.account_no?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landlord-routing-number">Routing Number</Label>
              <AuthInput
                id="landlord-routing-number"
                placeholder="000000000"
                autoComplete="off"
                aria-invalid={errors.routing_number ? true : undefined}
                aria-describedby={errors.routing_number ? 'routing_number-error' : undefined}
                {...register('routing_number')}
              />
              <FieldError id="routing_number-error" message={errors.routing_number?.message} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onStepChange(2)}
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
