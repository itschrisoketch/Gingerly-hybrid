import {
  BentoCountTile,
  BentoGrid,
  BentoPanel,
  BentoRatioTile,
} from '@/components/dashboard/bento'
import { Icon } from '@/components/ui/icon'
import { formatKes } from '@/lib/format'

/**
 * The tenant home's opening block.
 *
 * Same shapes as the landlord's PortfolioBento — same grid, same panel, same
 * ratio and count tiles, out of bento.tsx — because the two halves of this
 * product should read as one. What differs is only what earns the big panel.
 *
 * For an agent that is the collection shortfall, because chasing rent is the
 * job. For a tenant it is their own rent: whether it is owed, how much, and by
 * when. Nothing else on this screen is something they can act on.
 *
 * When rent is settled the panel turns calm rather than disappearing. A tenant
 * opening this page to check whether they have paid should get an answer — an
 * empty space where the rent panel was is the one state that would leave them
 * unsure.
 *
 * The wide tile is lease progress, because it is the only ratio a tenancy has.
 * It mirrors occupancy on the landlord side, which is the same argument: a
 * ratio is not the same kind of fact as a count, so it gets a different shape.
 */

export interface TenancyBentoProps {
  /** Rent on the tenancy, in KES. */
  rent: number
  settled: boolean
  /** Period the next or current rent covers, e.g. "October 2026". */
  periodLabel: string
  /** The due date, already formatted, e.g. "1 October". */
  dueLabel: string
  /** Negative once the date has passed. */
  daysToDue: number
  /** How it was paid, when it has been. */
  paidMethod?: string
  paidAmount?: number
  /** Lease progress. */
  monthsElapsed: number
  monthsTotal: number
  leaseEndLabel: string
  openRequests: number
  documents: number
  unreadMessages: number
}

export function TenancyBento({
  rent,
  settled,
  periodLabel,
  dueLabel,
  daysToDue,
  paidMethod,
  paidAmount,
  monthsElapsed,
  monthsTotal,
  leaseEndLabel,
  openRequests,
  documents,
  unreadMessages,
}: TenancyBentoProps) {
  const pctElapsed =
    monthsTotal > 0 ? Math.round((monthsElapsed / monthsTotal) * 100) : 0
  const overdue = daysToDue < 0

  return (
    <BentoGrid id="tenancy-heading" label="Your rent and tenancy">
      {settled ? (
        <BentoPanel
          tone="calm"
          eyebrow={`${periodLabel} rent`}
          figure="Paid"
          supporting={
            <>
              {formatKes(paidAmount ?? rent)} received
              {paidMethod ? ` by ${paidMethod}` : null}
            </>
          }
        >
          <p className="relative flex items-start gap-2 text-sm text-white/80">
            <Icon name="CheckCircle" className="mt-0.5 h-5 w-5 shrink-0 text-white" />
            Nothing is owed. Your next rent is due {dueLabel}.
          </p>
        </BentoPanel>
      ) : (
        <BentoPanel
          eyebrow={overdue ? 'Overdue' : 'Rent due'}
          figure={formatKes(rent)}
          supporting={<>for {periodLabel}</>}
          action={{ href: '/dashboard/tenant/payments', label: 'Pay rent' }}
          footnote={
            overdue ? (
              <>
                <span className="tabular-nums">{Math.abs(daysToDue)}</span>{' '}
                {Math.abs(daysToDue) === 1 ? 'day' : 'days'} late
              </>
            ) : (
              <>
                due {dueLabel}, in <span className="tabular-nums">{daysToDue}</span>{' '}
                {daysToDue === 1 ? 'day' : 'days'}
              </>
            )
          }
        />
      )}

      <BentoRatioTile
        label="Lease"
        value={`${monthsElapsed} of ${monthsTotal} months`}
        percent={pctElapsed}
        caption={`ends ${leaseEndLabel}`}
      />

      <BentoCountTile label="Requests" value={String(openRequests)} icon="Wrench" />
      <BentoCountTile label="Documents" value={String(documents)} icon="FileText" />
      <BentoCountTile label="Unread" value={String(unreadMessages)} icon="MessageSquare" />
    </BentoGrid>
  )
}
