'use client'

import { useTheme } from 'next-themes'
import { Icon } from '@/components/ui/icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { IconName } from '@/lib/icons/icon-map'

const OPTIONS: { value: string; label: string; icon: IconName }[] = [
  { value: 'light', label: 'Light', icon: 'Sun' },
  { value: 'dark', label: 'Dark', icon: 'Moon' },
  { value: 'system', label: 'System', icon: 'Monitor' },
]

/**
 * Theme switcher.
 *
 * Rewritten to drop seven gradient layers, a glass panel, pulsing halos behind
 * every row and a scale-on-hover trigger. A control that changes one setting
 * should not be the most animated thing on the page.
 *
 * The trigger shows the theme currently in force; the menu marks the selected
 * option with a check rather than colour alone.
 */
export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Theme: ${current.label}`}
          title={`Theme: ${current.label}`}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Icon name={current.icon} className="h-[18px] w-[18px]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-40">
        {OPTIONS.map((option) => {
          const selected = theme === option.value
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="cursor-pointer gap-2.5"
            >
              <Icon name={option.icon} className="h-4 w-4 shrink-0" />
              <span className="flex-1">{option.label}</span>
              <Icon
                name="Check"
                className={cn('h-4 w-4 shrink-0 text-accent', !selected && 'invisible')}
              />
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
