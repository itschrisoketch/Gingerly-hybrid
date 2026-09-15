'use client'

import * as React from 'react'

/**
 * Chart engine for ProgressMetricCard.
 *
 * Written here rather than vendored: the card that consumes it shipped without
 * this module, so there was nothing to copy.
 *
 * Hand-drawn SVG rather than Recharts. The chart sits inside an absolutely
 * positioned region behind the card's text, bleeds off both edges, and needs
 * keyboard-addressable points — three things that fight Recharts'
 * ResponsiveContainer harder than drawing two paths is worth.
 *
 * Accessibility, per the chart guidance: points are reachable by keyboard, not
 * hover alone, and the whole series is exposed as a real table to assistive tech
 * so the data is available without reading a graph.
 */

export type ChartView = 'curve' | 'bars'
export type MetricAccent = 'teal' | 'emerald' | 'rose' | 'amber' | 'neutral'

export interface SeriesPoint {
  value: number
  date: string
}

export interface MetricSeries {
  name: string
  data: SeriesPoint[]
  accent?: MetricAccent
}

export interface ChartSeries {
  name: string
  data: SeriesPoint[]
  color: string
}

/**
 * Accents resolve to the project's own tokens rather than raw Tailwind palette
 * hexes, so the chart follows the theme and the `text` values are the
 * contrast-checked `-text` variants, not the fill colours.
 */
export const ACCENTS: Record<MetricAccent, { stroke: string; text: string }> = {
  teal: { stroke: 'hsl(var(--accent))', text: 'hsl(var(--accent))' },
  emerald: { stroke: 'hsl(var(--success))', text: 'hsl(var(--success-text))' },
  rose: { stroke: 'hsl(var(--destructive))', text: 'hsl(var(--destructive-text))' },
  amber: { stroke: 'hsl(var(--warning))', text: 'hsl(var(--warning-text))' },
  neutral: { stroke: 'hsl(var(--muted-foreground))', text: 'hsl(var(--muted-foreground))' },
}

export const SERIES_COLORS = [
  'hsl(var(--accent))',
  'hsl(var(--navy-500))',
  'hsl(var(--warning))',
  'hsl(var(--success))',
]

/** 1_250_000 -> "1.3M". Keeps big shilling figures from wrapping a headline. */
export function formatCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
  if (abs >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (abs >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(Math.round(value))
}

const VB_W = 100
const VB_H = 100
const PAD_Y = 12

/** Catmull-Rom to cubic Bézier: a smooth curve that passes through every point. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

export function MetricChart({
  series,
  view,
  defaultIndex,
  valueFormatter,
  dateFormatter,
}: {
  series: ChartSeries[]
  view: ChartView
  defaultIndex: number
  valueFormatter: (n: number) => string
  dateFormatter: (d: string) => string
}) {
  const primary = series[0]
  const count = primary?.data.length ?? 0
  const [active, setActive] = React.useState(Math.min(defaultIndex, Math.max(count - 1, 0)))

  const all = series.flatMap((s) => s.data.map((d) => d.value))
  const max = all.length ? Math.max(...all) : 0
  const min = all.length ? Math.min(...all) : 0
  const span = max - min || 1

  const toXY = (data: SeriesPoint[]) =>
    data.map((d, i) => ({
      x: count > 1 ? (i / (count - 1)) * VB_W : VB_W / 2,
      y: PAD_Y + (1 - (d.value - min) / span) * (VB_H - PAD_Y * 2),
    }))

  if (!primary || count < 2) return null

  const activePoint = primary.data[active]
  const activeXY = toXY(primary.data)[active]

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden="true"
      >
        {series.map((s, si) => {
          const pts = toXY(s.data)
          if (view === 'bars') {
            const bw = (VB_W / count) * 0.45
            return (
              <g key={s.name}>
                {pts.map((p, i) => (
                  <rect
                    key={i}
                    x={p.x - bw / 2}
                    y={p.y}
                    width={bw}
                    height={VB_H - p.y}
                    fill={s.color}
                    opacity={i === active ? 0.95 : 0.35}
                  />
                ))}
              </g>
            )
          }
          const d = smoothPath(pts)
          return (
            <g key={s.name}>
              {si === 0 ? (
                <path
                  d={`${d} L ${VB_W} ${VB_H} L 0 ${VB_H} Z`}
                  fill={s.color}
                  opacity={0.1}
                />
              ) : null}
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={1.4}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )
        })}

        <line
          x1={activeXY.x}
          x2={activeXY.x}
          y1={0}
          y2={VB_H}
          stroke="hsl(var(--foreground))"
          strokeWidth={1}
          opacity={0.18}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Marker drawn outside the stretched viewBox so it stays a circle. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card"
        style={{
          left: `${activeXY.x}%`,
          top: `${activeXY.y}%`,
          background: primary.color,
        }}
      />

      <p
        className="pointer-events-none absolute right-3 top-3 rounded-md bg-card/95 px-2 py-1 text-right text-xs tabular-nums shadow-sm"
        aria-hidden="true"
      >
        <span className="block font-medium text-foreground">
          {valueFormatter(activePoint.value)}
        </span>
        <span className="block text-muted-foreground">{dateFormatter(activePoint.date)}</span>
      </p>

      {/* One focusable stop per point: the chart guidance requires the values be
          reachable without a pointer, and hover alone excludes keyboard users. */}
      <div className="pointer-events-auto absolute inset-0 flex">
        {primary.data.map((d, i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            aria-label={`${dateFormatter(d.date)}: ${valueFormatter(d.value)}`}
            className="h-full flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50"
          />
        ))}
      </div>

      {/* Non-visual fallback: the full series as a real table. */}
      <table className="sr-only">
        <caption>{primary.name}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {primary.data.map((d, i) => (
            <tr key={i}>
              <th scope="row">{dateFormatter(d.date)}</th>
              <td>{valueFormatter(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
