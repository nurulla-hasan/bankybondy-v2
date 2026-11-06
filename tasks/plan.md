# Implementation Plan: Messages page — mock UI (phase 1)

## Overview

`/messages` is a nav link with no page behind it. This phase builds the messenger **UI only**, on fake data shaped exactly like the backend payloads, so the user can judge the UX before any REST/Socket.IO wiring. Phase 2 deletes `_mock/` and re-points one file's imports to `@/services`.

## Architecture decisions

- **Inline two-pane** (`?c=<conversationId>`), single-pane swap + back arrow below `lg`. No third media pane. (user-approved)
- **Mock behind one gateway module** (`_mock/mock-chat-gateway.ts`) exposing hook-shaped functions; only `messages-shell.tsx` imports it. Every local-only cheat is tagged `// MOCK-ONLY:`.
- **Types are real now** — `src/types/chat-api.types.ts` mirrors the backend, including the two different inner pagination keys and the nulled deleted-message content, so phase 2 swaps fetchers, not shapes.
- **`ChatTimestamp`** uses `Intl.RelativeTimeFormat` + `useLocale()` because the shared `formatRelativeTime` (`src/lib/utils.ts:30`) passes no date-fns locale and prints English in the Spanish UI.
- Fixed-height shell via a new `STICKY_HEIGHT` constant in `src/lib/layout.ts` (repo bans bracket dimensions inside app pages); internal scrolling uses the `min-h-0 flex-1 overflow-y-auto overscroll-contain` template from `src/components/common/modal.tsx:57,71`.

## Backend facts this is built on

| Fact | Source |
|---|---|
| Chat list `GET /conversation/get-chat-list` → `data = { meta, data:[…] }`, responds **201** | `conversation.service.ts:352-360`, `conversation.controller.ts:12` |
| Item projection has `userData`/`chatGroup`/`bondLink`/`project`/`lastMessage`/`unseenMsg`/`members`, never `email` | `conversation.service.ts:290-334` |
| `type` enum: `chat-group \| one-two-one \| project-group \| bond-link-group` | `conversation.enum.ts:1-6` |
| Messages `GET /message/get-messages` → `data = { meta, result:[…] }`, **newest-first** | `message.service.ts:214-222`, `$sort createdAt:-1` |
| Deleted message ships `text/imageUrl/videoUrl/pdfUrl` as **null** | `message.service.ts:185-199` |
| `seenBy` is never written → no read receipts exist | `message.service.ts` |
| No typing socket event exists | grep of `handleChat.ts`/`socket.ts` |
| `project-group` chat is 403 and filtered from the list | `handleChat.ts:289-415`, `message.service.ts:78-86`, `conversation.service.ts:78` |
| Attachments must be exact CloudFront URLs from `POST /file-upload/upload-conversation-files` | `attachmentUrl.ts:38-55` |

## Deliberately out of scope (phase 1)

Media pane · typing indicator · read receipts · real uploads · group creation · message paging (disabled "Load older" only) · `project-group` · `/chatting` (v1's is an audio library, its own feature).

## Task List

- [ ] Task 1: `chat-api.types.ts` + `/message` → `/messages` route fix + `STICKY_HEIGHT` + `Messages` i18n namespace + empty two-pane shell
- [ ] Task 2: mock data + mock gateway + conversation list (4 types, unread pill, `ChatTimestamp`, skeleton, search, `?mockState=empty|error`)
- [ ] Task 3: two-pane wiring — `?c=` selection, no-conversation state, mobile swap + back arrow
- [ ] Task 4: thread rendering — bubbles, media, deleted, day separators, auto-scroll
- [ ] Task 5: composer + mock interactions — Enter-to-send, local append, hide, badge clear, preview notice

### Checkpoint: after Tasks 1-2
- [ ] `pnpm exec tsc --noEmit` + `pnpm exec eslint <new files>` clean
- [ ] List renders in en **and** es, light **and** dark

### Checkpoint: after Tasks 3-4
- [ ] 375 → 1400 px all sane; only the panes scroll, never the document
- [ ] Browser back unselects the conversation

### Checkpoint: complete
- [ ] `pnpm build` passes once at the end
- [ ] `grep -rn "_mock\|MOCK-ONLY" src/app` shows the mock confined to `_mock/` + tagged lines
- [ ] en/es key parity script clean for the `Messages` namespace
- [ ] User has reviewed the UI in the browser; **no commit without explicit permission**

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Fixed-height shell fights the sticky navbar + footer | Med | `STICKY_HEIGHT` constant, `min-h-0` on every flex ancestor, footer deliberately below the fold |
| Mock shapes drift from the real payload before phase 2 | High | Types written from backend file:line facts, not from v1; inner-key difference (`data` vs `result`) modelled explicitly |
| Fake interactions get mistaken for real ones later | Med | Everything mock sits in `_mock/` + `// MOCK-ONLY:` tags + a visible preview notice |
| SSR/client mismatch on relative timestamps | Low | Render the timestamp only after hydration, same trick as `src/components/common/relative-time.tsx` |

## Noticed, not fixing

- `formatRelativeTime` is English-only across 6 existing screens — separate i18n fix.
- Chat-list preview ships raw `lastMessage`, so a deleted last message still leaks its text server-side (`conversation.service.ts:81-94`) — raise with the backend.
