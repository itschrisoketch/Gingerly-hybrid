# Onboarding UI Upgrade Implementation Plan (Plan A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/login`, `/signup` and `/verify-account` to match the gingerly.africa brand, fix their accessibility defects, and establish the Material Symbols icon foundation the rest of the codebase will migrate onto.

**Architecture:** The three pages move into a Next.js route group `app/(auth)/` whose layout owns a split-screen shell (form left, brand panel right, single column below `lg`). Route groups do not affect URLs, so `/login` stays `/login`. Two new fonts are added as *scoped* CSS variables alongside the existing `--font-sans`, so the dashboard is provably untouched. A single `Icon` wrapper backed by a verified 93-entry name map replaces Lucide in the five auth files; the remaining 48 files are Plan B.

**Tech Stack:** Next.js 15.2.4 (App Router), React 19.2, TypeScript, Tailwind CSS 3.4, shadcn/ui + Radix, React Hook Form + Zod, framer-motion, `@iconify/react` + `@iconify-icons/material-symbols`, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-15-onboarding-ui-upgrade-design.md`

## Global Constraints

- **Package manager is pnpm.** Never `npm install` or `yarn add`.
- **Form logic is out of scope.** React Hook Form wiring, Zod schemas in `lib/validations`, the API hooks in `lib/hooks/api`, and the inactive-account redirect in `app/login/page.tsx` must behave identically after this work. Presentation and ARIA attributes only.
- **`--font-sans` (Jost) must not change.** The dashboard depends on it. New fonts are added as `--font-body` and `--font-display`.
- **Brand panel carries no security or payment-rail claims.** Only the verbatim landing string `Collect Recurring Payments Automatically` and the wordmark. Do not add encryption badges, M-Pesa logos, certifications, or invented statistics.
- **Icons are imported offline.** Never use `@iconify/react`'s network name resolution (`<Icon icon="material-symbols:home" />` as a bare string). Icon data is imported as an ES module.
- **Iconify names are kebab-case**, not the snake_case of Google's font ligatures: `credit-card`, not `credit_card`.
- **Icon sizing convention** (from `CLAUDE.md`): `h-5 w-5` standard, `h-4 w-4` small.
- **Every animation respects `prefers-reduced-motion: reduce`** by rendering the final state immediately.
- **`tsc --noEmit` must introduce no NEW errors.** `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `pnpm build` passing proves nothing about type correctness. Note the repo is **not** type-clean at baseline: exactly 3 pre-existing errors live in `app/dashboard/landlord/messages/page.tsx` (TS7053 at 167, TS7006 at 419 and 625), all unrelated to this work. The gate is that this list is unchanged:

```bash
pnpm exec tsc --noEmit 2>&1 | grep -E "^[^ ]+\.tsx?\(" | sort > /tmp/tsc-now.txt
# Expected: only the 3 app/dashboard/landlord/messages/page.tsx lines above.
```
Do not fix those 3 — they are outside this plan's scope.
- **Use `@/` path aliases**, never relative imports across directories.

---

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `lib/icons/icon-map.ts` | The single source of truth mapping Lucide names → verified Iconify names. Data only, no React. |
| `scripts/verify-icon-map.mjs` | Fails loudly if any mapped name is absent from the installed package. |
| `components/ui/icon.tsx` | The only component that touches Iconify. One import site for the whole app. |
| `app/(auth)/layout.tsx` | Split-screen shell; opts into `--font-body`. |
| `components/auth/auth-brand-panel.tsx` | Right-hand navy panel. |
| `components/auth/auth-heading.tsx` | Sans heading + italic-serif accent word. |
| `components/auth/role-toggle.tsx` | Tenant/Landlord switch with `aria-pressed`. |
| `components/auth/step-progress.tsx` | Signup step indicator. |
| `components/auth/otp-field.tsx` | Wraps `components/ui/input-otp`, preserves paste. |

**Moved (git mv — URLs unchanged):** `app/login/` → `app/(auth)/login/`, `app/signup/` → `app/(auth)/signup/`, `app/verify-account/` → `app/(auth)/verify-account/`

**Modified:** `app/layout.tsx` (fonts, viewport), `app/globals.css` (tokens), `components/auth/field-error.tsx`, `components/auth/tenant-signup-form.tsx`, `components/auth/landlord-signup-form.tsx`, `package.json`

---

## Task 1: Icon foundation

Establishes the icon system and its guard. Nothing renders differently yet — this task is the substrate Tasks 5-7 and all of Plan B build on.

**Files:**
- Create: `lib/icons/icon-map.ts`
- Create: `scripts/verify-icon-map.mjs`
- Create: `components/ui/icon.tsx`
- Modify: `package.json`

**Interfaces:**
- Produces: `ICON_MAP: Record<string, string>` and `type IconName = keyof typeof ICON_MAP` from `@/lib/icons/icon-map`
- Produces: `<Icon name={IconName} className?: string; title?: string />` from `@/components/ui/icon`
- Consumes: nothing

- [ ] **Step 1: Install the icon packages**

```bash
pnpm add @iconify/react@^6.0.2 @iconify-icons/material-symbols@^2.0.3 @iconify/types
```

