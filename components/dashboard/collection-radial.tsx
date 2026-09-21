'use client'

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts'
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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { ChartCenterLabel } from '@/components/dashboard/chart-center-label'
import { formatKes, formatKesCompact } from '@/lib/format'

/**
 * Where collection stands this period, as a half radial.
 *
 * Two segments and a number in the middle. Two is the case where a radial
 * actually works: the eye compares one angle against one remainder, and the
 * value is stated in the centre anyway, so nothing depends on reading the arc
 * precisely. The same chart with six segments would be the pie chart the
 * dataviz anti-patterns rule out.
 *
 * ⚠️ Colours must be wrapped in `hsl()`. This project stores chart tokens as
 * bare HSL triplets, so the `var(--chart-1)` in the upstream shadcn block
 * resolves to `186 100% 34%`, which is not a colour and draws nothing at all.
 *
 * The two steps are the validated pair from `app/globals.css` — teal for money
 * in, rust for money still out — checked for CVD separation rather than chosen
 * by eye. Identity does not rest on colour: both segments are named in the
 * footer with their amounts, and the tooltip names them again.
 */
const chartConfig = {
  collected: { label: 'Collected', color: 'hsl(var(--chart-1))' },
  outstanding: { label: 'Still out', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig

export function CollectionRadial({
  collected,
  expected,
  periodLabel,
}: {
  collected: number
  expected: number
  periodLabel: string
}) {
  const outstanding = Math.max(expected - collected, 0)
  const rate = expected > 0 ? Math.round((collected / expected) * 100) : 0
  const data = [{ collected, outstanding }]

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Collected so far</CardTitle>
        <CardDescription>{periodLabel}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[260px]"
        >
          <RadialBarChart data={data} endAngle={180} innerRadius={80} outerRadius={130}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(v) => formatKes(Number(v))} />}
            />

            {/* A 2px surface-coloured stroke is the gap between segments, so the
                two arcs do not fuse into one shape where they meet. */}
            <RadialBar
              dataKey="collected"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-collected)"
              className="stroke-card stroke-2"
            />
            <RadialBar
              dataKey="outstanding"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-outstanding)"
              className="stroke-card stroke-2"
            />

            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null
                  return (
                    <ChartCenterLabel
                      cx={viewBox.cx ?? 0}
                      cy={viewBox.cy ?? 0}
                      offset={-18}
                      value={`${rate}%`}
                      caption={`of ${formatKesCompact(expected)} due`}
                    />
                  )
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      {/* The legend, doubling as the figures. Identity is never colour alone, so
          each swatch is followed by its name and its amount. */}
      <CardFooter className="flex-col items-stretch gap-2 pt-0 text-sm">
        <Row
          swatch="bg-[hsl(var(--chart-1))]"
          label="Collected"
          value={formatKes(collected)}
        />
        <Row
          swatch="bg-[hsl(var(--chart-4))]"
          label="Still out"
          value={formatKes(outstanding)}
        />
      </CardFooter>
    </Card>
  )
}

function Row({
  swatch,
  label,
  value,
}: {
  swatch: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-[2px] ${swatch}`} />
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}
