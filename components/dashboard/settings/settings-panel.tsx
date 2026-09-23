'use client'

import * as React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Icon } from '@/components/ui/icon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FIELD,
  Field,
  PrimaryButton,
  SettingsSection,
  ToggleRow,
  UnavailableButton,
} from '@/components/dashboard/settings/settings-shell'
import { useAuth } from '@/contexts/auth-context'
import { useChangePassword, useUpdateMerchant } from '@/lib/hooks/api'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * Settings.
 *
 * All six tabs the previous screen had — Profile, Business, Notifications,
 * Banking, Security, Integrations — with every field carried over. What changed
 * is that each one now tells the truth about whether it can save.
 *
 * Checked against the live OpenAPI spec, only three things are writable:
 *
 *   PATCH /merchants/update/{id}  →  first_name, last_name, erp, erp_name
 *   POST  /auth/change-password   →  new_password, confirm_password
 *   POST  /auth/secure-account    →  deactivates a compromised account
 *
 * Everything else on this screen — business address, tax identifier, banking
 * details, notification preferences, 2FA, API keys — has NO endpoint. Those
 * fields stay visible, because they are what the product will need, but they are
 * disabled and say why rather than pretending. The previous version had Save
 * buttons on all of them.
 *
 * ⚠️ `/auth/change-password` does NOT take the current password; it authorises
 * on the bearer token alone. The old form asked for it, which implied a
 * verification the API does not perform. Rather than collect a secret and
 * discard it, the field is gone and the gap is stated in the UI.
 */
const TABS: { value: string; label: string; icon: IconName }[] = [
  { value: 'profile', label: 'Profile', icon: 'User' },
  { value: 'business', label: 'Business', icon: 'Briefcase' },
  { value: 'notifications', label: 'Notifications', icon: 'Bell' },
  { value: 'banking', label: 'Banking', icon: 'CreditCard' },
  { value: 'security', label: 'Security', icon: 'Lock' },
  { value: 'integrations', label: 'Integrations', icon: 'Zap' },
]

const NOTIFICATIONS = [
  { id: 'rent-received', label: 'Rent received', description: 'When a tenant pays.' },
  { id: 'rent-late', label: 'Rent past due', description: 'When a unit misses its due date.' },
  { id: 'maintenance', label: 'Maintenance reported', description: 'When a tenant raises a job.' },
  { id: 'messages', label: 'Tenant messages', description: 'When a tenant writes to you.' },
  { id: 'lease', label: 'Lease renewals', description: 'Sixty days before a lease ends.' },
]

/** Preferences with no endpoint are kept per-browser so at least they stick. */
const PREFS_KEY = 'gingerly_notification_prefs'

type Record_ = Record<string, unknown>

function field(user: Record_ | null, ...keys: string[]): string {
  for (const k of keys) {
    const v = user?.[k]
    if (typeof v === 'string' && v) return v
  }
  return ''
}

