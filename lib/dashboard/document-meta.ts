import type {
  DocumentCategory,
  DocumentKind,
  DocumentStatus,
  StoredDocument,
} from '@/lib/dashboard/sample-data'
import type { StatusTone } from '@/components/ui/status-badge'
import type { IconName } from '@/lib/icons/icon-map'

/** Plain module: the Server Component reads these for its banner and tiles. */

export const CATEGORY: Record<DocumentCategory, { label: string; icon: IconName }> = {
  legal: { label: 'Legal', icon: 'Shield' },
  finance: { label: 'Finance', icon: 'CreditCard' },
  tenant: { label: 'Tenant records', icon: 'Users' },
  property: { label: 'Property', icon: 'Building2' },
  marketing: { label: 'Marketing', icon: 'Camera' },
}

export const CATEGORY_ORDER: DocumentCategory[] = [
  'legal',
  'finance',
  'tenant',
  'property',
  'marketing',
]

export const STATUS: Record<DocumentStatus, { label: string; tone: StatusTone }> = {
  active: { label: 'Active', tone: 'success' },
  approved: { label: 'Approved', tone: 'success' },
  final: { label: 'Final', tone: 'info' },
  draft: { label: 'Draft', tone: 'warning' },
  archived: { label: 'Archived', tone: 'neutral' },
}

export const STATUS_ORDER: DocumentStatus[] = [
  'active',
  'approved',
  'final',
  'draft',
  'archived',
]

/** The file-type glyph, which is what the eye actually scans a file list by. */
export const FORMAT_ICON: Record<StoredDocument['format'], IconName> = {
  pdf: 'FileText',
  xlsx: 'BarChart3',
  jpg: 'Image',
  zip: 'Archive',
}

export const KIND_LABEL: Record<DocumentKind, string> = {
  lease: 'Lease',
  application: 'Application',
  insurance: 'Insurance',
  statement: 'Statement',
  report: 'Report',
  photos: 'Photos',
}

/** Real byte counts, formatted here. Storing "3.2 MB" as a string, which the
 *  previous page did, makes a size impossible to sort or total. */
export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(Math.round(bytes / 100_000) / 10).toFixed(1)} MB`
  return `${Math.round(bytes / 1000)} KB`
}

/** Days until expiry; negative once it has lapsed. */
export function daysUntil(iso: string, from: string): number {
  return Math.floor(
    (new Date(`${iso}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000,
  )
}

/** Inside 60 days, or already gone. Archived files are not chased. */
export function expiringSoon(d: StoredDocument, from: string): boolean {
  if (!d.expiresAt || d.status === 'archived') return false
  return daysUntil(d.expiresAt, from) <= 60
}
