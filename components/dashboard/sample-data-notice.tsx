import { StatusBadge } from '@/components/ui/status-badge'

/**
 * A small mark beside the page title, for as long as the figures are invented.
 *
 * This was a full-width paragraph on every screen. Three dashboards opening with
 * the same block of explanatory text pushed the actual content below the fold
 * and stopped being read by the second page, which is the failure mode of any
 * warning that repeats.
 *
 * It is not removed altogether, because PRODUCT.md rule 2 is specifically about
 * this: a plausible number on a rent dashboard is indistinguishable from a real
 * one, and what rides on the difference is somebody's housing. The chip is the
 * smallest thing that still says "do not act on these". The full sentence moved
 * into the tooltip and to screen-reader text, so nothing is lost, only quieter.
 */
export function SampleDataChip({ detail }: { detail?: string }) {
  const text =
    detail ??
    'These figures are placeholders for design review. No endpoint exists yet, so nothing here reflects real accounts.'

  return (
    <StatusBadge tone="warning" icon="AlertTriangle" title={text}>
      Sample data
      <span className="sr-only">. {text}</span>
    </StatusBadge>
  )
}
