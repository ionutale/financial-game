# Gamification grilling — run 1

**Ask:** "grill-with-docs — I want gamification added to this game."

**Mode:** non-interactive. There is no human to interview, so every frontier question is settled
immediately with the run's own **recommended** answer (➡️). That recommendation *is* the answer for
this run. Nothing is left silently assumed; every decision is written down, and the frontier is
recomputed after each round until it is empty.

**Repo:** `/Users/ionutale/games-development/financial-game` — a SvelteKit 5 "Financial Life-Sim"
for teens, mobile-first, en/it/ro, anonymous device-keyed profile, MongoDB Atlas.

**Artifacts (this run only, sandboxed):**

- `grilling-log.md` (this file)
- `CONTEXT-delta.md` (proposed glossary terms)
- `adr/0001-milestones-are-derived-not-stored.md`
- `adr/0002-money-and-behaviour-are-the-only-scores.md`
- `adr/0003-run-record-derived-from-archive.md`
- `FINAL-DESIGN.md`

---

## Ground truth established before the grill

Facts are the subagent's job, not the user's. These were read from the code and docs, not assumed.

- **What the game already is** (`CONTEXT.md`, `.scratch/mvp/map.md`): a life-sim, one character,
  five in-game years, 60 monthly Turns, five Stages, eight Concepts, seeded draws, recoverable
  consequences, anonymous-only identity. It is *already a game* — the ask is not "make it a game".
- **A deliberate anti-gamification stance exists.** `.scratch/mvp/research/08-prior-art.md` §4.1
  names "gamification that trivialises" (XP, coins, stars, lives) as failure mode #1 and concludes
  "if we use points at all, they must be *the money itself*, not a parallel currency". `map.md`
  records "no XP/coins/lives or leaderboards" and puts **leaderboards and multiplayer/social out of
  scope**. `.scratch/mvp/issues/04-turn-loop-ux.md` and `08` both say **no timers**. So the ask sits
  in direct tension with a documented decision — the grill's first job is to resolve that tension,
  not ignore it.
- **Teaching metrics are deliberately hidden during a Run** (`.scratch/mvp/issues/05-ending-report-metrics.md`,
  `src/lib/game/metrics.ts` header): "a player who can see a score optimises the score". Only
  balances are live. The *Money Story* is the end-of-run report.
- **The success criterion is the Better-Choices Proof** (`CONTEXT.md`): the player's money decisions
  measurably improve over a Run. The three **Behavioural Measures** (budget adherence, savings rate,
  want spend) are the only metrics the **you-vs-you** comparison uses.
- **Turning points** are already flagged: `flags` kinds in `src/lib/game/loop.ts` are
  `card_issued`, `overdraft`, `minimum_payment`, `fork:study`, `fork:work`; `metrics.ts` filters them
  through `KNOWN_FLAGS`. (`goal_reached` is claimed in issue 05 but never pushed — an existing gap.)
- **The stage-up card was supposed to carry a year-in-review line** (`.scratch/mvp/issues/05`:
  "one metric line plus the money summary"). The built `StageUp.svelte` shows only stage/age/unlocked
  Concepts. **Spec/build gap**, and the natural home of an in-run gamification beat.
- **Finished Runs are already archived** on the profile (`src/lib/server/store.ts` `ArchivedRun`,
  ticket 23) as full `RunState`. **But nothing in the UI ever shows the archive** — `MoneyStory.svelte`
  shows the current Run only; `settings/+page.svelte` has language, sound, download, delete; the
  archive is only visible through `/api/profile/export`. Existing data, no surface.
- **Determinism is load-bearing**: `turnRng(seed, month)` in `src/lib/game/loop.ts`, "same seed, same
  Run", protected by tests.
- **The Fund is inert.** `RunState.fund` exists, is displayed (HUD/Stats/Money Story) and counts in
  net worth and in `goalProgress`, but **nothing in `loop.ts` or `cards.ts` ever increments it** —
  `the_fund`/`the_crash` choices only move `cost` out of a pot. Any "investing" Milestone built on the
  Fund would be vacuous. (`src/lib/game/economy.ts`, `cards.ts:1298`, `loop.ts`.)
