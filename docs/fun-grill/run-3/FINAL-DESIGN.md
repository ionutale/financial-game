# Final design — making the game more fun, more attractive, less like a class

*grill run 3 · settled non-interactively · design/docs only — no source changed*

**References:** `ADR-NNNN` means this run's proposed ADR (`docs/fun-grill/run-3/adr/`); an existing repo
decision is cited as `docs/adr/NNNN`.

---

## 1. The one-line thesis

**The fun this game is allowed to have is the fun of a life-sim with a real economy: authorship,
consequence, discovery, mastery and delight — felt in the money. So the pass adds *peaks, content and
voice*, and adds no points, no streaks, no live score and no leaderboard; it removes the teacher from
the moment and puts the general lessons where they are earned — in the player's own record.**

The user asked for "more fun, more attractive, less like a teaching class". The honest answer for
*this* game is a deliberately specific one: the game is not too educational — it is too *instructive*.
Fun is already in the deck, the economy and the Threads; the pass turns the volume up on those and
turns the lectern off.

---

## 2. Why the obvious version is wrong here

| Naive "make it fun" device | Why it is declined here | What replaces it |
|---|---|---|
| XP / coins / stars / unlockables | Ticket 08 + `docs/adr/0001`: rewards attach to prompts, not competence; a second score to optimise. | Recognition already shipped (Milestones) + Q22 Threads + Q28 Twin Run. |
| A live score, streak or mood meter | Ticket 05 + `docs/adr/0003`: a player who can see a score optimises the score. | Live = money and arithmetic only (Fund, receipts); judgement stays retrospective. |
| Timers, countdowns, haste | Ticket 14: no timers, no auto-advance, fully screen-reader playable. | Suspense from the Deal and from authored situations. |
| Confetti, particles, looping motion | Ticket 13/14: motion carries meaning, nothing decorates; reduced motion collapses. | Eight one-shot beats, ≤600 ms, text always carries the meaning. |
| More colour, character art, backgrounds | Ticket 13 + one author: ~10 illustrations, one money accent, colour never load-bearing. | Composition, type scale, the existing ten pieces used better. |
| A soundtrack | Ticket 13/autoplay/one-author licences; the game must be perfect muted. | Two new synthesised cues + five Stage motifs, still off by default. |
| Daily rewards / notifications | Banned since charting (privacy + cadence). | The Journal as memory; nothing waits or expires. |
| A leaderboard | Out of scope since charting; the seeded draw makes Runs incommensurable. | You vs you — now including the same-seed **Twin Run**. |

---

## 3. The classroom diagnosis — what actually makes it feel like a class

| The signal | Where it lives today | What this pass does |
|---|---|---|
| A narrator who always knows the answer | ~200 Feedback paragraphs, each ending in a general principle; the Month Close's over-budget note | **Split Feedback into Reaction + Lesson (4.2)**; the general rule survives only at Teachable Moments and in the retrospective. |
| The curriculum worn outside | `Unlocks {concepts}`; three instruction screens; `Concept coverage`; the title *Financial Life-Sim* | Life-change headlines + *"What you'll meet"*; a two-screen intro; a real name; Coverage stays (it is the learning payoff). |
| A flat rhythm, no peaks | Every month the same fade; a table for a Close; quiet wins, quiet losses | **Eight named beats** (4.1): Deal, Answer, Tally, Turn, Crash, Landing, Ending, First Minute. |
| A ledger, not a life | No motion with meaning; sound off by default; a counter for a calendar | Moving money, a receipt Close, a poster Stage-up, an Epilogue, a date line. |
| No one to care about | Second person, a silhouette, people who appear once | Threads carry people back; copy continuity; the Journal remembers. |
| Nothing to do with yourself after a Run | A fresh seed and "try the other path" | The **Twin Run**: same start, lived differently. |

The guardrails are *not* the cause. The only four boundaries with a real fun cost are the deck freeze,
the Fund no-op, the villain-card exclusion and same-seed replay — each reopened explicitly (section 5).

---

## 4. The design

### 4.1 Feel — the peaks (presentation)

