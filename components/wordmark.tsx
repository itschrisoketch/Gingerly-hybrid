import { cn } from '@/lib/utils'

// Measured from the asset's alpha channel: the diamond mark occupies x 5-87 and
// the "Gingerly" lettering starts at x 94, in a 321x93 image. So the mark plus
// its trailing gap is the leftmost 93px — exactly one square.
const FULL_ASPECT = '321 / 93'
const MARK_ASPECT = '93 / 93'

/**
 * The Gingerly lockup — diamond mark plus wordmark — or the mark alone.
 *
 * Rendered as a CSS mask filled with `currentColor` rather than an `<img>`.
 * The source asset is white-on-transparent, so as an image it would be invisible
 * on light surfaces and only work on dark ones. As a mask it takes whatever
 * colour the surrounding text has, so one file serves both and both themes, with
 * no second asset to keep in sync.
 *
 * `markOnly` crops to the diamond by scaling the mask to the container's height
 * and pinning it left: the container is square, the scaled mask is 3.45x wider
 * than it is tall, so only the leftmost square shows. That is the mark, cut from
 * the same file rather than a separate icon that could drift from it.
 *
 * Set the colour with a text utility on the caller.
 *
 * It is a mask, not an image, so it carries role="img" and an accessible name —
 * without them it would be an empty div to a screen reader.
 */
export function Wordmark({
  className,
  markOnly = false,
}: {
  className?: string
  markOnly?: boolean
}) {
  return (
    <span
      role="img"
      aria-label="Gingerly"
      className={cn('inline-block shrink-0 bg-current', className)}
      style={{
        aspectRatio: markOnly ? MARK_ASPECT : FULL_ASPECT,
        WebkitMaskImage: 'url(/logo/gingerly-white.png)',
        maskImage: 'url(/logo/gingerly-white.png)',
        WebkitMaskSize: markOnly ? 'auto 100%' : 'contain',
        maskSize: markOnly ? 'auto 100%' : 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: markOnly ? 'left center' : 'center',
        maskPosition: markOnly ? 'left center' : 'center',
      }}
    />
  )
}
