# Profile — build plan

Status: approved direction, no code written yet.
Owner: nurulla-hasan + Qoder.
Scope: self-profile (`/profile`) + settings (`/settings`) for v2.

## 0. Source of truth

**The backend is the spec. The v1 frontend (`bb-web-src-boton-20260929`) is a
feature reference only — never a contract.** v1 guessed at shapes, hardcoded
strings, and in several places disagreed with the API. Every decision below cites
`bb-api-src-inst-20260929` file:line. If the backend and this doc ever disagree,
the backend wins and this doc gets corrected.

Backend root: `C:\Users\golap\Desktop\bankybondy\bb-api-src-inst-20260929\src\app`
Module root: `modules/`

## 1. Verified endpoints

| Endpoint | Auth | Content-type | Notes (backend ref) |
|---|---|---|---|
| `GET /user/get-my-profile` | user, admin, superAdmin | — | `user/user.services.ts:339-347` → `NormalUser.findOne({email})`. Raw doc: **no populate, no projection**. Route is registered twice (`user.routes.ts:39` and `:57`, second one drops `admin`) — harmless, but don't rely on order. |
| `GET /normal-user/single-user/:id` | superAdmin, user | — | `normalUser/normalUser.services.ts:850-875`. Aggregate pipeline: populates `skills` (`:1167`) and recomputes **live** `reputation` from ratings (`:1200-1220`). |
| `PATCH /normal-user/update-profile` | user | **multipart** | routes `:16-20` = `auth → uploadFile() → parseMultipartData → validateRequest(updateNormalUserData)`. |
| `PATCH /normal-user/bonds-visibility` | user | JSON | routes `:76-80`. **No `validateRequest`** — body `{bondsPublic}` goes straight through. |
| `PATCH /normal-user/people-visibility` | user | JSON | routes `:82-86`. Same: no validation layer. |
| `PATCH /normal-user/update-location` | user | JSON | validated: `lat ∈ [-90,90]`, `lng ∈ [-180,180]`, `mode?: auto\|manual`, default `auto` (`normalUser.validation.ts:68-80`). Already wired in v2 as `updateMyLocation`. |
| `POST /auth/change-password` | user, admin, superAdmin | JSON | `auth/auth.services.ts:80-143`. Requires `oldPassword` + `newPassword` (`user.validation.ts:36-41`) **and** compares `confirmNewPassword` in the service (`:88-91`) — all three must be sent. Returns fresh access+refresh and re-issues cookies. |
| `DELETE /user/delete-account` | user | JSON | `user.routes.ts:50-55`, body `{password}` required (`user.validation.ts:83-87`). Clears the refresh cookie server-side. |

Out of scope for this plan, contract noted for later rounds:
`GET/PATCH /notification/preferences` (`req.body.mutedCategories`),
`POST /notification/digest-preview` (no body), `POST /user-block/block/:id`,
`DELETE /user-block/unblock/:id`, `GET /user-block/my-blocked-users`.

## 2. `update-profile` contract, exactly

**Transport.** `FormData` with one JSON field named `data` plus optional files.
`middlewares/parseMultipartData.ts:10-31`: if `req.body.data` is present it must be
a string containing a JSON **object**, else 400 (`Invalid multipart data` /
`Invalid multipart JSON`). If `data` is absent the body passes through untouched.

**File fields** (`normalUser.controller.ts:9-16`):
- `profile_image` → written to `req.body.profile_image`
- `profile_cover` → written to `req.body.cover_image`  ← field name ≠ body key, do not "fix" this

**Editable whitelist** (`normalUser.services.ts:96-107`) — anything else is
silently dropped (mass-assignment guard):
`name, phone, profile_image, cover_image, gender, dateOfBirth, address, bio, skills, socialLinks`

**Hard rules.**
- `email` in the payload → 400 `"You can not change the email"` (`:154-159`). Email is never editable; show it read-only.
- `bio` runs through moderation **before save** and **fails closed** if the
  moderation service is unreachable (`:178-181`). The UI must surface the rejection
  as an error toast and keep the form dirty so the user can retry — a silent
  failure here looks like "my bio didn't save".