`@iconify/types` is declared explicitly because pnpm uses an isolated `node_modules`: a transitive dependency of `@iconify/react` is **not** importable unless it is a direct dependency. Omitting it makes `lib/icons/icon-data.ts` fail to type-check.

```bash
pnpm exec tsc --noEmit
```

- [ ] **Step 2: Create the verified name map**

Every value below was validated against `@iconify-icons/material-symbols@2.0.3` — all 93 resolve. The `-outline-rounded` style is deliberate: Material Symbols defaults to *filled*, which is visually much heavier than Lucide's stroke icons, and the rounded geometry matches the app's `--radius: 0.75rem`. Three entries fall back because no `-outline-rounded` variant exists for them.

Create `lib/icons/icon-map.ts`:

```ts
/**
 * Lucide name -> Iconify Material Symbols name.
 *
 * Names are kebab-case (Iconify's normalisation), NOT the snake_case used by
 * Google's Material Symbols font ligatures. `credit-card`, not `credit_card`.
 *
 * Style is `-outline-rounded` by default: Material Symbols defaults to filled,
 * which reads far heavier than the Lucide stroke icons being replaced.
 * ChevronDown/ChevronUp/Smartphone fall back because no outline-rounded
 * variant exists for them.
 *
 * Validated by scripts/verify-icon-map.mjs — run `pnpm verify:icons`.
 */
export const ICON_MAP = {
  Activity: 'monitoring-outline-rounded',
  AlertCircle: 'error-outline-rounded',
  AlertTriangle: 'warning-outline-rounded',
  Archive: 'archive-outline-rounded',
  ArrowDown: 'arrow-downward-outline-rounded',
  ArrowDownRight: 'call-received-outline-rounded',
  ArrowLeft: 'arrow-back-outline-rounded',
  ArrowRight: 'arrow-forward-outline-rounded',
  ArrowUp: 'arrow-upward-outline-rounded',
  ArrowUpRight: 'arrow-outward-outline-rounded',
  BarChart3: 'bar-chart-outline-rounded',
  Bell: 'notifications-outline-rounded',
  Book: 'book-outline-rounded',
  Briefcase: 'work-outline-rounded',
  Building: 'domain-outline-rounded',
  Building2: 'apartment-outline-rounded',
  Calendar: 'calendar-month-outline-rounded',
  CalendarDays: 'date-range-outline-rounded',
  Camera: 'photo-camera-outline-rounded',
  Check: 'check-outline-rounded',
  CheckCircle: 'check-circle-outline-rounded',
  CheckCircle2: 'check-circle-outline-rounded',
  ChevronDown: 'expand-more',
  ChevronLeft: 'chevron-left-outline-rounded',
  ChevronRight: 'chevron-right-outline-rounded',
  ChevronUp: 'expand-less',
  Circle: 'circle-outline-rounded',
  Clock: 'schedule-outline-rounded',
  CreditCard: 'credit-card-outline-rounded',
  DollarSign: 'attach-money-outline-rounded',
  Dot: 'fiber-manual-record-outline-rounded',
  Download: 'download-outline-rounded',
  Droplets: 'water-drop-outline-rounded',
  Edit: 'edit-outline-rounded',
  ExternalLink: 'open-in-new-outline-rounded',
  Eye: 'visibility-outline-rounded',
  FileCheck: 'fact-check-outline-rounded',
  FileText: 'description-outline-rounded',
  Filter: 'filter-alt-outline-rounded',
  GripVertical: 'drag-indicator-outline-rounded',
  Hash: 'tag-outline-rounded',
  HelpCircle: 'help-outline-rounded',
  Home: 'home-outline-rounded',
  Image: 'image-outline-rounded',
  Info: 'info-outline-rounded',
  LayoutDashboard: 'dashboard-outline-rounded',
  LineChart: 'show-chart-outline-rounded',
  Loader2: 'progress-activity-outline-rounded',
  Lock: 'lock-outline-rounded',
  LogOut: 'logout-outline-rounded',
  Mail: 'mail-outline-rounded',
  MapPin: 'location-on-outline-rounded',
  Menu: 'menu-outline-rounded',
  MessageSquare: 'chat-outline-rounded',
  Monitor: 'monitor-outline-rounded',
  Moon: 'dark-mode-outline-rounded',
  MoreHorizontal: 'more-horiz-outline-rounded',
  MoreVertical: 'more-vert-outline-rounded',
  Palette: 'palette-outline-rounded',
  PanelLeft: 'left-panel-open-outline-rounded',
  Paperclip: 'attach-file-outline-rounded',
  PaperclipIcon: 'attach-file-outline-rounded',
  Percent: 'percent-outline-rounded',
  Phone: 'call-outline-rounded',
  PieChart: 'pie-chart-outline-rounded',
  Plus: 'add-outline-rounded',
  PlusCircle: 'add-circle-outline-rounded',
  Search: 'search-outline-rounded',
  Send: 'send-outline-rounded',
  SendIcon: 'send-outline-rounded',
  Settings: 'settings-outline-rounded',
  Share: 'share-outline-rounded',
  Shield: 'shield-outline-rounded',
  Smartphone: 'smartphone-outline',
  Smile: 'mood-outline-rounded',
  Sparkles: 'auto-awesome-outline-rounded',
  Star: 'star-outline-rounded',
  Sun: 'light-mode-outline-rounded',
  Target: 'target-outline-rounded',
  Thermometer: 'thermostat-outline-rounded',
  ThumbsUp: 'thumb-up-outline-rounded',
  Trash2: 'delete-outline-rounded',
  TrendingDown: 'trending-down-outline-rounded',
  TrendingUp: 'trending-up-outline-rounded',
  Upload: 'upload-outline-rounded',
  User: 'person-outline-rounded',
  UserPlus: 'person-add-outline-rounded',
  Users: 'group-outline-rounded',
  Video: 'videocam-outline-rounded',
  Wrench: 'build-outline-rounded',
  X: 'close-outline-rounded',
  XCircle: 'cancel-outline-rounded',
  Zap: 'bolt-outline-rounded',
} as const

export type IconName = keyof typeof ICON_MAP
```

