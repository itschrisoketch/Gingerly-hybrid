import type { Conversation, MessageTopic } from '@/lib/dashboard/sample-data'
import type { StatusTone } from '@/components/ui/status-badge'
import type { IconName } from '@/lib/icons/icon-map'

/**
 * Labels and icons for conversations. A plain module so the Server Component
 * can build its banner and tiles from the same vocabulary the panel uses.
 */
export const TOPIC: Record<
  MessageTopic,
  { label: string; icon: IconName; tone: StatusTone }
> = {
  maintenance: { label: 'Maintenance', icon: 'Wrench', tone: 'warning' },
  payment: { label: 'Payment', icon: 'CreditCard', tone: 'info' },
  lease: { label: 'Lease', icon: 'FileText', tone: 'progress' },
  general: { label: 'General', icon: 'MessageSquare', tone: 'neutral' },
}

export const TOPIC_ORDER: MessageTopic[] = ['maintenance', 'payment', 'lease', 'general']

/** The last message in a thread, which is what the list previews. */
export function lastMessage(c: Conversation) {
  return c.messages[c.messages.length - 1]
}

/**
 * Whether the agent still owes a reply.
 *
 * Derived from who spoke last rather than stored on the conversation. A stored
 * flag is a second source of truth and goes stale the moment anyone answers;
 * this cannot.
 */
export function awaitingReply(c: Conversation): boolean {
  return lastMessage(c)?.from === 'tenant'
}

/** Newest activity first, but anything still owed a reply outranks it. */
export function byPriority(a: Conversation, b: Conversation): number {
  const owed = Number(awaitingReply(b)) - Number(awaitingReply(a))
  if (owed !== 0) return owed
  return (lastMessage(b)?.at ?? '').localeCompare(lastMessage(a)?.at ?? '')
}
