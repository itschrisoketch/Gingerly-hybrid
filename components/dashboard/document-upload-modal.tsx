'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORY, CATEGORY_ORDER, formatBytes } from '@/lib/dashboard/document-meta'
import { cn } from '@/lib/utils'
import type { DocumentCategory } from '@/lib/dashboard/sample-data'

/**
 * Upload a document.
 *
 * The previous page had an "Upload Document" button that opened nothing. This is
 * the same action, carried over and made into a real form: pick files, say what
 * they are, attach them to a property, and set an expiry for the kinds that run
 * out.
 *
 * ⚠️ Nothing is stored. There is no document endpoint, so the dialog picks files
 * and then says plainly that it cannot keep them. That is deliberate: a filing
 * cabinet that appears to accept a signed lease and silently drops it is worse
 * than one that admits it is not connected.
 */
const FIELD =
  'h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40'

/** Only these run out, matching the rule enforced in the sample data. */
const EXPIRES: DocumentCategory[] = ['legal']

export function DocumentUploadModal({ properties }: { properties: string[] }) {
  const [open, setOpen] = React.useState(false)
  const [files, setFiles] = React.useState<File[]>([])
  const [category, setCategory] = React.useState<DocumentCategory>('legal')
  const [property, setProperty] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setFiles([])
      setCategory('legal')
      setProperty('')
    }
  }, [open])

  const totalBytes = files.reduce((n, f) => n + f.size, 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Icon name="Upload" className="h-4 w-4" />
          Upload document
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-[560px] sm:rounded-2xl">
        <DialogHeader className="space-y-1 p-6 pb-4 pr-12">
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            Upload a document
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Leases, policies, statements, reports and photos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx,.csv,.jpg,.jpeg,.png,.zip"
            onChange={(e) => {
              setFiles(Array.from(e.target.files ?? []))
              e.target.value = ''
            }}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-8 text-center transition-colors hover:border-accent hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon name="Upload" className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-foreground">Choose files</span>
            <span className="text-sm text-muted-foreground">
              PDF, spreadsheet, image or zip
            </span>
          </button>

          {files.length > 0 ? (
            <ul className="rounded-xl border border-border">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="rule-b flex items-center gap-3 px-4 py-2.5 [--rule-inset:1rem]"
                >
                  <Icon name="FileText" className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {f.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatBytes(f.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    aria-label={`Remove ${f.name}`}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    <Icon name="X" className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="doc-category" className="block text-sm font-medium text-foreground">
                Category
              </label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as DocumentCategory)}
              >
                <SelectTrigger
                  id="doc-category"
                  className={cn(
                    FIELD,
                    '[&>span]:line-clamp-none [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span]:whitespace-nowrap',
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="min-w-[220px] rounded-xl">
                  {CATEGORY_ORDER.map((c) => (
                    <SelectItem key={c} value={c} className="rounded-lg">
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <Icon name={CATEGORY[c].icon} className="h-4 w-4 text-muted-foreground" />
                        {CATEGORY[c].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="doc-property" className="block text-sm font-medium text-foreground">
                Property
              </label>
              <Select value={property} onValueChange={setProperty}>
                <SelectTrigger
                  id="doc-property"
                  className={cn(FIELD, '[&>span]:line-clamp-none [&>span]:whitespace-nowrap')}
                >
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent className="max-h-[260px] min-w-[240px] rounded-xl">
                  <SelectItem value="All properties" className="rounded-lg">
                    All properties
                  </SelectItem>
                  {properties.map((n) => (
                    <SelectItem key={n} value={n} className="rounded-lg">
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {EXPIRES.includes(category) ? (
            <div className="space-y-2">
              <label htmlFor="doc-expiry" className="block text-sm font-medium text-foreground">
                Expires
              </label>
              <input id="doc-expiry" type="date" className={cn(FIELD, 'tabular-nums')} />
              <p className="text-sm text-muted-foreground">
                Leases and policies are chased from 60 days out.
              </p>
            </div>
          ) : null}

          <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-foreground">
            <Icon name="AlertTriangle" className="mt-px h-4 w-4 shrink-0 text-warning-text" />
            <span>
              No document store is connected yet, so nothing is uploaded. The files stay on your
              machine.
            </span>
          </p>
        </div>

        <DialogFooter className="rule-t gap-2 px-6 py-4 [--rule-inset:1.5rem] sm:space-x-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={files.length === 0}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-50"
          >
            <Icon name="Upload" className="h-4 w-4" />
            Upload
            {files.length > 0 ? (
              <span className="tabular-nums">
                {files.length} &middot; {formatBytes(totalBytes)}
              </span>
            ) : null}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
