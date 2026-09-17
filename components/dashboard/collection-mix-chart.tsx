'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatKes } from '@/lib/format'
import type { DailyInflowPoint } from '@/lib/dashboard/sample-data'

/**
 * Daily rent inflow, split by whether it arrived on time or late.
 *
 * Structured to match the shadcn interactive area block exactly. Two things had
 * to be reconciled to get there:
 *
 * 1. This project ships the OLDER shadcn Card, whose CardHeader is
 *    `flex flex-col space-y-1.5 p-6` and CardContent `p-6 pt-0`. The block was
 *    written against the newer Card (Card itself padded, grid-based header), so
 *    its `pt-0` on Card does nothing here and its `space-y-0` fights a
 *    `space-y-1.5` that the new component does not have. The classes below
 *    reproduce the newer component's result on the older one rather than
 *    assuming either.
 *
 * 2. The block reads as smooth and flowing because it plots ~90 daily points.
 *    Monthly figures gave 12, which renders as blocky peaks no matter how the
 *    areas are styled. The data is daily now, which is also the truer shape:
 *    rent lands in a burst in the first days of a month and then trickles.
 *
 * Colours must be wrapped in hsl(): this project stores chart tokens as bare
 * HSL triplets, so a raw `var(--chart-1)` resolves to `185 81% 29%`, which is
 * not a colour and draws nothing at all.
 */
const chartConfig = {
  inflow: {
    label: 'Rent received',
  },
  onTime: {
    label: 'On time',
    color: 'hsl(var(--chart-1))',
  },
  late: {
    label: 'Late',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

export function CollectionMixChart({ data }: { data: DailyInflowPoint[] }) {
  const [timeRange, setTimeRange] = React.useState('90d')

  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    // The series ends on its own last day rather than "today", so the window is
    // stable regardless of when the page is opened.
    const referenceDate = new Date(data[data.length - 1]?.date ?? item.date)
    let daysToSubtract = 90
    if (timeRange === '30d') {
      daysToSubtract = 30
    } else if (timeRange === '7d') {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex items-center gap-2 space-y-0 pb-2 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>How rent arrives</CardTitle>
          <CardDescription>Daily rent received, on time against late</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillOnTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-onTime)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-onTime)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillLate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-late)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-late)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            {/* Three dashed lines, skipping the top edge and the baseline. The
                generator computes them from the plot offset rather than relying
                on tick count, so the spacing holds at any height. */}
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              horizontalCoordinatesGenerator={({ offset }) => {
                const top = offset?.top ?? 0
                const height = offset?.height ?? 0
                return [0.25, 0.5, 0.75].map((f) => top + height * f)
              }}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-GB', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                  formatter={(value, name) => [
                    formatKes(Number(value)),
                    chartConfig[name as keyof typeof chartConfig]?.label ?? String(name),
                  ]}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="late"
              type="natural"
              fill="url(#fillLate)"
              stroke="var(--color-late)"
              stackId="a"
            />
            <Area
              dataKey="onTime"
              type="natural"
              fill="url(#fillOnTime)"
              stroke="var(--color-onTime)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
