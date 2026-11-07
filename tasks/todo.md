# Task Checklist: Bounded Per-Participant Match Read Model

Plan: `tasks/plan.md` · API root: `bb-api-src-inst-20260929` · Client root: `bankybondy-v2`

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 1 — Foundation (no behavior change)

### Task 1: Add `BondMatchFeed` model and indexes
**Description:** Create `src/app/modules/bondMatch/bondMatchFeed.model.ts` (+ interface) with
the per-participant shape from plan §5.2. Register indexes: unique `{bond:1,matchKey:1}`,
`{bond:1,score:-1}`, `{bonds:1}`, `{sourceBond:1,matchKey:1}`, TTL `{computedAt:1}`
(`expireAfterSeconds` from `MATCH_FEED_TTL_HOURS`, default 48 h). No reads/writes yet.

**Acceptance criteria:**
- [ ] Model exports `BondMatchFeed` with typed fields and `timestamps: false`.
- [ ] `createIndexes()` creates all five indexes; unique index rejects a duplicate
      `(bond, matchKey)` insert (verified in a scratch DB).
- [ ] `tsc --noEmit` clean.

**Verification:**
- [ ] Build passes.
- [ ] Manual script/REPL: insert same `(bond,matchKey)` twice → E11000 on second.
- [ ] `getIndexes()` shows TTL on `computedAt`.

**Dependencies:** None
**Files:** `src/app/modules/bondMatch/bondMatchFeed.model.ts`, `src/app/modules/bondMatch/bondMatchFeed.interface.ts`
**Scope:** S (2 files)

### Task 2: Add matching config dials and feature flags
**Description:** Extend `src/app/modules/bondRequest/matching.config.ts` with
`feedWrite`, `feedShadow`, `feedRead` booleans and `feedScanLimit` (default 400,
clamp 100–2000), `feedMaxRowsPerBond` (default 150, clamp 100–1000), `feedTtlHours`
(default 48). Follow the existing env parsing/clamping conventions.

**Acceptance criteria:**
- [ ] Defaults keep all flags off; server boots unchanged.
- [ ] Out-of-range values clamp instead of throwing (existing config style).
- [ ] Values are exported through the single `MATCHING` object.
- [ ] `.env.example` documents every new variable.

**Verification:**
- [ ] Boot API with defaults → no behavioral change in logs.
- [ ] Boot with `MATCH_FEED_SCAN_LIMIT=abc` → clamps/defaults, no crash.

**Dependencies:** None (parallel with Task 1)
**Files:** `src/app/modules/bondRequest/matching.config.ts`, `.env.example`
**Scope:** S (2 files)

### Task 3: Extract pure feed helpers + unit tests
**Description:** Add `src/app/modules/bondRequest/matching.feed.ts` with
`buildMatchKey(ids)` (sorted join `|`), `recordToFeedDocs(record, sourceBond, now)`,
`selectServedMatches(rows, opts)` (shared ranking/overscan logic), and the trim selection
helper. Wire a new `matching.feed.test.ts` into `src/scripts/runTests.ts`.

**Acceptance criteria:**
- [ ] `buildMatchKey` equals existing `signatureOf` output for the same ids.
- [ ] One record → N participant docs, all sharing the same `matchKey`.
- [ ] `selectServedMatches` reproduces legacy ordering on fixture data (score-based and
      legacy size-first modes).
- [ ] New suite is imported by `runTests.ts` and runs green.

**Verification:**
- [ ] `node dist/scripts/runTests.js` (after build) → feed suite passed.
- [ ] Property check: 100 random id orderings produce one unique key.

**Dependencies:** Task 1 (types), Task 2 (clamps)
**Files:** `src/app/modules/bondRequest/matching.feed.ts`, `src/app/modules/bondRequest/matching.feed.test.ts`, `src/scripts/runTests.ts`
**Scope:** M (3 files)

### Task 4: Serve-path instrumentation (baseline first)
**Description:** Add metrics for the matching serve path: duration histogram labelled
`legacy|feed|shadow`, rows scanned histogram, status counter, payload-size or row-count
gauge. Log a rate-limited warning when rows scanned equals the scan cap.

**Acceptance criteria:**
- [ ] `/metrics` exposes the new series after one request.
- [ ] Labels do not explode cardinality (no bond ids).
- [ ] Baseline values captured for 24 h before Phase 2 (recorded in PR description).

**Verification:**
- [ ] Curl `/metrics` and grep new names.
- [ ] Load a Matches page locally; rows-scanned ≈ 7,432 in legacy mode.

