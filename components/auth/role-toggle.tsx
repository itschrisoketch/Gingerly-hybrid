'use client'

import type { LoginType } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const OPTIONS: { value: LoginType; label: string }[] = [
  { value: 'customer', label: 'Tenant' },
  { value: 'merchant', label: 'Landlord' },
]

interface RoleToggleProps {
  value: LoginType
  onChange: (value: LoginType) => void
}

export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div
      role="group"
      aria-label="Account type"
      className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-0.5"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              // h-11 == 44px, the minimum touch target, and must not drop below
              // it. With the track's 2px padding that totals 48px overall,
              // matching the field and button height.
              'h-11 cursor-pointer rounded-lg px-4 text-sm font-medium',
              'transition-[background-color,color,box-shadow] duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-0',
              selected
                // Brand teal carries the selected state. accent-foreground is
                // white, which clears 4.5:1 on this teal in both themes.
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
