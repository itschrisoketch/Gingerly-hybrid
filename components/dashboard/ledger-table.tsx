import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { CopyButton } from '@/components/ui/copy-button'
import { StatusBadge, type StatusTone } from '@/components/ui/status-badge'
import type { IconName } from '@/lib/icons/icon-map'
import { cn } from '@/lib/utils'
import { formatKes } from '@/lib/format'
import type { PaymentStatus, TxMethod } from '@/lib/dashboard/sample-data'

/**
 * A run of payments, as a table on a screen and as cards on a phone.
 *
 * Extracted from recent-transactions.tsx when the tenant home needed the same
 * object. The two differ only in what the first column is — an agent is looking
 * at *who* paid, a tenant at *which month* — so that is a prop rather than a
 * second component. Everything that makes this table what it is, the dashed row
 * rules, the failed-amount strikethrough, the phone layout and the two
 * placements of "View all", is shared.
 *
 * `StatusBadge` carries both a tone and a word, so status is never signalled by
 * colour alone — PRODUCT.md rule 5.
 */

export interface LedgerRow {
  id: string
  /** First column, bold: a tenant's name, or the period a payment covers. */
  primary: string
  /** Under it, quieter: the unit and property, or the M-Pesa reference. */
  secondary?: string
  /**
   * Set when `secondary` is a payment reference rather than a description. It
   * gets a copy control, because a reference is the one string here meant to
   * leave the screen — a tenant sends it to their agent when a payment has not
   * landed. `copyLabel` names it in the button's accessible name.
   */
  copyable?: boolean
  copyLabel?: string
  method?: TxMethod
  /** ISO timestamp. Absent where nothing was attempted. */
  at?: string
  status: PaymentStatus
  /** Why it failed, or why the amount is unusual. */
  note?: string
  amount: number
}

/**
 * The status pill, matching payments-table.tsx exactly — same words, same
 * tones, same icons, same hint on `failed`.
 *
 * The icons are load-bearing rather than decorative. PRODUCT.md rule 5: the
 * state must not be carried by colour alone, and while the label already names
 * it, `failed` and `late` share the `danger` tone and are only told apart at a
 * glance by the mark beside the word.
 *
 * Tones are the contrast-checked `-text` tokens, since `--success` and
 * `--warning` are fill colours and measure 3.33 and 2.79 against the 4.5 floor
 * when used as text.
 */
const STATUS: Record<
  PaymentStatus,
  { label: string; tone: StatusTone; icon: IconName; hint?: string }
> = {
  late: { label: 'Late', tone: 'danger', icon: 'AlertTriangle' },
  failed: {
    label: 'Failed',
    tone: 'danger',
    icon: 'XCircle',
    hint: 'Attempted, did not go through',
  },
  pending: { label: 'Pending', tone: 'warning', icon: 'Clock' },
  paid: { label: 'Paid', tone: 'success', icon: 'CheckCircle' },
}

function StatusPill({ status }: { status: PaymentStatus }) {
  const s = STATUS[status]
  return (
    <StatusBadge tone={s.tone} icon={s.icon} title={s.hint}>
      {s.label}
    </StatusBadge>
  )
}

/**
 * The method, as the M-Pesa mark where it is M-Pesa.
 *
 * The asset is a flat PNG with no alpha, so it carries its own white ground.
 * That is invisible on the light card and a white slab in dark mode, hence the
 * explicit white chip around it — the ground becomes deliberate rather than an
 * artefact, and the mark keeps the clear space a logo is supposed to have.
 *
 * The name stays in the accessible name rather than beside the mark: the column
 * already has a heading, and "M-Pesa M-PESA" is what a screen reader would
 * otherwise announce.
 */
function MethodCell({ method }: { method?: TxMethod }) {
  if (!method) return <span className="text-muted-foreground">—</span>
  if (method !== 'M-Pesa') return <span className="text-muted-foreground">{method}</span>

  return (
    <span className="inline-flex items-center rounded-md bg-white px-2 py-1.5 ring-1 ring-border">
      <Image
        src="/mpesa-logo.png"
        alt="M-Pesa"
        width={270}
        height={148}
        className="h-5 w-auto"
        unoptimized
      />
    </span>
  )
}

