# Onboarding UI Upgrade — Design

**Date:** 2026-09-15
**Status:** Approved for planning
**Scope:** `/login`, `/signup`, `/verify-account` visual upgrade + codebase-wide Lucide → Material Symbols migration

---

## 1. Why

Two problems, both confirmed by reading the code rather than inferred.

**Brand discontinuity.** The landing site at `gingerly.africa` (repo: `Gingerly-landing`) uses Inter Tight for body, Instrument Serif for display accents, and teal `#0E7C86`. This app uses Jost and teal `#007B8A`. A user who clicks through from the landing site lands on a page in a different typeface, at the highest-intent moment in the funnel.

**The auth pages are unstyled shadcn defaults.** They carry no brand presence, and they contain accessibility defects that block password managers and screen readers — on the three pages where every new user must succeed.

## 2. Decisions taken

| Decision | Choice | Rationale |
|---|---|---|
| Brand direction | Match the landing site | Continuity at the funnel's highest-intent moment |
| Font strategy | Scoped variables, not a global swap | `--font-sans` is global; swapping it silently restyles ~18 unreviewed dashboard pages |
| Layout | Split-screen with brand panel | Room for brand presence; collapses to single column on mobile |
| Accessibility defects | Fixed as part of this work | They live in the files being rewritten; deferring means touching everything twice |
| Brand panel copy | Landing's existing statement only | Security and payment-rail claims could not be verified from source and will not be invented |
| Icon library | Material Symbols, full purge of Lucide | User decision, taken with the vendor-fork cost stated below |

## 3. Architecture

### 3.1 Route group

```
app/(auth)/
├── layout.tsx                 split-screen shell; opts into new fonts
├── login/page.tsx
├── signup/page.tsx
└── verify-account/page.tsx
```

`(auth)` is a Next.js route group: it does **not** affect URLs. `/login` stays `/login`. No redirects, no link updates anywhere in the app.

### 3.2 Components

```
components/auth/
├── auth-brand-panel.tsx       right-hand panel
├── auth-heading.tsx           sans heading + italic-serif accent word
├── role-toggle.tsx            Tenant/Landlord switch, aria-pressed
├── step-progress.tsx          replaces the plain "Step 1 of 2" text
├── otp-field.tsx              wraps the currently-unused components/ui/input-otp
├── field-error.tsx            upgraded: id + role="alert"
├── tenant-signup-form.tsx     restyled; form logic untouched
└── landlord-signup-form.tsx   restyled; form logic untouched
```

**Form logic is out of scope.** React Hook Form wiring, Zod schemas, the API hooks in `lib/hooks/api`, and the inactive-account redirect behaviour all stay exactly as they are. This is a presentation-layer change plus accessibility attributes.

### 3.3 Token layer

In `app/layout.tsx`, load two new fonts alongside the existing one:

- `Inter_Tight` → `--font-body`
- `Instrument_Serif` (weight 400, normal + italic) → `--font-display`
- `Jost` → `--font-sans` — **unchanged**

The `(auth)` layout opts into `--font-body`. The dashboard continues to render in Jost. This is a deliberate, temporary split: the dashboard has not been redesigned, and migrating it is a separate piece of work. When that happens, it is a one-line change.

In `app/globals.css` the only global edit is reconciling the teal tokens to `#0E7C86` (`--teal-500`, `--teal-600`, `--accent`, `--ring`). This is a small hue shift and is safe app-wide.

### 3.4 Visual language

The landing site's signature idiom is a sans heading carrying **one italic Instrument Serif accent word** — e.g. "Put your payments on *autopilot*". Onboarding inherits it:

- "Welcome *back*"
- "Create your *account*"
- "Verify your *account*"

Supporting idioms from the same source: a `text-sm uppercase tracking-widest` teal eyebrow label, and navy `#0F1C3F` as the panel ground.

### 3.5 Layout behaviour

| Breakpoint | Behaviour |
|---|---|
| `< lg` | Single column. Panel collapses to a slim logo header. |
| `≥ lg` | Two columns. Form left (`max-w-sm`), brand panel right. |

The brand panel is decorative and secondary; it comes **after** the form in DOM order so keyboard and screen-reader users reach the form first.

### 3.6 Brand panel content

The landing site fetches its copy from `/api/page-data` at runtime, so marketing claims could not be verified from source. The panel therefore carries only the brand statement already hardcoded in the landing repo's hero component — **"Collect Recurring Payments Automatically"** — plus the wordmark. Exact wording is to be lifted verbatim from that component at implementation time, not paraphrased.

**No security claims, no payment-rail claims, no certification badges.** If verified claims become available later, adding them is a trivial follow-up.

## 4. Accessibility fixes

All confirmed present in the current code.

| File | Defect | Fix | Severity |
|---|---|---|---|
| `components/auth/field-error.tsx` | Bare `<p>`; no `id`, no `role` | Add `id`, `role="alert"`; wire inputs with `aria-describedby` + `aria-invalid` | High |
| `app/login/page.tsx` | No `autoComplete` on email/password | `autoComplete="email"` / `"current-password"` | Critical |
| `app/login/page.tsx` | Role toggle buttons lack pressed state | `aria-pressed`; min 44×44px target | Critical |
| `app/layout.tsx` | `viewport.maximumScale: 1` disables pinch-zoom | Remove the property | High |
| `app/verify-account/page.tsx` | Plain text OTP input | `components/ui/input-otp`, paste preserved, `autocomplete="one-time-code"` | Medium |
| Signup forms | No `autoComplete` | `given-name`, `family-name`, `email`, `tel`, `new-password` | Critical |

