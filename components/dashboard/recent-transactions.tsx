import { LedgerTable, type LedgerRow } from '@/components/dashboard/ledger-table'
import { formatRelativeTime } from '@/lib/format'
import type { Transaction } from '@/lib/dashboard/sample-data'

/**
 * The agent's recent payments.
 *
 * The table itself now lives in ledger-table.tsx, because the tenant home shows
 * the same object about their own rent. This file is only the mapping and the
 * copy: for an agent the first column is WHO paid, and "when" is relative,
 * because they are watching today rather than reading back over a year.
 */
export function RecentTransactions({ rows }: { rows: Transaction[] }) {
  const ledger: LedgerRow[] = rows.map((r) => ({
    id: r.id,
    primary: r.tenant,
    secondary: `${r.unit}, ${r.property}`,
    method: r.method,
    at: r.at,
    status: r.status,
    note: r.note,
    amount: r.amount,
  }))

  return (
    <LedgerTable
      title="Recent payments"
      description="Across all properties"
      primaryHeading="Tenant"
      rows={ledger}
      href="/dashboard/landlord/payments"
      viewAllLabel="View all payments"
      formatWhen={formatRelativeTime}
      empty={{
        title: 'No payments yet this period',
        detail:
          'Payments appear here as tenants pay, usually within a minute of an M-Pesa confirmation.',
      }}
    />
  )
}