**Server validation** (`normalUser.validation.ts:29-46`): every string is bare
optional — **no length caps server-side**. `skills` = `array(string regex ^[0-9a-fA-F]{24}$)`
(ObjectId strings only, not populated objects). `socialLinks` = **`array(string().url())`**
— a flat array of URLs, not a keyed object. `gender` = `MALE | FEMALE` only
(`user/user.enum.ts:1-4`); `OTHER` is not accepted. Length/quantity caps are ours
to own client-side; registration caps skills at 50 (`user.validation.ts:21`), so we
mirror 50 as the profile ceiling.

## 3. What the two profile reads actually return

This is where v1 got it wrong and where v2 must not copy it.

`getMyProfile` returns the **full NormalUser document**:
- `_id` is the **profile id** (= JWT `profileId`), and `user` is the **auth account id**.
  People links must use `_id`.
- `skills` are **unpopulated ObjectId strings** (`string[]`), so names must be
  resolved elsewhere.
- `reputation` is the **cached** doc value and can be stale.
- Includes PII and internals: `phone`, `dateOfBirth`, `location`, `locationMode`,
  `mutedNotificationCategories`, `digestOptOut`, subscription trail.

`single-user/:id` called **by the owner** returns the same document **plus**
populated `skills: [{_id,name}]` **plus** live `reputation`, and does not strip PII
for `isSelf` (`:855-862`). Operator-only notes (`subscriptionSetReason`,
`subscriptionSetBy`, `subscriptionHistory`) are stripped for non-admins even from
the owner (`:863-873`).

**Decision:** the profile page renders from `getPerson(myProfileId)` (one call,
populated skills + live reputation) and keeps `useGetMyProfile()` as the identity
source that is already cached under `["auth","profile"]`. No double-fetch for the
same data, no N+1 `single-skill` lookups like v1 did.

**Error codes the profile view must handle** (from `:894-955`):
- `404 User not found` — account blocked by an admin, or a mutual block
  (deliberately indistinguishable, do not leak which).
- `403` with code `PROFILE_HIDDEN` — `listedInPeople:false` and viewer is not the
  owner or an accepted friend. Own profile is never hidden to self, so this only
  matters for the public page (already handled in v2).

## 4. Session / transport facts

- Requests go through the Next rewrite `/api/v1/* → BACKEND_URL/*`
  (`next.config.ts`), `apiClient` is `credentials: "include"` (`src/lib/api-client.ts`).
  The backend reads `req.cookies.accessToken` (`middlewares/auth.ts:18`).
- `POST /auth/login` returns **tokens only** — no user object
  (`auth/auth.services.ts:73-77`). v2's `LoginResponse.user: AuthUser` does not
  exist in the response; auth state comes from `get-my-profile`.
- After a successful password change, `passwordChangedAt` invalidates every older
  access token: the backend answers 403 with code `PASSWORD_CHANGED`
  (`middlewares/auth.ts:107-119`). New cookies are set by the same response, so the
  client refreshes the profile query rather than force-logging-out (v1 logged out).
- `/profile` and `/settings` are **already** in `PRIVATE_ROUTES`
  (`src/constants/routes.ts:2-3`) — the route guard needs no change, only pages.
- Today `/profile` is linked from `navbar-user-menu.tsx:80`, `mobile-nav.tsx:146`,
  `navbar-search.tsx:340`, `navbar-notifications.tsx:195` and **404s**.

## 5. Known v2 type bugs to fix in this work

1. `src/types/people-api.types.ts:32` — `socialLinks?: Record<string, string | undefined>`
   contradicts `string[]`. Wrong type would silently corrupt the edit form.
2. `src/types/auth.types.ts:6-18` — `AuthUser` doesn't reflect what
   `get-my-profile` really returns (`user`, `skills: string[]`, `reputation`,
   `gender`, `dateOfBirth`, `bondsPublic`, `listedInPeople`, `location`).
3. `src/types/auth.types.ts:25-28` — `LoginResponse.user` is not returned by the API.
4. `ChangePasswordPayload` (`:69-73`) — `currentPassword` doesn't exist; needs
   required `oldPassword`, `newPassword`, `confirmNewPassword`.

Fixing (1) is a breaking change for `people/_components/profile/*` consumers: audit
those call sites in the same slice rather than patching around them.

