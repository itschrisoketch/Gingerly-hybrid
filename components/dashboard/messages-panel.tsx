'use client'

import * as React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { PromptInput } from '@/components/ui/prompt-input'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TOPIC,
  TOPIC_ORDER,
  awaitingReply,
  byPriority,
  lastMessage,
} from '@/lib/dashboard/message-meta'
import { formatRelativeTime, initials } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ChatMessage, Conversation, MessageTopic } from '@/lib/dashboard/sample-data'

/**
 * Tenant conversations: the list, and the thread.
 *
 * Two panes on a laptop, one at a time on a phone — the list until you pick
 * someone, the thread until you go back. That is what the original did and it is
 * the right shape; a 320px column of conversations beside a 340px thread on a
 * phone is neither.
 *
 * Conversations are ordered by what is OWED, not by what is newest. Anything
 * whose last message came from the tenant sits above everything else, because an
 * unanswered tenant is the only state on this screen that needs a decision. That
 * is derived from the thread rather than stored, so it cannot go stale.
 *
 * ⚠️ Replies are not sent anywhere. There is no messaging endpoint, so a sent
 * message is appended to the thread in this tab and marked as such. It is
 * labelled rather than silently dropped, because a landlord who believes they
 * answered a tenant about a sparking socket and did not is a worse outcome than
 * a disabled box.
 */
type TopicFilter = 'all' | MessageTopic

