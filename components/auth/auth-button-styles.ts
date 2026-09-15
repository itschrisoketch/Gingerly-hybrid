/**
 * Shared button styling for the auth flow.
 *
 * Gingerly's primary action colour is the brand teal (#0E7C86, the `--accent`
 * token) — the same colour the role toggle uses for its selected state. Navy
 * stays as text and surface; teal carries actions.
 *
 * These override shadcn's default Button variant, which is `bg-primary` (navy).
 * The `--primary` token itself is deliberately left alone for now: globals.css
 * also sets `h1 { color: hsl(var(--primary)) }`, so flipping the token would
 * turn every dashboard heading teal as a side effect. That flip belongs with the
 * dashboard redesign, where the h1 rule can be re-pointed at `--foreground` in
 * the same change. Until then this constant is the single place auth action
 * colour is defined.
 *
 * Geometry (48px tall, rounded-xl, 15px text) matches the fields and the role
 * toggle, so a form column reads as one system.
 */
export const AUTH_BUTTON_PRIMARY =
  'h-12 rounded-xl text-[15px] bg-accent text-accent-foreground hover:bg-accent/90'

/**
 * Secondary actions — the "Back" steps in the signup flow. These stay neutral
 * rather than teal: two filled teal buttons side by side would give a
 * destructive-adjacent "Back" the same visual weight as "Continue".
 */
export const AUTH_BUTTON_OUTLINE = 'h-12 rounded-xl text-[15px]'
