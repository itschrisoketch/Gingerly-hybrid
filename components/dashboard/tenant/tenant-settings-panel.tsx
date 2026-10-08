'use client'

import * as React from 'react'
import {
  FIELD,
  Field,
  PrimaryButton,
  SettingsSection,
  ToggleRow,
  UnavailableButton,
} from '@/components/dashboard/settings/settings-shell'
import { Icon } from '@/components/ui/icon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { formatKes } from '@/lib/format'
import { useAuth } from '@/contexts/auth-context'
import { useChangePassword, useUpdateCustomer } from '@/lib/hooks/api'
import type { Customer } from '@/lib/api/types'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * The tenant's settings.
 *
 * Built on the same shell as the agent's — SettingsSection, Field,
 * PrimaryButton, ToggleRow, UnavailableButton — so the two screens are the same
 * object with different contents.
 *
 * WHAT CAN ACTUALLY SAVE, audited against the live spec rather than assumed:
 *
 * - `PATCH /customers/update?id=` accepts `first_name` and `last_name`. Nothing
 *   else. So those two inputs are real and everything else on the profile tab
 *   is shown as stored and says why.
 * - `POST /auth/change-password` takes `new_password` and `confirm_password`,
 *   so the security tab genuinely works. Note it does NOT ask for the current
 *   password — the API authorises on the session alone, which the tab states
 *   rather than hiding.
 * - There is no preferences endpoint, so the notification toggles are
 *   per-browser, exactly as on the agent's side.
 * - Email, phone, apartment, unit, rent and billing date are all on the
 *   customer record and all read-only.
 *
 * The old page had Profile, Notifications, Payment and Security tabs. All four
 * survive. Payment keeps its methods, but as what has actually been used rather
 * than the "VISA" and "MPESA" cards it showed, because the API stores no
 * payment method for a tenant.
 */

const TABS: { value: string; label: string; icon: IconName }[] = [
  { value: 'profile', label: 'Profile', icon: 'User' },
  { value: 'tenancy', label: 'Tenancy', icon: 'Home' },
  { value: 'notifications', label: 'Notifications', icon: 'Bell' },
  { value: 'payment', label: 'Payment', icon: 'CreditCard' },
  { value: 'security', label: 'Security', icon: 'Lock' },
]

const NOTIFICATIONS = [
  { id: 'rent-due', label: 'Rent reminders', description: 'Before your rent falls due.' },
  { id: 'receipt', label: 'Payment confirmed', description: 'When a payment goes through.' },
  { id: 'visit', label: 'Contractor visits', description: 'When a visit is booked or changed.' },
  { id: 'messages', label: 'Messages', description: 'When your agent writes to you.' },
  { id: 'lease', label: 'Lease reminders', description: 'Sixty days before your lease ends.' },
]

const PREFS_KEY = 'gingerly_tenant_notification_prefs'

