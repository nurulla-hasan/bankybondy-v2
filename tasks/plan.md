# Implementation Plan: Bond Rating UI Flow (mark-as-complete → rate counterpart)

## Overview

Close the reputation loop on the Bonds → Links tab. Today `BondLinkCard`
(`src/app/(private)/(bare)/bonds/_components/cards/bond-link-card.tsx`) is mock
UI: an "Open chat" toast, no way to complete a bond or rate the counterpart.
This feature wires the two real backend endpoints and adds a rating dialog:
each participant marks their side of the trade complete, then rates the other
side (1–5 stars + optional comment, editable via upsert).

## Backend spec (source of truth: `../bb-api-src-inst-20260929`)

| Fact | Citation |
| --- | --- |
| `POST /bond-link/mark-as-complete/:id`, auth user; adds caller to `markAsCompletedBy`; link flips to `Completed` only when ALL participants marked; returns the updated BondLink doc | `bondLink.routes.ts:28-32`, `bondLink.service.ts:492-546`, `bondLink.controller.ts:44-55` |
| Already marked → no-op returns link; `Canceled` link → 400 | `bondLink.service.ts:508-525` |
| `POST /bond-rating/add-rating` body `{ userId, bondLink, rating, comment? }`; `rating` integer 1–5; `comment` trimmed max 500, optional | `bondRating.routes.ts:10-15`, `bondRating.validation.ts:3-15` |
| Guards: no self-rating; rater must be a participant AND be in `markAsCompletedBy`; rated `userId` must own one of the link's `requestedBonds` | `bondRating.service.ts:23`, `:30-37`, `:55-63`, `:67-76` |
| Rating is an idempotent upsert per `(ratedBy, rated, bondLink)` — re-submitting edits stars/comment | `bondRating.service.ts:78-113` |
| Rating stays `applied:false` (no reputation impact) until the whole link completes; applied in bulk at completion — UI must not assume a rating counts immediately | `bondRating.interface.ts:12-17`, `bondRating.service.ts:96-100` |
| Public ratings view `GET /bond-rating/public/:userId` — already wired in v2 (`people.api.ts:56-63`) | `bondRating.routes.ts:19-23` |

## Architecture decisions

- **Entry point = the link card, not a new page.** "Mark as complete" on an
  Ongoing link (self not yet in `markAsCompletedBy`) → on success opens
  `RateBondLinkDialog`. Once self has marked, the card shows a "Rate" /
  "Edit ratings" action instead — matches the backend's per-person timing
  (you rate when you're done, not when everyone is).
- **Counterparts derived client-side**: owners of `requestedBonds` minus self
  (same set the backend accepts, `bondRating.service.ts:67-76`). Chain links
  with 2+ counterparts get a person switcher in the dialog; each person's
  rating saves independently (upsert-safe).
- **No optimistic rating writes.** Rating mutates cached reputation
  server-side; invalidate links + people-ratings queries on success.
- **Mock chat button stays** — messaging is a separate feature, out of scope.
- **UI constraints** (AGENTS.md): shadcn `dialog.tsx` primitive, star control
  uses `amber-accent` token (already in `globals.css:96`), no `size="sm"`
  buttons, Zod v4 schema in `src/validations/`, ofetch client in
  `src/services/api/`, hooks in `src/services/hooks/`, copy in
  `messages/{en,es}/bonds.json`.

## Task List

### Phase 1: Data layer (Types → Validations → API → Hooks)

- [x] Task 1: Types + Zod schema for the rating payload
- [x] Task 2: API client — `markAsCompleteBond`, new `bond-rating.api.ts` with `addRating`
- [x] Task 3: Hooks — `useMarkBondLinkComplete`, `useAddBondRating` + invalidation

### Checkpoint: Data layer
- [x] `npm run lint` + `npm run build` clean; hook signatures match card needs

### Phase 2: UI slice

- [x] Task 4: `RateBondLinkDialog` — star row, comment field, counterpart switcher, per-person save; en/es copy
- [x] Task 5: `BondLinkCard` actions — mark-complete → dialog, rate/edit path, "you marked" hint

### Checkpoint: Complete
- [ ] Lint + build clean
- [ ] Manual e2e on dev server: mark complete → rate → re-open → edit rating; verify links list refresh and people-profile reviews reflect applied ratings (completed links only)
- [ ] Code review pass (5-axis) before reporting done

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| `markAsCompletedBy`/`participants` are raw ObjectId arrays — mismatch with auth `user._id` shape | High | Derive "self" from `useAuth()`; compare via `String(id)` like the backend does |
| Rating a counterpart who has no bond in `requestedBonds` (deleted bond edge) → 404 from backend | Med | Only offer counterparts parsed from `requestedBonds` owners |
| User expects rating to change reputation instantly (it's `applied:false` until link completes) | Med | Dialog copy: rating counts when the trade is fully completed; edit path exists |
| next-intl key drift en vs es | Low | Add both locales in the same task, keys mirrored |

## Open Questions

- Should completed links also surface a "Rate" action even when self marked
  long ago (yes per backend — upsert always allowed after self-mark; plan
  assumes yes).
