'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'
import { PromptInput } from '@/components/ui/prompt-input'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import { TOPIC } from '@/lib/dashboard/message-meta'
import type { ChatMessage, Conversation } from '@/lib/dashboard/sample-data'

/**
 * The tenant's thread with their agent.
 *
 * NOT the agent's two-pane panel. That screen exists to triage many tenants —
 * a list on the left ordered by who is owed a reply, a thread on the right. A
 * tenant has one agent, so a column of conversations to choose between would be
 * a list of one, and the pane that matters would start empty.
 *
 * When a tenant does have more than one thread — the data allows it — a compact
 * switcher appears above the messages instead of a permanent sidebar, so the
 * capability survives without the layout paying for it when there is only one.
 *
 * Messages are grouped under a date heading and sided: the tenant's own on the
 * right in the accent, the agent's on the left on a muted ground. Sides alone
 * would not be enough, so each run is also labelled with who is speaking.
 *
 * ⚠️ Nothing is sent. There is no messaging endpoint, so a composed message is
 * appended to this tab and marked as not sent. It is labelled rather than
 * silently dropped: a tenant who believes they have told their agent about a
 * sparking socket and has not is a worse outcome than a disabled box.
 */
export function TenantThread({
  conversations,
  asOf,
  agentName,
}: {
  conversations: Conversation[]
  /** ISO timestamp the relative headings are measured from. */
  asOf: string
  agentName: string
}) {
  const [activeId, setActiveId] = React.useState(conversations[0]?.id ?? '')
  const [drafts, setDrafts] = React.useState<Record<string, ChatMessage[]>>({})

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0]

  if (!active) {
    return (
      <section className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <Icon name="MessageSquare" className="h-6 w-6 text-muted-foreground" />
        <p className="font-medium text-foreground">No messages yet</p>
        <p className="max-w-[40ch] text-sm text-muted-foreground">
          Anything you send {agentName} will appear here, with their replies.
        </p>
      </section>
    )
  }

  const messages = [...active.messages, ...(drafts[active.id] ?? [])]
  const topic = TOPIC[active.topic]

  const send = (text: string) => {
    if (!text.trim()) return
    setDrafts((prev) => ({
      ...prev,
      [active.id]: [
        ...(prev[active.id] ?? []),
        {
          id: `local-${active.id}-${Date.now()}`,
          from: 'tenant',
          text: text.trim(),
          // The page's own "now", not the wall clock. Everything here is dated
          // from `asOf`, so a draft stamped with the real time landed under a
          // date heading weeks after the thread it was replying to.
          at: asOf,
        },
      ],
    }))
  }

  const localIds = new Set((drafts[active.id] ?? []).map((m) => m.id))

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent-text">
            {initials(agentName)}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{agentName}</p>
            <p className="text-xs text-muted-foreground">
              Your agent &middot; {active.unit}, {active.property}
            </p>
          </div>
        </div>

        <StatusBadge tone={topic.tone} icon={topic.icon} size="sm">
          {topic.label}
        </StatusBadge>
      </header>

      {/* Only when there is more than one — a switcher over a single thread is
          a control with nothing to switch to. */}
      {conversations.length > 1 ? (
        <div className="flex flex-wrap gap-1.5 px-5 pb-4">
          {conversations.map((c) => {
            const t = TOPIC[c.topic]
            const on = c.id === active.id
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                  on
                    ? 'bg-accent text-accent-foreground'
                    : 'border border-border text-muted-foreground hover:bg-muted',
                )}
              >
                <Icon name={t.icon} className="h-3.5 w-3.5" />
                {t.label}
                {c.unread > 0 ? (
                  <span className="tabular-nums">({c.unread})</span>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="rule-t space-y-4 px-5 py-5">
        {groupByDay(messages).map(([day, run]) => (
          <div key={day} className="space-y-3">
            <p className="text-center text-xs text-muted-foreground">
              {dayHeading(day, asOf)}
            </p>

            {run.map((m) => {
              const mine = m.from === 'tenant'
              return (
                <div
                  key={m.id}
                  className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}
                >
                  <span className="px-1 text-[11px] font-medium text-muted-foreground">
                    {mine ? 'You' : agentName}
                  </span>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm',
                      mine
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-foreground',
                    )}
                  >
                    {m.text}
                  </div>
                  <span className="px-1 text-[11px] text-muted-foreground tabular-nums">
                    {clock(m.at)}
                    {localIds.has(m.id) ? (
                      <span className="ml-1.5 font-medium text-warning-text">Not sent</span>
                    ) : null}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="rule-t p-5">
        <PromptInput
          onSubmit={(value) => send(value)}
          placeholder={`Message ${agentName.split(' ')[0]}`}
          footnote={
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Icon name="AlertTriangle" className="mt-px h-3 w-3 shrink-0 text-warning-text" />
              No messaging endpoint yet — anything you send stays in this tab and is marked
              &ldquo;not sent&rdquo;. {agentName.split(' ')[0]} will not receive it.
            </p>
          }
        />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function groupByDay(messages: ChatMessage[]): [string, ChatMessage[]][] {
  const out = new Map<string, ChatMessage[]>()
  for (const m of [...messages].sort((a, b) => a.at.localeCompare(b.at))) {
    const day = m.at.slice(0, 10)
    out.set(day, [...(out.get(day) ?? []), m])
  }
  return [...out.entries()]
}

/** "Today", "Yesterday", else "16 September 2026". */
function dayHeading(day: string, asOf: string): string {
  const today = asOf.slice(0, 10)
  if (day === today) return 'Today'

  const d = new Date(`${today}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  if (day === d.toISOString().slice(0, 10)) return 'Yesterday'

  const [y, m, dd] = day.split('-').map(Number)
  return `${dd} ${MONTHS[m - 1]} ${y}`
}

function clock(at: string): string {
  return at.slice(11, 16)
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