export function LedgerTable({
  title,
  description,
  primaryHeading,
  whenHeading = 'When',
  rows,
  href,
  viewAllLabel,
  formatWhen,
  empty,
}: {
  title: string
  description: string
  /** Heading over the first column, e.g. "Tenant" or "Period". */
  primaryHeading: string
  whenHeading?: string
  rows: LedgerRow[]
  /** Omit on a page that IS the full list — it should not link to itself. */
  href?: string
  viewAllLabel?: string
  /** How a timestamp reads on this screen — relative for an agent watching
   *  today, an actual date for a tenant looking back over a year. */
  formatWhen: (at: string) => string
  empty: { title: string; detail: string }
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex items-center gap-2 space-y-0 pb-2 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {href ? (
          <Link
            href={href}
            className="hidden h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:ml-auto sm:flex"
          >
            View all
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        ) : null}
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <Icon name="CreditCard" className="h-6 w-6 text-muted-foreground" />
            <p className="font-medium text-foreground">{empty.title}</p>
            <p className="max-w-[40ch] text-sm text-muted-foreground">{empty.detail}</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    {[primaryHeading, 'Method', whenHeading, 'Status'].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="pb-3 pr-6 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                    <th
                      scope="col"
                      className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-dashed border-border transition-colors last:border-b-0 hover:bg-muted/40"
                    >
                      <th scope="row" className="py-3 pr-6 text-left font-normal">
                        <span className="block font-medium text-foreground">{row.primary}</span>
                        {row.secondary ? (
                          row.copyable ? (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <span className="tabular-nums">{row.secondary}</span>
                              <CopyButton
                                value={row.secondary}
                                label={row.copyLabel ?? 'reference'}
                              />
                            </span>
                          ) : (
                            <span className="block text-muted-foreground">{row.secondary}</span>
                          )
                        ) : null}
                      </th>
                      <td className="whitespace-nowrap py-3 pr-6">
                        <MethodCell method={row.method} />
                      </td>
                      <td className="whitespace-nowrap py-3 pr-6 text-muted-foreground tabular-nums">
                        {row.at ? formatWhen(row.at) : '—'}
                      </td>
                      <td className="py-3 pr-6">
                        <StatusPill status={row.status} />
                        {row.note ? (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {row.note}
                          </span>
                        ) : null}
                      </td>
                      <td
                        className={cn(
                          'whitespace-nowrap py-3 text-right font-medium tabular-nums',
                          row.status === 'failed'
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground',
                        )}
                      >
                        {formatKes(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Below sm the same rows become label/value cards. */}
            <ul className="sm:hidden">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="space-y-2 border-b border-dashed border-border px-3 py-3 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{row.primary}</p>
                      {row.secondary ? (
                        row.copyable ? (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span className="truncate tabular-nums">{row.secondary}</span>
                            <CopyButton
                              value={row.secondary}
                              label={row.copyLabel ?? 'reference'}
                            />
                          </span>
                        ) : (
                          <p className="truncate text-sm text-muted-foreground">{row.secondary}</p>
                        )
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        'shrink-0 font-medium tabular-nums',
                        row.status === 'failed'
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground',
                      )}
                    >
                      {formatKes(row.amount)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <StatusPill status={row.status} />
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
                      <MethodCell method={row.method} />
                      {row.at ? <span>&middot; {formatWhen(row.at)}</span> : null}
                    </span>
                  </div>

                  {row.note ? <p className="text-sm text-muted-foreground">{row.note}</p> : null}
                </li>
              ))}
            </ul>

            {/* The header's "View all" is hidden below sm, so the link lives here
                on a phone rather than being unreachable. */}
            {href ? (
              <Link
                href={href}
                className="mt-2 flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:hidden"
              >
                {viewAllLabel}
                <Icon name="ArrowRight" className="h-4 w-4" />
              </Link>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
