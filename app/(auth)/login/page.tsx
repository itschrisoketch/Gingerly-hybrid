'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthHeading } from '@/components/auth/auth-heading'
import { RoleToggle } from '@/components/auth/role-toggle'
import { FieldError } from '@/components/auth/field-error'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { AuthInput } from '@/components/auth/auth-input'
import { AuthPasswordInput } from '@/components/auth/auth-password-input'
import { Label } from '@/components/ui/label'
import { AuthDivider } from '@/components/auth/auth-divider'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { useLogin } from '@/lib/hooks/api'
import type { LoginType } from '@/lib/api/types'

export default function LoginPage() {
  const router = useRouter()
  const [loginType, setLoginType] = useState<LoginType>('customer')

  const { mutate: login, isLoading } = useLogin({
    onError: (error) => {
      // A freshly registered account is inactive until its OTP is confirmed.
      // Send the user to the verification screen instead of leaving them
      // staring at a login form that will never succeed.
      if (/inactive/i.test(error.message)) {
        router.push('/verify-account')
      }
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      login_type: 'customer',
    },
  })

  const handleLoginTypeChange = (type: LoginType) => {
    setLoginType(type)
    setValue('login_type', type)
  }

  const onSubmit = async (data: LoginFormData) => {
    await login(data)
  }

  return (
    <div className="space-y-8">
      <AuthHeading accent="back" description="Sign in to your account">
        Welcome
      </AuthHeading>

      <RoleToggle value={loginType} onChange={handleLoginTypeChange} />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <AuthInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
              disabled={isLoading}
            />
            <FieldError id="email-error" message={errors.email?.message} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
            <AuthPasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
              disabled={isLoading}
            />
            <FieldError id="password-error" message={errors.password?.message} />
          </div>
        </div>

        <Button type="submit" className="h-12 rounded-xl text-[15px] w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        <AuthDivider>or create an account</AuthDivider>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" asChild className="h-12 rounded-xl text-[15px]">
            <Link href="/signup?type=tenant">As Tenant</Link>
          </Button>
          <Button variant="outline" asChild className="h-12 rounded-xl text-[15px]">
            <Link href="/signup?type=landlord">As Landlord</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
