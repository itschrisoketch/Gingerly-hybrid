'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ChartView } from '@/components/ui/metric-chart'

/**
 * Controls for ProgressMetricCard. Written here because the card shipped
 * importing this module without including it.
 */

export interface PeriodOption {
  label: string
  /** Number of trailing points to show. Omitted means the whole series. */
  points?: number
}

/**
 * Period picker.
 *
 * A real dropdown rather than a row of pills: the options are mutually
 * exclusive, only one is ever relevant, and the card header has no room for
 * three inline choices beside the title and the trend figure.
 */
export function PeriodSelect({
  value,
  options,
  onChange,
  accentText,
}: {
  value: string
  options: PeriodOption[]
  onChange: (option: PeriodOption) => void
  accentText?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="pointer-events-auto flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <span>{value}</span>
          <Icon name="ChevronDown" className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {options.map((option) => {
          const selected = option.label === value
          return (
            <DropdownMenuItem
              key={option.label}
              onClick={() => onChange(option)}
              className="cursor-pointer gap-2"
            >
              <span className="flex-1">{option.label}</span>
              {/* Wrapped rather than styled directly: Icon takes no style prop,
                  and the check inherits currentColor from this span so the menu
                  matches the card's trend colour. */}
              <span
                className={cn('shrink-0', !selected && 'invisible')}
                style={accentText ? { color: accentText } : undefined}
              >
                <Icon name="Check" className="h-4 w-4" />
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const VIEWS: { value: ChartView; label: string; icon: 'Activity' | 'BarChart3' }[] = [
  { value: 'curve', label: 'Line', icon: 'Activity' },
  { value: 'bars', label: 'Bars', icon: 'BarChart3' },
]

/**
 * Chart type switch.
 *
 * A two-option segmented control with `aria-pressed` on each half, so the
 * selected state is announced rather than only shown. Both halves are 32px in a
 * 36px track; this sits inside a card header where a 44px control would
 * dominate the title, and it is a display preference rather than a primary
 * action.
 */
export function ViewToggle({
  value,
  onChange,
}: {
  value: ChartView
  onChange: (view: ChartView) => void
}) {
  return (
    <div
      role="group"
      aria-label="Chart type"
      className="pointer-events-auto flex items-center gap-0.5 rounded-lg bg-muted/70 p-0.5"
    >
      {VIEWS.map((v) => {
        const selected = value === v.value
        return (
          <button
            key={v.value}
            type="button"
            aria-pressed={selected}
            aria-label={v.label}
            title={v.label}
            onClick={() => onChange(v.value)}
            className={cn(
              'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
              selected
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon name={v.icon} className="h-3.5 w-3.5" />
          </button>
        )
      })}
    </div>
  )
}