**The month is a tiny story:** *you set it up* (Plan) → *life surprises you* (**Deal**) → *you decide
and the world responds* (**Answer**) → *you see what it cost* (**Tally**). The run has five bigger
peaks: the **Turn** (Stage-up), the **Crash**, the **Landing** (a goal quarter or a Milestone —
shipped, kept), the **Ending**, and the **First Minute** (intro + first card). Eight beats total; the
rest of the screens stay still.

- **Motion vocabulary.** Four durations — `120 ms` state, `240 ms` arrive, `360 ms` deal, `600 ms`
  count — one easing (the shipped `cubic-bezier(0.22, 0.61, 0.36, 1)`), five legal meanings: **money
  moves**, **consequence travels**, **the world arrives**, **time turns**, **the record is read**.
  One-shot only; nothing loops; nothing animates on scroll; nothing is ever the only carrier of
  meaning; the shipped `prefers-reduced-motion` rule collapses everything to an instant state change.
- **The Deal.** The card is keyed by id and carries `data-kind`; five entrance variants (decision
  settles, shock lands, risk moment reveals its odds a beat late, scam arrives quietly, stage-up is the
  poster), equal durations, no information beyond the kind label that is already on screen. A new
  `deal` cue rides the tap that caused the draw.
- **The Answer.** The Feedback block restructures: **Reaction** first in the larger type, a hairline,
  then the **Lesson** smaller and muted, then the shipped cascade sentence. The choices themselves are
  composed as physical decisions (taller, larger label, chips on their own line).
- **The money moves.** Values a *decision* changed count to their new value in ≤600 ms — the HUD's
  net worth/cash after a money Choice, the Close's net-worth hero; a no-cost Choice leaves them still.
  Counts are visual only: no live region, final values in the DOM at all times.
- **The Tally.** The Close keeps its labelled region and heading focus, but reads as a receipt: the
  net-worth change is the hero and counts; rows keep the shipped order; the over-budget note becomes a
  plain fact (*"You went over the Want envelope by ◈X. It came out of Save."*); when money cascaded,
  the rows it left are emphasised and the shipped cascade sentence states the amounts — **no new
  diagram**. One new row when the Fund holds money (4.3).
- **The Turn.** The Stage-up becomes a poster: stage name and age large, a **life-change headline**
  (five new strings), *"What you'll meet: {concepts}"*, the shipped Year in Review, then the card/Fork.
  The avatar cross-fades between stage proportions (≤360 ms). The `stage_up` cue plays a short
  **Stage motif** (three to four notes; five variants in the one synthesised bank).
- **Sound.** Still synthesised, off by default, never load-bearing; add `deal` and `shock`; five
  Stage motifs by the Stage-up cue. **No music bed** (ticket 13, reaffirmed). Positive-only restated:
  the world may sound tense; a mistake is never answered with a punitive noise; nothing that sounds is
  needed to understand anything.
- **Attractiveness is composition, not assets.** No new illustrations, no second accent, no dark mode,
  no backgrounds. The card gets the screen's weight; the HUD keeps every element and its order.

### 4.2 Voice — the class leaves the room

- **Feedback = Reaction + Lesson.**
  - **Reaction** — the world's response: concrete, in-fiction, a person or a number or an object;
    never a maxim, never an imperative, never a general rule.
  - **Lesson** — why it mattered: one sentence, personal to this month where possible; a rule of thumb
    only where the card is that Concept's **Teachable Moment** (spine cards and first experiences).
  - **Seam (build):** copy keys stay language-neutral ids; add an **optional**
    `card_<id>_choice_<choice>_reaction` beside the existing `…_feedback` (now the Lesson), resolved
    with a fallback: no `_reaction` → today's exact one-paragraph rendering. No schema change, no
    state, no migration; old saves and unauthored cards render as before; the parity gate covers both
    keys ×3 locales. Convert the spine + Stage 1 first, then one Stage per content step.
  - **Never:** tap-to-reveal, hidden Lessons, or a Lesson dropped for brevity. The lesson is visible;
    it is just no longer on top.
- **Copy rules (seven) and ban list.** Rules: never speak from outside the fiction; no maxims or
  imperatives in the Reaction; the Lesson is short and personal; the narrator may be surprised, never
  certain; decision cards need two defensible options; humour is situational, never idiomatic
  (three-locale machine translation); no numbers the player cannot see. Ban list (review gate):
  *lesson, learn, teach, quiz, test, unlock, curriculum, course, mastery, score, points, streak,
  remember, should, always, never, "the point is", "this game"* — unless the fiction's own word (a
  course card may say course).
