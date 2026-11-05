# Task List: Friends Management (v2)

Backend spec: `../bb-api-src-inst-20260929/src/app/modules/friendRequest/**`. Read
`tasks/plan.md` first — the endpoint names lie about what they return.

## Task 1: Friend-request types + API client

**Description:** Define the wire contract for the seven unused friend endpoints as
TypeScript types and `ofetch` client functions, exactly as the backend returns them, so
every later task codes against a real shape instead of a guess.

**Acceptance criteria:**
- [ ] `FriendRequestStatus = "Pending" | "Accepted" | "Rejected"` (capitalized, from `friendRequest.enum.ts:1-5`)
- [ ] `RawFriendPerson` = `{ _id, name, profile_image?, skills?: string[] }` — skills as plain strings, per `service.ts:211-252`
- [ ] `RawFriendRequestItem` carries `_id`, `status`, `createdAt?`, `updatedAt?` and the three optional person keys `friendInfo` / `followerInfo` / `followingInfo`
- [ ] `RawFriendList = { meta: PaginationMeta; result: RawFriendRequestItem[] }` and `RawPendingCount = { count: number }`
- [ ] Seven functions: `getFriendRequests`, `getSentRequests`, `getFriends`, `getPendingCount`, `acceptOrRejectRequest(requestId, status)`, `cancelRequest(receiverId)`, `unfriend(friendId)` — each with a `/** Endpoint: ... */` doc comment like `people.api.ts`
- [ ] Action params named `requestId` vs `personId` at the call boundary so the id trap (`service.ts:93-101` vs `:457-479`) cannot be mixed up

**Verification:**
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] Field names re-checked against `friendRequest.controller.ts` + `.service.ts` line by line

**Dependencies:** None
**Files likely touched:** `src/types/friend-api.types.ts` (new), `src/types/index.ts`, `src/services/api/friend.api.ts` (new), `src/services/api/index.ts`
**Estimated scope:** Small: 4 files

## Task 2: Query + mutation hooks

**Description:** Wrap Task 1 in TanStack Query hooks with the repo's key factory and
invalidation style, so lists, the count badge and every action share one cache story.

**Acceptance criteria:**
- [ ] `friendKeys` factory (`all` / `lists` / `list(kind, params)` / `pendingCount`) mirroring `peopleKeys` (`people.hook.ts:33-44`)
- [ ] `useFriendRequests(kind, params)` covers the three list endpoints without triplicating the query body
- [ ] `usePendingFriendRequestCount` with `staleTime`, no `refetchInterval`
- [ ] `useAcceptOrRejectFriendRequest`, `useCancelFriendRequest`, `useUnfriend` invalidate both the list keys and `pendingCount`; no optimistic writes
- [ ] All hooks reachable from `@/services`

**Verification:**
- [ ] `npx tsc --noEmit` + `npm run lint` clean
- [ ] Grep confirms no `setQueryData` hand-patching where an invalidate does the job
- [ ] Invalidation targets proven correct by reading each mutation's affected lists

**Dependencies:** Task 1
**Files likely touched:** `src/services/hooks/friend.hook.ts` (new), `src/services/hooks/index.ts`
**Estimated scope:** Small: 2 files

## Checkpoint: Contract Layer
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] Contract matches backend line-for-line (no invented fields)
- [ ] Review with human before the UI phase

## Task 3: `/friends` page with three tabs (read-only)

**Description:** Build the page shell and the three list tabs, rendering people rows with
loading, empty and error states, without any action buttons yet.

**Acceptance criteria:**
- [ ] `src/app/(private)/(bare)/friends/page.tsx` uses `PageWrapper` + `SectionHeading` like `bonds/page.tsx`
- [ ] Tab state is URL-synced via `useNextFilter` (`?tab=requests|sent|friends`), default `requests`, unknown value falls back to default — same shape as `bond-tabs.tsx:20-41`
- [ ] Tab counts come from `data.meta.total`; the requests tab shows `count` so pending volume is visible at a glance
- [ ] Each tab: skeleton while `isPending`, `EmptyState` on empty (`SearchX`/`WifiOff` style per `links-tab.tsx`), error state via `getErrorMessage`, `CustomPagination` wired to `?page`
- [ ] Rows link to `/people/[id]` using `friendInfo._id` (profile id, never `user`)
- [ ] No `size="sm"` buttons; colors via CSS variables only; `w-full` is the only allowed className width override

