# Implementation Plan: Bounded Per-Participant Match Read Model

**Status:** Proposed — awaiting approval. No production code or migration has been run.
**Scope:** `bb-api-src-inst-20260929` (Express/Mongoose) + `bankybondy-v2` (Next.js client)
**Owner:** Backend (matching) with a small frontend slice
**Date:** 2026-11-07

---

## TL;DR (বাংলা)

Bonds → Matches ট্যাব slow হওয়ার আসল কারণ একটা **unbounded read**: প্রতি request-এ
`BondMatch.find({ bonds: id })` পুরো match set (top bond-এ ৭,৪৩২ docs, ~4.4 MB) নিয়ে
blocking sort করে, অথচ পেজে লাগে মাত্র ১০টা। DB execution ৩৮ ms, কিন্তু wall time ১৫–৭৯ s —
মানে খরচটা transfer + serialization-এ।

ফিক্স (long-term): match গুলোকে **per-participant read model**-এ লিখব — প্রতিটা bond-এর জন্য
তার নিজের top rows, `{bond, matchKey}` unique upsert, TTL + trim দিয়ে bounded। Serving হবে
index-backed top-N (`{bond:1, score:-1}`), payload ~4.4 MB → ~150 KB। সাথে wildcard candidate
flood আর frontend-এর অপ্রয়োজনীয় fetch ঠিক করব। **Phase 1-এ Redis cache লাগবে না** — কারণ
BondMatch নিজেই materialized cache; দ্বিতীয় cache মানে দ্বিতীয় invalidation bug surface।

---

## 1. Overview

The Matches tab (`/bonds?tab=matches&request=<id>`) is served by
`GET /bond-request/matching-bond`, which today:

1. loads the start bond,
2. runs **one unbounded query** over every `BondMatch` document that mentions it,
3. sorts, dedups, filters blocked/ghost users, re-ranks, then slices 10 rows for the page.

The query is not index-servable for its sort (multikey `bonds_1`), so MongoDB does
IXSCAN → FETCH every matching doc → blocking SORT in memory, and the API serializes the
whole set. The page only needs `limit` rows. The fix is to change the read model so the
serving query is bounded and index-ordered, and to keep that read model correct under
recompute, pause, delete, block, and notification flows.

## 2. Evidence (measured, not assumed)

Local production-data check against the configured Atlas cluster (read-only):

| Metric | Value |
|---|---|
| Active bonds (`WAITING_FOR_LINK`, not paused/linked) | 186 |
| `BondMatch` documents stored | 18,600 (= 186 × `maxResults` 100) |
| Documents referencing the hottest bond | 7,432 |
| Payload returned to client before slicing | ~4.4 MB |
| MongoDB explain: plan | `IXSCAN bonds_1` → `FETCH 7,432` → blocking `SORT` |
| DB execution time | ~38 ms |
| Endpoint wall time (3 runs) | 15,543 ms / 79,194 ms / 41,520 ms |
| Wildcard-active bonds (`surprise`/`empty`) | 43 |
| Frontend page size / poll | 10 rows; 3 s while `status === "computing"` |

Conclusion: CPU/SQL time is not the bottleneck. The bottleneck is **reading and
transferring an unbounded superset per request**, repeated on every page change, tab
fetch, and window-focus refetch. `empty ↔ empty` scoring (0.9) plus a global wildcard cap
of 100 means dense bonds saturate `maxResults`, which is why the hottest bond is
referenced by 7,432 documents. That also explains the visible quality problem in the
screenshot (69 %/67 % cards where both sides offer/want "Nada").

## 3. Goals, Non-Goals, SLOs

**Goals**

- A Matches request reads a bounded, index-ordered set (`O(limit)`, not `O(all matches)`).
- p95 server time for `GET /bond-request/matching-bond` ≤ 150 ms at current volume, and
  ≤ 300 ms at 20× volume; p99 ≤ 500 ms.
- Response payload ≤ 250 KB per page request (currently ~4.4 MB before slicing).
- Zero change to the API response contract consumed by the client.
- Every task independently shippable and reversible behind env flags.

