# Backend questions & blockers

Findings from integrating the frontend against `https://api.gingerly.africa`
(gingerly-api v1.0.0), 9 Sep 2026. Everything below was reproduced live.

---

## 1. BLOCKER — JWTs are minted with a non-string `sub`, and every authenticated endpoint rejects them

`POST /auth/forgot-password` returns a token whose payload is:

```json
{ "type": "access", "sub": { "_id": 3 }, "exp": 1788957394, "iat": 1788957094 }
```

Presenting that token to any protected endpoint fails:

```
GET  /api/v1/auth/my-account              -> 422 {"msg": "Subject must be a string"}
GET  /api/v1/customers/my-account         -> 422 {"msg": "Subject must be a string"}
POST /api/v1/auth/forgot-password/verify  -> 422 {"msg": "Subject must be a string"}
```

That last one is the token's own intended next step, so **the password-reset
flow cannot currently complete.**

`sub` must be a string — flask-jwt-extended 4.x enforces this. The fix is
`identity=str(user.id)` at token creation, with the lookup casting back.

**The question that matters:** does `POST /auth/login` mint tokens through the
same factory? If it does, every authenticated request will 422 immediately
after a successful login, and no frontend change can work around it. We could
not verify this ourselves — see blocker 2. Please either confirm login tokens
carry a string `sub`, or fix both paths together.

## 2. BLOCKER — no way to activate a test account, so the authenticated surface is unverified

New accounts are created inactive:

```
POST /api/v1/customers/register  -> 201 {"msg": "account created successfully", "success": true}
POST /api/v1/auth/login          -> 404 {"msg": "user account is inactive", "success": false}
```

Activation needs an OTP delivered by SMS/email. We cannot receive one, so the
following are all coded against the documented shapes but **never observed**:

- the success body of `POST /auth/login` (token nesting, `login_type`)
- `GET /customers/my-account` and `GET /merchants/my-account` (is the profile
  at the top level, or nested under `customer` / `merchant` / `account`?)

The client tolerates several shapes rather than guessing one, but that is a
stopgap. **Please provide either a seeded activated test account, or a dev-mode
OTP bypass / fixed code.**

Note: `POST /auth/resend-verification-otp` replies
`"Request successful. Check your email."` — but the spec says "SMS and email",
and the endpoint keys on `msisdn`. Which channel actually delivers?

## 3. Security — a full access token is issued pre-OTP on `/auth/forgot-password`

That endpoint is unauthenticated and needs only a phone number, yet it returns
a `type: "access"` token (5-minute lifetime) for that user. Today it is inert
only because of the `sub` bug in blocker 1 — which means **fixing that bug
without changing this would turn knowing someone's phone number into account
takeover.**

The reset flow should issue a short-lived, single-purpose token (a distinct
claim, or a scope that only `/forgot-password/verify` accepts), never a general
access token, and ideally only after the OTP is confirmed.

## 4. Security — CORS reflects any origin

```
Origin: https://evil.example.com  ->  Access-Control-Allow-Origin: https://evil.example.com
```

`Access-Control-Allow-Credentials` is absent and we send tokens in the
`Authorization` header, so this is not directly exploitable — but it should be
narrowed to the real origins (`https://gingerly.africa`, `https://www.gingerly.africa`,
and the Vercel preview domains).

## 5. Certificate renewal

The Let's Encrypt cert was issued 9 Sep 2026 and expires **8 Dec 2026**.
Please confirm the certbot renewal timer is enabled — if it was issued by hand,
the API goes dark that day.

---

## Inconsistencies worth tidying (not blocking)

| Thing | Current state | Suggestion |
|---|---|---|
| Update route param style | `PATCH /customers/update?id=` (query) vs `PATCH /merchants/update/{merchant_id}` (path) | Pick one |
| Name fields | `merchants/register` takes `full_name`; `merchants/update` takes `first_name`/`last_name` | Pick one |
| Trailing slashes | `/auth/login/` 404s, `/auth/login` works | Enable strict-slashes redirects, or document it |
| Address fields | `merchants/register` asks for `routing_number`, `state`, `zip_code` | US-shaped for a Kenyan product — intentional? |
| Login failure status | Bad credentials return `404` | `401` is the conventional code |
| Malformed body | `POST /customers/register` with a login payload returns `500` | Should be `400` with field errors |

## Endpoints not yet wired up (22 of 44)

`accounts/*` (10), `bank-accounts/*` (5), `admin/*` (7). The first two look
like the payments substrate — worth a walkthrough before we build against them.

## Test data we created

One inactive customer on your dev database, from probing registration:
`qa.probe.claude@example.com` / msisdn `254700000001`. Delete it whenever
convenient — we have no endpoint to remove it ourselves.