export function MessagesPanel({
  conversations,
  asOf,
}: {
  conversations: Conversation[]
  /** ISO date the relative timestamps are measured from. */
  asOf: string
}) {
  const now = React.useMemo(() => new Date(asOf), [asOf])

  const [topic, setTopic] = React.useState<TopicFilter>('all')
  const [query, setQuery] = React.useState('')
  const [onlyOwed, setOnlyOwed] = React.useState(false)
  const [drafts, setDrafts] = React.useState<Record<string, ChatMessage[]>>({})
  const [composed, setComposed] = React.useState('')

  const ordered = React.useMemo(() => [...conversations].sort(byPriority), [conversations])

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return ordered.filter((c) => {
      if (topic !== 'all' && c.topic !== topic) return false
      if (onlyOwed && !awaitingReply(c)) return false
      if (!q) return true
      return (
        c.tenant.toLowerCase().includes(q) ||
        c.property.toLowerCase().includes(q) ||
        c.unit.toLowerCase().includes(q) ||
        c.messages.some((m) => m.text.toLowerCase().includes(q))
      )
    })
  }, [ordered, topic, query, onlyOwed])

  // The first conversation that still owes a reply, so the screen opens on work.
  const [selectedId, setSelectedId] = React.useState(() => ordered[0]?.id ?? '')
  const [showThread, setShowThread] = React.useState(false)

  const selected = conversations.find((c) => c.id === selectedId) ?? rows[0] ?? ordered[0]

  const thread = React.useMemo(() => {
    if (!selected) return []
    return [...selected.messages, ...(drafts[selected.id] ?? [])]
  }, [selected, drafts])

  const owedCount = ordered.filter(awaitingReply).length

  function send(raw: string, attachments: File[] = []) {
    const text = raw.trim()
    if ((!text && attachments.length === 0) || !selected) return

    // Attachments have nowhere to upload to, so they are named in the message
    // rather than silently dropped — the agent can see what they tried to send.
    const note =
      attachments.length > 0
        ? `\n\n[${attachments.length} photo${attachments.length === 1 ? '' : 's'}: ${attachments
            .map((f) => f.name)
            .join(', ')}]`
        : ''

    setDrafts((d) => ({
      ...d,
      [selected.id]: [
        ...(d[selected.id] ?? []),
        {
          id: `draft-${selected.id}-${Date.now()}`,
          from: 'agent',
          text: text + note,
          at: new Date().toISOString(),
        },
      ],
    }))
  }

  if (!selected) return null

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* Conversation list */}
      <Card
        className={cn('flex max-h-[640px] flex-col overflow-hidden', showThread && 'hidden lg:flex')}
      >
        <div className="rule-b space-y-3 p-4">
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <Icon name="Search" className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people or messages"
              aria-label="Search conversations by tenant, property or message text"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={topic} onValueChange={(v) => setTopic(v as TopicFilter)}>
              <SelectTrigger
                aria-label="Filter by topic"
                className="h-9 flex-1 rounded-lg border-border bg-card text-sm focus:ring-2 focus:ring-accent/40 focus:ring-offset-0 [&>span]:line-clamp-none [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span]:whitespace-nowrap"
              >
                <SelectValue placeholder="All topics" />
              </SelectTrigger>
              <SelectContent className="min-w-[200px] rounded-xl">
                <SelectItem value="all" className="rounded-lg">
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <Icon name="Filter" className="h-4 w-4 text-muted-foreground" />
                    All topics
                  </span>
                </SelectItem>
                {TOPIC_ORDER.map((t) => (
                  <SelectItem key={t} value={t} className="rounded-lg">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <Icon name={TOPIC[t].icon} className="h-4 w-4 text-muted-foreground" />
                      {TOPIC[t].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              type="button"
              aria-pressed={onlyOwed}
              onClick={() => setOnlyOwed((v) => !v)}
              className={cn(
                'flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                onlyOwed
                  ? 'border-accent bg-accent/10 text-accent-text'
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              Needs reply
              <span className="tabular-nums">{owedCount}</span>
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <Icon name="MessageSquare" className="h-6 w-6 text-muted-foreground" />
            <p className="font-medium text-foreground">No conversations match</p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setTopic('all')
                setOnlyOwed(false)
              }}
              className="mt-1 h-9 rounded-lg px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {rows.map((c) => {
              const last = lastMessage(c)
              const owed = awaitingReply(c)
              const active = c.id === selected.id
              return (
                <li key={c.id} className="rule-b">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(c.id)
                      setShowThread(true)
                    }}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'flex w-full gap-3 p-4 text-left transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40',
                      active ? 'bg-accent/[0.07]' : 'hover:bg-muted/50',
                    )}
                  >
                    <Avatar size="sm" className="mt-0.5">
                      <AvatarFallback>{initials(c.tenant)}</AvatarFallback>
                    </Avatar>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-medium text-foreground">{c.tenant}</span>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                          {last ? formatRelativeTime(last.at, now).split(',')[0] : ''}
                        </span>
                      </span>

                      <span className="block truncate text-xs text-muted-foreground">
                        {c.unit}, {c.property}
                      </span>

                      <span className="mt-1 block truncate text-sm text-muted-foreground">
                        {last?.from === 'agent' ? 'You: ' : ''}
                        {last?.text}
                      </span>

                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <StatusBadge tone={TOPIC[c.topic].tone} icon={TOPIC[c.topic].icon} size="sm">
                          {TOPIC[c.topic].label}
                        </StatusBadge>
                        {owed ? (
                          <StatusBadge tone="danger" icon="ArrowLeft" size="sm">
                            Needs reply
                          </StatusBadge>
                        ) : null}
                        {c.unread > 0 ? (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-foreground tabular-nums">
                            {c.unread}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {/* Thread */}
      <Card
        className={cn(
          'flex max-h-[640px] flex-col overflow-hidden',
          !showThread && 'hidden lg:flex',
        )}
      >
        <div className="rule-b flex items-center gap-3 p-4">
          <button
            type="button"
            onClick={() => setShowThread(false)}
            aria-label="Back to conversations"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:hidden"
          >
            <Icon name="ArrowLeft" className="h-4 w-4" />
          </button>

          <Avatar>
            <AvatarFallback>{initials(selected.tenant)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{selected.tenant}</p>
            <p className="truncate text-sm text-muted-foreground">
              {selected.unit}, {selected.property}
            </p>
          </div>

          <StatusBadge tone={TOPIC[selected.topic].tone} icon={TOPIC[selected.topic].icon}>
            {TOPIC[selected.topic].label}
          </StatusBadge>
        </div>

        <ol className="flex-1 space-y-3 overflow-y-auto p-4">
          {thread.map((m) => (
            <li
              key={m.id}
              className={cn('flex', m.from === 'agent' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[70%]',
                  m.from === 'agent'
                    ? 'rounded-br-md bg-accent text-accent-foreground'
                    : 'rounded-bl-md bg-muted text-foreground',
                )}
              >
                <p className="whitespace-pre-wrap text-sm">{m.text}</p>
                <p
                  className={cn(
                    'mt-1 text-[11px] tabular-nums',
                    m.from === 'agent' ? 'text-accent-foreground/70' : 'text-muted-foreground',
                  )}
                >
                  {formatRelativeTime(m.at, now)}
                  {m.id.startsWith('draft-') ? ' · not sent' : ''}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* The composer is the adapted PromptInput: it carries photo attachments
            — a tenant reporting a leak wants a picture back — and dictation,
            which matters for an agent replying from a property rather than a
            desk. Keyed on the conversation so switching tenants clears any
            half-written reply rather than carrying it to the wrong person. */}
        <div className="rule-t p-4">
          <PromptInput
            key={selected.id}
            placeholder={`Reply to ${selected.tenant.split(' ')[0]}…`}
            onSubmit={(text, meta) => send(text, meta.attachments)}
            footnote={
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Icon name="AlertTriangle" className="mt-px h-3 w-3 shrink-0 text-warning-text" />
                No messaging endpoint yet — a reply stays in this tab and is marked
                &ldquo;not sent&rdquo;. The tenant will not receive it.
              </p>
            }
          />
        </div>
      </Card>
    </div>
  )
}