**Non-goals (this plan)**

- Redesigning the scoring model or the cycle-discovery algorithm.
- Migrating match computation off the worker/robot.
- Redis/micro-cache (justified in §5.6).
- Changing what a "match" means to the product (wildcard semantics ship separately, §5.9).

**SLOs to add**

- `bond_match_serve_p95_ms < 150` (current volume), alert at 300 for 10 min.
- `bond_match_feed_rows_scanned` p95 ≤ 400; alert if any request hits the scan cap.
- Feed shadow-read divergence (top-100 set) `< 1 %` of sampled requests during rollout.
- `bond_match_errors_total / bond_match_requests_total < 0.1 %`.

## 4. Current write/read lifecycle (for reference)

- Worker (`worker.ts`, BullMQ queue `bond-matching`) recomputes one bond at a time.
- `computeAndCacheMatches` → `persistMatches` = `deleteMany({ sourceBond })` +
  `insertMany(...)` for that discoverer's matches, then seals `matchesComputedAt` /
  `matchesNextAt` guarded by `matchesGen`.
- Invalidation deletes by discoverer: `distinct('sourceBond', { bonds: id })` then
  `deleteMany({ sourceBond: { $in: affected } })`, and re-enqueues affected bonds.
- Read side (the hot path) is `bondRequest.service.ts` `getMatchingBondRequest`
  (~line 676; hot query ~line 762).
- Notifications compare sorted-id signatures (`signatureOf`) against the discoverer's
  previous rows in `BondMatch` (`matching.robot.ts`) — this contract must survive.

## 5. Architecture Decisions

### 5.1 New collection `BondMatchFeed` (expand/contract), not in-place mutation

Mutating `BondMatch` in place would conflate "one row per discovered match" (write model)
with "one row per visible participant" (read model), break the discoverer-scoped cleanup,
and make rollback nearly impossible. We add a new collection, dual-write, backfill,
shadow-read, then cut over. Old collection stays intact as the rollback path until the
contract phase.

Rejected alternative: rewrite `BondMatch` to be per-participant and migrate in place
(single collection, less storage). Rejected because a failed backfill or index build would
corrupt the only serving path, and rollback would require reverse migration.

### 5.2 Read model: one row per `(participant bond, match)`

```ts
// bondMatchFeed.model.ts
{
  bond: ObjectId,        // participant whose feed this row belongs to (indexed, serving key)
  matchKey: string,      // canonical: sorted participant ids joined by '|' (stable, = signatureOf)
  bonds: ObjectId[],     // all participants (needed by MatchCard and invalidation)
  users: ObjectId[],     // participants' user ids (block filtering without populate)
  score: number,
  parts: { sem: number; rep: number; prox: number; fresh: number },
  type: 'entry' | 'surprise' | 'empty',
  size: number,
  sourceBond: ObjectId,  // discoverer that produced this row (precise cleanup)
  computedAt: Date       // freshness + TTL
}
```

`matchKey` is exactly the existing `signatureOf(ids)` string used by notifications, so
dedup semantics stay identical across write, serve, and notify.

**Indexes**

| Index | Purpose |
|---|---|
| `{ bond: 1, matchKey: 1 }` unique | idempotent upsert, hard dedup |
| `{ bond: 1, score: -1 }` | bounded serving top-N (covers sort + limit) |
| `{ bonds: 1 }` (multikey) | invalidation `deleteMany({ bonds: id })` |
| `{ sourceBond: 1, matchKey: 1 }` | discoverer cleanup / previous-signature snapshot |
| `{ computedAt: 1 }` TTL `expireAfterSeconds = serveTtl (48 h)` | rows that stopped being refreshed disappear automatically |

No `{size, score}` index: default ranking is score-based; the legacy size-first ranking
(flag) is a correctness fallback, not a perf path, and operates in memory on ≤ scanCap rows.

Storage math (current): 186 bonds × ≤ 100 served rows × ~500 B ≈ 50 MB worst case —
trivial. At 100 k bonds × ≤ 150 rows ≈ 15 M docs ≈ 5–7 GB including indexes; M10 is tight.
See §12 for the scale gate (switch to a feed-document shape or upgrade tier before that).

