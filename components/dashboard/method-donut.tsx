'use client'

import * as React from 'react'
import { Label, Pie, PieChart, Sector } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartStyle,
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
import { ChartCenterLabel } from '@/components/dashboard/chart-center-label'
import { formatKes, formatKesCompact } from '@/lib/format'
import type { Payment } from '@/lib/dashboard/sample-data'

/**
 * How the rent actually arrives, one method at a time.
 *
 * Interactive: the select picks a method, that slice lifts and gains an outer
 * ring, and the middle reports THAT method rather than the total. It reads
 * better than a plain donut here because the useful question is per-method —
 * M-Pesa, bank and card settle on different timelines and cost different fees —
 * and a total in the middle answers none of it.
 *
 * Three slices is the ceiling for this form regardless, and every one is also
 * named with its amount in the footer, so nothing depends on judging an angle
 * or on telling two colours apart.
 *
 * `innerRadius` is 92 because the hole has to CLEAR THE TEXT INSIDE IT. At the
 * upstream 60, and at the 72 this had, "Ksh 1.33M" at 32px needs about 151px of
 * width against a 144px hole, so the value ran under the ring and came out
 * looking broken. Anything that changes the centre label's size or the longest
 * string it can hold has to be checked against 2 x innerRadius.
 *
 * ⚠️ Two things differ from the upstream shadcn block, both load-bearing:
 *
 *  1. recharts here is 2.15, which has no `PieSectorShapeProps` and no `shape`
 *     callback on Pie. The v2 way is `activeIndex` plus `activeShape`, which is
 *     what this uses. The upstream import would not compile.
 *  2. Colours are wrapped in `hsl()`. This project stores chart tokens as bare
 *     HSL triplets, so `var(--chart-1)` resolves to `186 100% 34%` — not a
 *     colour, and the chart draws nothing at all.
 *
 * `ChartStyle` is rendered at Card level with a matching `data-chart` id because
 * the select sits OUTSIDE `ChartContainer`, and its colour swatches need the
 * `--color-*` variables in scope.
 */
const CHART_ID = 'method-mix'

const chartConfig = {
  amount: { label: 'Collected' },
  mpesa: { label: 'M-Pesa', color: 'hsl(var(--chart-1))' },
  bank: { label: 'Bank transfer', color: 'hsl(var(--chart-4))' },
  card: { label: 'Card', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig

const SLOTS = [
  { key: 'mpesa', method: 'M-Pesa' },
  { key: 'bank', method: 'Bank transfer' },
  { key: 'card', method: 'Card' },
] as const

type SlotKey = (typeof SLOTS)[number]['key']

export function MethodDonut({ payments }: { payments: Payment[] }) {
  const data = React.useMemo(() => {
    const settled = payments.filter((p) => p.status === 'paid')
    return SLOTS.map((s) => ({
      key: s.key,
      method: s.method,
      amount: settled
        .filter((p) => p.method === s.method)
        .reduce((n, p) => n + p.amount, 0),
      count: settled.filter((p) => p.method === s.method).length,
      fill: `var(--color-${s.key})`,
    })).filter((d) => d.amount > 0)
  }, [payments])

  const [active, setActive] = React.useState<SlotKey>(SLOTS[0].key)

  const activeIndex = Math.max(
    data.findIndex((d) => d.key === active),
    0,
  )
  const current = data[activeIndex]
  const total = data.reduce((n, d) => n + d.amount, 0)
  const share = total > 0 && current ? Math.round((current.amount / total) * 100) : 0

  if (!current) return null

  return (
    <Card data-chart={CHART_ID} className="flex flex-col">
      <ChartStyle id={CHART_ID} config={chartConfig} />

      <CardHeader className="flex-row items-start gap-3 space-y-0 pb-0">
        <div className="grid min-w-0 flex-1 gap-1">
          <CardTitle>How tenants pay</CardTitle>
          <CardDescription>Rent received this period, by method</CardDescription>
        </div>

        {/* The trigger overrides two things the base SelectTrigger imposes:
            `[&>span]:line-clamp-1` sets `display: -webkit-box` on the value
            span, which stops a swatch and a label sitting on one row, and the
            fixed width was too narrow for "Bank transfer" plus its swatch and
            the chevron, so the longest option wrapped. Width is now driven by
            content with a floor, and it never shrinks under the title. */}
        <Select value={active} onValueChange={(v) => setActive(v as SlotKey)}>
          <SelectTrigger
            aria-label="Choose a payment method"
            className="h-9 w-auto min-w-[176px] shrink-0 rounded-lg pl-2.5 text-sm [&>span]:line-clamp-none [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span]:whitespace-nowrap"
          >
            <SelectValue placeholder="Method" />
          </SelectTrigger>

          {/* `min-w` matches the trigger: Radix only guarantees the content is
              at least as wide as the trigger, and the items carry pl-8 for the
              check indicator, which eats into the label's room. */}
          <SelectContent align="end" className="min-w-[200px] rounded-xl">
            {data.map((d) => (
              <SelectItem key={d.key} value={d.key} className="rounded-lg">
                {/* A span, not a div: SelectItem puts its children inside
                    Radix's ItemText, which renders a <span>. */}
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: `var(--color-${d.key})` }}
                  />
                  {d.method}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={CHART_ID}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent hideLabel formatter={(v) => formatKes(Number(v))} />
              }
            />
            <Pie
              data={data}
              dataKey="amount"
              nameKey="method"
              innerRadius={92}
              outerRadius={118}
              strokeWidth={2}
              className="stroke-card"
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 8} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 22}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null
                  return (
                    <ChartCenterLabel
                      cx={viewBox.cx ?? 0}
                      cy={viewBox.cy ?? 0}
                      value={formatKesCompact(current.amount)}
                      caption={`${current.method} · ${share}%`}
                    />
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      {/* Every method with its figure, so identity never rests on colour and the
          two that are not selected are still readable. */}
      <CardFooter className="flex-col items-stretch gap-2 pt-4 text-sm">
        {data.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setActive(d.key)}
            aria-pressed={d.key === active}
            className="flex items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: `var(--color-${d.key})` }}
            />
            <span className="flex-1 text-muted-foreground">
              {d.method}
              <span className="ml-1.5 tabular-nums text-muted-foreground/70">
                &times;{d.count}
              </span>
            </span>
            <span className="font-medium text-foreground tabular-nums">
              {formatKes(d.amount)}
            </span>
          </button>
        ))}
      </CardFooter>
    </Card>
  )
}