**Verification:**
- [ ] `npx tsc --noEmit` + `npm run lint` clean
- [ ] `npm run build` succeeds with the new route present
- [ ] Manual: `/friends` lists all three tabs with real data, tab switch updates the URL, back/forward works

**Dependencies:** Task 2
**Files likely touched:** `src/app/(private)/(bare)/friends/page.tsx`, `friends/_components/friends-tabs.tsx`, `friends/_components/friend-list.tsx`, `friends/_components/friend-row-skeleton.tsx`
**Estimated scope:** Medium: 4 files

## Task 4: Actions + `Friends` i18n copy

**Description:** Put accept / reject on the requests tab, cancel on the sent tab, unfriend
on the friends tab, and add the English + Spanish copy the page needs.

**Acceptance criteria:**
- [ ] Accept and reject call `PATCH /friend-request/accept-reject/:_id` with body `{ status: "Accepted" | "Rejected" }` and the **request** id
- [ ] Cancel and unfriend use the **person** profile id; unfriend sits behind `ConfirmationModal` (destructive), cancel does not need one
- [ ] Every mutation surfaces errors with `getErrorMessage` + `errorToast`, and success with `successToast` — no silent swallow
- [ ] Buttons use the built-in `loading` / `loadingText` props (per `button.tsx:47-78`), keyed to the row being acted on, not the whole list
- [ ] `messages/en/friends.json` + `messages/es/friends.json` have identical key sets, registered as the `Friends` namespace in `src/i18n/request.ts`
- [ ] Backend 400 "Invalid or already handled request" (`service.ts:102-107`) shows a human-readable toast, not a raw string

**Verification:**
- [ ] `npx tsc --noEmit` + `npm run lint` + `npm run build` clean
- [ ] Manual e2e on dev server: send from account B → accept on A → row moves to Friends; reject → disappears from incoming; cancel a sent request; unfriend with confirmation
- [ ] Manual: second accept of the same request surfaces the 400 as a readable toast and the list self-corrects

**Dependencies:** Task 3
**Files likely touched:** `friends/_components/friend-list.tsx`, `friends/_components/friend-actions.tsx`, `messages/en/friends.json`, `messages/es/friends.json`, `src/i18n/request.ts`
**Estimated scope:** Medium: 5 files

## Checkpoint: Page Works
- [ ] All four acceptance-criteria groups for Tasks 3-4 met
- [ ] `npm run build` clean
- [ ] Manual e2e passes with two accounts, both locales
- [ ] Review with human before entry-point wiring

## Task 5: Entry points — badge, notification route, profile link

**Description:** Make the feature reachable so pending requests stop being invisible:
a count badge, a clickable `FRIEND_REQUEST` notification, and a link in the profile
dropdown.

**Acceptance criteria:**
- [ ] `routeFor` in `navbar-notifications.tsx` maps `FRIEND_REQUEST` → `/friends?tab=requests` and `FRIEND_ACCEPTED` → `/friends?tab=friends` (both currently return `null`/`/people/[id]`)
- [ ] The Friends dropdown item shows the pending count inline (hidden at `0`, capped like
      the existing unread badges, e.g. `9+`) — no new floating badge on the avatar
- [ ] `/friends` link added beside Profile and Settings in
      `src/components/layout/navbar-user-menu.tsx:80-87`, and in the mobile nav equivalent
      (`mobile-nav.tsx:146` area)
- [ ] Badge query is shared (one `usePendingFriendRequestCount` instance), not one per component
- [ ] `nav-items.ts:41-46` array left untouched — no new top-level nav entry

**Verification:**
- [ ] `npx tsc --noEmit` + `npm run lint` + `npm run build` clean
- [ ] Manual: account B sends a request → account A sees the badge without reloading the page twice, and clicking the notification lands on the requests tab
- [ ] Manual: accepting from the tab drops the badge count

**Dependencies:** Task 4
**Files likely touched:** `src/components/layout/navbar-notifications.tsx`,
`src/components/layout/navbar-user-menu.tsx`, `src/components/layout/mobile-nav.tsx`
**Estimated scope:** Medium: 3 files

## Checkpoint: Complete
- [ ] Every task's acceptance criteria met
- [ ] `npm run lint` + `npm run build` clean
- [ ] Manual e2e verified in the browser, en + es
- [ ] 5-axis code review pass done
- [ ] Work committed as atomic commits (contract / page / actions / entry points)