- [ ] **Step 3: Write the failing validator**

Create `scripts/verify-icon-map.mjs`:

```js
#!/usr/bin/env node
/**
 * Fails if any name in ICON_MAP is absent from the installed icon package.
 * This is the guard that makes a 93-icon migration safe: a typo is a hard
 * failure here rather than a silently blank icon in production.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const pkg = require('@iconify-icons/material-symbols/package.json')
const exportsMap = pkg.exports ?? {}

const src = readFileSync(new URL('../lib/icons/icon-map.ts', import.meta.url), 'utf8')
const entries = [...src.matchAll(/^\s*(\w+):\s*'([a-z0-9-]+)',/gm)].map((m) => [m[1], m[2]])

if (entries.length === 0) {
  console.error('verify-icon-map: parsed 0 entries — the map format changed.')
  process.exit(1)
}

const missing = entries.filter(([, name]) => !exportsMap[`./${name}`])

if (missing.length > 0) {
  console.error(`verify-icon-map: ${missing.length} unresolved icon(s):`)
  for (const [lucide, name] of missing) console.error(`  ✗ ${lucide} -> ${name}`)
  process.exit(1)
}

console.log(`verify-icon-map: all ${entries.length} icons resolved.`)
```

Add to `package.json` scripts:

```json
"verify:icons": "node scripts/verify-icon-map.mjs"
```

- [ ] **Step 4: Prove the validator actually catches a bad name**

Temporarily add a deliberately broken entry to `ICON_MAP`:

```ts
  __ProbeBroken: 'this-icon-does-not-exist',
```

Run: `pnpm verify:icons`
Expected: exit code 1, output contains `✗ __ProbeBroken -> this-icon-does-not-exist`

A validator that has never failed is not known to work. **Then delete the probe entry** and re-run:

Run: `pnpm verify:icons`
Expected: `verify-icon-map: all 93 icons resolved.`

- [ ] **Step 5: Create the Icon wrapper**

Create `components/ui/icon.tsx`:

```tsx
import { Icon as IconifyIcon } from '@iconify/react'
import { ICON_MAP, type IconName } from '@/lib/icons/icon-map'
import { cn } from '@/lib/utils'

interface IconProps {
  name: IconName
  className?: string
  /**
   * Accessible name. Omit for decorative icons — they are hidden from
   * assistive tech, which is correct when adjacent text already conveys
   * the meaning.
   */
  title?: string
}

export function Icon({ name, className, title }: IconProps) {
  return (
    <IconifyIcon
      icon={`material-symbols:${ICON_MAP[name]}`}
      className={cn('h-5 w-5 shrink-0', className)}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
    />
  )
}
```

- [ ] **Step 6: Replace name resolution with offline module imports**

The Step 5 version passes a *string* to Iconify, which triggers a network fetch to the Iconify API — forbidden by the Global Constraints. Replace the body so icon data is imported as ES modules and bundled.

Rewrite `components/ui/icon.tsx`:

```tsx
'use client'

import { Icon as IconifyIcon, addCollection } from '@iconify/react'
import { ICON_MAP, type IconName } from '@/lib/icons/icon-map'
import { cn } from '@/lib/utils'
import { iconCollection } from '@/lib/icons/icon-data'

// Registering the bundled subset up-front means Iconify resolves every name
// locally and never reaches the network.
addCollection(iconCollection)

interface IconProps {
  name: IconName
  className?: string
  title?: string
}

export function Icon({ name, className, title }: IconProps) {
  return (
    <IconifyIcon
      icon={`material-symbols:${ICON_MAP[name]}`}
      className={cn('h-5 w-5 shrink-0', className)}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
    />
  )
}
```

`lib/icons/icon-data.ts` is **not** hand-written — 93 import lines is precisely where a
transcription typo hides. It is generated in Step 7, and looks like this when produced:

```ts
import type { IconifyJSON } from '@iconify/types'

// GENERATED by scripts/generate-icon-data.mjs — do not hand-edit.
import ApartmentOutlineRoundedIcon from '@iconify-icons/material-symbols/apartment-outline-rounded'
import ArchiveOutlineRoundedIcon from '@iconify-icons/material-symbols/archive-outline-rounded'
// ... 88 more, one per unique icon name ...

const icons: Record<string, unknown> = {
  'apartment-outline-rounded': ApartmentOutlineRoundedIcon,
  'archive-outline-rounded': ArchiveOutlineRoundedIcon,
  // ... 88 more ...
}

export const iconCollection = { prefix: 'material-symbols', icons } as unknown as IconifyJSON
```

