'use client'

import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Expanding composer with image attachments and voice dictation.
 *
 * Adapted from the reference "AI chat input". The mechanics are kept — the
 * spring expand, the attachment tab that slides out from behind the card, the
 * shared-element gallery, the live audio visualiser, the three-way morphing
 * action button. Four things were changed or removed, each for a reason:
 *
 * 1. NO MODEL PICKER, NO EFFORT CYCLER. This product has no AI backend. A
 *    control that offers "GPT 5.5" and "Max Effort" and changes nothing is a
 *    fake control, and PRODUCT.md rule 2 rules out anything indistinguishable
 *    from a real feature. If an assistant is ever wired up they can come back.
 * 2. NO CDN LOGOS. The model icons were hot-linked from cdn.21st.dev, which put
 *    a third-party runtime dependency and other companies' trademarks into the
 *    page for decoration.
 * 3. THE SIMULATED-SPEECH FALLBACK IS GONE. When the microphone was unavailable
 *    the original typed a hardcoded sentence into the box, word by word, as
 *    though it had been dictated. In a composer that sends messages to tenants
 *    that would put words the agent never said into a real conversation. The
 *    control is now disabled with a reason instead.
 * 4. HOVER SURFACES USE `muted`, NOT `accent`. In shadcn's default palette
 *    `accent` is a light neutral; in this product it is the brand teal, so
 *    `hover:bg-accent/60` painted a saturated teal slab behind every small
 *    toolbar button. The send button, conversely, moved from `primary` (navy)
 *    to `accent`, because teal is what carries actions here.
 *
 * Motion respects `prefers-reduced-motion`, which PRODUCT.md requires.
 */

const SPRING = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'

