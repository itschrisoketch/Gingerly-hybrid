'use client'

import { Icon as IconifyIcon, addCollection } from '@iconify/react'
import { ICON_MAP, type IconName } from '@/lib/icons/icon-map'
import { cn } from '@/lib/utils'
import { iconCollection } from '@/lib/icons/icon-data'

// Registering the bundled subset up-front means Iconify resolves every name
// locally and never reaches the network.
addCollection(iconCollection)

interface IconProps {
  name: IconName
  className?: string
  /**
   * Accessible name. Omit for decorative icons — they are hidden from
   * assistive tech, which is correct when adjacent text already conveys
   * the meaning.
   */
  title?: string
}

export function Icon({ name, className, title }: IconProps) {
  return (
    <IconifyIcon
      icon={`material-symbols:${ICON_MAP[name]}`}
      className={cn('h-5 w-5 shrink-0', className)}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
    />
  )
}