export function TenantSettingsPanel({
  methodsUsed,
  tenancy,
}: {
  /** What her rent has actually arrived by — there is no stored method. */
  methodsUsed: { method: string; count: number }[]
  tenancy: { unit: string; property: string; rent: number; moveIn: string; leaseEnd: string }
}) {
  const { user } = useAuth()
  const record = (user ?? null) as Customer | null

  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [seeded, setSeeded] = React.useState(false)

  // Seed once the account arrives, but never again — otherwise a refresh after
  // saving would overwrite whatever is being typed next.
  React.useEffect(() => {
    if (seeded || !record) return
    setFirstName(record.first_name ?? '')
    setLastName(record.last_name ?? '')
    setSeeded(true)
  }, [record, seeded])

  const { mutate: save, isLoading: saving } = useUpdateCustomer()

  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const { mutate: changePassword, isLoading: changing } = useChangePassword()
  const passwordsMatch = password.length > 0 && password === confirm

  const [prefs, setPrefs] = React.useState<Record<string, boolean>>({})
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFS_KEY)
      if (raw) setPrefs(JSON.parse(raw))
    } catch {
      // Private mode, or blocked storage. The toggles still work for this
      // session; they just will not be remembered.
    }
  }, [])

  const savePrefs = (next: Record<string, boolean>) => {
    setPrefs(next)
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(next))
    } catch {
      // Nothing to do; the toggles still work for this session.
    }
  }

  const field = (key: keyof Customer) => {
    const v = record?.[key]
    return v === undefined || v === null || v === '' ? '—' : String(v)
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 sm:grid-cols-3 lg:grid-cols-5">
        {TABS.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm data-[state=active]:bg-background"
          >
            <Icon name={t.icon} className="h-4 w-4" />
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <SettingsSection
          title="Your details"
          description="The name your agent sees on your tenancy."
          icon="User"
          footer={
            <PrimaryButton
              icon="Check"
              loading={saving}
              disabled={!record?.id || saving}
              onClick={() =>
                record?.id &&
                save({ id: record.id, first_name: firstName, last_name: lastName })
              }
            >
              Save changes
            </PrimaryButton>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="first-name" label="First name">
              <input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={FIELD}
              />
            </Field>
            <Field id="last-name" label="Last name">
              <input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={FIELD}
              />
            </Field>
            <Field id="email" label="Email" hint="Changing this is not supported by the API yet.">
              <input id="email" defaultValue={field('email')} disabled className={FIELD} />
            </Field>
            <Field
              id="msisdn"
              label="Phone"
              hint="Used for M-Pesa and your one-time codes, so it is changed through support."
            >
              <input
                id="msisdn"
                defaultValue={field('msisdn')}
                disabled
                className={cn(FIELD, 'tabular-nums')}
              />
            </Field>
          </div>
        </SettingsSection>
      </TabsContent>

      <TabsContent value="tenancy" className="space-y-6">
        <SettingsSection
          title="Your tenancy"
          description="Where you live and what you pay."
          icon="Home"
          connected={false}
          unavailableReason="These come from your tenancy record and are set by your agent. There is no endpoint for a tenant to change them."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="apartment" label="Property">
              <input id="apartment" defaultValue={tenancy.property} disabled className={FIELD} />
            </Field>
            <Field id="unit" label="Unit">
              <input id="unit" defaultValue={tenancy.unit} disabled className={FIELD} />
            </Field>
            <Field id="rent" label="Monthly rent">
              <input
                id="rent"
                defaultValue={formatKes(tenancy.rent)}
                disabled
                className={cn(FIELD, 'tabular-nums')}
              />
            </Field>
            <Field id="billing" label="Rent due on">
              <input id="billing" defaultValue="The 1st of each month" disabled className={FIELD} />
            </Field>
            <Field id="move-in" label="Moved in">
              <input
                id="move-in"
                defaultValue={tenancy.moveIn}
                disabled
                className={cn(FIELD, 'tabular-nums')}
              />
            </Field>
            <Field id="lease-end" label="Lease ends">
              <input
                id="lease-end"
                defaultValue={tenancy.leaseEnd}
                disabled
                className={cn(FIELD, 'tabular-nums')}
              />
            </Field>
          </div>
        </SettingsSection>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <SettingsSection
          title="Notifications"
          description="What Gingerly tells you about, and when."
          icon="Bell"
          connected={false}
          unavailableReason="There is no preferences endpoint yet, so these are remembered in this browser only and do not change what is actually sent."
        >
          <div>
            {NOTIFICATIONS.map((n, i) => (
              <ToggleRow
                key={n.id}
                id={n.id}
                label={n.label}
                description={n.description}
                checked={prefs[n.id] ?? true}
                onChange={(next) => savePrefs({ ...prefs, [n.id]: next })}
                last={i === NOTIFICATIONS.length - 1}
              />
            ))}
          </div>
        </SettingsSection>
      </TabsContent>

      <TabsContent value="payment" className="space-y-6">
        <SettingsSection
          title="How you pay"
          description="The methods your rent has arrived by."
          icon="CreditCard"
          connected={false}
          unavailableReason="The API stores no payment method for a tenant — rent is sent to your agent directly, so there is nothing saved here to change."
          footer={
            <UnavailableButton
              icon="Plus"
              reason="No stored payment methods on the API — rent is sent to your agent directly"
            >
              Add a method
            </UnavailableButton>
          }
        >
          {methodsUsed.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing has been paid yet, so there is no method to show.
            </p>
          ) : (
            <div>
              {methodsUsed.map((m, i) => (
                <div
                  key={m.method}
                  className={cn(
                    'flex items-center justify-between gap-4 py-3',
                    i < methodsUsed.length - 1 && 'rule-b',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon
                        name={
                          m.method === 'M-Pesa'
                            ? 'Smartphone'
                            : m.method === 'Card'
                              ? 'CreditCard'
                              : 'Building'
                        }
                        className="h-4 w-4"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{m.method}</p>
                      <p className="text-xs text-muted-foreground">
                        Used for <span className="tabular-nums">{m.count}</span>{' '}
                        {m.count === 1 ? 'month' : 'months'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SettingsSection>
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        <SettingsSection
          title="Password"
          description="Change the password you sign in with."
          icon="Lock"
          footer={
            <PrimaryButton
              icon="Check"
              loading={changing}
              disabled={!passwordsMatch || changing}
              onClick={() =>
                changePassword({ new_password: password, confirm_password: confirm })
              }
            >
              Change password
            </PrimaryButton>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="new-password" label="New password">
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={FIELD}
              />
            </Field>
            <Field
              id="confirm-password"
              label="Confirm password"
              hint={
                confirm.length > 0 && !passwordsMatch ? 'These do not match yet.' : undefined
              }
            >
              <input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={FIELD}
              />
            </Field>
          </div>

          {/* The old form asked for the current password. The endpoint does not
              take one, so the field was collecting something nothing checked. */}
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              The API authorises this on your session alone and does not ask for your current
              password. Sign out anywhere you do not recognise.
            </p>
          </div>
        </SettingsSection>
      </TabsContent>
    </Tabs>
  )
}
