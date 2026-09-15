import { cn } from '@/lib/utils'

/**
 * The Gingerly lockup — diamond mark plus wordmark.
 *
 * Rendered as a CSS mask filled with `currentColor` rather than an `<img>`.
 * The source asset is white-on-transparent, so as an image it would be invisible
 * on the light form column and only work on the dark panel. As a mask it takes
 * whatever colour the surrounding text has, which means one file serves the
 * navy-on-white and white-on-navy cases and both themes, with no second asset to
 * keep in sync.
 *
 * Set the colour with a text utility on the caller: `text-white` on the brand
 * panel, `text-foreground` on the form column.
 *
 * It is a mask, not an image, so it carries role="img" and an accessible name —
 * without them it would be an empty div to a screen reader.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Gingerly"
      className={cn('inline-block shrink-0 bg-current', className)}
      style={{
        // 321x93 after cropping the source to its content bounds.
        aspectRatio: '321 / 93',
        WebkitMaskImage: 'url(/logo/gingerly-white.png)',
        maskImage: 'url(/logo/gingerly-white.png)',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}
