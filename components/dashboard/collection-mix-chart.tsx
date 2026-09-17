'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatKes } from '@/lib/format'
import type { CollectionMixPoint } from '@/lib/dashboard/sample-data'

/**
 * How rent arrived, month by month.
 *
 * Each column sums to the rent that was due, split three ways: paid on time,
 * paid late, and never paid. A total alone hides the thing that matters, because
 * a portfolio can collect the same amount every month while the money arrives
 * later and later — and by the time the total drops, the drift has been running
 * for half a year. A widening "paid late" band says it months earlier.
 *
 * Stacked rather than three separate lines: these are parts of one whole, and
 * the height of the stack is itself the rent roll.
 *
 * Colours come from the project's semantic tokens rather than the chart palette,
 * so on-time reads as the good case and unpaid as the bad one without a legend
 * lookup. Note they must be wrapped in hsl(): this project stores chart tokens as
 * bare HSL triplets, so a raw var() resolves to "185 81% 29%", which is not a
 * colour and draws nothing.
 */
const chartConfig = {
  onTime: { label: 'Paid on time', color: 'hsl(var(--accent))' },
  late: { label: 'Paid late', color: 'hsl(var(--warning))' },
  unpaid: { label: 'Never paid', color: 'hsl(var(--destructive))' },
} satisfies ChartConfig

const RANGES = [
  { value: '12m', label: 'Past 12 months', months: 12 },
  { value: '6m', label: 'Past 6 months', months: 6 },
  { value: '3m', label: 'Past 3 months', months: 3 },
]

const monthLabel = (iso: string) =>
  new Date(`${iso}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })

export function CollectionMixChart({ data }: { data: CollectionMixPoint[] }) {
  const [range, setRange] = React.useState('12m')
  const months = RANGES.find((r) => r.value === range)?.months ?? 12
  const filtered = data.slice(-months)

  const latest = filtered[filtered.length - 1]
  const latestTotal = latest ? latest.onTime + latest.late + latest.unpaid : 0
  const lateShare = latest && latestTotal ? Math.round((latest.late / latestTotal) * 100) : 0

  return (
    <section
      aria-labelledby="mix-heading"
      className="rounded-2xl border border-border bg-card"
    >
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 id="mix-heading" className="text-base font-semibold text-foreground">
            How rent arrives
          </h2>
          <p className="text-sm text-muted-foreground">
            <span className="tabular-nums">{lateShare}%</span> of last month&rsquo;s rent came in
            late
          </p>
        </div>

        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[170px] rounded-lg" aria-label="Time range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value} className="rounded-lg">
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-2 pt-4 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <AreaChart data={filtered}>
            <defs>
              {(['onTime', 'late', 'unpaid'] as const).map((key) => (
                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={monthLabel}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => monthLabel(String(value))}
                  formatter={(value, name) => [
                    formatKes(Number(value)),
                    chartConfig[name as keyof typeof chartConfig]?.label ?? String(name),
                  ]}
                  indicator="dot"
                />
              }
            />

            {/* Stack order is deliberate: on-time sits at the base, so the bands
                above it read as the exceptions piling on top. */}
            <Area
              dataKey="onTime"
              type="natural"
              fill="url(#fill-onTime)"
              stroke="var(--color-onTime)"
              stackId="a"
            />
            <Area
              dataKey="late"
              type="natural"
              fill="url(#fill-late)"
              stroke="var(--color-late)"
              stackId="a"
            />
            <Area
              dataKey="unpaid"
              type="natural"
              fill="url(#fill-unpaid)"
              stroke="var(--color-unpaid)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </div>
    </section>
  )
}
