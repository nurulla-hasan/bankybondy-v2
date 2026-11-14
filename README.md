# Bankybondy Web

The web app for **Bankybondy**, a mutual-help community where people share what
they can offer, say what they need, and connect through meaningful exchanges.

Members can publish bonds, discover people and potential matches, build
connections, and chat. The interface supports English and Spanish.

## What’s inside

- **Bonds** — share an offer and a want so members can find a useful exchange.
- **People and friends** — discover members and manage connections.
- **Messaging** — chat with live updates through Socket.IO.
- **Profiles and subscriptions** — manage an account and its membership.
- **Donations and legal pages** — public information and support flows.
- **English and Spanish** — localized interface copy with `next-intl`.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | React, Tailwind CSS, Base UI and shared components |
| Server state | TanStack Query |
| Forms and validation | TanStack Form and Zod |
| Localization | `next-intl` |
| API client | `ofetch` |
| Realtime | Socket.IO client |
| Package manager | pnpm `12.16.1` |

## Get started

### Requirements

- Node.js 20.9 or later
- Corepack and pnpm `12.16.1`
- A running Bankybondy API for authenticated and data-backed features

Enable the pinned package manager and install dependencies:

```bash
corepack enable
corepack prepare pnpm@12.16.1 --activate
pnpm install --frozen-lockfile
```

Create a local environment file from the template.

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS, Linux, or Git Bash:

```bash
cp .env.example .env.local
```

Set the API and authentication values described below, then start the app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

`.env.example` is the configuration template. Keep real credentials in
`.env.local` or your deployment secret store; never commit them.

| Variable | Required | Purpose |
| --- | --- | --- |
| `BACKEND_API_URL` | For server-side API access | Backend origin used by Next.js rewrites and server requests. Locally, this is commonly `http://localhost:5000`; in Docker, use the backend service name and port. |
| `NEXT_PUBLIC_API_BASE_URL` | Yes for browser API calls | Browser API base URL, normally ending in `/api/v1`, for example `http://localhost:5000/api/v1`. |
| `JWT_ACCESS_SECRET` | Yes for session checks | Must match the backend access-token signing secret so the web proxy can verify sessions. Keep it private and do not prefix it with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SOCKET_URL` | Optional | Socket.IO origin. If omitted, it is derived from `NEXT_PUBLIC_API_BASE_URL` by removing `/api/v1`. |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public app origin used for metadata and SEO defaults. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical website origin used for canonical URLs, sitemap, and social metadata. Defaults to `NEXT_PUBLIC_APP_URL`, then `https://bankybondy.com`. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional | Google sign-in client ID. This is a public identifier, not a client secret. |
| `GOOGLE_SITE_VERIFICATION` | Optional | Google Search Console verification value. |
| `BING_SITE_VERIFICATION` | Optional | Bing site verification value. |
| `YANDEX_SITE_VERIFICATION` | Optional | Yandex site verification value. |

`NEXT_PUBLIC_*` values are included in the browser bundle at build time. Set
them to the correct public HTTPS origins before building for production; changing
the runtime environment afterward does not rewrite an already-built bundle.

## Useful commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm lint` | Run ESLint |
| `pnpm build` | Create the optimized production build |
| `pnpm start` | Serve the production build (run `pnpm build` first) |

## How requests flow

```text
Browser ── /api/v1/* ──> Next.js rewrite ──> Bankybondy API
   │
   └────── /socket.io ────────────────────> Bankybondy API
```

The API handles application data and authentication. The web app stores the
session in `HttpOnly` cookies; access tokens are not kept in browser
`localStorage`. Protected pages are gated by `src/proxy.ts`.

## Project layout

```text
messages/       English and Spanish translations
public/         Static assets
src/
  app/          App Router pages, layouts, and route groups
  components/   Shared UI and feature components
  constants/    Shared route and app constants
  hooks/        Reusable React hooks
  i18n/         Locale configuration
  lib/          API, auth, formatting, and other utilities
  provider/     App-wide context and providers
  services/     API functions and TanStack Query hooks
  types/        Shared TypeScript types
  validations/  Form and request schemas
```

## Production

For a local production check:

```bash
pnpm build
pnpm start
```

The repository also includes a standalone-output `Dockerfile`. Provide its
`NEXT_PUBLIC_*` build arguments and the server-side `BACKEND_API_URL` for the
target environment. Do not include production secrets in image build arguments
or source control.