export interface Attachment {
  id: string
  file: File
  url: string
  name: string
  width?: number
  height?: number
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="5" y="1" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.75 6.5V7a4.25 4.25 0 0 0 8.5 0v-.5M7 11.25V13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** True when the viewer has asked for less motion. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

function AttachmentThumb({
  attachment,
  index,
  onRemove,
  onOpen,
}: {
  attachment: Attachment
  index: number
  onRemove: (id: string) => void
  onOpen: (attachment: Attachment, rect: DOMRect) => void
}) {
  const btnRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="group relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (btnRef.current) onOpen(attachment, btnRef.current.getBoundingClientRect())
        }}
        style={{ animationDelay: `${index * 35}ms`, animationFillMode: 'backwards' }}
        className={cn(
          'block size-12 overflow-hidden rounded-xl border border-border bg-muted',
          'cursor-pointer transition-transform duration-200 hover:scale-[1.04] active:scale-[0.96]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
          'animate-in fade-in zoom-in-90 duration-300 motion-reduce:animate-none motion-reduce:transition-none',
        )}
        aria-label={`Preview ${attachment.name}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="size-full object-cover"
          draggable={false}
        />
      </button>

      {/* A sibling, not a child: a button inside a button is invalid HTML and
          browsers resolve it by dropping one of them. */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onRemove(attachment.id)}
        aria-label={`Remove ${attachment.name}`}
        className={cn(
          'absolute right-1 top-1 flex size-4 cursor-pointer items-center justify-center rounded-full',
          'bg-background/90 text-foreground/70 shadow-sm transition-all duration-200',
          'hover:scale-110 hover:bg-background hover:text-foreground',
          'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
          'opacity-0 group-hover:opacity-100 motion-reduce:transition-none',
        )}
      >
        <CloseIcon />
      </button>
    </div>
  )
}

/**
 * Shared-element preview: the thumbnail appears to grow into the full image.
 * Collapses to a plain fade when reduced motion is requested.
 */
function GalleryModal({
  attachment,
  originRect,
  onClose,
  reduced,
}: {
  attachment: Attachment
  originRect: DOMRect
  onClose: () => void
  reduced: boolean
}) {
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening')
  const [target, setTarget] = useState<{
    top: number
    left: number
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    const maxW = Math.min(window.innerWidth * 0.86, 560)
    const maxH = Math.min(window.innerHeight * 0.78, 720)
    const nw = attachment.width || 800
    const nh = attachment.height || 600
    const scale = Math.min(maxW / nw, maxH / nh, 1.6)
    const width = nw * scale
    const height = nh * scale
    setTarget({
      top: (window.innerHeight - height) / 2,
      left: (window.innerWidth - width) / 2,
      width,
      height,
    })
    const raf = requestAnimationFrame(() => setPhase('open'))
    return () => cancelAnimationFrame(raf)
  }, [attachment])

  const close = useCallback(() => (reduced ? onClose() : setPhase('closing')), [reduced, onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close])

  const isOpen = phase === 'open'
  const geo =
    isOpen && target
      ? { ...target, radius: 20 }
      : {
          top: originRect.top,
          left: originRect.left,
          width: originRect.width,
          height: originRect.height,
          radius: 12,
        }

  const dur = phase === 'closing' ? '0.3s' : '0.45s'
  const ease = phase === 'closing' ? 'ease-out' : SPRING

  return (
    <div
      className="fixed inset-0 z-[100]"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={attachment.name}
    >
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-md transition-opacity duration-300"
        style={{ opacity: isOpen ? 1 : 0 }}
      />
      <div
        style={{
          position: 'fixed',
          top: geo.top,
          left: geo.left,
          width: geo.width,
          height: geo.height,
          borderRadius: geo.radius,
          overflow: 'hidden',
          transition: reduced
            ? 'none'
            : `top ${dur} ${ease}, left ${dur} ${ease}, width ${dur} ${ease}, height ${dur} ${ease}, border-radius ${dur} ${ease}`,
          boxShadow: isOpen ? '0 24px 60px -12px rgb(0 0 0 / 0.35)' : 'none',
        }}
        className="bg-muted"
        onTransitionEnd={() => phase === 'closing' && onClose()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="size-full object-contain"
          draggable={false}
        />
      </div>

      <button
        type="button"
        onClick={close}
        aria-label="Close preview"
        style={{ opacity: isOpen ? 1 : 0 }}
        className="fixed right-4 top-4 flex size-10 cursor-pointer items-center justify-center rounded-full bg-card/90 text-foreground/70 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <span className="scale-150">
          <CloseIcon />
        </span>
      </button>
    </div>
  )
}

export interface PromptInputProps {
  onSubmit?: (value: string, meta: { attachments: File[] }) => void
  placeholder?: string
  className?: string
  maxAttachments?: number
  /** Shown under the composer, e.g. the "not sent" caveat. */
  footnote?: React.ReactNode
}

export const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  ({ onSubmit, placeholder = 'Write a reply', className, maxAttachments = 6, footnote }, ref) => {
    const reduced = useReducedMotion()

    const [value, setValue] = useState('')
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [active, setActive] = useState<{ attachment: Attachment; rect: DOMRect } | null>(null)

    const [isRecording, setIsRecording] = useState(false)
    const [audio, setAudio] = useState<number[]>(new Array(5).fill(0))
    const [micError, setMicError] = useState<string | null>(null)

    const [textareaHeight, setTextareaHeight] = useState(68)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const audioCtxRef = useRef<AudioContext | null>(null)
    const rafRef = useRef<number | null>(null)
    const recognitionRef = useRef<{ stop: () => void } | null>(null)
    const baselineRef = useRef('')

    const hasValue = value.trim() !== '' || attachments.length > 0
    const hasAttachments = attachments.length > 0

    const stopRecording = useCallback(() => {
      recognitionRef.current?.stop()
      recognitionRef.current = null
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      audioCtxRef.current?.close()
      audioCtxRef.current = null
      setIsRecording(false)
      setAudio(new Array(5).fill(0))
    }, [])

    /**
     * Dictation. If the microphone or the speech API is unavailable the control
     * reports that and stops — it does NOT invent a transcript, which is what
     * the reference implementation did.
     */
    const startRecording = useCallback(async () => {
      setMicError(null)

      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: new () => never }).SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition?: new () => never })
          .webkitSpeechRecognition

      if (!SpeechRecognition) {
        setMicError('This browser cannot transcribe speech. Type the reply instead.')
        return
      }

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        setMicError('Microphone unavailable. Check the browser permission and try again.')
        return
      }

      streamRef.current = stream
      setIsRecording(true)
      baselineRef.current = value

      const Ctx =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      audioCtxRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      ctx.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)

      const tick = () => {
        analyser.getByteFrequencyData(data)
        const step = Math.floor(data.length / 5)
        setAudio(
          Array.from({ length: 5 }, (_, i) => {
            let sum = 0
            for (let j = 0; j < step; j++) sum += data[i * step + j]
            return sum / step / 255
          }),
        )
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const recognition: any = new (SpeechRecognition as any)()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.onresult = (event: any) => {
        let interim = ''
        let final = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript
          else interim += event.results[i][0].transcript
        }
        if (final) baselineRef.current += (baselineRef.current ? ' ' : '') + final
        setValue((baselineRef.current + (interim ? ` ${interim}` : '')).trim())
      }
      recognition.onerror = () => {
        setMicError('Dictation stopped unexpectedly.')
        stopRecording()
      }
      recognition.onend = () => stopRecording()
      recognitionRef.current = recognition
      recognition.start()
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }, [value, stopRecording])

    useEffect(() => {
      return () => {
        stopRecording()
        attachments.forEach((a) => URL.revokeObjectURL(a.url))
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Grow with the content, to a ceiling, then scroll.
    useEffect(() => {
      const el = textareaRef.current
      if (!el) return
      el.style.height = '0px'
      const next = Math.max(68, Math.min(el.scrollHeight, 160))
      el.style.height = `${next}px`
      setTextareaHeight(next)
    }, [value])

    function submit() {
      if (!hasValue) return
      onSubmit?.(value, { attachments: attachments.map((a) => a.file) })
      setValue('')
      attachments.forEach((a) => URL.revokeObjectURL(a.url))
      setAttachments([])
    }

    async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
      const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'))
      e.target.value = ''
      const room = Math.max(0, maxAttachments - attachments.length)
      for (const file of files.slice(0, room)) {
        const url = URL.createObjectURL(file)
        const img = new Image()
        const add = (w: number, h: number) =>
          setAttachments((prev) => [
            ...prev,
            {
              id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
              file,
              url,
              name: file.name,
              width: w,
              height: h,
            },
          ])
        img.onload = () => add(img.naturalWidth, img.naturalHeight)
        img.onerror = () => add(800, 600)
        img.src = url
      }
    }

    return (
      <>
        <div ref={ref} className={cn('flex w-full flex-col', className)}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFiles}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />

          {/* Attachment tray, sliding out from behind the card. */}
          <div
            aria-hidden={!hasAttachments}
            style={{
              height: hasAttachments ? 68 : 0,
              transition: reduced ? 'none' : `height 0.35s ${SPRING}`,
            }}
            className="relative z-0 w-full overflow-hidden"
          >
            <div
              style={{
                transform: hasAttachments ? 'translateY(0)' : 'translateY(100%)',
                transition: reduced ? 'none' : `transform 0.35s ${SPRING}`,
              }}
              className="absolute inset-x-3 bottom-[-8px] flex h-[68px] items-start gap-2 overflow-x-auto rounded-t-2xl border border-b-0 border-border bg-muted px-2 pb-1 pt-2"
            >
              {attachments.map((a, i) => (
                <AttachmentThumb
                  key={a.id}
                  attachment={a}
                  index={i}
                  onRemove={(id) =>
                    setAttachments((prev) => {
                      const t = prev.find((x) => x.id === id)
                      if (t) URL.revokeObjectURL(t.url)
                      return prev.filter((x) => x.id !== id)
                    })
                  }
                  onOpen={(attachment, rect) => setActive({ attachment, rect })}
                />
              ))}
            </div>
          </div>

          <div
            className="relative z-10 w-full rounded-2xl border border-border bg-card shadow-sm transition-colors focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20"
            style={{ height: Math.max(116, textareaHeight + 48) }}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder={placeholder}
              aria-label={placeholder}
              disabled={isRecording}
              // The focus-visible cancellations are load-bearing. globals.css
              // has a bare `:focus-visible` rule applying `ring-2
              // ring-primary/40 ring-offset-2`, which painted a second, offset
              // navy ring around the textarea INSIDE the wrapper that already
              // shows focus. The result was two nested rectangles with a gap
              // between them — the composer looked like an unloaded skeleton
              // the moment you clicked it. Focus is shown by the wrapper, once.
              // Same fix as components/auth/auth-input.tsx.
              className="absolute inset-x-0 top-0 w-full resize-none bg-transparent py-3.5 pl-4 pr-12 text-sm leading-[22px] text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-70 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            {/* Toolbar */}
            <div className="absolute inset-x-3 bottom-2 flex items-center gap-1">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                disabled={attachments.length >= maxAttachments}
                aria-label="Attach a photo"
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40"
              >
                <PlusIcon />
              </button>

              {attachments.length > 0 ? (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {attachments.length}/{maxAttachments}
                </span>
              ) : null}

              {/* Live level meter, while dictating. */}
              <span
                className={cn(
                  'ml-auto mr-1 flex h-8 items-center gap-[3px] transition-all duration-300',
                  isRecording ? 'w-16 opacity-100' : 'w-0 opacity-0',
                )}
                aria-hidden="true"
              >
                {audio.map((v, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-accent transition-[height] duration-75 ease-out motion-reduce:transition-none"
                    style={{ height: `${Math.max(4, v * 24)}px` }}
                  />
                ))}
              </span>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => (isRecording ? stopRecording() : hasValue ? submit() : startRecording())}
                aria-label={isRecording ? 'Stop dictation' : hasValue ? 'Send' : 'Dictate'}
                className={cn(
                  'ml-auto flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full',
                  'bg-accent text-accent-foreground transition-colors hover:bg-accent/90',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                  isRecording && 'ml-0',
                )}
              >
                <span className="relative flex size-full items-center justify-center">
                  {[
                    { show: hasValue && !isRecording, node: <ArrowUpIcon /> },
                    { show: !hasValue && !isRecording, node: <MicIcon /> },
                    { show: isRecording, node: <StopIcon /> },
                  ].map((s, i) => (
                    <span
                      key={i}
                      className={cn(
                        'absolute inset-0 flex items-center justify-center transition-all duration-300 motion-reduce:transition-none',
                        s.show
                          ? 'scale-100 rotate-0 opacity-100'
                          : 'pointer-events-none scale-50 rotate-45 opacity-0',
                      )}
                    >
                      {s.node}
                    </span>
                  ))}
                </span>
              </button>
            </div>
          </div>

          {micError ? (
            <p role="status" className="mt-2 text-xs text-warning-text">
              {micError}
            </p>
          ) : null}
          {footnote ? <div className="mt-2">{footnote}</div> : null}
        </div>

        {active ? (
          <GalleryModal
            attachment={active.attachment}
            originRect={active.rect}
            onClose={() => setActive(null)}
            reduced={reduced}
          />
        ) : null}
      </>
    )
  },
)

PromptInput.displayName = 'PromptInput'
