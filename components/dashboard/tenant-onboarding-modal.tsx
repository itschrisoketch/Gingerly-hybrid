'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Invite a tenant.
 *
 * Restyled to the dashboard's language, and localised with it. It previously
 * asked for a `+1 (555)` phone number and rent in dollars, which no agent on
 * this product can answer; it also led with a Sparkles icon on the submit
 * button, which PRODUCT.md names in its anti-references.
 *
 * Single and bulk stay as two modes, because they are genuinely different jobs —
 * one tenant moving in versus a portfolio being migrated on day one. They are a
 * segmented control now rather than a second set of pill tabs, matching the
 * filters on the page behind.
 *
 * ⚠️ Still a stub. There is no tenant endpoint, so Send closes the dialog and
 * nothing is invited.
 */

const FIELD =
  'h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40'

const MODES = [
  { value: 'single', label: 'One tenant' },
  { value: 'bulk', label: 'Import a list' },
] as const

type Mode = (typeof MODES)[number]['value']

export function TenantOnboardingModal({ properties = [] }: { properties?: string[] }) {
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<Mode>('single')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Icon name="UserPlus" className="h-4 w-4" />
          Add tenant
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-[560px] sm:rounded-2xl">
        <DialogHeader className="space-y-1 p-6 pb-4 pr-12">
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            Add a tenant
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            They get an invitation by SMS and email, and set their own password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6">
          <div
            role="group"
            aria-label="How to add tenants"
            className="flex items-center gap-0.5 rounded-lg bg-muted/70 p-0.5"
          >
            {MODES.map((m) => {
              const selected = mode === m.value
              return (
                <button
                  key={m.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMode(m.value)}
                  className={cn(
                    'flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md px-3 text-sm transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                    selected
                      ? 'bg-card font-medium text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {m.label}
                </button>
              )
            })}
          </div>

          {mode === 'single' ? (
            <>
              <Field id="tenant-name" label="Full name">
                <input id="tenant-name" className={FIELD} placeholder="Grace Wanjiku" />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="tenant-phone" label="Phone" hint="Used for the M-Pesa prompt.">
                  <input
                    id="tenant-phone"
                    type="tel"
                    inputMode="tel"
                    className={cn(FIELD, 'tabular-nums')}
                    placeholder="+254 712 345 678"
                  />
                </Field>
                <Field id="tenant-email" label="Email">
                  <input
                    id="tenant-email"
                    type="email"
                    className={FIELD}
                    placeholder="grace@example.com"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="tenant-property" label="Property">
                  {properties.length > 0 ? (
                    <select id="tenant-property" className={FIELD} defaultValue="">
                      <option value="" disabled>
                        Choose a property
                      </option>
                      {properties.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="tenant-property"
                      className={FIELD}
                      placeholder="Brookside Apartments"
                    />
                  )}
                </Field>
                <Field id="tenant-unit" label="Unit">
                  <input id="tenant-unit" className={FIELD} placeholder="A2" />
                </Field>
              </div>

              <Field id="tenant-rent" label="Monthly rent" hint="In shillings.">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Ksh
                  </span>
                  <input
                    id="tenant-rent"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    className={cn(FIELD, 'pl-12 tabular-nums')}
                    placeholder="72,000"
                  />
                </div>
              </Field>
            </>
          ) : (
            <>
              <Field
                id="tenant-csv"
                label="Tenant list"
                hint="One row per tenant: name, phone, email, property, unit, rent."
              >
                <input
                  id="tenant-csv"
                  type="file"
                  accept=".csv"
                  className={cn(
                    FIELD,
                    'py-2 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium file:text-foreground',
                  )}
                />
              </Field>

              <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                <Icon name="Info" className="mt-px h-4 w-4 shrink-0" />
                <span>
                  Everyone in the file is invited at once. Nobody is charged until they
                  accept and a lease is attached.
                </span>
              </p>

              <Field id="tenant-notes" label="Notes" hint="Optional. Kept on the import.">
                <textarea
                  id="tenant-notes"
                  rows={3}
                  className={cn(FIELD, 'h-auto py-2')}
                  placeholder="Handover from the previous agent, leases start 1 October."
                />
              </Field>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-border px-6 py-4 sm:space-x-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Icon name="Send" className="h-4 w-4" />
            {mode === 'single' ? 'Send invitation' : 'Send invitations'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
