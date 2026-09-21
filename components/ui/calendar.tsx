'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Calendar, on React DayPicker.
 *
 * ⚠️ This project is on react-day-picker **8.10.1**, not 9. The current shadcn
 * calendar in the docs is written against 9 — `getDefaultClassNames`, a
 * `DayButton` component, `--cell-size`, `range_start`/`range_end` keys — and
 * none of that exists here. Pasting it in compiles and then renders an unstyled
 * grid, because every `classNames` key silently misses. The keys below
 * (`day_selected`, `day_today`, `nav_button`, `IconLeft`/`IconRight`) are the v8
 * ones. If this is ever upgraded, the whole file is rewritten, not patched.
 *
 * Restyled from the stock shadcn version on two points:
 *
 * 1. Selected is TEAL and today is an outline. The stock file has it the other
 *    way round — selected `bg-primary` (navy) and today `bg-accent` (teal) as a
 *    solid fill — which in this product reads as though today is the selection.
 *    Teal carries actions and selection everywhere else here.
 * 2. Cells are 44px, not 36px. PRODUCT.md sets a 44px floor for touch targets
 *    and a date grid is the most finger-hostile control on any screen. Seven
 *    44px columns plus padding is 332px, which still fits a 360px phone.
 *
 * Buttons are hand-rolled rather than `buttonVariants`, because that variant
 * carries `active:scale-95` and a translate on hover; a calendar grid that
 * flinches under the cursor is not the composed register PRODUCT.md asks for.
 */
export type CalendarProps = React.ComponentProps<typeof DayPicker>

const CELL = 'h-11 w-11'

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'space-y-3',
        caption: 'relative flex items-center justify-center pt-1',
        caption_label: 'text-sm font-medium text-foreground',
        nav: 'flex items-center',
        nav_button: cn(
          'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground',
          'transition-colors hover:bg-muted hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
          'disabled:pointer-events-none disabled:opacity-40',
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse',
        head_row: 'flex',
        head_cell: cn(
          CELL,
          'flex items-center justify-center text-xs font-medium uppercase tracking-wider text-muted-foreground',
        ),
        row: 'flex w-full',
        cell: cn(
          CELL,
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
          '[&:has([aria-selected])]:bg-accent/10 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg',
        ),
        day: cn(
          CELL,
          'rounded-lg p-0 font-normal tabular-nums text-foreground transition-colors',
          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
          'aria-selected:opacity-100',
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-accent font-medium text-accent-foreground hover:bg-accent focus:bg-accent',
        // An outline, not a fill: today is a reference point, not a selection.
        day_today: 'border border-accent/60 font-medium text-foreground',
        day_outside: 'text-muted-foreground/50 aria-selected:text-muted-foreground',
        day_disabled: 'text-muted-foreground/40 line-through',
        day_range_middle: 'aria-selected:bg-accent/10 aria-selected:text-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <Icon name="ChevronLeft" className="h-4 w-4" />,
        IconRight: () => <Icon name="ChevronRight" className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