### 5.3 Bounded serving: fetch top-N by score, then re-rank in memory

`getMatchingBondRequest` (feed path) becomes:

```ts
const rows = await BondMatchFeed.find({ bond: bondRequestId })
  .sort({ score: -1 })
  .limit(MATCHING.feedScanLimit)   // default 400, min 100, max 2000
  .lean();
```

Then the existing post-processing runs unchanged on ≤ 400 rows: dedup by `matchKey`,
pause/ghost/blocked filters, pairBias re-rank, `minServeScore`, `slice(0, maxResults=100)`,
page slice, page-only populate, colors, rotation.

Why 400: the page serves ≤ 100 after re-ranking; a match outside the top-400 by raw score
could only enter the top-100 after re-rank if its raw score is within
`pairBias × (maxSize-2) ≤ 0.15` of the 100th served row. A 4× overscan makes that
practically impossible, and the shadow diff (Phase 3) measures it. Dials are
env-overridable so we can raise to 1000 (≈600 KB, still 7× smaller than today) without a
deploy.

Also parallelize the independent reads (`startRequest` fetch + feed fetch) with
`Promise.all`; today they are sequential.

### 5.4 Row lifecycle: discoverer cleanup + participant trim + TTL

- **Discoverer cleanup** (correctness): after upserting a discoverer's current set,
  delete only rows that *this discoverer* previously wrote and no longer finds:
  `deleteMany({ bond: sourceBondId, sourceBond: sourceBondId, matchKey: { $nin: currentKeys } })`.
  This preserves rows contributed by other discoverers.
- **Participant trim** (boundedness): after a recompute, for each participant in the new
  records, keep its top `feedMaxRowsPerBond` (default 150) by score and delete the rest.
  Prevents one dense bond from accumulating thousands of rows again (the exact failure we
  are fixing). Races between concurrent recomputes can delete a row another job just
  upserted; the next recompute re-adds it, and rows are regenerated at least daily for
  active bonds. Acceptable, documented.
- **TTL** (safety net): rows not refreshed within `serveTtl` (48 h) expire. This bounds
  storage even if trim or cleanup regresses, and mirrors the existing serve TTL semantics.

Write path uses `bulkWrite(ops, { ordered: false })`:
100 records × ~2.2 participants = ~220 upserts per recompute — negligible for the worker.

### 5.5 Invalidation: by participant, then re-enqueue readers

Old semantics: delete all rows *produced by* affected discoverers (over-deletes; relies on
recompute). New semantics for the feed:

```ts
const readers = await BondMatchFeed.distinct('bond', { bonds: oid });
await BondMatchFeed.deleteMany({ bonds: oid });
// readers (excluding oid) are re-enqueued at BG priority
```

This removes exactly the rows that legitimately became invalid (they mention the paused /
deleted / blocked bond) and leaves unrelated rows intact. `matchesGen`, agenda
invalidation, and the pause/reactivate flow are unchanged. During dual-write, the legacy
invalidation still runs so rollback stays correct.

Pause/delete/unlink all funnel through the same function; add regression tests for each.

### 5.6 Caching: no Redis layer in Phase 1

`BondMatchFeed` **is** the cache: a precomputed, indexed, bounded read model. A Redis layer
in front of it would introduce a second invalidation source that must be purged on every
recompute, pause, block, delete, and rollback — the highest-risk class of bug in a matching
system (stale/ghost matches). Measured DB execution is already ~38 ms; after bounding it
will be a few ms. Add caching only if load tests show DB time (not payload) as the
bottleneck. If that day comes:

- cache page 1 only, 30–60 s TTL, key `v2:matches:<bondId>:1:<limit>`;
- purge from the same invalidation function that deletes feed rows;
- never cache `status: "computing"` responses.

HTTP caching is not applicable: responses are per-user and mutable.

### 5.7 Rollout by flags (api + worker share `.env`)