export function SettingsPanel() {
  const { user, isLoading } = useAuth()
  const record = (user ?? null) as Record_ | null

  const merchantId = field(record, 'merchant_id', 'id')
  const fullName = field(record, 'full_name', 'name')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [erpEnabled, setErpEnabled] = React.useState(false)
  const [erpName, setErpName] = React.useState('')

  // Seed the editable fields once the profile arrives.
  React.useEffect(() => {
    if (!record) return
    const first = field(record, 'first_name') || fullName.split(' ')[0] || ''
    const last = field(record, 'last_name') || fullName.split(' ').slice(1).join(' ')
    setFirstName(first)
    setLastName(last)
    setErpEnabled(Boolean(record.erp))
    setErpName(field(record, 'erp_name'))
  }, [record, fullName])

  const [prefs, setPrefs] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, true])),
  )

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY)
      if (raw) setPrefs((p) => ({ ...p, ...JSON.parse(raw) }))
    } catch {
      // Private browsing or blocked storage — defaults are fine.
    }
  }, [])

  function savePrefs(next: Record<string, boolean>) {
    setPrefs(next)
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next))
    } catch {
      // Nothing to do; the toggles still work for this session.
    }
  }

  const { mutate: updateMerchant, isLoading: isSaving } = useUpdateMerchant()
  const { mutate: changePassword, isLoading: isChanging } = useChangePassword()

  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const passwordsMatch = newPassword.length >= 8 && newPassword === confirmPassword

  const email = field(record, 'email')
  const phone = field(record, 'msisdn', 'phone')

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <div className="overflow-x-auto">
        <TabsList className="grid h-auto w-full min-w-fit grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1 lg:grid-cols-6">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="flex h-10 items-center gap-1.5 rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:font-medium data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Icon name={t.icon} className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* ---------------- Profile ---------------- */}
      <TabsContent value="profile" className="space-y-6">
        <SettingsSection
          title="Your details"
          description="The name that appears to tenants and on their receipts."
          icon="User"
          footer={
            <PrimaryButton
              icon="Check"
              loading={isSaving}
              disabled={!merchantId || (!firstName.trim() && !lastName.trim())}
              onClick={() =>
                updateMerchant({
                  id: merchantId,
                  first_name: firstName.trim(),
                  last_name: lastName.trim(),
                })
              }
            >
              Save changes
            </PrimaryButton>
          }
        >
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback>{initials(fullName || `${firstName} ${lastName}`)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">
                {fullName || `${firstName} ${lastName}`.trim() || 'Your account'}
              </p>
              <p className="text-sm text-muted-foreground">
                Initials are used until photo upload exists.
              </p>
            </div>
            <div className="ml-auto">
              <UnavailableButton icon="Camera" reason="No avatar upload endpoint yet">
                Upload photo
              </UnavailableButton>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="first-name" label="First name">
              <input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={FIELD}
                placeholder={isLoading ? 'Loading…' : 'First name'}
              />
            </Field>
            <Field id="last-name" label="Last name">
              <input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={FIELD}
                placeholder={isLoading ? 'Loading…' : 'Last name'}
              />
            </Field>
            <Field id="email" label="Email" hint="Changing this is not supported by the API yet.">
              <input id="email" type="email" value={email} disabled className={FIELD} />
            </Field>
            <Field id="phone" label="Phone" hint="Used for M-Pesa and OTP codes.">
              <input id="phone" value={phone} disabled className={cn(FIELD, 'tabular-nums')} />
            </Field>
          </div>
        </SettingsSection>
      </TabsContent>

      {/* ---------------- Business ---------------- */}
      <TabsContent value="business" className="space-y-6">
        <SettingsSection
          title="Business details"
          description="Your registered name and trading address."
          icon="Briefcase"
          connected={false}
          unavailableReason="The merchant update endpoint accepts only first name, last name and ERP settings. These fields are shown as stored and cannot be edited here yet."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="business-name" label="Business name">
              <input
                id="business-name"
                defaultValue={field(record, 'business_name')}
                disabled
                className={FIELD}
              />
            </Field>
            <Field id="property-name" label="Main property">
              <input
                id="property-name"
                defaultValue={field(record, 'property_name')}
                disabled
                className={FIELD}
              />
            </Field>
            <Field id="address" label="Address">
              <input id="address" defaultValue={field(record, 'address')} disabled className={FIELD} />
            </Field>
            <Field id="city" label="Town or city">
              <input id="city" defaultValue={field(record, 'city')} disabled className={FIELD} />
            </Field>
            <Field id="state" label="County">
              <input id="state" defaultValue={field(record, 'state')} disabled className={FIELD} />
            </Field>
            <Field id="zip" label="Postal code">
              <input id="zip" defaultValue={field(record, 'zip_code')} disabled className={FIELD} />
            </Field>
            <Field id="units" label="Units under management">
              <input
                id="units"
                defaultValue={String(record?.num_units ?? '')}
                disabled
                className={cn(FIELD, 'tabular-nums')}
              />
            </Field>
          </div>
        </SettingsSection>
      </TabsContent>

      {/* ---------------- Notifications ---------------- */}
      <TabsContent value="notifications" className="space-y-6">
        <SettingsSection
          title="Notifications"
          description="What Gingerly tells you about, and when."
          icon="Bell"
          connected={false}
          unavailableReason="There is no preferences endpoint yet, so these are remembered in this browser only and do not change what the backend actually sends."
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

      {/* ---------------- Banking ---------------- */}
      <TabsContent value="banking" className="space-y-6">
        <SettingsSection
          title="Payout account"
          description="Where collected rent is settled."
          icon="CreditCard"
          connected={false}
          unavailableReason="These fields are read-only because the merchant update endpoint does not accept them. The API does have /bank-accounts (add, update, remove, list) — this tab is simply not wired to it yet."
          footer={
            <UnavailableButton icon="Plus" reason="Not wired up yet — POST /bank-accounts/add-bank-account exists">
              Add bank account
            </UnavailableButton>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="bank-name" label="Bank">
              <input id="bank-name" defaultValue={field(record, 'bank_name')} disabled className={FIELD} />
            </Field>
            <Field id="account-name" label="Account holder">
              <input
                id="account-name"
                defaultValue={field(record, 'account_holder_name')}
                disabled
                className={FIELD}
              />
            </Field>
            <Field id="account-number" label="Account number">
              <input
                id="account-number"
                defaultValue={field(record, 'account_no')}
                disabled
                className={cn(FIELD, 'tabular-nums')}
              />
            </Field>
            <Field id="routing-number" label="Branch or routing code">
              <input
                id="routing-number"
                defaultValue={field(record, 'routing_number')}
                disabled
                className={cn(FIELD, 'tabular-nums')}
              />
            </Field>
          </div>
        </SettingsSection>
      </TabsContent>

      {/* ---------------- Security ---------------- */}
      <TabsContent value="security" className="space-y-6">
        <SettingsSection
          title="Password"
          description="Set a new password for your account."
          icon="Lock"
          footer={
            <PrimaryButton
              icon="Check"
              loading={isChanging}
              disabled={!passwordsMatch}
              onClick={() => {
                changePassword({
                  new_password: newPassword,
                  confirm_password: confirmPassword,
                })
                setNewPassword('')
                setConfirmPassword('')
              }}
            >
              Update password
            </PrimaryButton>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="new-password" label="New password" hint="At least 8 characters.">
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={FIELD}
              />
            </Field>
            <Field
              id="confirm-password"
              label="Confirm password"
              hint={
                confirmPassword && !passwordsMatch
                  ? 'The two passwords do not match.'
                  : undefined
              }
            >
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={FIELD}
              />
            </Field>
          </div>

          <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <Icon name="Info" className="mt-px h-4 w-4 shrink-0" />
            <span>
              The API authorises this change on your session alone and does not ask for your
              current password. Sign out on any device you do not recognise.
            </span>
          </p>
        </SettingsSection>

        <SettingsSection
          title="Two-factor authentication"
          description="A second step when signing in."
          icon="Shield"
          connected={false}
          unavailableReason="No 2FA endpoint exists on the API yet."
          footer={
            <UnavailableButton icon="Shield" reason="No 2FA endpoint yet">
              Enable two-factor
            </UnavailableButton>
          }
        >
          <p className="text-sm text-muted-foreground">
            Sign-in is currently password plus the OTP used at registration.
          </p>
        </SettingsSection>
      </TabsContent>

      {/* ---------------- Integrations ---------------- */}
      <TabsContent value="integrations" className="space-y-6">
        <SettingsSection
          title="Property management software"
          description="Link Gingerly to the system you already keep your portfolio in."
          icon="Zap"
          footer={
            <PrimaryButton
              icon="Check"
              loading={isSaving}
              disabled={!merchantId || (erpEnabled && !erpName)}
              onClick={() =>
                updateMerchant({
                  id: merchantId,
                  erp: erpEnabled,
                  erp_name: erpEnabled ? erpName : '',
                })
              }
            >
              Save integration
            </PrimaryButton>
          }
        >
          <ToggleRow
            id="erp-enabled"
            label="Use an external system"
            description="Turn this on if your records live somewhere else."
            checked={erpEnabled}
            onChange={setErpEnabled}
            last
          />

          <Field
            id="erp-name"
            label="Which system"
            hint="Stored on your merchant record as the ERP name."
          >
            <Select value={erpName} onValueChange={setErpName} disabled={!erpEnabled}>
              <SelectTrigger
                id="erp-name"
                className={cn(FIELD, '[&>span]:line-clamp-none [&>span]:whitespace-nowrap')}
              >
                <SelectValue placeholder="Choose a system" />
              </SelectTrigger>
              <SelectContent className="min-w-[240px] rounded-xl">
                {['Buildium', 'AppFolio', 'Yardi', 'Sage', 'QuickBooks', 'Other'].map((n) => (
                  <SelectItem key={n} value={n} className="rounded-lg">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </SettingsSection>

        <SettingsSection
          title="API access"
          description="Keys for talking to Gingerly directly."
          icon="Hash"
          connected={false}
          unavailableReason="No API key endpoint exists yet."
          footer={
            <UnavailableButton icon="Plus" reason="No API key endpoint yet">
              Generate a key
            </UnavailableButton>
          }
        >
          <p className="text-sm text-muted-foreground">
            Keys will let your own systems read collection data without signing in as you.
          </p>
        </SettingsSection>
      </TabsContent>
    </Tabs>
  )
}
