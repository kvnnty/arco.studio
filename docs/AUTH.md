# Authentication

Clerk is Arco's only authentication and session provider. Arco owns every
visible authentication screen and drives Clerk through its Core 3 custom-flow
hooks; Clerk's prebuilt sign-in, sign-up, and user-profile components are not
used.

## Ownership

- Clerk owns sign-up, sign-in, verified emails, passwords, OAuth providers,
  account recovery, session cookies, session revocation, and token refresh.
- Next.js renders Arco's custom authentication forms, calls Clerk's custom-flow
  APIs, and obtains a fresh session token for every API request.
- NestJS verifies Clerk tokens with the configured public key and rejects
  tokens whose `azp` origin is not explicitly allowed.
- PostgreSQL owns product data only. `User.clerkUserId` links a Clerk identity
  to projects, onboarding, billing, credits, and referrals.

## Required configuration

Create one Clerk application, enable the desired email and social providers,
and configure these values:

In Clerk Dashboard -> User & authentication:

- Require an email address.
- Enable email verification codes for sign-up.
- Enable password sign-up and password sign-in.
- Enable email-code sign-in if the passwordless option should be available.
- Enable Google and GitHub only when those buttons should be active.
- Register `/sso-callback` on each development and production domain as an
  allowed OAuth redirect URL.

### Web

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/post-auth
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/post-auth
```

### API

```env
CLERK_SECRET_KEY=
CLERK_JWT_KEY=
CLERK_AUTHORIZED_PARTIES=http://localhost:3000,https://your-production-domain
```

`CLERK_JWT_KEY` is the PEM public key from Clerk Dashboard -> API keys -> JWT
public key. Never expose `CLERK_SECRET_KEY` to the browser.

## Custom UI flows

- `/login` supports password, email-code, Google, GitHub, MFA, and Clerk Client
  Trust verification inside Arco's UI.
- `/signup` supports email/password signup, email-code verification, Google,
  GitHub, and Clerk bot protection inside Arco's UI.
- `/forgot-password` handles reset-code delivery, verification, password
  replacement, and other-session revocation.
- `/sso-callback` completes Core 3 OAuth transfers and session finalization
  without rendering Clerk's default UI.
- Dashboard account security uses Clerk's user and session APIs behind Arco
  controls.

Do not remove the `clerk-captcha` mount points from signup or the OAuth callback.
Clerk uses them when bot protection challenges are required.

## Existing users

The migration preserves every internal `User` and removes only custom auth
credentials and sessions. On the first successful Clerk sign-in, the API links
the verified Clerk email to the existing internal user. This claim is atomic:
the same internal account cannot be linked to two Clerk identities.

Existing users must create or sign into a Clerk account with the same verified
email. Product projects, billing, credits, referrals, and onboarding state are
then retained.

## Deployment order

1. Create and configure the Clerk development and production instances.
2. Add the web and API environment variables.
3. Apply the Prisma migration.
4. Deploy the API.
5. Deploy the web app.
6. Verify email/password, email-code sign-in, configured OAuth providers,
   signup verification, recovery, MFA/Client Trust, onboarding, logout, session
   revocation, and API rejection for missing or invalid tokens.