| Flag | Default | Meaning |
|---|---|---|
| `MATCH_FEED_WRITE` | `false` | dual-write feed alongside legacy persist |
| `MATCH_FEED_SHADOW` | `false` | run feed read, log diff, serve legacy |
| `MATCH_FEED_READ` | `false` | serve from feed |
| `MATCH_FEED_SCAN_LIMIT` | `400` | serving overscan (100–2000) |
| `MATCH_FEED_MAX_ROWS_PER_BOND` | `150` | trim cap (100–1000) |
| `MATCH_FEED_TTL_HOURS` | `48` | TTL index window (used at index creation) |

All parsed in `matching.config.ts` (same conventional env parsing as the existing knobs).
Every phase is reversible by env change; no code rollback required until Phase 5
(contract), which happens ≥ 14 days after 100 % cutover.

### 5.8 Frontend: stop fetching matches for a tab that isn't visible

`bond-tabs.tsx:36` calls `useBondMatches(requestFilterId, page)` unconditionally, only to
render the Matches tab count. Gate it by the active tab and disable focus refetch:

- pass `null` as `requestId` (query disabled) when `activeTab !== "matches"`; clicking
  "Find match" already switches to the Matches tab in the same action, so the count query
  starts immediately after navigation;
- set `refetchOnWindowFocus: false` for this query (the robot refreshes data; the 3 s poll
  already covers `computing`);
- keep `placeholderData: keepPreviousData`, 10 s `staleTime`, and the `computing` poll.

No new summary endpoint is needed. (A `summary` endpoint was considered and rejected: it
would duplicate the filter logic and still need the same bounded read to be accurate.)

### 5.9 Wildcard quality is a separate, flagged workstream

43 of 186 bonds are wildcard, `empty ↔ empty` scores 0.9, and the global wildcard query is
`$limit 100` **unsorted**, so the same dense "Nada/Nada" matches flood every bond. This is
both a match-quality problem and the reason feeds saturate. Fix (after the read model is
stable, behind its own flag): relevance-order wildcard candidates and cap per-bond wildcard
contribution (e.g. ≤ 20 % of `maxResults`) instead of a global 100. Product sign-off
required because visible match counts will change.

## 6. Target architecture

```
                     worker (BullMQ)
computeAndCacheMatches
        │
        ├── persistMatches (legacy, kept during rollout)
        └── persistMatchFeed ──bulk upsert (bond, matchKey)──┐
              │                                                │
              ├── discoverer cleanup                            ▼
              ├── participant trim                       BondMatchFeed
              └── TTL safety net                    unique(bond,matchKey), (bond,score)
                                                              │
API  GET /bond-request/matching-bond                          │
        │                                                     │
        ├── (legacy) BondMatch.find({bonds}).sort(...) ──── shadow only
        └── BondMatchFeed.find({bond}).sort({score:-1}).limit(400).lean()
                    │
                    └── dedup → block/ghost → re-rank → page slice → populate page → respond
```

Response contract unchanged:
`{ status, reactivated, total, page, limit, data[] }`.

## 7. Rollout plan (expand → migrate → shadow → canary → contract)

| Phase | Action | Exit gate |
|---|---|---|
| 0 | Instrumentation only (metrics/logs), no behavior change | Baselines captured for 24 h |
| 1 | Ship model + indexes + flags, all off | `createIndexes` succeeds; unique index verified |
| 2 | `MATCH_FEED_WRITE=true` (worker), run backfill | Backfill counts reconcile; dual-write 24 h with zero errors |
| 3 | `MATCH_FEED_SHADOW=true` (api) | p95 diff `< 1 %` over 24 h / ≥ 1,000 sampled requests |
| 4 | `MATCH_FEED_READ=true` canary → 100 % | p95 SLO met; error rate flat; no notification regression |
| 5 | Remove legacy write/read, drop old indexes/collection after 14 days | Two clean weeks, then contract PR |

Backfill may run while dual-write is on; it is idempotent (upserts) and resumable.

## 8. Observability

Add to `src/app/middlewares/metrics.ts` or a small local registry in the matching module:

- histogram `bond_match_serve_ms{bond_mode="legacy|feed|shadow"}`
- histogram `bond_match_feed_rows_scanned`
- counter `bond_match_status_total{status="ready|computing|empty|error"}`
- counter `bond_match_feed_upserts_total`, `bond_match_feed_trim_deleted_total`
- counter `bond_match_shadow_diff_total` + gauge `bond_match_shadow_jaccard`
- warn log (rate-limited) when `rowsScanned === scanLimit` → cap pressure
- warn once per recompute if feed write fails while `MATCH_FEED_WRITE=true`

Alerts: p95 serve > 300 ms (10 min), shadow diff > 1 % (30 min), feed write error > 0
(15 min), rows at cap > 1 % of requests (30 min).

## 9. Testing strategy

The repo has no Jest; it uses `src/scripts/runTests.ts` importing `*.test.ts` suites run
via `node dist/scripts/runTests.js`. New tests follow that convention.

1. **Unit (pure, no DB)** — `matching.feed.test.ts`:
   - `buildMatchKey` is order-independent and stable;
   - `recordToFeedDocs` maps one record to N participant docs with identical matchKey;
   - ranking function (extracted and shared) produces identical order for legacy/feed inputs;
   - scan-cap + trim selection logic on fixture arrays.
2. **Equivalence (property-based)** — generate synthetic graphs (sizes 5–200, random
   scores/sizes), run old serving pipeline vs new bounded pipeline in memory, assert
   top-100 ordered equality for `scanLimit ≥ 400`; assert any divergence has raw-score
   gap < pairBias bound.
3. **Integration (real Mongo, scripted)** — `src/scripts/verifyMatchFeed.ts`:
   - dual-write → backfill → compare row counts and per-bond top sets vs legacy;
   - pause / delete / unlink / block flows remove exactly the expected rows;
   - notification `previousSignatures` snapshot produces the same new-match decisions.
4. **Load** — `src/scripts/benchMatchServe.ts`: seed N synthetic bonds + feed rows in a
   scratch DB, measure p50/p95/p99 and payload size; fail if rows scanned > scanLimit or
   p95 > 300 ms.
5. **Regression** — existing matching suites still pass; `tsc --noEmit`; client `pnpm build`.

## 10. Migration & runbook

- Script: `src/scripts/backfillMatchFeed.ts` (follows `dedupeActiveBonds.ts` conventions:
  connect via `config.database_url`, idempotent, checkpointed, logs every 5 k docs, exit
  codes).
  - `BondMatchFeed.createIndexes()` first (TTL option applied here).
  - Iterate legacy `BondMatch` in `_id`-ordered batches (500) with a persisted checkpoint
    (`migrationstate` doc or a file), expand each row into participant docs, bulk upsert.
  - Reconcile at the end: for a sample of 50 bonds compare legacy top-100 vs feed top-100.
- npm scripts: `match-feed:backfill`, `match-feed:verify`, `match-feed:bench`.
- Run order in prod: deploy Phase 1 (flags off) → verify indexes → enable write →
  backfill → shadow → read.
- Never run on a primary during peak without a maintenance note; batches are small enough
  to be online, but use `w: majority` writes and watch Atlas metrics.

## 11. Rollback

| Stage | Rollback | Data impact |
|---|---|---|
| Write on | `MATCH_FEED_WRITE=false` | none (feed partially populated; harmless) |
| Shadow on | `MATCH_FEED_SHADOW=false` | none |
| Read on | `MATCH_FEED_READ=false` | instant; legacy rows are still dual-written |
| Post-contract | restore previous image + migration | requires old collection kept 14 days |

No destructive step (drop collection, drop indexes) happens until Phase 5, explicitly
outside this plan's default execution.

## 12. Scale analysis

- Current: 186 bonds / 18.6 k legacy docs → feed ≈ ≤ 50 MB, read ≤ 400 rows (~150–250 KB).
- 20× (≈ 3.7 k bonds): ≤ 370 k feed docs, bounded per-bond reads — no change in complexity.
- 100 k bonds: ≈ 10–15 M feed docs (≈ 5–7 GB with indexes). M10 (10 GB) would be tight.
  **Gate before that:** switch feed rows to one document per bond with an embedded
  top-150 array (same bounded read, much less per-row overhead) or upgrade Atlas tier.
  The serving API and response contract do not change either way.