**Dependencies:** None
**Files:** `src/app/middlewares/metrics.ts`, `src/app/modules/bondRequest/bondRequest.service.ts`, `src/app/modules/bondRequest/matching.config.ts`
**Scope:** S (3 files)

### Checkpoint A (after Tasks 1–4)
- [ ] Build and test suite green.
- [ ] Flags off in every environment; API behavior identical to today.
- [ ] Baselines recorded (p95 serve, rows scanned, payload size).
- [ ] Review with human before Phase 2.

---

## Phase 2 — Dual write + backfill

### Task 5: Implement `persistMatchFeed` behind `MATCH_FEED_WRITE`
**Description:** In `matching.compute.ts`, after compute, call `persistMatchFeed(sourceBond,
records)` when the write flag is on: bulk upsert `(bond, matchKey)` for every participant,
discoverer-only cleanup (`matchKey: {$nin: currentKeys}`), and per-participant trim to
`feedMaxRowsPerBond`. Keep legacy `persistMatches` running. Feed write is best-effort in
this phase (log + metric on failure; do not block sealing).

**Acceptance criteria:**
- [ ] One recompute creates exactly `Σ participants` rows for that bond's current set.
- [ ] Rows removed from the result are deleted only for `sourceBond === bondId`.
- [ ] Trim keeps the top `feedMaxRowsPerBond` by score and deletes the rest.
- [ ] Sealing (`matchesComputedAt`/`matchesNextAt` under `matchesGen`) still happens even
      if the feed write errors; error is logged and counted.
- [ ] With the flag off, behavior is byte-identical to today.

**Verification:**
- [ ] Recompute a test bond; counts match expectation.
- [ ] Recompute with a shrunken result set; stale discoverer rows gone, foreign rows intact.
- [ ] `node dist/scripts/runTests.js` green.

**Dependencies:** Tasks 1–3, Checkpoint A
**Files:** `src/app/modules/bondRequest/matching.compute.ts`, `src/app/modules/bondRequest/matching.feed.ts`, `src/app/modules/bondRequest/matching.robot.ts`
**Scope:** M (3 files)

### Task 6: Feed-aware invalidation in robot
**Description:** Extend `invalidateBondMatches` to collect `readers = distinct('bond',
{bonds: oid})`, `deleteMany({bonds: oid})`, and re-enqueue readers (excluding self) at BG
priority when `MATCH_FEED_WRITE` is on. Keep the legacy invalidation path running for
rollback. Ensure pause, delete, unlink, and block all reach it.

**Acceptance criteria:**
- [ ] Pausing bond A deletes every feed row mentioning A; unrelated rows survive.
- [ ] Readers of deleted rows are re-enqueued exactly once per call (capped by
      `invalidationFanout`).
- [ ] Legacy path still executes during rollout.
- [ ] `matchesGen` is still incremented and agenda invalidated as today.

**Verification:**
- [ ] Integration script: pause → assert feed rows with A = 0, others unchanged, queue
      contains readers.
- [ ] Delete and unlink produce the same assertions.

**Dependencies:** Task 5
**Files:** `src/app/modules/bondRequest/matching.robot.ts`, `src/app/modules/bondRequest/bondRequest.service.ts`
**Scope:** S (2 files)

### Task 7: Notification snapshot from feed
**Description:** In `recomputeBond`, when the feed is authoritative for writes, snapshot
`previousSignatures` from `BondMatchFeed.find({bond, sourceBond: bondId})` instead of
`BondMatch`. Ensure `notifyNewMatches` behavior (collapse, `notifiedSignatures`, anti-rebound)
is unchanged.

**Acceptance criteria:**
- [ ] Same set of signatures is read before/after the change for a recompute.
- [ ] New match → one notification per bond (collapsed); reappearance → no badge rebound.
- [ ] Integration test covers: new match, disappeared match, reappeared match.

**Verification:**
- [ ] Notification suite green; manual inspect of `Notification` rows for a test user.

**Dependencies:** Task 5
**Files:** `src/app/modules/bondRequest/matching.robot.ts`, `src/app/modules/bondRequest/matching.notify.ts`
**Scope:** S (2 files)

### Task 8: Backfill + verify scripts
**Description:** Add `src/scripts/backfillMatchFeed.ts` (idempotent, `_id`-batched,
checkpointed, logs every 5 k docs, `createIndexes()` first) and
`src/scripts/verifyMatchFeed.ts` (per-bond top-100 comparison legacy vs feed, count
reconciliation, sample equality). Add npm scripts `match-feed:backfill`,
`match-feed:verify`. Local run only in this phase.

