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
            <Input id="landlord-name" placeholder="John Doe" {...register('full_name')} />
            <FieldError message={errors.full_name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-business-name">Business Name</Label>
            <Input
              id="landlord-business-name"
              placeholder="Sunset Properties LLC"
              {...register('business_name')}
            />
            <FieldError message={errors.business_name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-email">Email</Label>
            <Input
              id="landlord-email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-phone">Phone</Label>
            <Input id="landlord-phone" placeholder="254700000000" {...register('msisdn')} />
            <FieldError message={errors.msisdn?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-password">Password</Label>
            <Input
              id="landlord-password"
              type="password"
              placeholder="Create a password"
              {...register('password')}
            />
            <PasswordStrengthIndicator password={password || ''} />
            <FieldError message={errors.password?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-confirm-password">Confirm Password</Label>
            <Input
              id="landlord-confirm-password"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="landlord-property-name">Property Name</Label>
              <Input
                id="landlord-property-name"
                placeholder="Sunset Apartments"
                {...register('property_name')}
              />
              <FieldError message={errors.property_name?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landlord-units">Number of Units</Label>
              <Input
                id="landlord-units"
                type="number"
                min="0"
                placeholder="12"
                {...register('num_units')}
              />
              <FieldError message={errors.num_units?.message} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-address">Property Address</Label>
            <Input
              id="landlord-address"
              placeholder="123 Main Street"
              {...register('address')}
            />
            <FieldError message={errors.address?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="landlord-city">City</Label>
              <Input id="landlord-city" placeholder="Nairobi" {...register('city')} />
              <FieldError message={errors.city?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landlord-state">State / County</Label>
              <Input id="landlord-state" placeholder="Nairobi County" {...register('state')} />
              <FieldError message={errors.state?.message} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-zip">Postal Code</Label>
            <Input id="landlord-zip" placeholder="00100" {...register('zip_code')} />
            <FieldError message={errors.zip_code?.message} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onStepChange(1)}
              className="flex-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="button" onClick={() => onStepChange(3)} className="flex-1">
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
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
            <Input
              id="landlord-bank-name"
              placeholder="Example Bank"
              {...register('bank_name')}
            />
            <FieldError message={errors.bank_name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlord-account-name">Account Holder Name</Label>
            <Input
              id="landlord-account-name"
              placeholder="John Doe or Business Name"
              {...register('account_holder_name')}
            />
            <FieldError message={errors.account_holder_name?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="landlord-account-number">Account Number</Label>
              <Input
                id="landlord-account-number"
                placeholder="000000000"
                {...register('account_no')}
              />
              <FieldError message={errors.account_no?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landlord-routing-number">Routing Number</Label>
              <Input
                id="landlord-routing-number"
                placeholder="000000000"
                {...register('routing_number')}
              />
              <FieldError message={errors.routing_number?.message} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onStepChange(2)}
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
