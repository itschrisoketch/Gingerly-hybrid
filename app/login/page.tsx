'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo and header */}
        <div className="space-y-3">
          <Building2 className="h-8 w-8 text-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>
        </div>

        {/* Login Type Selector */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => handleLoginTypeChange('customer')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              loginType === 'customer'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tenant
          </button>
          <button
            type="button"
            onClick={() => handleLoginTypeChange('merchant')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              loginType === 'merchant'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Landlord
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
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
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">Or create an account</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild>
              <Link href="/signup?type=tenant">As Tenant</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup?type=landlord">As Landlord</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