- **The gates any new UI must pass**: `pnpm verify` = type-check + vitest + i18n gates
  (`messages/{en,it,ro}.json` must hold identical key sets with matching placeholders —
  `src/lib/i18n/messages.test.ts`) + axe/Lighthouse a11y (`docs/accessibility.md`). No timers, no
  auto-updating content, reduced-motion respected, colour never load-bearing, 44px targets.
- **The one accent colour is reserved for money** (`docs/art-audio.md`); SFX are synthesised, off by
  default, never load-bearing.
- **Privacy floor** (`docs/privacy/lia.md`, `.scratch/mvp/issues/12`): no analytics, no IP/UA/fingerprint,
  one strictly-necessary cookie, export + delete + a 12-month retention sweep.

---

## Round 1 — Intent and the admissible class

Frontier: five framing decisions with no prerequisites. Everything else waits on them.

---

❓ **Q1** — **What kind of "gamification" is being asked for?** The word covers at least four
different things, and they have wildly different evidence behind them:

- **(a) A parallel reward economy** — XP, points, coins, gems, levels, badges redeemed for things.
- **(b) Game-feel / juice** — stronger feedback, celebration, number movement, sound, ceremony on the
  existing money mechanics.
- **(c) Meta-progression** — a private, cross-Run record: what you have done across many lives.
- **(d) Competitive/social** — leaderboards, share cards, friends.

➡️ **Recommended: (b) + (c), explicitly excluding (a) and (d).** The game is already a game; its real
gap is that accomplishments are invisible until month 60 and nothing accumulates across Runs. A
parallel currency is documented failure mode #1 (`.scratch/mvp/research/08-prior-art.md`), and (d) is
already out of scope. So "gamification" here means **make the existing behaviour legible and
rewarding, and let Runs accumulate into a private record** — not "add points".

---

❓ **Q2** — **Does the ask override the documented "no XP/coins/lives/leaderboards" stance?**
`research/08`, `map.md` and `issues/04` all rule these out. The ask could be read as a request to
reopen that decision.

➡️ **Recommended: refine, do not override.** Keep the prohibition on a parallel currency and on
competitive ranking; satisfy the ask with *intrinsic, diegetic* progression. The line "if we use
points at all, they must be the money itself, not a parallel currency" becomes the governing rule of
the whole design. Record the boundary in an ADR so a future reader cannot mistake it for an oversight.

---

❓ **Q3** — **What is the job to be done?** Candidates: retention (sessions per day / return rate),
completion (reach month 60), learning legibility (the Better-Choices Proof), or delight.

➡️ **Recommended: completion + learning legibility, not retention.** There are no accounts, no push,
no daily loop, and the privacy posture forbids analytics — so retention cannot even be measured, and
building for it would mean adding the very mechanisms (streaks-as-assets, daily rewards, nags) that
the research warns against. Success = more players reach month 60 and can *see* their own
improvement. Delight is a means, not the metric.

---

❓ **Q4** — **One layer or two?** In-run progression only, meta-progression only, or both?

➡️ **Recommended: both, sequenced.** They answer different needs. The **in-run** layer keeps a
single 60-month life motivating (milestones, a year-in-review beat). The **meta** layer makes replay —
the game's *only* existing comparison mechanism — mean something. Build in-run first; it is cheaper,
needs no new storage, and is where the spec/build gap already is.

---

❓ **Q5** — **What is fenced off from the start?** Setting the non-goals early prevents the tree from
growing in the wrong direction.

➡️ **Recommended non-goals, reaffirmed:** no real-time or timed events; no daily-login rewards; no
push notifications; no social feed or share cards; no leaderboards or any other-player comparison; no
parallel/purchasable currency; no loot or variable-ratio rewards; no lives/energy; no
streak-loss punishment; no analytics or telemetry. Each of these is either out of scope, evidence-
contradicted, privacy-hostile, or all three.

---

