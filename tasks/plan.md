# Implementation Plan: Friends Management (v2)

## Overview

Give v2 a `/friends` page and the actions around it, so a user can see incoming friend
requests, requests they sent, and their accepted friends — and accept, reject, cancel or
unfriend from the UI. Today v2 only wires `POST /friend-request/send`
(`src/services/api/people.api.ts:72`); the other seven backend endpoints are unused, and
`FRIEND_REQUEST` notifications resolve to `routeFor → null`
(`src/components/layout/navbar-notifications.tsx`), so a request arrives that the user can
neither see nor answer.

## Key finding that shapes the UI

Backend `friendRequest` has **no follower graph** — only requests and accepted pairs
(`friendRequest.enum.ts:1-5`). The endpoint names are misleading:

| Endpoint | Actually returns | Sorted/filtered by |
| --- | --- | --- |
| `GET /friend-request/followers` | **incoming Pending** requests (receiver = me) | `service.ts:322-339` |
| `GET /friend-request/following` | **outgoing Pending** requests (sender = me) | `service.ts:413-430` |
| `GET /friend-request/friends` | **Accepted** pairs, blocked excluded | `service.ts:211-274` |

So v1's four tabs (friends / followers / following / pending) collapse to **three real
tabs**: `requests` (incoming pending), `sent` (outgoing pending), `friends`. We label them
that way instead of copying "Followers/Following", which would promise a follow graph the
backend cannot serve.

## Architecture Decisions

- **REST only, no Socket.IO.** All eight endpoints are plain HTTP
  (`friendRequest.routes.ts:10-55`), unlike chat. No new dependency.
- **ID trap, documented once here.** `PATCH /accept-reject/:id` takes the
  **FriendRequest `_id`** (`service.ts:93-101`), while `DELETE /cancel/:receiverId` and
  `DELETE /unfriend/:friendId` take the **other user's profileId**
  (`service.ts:457-479`). Every list item carries both (`item._id` and
  `item.friendInfo/_id`), so we must pick the right one per action.
- **Status strings are capitalized enums** — the frontend sends `"Accepted"` /
  `"Rejected"` in a `{ status }` body (`friendRequest.validation.ts:10-16`). Not lowercase,
  not a query flag.
- **Pagination meta lives inside `data`** (`{ meta, result }`), because controllers never
  pass top-level meta (`sendResponse.ts:18-25`). Matches the existing
  `RawPeopleList` shape (`src/types/people-api.types.ts:44-48`), so `CustomPagination` and
  the `select: r => r.data` hook style carry over unchanged.
- **Populated person shape is narrow**: `{ _id, name, profile_image, skills: string[] }`
  where `skills` is an array of **name strings**, not `RawPersonSkill` objects — different
  from `RawPerson.skills`. Needs its own interface, not a reuse of `RawPerson`.
- **No Zod schema.** The project rule ties Zod v4 to TanStack Form. There is no form here —
  bodies are one enum field and the rest are path params — so we type the input instead.
- **Entry point = the profile dropdown, not the nav bar.** `Friends` is added beside
  Profile and Settings in `src/components/layout/navbar-user-menu.tsx:80-87`, plus the
  mobile equivalent at `mobile-nav.tsx:146`. The design-ordered nav array
  (`nav-items.ts:41-46`) stays untouched.
- **Invalidation, never optimistic writes.** Follows `useSendFriendRequest`
  (`src/services/hooks/people.hook.ts:126-148`) and the repo's mutation style.
- **Blocked users are already filtered server-side** (`getBlockedIdsFor`,
  `userBlock.service.ts:16,39`) — no client-side block filtering.
- **`cancel` / `unfriend` are idempotent** (200 + `data: null` even if nothing matched,
  `service.ts:457-479`), so the UI cannot rely on the response to know work was done — it
  must trust the refetch.
- **New i18n namespace `Friends`**: `messages/{en,es}/friends.json` plus one registration
  line in `src/i18n/request.ts` (namespaces are listed by hand, lines 18-26).

## Task List

- [ ] Task 1: Friend-request types + API client (contract layer)
- [ ] Task 2: Query/mutation hooks with invalidation
- [ ] Checkpoint: Contract layer
- [ ] Task 3: `/friends` page shell with three URL-synced tabs (read-only lists)
- [ ] Task 4: Accept, reject, cancel, unfriend actions + confirmation + `Friends` i18n copy
- [ ] Checkpoint: Page works
- [ ] Task 5: Entry points — pending-count badge, notification route, profile link
- [ ] Checkpoint: Complete

Full acceptance criteria and verification per task: `tasks/todo.md`.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Passing profileId to `accept-reject/:id` (or the request id to `cancel`) → silent 400 | High | Task 1 names the params distinctly (`requestId` vs `personId`) and Task 4 cites `friendRequest.service.ts:93-101,457-479` in the call sites |
| `friendInfo` / `followerInfo` / `followingInfo` key differs per endpoint | Medium | One item interface with the three optional keys; each tab reads the key its own endpoint returns |
| Sending lowercase `"accepted"` fails enum validation | Medium | Task 1 defines `FriendRequestStatus = "Pending" \| "Accepted" \| "Rejected"` from the enum file, not from memory |
| Badge poll adds a per-focus request | Low | `staleTime` + invalidation from accept/reject/cancel; no `refetchInterval` until someone asks for it |
| Nav design list (`nav-items.ts:41-46`) is intentional and has dead `/messages`, `/chatting` links | Low | Out of scope here — see Open Questions; we do not touch that array |

## Open Questions

- Badge freshness is focus-driven (`staleTime` + invalidation), no `refetchInterval`
  polling.
- Rejected requests: the backend keeps the row with `status: "Rejected"` and there is no
  "seen/replied" list endpoint, so a rejected request just disappears from the incoming
  list. Confirm that's acceptable versus surfacing history.
