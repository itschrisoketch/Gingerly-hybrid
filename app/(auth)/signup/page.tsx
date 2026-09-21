'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthHeading } from '@/components/auth/auth-heading'
import { StepProgress } from '@/components/auth/step-progress'
import { AuthDivider } from '@/components/auth/auth-divider'
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons'
import { TenantSignupForm } from '@/components/auth/tenant-signup-form'
import { LandlordSignupForm } from '@/components/auth/landlord-signup-form'

/** Each role has a different number of steps. */
const TOTAL_STEPS = { tenant: 2, landlord: 3 } as const

type SignupTab = keyof typeof TOTAL_STEPS

function SignupContent() {
  const searchParams = useSearchParams()
  const initialTab: SignupTab =
    searchParams.get('type') === 'landlord' ? 'landlord' : 'tenant'

  const [tab, setTab] = useState<SignupTab>(initialTab)
  const [step, setStep] = useState(1)

  // Step counts differ per role, so restart the flow when switching tabs.
  const handleTabChange = (value: string) => {
    setTab(value as SignupTab)
    setStep(1)
  }

  // No min-h-screen or container wrapper here: app/(auth)/layout.tsx owns page
  // framing, centring and width. Adding another would nest two full-height
  // containers and throw the vertical rhythm out.
  return (
    <div className="space-y-8">
      <AuthHeading accent="account">Create your</AuthHeading>

      {/* Social options sit above the step indicator: they are a way past the
          multi-step form entirely, not a step within it. */}
      <SocialAuthButtons action="Sign up" />

      <AuthDivider>or sign up with email</AuthDivider>

      <StepProgress current={step} total={TOTAL_STEPS[tab]} />

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        {/* Geometry and colour match components/auth/role-toggle.tsx, so the
            role switch looks the same on login and signup. shadcn's default
            active state is `bg-background` (white); brand teal replaces it. */}
        <TabsList className="mb-8 grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted/60 p-0.5">
          <TabsTrigger
            value="tenant"
            className="h-11 cursor-pointer rounded-lg text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
          >
            Tenant
          </TabsTrigger>
          <TabsTrigger
            value="landlord"
            className="h-11 cursor-pointer rounded-lg text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
          >
            Agent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenant" className="space-y-6">
          <TenantSignupForm step={step} onStepChange={setStep} />
        </TabsContent>

        <TabsContent value="landlord" className="space-y-6">
          <LandlordSignupForm step={step} onStepChange={setStep} />
        </TabsContent>
      </Tabs>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function SignupPage() {
  // useSearchParams needs a Suspense boundary to prerender in the App Router.
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  )
}
