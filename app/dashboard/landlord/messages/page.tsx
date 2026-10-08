import { MessagesPanel } from '@/components/dashboard/messages-panel'
import { PageBanner } from '@/components/dashboard/page-banner'
import { SampleDataChip } from '@/components/dashboard/sample-data-notice'
import { StatTiles, type Figure } from '@/components/dashboard/stat-tiles'
import { TOPIC, awaitingReply, lastMessage } from '@/lib/dashboard/message-meta'
import { IS_SAMPLE_DATA, sampleConversations } from '@/lib/dashboard/sample-data'

/**
 * Messages.
 *
 * Same frame as the rest of the dashboard — title, banner, tiles — around a
 * two-pane conversation panel. What it replaced had six conversations and
 * message threads for two of them, so four opened blank; that was the cause of
 * the three TypeScript errors this file carried, and `pnpm verify:data` now has
 * a check for exactly that.
 *
 * The exception is an unanswered tenant. Not unread count, which only says
 * nobody has looked — a message can be read and still owe a reply, and the
 * second is the one that matters to the person waiting.
 */

/** Relative timestamps are measured from here, so the server and client agree. */
const AS_OF = '2026-09-21T09:00:00Z'

export default function MessagesPage() {
  const conversations = sampleConversations

  const owed = conversations.filter(awaitingReply)
  const unread = conversations.reduce((n, c) => n + c.unread, 0)

  // The longest anyone has been waiting on a reply, in hours.
  const oldestWait = owed.reduce((worst, c) => {
    const at = lastMessage(c)?.at
    if (!at) return worst
    const hours = (new Date(AS_OF).getTime() - new Date(at).getTime()) / 3_600_000
    return Math.max(worst, Math.floor(hours))
  }, 0)

  const topics = owed.reduce<Record<string, number>>((acc, c) => {
    acc[c.topic] = (acc[c.topic] ?? 0) + 1
    return acc
  }, {})
  const topicParts = Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .map(([t, n]) => `${n} ${TOPIC[t as keyof typeof TOPIC].label.toLowerCase()}`)

  const figures: Figure[] = [
    { label: 'Needs a reply', value: String(owed.length), icon: 'MessageSquare' },
    { label: 'Unread', value: String(unread), icon: 'Mail' },
    {
      label: 'Longest wait',
      value: oldestWait >= 24 ? `${Math.floor(oldestWait / 24)}d` : `${oldestWait}h`,
      icon: 'Clock',
    },
    { label: 'Conversations', value: String(conversations.length), icon: 'Users' },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Messages</h1>
            {IS_SAMPLE_DATA ? (
              <SampleDataChip detail="These conversations are placeholders for design review. No messaging endpoint exists yet, so nothing here was sent or received." />
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{owed.length}</span>{' '}
            {owed.length === 1 ? 'tenant is' : 'tenants are'} waiting on a reply, across{' '}
            <span className="tabular-nums">{conversations.length}</span> conversations
          </p>
        </div>
      </header>

      {/* Unanswered, not unread: a message can be read and still owe a reply. */}
      {owed.length > 0 ? (
        <PageBanner
          id="messages-banner"
          eyebrow="Waiting on you"
          title={
            <>
              {owed.length} {owed.length === 1 ? 'tenant has' : 'tenants have'} had no reply
            </>
          }
          description={
            <>
              The longest has been waiting{' '}
              <span className="tabular-nums">
                {oldestWait >= 24
                  ? `${Math.floor(oldestWait / 24)} ${Math.floor(oldestWait / 24) === 1 ? 'day' : 'days'}`
                  : `${oldestWait} ${oldestWait === 1 ? 'hour' : 'hours'}`}
              </span>
              {topicParts.length > 0 ? <> &middot; {topicParts.join(', ')}</> : null}
            </>
          }
          action={{ href: '/dashboard/landlord/maintenance', label: 'Open maintenance' }}
        />
      ) : null}

      <StatTiles figures={figures} label="Messages" id="messages-figures" />

      <MessagesPanel conversations={conversations} asOf={AS_OF} />
    </div>
  )
}