**Frontier after Round 1:** the admissible class (b)+(c) is fixed, the stance is "refine not
override", the goal is completion/legibility, both layers in sequence, and the fences are up. This
unblocks the reward model and the concrete in-run mechanics.

---

## Round 2 — The reward model and the in-run mechanics

Frontier: what the milestones *are*, where they live, how they are surfaced, and what the single
reward currency is.

---

❓ **Q6** — **What is the only score/currency?** Options: introduce a gamification currency (points),
or use what the game already has (money, the Named Goal, the Credit Score, the Behavioural Measures).

➡️ **Recommended: money and the Behavioural Measures remain the only scores; there is no second
currency.** Milestones are *adjectives* ("you held the line six months running"), never *points*.
They grant nothing — no money, no power-up, no content gate — so they cannot be farmed for advantage.
This is what makes the design compatible with the evidence and with `research/08` §4.1.

---

❓ **Q7** — **What is a Milestone, and where does it live?** Options: (a) a new `RunState` field
appended as they are earned; (b) a pure, derived view computed from the Run's existing record
(`history`, `flags`, `log`, `score`) whenever it is needed; (c) stored server-side on the profile.

➡️ **Recommended: (b) derived, never stored in `RunState`.** A `milestones.ts` module evaluates
predicates over the record the reducer *already* keeps and returns the earned list. Consequences: no
schema change, no migration, old saves keep working, the reducer stays pure and deterministic, "same
seed, same Run" is untouched, and any *archived* Run can re-render its Milestones from its saved
state. This is surprising enough to record as **ADR-0001**.

---

❓ **Q8** — **What may a Milestone be built on?** Every mechanic must be interrogated: what would a
player optimise if they played for it? (`research/08` §4.4.)

➡️ **Recommended: two admissible sources only — a Behavioural Measure, or a Turning Point/flag.**
Never a raw balance, never net worth. And **reward process the game explicitly teaches, not
contestable maxims** (so no "always insure" and no "never borrow" Milestones — the game teaches
judgement, not rules). Concrete, derivable set:

| id | Milestone | Derived from |
| --- | --- | --- |
| `first_budget_month` | First month inside both envelopes | `history[].insideBudget` |
| `quarter_inside_budget` | Three months in a row inside budget | consecutive `insideBudget` |
| `half_year_inside_budget` | Six months in a row inside budget | consecutive `insideBudget` |
| `first_save` | The first month money reached Save | `history[].saved > 0` |
| `first_interest` | The first interest credited | `history[].interest > 0` |
| `goal_reached` | The Named Goal reached | `savings + fund >= goalTarget` |
| `payslip_read` | Read the first payslip's deductions | `log` contains `first_taxed_payslip/read` |
| `debt_cleared` | A month closed owing nothing, after owing | `peakDebt > 0` then `debt === 0` |
| `not_fooled` | Refused the guaranteed-return scam | `log` contains `scam_opportunity/{check,block}` |
| `weathered_the_crash` | Held through the crash | `log` contains `the_crash/{hold,buy}` |
| `both_paths` *(Run Record)* | Finished a Run on Study **and** on Work | the archive |

Milestones that would need a field the snapshot does not record (e.g. "set hours in the first month",
"insured before a shock") are **deferred**, not smuggled in — they each need their own decision and
would breach ADR-0001's "no new stored state" unless explicitly allowed.

---

❓ **Q9** — **Are streaks admissible?** Streaks are the most common mobile-gamification device and
the one most associated with dark patterns (loss aversion, daily pressure).

➡️ **Recommended: yes, but only as Milestones, and never as a fragile asset.** "Six months in a row
inside budget" is a Milestone; there is no "streak at risk", no reset guilt, no daily framing (there
is no daily loop). Define **Inside-budget Streak** precisely in the glossary, and forbid loss-framed
copy. In effect, streaks exist as *recognitions*, not as *possessions*.

---

❓ **Q10** — **How is a Milestone surfaced, given "nothing flashes, no timers, no auto-update"?**

