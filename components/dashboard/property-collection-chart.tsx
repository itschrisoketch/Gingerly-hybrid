'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Icon } from '@/components/ui/icon'
import { formatKes, formatKesCompact } from '@/lib/format'
import type { Payment } from '@/lib/dashboard/sample-data'

/**
 * Rent due by property, split into what arrived and what did not.
 *
 * Stacked rather than a single bar, because the height an agent wants to compare
 * is the rent the property SHOULD produce, and the question inside it is how
 * much of that showed up. A plain bar of "collected" hides the shortfall
 * completely: a property that billed 600,000 and collected 437,000 looks merely
 * smaller than one that billed 437,000 and collected all of it.
 *
 * Stacking is legal here because the segments are genuine parts of one total —
 * collected + still out = due, exactly, for every bar. That is the only case
 * stacking is honest in; stacking unrelated measures is the anti-pattern.
 *
 * Sorted by rent due, so the bars descend and the eye reads the portfolio's
 * shape. The rust caps are then the only thing that breaks the slope, which is
 * what makes the three shortfalls findable without reading a number.
 *
 * ⚠️ `hsl()` wrapper required: this project stores chart tokens as bare HSL
 * triplets, so the upstream block's `var(--chart-1)` draws nothing.
 *
 * Twelve categories do not fit a phone, so the plot keeps a minimum width and
 * the card scrolls horizontally rather than crushing the labels to nothing.
 */
const chartConfig = {
  collected: { label: 'Collected', color: 'hsl(var(--chart-1))' },
  outstanding: { label: 'Still out', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig

interface Row {
  property: string
  short: string
  collected: number
  outstanding: number
  due: number
  rate: number
}

/** "Brookside Apartments" -> "Brookside". The tooltip carries the full name. */
function shortName(name: string): string {
  const first = name.split(' ')[0]
  return first.length > 11 ? `${first.slice(0, 10)}…` : first
}

export function PropertyCollectionChart({ payments }: { payments: Payment[] }) {
  const rows = React.useMemo<Row[]>(() => {
    const byProperty = new Map<string, { collected: number; due: number }>()
    for (const p of payments) {
      const row = byProperty.get(p.property) ?? { collected: 0, due: 0 }
      row.due += p.amount
      if (p.status === 'paid') row.collected += p.amount
      byProperty.set(p.property, row)
    }

    return [...byProperty.entries()]
      .map(([property, v]) => ({
        property,
        short: shortName(property),
        collected: v.collected,
        outstanding: v.due - v.collected,
        due: v.due,
        rate: v.due > 0 ? Math.round((v.collected / v.due) * 100) : 0,
      }))
      .sort((a, b) => b.due - a.due)
  }, [payments])

  const behind = rows.filter((r) => r.outstanding > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rent by property</CardTitle>
        <CardDescription>
          What each property is due this period, and how much of it arrived
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <ChartContainer config={chartConfig} className="h-[340px] w-full min-w-[640px]">
            <BarChart accessibilityLayer data={rows} margin={{ left: 4, right: 4, top: 8 }}>
              {/* Dashed, matching the dashboard's chart grid. */}
              <CartesianGrid vertical={false} strokeDasharray="4 4" />

              <XAxis
                dataKey="short"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                interval={0}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={58}
                tickFormatter={(v: number) => formatKesCompact(v)}
                className="text-xs"
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelKey="property"
                    formatter={(value, name, item) => {
                      const r = item?.payload as Row | undefined
                      const label = chartConfig[name as keyof typeof chartConfig]?.label ?? name
                      return (
                        <span className="flex w-full justify-between gap-4">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium tabular-nums">
                            {formatKes(Number(value))}
                            {r && name === 'collected' ? (
                              <span className="ml-1.5 font-normal text-muted-foreground">
                                {r.rate}%
                              </span>
                            ) : null}
                          </span>
                        </span>
                      )
                    }}
                  />
                }
              />

              <ChartLegend content={<ChartLegendContent />} />

              {/* A surface-coloured stroke is the 2px gap between the two
                  segments, so a full bar does not fuse into one block. */}
              <Bar
                dataKey="collected"
                stackId="a"
                fill="var(--color-collected)"
                radius={[0, 0, 4, 4]}
                className="stroke-card stroke-2"
              />
              <Bar
                dataKey="outstanding"
                stackId="a"
                fill="var(--color-outstanding)"
                radius={[4, 4, 0, 0]}
                className="stroke-card stroke-2"
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        {behind.length === 0 ? (
          <span className="flex items-center gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 text-success-text" />
            Every property collected in full
          </span>
        ) : (
          <span className="flex items-start gap-2">
            <Icon name="AlertTriangle" className="mt-px h-4 w-4 shrink-0 text-warning-text" />
            <span>
              <span className="tabular-nums">{behind.length}</span>{' '}
              {behind.length === 1 ? 'property is' : 'properties are'} short by{' '}
              <span className="font-medium text-foreground tabular-nums">
                {formatKes(behind.reduce((n, r) => n + r.outstanding, 0))}
              </span>{' '}
              &mdash; {behind.map((r) => `${r.property} (${r.rate}%)`).join(', ')}
            </span>
          </span>
        )}
      </CardFooter>
    </Card>
  )
}