- Write throughput scales with recomputes, not with readers: trim keeps it linear in the
  number of participant slots per recompute (~2.2).

## 13. Task list (ordered; details in `todo.md`)

Phase 1 — Foundation
1. `BondMatchFeed` model + indexes
2. Matching config dials + feature flags
3. Pure helpers (`buildMatchKey`, doc mapper, shared ranking) + unit tests
4. Instrumentation: serve rows/duration/status metrics + baseline capture

Phase 2 — Dual write + backfill
5. `persistMatchFeed` (upsert, discoverer cleanup, participant trim) behind write flag
6. Feed-aware invalidation in robot behind write flag
7. Notification previous-signature snapshot from feed
8. Backfill script + verify script; run locally and reconcile

Phase 3 — Read path + shadow
9. Bounded feed read in `getMatchingBondRequest` behind read flag; shared post-processing
10. Shadow-read comparison harness + logging/metrics
11. Frontend: gate matches query by active tab, disable focus refetch

Phase 4 — Cutover + cleanup
12. Canary → 100 % read; 7-day observation checklist
13. Legacy write/read removal + old index drop (after 14 days)
14. Docs/comments update (`bondMatch.interface.ts`, AGENTS notes, runbook)

Phase 5 — Wildcard quality (separate flag, product sign-off)
15. Relevance-order + per-bond cap for wildcard candidates; tests; density measurement

## 14. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| `scanLimit` drops a match that re-rank would have served | Med (product-visible) | 4× overscan; property test bound (`pairBias × (size-2)`); shadow diff gate < 1 % |
| Concurrent recomputes race on shared participant rows / trim | Med (temporary missing row) | Upserts idempotent; rows re-added next compute; TTL only ever removes unrefreshed rows; document as expected |
| Feed write fails but agenda is sealed | High (stale feed for TTL) | During rollout feed write is best-effort + alert; after cutover treat as required failure → job retry, do not seal |
| Notification duplicates/losses due to changed previous-signature source | High (user-visible) | Keep exact `signatureOf` contract; integration test for reappearance case |
| `MATCH_FEED_TTL_HOURS` ≠ `serveTtlMinutes` | Med (empty feed) | Both read from the same config default; TTL set only at index creation; document |
| Index build on legacy collection during rollout | Low | Feed is a new empty collection; index build is trivial |
| Storage blowup at 100 k bonds | Med | Trim + TTL + scale gate in §12; monitor collection size weekly |
| Wildcard change alters match counts unexpectedly | Med | Separate flag, product sign-off, ship after read model is stable |

## 15. Open questions (need human input)

1. Is 48 h feed TTL acceptable, or should rows live as long as the bond is active?
2. Cutover window preference (canary on a single API instance vs flag-only rollout).
3. Wildcard quality change: same release or separate release with product review?
4. Keep legacy `BondMatch` as a 14-day archive before dropping, or keep indefinitely?
5. Any client relying on the *pre-slice* `total` semantics (currently computed after
   filters over the full set)? Feed will compute it over ≤ 400 rows — expected identical,
   but confirm with product/analytics.

## 16. Definition of Done

- [ ] All tasks in `todo.md` checked, with acceptance criteria met.
- [ ] Every new query is index-backed and bounded; no query in the serve path scans more
      than `feedScanLimit` rows.
- [ ] `tsc --noEmit` clean; `node dist/scripts/runTests.js` green; client `pnpm build` green.
- [ ] Shadow divergence < 1 % over ≥ 1,000 sampled requests.
- [ ] p95 serve ≤ 150 ms at current volume; payload ≤ 250 KB; load test gate passed.
- [ ] Pause/delete/unlink/block/notification regression tests green.
- [ ] Rollback rehearsed (flags flipped) and documented.
- [ ] Metrics + alerts live; runbook updated.
