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
    <div role="group" aria-label="Account type" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
      {OPTIONS.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              // min-h-11 == 44px, the minimum touch target.
              'min-h-11 cursor-pointer rounded-md px-4 text-sm font-medium transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              selected
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
