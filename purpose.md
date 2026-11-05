## Why this project exists

Bankybondy is a mutual-help network: a member posts a **bond** (what they `offer` and
what they `want`), the backend matches it against other members' bonds, and the two
people link up. Reputation comes from ratings awarded inside completed bonds, and a
**People** directory plus nearby (geolocation) matching is how members find each other.

The backend is finished and evolving on its own. v1 was the frontend that grew around it
and drifted from it: guessed payload shapes, hardcoded strings, dead code, `any`-typed
responses, layout copy-pasted per page. **v2 is that frontend rebuilt properly against
the real API**, keeping v1 only as a record of which features exist.

## The one rule that decides everything else

`../bb-api-src-inst-20260929` **is the spec**. Every endpoint we consume is read there
first — route, controller, service, validation — and cited by `file:line` when it is
wired. `../bb-web-src-boton-20260929` (v1) is a feature reference, never a contract: it
disagrees with the API in several places. When this doc and the backend disagree, the
backend wins and this doc gets corrected.

## What v2 is, structurally

- Next.js App Router, route groups `(auth)` / `(public)` / `(private)`, protected by
  `src/proxy.ts`.
- Session lives in HttpOnly `accessToken` / `refreshToken` cookies; the browser never
  holds a refresh token. `/api/v1/*` rewrites to the backend with `credentials: "include"`.
- Network layer: typed `ofetch` in `src/services/api/*.api.ts`, TanStack Query in
  `src/services/hooks/*.hook.ts`. Forms: `@tanstack/react-form` + Zod v4 in
  `src/validations/`. UI: shadcn/Base UI primitives only. Copy in `messages/{en,es}` via
  next-intl.
- Mock UI first for a design pass, then the real data layer — never both at once.
