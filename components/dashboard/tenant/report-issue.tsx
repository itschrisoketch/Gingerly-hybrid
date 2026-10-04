'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { CATEGORY, CATEGORY_ORDER } from '@/lib/dashboard/maintenance-meta'

/**
 * Report a problem with the unit.
 *
 * The form the old page had, kept rather than replaced with a phone number —
 * deleting a feature because its endpoint is missing loses the fact that it is
 * meant to exist, and the next person reads the page as the spec.
 *
 * FILLABLE, not disabled. It was disabled first, on the reasoning that a form
 * which drops what someone types is worse than one that admits it cannot send.
 * That is true of silently dropping it, but a form nobody can type into cannot
 * be tested or reviewed either. So every field works and keeps what is entered;
 * the honesty moved to the moment of submitting, where the entry is kept on
 * screen and plainly marked as not sent, with the agent's number beside it.
 *
 * The two dropdowns are the shared Select, like the settings forms and the
 * calendar dialog, not bare `<select>`s. Natives were used first and their
 * arrow sat hard against the placeholder with no clearance — "Choose a
 * priority" ran straight into the chevron — because the field's `px-3` leaves
 * 12px on a side the browser also wants for its own control.
 *
 * They also stack rather than sitting side by side. This renders in a third of
 * the page, and two selects sharing that width left each about 150px, which is
 * narrower than their own placeholder text.
 */
const FIELD =
  'h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40'

const PRIORITIES = [
  { value: 'low', label: 'Low — can wait' },
  { value: 'normal', label: 'Normal — within a few days' },
  { value: 'urgent', label: 'Urgent — unsafe or unusable' },
]

const CONTACT = [
  { value: 'call', label: 'Phone call' },
  { value: 'sms', label: 'SMS' },
  { value: 'app', label: 'A message in Gingerly' },
]

export function ReportIssue({
  agentName,
  agentPhone,
}: {
  agentName: string
  agentPhone: string
}) {
  const [category, setCategory] = React.useState('')
  const [priority, setPriority] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [where, setWhere] = React.useState('')
  const [detail, setDetail] = React.useState('')
  const [contact, setContact] = React.useState('')
  const [attempted, setAttempted] = React.useState(false)

  const canSubmit = title.trim().length > 0 && category !== ''

  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="p-5 pb-4">
        <h2 className="text-sm font-medium text-foreground">Report a problem</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          What is wrong, where it is, and how urgent.
        </p>
      </header>

      <form
        className="space-y-4 px-5 pb-5"
        onSubmit={(e) => {
          e.preventDefault()
          setAttempted(true)
        }}
      >
        <div className="space-y-1.5">
          <label htmlFor="issue-type" className="block text-sm font-medium text-foreground">
            What kind of problem
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="issue-type" className={FIELD}>
              <SelectValue placeholder="Choose a type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {CATEGORY_ORDER.map((c) => (
                <SelectItem key={c} value={c} className="rounded-lg">
                  {CATEGORY[c].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="issue-priority" className="block text-sm font-medium text-foreground">
            How urgent
          </label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="issue-priority" className={FIELD}>
              <SelectValue placeholder="Choose a priority" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value} className="rounded-lg">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="issue-title" className="block text-sm font-medium text-foreground">
            Title
          </label>
          <input
            id="issue-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue"
            className={FIELD}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="issue-where" className="block text-sm font-medium text-foreground">
            Where in the unit
          </label>
          <input
            id="issue-where"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Kitchen, bathroom, bedroom…"
            className={FIELD}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="issue-detail" className="block text-sm font-medium text-foreground">
            Details
          </label>
          <textarea
            id="issue-detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            placeholder="Anything that would help whoever comes to fix it"
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="issue-contact" className="block text-sm font-medium text-foreground">
            How should we reach you
          </label>
          <Select value={contact} onValueChange={setContact}>
            <SelectTrigger id="issue-contact" className={FIELD}>
              <SelectValue placeholder="Choose a way" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {CONTACT.map((c) => (
                <SelectItem key={c.value} value={c.value} className="rounded-lg">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
            canSubmit
              ? 'bg-accent text-accent-foreground hover:bg-accent/90'
              : 'cursor-not-allowed border border-border text-muted-foreground opacity-50',
          )}
        >
          <Icon name="Send" className="h-4 w-4" />
          Send request
        </button>

        {/* The honest moment. What was typed stays on screen — nothing is
            cleared — and the route that does work is right here. */}
        {attempted ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-dashed border-warning/40 bg-warning/5 px-4 py-3"
          >
            <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 shrink-0 text-warning-text" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Not sent.</span> There is no
              maintenance endpoint yet, so this stayed in your browser. Your answers are still
              here — call{' '}
              <span className="font-medium text-foreground">{agentName}</span> on{' '}
              <a
                href={`tel:${agentPhone.replace(/\s/g, '')}`}
                className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
              >
                <span className="tabular-nums">{agentPhone}</span>
              </a>{' '}
              and read them out.
            </p>
          </div>
        ) : (
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Icon name="Info" className="mt-px h-3.5 w-3.5 shrink-0" />
            Requests cannot be submitted yet — there is no maintenance endpoint. Call{' '}
            {agentName} on <span className="tabular-nums">{agentPhone}</span>.
          </p>
        )}
      </form>
    </section>
  )
}