- **Where the general lessons live now.**
  1. **The Money Story gains "What the five years taught you"** — 2–4 **Reflections**, derived from
     the player's own record by a new pure module (`reflections.ts`, in the `metrics.ts`/`stats.ts`
     tradition): the year the plan held most, where the leak was, the debt chapter, the investing
     outcome (after 4.3). *"You"* statements; no imperative, no general law, no scold; capped at four;
     picked by precedence; tested table-driven with empty/legacy records. **This is the pass's
     centrepiece: the game stops telling you how money works and shows you how yours worked.**
  2. **The Year in Review keeps its shipped shape** — no new row (`docs/adr/0003`).
  3. **Teachable Moments keep one general line each**, because a first experience is where a rule of
     thumb belongs.
- **Curriculum → "met".** Stage-up leads with the life change; `stage_up_unlocks` becomes *"What
  you'll meet: …"*. Concept Coverage, the concept names and the Journal stay exactly as shipped
  (Coverage is the learning payoff); the class words leave the copy, not the learning.
- **Onboarding (the First Minute).** Two screens, hook first: *"You are 14. You have ◈60 and a roof
  you do not pay for."* → five years, nobody hands you the money; then the month in one breath (plan /
  something happens / see what it cost) with the Named Goal as the horizon. Privacy line, language
  switcher and dot progress stay; the first card remains the tutorial.
- **The name.** Working title **"Five Years"** (alternatives "Payday", "Ledger"); `app_title` + four
  route titles ×3 locales; branding/domain remain the owner's.
- **Time texture.** The HUD's month line becomes *"Age 15 · Year 2 · March"* — month names via
  `Intl.DateTimeFormat` with the **same explicit-locale pattern `formatMoney` uses** (SSR/hydration
  safe), run starts in September, ages step at year boundaries exactly as shipped; no new keys, no new
  state; the plain month counter stays where the record is read.

### 4.3 Life — variety, stakes, memory

- **Threads (the memory engine).** Add **4–6** new plants/resolves across Stages 2–5: a subscription
  started (the creep returns), a bike bought (repair or sell), a Saturday rota taken (exams arrive), a
  favour for a sibling (returned or not), a scam reported (the aftermath), a team joined (fees and
  time). **One live at a time stays** (two chips is a dashboard; one is a story). Chips name people
  where the Thread belongs to one (*"Priya's course"*). No new state: the existing `thread` field,
  countdown, and payoff card.
- **The deck grows under rules, gated by a balance harness.**
  - Size: every Stage's **guaranteed-unseen floor** (`deck.test.ts`) rises to **≥ its draws + 3** —
    14 / 11 / 11 / 11 / 8 today, becoming 14 / 14 / 14 / 14 / 11 (shared path) — ≈ +12 cards, plus
    4–6 new Threads' resolve cards and the windfalls, risks and villain card (≈ +20 in all); the
    longer-term aim is draws + 6.
  - Three rules: **two defensible options** per decision card (no quizzes); **no new mechanics** — the
    effect vocabulary stays `cost`/`gain`/`freeTime`/`category`/`insuredCost`/
    `sets{insurance,bnpl,path,overdraft,minimumStreak,thread}` plus the two Fund fields; **the lean
    year stays lean** (no card guarantees year-5 survival, shocks stay rare and ≤400).
  - **The gate:** `balance.test.ts` runs ~100 seeded Runs per scripted policy (an "impulse" and a
    "steady" player) through the real reducer and asserts the outcome-band distribution, the
    final-net-worth spread and the year-5 obligations-to-income ratio stay inside bands recorded from
    the current deck; a **variety test** in the same harness asserts the mean overlap between two
    Runs' drawn cards falls below the threshold recorded before the pass. Content PRs tune the cards,
    never the economy.
- **Windfalls, risks and the villain.** Two windfalls (mid-run and late; two defensible options, as
  `grandma_windfall`); one or two more risk moments (premium vs risk, odds shown); and **one
  play-the-villain card** in Stage 4–5 where the player is the one selling the easy payments — the
  research's strongest anti-moralising device, teaching predatory terms from the inside, with no
  telling-off. No new kinds; weights keep them occasional.
