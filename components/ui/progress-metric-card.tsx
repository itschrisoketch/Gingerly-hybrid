'use client'

import { useMemo, useState } from 'react'
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
  /** Overrides the resting headline. Hovering a point still replaces it. */
  total?: string | number
  /** Small label under the headline when no point is being inspected. */
  totalCaption?: string
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
  data?: SeriesPoint[]
  series?: MetricSeries[]
  size?: CardSize
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

const NEUTRAL_PCT = 0.5

const SIZES: Record<
  CardSize,
  { pad: string; footer: string; title: string; headline: string; chart: string }
> = {
  sm: { pad: 'px-5 pt-5', footer: 'px-5 py-3', title: 'text-[15px]', headline: 'text-[30px] sm:text-[34px]', chart: 'h-28' },
  md: { pad: 'px-6 pt-6', footer: 'px-6 py-4', title: 'text-base', headline: 'text-[36px] sm:text-[44px]', chart: 'h-36' },
  lg: { pad: 'px-7 pt-7', footer: 'px-7 py-5', title: 'text-[17px]', headline: 'text-[44px] sm:text-[52px]', chart: 'h-44' },
}

const sliceWindow = (points: SeriesPoint[], n?: number) =>
  n && n < points.length ? points.slice(-n) : points

/**
 * A metric with its own trend chart.
 *
 * Adapted from the supplied component, then restructured after the original
 * layout proved unreadable in use.
 *
 * As supplied, the chart was an absolutely positioned layer filling the right
 * 62% of the card, with its own tooltip pinned top-right — directly underneath
 * the header's period select and trend figure. Those two always collide, at
 * every card width, because they are given the same corner by construction. No
 * amount of offsetting fixes a layout where two elements are told to occupy one
 * space.
 *
 * The chart now owns a row of its own beneath the headline. Nothing overlaps,
 * because nothing shares space. The floating tooltip is gone: inspecting a point
 * updates the headline and its caption instead, which makes hovering worth doing
 * rather than something that obscures the card.
 *
 * Also adapted: lucide arrows became Material Symbols, and accents resolve to
 * project tokens so the trend figure uses contrast-checked `-text` values.
 */
export default function ProgressMetricCard({
  title,
  total,
  totalCaption,
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
  size = 'md',
  showStats = true,
  valueFormatter,
  dateFormatter,
  loading = false,
  className = '',
}: ProgressMetricCardProps) {
  const sz = SIZES[size]
  const shell = `flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card ${className}`

  const periods = periodOptions ?? DEFAULT_PERIODS
  const [selectedLabel, setSelectedLabel] = useState(period)
  const [view, setView] = useState<ChartView>(defaultView)
  /** Index being inspected; null means "at rest, show the latest". */
  const [inspecting, setInspecting] = useState<number | null>(null)

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
  const trendIcon =
    resolvedTrend === 'flat' ? 'ArrowRight' : resolvedTrend === 'down' ? 'ArrowDown' : 'ArrowUp'
  const trendWord = resolvedTrend === 'flat' ? 'flat' : resolvedTrend === 'down' ? 'down' : 'up'

  const fmtValue = valueFormatter ?? formatCompact
  const fmtDate = dateFormatter ?? ((d: string) => d)

  const lastIndex = (primary?.data.length ?? 1) - 1
  const activeIndex = inspecting ?? lastIndex
  const activePoint = primary?.data[activeIndex]

  // At rest the card shows whatever the caller asked for; inspecting a point
  // replaces it, so hovering answers a question instead of hiding the card.
  const headline =
    inspecting !== null && activePoint
      ? fmtValue(activePoint.value)
      : (total ?? (activePoint ? fmtValue(activePoint.value) : '—'))
  const caption =
    inspecting !== null && activePoint ? fmtDate(activePoint.date) : (totalCaption ?? unit)

  const signed = (n: number) =>
    n === 0 ? 'No change' : (n > 0 ? '+' : '−') + fmtValue(Math.abs(n))
  const displayDelta = delta ?? signed(stats.step)
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

  const handlePeriodChange = (option: PeriodOption) => {
    setSelectedLabel(option.label)
    setInspecting(null)
    onPeriodChange?.(option)
  }

  if (loading) {
    return (
      <div className={shell} aria-busy="true">
        <div className={`flex flex-col gap-5 ${sz.pad} pb-5`}>
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-44 animate-pulse rounded-lg bg-muted" />
          <div className={`${sz.chart} w-full animate-pulse rounded-lg bg-muted/60`} />
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
        <div className={`${sz.pad} pb-6`}>
          <h3 className={`${sz.title} font-semibold tracking-tight text-foreground`}>{title}</h3>
          <div className="flex flex-col items-center gap-1 py-10 text-center">
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
      <div className={`${sz.pad} pb-4`}>
        {/* Row 1: identity and controls. Nothing else is ever drawn here. */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <h3 className={`${sz.title} truncate font-semibold tracking-tight text-foreground`}>
              {title}
            </h3>
            <ViewToggle value={view} onChange={setView} />
          </div>
          <PeriodSelect
            value={selectedLabel}
            options={periods}
            onChange={handlePeriodChange}
            accentText={color.text}
          />
        </div>

        {/* Row 2: the figure, with the trend beside it rather than above it. */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <p
              className={`${sz.headline} font-medium leading-none tracking-tight text-foreground tabular-nums`}
            >
              {headline}
            </p>
            {caption ? (
              <p className="mt-1.5 truncate text-sm text-muted-foreground">{caption}</p>
            ) : null}
          </div>

          <span
            className="flex shrink-0 items-center gap-1 pb-1 text-sm font-medium tabular-nums"
            style={{ color: color.text }}
          >
            <Icon name={trendIcon} className="h-4 w-4" />
            <span>
              {displayPercent}
              <span className="sr-only"> {trendWord}</span>
            </span>
          </span>
        </div>

        {isMulti ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
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
      </div>

      {/* Row 3: the chart, in a band of its own. */}
      <div className={`relative ${sz.chart} w-full`}>
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, color-mix(in srgb, ${color.stroke} 10%, transparent), transparent 80%)`,
          }}
        />
        <MetricChart
          series={chartSeries}
          view={view}
          activeIndex={activeIndex}
          onInspect={setInspecting}
          valueFormatter={fmtValue}
          dateFormatter={fmtDate}
        />
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border ${sz.footer} text-sm`}
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
                {fmtValue(stats.peak)}
              </span>{' '}
              peak
            </span>
            <span aria-hidden="true" className="opacity-40">
              &middot;
            </span>
            <span>
              <span className="font-medium text-foreground tabular-nums">
                {fmtValue(stats.low)}
              </span>{' '}
              low
            </span>
          </p>
        ) : null}
      </div>
    </div>
  )
}
