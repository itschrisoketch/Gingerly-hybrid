/**
 * The number in the middle of a donut or radial.
 *
 * Shared so the two charts that sit side by side on the analytics page cannot
 * drift apart typographically — they were 30px and 38px, which reads as a
 * mistake rather than a hierarchy when the cards are next to each other.
 *
 * Styled with an inline `style`, never Tailwind classes. Two things go wrong
 * otherwise, and both end in a caption-sized grey number:
 *
 *  - `ChartContainer` puts `text-xs` on the wrapper and SVG text INHERITS
 *    font-size, so anything that does not set its own size renders at 12px.
 *  - A presentation attribute cannot resolve a custom property:
 *    `fill="hsl(var(--foreground))"` is silently dropped, because `var()` is
 *    only valid inside a CSS declaration. The `style` prop compiles to one, so
 *    it resolves; the attribute does not, and the text falls back to recharts'
 *    default mid-grey — which is exactly what "pale" looks like.
 *
 * `stroke: 'none'` is the fix for the centre text rendering silver-white.
 *
 * The donut gaps its slices with `strokeWidth={2} className="stroke-card"` on
 * `<Pie>`. Recharts puts that on the Layer `<g>` wrapping BOTH the sectors and
 * this label, and STROKE INHERITS — so the text was being painted with a 2px
 * stroke in the card colour, i.e. white on white. A 32px semibold value survives
 * that; a 15px caption is mostly stroke by area and washes out completely, which
 * is why only the second line looked broken and why changing its fill never
 * helped. The radial was never affected: its `<Label>` sits in
 * `PolarRadiusAxis`, a sibling of the stroked bars rather than a child.
 *
 * Killing stroke here rather than on the Pie keeps the label correct wherever it
 * is mounted, including inside anything else that strokes its marks.
 *
 * `dominantBaseline="middle"` is required, not decoration. Without it an SVG
 * `y` places the ALPHABETIC BASELINE, not the optical centre, so both lines sit
 * high in the hole and the gap between them reads wrong — which is most of what
 * "the text looks weird" turns out to be. With it, `y` is the middle of the
 * glyphs and the two offsets below are the real spacing.
 *
 * The two offsets are solved, not nudged. With `y` as the optical centre, the
 * 32px value spans y+-16 and the 15px caption y+-7.5; for the block to centre on
 * `cy` with about 4px between the lines, the value sits at cy-10 and the caption
 * at cy+18. Changing either font size means re-solving both.
 *
 * Both colours are theme tokens, so this follows light and dark.
 *
 * The caption is `--foreground` at 70% opacity rather than `--muted-foreground`.
 * That is deliberate and empirical: `--foreground` is the one token observed to
 * render correctly inside this SVG, so basing the second line on it and dimming
 * it cannot land anywhere the first line has not already proved reachable. The
 * muted token kept coming out washed out here, and chasing why was costing more
 * than deriving the colour from a value known to work.
 */

const VALUE = {
  fontSize: 32,
  fontWeight: 600,
  letterSpacing: '-0.02em',
  fontVariantNumeric: 'tabular-nums',
} as const

const CAPTION = {
  fontSize: 15,
  fontWeight: 500,
  fontVariantNumeric: 'tabular-nums',
} as const

export function ChartCenterLabel({
  cx,
  cy,
  value,
  caption,
  /** Shifts both lines up for a half-radial, whose bottom half is empty. */
  offset = 0,
}: {
  cx: number
  cy: number
  value: string
  caption: string
  offset?: number
}) {
  return (
    // `stroke: none` is load-bearing — see the note above.
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="middle"
      style={{ stroke: 'none', strokeWidth: 0 }}
    >
      <tspan x={cx} y={cy - 10 + offset} style={{ ...VALUE, fill: 'hsl(var(--foreground))' }}>
        {value}
      </tspan>
      <tspan
        x={cx}
        y={cy + 18 + offset}
        style={{ ...CAPTION, fill: 'hsl(var(--muted-foreground))' }}
      >
        {caption}
      </tspan>
    </text>
  )
}
