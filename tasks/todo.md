# Task List: Bond Rating UI Flow

See `tasks/plan.md` for backend citations and decisions.

## Task 1: Types + Zod schema for rating payload

**Description:** Add `AddRatingInput` (`userId`, `bondLink`, `rating`,
`comment?`) to `src/types/bond-api.types.ts` and a `ratingSchema` (Zod v4:
int 1–5 required, comment trimmed max 500 optional) plus
`RatingValues` export in `src/validations/bond.validation.ts`, mirroring
`bondRating.validation.ts:3-15` of the backend.

**Acceptance criteria:**
- [ ] Types compile and match the backend body shape exactly
- [ ] Schema rejects rating 0/6/non-integer and comment > 500 chars

**Verification:**
- [ ] `npm run lint` and `npx tsc --noEmit` clean

**Dependencies:** None
**Files likely touched:** `src/types/bond-api.types.ts`, `src/validations/bond.validation.ts`, `src/validations/index.ts` (if re-export needed)
**Estimated scope:** XS

## Task 2: API client — mark complete + add rating

**Description:** Add `markAsCompleteBond(id)` (`POST /bond-link/mark-as-complete/:id`)
to `bond-link.api.ts` and a new `bond-rating.api.ts` with `addBondRating(input)`
(`POST /bond-rating/add-rating`), exported through `services/api/index.ts`.
Cite endpoints in doc comments per project convention.

**Acceptance criteria:**
- [ ] Both functions typed with existing `ApiResponse` envelope
- [ ] `markAsCompleteBond` returns the updated `RawBondLink`

**Verification:**
- [x] Lint/build clean

**Dependencies:** Task 1
**Files likely touched:** `src/services/api/bond-link.api.ts`, `src/services/api/bond-rating.api.ts` (new), `src/services/api/index.ts`
**Estimated scope:** S

## Task 3: Hooks — mutations with invalidation

**Description:** In `bond.hook.ts`: `useMarkBondLinkComplete` (invalidates
`bondKeys.links()`) and `useAddBondRating` (invalidates `bondKeys.links()` and
the people public-ratings query so profile reviews refresh). Export from
`services/hooks/index.ts` / `services` barrel as existing hooks are.

**Acceptance criteria:**
- [ ] Follows existing mutation style (`onSuccess` invalidation, no optimistic writes)
- [ ] Ratings list on a visited people profile refetches after a new rating

**Verification:**
- [x] Lint/build clean

**Dependencies:** Task 2
**Files likely touched:** `src/services/hooks/bond.hook.ts`, `src/services/hooks/index.ts`
**Estimated scope:** S

## Checkpoint: Data layer
- [x] `npm run build` clean
- [ ] Review with human before UI phase (skipped only if pre-approved)

## Task 4: RateBondLinkDialog + i18n copy

**Description:** New `bonds/_components/dialogs/rate-bond-link-dialog.tsx`:
shadcn Dialog; counterpart switcher (avatar + name, from `requestedBonds`
owners minus self); accessible 1–5 star row (`amber-accent` token,
radiogroup semantics); optional comment textarea (500 max via `ratingSchema`
field-level validation); per-person Save using `useAddBondRating`; shows
already-saved state when re-opened (initial stars from existing rating if
available, else empty). Add all copy keys to `messages/en/bonds.json` and
`messages/es/bonds.json`.

**Acceptance criteria:**
- [ ] No hardcoded colors/sizes; no `size="sm"` buttons; mobile-first layout
- [ ] Rating disabled until stars chosen; comment trimmed to 500
- [ ] Saving twice edits (no duplicate error) — matches backend upsert
- [ ] en + es key sets identical

**Verification:**
- [x] Lint/build clean
- [ ] Manual: open dialog from a link card, save a rating, re-open, edit it

**Dependencies:** Task 3
**Files likely touched:** `src/app/(private)/(bare)/bonds/_components/dialogs/rate-bond-link-dialog.tsx` (new), `messages/en/bonds.json`, `messages/es/bonds.json`
**Estimated scope:** M

## Task 5: BondLinkCard actions — complete + rate entry points

**Description:** Replace the mock-only footer in `bond-link-card.tsx`:
Ongoing & self not in `markAsCompletedBy` → "Mark as complete" button
(`useMarkBondLinkComplete`); on success open `RateBondLinkDialog` for the
counterparts. Ongoing/Completed & self marked → "Rate" / "Edit ratings"
button opening the same dialog. Hint text reflects state ("you marked
complete — waiting on others"). Keep the mock chat button untouched.

**Acceptance criteria:**
- [ ] `String(id)` comparison for self vs `markAsCompletedBy`/`participants`
- [ ] Card shows correct action per state (not-marked / marked / link completed)
- [ ] Errors surface via `getErrorMessage` + `errorToast` (no silent swallow)

**Verification:**
- [x] Lint/build clean
- [ ] Manual e2e: full flow on dev server (mark → rate → edit; second participant completes → rating applied, profile reviews update)

**Dependencies:** Task 4
**Files likely touched:** `src/app/(private)/(bare)/bonds/_components/cards/bond-link-card.tsx`
**Estimated scope:** M

## Checkpoint: Complete
- [ ] `npm run lint` + `npm run build` clean
- [ ] Manual e2e verified in browser
- [ ] 5-axis code review pass done
- [ ] plan.md task boxes ticked off
