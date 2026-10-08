"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

/**
 * The on/off switch.
 *
 * Two things were wrong with what this replaced, and they are worth recording
 * so neither comes back.
 *
 * 1. COLOUR WAS ON THE KNOB. The track carried a 15% tint and the knob was
 *    solid teal. Every platform switch — iOS, Material, macOS, shadcn's own
 *    default — fills the TRACK when on and leaves the knob neutral, so a pale
 *    track with a coloured dot reads as "off with a marker on it". The track
 *    now fills.
 *
 * 2. THE FILL IS INK, NOT TEAL. Teal is this product's action colour (see
 *    DESIGN.md) and a row of five filled teal pills read as a row of buttons.
 *    `--foreground` is navy in light and near-white in dark, so the track
 *    inverts with the theme on its own and never competes with a teal Save
 *    button sitting under it.
 *
 * GEOMETRY. The thumb is a flex item in normal flow, positioned by padding and
 * a transform. It is deliberately NOT absolutely positioned: the hand-rolled
 * copy of this control in settings-shell.tsx was `absolute` with no `left`, so
 * it fell back to its static position, and a <button> inherits
 * `text-align: center` from the UA stylesheet — which put that static position
 * at the track's midpoint (21px) before the 23px transform pushed it a further
 * 19px clean outside the track. Flow layout cannot express that bug.
 *
 * Track 44x24 with a 1px border and 2px of padding leaves 38px of travel for an
 * 18px thumb, so `translate-x-5` (20px) lands it flush against the inner edge
 * with 2px to spare on both sides. The border is present in both states so the
 * geometry never shifts as it toggles.
 *
 * CONTRAST, computed rather than judged, as DESIGN.md requires (3:1 for a
 * non-text indicator):
 *   light  on  knob --background on track --foreground        14.54:1
 *   light  off knob --muted-foreground on track --muted        4.47:1
 *   dark   on  knob --background on track --foreground         14.5:1
 *   dark   off knob --muted-foreground on track --muted         4.99:1
 * The off knob is a solid mid-grey rather than white on purpose: white on
 * `--muted` measures 1.09:1, which is invisible.
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border p-0.5",
      "transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:border-foreground data-[state=checked]:bg-foreground",
      "data-[state=unchecked]:border-border data-[state=unchecked]:bg-muted",
      // Hover only means anything while it is off — on, the track is already solid.
      "data-[state=unchecked]:hover:border-muted-foreground/40",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-[18px] w-[18px] rounded-full shadow-sm ring-0",
        "transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        "data-[state=checked]:bg-background data-[state=unchecked]:bg-muted-foreground"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