**Acceptance criteria:**
- [ ] Backfill completes on the current dataset; re-running changes nothing.
- [ ] Every active bond has expected row counts (bounded by trim).
- [ ] Verify reports 0 missing / 0 extra rows for sampled bonds at the same `computedAt`
      window, or documents expected legacy-vs-feed differences (other discoverers).
- [ ] Script exits non-zero on any reconciliation failure.

**Verification:**
- [ ] Run backfill twice; second run reports 0 upserts/0 deletes beyond timestamp refresh.
- [ ] Run verify; captured output attached to PR.

**Dependencies:** Tasks 5–7
**Files:** `src/scripts/backfillMatchFeed.ts`, `src/scripts/verifyMatchFeed.ts`, `package.json`
**Scope:** M (3 files)

### Checkpoint B (after Tasks 5–8)
- [ ] Dual-write has run for 24 h with zero feed-write errors (alert if not).
- [ ] Backfill reconciled; feed row counts sane per bond.
- [ ] Legacy serve still used everywhere; metrics baseline unchanged.
- [ ] Review with human before shadow mode.

---

## Phase 3 — Read path + shadow

### Task 9: Bounded feed read in `getMatchingBondRequest`
**Description:** Behind `MATCH_FEED_READ`, replace the unbounded `BondMatch.find({bonds})`
with `BondMatchFeed.find({bond}).sort({score:-1}).limit(feedScanLimit).lean()`; fetch the
start bond and feed rows in parallel. Feed ≤ 400 rows into the existing dedup/filter/rank/
slice/populate pipeline. Keep the legacy path intact behind the flag. Record
`bond_mode` in metrics/logs.

**Acceptance criteria:**
- [ ] Feed mode reads ≤ `feedScanLimit` rows (assert in code + metric).
- [ ] Response shape and page semantics unchanged (`status`, `total`, `page`, `limit`, `data`).
- [ ] Blocked/ghost/paused filters and page-only populate still applied.
- [ ] With the flag off, legacy behavior identical.

**Verification:**
- [ ] Local compare: same bond, legacy vs feed → matching ids/scores for top-10 (shadow).
- [ ] Metrics show rows scanned ≤ 400 and payload ≪ baseline.

**Dependencies:** Tasks 5–8, Checkpoint B
**Files:** `src/app/modules/bondRequest/bondRequest.service.ts`, `src/app/modules/bondRequest/matching.feed.ts`
**Scope:** M (2 files)

### Task 10: Shadow-read comparison harness
**Description:** Behind `MATCH_FEED_SHADOW`, on a sampled fraction of requests run both
reads, compute top-100 id-set Jaccard + first divergent pair, emit
`bond_match_shadow_diff_total` and `bond_match_shadow_jaccard`, always serve legacy.
Rate-limit warnings.

**Acceptance criteria:**
- [ ] Shadow adds no more than ~2× read cost on sampled requests; sampling ≤ 10 %.
- [ ] Divergence metric/log includes bond id, legacy-only ids, feed-only ids.
- [ ] No shadow failure can affect the served response (try/catch).

**Verification:**
- [ ] Run ≥ 1,000 sampled local requests; jaccard p50 ≥ 0.99.
- [ ] Toggle flag off → zero shadow metrics.

**Dependencies:** Task 9
**Files:** `src/app/modules/bondRequest/bondRequest.service.ts`, `src/app/middlewares/metrics.ts`
**Scope:** S (2 files)

### Task 11: Frontend query gating
**Description:** In `bond-tabs.tsx`, disable `useBondMatches` unless the Matches tab is
active (pass `null` otherwise); add `refetchOnWindowFocus: false` to the query in
`bond.hook.ts`. Keep poll-while-computing behavior.

**Acceptance criteria:**
- [ ] Opening Bonds on Requests/Links issues no `matching-bond` request.
- [ ] Clicking "Find match" switches tab and loads matches immediately.
- [ ] Window focus does not refetch; `computing` still polls every 3 s.
- [ ] No count badge regression when the Matches tab is open.

**Verification:**
- [ ] Browser network tab: no request on other tabs; one request on Matches.
- [ ] `pnpm build` and manual smoke test.

**Dependencies:** None (can ship early), but verify against Task 9
**Files:** `bankybondy-v2/src/app/(private)/(bare)/bonds/_components/tabs/bond-tabs.tsx`, `bankybondy-v2/src/services/hooks/bond.hook.ts`
**Scope:** S (2 files)

