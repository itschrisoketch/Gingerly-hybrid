'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container flex min-h-screen flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <Building2 className="h-8 w-8 mx-auto text-foreground" />
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Step {step} of {TOTAL_STEPS[tab]}
            </p>
          </div>

          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="tenant">Tenant</TabsTrigger>
              <TabsTrigger value="landlord">Agent</TabsTrigger>
            </TabsList>

            <TabsContent value="tenant" className="space-y-6">
              <TenantSignupForm step={step} onStepChange={setStep} />
            </TabsContent>

            <TabsContent value="landlord" className="space-y-6">
              <LandlordSignupForm step={step} onStepChange={setStep} />
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
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