- **The Fund is wired (the one economy change).** Deposits move Save→Fund via a new `sets.fund: N`,
  capped at what the draw actually provided (envelope + Save; **never borrowed money** — investing
  debt is silently impossible). `closeMonth` applies a **seeded monthly return** to a non-zero Fund,
  drawn through the existing `turnRng(seed, month)`: mean ≈7 %/yr, volatility ≈16 %/yr, clipped to
  ±15 %/month. At the spine month 55 the market falls ≈25 % for holders; the shipped choices become
  true — **hold** rides a scripted partial recovery over months 56–60, **sell** liquidates at the
  crashed value, **buy** adds at the fallen price. The Close gains a **Fund row** when the Fund holds
  money; the Stats Sheet's Fund row goes live; the Named Goal (which already counts `fund`) finally
  means something; no HUD change. Two Fund Milestones become possible (`fund_opened`,
  `rode_the_recovery`) beside the shipped `weathered_the_crash`; the gamification design's block on
  them is lifted. **Prototype first, harness after**; the market's parameters are the tuning surface —
  the goal, the bands and the Proof are not.
- **Stakes and recovery.** Stakes stay recoverable: no new failure states, no game-over, no lost
  progress, no punitive sound; shocks and the crash stay bounded. The change is *weight and
  legibility* — the cascade is seen where it lands, the crash is real, the debt is lived with and
  clearing it is a Milestone (shipped). A consequence may be sharp; a surface may never be ashamed.
- **People, not a system.** No relationship state. Threads carry people back; a copy-continuity rule
  lets a few named people recur naturally; the avatar ages. The player *is* the character, and the
  Journal is the memory.

### 4.4 Memory and replay

- **Reflections** — described in 4.2; the Money Story's closing reflection.
- **The Epilogue.** Six short authored strings (3 Outcome Bands × 2 paths, ×3 locales), 2–3
  sentences: where the character is at 19, what the five years bought and cost, honest with the band
  and never a verdict. Placed at the end of the Money Story, after the record and the Reflections,
  immediately before "What next". The largest emotional payoff per unit of cost in the design.
- **The Twin Run.** A Run started from a finished Chapter's seed — **"Same seed. Same start. Your
  choices change what comes next."** The spine, the seeded draws and (post-4.3) the market start
  identical; the world diverges by design (the deck's `requires`/`seen` state follows choices).
  Entry: one quiet action on a Chapter in the Journal, offered **only when no Run is in progress**
  (never overwriting a live Run) and only for a seed the player's own archive holds, validated
  server-side. **Nothing of the other Run is shown while the twin plays**; afterwards it is simply
  another Chapter in the order lived. No modifiers, no challenge scores — still deferred.
  **Required build fix:** the Journal's Chapter key becomes `seed + finishedAt` (a twin shares its
  seed by definition; the current `(chapter.seed)` key would collide).

---

## 5. Guardrail reconciliation

| Guardrail | Verdict | How it is honoured |
|---|---|---|
| Ticket 05 / `docs/adr/0003`: no live teaching metrics | **Reaffirmed** | Live = money, arithmetic, the Fund, receipts. Judgement = Year in Review, Reflections, Epilogue, Journal. No live competence-derived number anywhere. |
| Ticket 08 / `docs/adr/0001`: no reward loop | **Reaffirmed** | Peaks/content/voice only; the device test (§6) is the review gate; the villain card is consequence, not reward. |
| Ticket 12: privacy, no analytics, no PII | **Reaffirmed** | No new data; the Twin seed is already stored; export/delete/retention cover everything; the playtest collects no PII. |
| Ticket 13: beats-only art, one accent, no music | **Reaffirmed** | No new illustrations; no second accent; SFX-only, off by default — two cues and five motifs inside the existing bank. |
| Ticket 14: WCAG 2.2 AA, no timers, reduced motion | **Reaffirmed** | Motion vocabulary (4.1) is one-shot, reduced-motion-collapsed, text-carried; every new state joins the axe screens; the four manual passes are re-run. |
| i18n ×3, parity gate, determinism | **Reaffirmed** | All new copy in all catalogues; idiom-free short strings; the Fund market uses the existing seeded RNG; locale never feeds it. |
| Add-only rule; recoverable consequences | **Reaffirmed** | No stage removes anything; no new failure states; stakes stay bounded. |
| Better-Choices Proof | **Reaffirmed as non-negotiable** | Nothing may make a proof-worsening choice more attractive; the metrics, bands and comparisons are untouched. |
| Deck freeze ("no change to deck/economy/draw/reducer") | **Reopened for content only** (ADR-0002) | New cards and Threads under the balance harness; shapes, vocabulary, draw, reducer and economy numbers frozen. |
| Fund is a no-op | **Reopened and wired** (ADR-0003) | Bounded seeded market; prototype first; harness; ≤2 new Milestones; one new Close row. |
| Same-seed replay deferred | **Reopened as the Twin Run** (ADR-0004) | Retrospective-only comparisons; safe entry; the Journal key fix. |
| Play-the-villain out of scope | **Reopened for one card** (4.3) | Consequence teaches; no maxim; content review. |