**OTP paste is a hard requirement.** WCAG 2.2 "Accessible Authentication (Minimum)" forbids requiring manual OTP transcription with no alternative. Segmented OTP inputs commonly break paste and SMS autofill when hand-rolled; `input-otp` handles both, which is why it is used rather than six inputs.

Error announcement must not fire on every keystroke — `role="alert"` is applied to the error element, which is rendered conditionally, so it announces on appearance only.

## 5. Icon migration

### 5.1 Inventory

**93 distinct icons across 53 files**, in three tiers:

| Tier | Files | Notes |
|---|---|---|
| Onboarding | 5 | Only `Building2` and `Loader2` |
| App + dashboard | ~30 | The bulk of visible iconography |
| `components/ui/` | 19 | shadcn vendor components |

### 5.2 Delivery: offline, no CDN

`@iconify/react` resolves icon names over the network by default. That is rejected here: it adds a third-party runtime dependency to a payments signup page and leaks route context in the request.

Icon data is imported locally instead, matching the `@iconify/icons-*` pattern already used in the `Gingerly-landing` repo. The first implementation step verifies that the Material Symbols package resolves this way; if it does not, the fallback is bundling the ~93-icon subset from `@iconify-json/material-symbols`. **Either way, no runtime fetch.**

### 5.3 Wrapper

A single `components/ui/icon.tsx` so Iconify calls do not scatter across 53 files:

```tsx
<Icon name="home" className="h-5 w-5" />
```

Sizing convention from `CLAUDE.md` holds: `h-5 w-5` standard, `h-4 w-4` small. Decorative icons get `aria-hidden="true"`; icons that are the sole content of a control get an accessible name on the control.

### 5.4 Name mapping

Material Symbols uses `snake_case` (`credit_card`, `location_on`, `progress_activity`). Rather than hand-asserting 93 mappings in this document — which cannot be verified without the package installed — the mapping lives in one table inside `icon.tsx`, and **the plan includes a verification script that fails the build on any name absent from the installed package.** That is a stronger guarantee than a hand-written list.

Two mappings worth calling out because they are not one-to-one:

- `Loader2` (spun with `animate-spin`) → `progress_activity`, which carries its own motion semantics; the spin utility is retained for consistency.
- `Building2` → `apartment`, which reads more accurately for a rental product than `business`.

### 5.5 The vendor fork

Phase 3 forks 19 `components/ui/` files away from their generator. `CLAUDE.md` currently instructs regenerating those files rather than editing them; re-running `npx shadcn add` after this change would silently reintroduce Lucide.

Mitigations, both required:

1. A header comment in each forked file stating it is forked, why, and that regenerating reintroduces Lucide.
2. A `CLAUDE.md` update recording the fork.

`lucide-react` is removed from `package.json` at the end of phase 3. That removal is the proof the migration is complete: if anything still imports it, the type check fails.

## 6. Motion

`framer-motion` is already a dependency and unused in auth. Use stays restrained — step transitions in the signup flow, a panel fade on mount. Nothing that delays input readiness.

Every animation sits behind `prefers-reduced-motion: reduce`, rendering the final state immediately.

## 7. Verification

There is no test suite in this repo, so verification is manual and must be performed, not assumed.

**Per-page matrix:** 375 / 768 / 1024 / 1440px, in both light and dark mode.

**Interaction checks:**
- Keyboard-only pass through each flow; focus visible at every step and never obscured
- Password-manager autofill on login and signup
- Screen-reader announcement of a field error after a failed submit
- OTP paste of a 6-digit code, and SMS autofill on a real device if available

**Build checks:**
- `pnpm build`
- `tsc --noEmit` — **separately and mandatorily.** `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so a green build proves nothing about type correctness. A 53-file import refactor is precisely where a broken import would otherwise hide.
- `grep -r lucide-react app components lib` returns nothing at completion

## 8. Out of scope

- Dashboard visual redesign (the Jost/Inter Tight split is temporary and acknowledged)
- Form logic, validation schemas, API integration
- `.glass` / `.gradient-text` helpers in `globals.css` — the fintech guidance advises against them for a payments product, but they are used across dashboard pages and removing them belongs with the dashboard redesign
- The `/forgot-password` route linked from login, which does not yet exist
- `CLAUDE.md` corrections re: the landing-page split (tracked separately)

## 9. Risks

| Risk | Mitigation |
|---|---|
| Icon migration touches 53 files; a missed import breaks a page | `tsc --noEmit` plus removing `lucide-react` from `package.json` makes any miss a hard failure |
| Vendor fork diverges from upstream shadcn | Header comments + `CLAUDE.md` note |
| Two font systems coexist | Deliberate and documented; scoped so the dashboard is provably untouched |
| Two new Google fonts affect load | Instrument Serif is weight 400 only; `display: swap`; both fonts self-hosted via `next/font`, so no third-party request |
