'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'
// Re-exported so existing imports from this module keep working; the component
// itself is shared now, because every rebuilt page needs the same answer.
export { UnavailableButton } from '@/components/ui/unavailable-button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * Shared furniture for the settings tabs.
 *
 * Settings is the only screen here where most controls have no endpoint behind
 * them, so being precise about which ones do is the whole job. `connected`
 * false prints one plain line saying why the fields below cannot be saved, and
 * the inputs are expected to be read-only — better than a Save button that
 * appears to work and does nothing.
 */
export function SettingsSection({
  title,
  description,
  icon,
  connected = true,
  unavailableReason,
  children,
  footer,
}: {
  title: string
  description: string
  icon: IconName
  connected?: boolean
  unavailableReason?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="rule-b flex items-start gap-3 p-5 sm:p-6">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"
        >
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h2 className="font-semibold tracking-tight text-foreground">{title}</h2>
            {!connected ? (
              <StatusBadge tone="neutral" icon="Info" size="sm" title={unavailableReason}>
                Read only
              </StatusBadge>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {!connected && unavailableReason ? (
          <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-foreground">
            <Icon name="AlertTriangle" className="mt-px h-4 w-4 shrink-0 text-warning-text" />
            <span>{unavailableReason}</span>
          </p>
        ) : null}
        {children}
      </div>

      {footer ? <div className="rule-t flex flex-wrap gap-2 p-5 sm:p-6">{footer}</div> : null}
    </section>
  )
}

export const FIELD =
  'h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:text-muted-foreground'

export function Field({
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

export function PrimaryButton({
  children,
  disabled,
  loading,
  onClick,
  icon,
}: {
  children: React.ReactNode
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  icon?: IconName
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-50"
    >
      {loading ? (
        <Icon name="Loader2" className="h-4 w-4 animate-spin" />
      ) : icon ? (
        <Icon name={icon} className="h-4 w-4" />
      ) : null}
      {children}
    </button>
  )
}


/**
 * A labelled on/off row.
 *
 * The state is spelled out in words beside the switch, not carried by colour
 * alone — PRODUCT.md rule 5, and the practical reason it matters here: these
 * five all default to on, so the panel opens as a column of identical filled
 * pills and there is nothing to read. "On"/"Off" in a fixed-width slot makes the
 * column scannable and stops the text shifting as it changes.
 *
 * The control itself is the shared <Switch>. This row used to hand-roll its own
 * <button role="switch"> with a duplicate copy of the styling, which is how it
 * came to carry a bug the shared component never had: the knob was `absolute`
 * with no `left`, so it took its static position, and a <button> inherits
 * `text-align: center` from the UA stylesheet — the knob started at the track's
 * midpoint and the transform pushed it 19px outside the pill. See the note in
 * components/ui/switch.tsx. There is now one switch in this codebase.
 */
export function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
  last,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
  last?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 py-3',
        !last && 'rule-b',
      )}
    >
      <div className="min-w-0">
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="mt-0.5 flex shrink-0 items-center gap-2.5">
        <span
          aria-hidden="true"
          className={cn(
            'w-6 text-right text-xs font-medium',
            checked ? 'text-accent-text' : 'text-muted-foreground',
          )}
        >
          {checked ? 'On' : 'Off'}
        </span>

        <Switch id={id} checked={checked} onCheckedChange={onChange} />
      </span>
    </div>
  )
}
