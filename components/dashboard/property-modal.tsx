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
import type { IconName } from '@/lib/icons/icon-map'

/**
 * Add a property.
 *
 * Restyled to the dashboard's language: flat card surface, teal action, the
 * tinted-square icon used by the stat tiles, no gradients, glass or lifting
 * shadows. It opens from the properties page header, so it is read as a
 * continuation of that page rather than as a different product.
 *
 * The fields are Kenyan. It previously asked for State and ZIP Code and offered
 * to take rent in dollars, which is not a styling problem — an agent in Nairobi
 * cannot fill that form in, whatever colour it is. Area and town are what an
 * address is here, and rent is quoted per unit per month in shillings.
 *
 * ⚠️ Still a stub. There is no create-property endpoint, so Add closes the
 * dialog and nothing is saved. The button is deliberately not disabled — the
 * whole screen is behind a sample-data notice, and a form that cannot be
 * submitted at all tells a reviewer less about the flow than one that closes.
 */

const TYPES: { value: string; label: string; hint: string; icon: IconName }[] = [
  {
    value: 'apartment',
    label: 'Apartment block',
    hint: 'Several units at one address',
    icon: 'Building',
  },
  {
    value: 'house',
    label: 'Standalone house',
    hint: 'A single let',
    icon: 'Home',
  },
]

const FIELD =
  'h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40'

export function PropertyModal() {
  const [open, setOpen] = React.useState(false)
  const [propertyType, setPropertyType] = React.useState('apartment')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Icon name="Plus" className="h-4 w-4" />
          Add property
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-[560px] sm:rounded-2xl">
        <DialogHeader className="space-y-1 p-6 pb-4 pr-12">
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            Add a property
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Units and tenants are added afterwards, one at a time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6">
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-foreground">Type</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {TYPES.map((t) => {
                const selected = propertyType === t.value
                return (
                  <label
                    key={t.value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                      'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40',
                      selected
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:bg-muted/50',
                    )}
                  >
                    <input
                      type="radio"
                      name="property-type"
                      value={t.value}
                      checked={selected}
                      onChange={() => setPropertyType(t.value)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                        selected
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-accent/10 text-accent',
                      )}
                    >
                      <Icon name={t.icon} className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {t.label}
                      </span>
                      <span className="block text-sm text-muted-foreground">{t.hint}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <Field id="property-name" label="Property name">
            <input id="property-name" className={FIELD} placeholder="Brookside Apartments" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="area" label="Area">
              <input id="area" className={FIELD} placeholder="Westlands" />
            </Field>
            <Field id="town" label="Town">
              <input id="town" className={FIELD} placeholder="Nairobi" defaultValue="Nairobi" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="units"
              label="Units"
              hint={propertyType === 'house' ? 'A standalone house is one unit.' : undefined}
            >
              <input
                id="units"
                type="number"
                min={1}
                inputMode="numeric"
                className={cn(FIELD, 'tabular-nums')}
                placeholder={propertyType === 'house' ? '1' : '8'}
              />
            </Field>

            <Field id="rent" label="Rent per unit" hint="Monthly, in shillings.">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Ksh
                </span>
                <input
                  id="rent"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className={cn(FIELD, 'pl-12 tabular-nums')}
                  placeholder="75,000"
                />
              </div>
            </Field>
          </div>
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
            <Icon name="Plus" className="h-4 w-4" />
            Add property
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
