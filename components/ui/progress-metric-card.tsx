'use client'

import { useId, useMemo, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import {
  ACCENTS,
  formatCompact,
  MetricChart,
  SERIES_COLORS,
  type ChartSeries,
  type ChartView,
  type MetricAccent,
  type MetricSeries,
  type SeriesPoint,
} from '@/components/ui/metric-chart'
import { PeriodSelect, ViewToggle, type PeriodOption } from '@/components/ui/metric-controls'

export type { SeriesPoint, MetricSeries, MetricAccent, ChartView, PeriodOption }

export type CardSize = 'sm' | 'md' | 'lg'

export interface ProgressMetricCardProps {
  title: string
  total?: string | number
  delta?: string
  deltaLabel?: string
  percent?: string
  trend?: 'up' | 'down'
  unit?: string
  period?: string
  periodOptions?: PeriodOption[]
  onPeriodChange?: (option: PeriodOption) => void
  defaultView?: ChartView
  accent?: MetricAccent
  /** A single series. Provide this, or `series`. */
  data?: SeriesPoint[]
  /** Several named series. Takes precedence over `data`. */
  series?: MetricSeries[]
  defaultIndex?: number
  size?: CardSize
  /** Secondary peak / low / average figures in the footer. */
  showStats?: boolean
  valueFormatter?: (value: number) => string
  dateFormatter?: (date: string) => string
  loading?: boolean
  className?: string
}

const DEFAULT_PERIODS: PeriodOption[] = [
  { label: 'Past 7 days', points: 4 },
  { label: 'Past 14 days', points: 7 },
  { label: 'Past 30 days' },
]

/** Share of the card, from the right, given over to the chart. */
const REGION_W = 62
/** Movement below this percentage reads as flat, not as a direction. */
const NEUTRAL_PCT = 0.5

const SIZES: Record<
  CardSize,
  { minH: string; pad: string; footer: string; title: string; headline: string }
> = {
  sm: { minH: 'min-h-[220px]', pad: 'px-5 pt-5', footer: 'px-5 py-3', title: 'text-[15px]', headline: 'text-[34px] sm:text-[40px]' },
  md: { minH: 'min-h-[300px]', pad: 'px-6 pt-6', footer: 'px-6 py-4', title: 'text-[16px]', headline: 'text-[44px] sm:text-[56px]' },
  lg: { minH: 'min-h-[360px]', pad: 'px-7 pt-7', footer: 'px-7 py-5', title: 'text-[17px]', headline: 'text-[52px] sm:text-[68px]' },
}

const sliceWindow = (points: SeriesPoint[], n?: number) =>
  n && n < points.length ? points.slice(-n) : points

/**
 * A metric with its own trend chart.
 *
 * Adapted from the supplied component. Three changes were required to run here:
 * its `./metric-chart` and `./metric-controls` imports were not included with it
 * and are written alongside this file; lucide arrows became Material Symbols via
 * the project's Icon wrapper; and the headline sizes were reduced, since 72-88px
 * numerals overflow a 42-unit rent figure inside a dashboard column.
 *
 * Accent colours come from the project's semantic tokens, so the trend figure
 * uses the contrast-checked `-text` variants rather than a fill colour that
 * measures under 4:1 as text.
 */
export default function ProgressMetricCard({
  title,
  total,
  delta,
  deltaLabel = 'today',
  percent,
  trend,
  unit,
  period = 'Past 30 days',
  periodOptions,
  onPeriodChange,
  defaultView = 'curve',
  accent,
  data,
  series,
  defaultIndex,
  size = 'md',
  showStats = true,
  valueFormatter,
  dateFormatter,
  loading = false,
  className = '',
}: ProgressMetricCardProps) {
  const gridId = `grid-${useId().replace(/:/g, '')}`
  const sz = SIZES[size]
  const shell = `relative flex ${sz.minH} w-full flex-col overflow-hidden rounded-2xl border border-border bg-card ${className}`

  const periods = periodOptions ?? DEFAULT_PERIODS
  const [selectedLabel, setSelectedLabel] = useState(period)
  const [view, setView] = useState<ChartView>(defaultView)

  const baseSeries: MetricSeries[] = useMemo(
    () => (series?.length ? series : [{ name: title, data: data ?? [], accent }]),
    [series, data, title, accent],
  )

  const selectedOption =
    periods.find((p) => p.label === selectedLabel) ?? periods[periods.length - 1]

  const visibleSeries = useMemo(
    () => baseSeries.map((s) => ({ ...s, data: sliceWindow(s.data, selectedOption?.points) })),
    [baseSeries, selectedOption],
  )

  const primary = visibleSeries[0]
  const isMulti = visibleSeries.length > 1
  const hasData = (primary?.data.length ?? 0) >= 2

  // Every figure derives from the primary series, so the card stays internally
  // consistent and reacts to a period change. Explicit props still win.
  const stats = useMemo(() => {
    const vals = primary?.data.map((d) => d.value) ?? []
    const sum = vals.reduce((a, b) => a + b, 0)
    const first = vals[0] ?? 0
    const last = vals[vals.length - 1] ?? 0
    const prev = vals[vals.length - 2] ?? first
    const net = last - first
    return {
      sum,
      net,
      pct: first ? (net / first) * 100 : 0,
      step: last - prev,
      peak: vals.length ? Math.max(...vals) : 0,
      low: vals.length ? Math.min(...vals) : 0,
      avg: vals.length ? sum / vals.length : 0,
    }
  }, [primary])

  const resolvedTrend: 'up' | 'down' | 'flat' =
    trend ?? (Math.abs(stats.pct) < NEUTRAL_PCT ? 'flat' : stats.net >= 0 ? 'up' : 'down')
  const resolvedAccent: MetricAccent =
    accent ?? (resolvedTrend === 'up' ? 'emerald' : resolvedTrend === 'down' ? 'rose' : 'neutral')
  const color = ACCENTS[resolvedAccent]
  const trendIcon = resolvedTrend === 'flat' ? 'ArrowRight' : resolvedTrend === 'down' ? 'ArrowDown' : 'ArrowUp'
  const trendWord = resolvedTrend === 'flat' ? 'flat' : resolvedTrend === 'down' ? 'down' : 'up'

  const fmtCompact = valueFormatter ?? formatCompact
  const fmtFull = valueFormatter ?? ((n: number) => n.toLocaleString() + (unit ? ` ${unit}` : ''))
  const fmtDate = dateFormatter ?? ((d: string) => d)
  const sign = (n: number) => (n >= 0 ? '+' : '−') + fmtCompact(Math.abs(n))

  const displayTotal = total ?? fmtCompact(stats.sum)
  const displayDelta = delta ?? sign(stats.step)
  const displayPercent = percent ?? `${Math.abs(stats.pct).toFixed(1)}%`

  const chartSeries: ChartSeries[] = visibleSeries.map((s, i) => ({
    name: s.name,
    data: s.data,
    color: s.accent
      ? ACCENTS[s.accent].stroke
      : isMulti
        ? SERIES_COLORS[i % SERIES_COLORS.length]
        : color.stroke,
  }))

  const lastIndex = (primary?.data.length ?? 1) - 1
  const fallback = Math.min(defaultIndex ?? lastIndex, lastIndex)

  const handlePeriodChange = (option: PeriodOption) => {
    setSelectedLabel(option.label)
    onPeriodChange?.(option)
  }

  if (loading) {
    return (
      <div className={shell} aria-busy="true">
        <div className={`flex flex-1 flex-col ${sz.pad}`}>
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="mt-6 h-12 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="mt-auto h-24 w-full animate-pulse rounded-lg bg-muted/50" />
        </div>
        <div className={`border-t border-border ${sz.footer}`}>
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className={shell}>
        <div className={`flex flex-1 flex-col ${sz.pad}`}>
          <h3 className={`${sz.title} font-semibold tracking-tight text-foreground`}>{title}</h3>
          <div className="flex flex-1 flex-col items-center justify-center gap-1 py-10 text-center">
            <p className="text-sm font-medium text-foreground">Nothing to chart yet</p>
            <p className="max-w-[34ch] text-sm text-muted-foreground">
              This fills in once there are at least two periods of history.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={shell}>
      {/* Chart region, behind the text */}
      <div className="absolute inset-y-0 right-0 z-0" style={{ width: `${REGION_W}%` }}>
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to left, color-mix(in srgb, ${color.stroke} 12%, transparent), transparent 75%)`,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 text-foreground/[0.10]"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 55%)',
            maskImage: 'linear-gradient(to right, transparent, black 55%)',
          }}
        >
          <svg className="h-full w-full" aria-hidden="true">
            <defs>
              <pattern id={gridId} width="14" height="14" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${gridId})`} />
          </svg>
        </div>

        <MetricChart
          series={chartSeries}
          view={view}
          defaultIndex={fallback}
          valueFormatter={fmtFull}
          dateFormatter={fmtDate}
        />
      </div>

      <div className={`pointer-events-none relative z-10 flex flex-1 flex-col ${sz.pad}`}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-3">
            <h3 className={`${sz.title} font-semibold tracking-tight text-foreground`}>{title}</h3>
            <ViewToggle value={view} onChange={setView} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            {/* The direction is named in text, not carried by the arrow and
                colour alone. */}
            <span className="flex items-center gap-1 font-medium" style={{ color: color.text }}>
              <Icon name={trendIcon} className="h-4 w-4" />
              <span>
                {displayPercent}
                <span className="sr-only"> {trendWord}</span>
              </span>
            </span>
            <PeriodSelect
              value={selectedLabel}
              options={periods}
              onChange={handlePeriodChange}
              accentText={color.text}
            />
          </div>
        </div>

        {isMulti ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
            {chartSeries.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                {s.name}
              </span>
            ))}
          </div>
        ) : null}

        <p
          className={`mt-5 ${sz.headline} font-medium leading-none tracking-tight text-foreground tabular-nums`}
        >
          {displayTotal}
        </p>
      </div>

      <div
        className={`relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border bg-card ${sz.footer} text-sm`}
      >
        <p>
          <span className="font-medium tabular-nums" style={{ color: color.text }}>
            {displayDelta}
          </span>{' '}
          <span className="text-muted-foreground">{deltaLabel}</span>
        </p>
        {showStats ? (
          <p className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground tabular-nums">
                {fmtCompact(stats.peak)}
              </span>{' '}
              peak
            </span>
            <span aria-hidden="true" className="opacity-40">
              &middot;
            </span>
            <span>
              <span className="font-medium text-foreground tabular-nums">
                {fmtCompact(stats.low)}
              </span>{' '}
              low
            </span>
            <span aria-hidden="true" className="opacity-40">
              &middot;
            </span>
            <span>
              <span className="font-medium text-foreground tabular-nums">
                {fmtCompact(Math.round(stats.avg))}
              </span>{' '}
              avg
            </span>
          </p>
        ) : null}
      </div>
    </div>
  )
}