### Checkpoint C (after Tasks 9–11)
- [ ] Shadow divergence < 1 % over 24 h / 1,000+ samples.
- [ ] Load test: p95 ≤ 150 ms, ≤ 250 KB, rows ≤ scan limit.
- [ ] Client build green; no request on non-matches tabs.
- [ ] Review with human before cutover.

---

## Phase 4 — Cutover + cleanup

### Task 12: Canary → 100 % read
**Description:** Enable `MATCH_FEED_READ` on one API instance, observe 24 h, then all
instances. Keep `MATCH_FEED_WRITE` on. Record a 7-day observation checklist (p95, error
rate, shadow jaccard, notification spot-check, support tickets).

**Acceptance criteria:**
- [ ] p95 SLO met on canary, then fleet-wide; error rate flat.
- [ ] No spike in "empty matches" or notification complaints.
- [ ] Runbook updated with flag locations and rollback steps.

**Verification:**
- [ ] Grafana/Prometheus snapshots attached; 7-day checklist signed off.

**Dependencies:** Checkpoint C
**Files:** none (config/env change)
**Scope:** XS

### Task 13: Remove legacy path and contract
**Description:** ≥ 14 days after 100 % cutover: delete the legacy read branch, legacy
`persistMatches` call, legacy notification snapshot, and the `{bonds:1}`-dependent read
code. Drop old `BondMatch` indexes/collection only with explicit sign-off. Update comments
in `bondMatch.interface.ts` and module docs.

**Acceptance criteria:**
- [ ] No production code references `BondMatch` for the serve path.
- [ ] Feed is the single write and read model; flags removed or defaulted permanently.
- [ ] Dead code gone; `tsc` and tests green.
- [ ] Archive decision documented (drop vs keep).

**Verification:**
- [ ] `rg "BondMatch"` in serve path → only intentional references.
- [ ] Full test suite + build; staging smoke test.

**Dependencies:** Task 12 + 14-day soak
**Files:** `src/app/modules/bondRequest/bondRequest.service.ts`, `src/app/modules/bondRequest/matching.compute.ts`, `src/app/modules/bondRequest/matching.robot.ts`, `src/app/modules/bondMatch/*`
**Scope:** M (4–5 files)

### Task 14: Docs, runbook, and definition-of-done review
**Description:** Update `plan.md` status, record final measurements, add an operational
runbook section (flags, backfill, verify, rollback, alerts) and note the scale gate (§12).

**Acceptance criteria:**
- [ ] Runbook is executable by someone who did not write the code.
- [ ] Final before/after numbers recorded (latency, payload, rows scanned).
- [ ] Definition of Done in `plan.md` fully checked.

**Verification:**
- [ ] Peer walkthrough of runbook.

**Dependencies:** Task 13
**Files:** `tasks/plan.md`, `tasks/todo.md`, API module docs
**Scope:** S

### Checkpoint D (complete)
- [ ] All DoD items met.
- [ ] Legacy path removed only after archive decision.
- [ ] Sign-off recorded.

---

## Phase 5 — Wildcard quality (separate release, product sign-off)

### Task 15: Relevance-order and cap wildcard candidates
**Description:** Behind its own flag, change `fetchWildcardCandidates` from a global
unsorted `$limit 100` to a relevance-ordered, per-bond-capped contribution (e.g. ≤ 20 % of
`maxResults` wildcard edges). Add tests and measure match density + feed size before/after.

**Acceptance criteria:**
- [ ] Wildcard edges per bond ≤ configured cap; concrete-concrete edges unaffected.
- [ ] Synthetic test: wildcard-heavy graph no longer saturates `maxResults`.
- [ ] Product reviews the visible match-count change before enablement.

**Verification:**
- [ ] Before/after feed row counts and density report attached.
- [ ] Matching suite green; rollback by flag verified.

**Dependencies:** Phase 4 stable in production
**Files:** `src/app/modules/bondRequest/matching.candidates.ts`, `src/app/modules/bondRequest/matching.config.ts`, tests
**Scope:** S–M

---

## Global Definition of Done (applies to every task)

- [ ] Index-backed, bounded queries only in the serve path.
- [ ] Behavior behind a flag; rollback path exists.
- [ ] Tests added/updated in `runTests` convention; `tsc --noEmit` clean.
- [ ] Metrics/log lines added where the task changes runtime behavior.
- [ ] No secrets, DB URLs, or credentials printed or committed.
- [ ] No destructive migration without explicit approval.