## 6. Slices

Each slice ends green: `pnpm lint` + `pnpm build` pass, and the behaviour is checked
in the browser. **There is no test runner in this repo** (`package.json` has only
`dev/build/start/lint`); introducing vitest is a separate decision, not part of this plan.

### Slice 1 — data layer (no UI)
- `src/types/profile.types.ts` — `MyProfile`, `UpdateProfileInput`, `VisibilityPatch`.
- `src/services/api/profile.api.ts` — `updateMyProfile` (FormData builder: `data` field +
  `profile_image`/`profile_cover`), `updateBondsVisibility`, `updatePeopleVisibility`.
- `src/services/hooks/profile.hook.ts` — `useUpdateMyProfile` (invalidates
  `["auth","profile"]` + `peopleKeys` profile), `useUpdateVisibility` with optimistic
  write and rollback on error.
- `src/validations/profile.validation.ts` — caps the server doesn't enforce:
  `name` 2–60, `bio` ≤ 500, `phone`/`address` max, `gender` `MALE|FEMALE`,
  `skills` ≤ 50 and all ObjectId-shaped, `socialLinks` each `.url()` and ≤ 5.
- Fix §5 types (1)–(4) and their call sites.
- `messages/{en,es}/profile.json` + `Profile` namespace in `src/i18n/request.ts`.
- Done when: a `pnpm build` passes and a script-less manual PATCH round-trips
  (change `bio`, see it come back; try sending `email`, see the 400 handled).

### Slice 2 — `/profile` page (fixes the dead link)
- `src/app/(private)/(bare)/profile/page.tsx`
- `_components/cards/profile-hero-card.tsx` + `profile-hero-card-skeleton.tsx` —
  avatar-forward, cover band, reputation pill, one-line skills with `+N`, exactly the
  `person-card` geometry.
- **No tabs on this page** (decided in the mock pass): hero → visibility → details grid.
  Left column `AccountDetailsCard` + `LinksCard`, right column `AboutCard` +
  `SkillsCard` + `SecurityCard`. Bonds/Reviews stay on the public profile
  (`people/_components/profile/person-bonds.tsx`, `person-reviews.tsx`) only.
- `SecurityCard` = password row + delete-account row; each button opens a modal
  (`dialogs/change-password-dialog.tsx`, `dialogs/delete-account-dialog.tsx`).
- No page `SectionHeading` (the hero carries name + actions); `aria-busy` +
  `isFetching` opacity on the grid.
- Done when: visiting `/profile` from the navbar menu shows the real profile with
  loading, empty, and error states, and the skeleton matches the card pixel-for-pixel.

### Slice 3 — visibility + location
- `_components/shared/visibility-toggles.tsx` — two switches on the profile page:
  "appear in People" (`listedInPeople`) and "public bonds" (`bondsPublic`), optimistic,
  rollback + `errorToast` on failure.
- Location: reuse `updateMyLocation`, wrapped in a `useShareMyLocation` that reads
  `navigator.geolocation`, handles denial/unsupported, and always `URL.revokeObjectURL`
  on any object URLs created (v1 leaked them).
- Done when: toggling off `listedInPeople` makes the profile disappear from `/people`
  for a different account while `/profile` keeps working for the owner.

### Slice 4 — `/settings`
- `src/app/(private)/(bare)/settings/page.tsx` + `_components/forms/edit-profile-form.tsx`.
  Settings is the edit form only — no tabs; password and account deletion live in the
  `SecurityCard` modals on `/profile` (Slice 2).
- Edit-profile form: TanStack `useForm` + `profileSchema`, two side-by-side columns of
  cards (left: identity, about + skills — right: locked email, location, birthdate,
  links), `image-crop-dialog` for the avatar, `useFieldArray` for `socialLinks`,
  unsaved-changes guard (v1 had none),
  `form.reset(defaultValues)` on refetch instead of the v1 stale-closure reset.
- Password modal (`profile/_components/dialogs/change-password-dialog.tsx`): three-field
  form, on success invalidate auth and let the cookie
  rotation settle; if a `PASSWORD_CHANGED` 403 arrives, send the user to `/login`
  deliberately rather than showing a generic error.