---

## 6. How learning is carried by fun

- **The moment reacts; the record reflects.** Consequences land in the fiction and the numbers (that
  is the lesson, felt); the general rules appear at first experiences and in the player's own
  retrospective — Reflections, the Year in Review, the Epilogue, the Journal.
- **Reflections are the mechanism:** *"Year 3: eleven months of twelve inside your own budget"* is
  more instructive than any maxim because it is about a life the player actually lived.
- **The Proof is untouched.** The seven metrics, the Behavioural Measures, the outcome bands and the
  you-vs-you comparison are unchanged; the pass changes how teaching is *delivered*, never what counts
  as better.
- **The test any new device must pass:** (1) which Concept does it carry? (2) at which moment does it
  land? (3) why does the player *experience* it rather than read it? "Because it's fun" is not an
  answer.

---

## 7. Risks and mitigations

| Risk | Mitigation |
|---|---|
| The quieter Lesson weakens learning | Lesson stays visible and always present; general rules survive on Teachable Moments and in Reflections; the Proof is unaffected; playtest asks what players learned. |
| Peaks read as noise or cheap juice | Eight named beats, one-shot, ≤600 ms, quiet; review rule "carry meaning or lose it"; the statement identity untouched. |
| Content growth drifts the balance/bands | The balance harness is a hard gate; content rules (4.3); cards are tuned, never the economy. |
| The Fund moves the goal, bands or Proof | Prototype first; harness; the market parameters are the tuning surface; ≤2 Milestones; one Close row; playtest. |
| Copy ×3 degrades (idiom, machine translation) | Short, concrete, idiom-free strings; the ban list; the Fink debt recorded and growing; run the Fink pass once, after the voice pass. |
| Motion/a11y regressions | The motion vocabulary's hard rules; axe screens for every new state; the four manual passes re-run each release. |
| Scope creep turns a pass into a rebuild | Six build steps plus the human verification pass; each shippable alone; the Fund isolated behind a prototype; the pass can stop after any step and the game is better. |

---

## 8. The additive sequence (builds on the shipped gamification layer)

Every step is independently landable and leaves the game playable, gated and better on its own. The
shipped surfaces — Milestones, Year in Review, Concept Coverage, Journal — are **not re-opened**;
the Money Story is extended (Reflections, Epilogue), the Journal gains one action (Twin).

