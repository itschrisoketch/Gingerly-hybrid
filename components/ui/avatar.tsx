'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

import { cn } from '@/lib/utils'

/**
 * Avatar, with the composition documented for the Base UI `base-nova` avatar:
 *
 *   Avatar -> AvatarImage | AvatarFallback | AvatarBadge
 *   AvatarGroup -> Avatar... | AvatarGroupCount
 *
 * Built on the Radix primitive this project already ships rather than on
 * `@base-ui/react`. The API, the prop names and the composition are the ones in
 * those docs, so the parts are drop-in; only the primitive underneath differs.
 * Pulling in a second headless-UI library for one component would leave the
 * codebase with two of everything and four existing avatar call sites split
 * across both, to buy a component we can write here in a hundred lines.
 *
 * `size` is carried on context rather than duplicated on every part, so a
 * fallback's type scale and a badge's diameter follow the root without the call
 * site restating them.
 *
 * On this product avatars are nearly always initials. There is no tenant-photo
 * endpoint, and PRODUCT.md rules out plausible placeholders, so AvatarImage
 * exists for when one lands and the screens pass names through `initials()`
 * until it does. That helper lives in `lib/format.ts`, NOT here: a plain
 * function exported from a 'use client' module is a client reference to a
 * Server Component that imports it, and calling it server-side throws.
 */

type AvatarSize = 'sm' | 'default' | 'lg'

const SIZE: Record<AvatarSize, { root: string; text: string; badge: string }> = {
  sm: { root: 'h-8 w-8', text: 'text-xs', badge: 'h-2.5 w-2.5' },
  default: { root: 'h-10 w-10', text: 'text-sm', badge: 'h-3 w-3' },
  lg: { root: 'h-12 w-12', text: 'text-base', badge: 'h-3.5 w-3.5' },
}

const SizeContext = React.createContext<AvatarSize>('default')

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & { size?: AvatarSize }
>(({ className, size = 'default', ...props }, ref) => (
  <SizeContext.Provider value={size}>
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex shrink-0 rounded-full',
        SIZE[size].root,
        className,
      )}
      {...props}
    />
  </SizeContext.Provider>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full rounded-full object-cover', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

/**
 * Initials on the teal tint used by the stat tiles' icon squares, so a row of
 * avatars reads as the same family as the rest of the dashboard rather than as
 * a decorative element borrowed from somewhere else.
 *
 * Teal at 10% under `--accent` text measures 4.84:1, clearing the 4.5 floor
 * PRODUCT.md sets. Deliberately not the gradient-filled circle this replaced:
 * white on a navy-to-teal gradient passes at one end and fails at the other,
 * and which end a given avatar lands on depends on nothing but its position.
 */
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => {
  const size = React.useContext(SizeContext)
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-accent/10 font-medium tabular-nums text-accent',
        SIZE[size].text,
        className,
      )}
      {...props}
    />
  )
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

/**
 * Status dot at the bottom right. The ring is the card surface, so the badge
 * reads as sitting on top of the avatar rather than cut into it.
 *
 * PRODUCT.md rule 5: state is never colour alone. A badge is colour alone, so it
 * carries `title`/`aria-label` copy and is only ever used where the row already
 * names the state in words.
 */
const AvatarBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const size = React.useContext(SizeContext)
  return (
    <span
      ref={ref}
      className={cn(
        'absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-accent ring-2 ring-card',
        SIZE[size].badge,
        className,
      )}
      {...props}
    />
  )
})
AvatarBadge.displayName = 'AvatarBadge'

/**
 * Overlapping row of avatars. The ring separates neighbours; without it the
 * circles merge into one shape at any real size.
 */
const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: AvatarSize }
>(({ className, size = 'default', ...props }, ref) => (
  <SizeContext.Provider value={size}>
    <div
      ref={ref}
      className={cn(
        'flex items-center -space-x-2 [&>*]:ring-2 [&>*]:ring-card',
        className,
      )}
      {...props}
    />
  </SizeContext.Provider>
))
AvatarGroup.displayName = 'AvatarGroup'

/** The "+5" that closes a group. Same circle, muted rather than tinted. */
const AvatarGroupCount = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const size = React.useContext(SizeContext)
  return (
    <span
      ref={ref}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-muted font-medium tabular-nums text-muted-foreground',
        SIZE[size].root,
        SIZE[size].text,
        className,
      )}
      {...props}
    />
  )
})
AvatarGroupCount.displayName = 'AvatarGroupCount'

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
}
