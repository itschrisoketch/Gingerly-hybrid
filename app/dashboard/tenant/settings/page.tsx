'use client'

import { PageBanner } from '@/components/dashboard/page-banner'
import { TenantSettingsPanel } from '@/components/dashboard/tenant/tenant-settings-panel'
import { Icon } from '@/components/ui/icon'
import { useAuth } from '@/contexts/auth-context'
import { me, myPayments } from '@/lib/dashboard/tenant-view'
import type { Customer } from '@/lib/api/types'

/**
 * Tenant settings.
 *
 * The one tenant screen showing real account data rather than sample data —
 * everything on the profile tab comes from `/customers/my-account` for the
 * signed-in customer, which is why there is no sample-data chip here.
 *
 * All four tabs from the previous version survive, with a fifth for the
 * tenancy. Two of them genuinely save: name, via
 * `PATCH /customers/update?id=`, which accepts first and last name and nothing
 * else; and the password, via `POST /auth/change-password`. The rest are
 * read-only and say why. See the panel for the endpoint-by-endpoint audit.
 *
 * It carries a banner like every other screen in this section. The agent's
 * settings deliberately has none, on the reasoning that a settings page has no
 * outstanding action — but a tenant's does, because `is_verified` is on the
 * customer record and an unverified account is exactly the kind of thing that
 * should be stated at the top rather than discovered when something fails.
 *
 * The column is capped at 4xl rather than the dashboard's 7xl: a form whose
 * inputs stretch to 1280px is hard to scan and hard to fill.
 */
export default function TenantSettingsPage() {
  const { user, isLoading } = useAuth()
  const record = (user ?? null) as Customer | null
  const name = [record?.first_name, record?.last_name].filter(Boolean).join(' ')

  const paid = myPayments.filter((p) => p.status === 'paid')
  const counts = paid.reduce<Record<string, number>>((acc, p) => {
    if (p.method) acc[p.method] = (acc[p.method] ?? 0) + 1
    return acc
  }, {})
  const methodsUsed = Object.entries(counts)
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
          <Icon name="User" className="mt-0.5 h-4 w-4 shrink-0" />
          Your account, your tenancy and how Gingerly reaches you
        </p>
      </header>

      {/* Three states, not two. With no account loaded — still fetching, or the
          dev auth bypass — we do not know whether it is verified, and saying
          "not verified" would assert something unknown about someone's account.
          That case gets its own, neutral banner. */}
      {!record ? (
        <PageBanner
          id="settings-banner"
          tone="calm"
          icon="Info"
          eyebrow="Account"
          title={isLoading ? 'Loading your account…' : 'No account loaded'}
          description={
            isLoading
              ? 'Your details will fill in once it arrives.'
              : 'Sign in to see and change your details. The tabs below show what can be changed and what cannot.'
          }
        />
      ) : record.is_verified ? (
        <PageBanner
          id="settings-banner"
          tone="calm"
          icon="CheckCircle"
          eyebrow="Account verified"
          title={name ? `You are signed in as ${name}` : 'Your account is verified'}
          description="Your name and password can be changed here. Everything else is set by your agent and shown as stored."
        />
      ) : (
        <PageBanner
          id="settings-banner"
          eyebrow="Not verified"
          title="Your account is not verified yet"
          description="Until it is, some things will not work. Verifying takes a one-time code sent to your phone."
          action={{ href: '/verify-account', label: 'Verify now' }}
        />
      )}

      <TenantSettingsPanel
        methodsUsed={methodsUsed}
        tenancy={{
          unit: me.unit,
          property: me.property,
          rent: me.rent,
          moveIn: me.moveIn,
          leaseEnd: me.leaseEnd,
        }}
      />
    </div>
  )
}
