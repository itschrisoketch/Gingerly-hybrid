'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Copies a short value — an M-Pesa reference, a transaction id — to the
 * clipboard.
 *
 * WHY IT EXISTS. A payment reference is the one string on these screens that is
 * meant to leave them: it is what a tenant sends their agent when a payment has
 * not landed, and what an agent quotes to support. Retyping ten mixed-case
 * characters from a table is where transcription errors come from, and the
 * whole point of the reference is that it identifies exactly one payment.
 *
 * ACCESSIBILITY. The button carries a real accessible name including the value,
 * because "Copy" alone in a column of rows says nothing about which one. The
 * result is announced through a polite live region rather than only swapping
 * the icon, so it is not signalled by a visual change alone.
 *
 * FAILURE. `navigator.clipboard` is unavailable over plain HTTP on anything but
 * localhost, and can be refused by permissions policy. That is caught and shown
 * as a failure rather than reported as a success the user cannot verify — a
 * silent no-op on a copy control is worse than no control, because they walk
 * away believing they have the reference.
 */
export function CopyButton({
  value,
  label,
  className,
}: {
  value: string
  /** What is being copied, for the accessible name: "M-Pesa reference". */
  label: string
  className?: string
}) {
  const [state, setState] = React.useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(value)
      setState('copied')
    } catch {
      setState('failed')
    }
    timer.current = setTimeout(() => setState('idle'), 2000)
  }

  return (
    <span className={cn('inline-flex items-center', className)}>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label} ${value}`}
        className={cn(
          'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors',
          'text-muted-foreground hover:bg-muted hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
          state === 'copied' && 'text-success-text',
          state === 'failed' && 'text-destructive-text',
        )}
      >
        <Icon
          name={state === 'copied' ? 'Check' : state === 'failed' ? 'XCircle' : 'Copy'}
          className="h-3.5 w-3.5"
        />
      </button>

      {/* Announced, not just shown. */}
      <span aria-live="polite" className="sr-only">
        {state === 'copied'
          ? `${label} copied`
          : state === 'failed'
            ? `Could not copy ${label}. Select it and copy manually.`
            : ''}
      </span>
    </span>
  )
}
