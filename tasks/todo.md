# Tasks: Messages page — mock UI (phase 1)

See `tasks/plan.md` for the decisions and the backend facts everything is cited against.

## Task 1: Contract, route fix, scaffold

**Description:** Put the real chat payload shapes in TypeScript, close the logged-out hole on `/messages`, and render the empty two-pane shell so the layout is reviewable from the first slice.

**Acceptance criteria:**
- [ ] `src/types/chat-api.types.ts` mirrors the backend: chat list `{ meta, data }` vs messages `{ meta, result }`, `type` enum, deleted-message fields nullable, `unseenMsg`, `members`
- [ ] `src/constants/routes.ts` says `/messages`; logged-out visit redirects
- [ ] `STICKY_HEIGHT` lives in `src/lib/layout.ts`, no bracket dimensions inside the page
- [ ] `Messages` namespace registered in `src/i18n/request.ts` with `messages/{en,es}/messages.json`
- [ ] `/messages` renders the two panes with placeholder content

**Verification:** `pnpm exec tsc --noEmit`; `pnpm exec eslint <new files>`; logged-out redirect checked in the browser.

**Dependencies:** none · **Scope:** small-medium (5 files)

## Task 2: Mock gateway + conversation list

**Description:** Fake conversations behind hook-shaped functions and render the list.

**Acceptance criteria:**
- [ ] All 4 conversation types render (1-a-1, chat-group with stacked avatars, bond-link with status badge, `lastMessage: null`)
- [ ] Unread pills for `0` / `7` / `120` (99+); times via `ChatTimestamp` in the active locale
- [ ] `SearchInput` filters; skeleton, empty (`?mockState=empty`) and error (`?mockState=error`) states exist
- [ ] Mock lives only in `_mock/`; gateway reverses newest-first

**Verification:** browser in en + es, light + dark.

**Dependencies:** Task 1 · **Scope:** medium (5 files)

## Task 3: Two-pane wiring

**Description:** Selection, desktop empty-selection state, mobile swap.

**Acceptance criteria:**
- [ ] `?c=` push so browser back unselects; deep link opens the right thread
- [ ] Desktop shows `no-conversation-state` when nothing is selected
- [ ] Below `lg` only one pane shows; back arrow returns to the list
- [ ] Document never scrolls — only pane bodies

**Verification:** resize 375 → 1400 px; back button behaviour.

**Dependencies:** Task 2 · **Scope:** small (3 files)

## Task 4: Thread rendering

**Description:** Bubbles and everything inside a conversation.

**Acceptance criteria:**
- [ ] Mine `bg-primary`/right, theirs `bg-muted`/left + avatar + sender name in groups
- [ ] Image grid, PDF chip, deleted bubble, day separators
- [ ] Opens scrolled to the bottom; long thread scrolls inside the pane
- [ ] Legible in dark mode both ways

**Verification:** browser, both themes.

**Dependencies:** Task 3 · **Scope:** medium (5 files)

## Task 5: Composer + mock interactions

**Description:** The send affordance and the small behaviours that make the mock feel real.

**Acceptance criteria:**
- [ ] `Textarea` auto-grows; Enter sends, Shift+Enter newlines; send disabled when empty
- [ ] Appended message renders at once and survives switching conversations
- [ ] Kebab → Hide removes the row; opening a conversation clears its badge
- [ ] Slim "Preview — fake data" notice visible
- [x] `grep -rn "_mock\|MOCK-ONLY" src/app` shows the mock confined as designed

**Verification:** browser, both locales.

**Dependencies:** Task 4 · **Scope:** medium (4 files)

## Checkpoint: complete

- [x] `pnpm build` once, green
- [x] en/es key parity for `Messages`
- [ ] User reviewed in the browser
- [ ] **No commit without explicit permission**