Do not create this file by hand. Proceed to Step 7, which writes it.

- [ ] **Step 7: Generate `icon-data.ts` rather than hand-writing 93 imports**

Hand-transcribing 93 import lines is exactly where a typo hides. Create `scripts/generate-icon-data.mjs`:

```js
#!/usr/bin/env node
/** Regenerates lib/icons/icon-data.ts from lib/icons/icon-map.ts. */
import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync(new URL('../lib/icons/icon-map.ts', import.meta.url), 'utf8')
const entries = [...src.matchAll(/^\s*(\w+):\s*'([a-z0-9-]+)',/gm)].map((m) => [m[1], m[2]])

const unique = [...new Set(entries.map(([, name]) => name))].sort()
const ident = (name) => name.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase()) + 'Icon'

const out = `import type { IconifyJSON } from '@iconify/types'

// GENERATED by scripts/generate-icon-data.mjs — do not hand-edit.
// Re-run \`pnpm generate:icons\` after changing lib/icons/icon-map.ts.
${unique.map((n) => `import ${ident(n)} from '@iconify-icons/material-symbols/${n}'`).join('\n')}

const icons: Record<string, unknown> = {
${unique.map((n) => `  '${n}': ${ident(n)},`).join('\n')}
}

export const iconCollection = { prefix: 'material-symbols', icons } as unknown as IconifyJSON
`

writeFileSync(new URL('../lib/icons/icon-data.ts', import.meta.url), out)
console.log(`generate-icon-data: wrote ${unique.length} icons.`)
```

Add to `package.json` scripts:

```json
"generate:icons": "node scripts/generate-icon-data.mjs"
```

Run: `pnpm generate:icons && pnpm verify:icons`
Expected: `generate-icon-data: wrote 90 icons.` then `verify-icon-map: all 93 icons resolved.`

(90 unique targets for 93 Lucide names — `CheckCircle`/`CheckCircle2`, `Send`/`SendIcon` and `Paperclip`/`PaperclipIcon` each collapse two names onto one target.)

- [ ] **Step 8: Type-check and commit**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

```bash
git add lib/icons scripts/verify-icon-map.mjs scripts/generate-icon-data.mjs components/ui/icon.tsx package.json pnpm-lock.yaml
git commit -m "feat(icons): add Material Symbols foundation with verified name map

93 Lucide names mapped to offline-bundled Iconify Material Symbols.
No runtime network resolution. Guarded by pnpm verify:icons.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Fonts and design tokens

**Files:**
- Modify: `app/layout.tsx:1-30`
- Modify: `app/globals.css:31-33,60-68,85`

**Interfaces:**
- Produces: CSS variables `--font-body`, `--font-display` available app-wide; Tailwind classes `font-body`, `font-display`
- Consumes: nothing

- [ ] **Step 1: Load the two landing-site fonts**

In `app/layout.tsx`, add alongside the existing `Jost` import — do **not** replace it:

```tsx
import { Jost, Inter_Tight, Instrument_Serif } from "next/font/google"

const fontSans = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

const fontBody = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const fontDisplay = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
})
```

- [ ] **Step 2: Attach the variables and remove the zoom lock**

In the same file, update `viewport` — deleting `maximumScale`, which disables pinch-zoom and is a WCAG failure:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121A2D" },
  ],
}
```

And extend the `body` class list:

```tsx
<body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontBody.variable, fontDisplay.variable)}>
```

- [ ] **Step 3: Reconcile the teal token to the landing site's value**

`#0E7C86` is `hsl(187 81% 29%)`. In `app/globals.css`, update these `:root` declarations:

```css
    --accent: 187 81% 29%;
    --ring: 187 81% 29%;
    --teal-500: 187 81% 29%;
    --teal-600: 187 81% 24%;
    --chart-1: 187 81% 29%;
    --info: 187 81% 29%;
```

Leave `--font-sans` on line 85 **unchanged**.

- [ ] **Step 4: Expose the fonts and brand colours to Tailwind**

`tailwind.config.ts` currently defines **no** `fontFamily` and **no** `navy`/`teal` colours,
so `bg-navy-500` and `text-teal-100` presently produce nothing at all. Both are required by
Tasks 3 and 4.

Inside `theme.extend`, add `fontFamily` — note it deliberately does **not** define `sans`:

```ts
      fontFamily: {
        // `sans` is intentionally absent. With no fontFamily.sans defined, Tailwind's
        // `font-sans` resolves to its default system stack, which is what the dashboard
        // renders today. Adding `sans: var(--font-sans)` here would switch the whole
        // dashboard to Jost — a change this work must not make.
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
```

And inside the existing `theme.extend.colors` object, add the two brand scales:

```ts
  			navy: {
  				'50': 'hsl(var(--navy-50))',
  				'100': 'hsl(var(--navy-100))',
  				'500': 'hsl(var(--navy-500))',
  				'600': 'hsl(var(--navy-600))'
  			},
  			teal: {
  				'50': 'hsl(var(--teal-50))',
  				'100': 'hsl(var(--teal-100))',
  				'500': 'hsl(var(--teal-500))',
  				'600': 'hsl(var(--teal-600))'
  			},
```

