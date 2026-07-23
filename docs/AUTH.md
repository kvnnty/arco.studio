# Authentication

Clerk is Arco's only authentication and session provider. Arco owns every
visible authentication screen and drives Clerk through its Core 3 custom-flow
hooks; Clerk's prebuilt sign-in, sign-up, and user-profile components are not
used.

Arco is passwordless. The supported entry methods are email magic links, Google
OAuth, and GitHub OAuth.

Official Clerk guides this implementation follows:

- [Email links](https://clerk.com/docs/nextjs/guides/development/custom-flows/authentication/email-links)
- [OAuth connections](https://clerk.com/docs/nextjs/guides/development/custom-flows/authentication/oauth-connections)
- [Session tasks](https://clerk.com/docs/nextjs/guides/development/custom-flows/authentication/session-tasks)

## Ownership

- Clerk owns sign-up, sign-in, verified emails, OAuth providers, magic-link
  delivery, session cookies, session revocation, MFA, and token refresh.
- Next.js renders Arco's custom authentication forms, calls Clerk's custom-flow
  APIs, and obtains a fresh session token for every API request.
- NestJS verifies Clerk tokens with the configured public key and rejects
  tokens whose `azp` origin is not explicitly allowed.
- PostgreSQL owns product data only. `User.clerkUserId` links a Clerk identity
  to projects, onboarding, billing, credits, and referrals on the first
  authenticated API request.

## Required configuration

Create one Clerk application and configure these values.

In Clerk Dashboard -> User & authentication:

- Require an email address.
- Disable the password authentication strategy.
- Enable email verification links for sign-up.
- Enable email verification links for sign-in.
- Disable email verification codes for sign-up and sign-in.

In Clerk Dashboard -> SSO connections:

- Add Google and GitHub for all users (development instances use Clerk shared
  credentials — no Google Cloud or GitHub OAuth app required locally).
- Enable each connection for sign-up and sign-in.

### Web

Use `.env.local` in `apps/web`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Pull keys from Clerk with `npx clerk@latest env pull` inside `apps/web`.

`ClerkProvider` fallback redirects default to `/dashboard`.

### API

```env
CLERK_SECRET_KEY=
CLERK_JWT_KEY=
CLERK_AUTHORIZED_PARTIES=http://localhost:3000,https://your-production-domain
```

`CLERK_JWT_KEY` is the PEM public key from Clerk Dashboard -> API keys -> JWT
public key. Never expose `CLERK_SECRET_KEY` to the browser.

## Custom UI flows (Clerk Core 3)

| Route | Purpose |
| --- | --- |
| `/sign-in` | Sign-in form |
| `/sign-up` | Sign-up form |
| `/sign-in/verify` | Email link verification (display only) |
| `/sign-up/verify` | Email link verification (display only) |
| `/sign-in/continue` | OAuth missing-requirements step |
| `/sso-callback` | OAuth callback when additional requirements are needed |

### Email links

Per Clerk's email-link guide:

- Sign-in page calls `signIn.emailLink.sendLink()` + `waitForVerification()` +
  `signIn.finalize()`.
- Sign-up page calls `signUp.create()` + `signUp.verifications.sendEmailLink()` +
  `waitForEmailLinkVerification()` + `signUp.finalize()`.
- Verify pages are display-only (`signIn.emailLink.verification` /
  `signUp.verifications.emailLinkVerification`).

### OAuth

Per Clerk's OAuth guide:

- `signIn.sso()` / `signUp.sso()` with:
  - `redirectCallbackUrl: /sso-callback` — when additional requirements are needed
  - `redirectUrl: /dashboard` (or stashed return URL) — when the session is created
- `/sso-callback` runs transfer/finalize logic and mounts `#clerk-captcha`.
- `/sign-in/continue` collects missing sign-up fields via `signUp.update()`.

### Post-auth navigation

All flows use Clerk's `finalize()` / `setActive()` `navigate` callback from
`auth-navigate.ts`:

1. If `session.currentTask` is set, stop — Clerk session tasks take over.
2. Otherwise `decorateUrl()` the destination and `router.push()`.

Arco product-user linking happens lazily on the first authenticated
`GET /users/me` request (`ClerkAuthGuard` on the API). Protected routes use
Clerk middleware `auth.protect()`; the API verifies tokens with
`CLERK_SECRET_KEY` (JWKS) per [Clerk verifyToken docs](https://clerk.com/docs/reference/backend/verify-token).

Do not remove the `clerk-captcha` mount points from sign-up, continue, or the
OAuth callback. Clerk uses them when bot protection challenges are required.

## Existing users

The migration preserves every internal `User`. On the first successful Clerk
sign-in, the API links the verified Clerk email to the existing internal user.
This claim is atomic: the same internal account cannot be linked to two Clerk
identities.

## Deployment order

1. Create and configure the Clerk development and production instances.
2. Add the web and API environment variables.
3. Apply the Prisma migration.
4. Deploy the API.
5. Deploy the web app.
6. Verify magic-link sign-in, magic-link signup verification, Google, GitHub,
   MFA/Client Trust, onboarding, logout, session revocation, and API rejection
   for missing or invalid tokens.
