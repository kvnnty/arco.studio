# Authentication

Clerk is Arco's only authentication and session provider. Arco owns every
visible authentication screen and drives Clerk through its Core 3 custom-flow
hooks; Clerk's prebuilt sign-in, sign-up, and user-profile components are not
used.

Arco is passwordless. The supported entry methods are email magic links, Google
OAuth, and GitHub OAuth.

## Ownership

- Clerk owns sign-up, sign-in, verified emails, OAuth providers, magic-link
  delivery, session cookies, session revocation, MFA, and token refresh.
- Next.js renders Arco's custom authentication forms, calls Clerk's custom-flow
  APIs, and obtains a fresh session token for every API request.
- NestJS verifies Clerk tokens with the configured public key and rejects
  tokens whose `azp` origin is not explicitly allowed.
- PostgreSQL owns product data only. `User.clerkUserId` links a Clerk identity
  to projects, onboarding, billing, credits, and referrals.

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

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/post-auth
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/post-auth
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Pull keys from Clerk with `npx clerk@latest env pull` inside `apps/web`.

### API

```env
CLERK_SECRET_KEY=
CLERK_JWT_KEY=
CLERK_AUTHORIZED_PARTIES=http://localhost:3000,https://your-production-domain
```

`CLERK_JWT_KEY` is the PEM public key from Clerk Dashboard -> API keys -> JWT
public key. Never expose `CLERK_SECRET_KEY` to the browser.

## Custom UI flows (Clerk Core 3)

Routes match [Clerk's official custom-flow guides](https://clerk.com/docs/nextjs/guides/development/custom-flows/authentication/email-links) exactly:

| Route | Purpose |
| --- | --- |
| `/sign-in` | Sign-in form |
| `/sign-up` | Sign-up form |
| `/sign-in/verify` | Email link verification (display only) |
| `/sign-up/verify` | Email link verification (display only) |
| `/sign-in/continue` | OAuth missing-requirements step |
| `/sso-callback` | OAuth callback |
| `/post-auth` | Post-auth Arco routing |

- **OAuth:** [custom OAuth flow](https://clerk.com/docs/nextjs/guides/development/custom-flows/authentication/oauth-connections) — `signIn.sso()` / `signUp.sso()` with `redirectCallbackUrl: /sso-callback` and `redirectUrl: /post-auth`.
- **SSO callback:** transfer/finalize logic on `/sso-callback` with `#clerk-captcha`.
- **OAuth missing fields:** `/sign-in/continue` collects required sign-up fields via `signUp.update()`.
- **Magic link sign-in:** sign-in page sends link + `waitForVerification()` + `finalize()`; `/sign-in/verify` is display-only via `signIn.emailLink.verification`.
- **Magic link sign-up:** sign-up page sends link + `waitForEmailLinkVerification()` + `finalize()`; `/sign-up/verify` is display-only via `signUp.verifications.emailLinkVerification`.
- **Post-auth routing:** `/post-auth` links the Clerk user to Arco and sends users to `/dashboard` or `/onboarding`.

Do not remove the `clerk-captcha` mount points from signup, signup continue, or
the OAuth callback. Clerk uses them when bot protection challenges are required.

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