This is purely additive: no existing code uses these class names.

- [ ] **Step 4b: Scope the auth fonts past the base layer**

`app/globals.css` sets an explicit `font-family: var(--font-sans)` on `p`, `h1`–`h6`,
`input`, `textarea` and `select` inside `@layer base`. An explicit element rule beats
inheritance, so putting `font-body` on a wrapper div does **not** restyle any of that text —
without this step the auth pages silently render in Jost and the entire brand-continuity
goal fails.

Append inside the existing `@layer base` block in `app/globals.css`:

```css
  /* The auth shell opts out of the global Jost element rules above. Specificity
     (0,1,1) beats the bare element selectors (0,0,1), so these win without !important. */
  [data-auth-shell] :is(h1, h2, h3, h4, h5, h6, p, input, textarea, select, button, label) {
    font-family: var(--font-body);
  }

  [data-auth-shell] .font-display,
  [data-auth-shell] :is(h1, h2, h3, h4, h5, h6) .font-display {
    font-family: var(--font-display);
  }
```

- [ ] **Step 5: Verify the dashboard is untouched**

```bash
pnpm exec tsc --noEmit && pnpm dev
```

Open `http://localhost:3000/dashboard/landlord`. Expected: renders in Jost exactly as before — only the teal hue shifts slightly. If any dashboard text changed typeface, `--font-sans` was modified; revert and redo Step 3.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/globals.css tailwind.config.ts
git commit -m "feat(design): add Inter Tight and Instrument Serif, wire brand colours

Scoped as --font-body/--font-display; fontFamily.sans deliberately undefined
so the dashboard keeps its current rendering. Adds the navy/teal Tailwind
scales (previously missing despite CLAUDE.md) and a [data-auth-shell] rule so
auth text escapes the global Jost element rules. Removes the viewport zoom lock.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Auth route group and split-screen shell

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `components/auth/auth-brand-panel.tsx`
- Create: `components/auth/auth-heading.tsx`
- Move: `app/login/`, `app/signup/`, `app/verify-account/` → `app/(auth)/`

**Interfaces:**
- Consumes: `Icon` from `@/components/ui/icon` (Task 1); `font-body`/`font-display` (Task 2)
- Produces: `<AuthHeading accent="back">Welcome</AuthHeading>` from `@/components/auth/auth-heading`; `<AuthBrandPanel />` from `@/components/auth/auth-brand-panel`

- [ ] **Step 1: Move the pages into the route group**

```bash
mkdir -p "app/(auth)"
git mv app/login "app/(auth)/login"
git mv app/signup "app/(auth)/signup"
git mv app/verify-account "app/(auth)/verify-account"
```

Parentheses make this a route group: URLs are unchanged. Verify before continuing:

```bash
pnpm dev
```
Expected: `http://localhost:3000/login` still loads (unstyled for now).

- [ ] **Step 2: Create the heading component**

The landing site's signature idiom is a sans heading with one italic Instrument Serif accent word ("Put your payments on *autopilot*").

Create `components/auth/auth-heading.tsx`:

```tsx
import { cn } from '@/lib/utils'

// Colour note: this uses the semantic `foreground`/`accent` tokens rather than the
// fixed `navy-*`/`teal-*` brand scales. globals.css does NOT redefine --navy-* or
// --teal-* inside `.dark`, so `text-navy-500` would render near-black text on the
// near-black dark background. The brand panel keeps `bg-navy-500` deliberately: it is
// a constant branded surface carrying white text, which reads correctly in both themes.

interface AuthHeadingProps {
  /** Leading text, set in the body sans. */
  children: React.ReactNode
  /** The single word set in italic display serif. */
  accent: string
  description?: string
  className?: string
}

export function AuthHeading({ children, accent, description, className }: AuthHeadingProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* font-normal is explicit: globals.css @layer base applies `font-bold` to every
          h1, which is heavier than this display treatment intends. */}
      <h1 className="text-3xl font-normal leading-tight text-foreground [text-wrap:balance]">
        {children}{' '}
        <span className="font-display italic font-normal">{accent}</span>
      </h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 3: Create the brand panel**

Copy is the verbatim landing string. Do not add claims.

Create `components/auth/auth-brand-panel.tsx`:

```tsx
import { Icon } from '@/components/ui/icon'

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden lg:flex flex-col justify-between bg-navy-500 p-12 text-white">
      <div className="flex items-center gap-2">
        <Icon name="Building2" className="h-6 w-6" />
        <span className="text-lg font-medium tracking-tight">Gingerly</span>
      </div>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-teal-100 font-semibold">
          Rental payments
        </p>
        <p className="text-4xl leading-tight [text-wrap:balance]">
          Collect Recurring Payments{' '}
          <span className="font-display italic">Automatically</span>
        </p>
      </div>

      <p className="text-xs text-white/50">
        &copy; {new Date().getFullYear()} Gingerly
      </p>
    </aside>
  )
}
```

- [ ] **Step 4: Create the shell layout**

Note the DOM order: the form region comes **before** the panel, so keyboard and screen-reader users reach the form first. The visual position is handled by grid placement, not source order.

Create `app/(auth)/layout.tsx`:

```tsx
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel'
import { Icon } from '@/components/ui/icon'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-auth-shell
      className="min-h-screen font-body lg:grid lg:grid-cols-[1fr_minmax(420px,45%)]"
    >
      <main className="flex flex-col px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
        {/* Mobile-only wordmark; the panel below lg is hidden. */}
        <div className="flex items-center gap-2 lg:hidden">
          <Icon name="Building2" className="h-6 w-6 text-foreground" />
          <span className="text-lg font-medium tracking-tight text-foreground">Gingerly</span>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>

      <AuthBrandPanel />
    </div>
  )
}
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm exec tsc --noEmit && pnpm dev
```

Check `http://localhost:3000/login` at 375px (panel hidden, wordmark shown) and 1440px (two columns, panel visible). Expected: no horizontal scroll at either width.

