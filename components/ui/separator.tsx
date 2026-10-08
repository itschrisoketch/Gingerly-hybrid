"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        // A dashed BORDER, not a solid `bg-border` block. Separators are dashed
        // everywhere in this product, and a 1px filled div cannot be dashed —
        // it has to be a border to take a dash pattern. Height/width go to zero
        // because the border itself now supplies the line's thickness.
        "shrink-0 border-dashed border-border",
        orientation === "horizontal" ? "h-0 w-full border-t" : "h-full w-0 border-l",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