- Danger zone (`profile/_components/dialogs/delete-account-dialog.tsx`): password +
  `DELETE` confirmation → `DELETE /user/delete-account`, then
  clear the query cache and `router.replace("/login")` (no `window.location.href`).
- Done when: an unsaved edit warns before leaving, avatar crop→upload lands in S3 and
  the new URL is in the profile, and password change keeps the session alive.

## 7. Explicit non-goals

Not ported from v1, because they are dead code or out of this scope:
relatives/bio modals and `relativesApi`, legacy `ProfileHeader`/`ProfileBio`/
`SocialLinks`/`ReceivedRatings` components, cover-image display
(`SHOW_COVER=false` in v1, the field is still accepted by the API but nothing renders it),
manual `locationMode` UI, `/blocked-users`, notification preferences, subscriptions.

Also not doing: copying v1's `BlueShell` copy-paste layout, `any`-typed payloads,
hardcoded strings, or its N+1 skill fetches.

## 8. Open questions for the backend owner

1. Should `get-my-profile` populate `skills` and return live `reputation` so the
   client doesn't need a second call? (Cheap: same aggregate as `single-user`.)
2. `update-profile` has no length caps — should `name`/`bio`/`address` gain server-side
   maxima so the client limits aren't the only enforcement?
3. `bonds-visibility` / `people-visibility` bypass `validateRequest`; add coercion so a
   non-boolean body can't write junk, or is that deliberate?
4. `socialLinks` as a flat URL array loses the platform label. Keep flat (and render
   hostnames), or is a `{platform,url}` shape planned?
5. `gender` is `MALE|FEMALE` only — confirm there's no third value expected in the UI.

## 9. Skills to use, per phase

- **`source-driven-development`** — running throughout; this plan exists because the
  backend source is the authority. Re-verify against `bb-api-src-inst-20260929`
  before claiming any behaviour.
- **`api-and-interface-design`** — Slice 1 (payload types, mutation surface, cache-key
  and invalidation contract between `["auth","profile"]` and people keys).
- **`security-and-hardening`** — Slice 1 and 4: PII in profile responses, the
  email/whitelist mass-assignment guard, URL validation on `socialLinks`, file-type and
  size limits before upload, password re-auth for delete-account, never logging tokens.
- **`deprecation-and-migration`** — Slice 1 §5: the `socialLinks` type change ripples
  into the existing public-profile components; migrate call sites rather than shim them.
- **`incremental-implementation`** — the slice structure itself; one slice per
  verification pass, no big-bang commit.
- **`frontend-ui-engineering`** — Slices 2–4: card/skeleton geometry, tabs, switches,
  form layout, WCAG (labels, `aria-busy`, focus rings), responsive grid.
- **`test-driven-development`** — applies to pure logic (FormData `data` builder,
  ObjectId/URL validators, visibility rollback) but the repo has no runner yet: raise
  it rather than assume, and fall back to build + manual verification if it stays
  un-approved.
- **`browser-testing-with-devtools`** + **`run`** — Slices 2–4 acceptance: drive the
  real profile page and settings form, watch the network tab for the multipart body
  and the visibility PATCH, confirm no console errors.
- **`debugging-and-error-recovery`** — whenever a request 400s/403s or a state doesn't
  settle (esp. `PASSWORD_CHANGED`, moderation fail-closed, `PROFILE_HIDDEN`).
- **`performance-optimization`** — Slice 2/3: avoid the double-fetch v1 did, correct
  `staleTime`/`placeholderData`, no N+1 skill fetches, no object-URL leaks.
- **`code-review-and-quality`** + **`code-simplification`** — end of each slice, before
  committing.
- **`constraint-driven-development`** — keep the bar written here from sliding:
  `components/ui/card.tsx` stays untouched, no `.env` reads, no `@ts-ignore`,
  no extracting grid class strings into constants.
- **`git-workflow-and-versioning`** — one atomic commit per slice, style matching
  `feat:` / `refactor:` history.
- **`documentation-and-adrs`** — if §8 gets answered, record the decision and update
  this file; §3's read-strategy choice is the one worth an ADR.
- **`doubt-driven-development`** — optional, only if we want an adversarial pass over
  the PII handling and the §5 type changes before Slice 4 ships.