| # | Step | What ships | Depends on | New gate |
|---|---|---|---|---|
| 1 | **Peaks** | Motion tokens; Deal/Answer/Tally beats; Feedback block restructure with the shipped fallback; Stage-up poster shell; `deal` cue | — | Axe screens for the new states; reduced-motion check; interaction-cost proxy |
| 2 | **Voice** | Reaction keys for spine + Stage 1; copy rules and ban list; *"What you'll meet"*; two-screen intro; the title | 1 | i18n parity ×3; copy review |
| 3 | **Reflections + Epilogue** | `reflections.ts`; "What the five years taught you"; the Epilogue (6 strings ×3) | 1, 2 | Table-driven unit tests; axe screen for the Money Story additions |
| 4 | **Memory** | Threads content (+4–6); people rule; ≈ +12 cards across the thin Stages, plus the windfalls, risks and the villain card; balance harness; Stage-by-Stage Reaction conversion | 2 | Balance harness; new a11y seeds per kind; Fink debt noted |
| 5 | **Investing** | The Fund wiring: prototype → `sets.fund`/liquidation; seeded monthly market in `closeMonth`; real crash + recovery; Fund row in the Tally; Stats Sheet live; ≤2 Milestones | 2, 4 (harness) | Prototype findings; harness; unit tests; a11y screen; ADR-0003 |
| 6 | **Replay** | The Twin Run: Journal action; seed validation; `seed + finishedAt` key fix; copy | 5 (market is part of the seed's world) | Unit tests for the projection and key fix; a11y screen; playtest question |
| 7 | **Verification + docs** | The human playtest; the four manual a11y passes; `CONTEXT.md`/ADR merge; `docs/art-audio.md` and `docs/accessibility.md` updates; Fink debt register | all | Human-owed |

**Definition of done for the pass:** `pnpm verify` green (check · unit · i18n · axe/reflow/keyboard ·
Lighthouse) with the new states included; the balance harness green; the four manual a11y passes
performed and any failures filed; the playtest run and its quotes recorded; the Better-Choices Proof
demonstrably unaffected; the vocabulary matching the merged `CONTEXT.md`.

---

## 9. What stays human-owned

**Closed 2026-09-27 — every item below was put to the orchestrator and accepted as recommended; see
"Settled decisions (orchestrator answers)" at the end of this file.**

1. **The playtest** — the only honest test of fun; no telemetry (banned) and no automated substitute.
   Protocol: five teens 13–18, one at a time, 25 minutes, think-aloud, on their own phone where
   possible; observe where they stop and whether they talk about the character or the lesson; ask
   *"What happened in your five years?"*, *"What would you tell a friend?"*, *"Would you play again —
   and what would you do differently?"*; record quotes, not scores.
2. **The Fink pass** on it/ro — run once, after step 2, so the voice pass is translated once.
3. **The art review** by a human designer on the ten existing pieces (already flagged in
   `docs/art-audio.md`) — recommended before step 1 ships, so the poster compositions are reviewed
   against the final line weights.
4. **The name** — "Five Years" is the working recommendation; domain and branding are the owner's.
5. **The Fund's tuning** after the prototype — the market's mean/volatility/recovery are the knob; the
   goal, the bands and the Proof are not.

---

## 10. Evidence

- Grilling log (34 questions, five rounds, the full design tree): `grilling-log.md`.
- Glossary proposals: `CONTEXT-delta.md`.
- ADRs: `adr/0001-more-fun-is-peaks-not-currencies.md`,
  `adr/0002-the-deck-is-a-living-surface.md`, `adr/0003-the-fund-is-wired.md`,
  `adr/0004-replay-is-a-twin-not-a-challenge.md`.
- Repo ground truth used: `CONTEXT.md` (Gamification cluster);
  `.scratch/mvp/issues/01,03,04,05,08,13,14,16,17,19,30`; `.scratch/mvp/research/08-prior-art.md`;
  `.scratch/gamification/design.md`; `docs/adr/0001–0003`; `docs/art-audio.md`;
  `docs/accessibility.md`; `src/lib/game/{economy,loop,cards,metrics,milestones,journal,spine,threads,beats,stats}.ts`;
  `src/lib/components/*`; `messages/en.json`; `src/app.css`.
- The three decisive code facts: `RunState.fund` is initialised at `loop.ts:194` and **never
  incremented**; `the_fund` (◈400), `the_crash` "buy" (◈200) and `boring_fund` (◈50) spend via
  `drawFromPot` with no Fund credit; the spine fixes the crash at month 55.

---

## Settled decisions (orchestrator answers)

*The five human-owned items in §9 were put to the orchestrator on 2026-09-27 and accepted exactly as
recommended. The open list is closed; nothing in the design changes.*

1. **Playtest** — accepted: run the §9 protocol; human-owed, carried into the merge's verification
   plan.
2. **Fink pass on it/ro** — accepted: run once, after the voice pass (sequence step 2), so the voice
   pass is translated once.
3. **Art review** of the ten existing illustrations — accepted: before step 1 ships.
4. **Name/branding/domain** — **"Five Years"** accepted as this run's recommendation (alternatives
   "Payday" / "Ledger" recorded); the final title is the orchestrator's merge call.
5. **Fund tuning after its prototype** — accepted: tune the market's mean/volatility/recovery only;
   never the goal, the bands or the Better-Choices Proof.