```bash
git add "app/(auth)" components/auth/auth-heading.tsx components/auth/auth-brand-panel.tsx
git commit -m "feat(auth): add route group with split-screen shell and brand panel

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Accessible form primitives

The shared pieces Tasks 5-7 consume. Each fixes a defect confirmed in the current code.

**Files:**
- Modify: `components/auth/field-error.tsx`
- Create: `components/auth/role-toggle.tsx`
- Create: `components/auth/step-progress.tsx`

**Interfaces:**
- Produces: `<FieldError id={string} message?: string />`
- Produces: `<RoleToggle value={'customer'|'merchant'} onChange={(v) => void} />`
- Produces: `<StepProgress current={number} total={number} />`

- [ ] **Step 1: Make field errors announceable**

The current version renders a bare `<p>` with no `id` and no `role`, so nothing connects it to its input and screen readers never announce it. Replace `components/auth/field-error.tsx` entirely:

```tsx
/**
 * Inline form field error.
 *
 * `role="alert"` sits on a conditionally-rendered node, so it announces when
 * the error appears rather than on every keystroke. The `id` is required:
 * callers must point the input's aria-describedby at it.
 */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  )
}
```

- [ ] **Step 2: Build the role toggle with pressed state**

The current login toggle is two `<button>`s with no `aria-pressed`, so assistive tech cannot tell which role is selected. Create `components/auth/role-toggle.tsx`:

```tsx
'use client'

import type { LoginType } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const OPTIONS: { value: LoginType; label: string }[] = [
  { value: 'customer', label: 'Tenant' },
  { value: 'merchant', label: 'Landlord' },
]

interface RoleToggleProps {
  value: LoginType
  onChange: (value: LoginType) => void
}

export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div role="group" aria-label="Account type" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
      {OPTIONS.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              // min-h-11 == 44px, the minimum touch target.
              'min-h-11 cursor-pointer rounded-md px-4 text-sm font-medium transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              selected
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Build the step indicator**

Replaces the plain "Step 1 of 2" text. Create `components/auth/step-progress.tsx`:

```tsx
export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="space-y-2">
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${current} of ${total}`}
        className="flex gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={
              'h-1 flex-1 rounded-full transition-colors duration-300 ' +
              (i < current ? 'bg-accent' : 'bg-muted')
            }
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Step {current} of {total}
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Repair all 28 existing FieldError call sites**

Making `id` required breaks every existing caller: **11 in
`components/auth/tenant-signup-form.tsx` and 17 in
`components/auth/landlord-signup-form.tsx`**. The Global Constraints require
`tsc --noEmit` to pass at every commit, so this task fixes them rather than deferring.

This step is mechanical only — add the `id` prop, change nothing else. The `autoComplete`
and `aria-describedby` work belongs to Task 6.

List every call site first:

```bash
grep -n "FieldError" components/auth/tenant-signup-form.tsx components/auth/landlord-signup-form.tsx
```

For each one, add an `id` matching the field name it reports on:

```tsx
// before
<FieldError message={errors.first_name?.message} />
// after
<FieldError id="first_name-error" message={errors.first_name?.message} />
```

The id convention is `<field_name>-error`, matching what Tasks 5-7 point
`aria-describedby` at. Do not restyle, reorder, or otherwise touch these forms here.

- [ ] **Step 5: Type-check and commit**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors. If any `FieldError` call still lacks an `id`, this fails — fix it
before committing.