➡️ **Recommended: inline in the Month Close region, plus a list in the Stats Sheet and the Money
Story — never a floating toast.** The Month Close already takes focus and is a labelled region
(ticket 25); a Milestone line joins it, announced through the existing `aria-live="polite"` Feedback
discipline. No auto-dismiss, no countdown, no modal. This keeps ticket 14's no-timer commitment and
avoids a new focus-management problem.

---

❓ **Q11** — **What about the "juice" layer (sound, motion, celebration)?**

➡️ **Recommended: extend the existing discipline conservatively.** One synthesised `milestone` SFX
cue added to `src/lib/audio/sfx.ts` (off by default, never load-bearing, positive-only); a
reduced-motion-respecting emphasis on the milestone line using the existing `.rise` / width-transition
patterns; **no confetti, no colour change on its own, no new accent**. `docs/art-audio.md` gains a row.

---

❓ **Q12** — **Where is the in-run payoff beat?** The spec promised a year-in-review line on the
Stage-up card; the build omits it.

➡️ **Recommended: implement the promised *Year in Review* on the Stage-up Card and make it the
primary in-run gamification beat** — one behavioural sentence ("You stayed inside budget 8 of 12
months"), the money headline ("net worth ◈1,240"), and any Milestone earned that year. It closes a
real spec/build gap, costs one component edit plus strings, and gives the player a recurring moment
of visible progress without a scoreboard.

---

❓ **Q13** — **Should the Named Goal become a quest system (side-goals, bonus objectives)?**

➡️ **Recommended: no.** The Named Goal is *the* quest; adding side-quests would fragment attention
and multiply the Goodhart surface. The only addition is that *reaching* the goal is now a Milestone
(`goal_reached`), which the game visibly celebrates.

---

**Frontier after Round 2:** the reward model is settled (money only, Milestones derived, inline
surfacing, a year-in-review beat). This unblocks the cross-Run layer and its boundaries.

---

## Round 3 — The cross-Run layer and its edges

Frontier: how does a career of Runs accumulate, without new storage or a new privacy surface?

---

❓ **Q14** — **What is the cross-Run artifact?** Options: (a) nothing cross-Run; (b) a private
ledger derived from the existing Run Archive; (c) a stored achievement collection requiring new
persistence.

➡️ **Recommended: (b) a *Run Record*** — a private screen listing finished Runs (band, path, final
net worth, the behavioural measures, Milestones earned) plus a private aggregate (Runs finished,
Milestones earned across all Runs, best adherence, best savings rate, both paths done). It is derived
**entirely from `profile.archive`**, which already holds each finished Run's full `RunState`
(`store.ts` `ArchivedRun`). **Zero new stored data, zero migration, no new privacy surface.** Record
as **ADR-0003**.

---

❓ **Q15** — **Is any of this compared to other players?**

➡️ **Recommended: no, ever.** The Run Record compares the player to their own past Runs — the same
philosophy as the you-vs-you comparison in the Money Story, and the same reason leaderboards were
ruled out. The `_Avoid_` list for the term explicitly includes "leaderboard".

---

❓ **Q16** — **Should replay be made more "gamey" — same-seed replays, scoring a seed, chasing a
band?**

➡️ **Recommended: defer same-seed replay; keep fresh-seed replay only.** A same-seed replay would
turn the life-sim into a solvable puzzle and invite optimising the *score* rather than living the
life — the exact failure mode ticket 05 guards against. It is a genuinely good *learning* device
("what if I'd chosen differently?"), so record it as a deferred experiment to revisit with playtest
evidence, not as a silent omission.

---

❓ **Q17** — **Does the Run Record change what is stored, exported, deleted, or retained?**

➡️ **Recommended: no stored data changes.** Because the Run Record is a *view* over `profile.archive`,
the existing export (`buildProfileExport` already returns `archive`), delete, and the retention sweep
already cover it. The only obligations are documentation: note the new surface in
`docs/privacy/lia.md` and the first-run notice if it becomes prominent. **No denormalised
achievement index** — that would create a second source of truth and a new export/delete obligation
for no benefit.

---

**Frontier after Round 3:** the cross-Run layer is a derived view over the archive, private, no new
data. This unblocks the safeguards and the domain vocabulary.

---

## Round 4 — Safeguards, constraints, and risks

Frontier: what could the gamification break, and what rules prevent it?

---

❓ **Q18** — **How is the Better-Choices Proof protected (Goodhart's law)?**

➡️ **Recommended: three hard rules.** (1) Every Milestone derives from a Behavioural Measure or a
Turning Point — never a balance. (2) Milestones grant no mechanical effect: no money, no content, no
power. (3) The teaching metrics stay hidden mid-Run; a Milestone names a *behaviour already
legitimate in the game*, it does not reveal a dashboard. Residual risk noted: budget adherence is
itself gameable (inflate the Need/Want envelopes to never overspend) — but that exposure is
pre-existing in the Better-Choices Proof, and the gamification adds no new axis to game.

---

❓ **Q19** — **Accessibility.** What must the new UI prove?

➡️ **Recommended: the full existing bar, not a reduced one.** No timers/auto-update (WCAG 2.2.2
stays N/A); the Milestone line is text-first with no colour-only meaning; `prefers-reduced-motion`
respected for any emphasis; 44px targets; the new Run Record route and the Stage-up beat are added to
`tests/a11y/seed.ts` + `screens.spec.ts` (+ `zoom.spec.ts` if it is a key screen). `docs/accessibility.md`
gains the route in the gate table.

---

❓ **Q20** — **Tone.** How do Milestones avoid moralising?

➡️ **Recommended: neutral, second-person, no ranks or titles.** "Six months inside your budget" —
not "Budget Master", not a medal, not an emoji-as-status, not "you failed". Celebrations are quiet
and positive; a missed Milestone is simply silent. This preserves the non-judgemental voice ticket
05 set for the Money Story and `research/08` §3.7 (irreverence over instruction).

---

❓ **Q21** — **Determinism and the seeded draw.**

➡️ **Recommended: gamification must never touch the RNG, the draw, or `RunState`.** Milestones are
post-hoc pure functions; the Milestone SFX is fired from a gesture like every other cue; the Run
Record reads archived state. "Same seed, same Run" and every existing test remain valid. The
gamification layer must be independently testable with no server, no DOM, no Mongo — same purity
rules as `metrics.ts` and `stats.ts`.

---

❓ **Q22** — **i18n and the catalogue gate.**

➡️ **Recommended: Milestone ids are language-neutral slugs (like card ids); all text lives in
`messages/{en,it,ro}.json`; the key-parity, no-empty and placeholder-agreement tests must pass.** No
per-locale logic, no concatenated sentences. A deterministic unit test enumerates every Milestone id
and asserts its key exists in all three locales — mirroring `messages.test.ts`'s deck gate.

---

❓ **Q23** — **The inert Fund.** `RunState.fund` is never incremented, so an "investing" Milestone
built on it would be vacuous.

➡️ **Recommended: do not build any Milestone on the Fund, and log the gap as a known risk.** The
investing Concept is currently taught only by narrative (`the_fund`, `the_crash`) with no mechanical
fund movement. Milestoning it is blocked until the Fund is wired into the economy — a separate,
larger decision outside this design. `weathered_the_crash` (a *choice* fact, not a Fund balance)
is the one investing Milestone that is honestly derivable today.

---

❓ **Q24** — **Scope, sequencing and reversibility.**

➡️ **Recommended four phases, each independently shippable, none touching the economy or the RNG:**

- **P0 — Terms + module.** `CONTEXT-delta` terms merged; `milestones.ts` (pure predicates + tests).
- **P1 — In-run beat.** Year in Review on the Stage-up card; Milestone lines in the Month Close and
  the Stats Sheet; the `milestone` SFX cue; Money Story recap.
- **P2 — Cross-Run.** The Run Record screen (derived from the archive), a loader, links from the
  Money Story and Settings; axe/zoom coverage.
- **P3 — Polish + docs.** i18n parity gate extended to Milestones; `docs/art-audio.md`,
  `docs/accessibility.md`, `docs/privacy/lia.md` updated.

Deferred: same-seed replay, any Fund-based Milestone, any social surface, any parallel currency.

---

**Frontier after Round 4:** safeguards fixed; sequencing fixed; the Fund risk bounded. This unblocks
the vocabulary and the delivery module boundaries.

---

## Round 5 — Domain model and delivery

Frontier: name the concepts, place the code, and finish.

---

❓ **Q25** — **What are the canonical terms?** ("Milestone" already appears in the world — the
`savings_milestone` card's `teaches` text says "the first milestone is why the habit survives" — so
the word is the game's own.)

➡️ **Recommended: add `Milestone`, `Inside-budget Streak`, `Year in Review`, `Run Archive`,
`Run Record`, `Celebration` to the glossary, with `_Avoid_` lists that push the extrinsic vocabulary
(badge, achievement, trophy, XP, point, reward, leaderboard) away.** Full wording in
`CONTEXT-delta.md`. The existing `savings_milestone` card is *compatible*, not conflicting: it is one
Event Card that dramatises earning a Milestone.

---

❓ **Q26** — **How does the code stay a deep module?** (`src/lib/game` is deliberately pure — "no
Svelte, no Mongo, no DOM".)

➡️ **Recommended module boundaries:**
`src/lib/game/milestones.ts` — pure predicates + `earnedMilestones(runState)` +
`milestonesForYear(runState, year)`; view types only.
`src/lib/game/record.ts` — pure aggregation over `ArchivedRun[]` → `RunRecord`.
Components render; no new state in `types.ts` beyond read-only view interfaces; no persistence.
Tests live beside the modules, suite-style (`milestones.test.ts`, `record.test.ts`), as the existing
game modules do.

---

❓ **Q27** — **Non-goals, restated as a checklist the implementation can be reviewed against.**

➡️ **Recommended checklist:** no parallel currency · no points · no levels/titles · no leaderboards
· no other-player comparison · no timers · no auto-dismiss · no push/daily loop · no loot/variable
ratio · no purchases · no analytics · no new personal data · no RNG or `RunState` mutation · no
economy change · no content gated behind Milestones · no loss-framed streaks · no moralising copy.

---

❓ **Q28** — **What does "done" mean for *this* feature, honestly?**

➡️ **Recommended: the feature is done when (a) the existing `pnpm verify` suite plus the new
milestone/record unit tests and a11y coverage pass, (b) the design still reads as compatible with the
Better-Choices Proof (a Milestone can never be earned by a move that makes the year-1-vs-year-5
comparison worse), and (c) — the honest limit — a playtest shows players can name one thing they did
better by year 5 and can find their own Milestones. No engagement metric is claimed, because none is
collected.**

---

**Frontier after Round 5: empty.** Every branch of the tree — intent, reward model, mechanics,
cross-Run layer, safeguards, vocabulary, module boundaries, sequencing — is settled. No question
remains open; the two things the design defers (same-seed replay; Fund-based Milestones) are deferred
*by decision*, each with a recorded reason, not by omission.

---

## Frontier check (final)

| Branch | Settled by |
| --- | --- |
| What gamification means here | Q1, Q2, Q5 |
| Why build it | Q3 |
| Which layers | Q4 |
| Reward model | Q6, Q7, Q8 |
| Streaks | Q9 |
| Surfacing & juice | Q10, Q11 |
| In-run payoff | Q12 |
| Quest scope | Q13 |
| Cross-Run layer | Q14, Q15, Q16, Q17 |
| Goodhart guard | Q18 |
| Accessibility | Q19 |
| Tone | Q20 |
| Determinism | Q21 |
| i18n | Q22 |
| Known-mechanic risk (Fund) | Q23 |
| Scope & reversibility | Q24 |
| Vocabulary | Q25 |
| Code placement | Q26 |
| Non-goals | Q27 |
| Definition of done | Q28 |

Open questions: **none.** Deferred by decision: **same-seed replay** (Q16) and **Fund-based
Milestones** (Q23).
