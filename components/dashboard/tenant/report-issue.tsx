import { Icon } from '@/components/ui/icon'
import { UnavailableButton } from '@/components/ui/unavailable-button'
import { CATEGORY, CATEGORY_ORDER } from '@/lib/dashboard/maintenance-meta'

/**
 * Report a problem with the unit.
 *
 * The form the old page had, kept rather than replaced with a phone number.
 * That was the wrong call: deleting a feature because its endpoint is missing
 * loses the fact that it is meant to exist, and the next person reads the page
 * as the spec. Every field survives — what it is, where, how urgent, the
 * description, and how to be contacted about it.
 *
 * Shown disabled, with the reason once above the fields rather than on each of
 * them, and the submit carrying it too. Disabled rather than live because a
 * form that accepts what someone types about a fault in their home and then
 * drops it is worse than one that admits it cannot send yet — and the phone
 * number is right there, so there is a route that works.
 *
 * The types come from maintenance-meta's CATEGORY, so the list someone picks
 * from is the list their request can actually be filed under. The original form
 * offered "HVAC", which matches nothing in the records and means little for a
 * Nairobi apartment with no central heating or air conditioning.
 */
const FIELD =
  'h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm text-muted-foreground disabled:cursor-not-allowed'

export function ReportIssue({
  agentName,
  agentPhone,
}: {
  agentName: string
  agentPhone: string
}) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="p-5 pb-4">
        <h2 className="text-sm font-medium text-foreground">Report a problem</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          What is wrong, where it is, and how urgent.
        </p>
      </header>

      <div className="mx-5 mb-5 flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3">
        <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          This cannot be submitted yet — there is no maintenance endpoint. Call{' '}
          <span className="font-medium text-foreground">{agentName}</span> on{' '}
          <a
            href={`tel:${agentPhone.replace(/\s/g, '')}`}
            className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
          >
            <span className="tabular-nums">{agentPhone}</span>
          </a>{' '}
          and it will appear in your list once logged.
        </p>
      </div>

      <div className="space-y-4 px-5 pb-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="issue-type" label="What kind of problem">
            <select id="issue-type" disabled className={FIELD}>
              <option>Choose a type</option>
              {CATEGORY_ORDER.map((c) => (
                <option key={c}>{CATEGORY[c].label}</option>
              ))}
            </select>
          </Field>

          <Field id="issue-priority" label="How urgent">
            <select id="issue-priority" disabled className={FIELD}>
              <option>Choose a priority</option>
              <option>Low — can wait</option>
              <option>Normal — within a few days</option>
              <option>Urgent — unsafe or unusable</option>
            </select>
          </Field>
        </div>

        <Field id="issue-title" label="Title">
          <input
            id="issue-title"
            disabled
            placeholder="Brief description of the issue"
            className={FIELD}
          />
        </Field>

        <Field id="issue-where" label="Where in the unit">
          <input id="issue-where" disabled placeholder="Kitchen, bathroom, bedroom…" className={FIELD} />
        </Field>

        <Field id="issue-detail" label="Details">
          <textarea
            id="issue-detail"
            disabled
            rows={3}
            placeholder="Anything that would help whoever comes to fix it"
            className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground disabled:cursor-not-allowed"
          />
        </Field>

        <Field id="issue-contact" label="How should we reach you">
          <select id="issue-contact" disabled className={FIELD}>
            <option>Choose a way</option>
            <option>Phone call</option>
            <option>SMS</option>
            <option>A message in Gingerly</option>
          </select>
        </Field>

        <UnavailableButton
          icon="Send"
          reason="No maintenance endpoint yet — call your agent instead"
          className="w-full sm:w-auto"
        >
          Send request
        </UnavailableButton>
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}