```bash
git add components/auth/field-error.tsx components/auth/role-toggle.tsx components/auth/step-progress.tsx components/auth/tenant-signup-form.tsx components/auth/landlord-signup-form.tsx
git commit -m "feat(auth): add accessible field error, role toggle and step progress

FieldError now requires an id so inputs can reference it via aria-describedby;
all 28 existing call sites updated to keep the type check green.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Login page

**Files:**
- Modify: `app/(auth)/login/page.tsx`

**Interfaces:**
- Consumes: `AuthHeading`, `RoleToggle`, `FieldError`, `Icon`

- [ ] **Step 1: Swap the header and role toggle**

Replace the logo block and the hand-rolled toggle. Remove `import { Building2, Loader2 } from 'lucide-react'` and the outer `min-h-screen` wrapper — the shell layout now owns page framing.

```tsx
import { AuthHeading } from '@/components/auth/auth-heading'
import { RoleToggle } from '@/components/auth/role-toggle'
import { FieldError } from '@/components/auth/field-error'
import { Icon } from '@/components/ui/icon'
```

The returned tree starts:

```tsx
  return (
    <div className="space-y-8">
      <AuthHeading accent="back" description="Sign in to your account">
        Welcome
      </AuthHeading>

      <RoleToggle value={loginType} onChange={handleLoginTypeChange} />
      {/* form follows */}
```

- [ ] **Step 2: Add autoComplete and ARIA wiring to the fields**

Missing `autoComplete` blocks password managers — a WCAG 2.2 "Accessible Authentication" failure. Replace both field blocks:

```tsx
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
                disabled={isLoading}
              />
              <FieldError id="email-error" message={errors.email?.message} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
                disabled={isLoading}
              />
              <FieldError id="password-error" message={errors.password?.message} />
            </div>
```

- [ ] **Step 3: Replace the loading spinner icon**

```tsx
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
```

- [ ] **Step 4: Verify no Lucide imports remain in this file**

```bash
grep -n "lucide-react" "app/(auth)/login/page.tsx"
```
Expected: no output.

- [ ] **Step 5: Manual check**

```bash
pnpm exec tsc --noEmit && pnpm dev
```

At `http://localhost:3000/login`: submit empty to confirm both inline errors appear; Tab through and confirm every control shows a visible focus ring; confirm the browser/password manager offers to fill email and password.

- [ ] **Step 6: Commit**

```bash
git add "app/(auth)/login/page.tsx"
git commit -m "feat(auth): restyle login with brand shell and fix a11y defects

Adds autoComplete for password managers, aria-invalid/describedby wiring,
and aria-pressed on the role toggle. Swaps Lucide for Material Symbols.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Signup page and forms

**Files:**
- Modify: `app/(auth)/signup/page.tsx`
- Modify: `components/auth/tenant-signup-form.tsx`
- Modify: `components/auth/landlord-signup-form.tsx`

**Interfaces:**
- Consumes: `AuthHeading`, `StepProgress`, `FieldError`, `Icon`

- [ ] **Step 1: Restyle the signup shell**

In `app/(auth)/signup/page.tsx`, remove `Building2` and the `min-h-screen`/`container` wrappers, and replace the header block:

```tsx
import { AuthHeading } from '@/components/auth/auth-heading'
import { StepProgress } from '@/components/auth/step-progress'
```

```tsx
    <div className="space-y-8">
      <AuthHeading accent="account">Create your</AuthHeading>
      <StepProgress current={step} total={TOTAL_STEPS[tab]} />

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        {/* unchanged */}
```

Keep the `Suspense` boundary and `TOTAL_STEPS` exactly as they are.

- [ ] **Step 2: Fix every FieldError call site**

Task 4 already added the required `id` to all 28 `FieldError` calls. This step adds what Task 4 deliberately left out: `autoComplete` on each input, plus the `aria-invalid`/`aria-describedby` pair pointing at the id that is already there. For `first_name`:

```tsx
              <Input
                id="first_name"
                autoComplete="given-name"
                aria-invalid={errors.first_name ? true : undefined}
                aria-describedby={errors.first_name ? 'first_name-error' : undefined}
                {...register('first_name')}
              />
              <FieldError id="first_name-error" message={errors.first_name?.message} />
```

Apply the identical pattern to every field, using these `autoComplete` values:

| Field | `autoComplete` |
|---|---|
| `first_name` | `given-name` |
| `last_name` | `family-name` |
| `email` | `email` |
| `msisdn` | `tel` |
| `password` | `new-password` |
| `confirm_password` | `new-password` |
| `apartment_name`, `unit_number`, `billing_date` | `off` |

Find every call site first:

```bash
grep -n "FieldError" components/auth/tenant-signup-form.tsx components/auth/landlord-signup-form.tsx
```

- [ ] **Step 3: Replace the Lucide imports in both forms**

Both import `{ ChevronLeft, ChevronRight, Loader2 }`. Remove the `lucide-react` import and substitute:

```tsx
import { Icon } from '@/components/ui/icon'
```

```tsx
<Icon name="ChevronLeft" className="mr-2 h-4 w-4" />
<Icon name="ChevronRight" className="ml-2 h-4 w-4" />
<Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm exec tsc --noEmit
grep -rn "lucide-react" "app/(auth)" components/auth
```
Expected: type-check clean, grep returns nothing.

Walk both flows at `http://localhost:3000/signup` — tenant (2 steps) and landlord (3 steps) — confirming the progress bar advances and back/next preserve entered values.

```bash
git add "app/(auth)/signup/page.tsx" components/auth/tenant-signup-form.tsx components/auth/landlord-signup-form.tsx
git commit -m "feat(auth): restyle signup, add step progress and field ARIA wiring

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Verify-account and the OTP field

**Files:**
- Create: `components/auth/otp-field.tsx`
- Modify: `app/(auth)/verify-account/page.tsx`

**Interfaces:**
- Produces: `<OtpField value={string} onChange={(v: string) => void} disabled?: boolean />`
- Consumes: `components/ui/input-otp` (already present, currently unused)

- [ ] **Step 1: Build the OTP field**

WCAG 2.2 "Accessible Authentication (Minimum)" forbids requiring manual OTP transcription with no alternative, so paste must work. `input-otp` preserves paste and SMS autofill; six hand-rolled inputs typically break both.

Create `components/auth/otp-field.tsx`:

```tsx
'use client'

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

interface OtpFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

export function OtpField({ value, onChange, disabled, ...aria }: OtpFieldProps) {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={onChange}
      disabled={disabled}
      // Enables iOS/Android SMS autofill and keeps paste working.
      autoComplete="one-time-code"
      inputMode="numeric"
      id="otp"
      {...aria}
    >
      <InputOTPGroup>
        {Array.from({ length: 6 }, (_, i) => (
          <InputOTPSlot key={i} index={i} className="h-12 w-12 text-base" />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}
```

- [ ] **Step 2: Wire it into the form**

`InputOTP` is a controlled component, so it needs `Controller` rather than `register`. In `app/(auth)/verify-account/page.tsx`:

```tsx
import { useForm, Controller } from 'react-hook-form'
import { OtpField } from '@/components/auth/otp-field'
import { AuthHeading } from '@/components/auth/auth-heading'
import { Icon } from '@/components/ui/icon'
```

Add `control` to the `useForm` destructure, then replace the OTP field block:

```tsx
            <div className="space-y-2">
              <Label htmlFor="otp">Verification code</Label>
              <Controller
                name="otp"
                control={control}
                render={({ field }) => (
                  <OtpField
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    aria-invalid={errors.otp ? true : undefined}
                    aria-describedby={errors.otp ? 'otp-error' : undefined}
                  />
                )}
              />
              <FieldError id="otp-error" message={errors.otp?.message} />
            </div>
```

- [ ] **Step 3: Update the header, phone field and spinner**

```tsx
      <AuthHeading accent="account" description="Enter the 6-digit code we sent by SMS.">
        Verify your
      </AuthHeading>
```

```tsx
              <Input
                id="msisdn"
                type="tel"
                autoComplete="tel"
                placeholder="254700000000"
                aria-invalid={errors.msisdn ? true : undefined}
                aria-describedby={errors.msisdn ? 'msisdn-error' : undefined}
                {...register('msisdn')}
              />
              <FieldError id="msisdn-error" message={errors.msisdn?.message} />
```

Replace `<Loader2 className="mr-2 h-4 w-4 animate-spin" />` with `<Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />` and delete the `lucide-react` import.

- [ ] **Step 4: Verify paste explicitly**

```bash
pnpm exec tsc --noEmit && pnpm dev
```

At `http://localhost:3000/verify-account`: copy `123456` and paste into the first slot. Expected: all six slots fill. **If paste does not distribute across slots, stop** — that is the WCAG failure this task exists to prevent, and it must be fixed before the commit.

Also confirm the resend button still enables only when a phone number is present.

- [ ] **Step 5: Commit**

```bash
git add components/auth/otp-field.tsx "app/(auth)/verify-account/page.tsx"
git commit -m "feat(auth): restyle verify-account with paste-safe OTP field

Replaces the plain text input with input-otp, preserving paste and SMS
autofill per WCAG 2.2 Accessible Authentication.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Motion and final verification

**Files:**
- Modify: `components/auth/auth-brand-panel.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add a reduced-motion guard**

Append to `app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Add the panel entrance**

In `components/auth/auth-brand-panel.tsx`, add `'use client'` at the top and wrap the copy block. `useReducedMotion` returns the user's preference, and the animation is skipped entirely when set — the CSS guard alone would not stop framer-motion's inline styles.

```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
```

```tsx
  const reduceMotion = useReducedMotion()
```

```tsx
      <motion.div
        className="space-y-4"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
```

- [ ] **Step 3: Run the full verification matrix**

```bash
pnpm exec tsc --noEmit
pnpm verify:icons
pnpm build
grep -rn "lucide-react" "app/(auth)" components/auth
```
Expected: type-check clean, all 93 icons resolved, build succeeds, grep returns nothing.

Then, per spec §7, for each of `/login`, `/signup`, `/verify-account`:

- [ ] 375px — single column, no horizontal scroll, panel hidden
- [ ] 768px — single column, comfortable spacing
- [ ] 1024px — split screen engages
- [ ] 1440px — panel does not dominate
- [ ] Light mode — all text meets 4.5:1
- [ ] Dark mode — all text meets 4.5:1
- [ ] Keyboard-only traversal; focus always visible and never obscured
- [ ] Password manager offers to fill login and signup
- [ ] A screen reader announces a field error after a failed submit
- [ ] OTP paste fills all six slots

- [ ] **Step 4: Commit**

```bash
git add components/auth/auth-brand-panel.tsx app/globals.css
git commit -m "feat(auth): add reduced-motion-aware panel entrance

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Done when

- `/login`, `/signup`, `/verify-account` render in Inter Tight with Instrument Serif accents and the navy brand panel
- Those URLs are unchanged and no links anywhere needed updating
- The dashboard still renders in Jost
- No `lucide-react` import remains anywhere under `app/(auth)` or `components/auth`
- `pnpm verify:icons`, `pnpm exec tsc --noEmit` and `pnpm build` all pass
- Every box in Task 8 Step 3 is ticked

**Not done here — Plan B:** the remaining ~30 app/dashboard files, the 19 `components/ui/` vendor forks, removing `lucide-react` from `package.json`, and the `CLAUDE.md` note recording the fork.
