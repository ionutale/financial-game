# Fun grill — run 3

**Ask (the user's words):** *"I want to improve the game even more, make it more fun, more attractive,
and make it feel less like a teaching class and more like having a good time and fun."*

**Mode:** non-interactive. There is no human in the loop for this run, so every question is settled
immediately with the run's own ➡️ recommended answer, which stands as the user's answer. Nothing is
silently assumed: every branch of the design tree is written down, answered, and the frontier
recomputed until it is empty.

**Sandbox:** this run writes only under `docs/fun-grill/run-3/`. It does **not** edit `CONTEXT.md`,
`docs/adr/`, `.scratch/`, or any source file. `CONTEXT-delta.md` and `adr/` here are *proposals* to be
merged by the orchestrator.

**What shipped just now (the layer this design builds on, and must not re-propose):** the
gamification layer — **Milestones** (12 in-Run + `both_paths`), the **Year in Review** on every
Stage-up, **Concept Coverage** (Introduced / Experienced), the **Journal** route, the Named-Goal
quarter ticks and the one `milestone` cue. Commits `345a76a` … `1ba5f85`, decision record `14abdd5`,
ADRs `docs/adr/0001–0003`.

---

## Grounding facts gathered from the repo first

The decisions below are anchored to these; where the code contradicts its own design, that is called
out and becomes a question.

**The shipped game, as a player feels it.**

- **The month is one fixed shape, 60 times:** Plan (three envelope sliders + a work-hours slider) →
  **card** (2–3 Choices with mechanically-derived cost chips) → **Feedback** (one explainer
  paragraph) → `Continue` → **Month Close** (a table of figures: income, needs, wants, obligations,
  BNPL, interest, next obligations) → `Next month`. Minimum 4 taps + optional slider work per month
  (`MonthScreen.svelte`, `PlanStep.svelte`, `EventStep.svelte`, `ResolveStep.svelte`).
- **The teaching voice is ever-present and always right.** Every Choice's Feedback ends with the
  principle: *"This is the shape of being a grown-up: costs that do not care how your month went"*
  (`card_phone_plan_choice_take_feedback`); *"Nothing else in this game pays that well"*
  (`card_subscription_creep_choice_cut_feedback` — also breaks the fiction by naming "this game");
  *"Most of the time this is the whole answer"* (`card_overdraft_choice_wait_feedback`). The
  Month Close's over-budget note is a mini-lecture: *"You went past one of your envelopes this month.
  That is allowed — the cascade covered it — but the money came from somewhere"* (`resolve_over_note`).
- **The curriculum is visible.** A Stage-up says `Unlocks budgeting & tracking` (`stage_up_unlocks`);
  the Stats Sheet and Journal show **Concept Coverage** (Introduced / Experienced / Not yet); the
  intro is **three screens of instructions** (`Intro.svelte`); the title is **"Financial Life-Sim"**
  (`app_title`) — a genre label, not a name.
- **The rhythm has no peaks.** Cards vary, but the *drama* is flat: the Deal is an undifferentiated
  `.rise` fade; the Close is a table; the crash is one card; failure and success are both quiet. The
  only recurring highs are the Named-Goal bar (ticks, shipped) and the stage-up review (shipped).
- **The presentation is a ledger.** Warm paper, one money accent, DM Mono tabular figures, ten inline
  SVG beat illustrations, five synthesised cues **off by default**. Deliberate and distinctive — but
  the visual language of accounting, with no motion beyond two one-shot emphases.
- **The character has no presence.** Second person, no name, no face beyond a silhouette that ages;
  the people in the cards (Priya, Ravi, Danny, "the neighbour") appear once and vanish; nothing but
  Threads remembers them.

**The deck and its mechanics (the engine of fun).**

- **84 cards** (77 `decision`, 2 `risk_moment`, 2 `scam`, 2 `shock`, 1 `stage_up`); a Run plays 60
  Event Cards, of which **8 are spine (months 1, 13, 25, 37, 50, 51, 53, 55) and one is the Fork
  (month 49)**; the other **52 are seeded draws** from a card pool that never repeats within a Run.
  The **guaranteed-unseen floor per Stage is 14 / 11 / 11 / 11 / 8–14** (`deck.test.ts` asserts each
  floor ≥ that Stage's draws): Stages 2–4 can consume every card that no earlier Stage could have
  shown, so a second Run re-meets most of the deck.
- **Threads are the game's memory device**, and there are **three**: `course_enrolled` (3 months),
  `friend_loan` (3), `risky_tip` (2). At most one is live at a time; the chip counts down; the payoff
  is a real card with choices.
- **The Fund is a lie the game tells.** `RunState.fund` is initialised to `0` (`loop.ts:194`) and
  **never incremented anywhere**. Three cards spend into it and the money simply vanishes:
  `the_fund` "open" −400 (`cards.ts:1298`), `the_crash` "buy" −200, `boring_fund` "fund" −50 — all
  drawn from Save via `drawFromPot`, none moved to `fund`. Meanwhile `CONTEXT.md` defines **Fund** as
  *"the market-investment pot; the only place money can grow faster than inflation"*, the crash's copy
  promises *"the recovery always happens without you if you sell"*, and the Work path's whole goal is
  net worth ≥ 4,000. **Following the investing story currently costs up to ◈650 of a ◈4,000 goal and
  buys nothing.** The gamification design recorded this as a known gap and deferred it
  (`design.md` §5 #7, §7, §11).
- **The crash is scripted at month 55** (`spine.ts`) and is a decision vignette today, because no
  money is ever at risk in the Fund.

**The guardrails (ticket 05 / 08 / 12 / 13 / 14 + the gamification ADRs).**

- Ticket 05: teaching metrics **never visible during a Run** — *"a player who can see a score
  optimises the score"*. Live: balances, the Named Goal bar. Retrospective: the Year in Review, the
  Money Story. (`metrics.ts` header, `docs/adr/0003`.)
- Ticket 08: **no XP, points, coins, lives, stars, gems, levels, streak mechanics or leaderboards**;
  tax/scams/needs-vs-wants as consequences, never quizzes; *"if we use points at all, they must be the
  money itself"*; the research's strongest anti-moralising device is **let the player play the
  villain** — and the gamification design put that card **out of scope** (`design.md` §10).
- Ticket 12: one strictly-necessary cookie, no analytics, no PII, export/delete/retention sweep.
- Ticket 13: typographic-first, **~10 illustrations, beats only**, one accent reserved for money,
  colour never load-bearing, **SFX only, off by default, no music**, CC0 audio / permissive icons+fonts.
- Ticket 14: WCAG 2.2 AA + documented subset, **fully screen-reader playable, no timers anywhere, no
  auto-advance**, reduced motion collapses animation, colour never carries meaning, 44px targets;
  verification = axe + Lighthouse in CI plus four manual passes (muted / zoomed / keyboard / greyscale).
- i18n: en/it/ro, catalogue keys with a parity gate; **machine-translated it/ro carry a Fink pass
  debt**; seeded determinism (locale never feeds the RNG); Add-only rule; recoverable consequences.
- `pnpm verify` = check · unit tests · i18n gate · axe/reflow/keyboard · Lighthouse ≥ 0.95.

**What the four gamification grill runs already asked and settled (do not re-propose).**
Milestones are derived, event-shaped, positive-only and grant nothing; the Year in Review is a closed
year's money headline + one behavioural line + its Milestones; the Journal is chronological and never
ranked; **Personal Bests, money-crossing milestones, Challenge Runs, cosmetics, same-seed replay and
Fund wiring were explicitly deferred**; the "play the villain" card was out of scope; no new art;
no new state; no toasts; no second visual language (`docs/gamification-grill/run-3/…`,
`.scratch/gamification/design.md` §5, §10, §11).

**Note on references:** `ADR-NNNN` means this run's proposed ADR under `docs/fun-grill/run-3/adr/`;
an existing repo decision is cited as `docs/adr/NNNN`.

---

## The design tree

```
MAKING IT FUN — AND LESS LIKE A CLASS
├── A. The frame ....................................... ROUND 1 (Q1–Q6)
│   ├── A1 what "fun" is allowed to mean here .......... Q1
│   ├── A2 what actually makes it feel like a class .... Q2
│   ├── A3 the avoid-the-score rule under a fun pass ... Q3
│   ├── A4 the reward-loop boundary .................... Q4
│   ├── A5 which guardrails reopen (and which never) ... Q5
│   └── A6 the attractiveness budget + anti-goals ...... Q6
├── B. Feel and presentation ........................... ROUND 2 (Q7–Q14)
│   ├── B1 the month's beat structure (Deal/Answer/Tally) Q7
│   ├── B2 the motion vocabulary ....................... Q8
│   ├── B3 the money moves (count-ups, cascade) ........ Q9
│   ├── B4 the card as the star (composition) .......... Q10
│   ├── B5 the Deal (the card arrives) ................. Q11
│   ├── B6 the Tally (Month Close) ..................... Q12
│   ├── B7 the Turn (Stage-up) and the sound ........... Q13
│   └── B8 the Ending (epilogue) ....................... Q14
├── C. Voice and framing ............................... ROUND 3 (Q15–Q21)
│   ├── C1 Feedback split: Reaction + Lesson ........... Q15
│   ├── C2 the copy rules (ban list) ................... Q16
│   ├── C3 where the general lessons live .............. Q17
│   ├── C4 curriculum → "met" .......................... Q18
│   ├── C5 onboarding .................................. Q19
│   ├── C6 the name .................................... Q20
│   └── C7 time texture (the date) ..................... Q21
├── D. Life: variety, stakes, memory ................... ROUND 4 (Q22–Q28)
│   ├── D1 threads, the memory engine .................. Q22
│   ├── D2 deck rules and the balance gate ............. Q23
│   ├── D3 windfalls, risks and the villain ............ Q24
│   ├── D4 the Fund: investing made real ............... Q25
│   ├── D5 stakes and recovery feel .................... Q26
│   ├── D6 recurring people ............................ Q27
│   └── D7 replay: the Twin Run ........................ Q28
└── E. Carry, verify, sequence ......................... ROUND 5 (Q29–Q34)
    ├── E1 learning carried by fun (the test) .......... Q29
    ├── E2 fun verification without telemetry .......... Q30
    ├── E3 a11y / i18n / privacy obligations ........... Q31
    ├── E4 risks and mitigations ....................... Q32
    ├── E5 the additive sequence ....................... Q33
    └── E6 human-owned / still open .................... Q34
```

---

## Round 1 — The frame: what "fun" is allowed to mean here

### Q1 — The fun thesis

❓ **Q1** - **What kind of fun is this game allowed to have?**: "More fun" is not a design brief until
it names the fun. The three candidate families: (a) **reward-loop fun** — points, streaks, unlocks,
loot, a live score to chase (b) **arcade fun** — tension under time, difficulty, retries (c)
**life-sim fun** — authorship, consequence, discovery, mastery of a legible system, and delight in the
moment-to-moment feel. Which is this game's, and what does each candidate cost?

➡️ **Settled: (c), and only (c).** The fun thesis is **"a life you author, felt in the money"**:
- **Authorship** — the choices feel like *you* steering a life, not like answers to a question.
- **Consequence** — the world remembers: Threads, debt, the crash, the Journal.
- **Discovery** — cards are the content; each month can surprise; decoys and tells are real.
- **Mastery** — the economy is legible enough to get good at, without a scoreboard.
- **Delight** — the feel of the thing: motion, sound, type, a well-turned line, a peak that lands.

(a) is rejected exactly as ticket 08 and `docs/adr/0001` reject it: rewards attach to completing prompts, not
to competence, and expected tangible rewards undermine intrinsic motivation. (b) is rejected by ticket
14 (no timers, no auto-advance, no failure spirals) and by the research: a game that rewards speed
teaches speed. **Every device proposed later in this tree must answer two tests: *which part of living
does it deepen?* and *what would a player optimise if they optimised it?* — if the answer to the second
is anything other than the life and the money, it is out.** This is the pass's constitution; it becomes
ADR-0001.

### Q2 — What actually makes it feel like a class

❓ **Q2** - **Is the classroom feel a guardrail problem or a craft problem?**: The pessimistic read is
that the guardrails (metrics hidden, no rewards, no timers, one author, typographic-first) *are* the
classroom. The optimistic read is that the classroom lives in the surfaces — the explainer voice, the
curriculum vocabulary, the instruction-first onboarding, the flat rhythm — and none of those are
guardrails. Which is it, and what is the evidence in the repo?

➡️ **Settled: it is a craft-and-voice problem, with four real guardrail exceptions to reopen
explicitly (Q5).** The evidence:
1. **The narrator explains *at* you.** ~200 Feedback paragraphs each end in a general principle — the
   structure of a lesson, even where the writing is good. This is the single strongest class signal,
   and the guardrails do not require it: the required *teaching* is the outcome-connects-to-the-Concept
   link, not an imperative or a maxim.
2. **The curriculum is worn on the outside.** "Unlocks budgeting & tracking", three instruction
   screens before play, "Concept coverage", the title "Financial Life-Sim". Life-sims say *"you're 14,
   here's ◈60"*; syllabuses say *"unlocks"*.
3. **The rhythm is flat.** 60 months of the same three-phase shape, with no Deal, no peak, a table for
   a Close, quiet failures and quiet wins. Fun needs contrast — peaks and releases — and the game
   spends none of its a11y/complexity budget on any.
4. **The presentation is a statement, not a life.** Deliberate, distinctive, translation-proof, and
   contrast-checked — but no motion carries a consequence, sound is off by default, and the one
   emotional surface (the Money Story) is a report.

The four genuine guardrail-shaped costs — each handled explicitly in Q5, each with an ADR — are: the
**deck/economy freeze** (content can't grow, so a second Run is déjà vu), the **Fund no-op** (the
investing concept is mechanically false), the **play-the-villain exclusion** (the research's best
anti-lecture device, declined), and **same-seed replay** (deferred). Everything else — the hidden
score, no reward loop, no timers, one accent, beats-only art, privacy — is *kept*, because none of them
makes the game feel like a class; the voice and the surfaces do.

### Q3 — The avoid-the-score rule under a fun pass

❓ **Q3** - **Does "more fun" reopen the live-teaching-metrics ban?**: The game hides budget
adherence, savings rate and want share during a Run (ticket 05, `docs/adr/0003`). A fun pass is tempted to
add a live "how you're doing" signal — a streak, a mood meter, a rating — because feedback is fun. Does
it?

➡️ **Settled: no, reaffirmed, and made sharper.** The *line* stays exactly where `docs/adr/0003` drew it:
- **Live, allowed:** facts about your own money and arithmetic the player can see themselves — cash,
  net worth, the Named Goal bar, obligations, the Shortfall Warning, a Loan or a BNPL balance, and
  (after Q25) the Fund's value and its monthly move. These are legible in the fiction and cannot be
  farmed by pretending.
- **Live, forbidden:** anything competence-derived and numeric — adherence, savings rate, want share,
  a streak counter, a mood/wellbeing score, a "you're doing great" rating.
- **Retrospective, allowed:** the Year in Review, the Money Story, the Journal (shipped) and this
  pass's **reflections** (Q17) — all closed-record, all derived, all non-actionable.

The fun pass makes the *live* side richer (Q9, Q12, Q25) and keeps the *judgement* side retrospective.
The temptation to smuggle a meter in is named here so a reviewer can catch it: **a device that moves
when the player behaves well, mid-Run, is a score, whatever it is called.**

### Q4 — The reward-loop boundary

❓ **Q4** - **Does the ban on reward loops survive a "make it fun" ask intact?**: The ask's most
obvious reading is "add the things that make mobile games fun" — streaks, daily rewards, loot. The
repo bans them (ticket 08, `docs/adr/0001`). Reaffirm, weaken, or replace?

➡️ **Settled: reaffirmed, intact, no exceptions.** No XP, points, coins, lives, energy, stars, gems,
levels (Stages remain the only ladder), badges-as-payoffs, streak mechanics, leaderboards, loot,
variable rewards, daily cadence, notifications. The fun budget this pass spends instead is:
**recognition** (shipped Milestones), **memory** (shipped Journal + Q22 Threads + Q28 Twin Run),
**content** (Q23–Q24), **voice** (Q15–Q20), and **peaks** (Q7–Q14). The test that keeps this honest
is Q1's second question — *what would a player optimise if they optimised it?* — plus one more: **if a
device can be missed, can it also be bought back, waited out, or lost punitively? If yes, it is a loop
and it is out.**

### Q5 — Which guardrails reopen (and which never)

❓ **Q5** - **Exactly which settled boundaries does this pass reopen?**: The gamification design froze
a great deal (`design.md` §6, §10, §11: no economy/deck/draw/reducer change; play-the-villain out of
scope; same-seed replay, Challenge Runs, Personal Bests, cosmetics and Fund wiring deferred). A fun
pass that silently crossed any of those would be the failure this run must avoid. Which are reopened,
which are reaffirmed, and what does each reopening cost?

➡️ **Settled: four reopenings, each explicit, each with an ADR; everything else reaffirmed.**

| # | Boundary | Decision | Why | Gate |
|---|---|---|---|---|
| 1 | **Deck content freeze** ("no change to the deck") | **Reopen for content only.** New cards and Threads may be added; `Card`/`Choice` shapes, the effect vocabulary (plus Q25's two Fund fields), the draw algorithm, the economy and the reducer stay frozen. | Variety is the cheapest fun this game has, and Stages 2–4 can consume every card that no earlier Stage could have shown — a second Run re-meets most of the deck. | Balance harness (Q23/Q30); i18n ×3; a11y seed per card kind. |
| 2 | **The Fund** (`fund` never incremented; investing is a sink) | **Reopen and wire it** (Q25). Money moves Save→Fund, the seeded market moves it, the crash is real. | `CONTEXT.md` promises growth; the copy promises a recovery; the mechanics deliver a ◈650 sink against a ◈4,000 goal. This is a *correctness* fix before it is a fun fix. | Prototype first; balance harness; ADR-0003. |
| 3 | **Same-seed replay** (deferred) | **Reopen as the Twin Run** (Q28): replay a finished Chapter's seed, comparisons retrospective only. | The strongest pure you-vs-you in a game whose whole philosophy is you-vs-you; the seed is already stored; no new data. | Journal-only entry; no live twin data; ADR-0004. |
| 4 | **Play-the-villain card** (out of scope) | **Reopen for exactly one card** (Q24), in the Stage 4–5 credit/BNPL territory. | Ticket 08's research: the strongest anti-moralising device; the game currently only ever plays the customer. | Content review: no maxim in the copy; the consequence teaches. |

**Reaffirmed, unchanged, and named here so a reviewer can hold the line:** the avoid-the-score rule
(Q3), no reward loop (Q4), **no timers / no auto-advance / no punitive failure**, the privacy posture
(one cookie, no analytics, no new PII), one money accent and colour never load-bearing, beats-only art
(~10 illustrations — this pass adds no drawings), SFX-only/off-by-default/no music bed, i18n ×3 with
the parity gate, seeded determinism (locale never feeds the RNG), the Add-only rule, recoverable
consequences, and the Better-Choices Proof as the single success criterion.

### Q6 — The attractiveness budget and the anti-goals

❓ **Q6** - **What can "more attractive" buy with one author, no new art, and a 430px screen?**: Every
conventional answer — more colour, character art, a mascot, backgrounds, a soundtrack, animated
scenes, confetti — is either outside the budget (ticket 13) or hostile to the a11y commitments
(ticket 14). What *is* affordable, and what must this pass explicitly refuse to do so the quiet
identity survives?

➡️ **Settled: attractiveness = peaks and composition, not assets.**
- **Affordable and chosen:** named **beats** (Q7–Q14) with a small motion vocabulary, per-kind card
  composition, a restructured Feedback block, a receipt-like Close, a poster Stage-up, an epilogue,
  three or four more synthesised cues and a per-Stage motif, richer use of the ten existing
  illustrations (the crash drawing itself, the avatar aging in transition), and the 5-year arc made
  tangible.
- **Refused:** no new illustrations or characters, no second accent, no dark mode (still v2), no
  background images, no confetti/particles/loops/parallax, no music bed, no themeable skins, no
  animation on scroll, no sound on by default, no interaction that needs a gesture or a timer.
- **The invariant that makes motion legal here:** **nothing loops, every motion is a one-shot under
  600 ms, `prefers-reduced-motion` collapses it to an instant state change, and the text always carries
  the meaning.** A visitor who reads the DOM and never sees a frame loses nothing.

**Frontier after round 1:** Q3 opens the live surfaces (B3, B6, D4); Q1+Q6 open the whole of B; Q1+Q5
open C, D and E; Q5's four reopenings open the content/economy/replay branches (D2–D4, D7); Q3+Q4
constrain every later answer.

---

## Round 2 — Feel and presentation: the peaks

### Q7 — The month's beat structure

❓ **Q7** - **What is a month's dramatic shape, and where are its peaks?**: Today a month is Plan →
card → Feedback → Close, each rendered with the same `.rise` fade. A month should be a tiny story with
a shape. How many peaks earn a treatment, and what are they called?

➡️ **Settled: three named beats inside the existing three phases — the Deal, the Answer, the Tally —
plus the five run-level peaks.** The month: *you set it up (Plan), life surprises you (**Deal**), you
decide and the world responds (**Answer**), you see what it cost (**Tally**).* The run: *the **Turn**
(Stage-up), the **Crash**, the **Landing** (a goal quarter or a Milestone — shipped, kept), the
**Ending**, and the **First Minute** (intro + first card).* Eight named beats, budgeted; every other
screen stays still. Naming them matters: a beat is a thing that can be reviewed, tested and *not*
extended by accident (see CONTEXT-delta, **Beat**).

### Q8 — The motion vocabulary

❓ **Q8** - **What are the rules of motion, and what may it never do?**: Ticket 13 says "motion carries
meaning; nothing decorates". A fun pass wants more motion. What is the vocabulary, and what keeps it
from becoming noise or an a11y regression?

➡️ **Settled: a four-step duration scale and five legal *meanings*; everything else is refused.**
- Tokens: `120 ms` state (a control acknowledging), `240 ms` arrive (a block entering), `360 ms` deal
  (the card), `600 ms` count (a number changing as a result of a decision). The existing easing
  (`cubic-bezier(0.22, 0.61, 0.36, 1)`) is the only one.
- Five meanings, and nothing else may animate: **money moves** (a value changed), **consequence
  travels** (the cascade), **the world arrives** (the Deal), **time turns** (Stage-up, age, year),
  **the record is read** (the Ending).
- Hard rules: one-shot only; ≤600 ms; starts from the element's own state; no infinite/ambient motion;
  no motion on scroll; no motion as the only carrier of meaning; `prefers-reduced-motion` removes it
  (the shipped global rule already collapses durations); every animated element has an accessible,
  static equivalent asserted by the axe suite.

### Q9 — The money moves

❓ **Q9** - **Which numbers animate, and how does the cascade become visible?**: The research is
explicit: *"animate the money on every choice — the number must move visibly"* (ticket 08 research
§6.04). Today numbers snap, and the cascade is one sentence under the Feedback. Where should motion be
spent, given a11y and screen readers?

➡️ **Settled: animate the numbers a decision changed, never a number that is merely on screen.**
- **At the Answer:** the HUD's net-worth and cash values count to their new value in ≤600 ms when the
  chosen Choice moved them (a Choice that costs or gains money); a no-cost Choice leaves them still.
  The count is visual only — no live region, final value in the DOM at all times (screen readers read
  the final text whenever they reach it).
- **At the Tally:** the net-worth change is the hero and counts; the affected rows of the receipt
  (Debt, Savings, the envelope that was overspent) get a one-shot emphasis.
- **The cascade:** when `run.cascade.fromSave > 0` or `.toDebt > 0`, the receipt emphasises exactly the
  rows the money left and the sentence states the amounts (shipped copy, kept). **No diagram, no new
  graphics** — the movement is the point, and the sentence is its accessible carrier.
- Under reduced motion all three are instant state changes; nothing is lost but the easing.

### Q10 — The card as the star

❓ **Q10** - **How should the Event Card be composed so the decision feels like the centre of the
game?**: Today the card is a small kicker, a 20px title, a 15px situation, and choice buttons that
look like form rows. The card is the game's content — the whole deck exists for it. What changes?

➡️ **Settled: composition only — no new assets, no new interactions.**
- The **situation is the largest body text on the screen** (17–18px, generous leading) and the title
  stays the heading; the kind label stays a kicker but reads like a notification (*"Out of nowhere"*,
  *"Your call"*).
- The **choices are the physical decisions**: taller targets (already ≥44px), the label at 16px, chips
  on their own line, a single hairline between options, a hover/focus state that reads as *pressing a
  card*, not filling a form.
- After the Answer, the block **restructures**: **Reaction** first (Q15) — the world's response in the
  larger type — then a hairline, then the **Lesson** in smaller, muted type; the cascade sentence
  keeps its place below the Lesson.
- The HUD keeps every element and its order; it simply loses visual weight while the card is up (the
  card's surface and type scale do the work; no collapsing, no sticky bars, no layout change that
  could break focus order).

### Q11 — The Deal

❓ **Q11** - **How does the card arrive, and what may the arrival not leak?**: The draw already happens
at `CONFIRM_PLAN` — the perfect suspense point, currently wasted on an undifferentiated fade. Should
the Deal vary by card kind, and can the variation leak information the player should discover by
reading?

➡️ **Settled: one Deal beat, subtly kind-aware, 360 ms, no information beyond what the kind label
already states.**
- Implementation shape: the Event phase's card block is keyed by card id and carries a
  `data-kind` attribute; a small set of entrance variants maps to the five kinds — a **decision**
  settles in, a **shock** lands with a slight weight, a **risk_moment** reveals its odds line a beat
  later, a **scam** arrives quietly (the quiet *is* the tell), a **stage_up** is the poster (Q13).
- The kind label is already on screen and already says the kind; the motion may echo it, never
  anticipate the content, the choice count, or the costs. Equal durations; no sound that isn't in the
  bank; reduced motion collapses all variants to the shipped `.rise`.
- A new `deal` cue (Q13) rides the tap that already caused the draw, so the AudioContext rule holds.

### Q12 — The Tally

❓ **Q12** - **What is the Month Close now that it isn't a report card?**: The close is the game's
most classroom-shaped screen: seven ledger rows and a scolding-ish note. It is also the moment where
cause and effect pay off. Reframe, restructure, or leave?

➡️ **Settled: keep it a receipt, make it read as one — facts, hierarchy, one emphasis.**
- **Hierarchy:** the net-worth change stays the hero (counts, Q9); income and spending read as the
  month's movement; obligations and next month's obligations are the *forward look* and keep their
  place at the bottom; the BNPL and interest rows appear only when they happened (as today).
- **The over-budget note is rewritten from a lecture to a fact:** *"You went over the Want envelope by
  ◈X. It came out of Save."* — no *"That is allowed… but the money came from somewhere"*, no second
  person imperative, no generalisation. The cascade's own sentence (shipped) already names the
  amounts; the two must not repeat each other.
- **New row (after Q25):** when the Fund holds money, one **Fund** row shows the month's move; this is
  the crash's landing place and the only new close row.
- The close keeps its labelled region + heading focus (ticket 25) and its focus behaviour; the count-up
  never moves the heading or changes the DOM value text.

### Q13 — The Turn and the sound

❓ **Q13** - **How do Stage-ups, the avatar and sound work in the fun pass?**: The Stage-up is the
year's biggest moment, and it currently renders a small banner plus the shipped Year in Review. Sound
is five synthesised cues, off by default. What changes without adding art or a music bed?

➡️ **Settled: the Stage-up becomes a poster; the avatar ages in transition; the bank grows by two
cues and five Stage motifs; music stays out.**
- **Poster composition:** the Stage's name and the age at large type, a **life-change headline** (five
  new authored strings — e.g. Stage 3: *"The allowance stops. Hours are the money now."*), then
  *"What you'll meet: {concepts}"* (Q18), then the shipped Year in Review, then the card/Fork.
- **The avatar** transitions between stage proportions (a cross-fade between the two silhouettes,
  ≤360 ms, reduced-motion instant) instead of snapping.
- **Sound:** keep synthesised, off by default, never load-bearing; add `deal` (a soft two-note arrival
  for the drawn card) and `shock` (a low, brief world-note distinct from the crash's long fall). The
  shipped `stage_up` arpeggio stays the Turn's cue and gains **five short Stage motifs** (three to
  four notes each), so each year has its own sound while the bank stays one module. **No music bed** —
  reaffirmed (ticket 13, phone speakers, autoplay rules, one-author licences, and the
  muted-playability commitment).
- Positive-only rule restated with its real edge: **the world may sound tense (a low note on a shock,
  a long fall on the crash); a *mistake* is never answered with a punitive noise, and nothing that
  sounds is needed to understand anything.**

### Q14 — The Ending

❓ **Q14** - **What does the last ten minutes of the game feel like?**: The Money Story is story-first
and shipped; it opens, narrates turning points, compares you to you, shows the numbers, and offers
"what next". It is the game's emotional payoff, and it currently reads like a good report. What makes
it an ending?

➡️ **Settled: an authored Epilogue closes the story, per path and per Outcome Band — six short strings,
text-only, ×3 locales; plus the shipped record, order intact.**
- **The Epilogue** (new, 2–3 sentences): where the character is at 19 — what they do, where they live,
  what the five years bought and cost them — written *with* the band, never *as* a verdict: an "Ahead"
  work-path epilogue is warm and specific, a "Behind" one is honest and open (*"Nothing is
  unrecoverable from here"* is the shipped register). No rank, no grade, no comparison.
- Placement: **at the end**, after the record and the reflections (Q17), immediately before "What
  next" — facts → meaning → goodbye → play again.
- The Money Story keeps its shipped order and its Focus/labelled-region behaviour; the epilogue is one
  labelled section, plain text, no new data.
- Six strings (3 bands × 2 paths) is the whole cost. It is the largest emotional payoff per unit of
  cost in this design, which is why it is in step 3 of the sequence (Q33).

**Frontier after round 2:** the Answer's restructure (Q15) must exist before the close's copy and the
epilogue can be written in the same voice; the Deal's `data-kind` shape constrains Q24's new kinds
(none added); the Fund row (Q12) depends on Q25; the Stage-up's *"what you'll meet"* depends on Q18;
the motifs and cues depend on Q13 + Q31's a11y work.

---

## Round 3 — Voice and framing: the class leaves the room

### Q15 — Feedback split: Reaction + Lesson

❓ **Q15** - **Should the Feedback be split into "what happened" and "why it mattered", and how does
the split reach 60 cards without breaking i18n or old saves?**: The class signal is that every Answer
ends in a principle. The information is valuable; the *structure* is the lecture. Split the block?

➡️ **Settled: yes — a *Reaction* and a *Lesson*, with an optional-key seam and a fallback.**
- **Reaction** (new, primary): the world's response — concrete, in-fiction, often a person, a place, an
  object, a number. Never a maxim, never an imperative, never a general rule.
- **Lesson** (existing `…_feedback`, kept): why it mattered — short, and *specific to this life*
  wherever the card is not that Concept's Teachable Moment; the general rule of thumb is allowed only
  on the spine card that first introduces the Concept (the Teachable Moment is exactly where a general
  lesson belongs).
- **Seam:** copy keys stay language-neutral ids; add optional `card_<id>_choice_<choice>_reaction` next
  to the existing `…_feedback`, resolved with a fallback: no `_reaction` → today's one-paragraph
  rendering, byte-for-byte. Catalogue parity ×3 covers both keys; no schema change, no state, no
  migration, old saves untouched (`docs/adr/0002`'s spirit).
- **Conversion order:** the eight spine cards + the Fork, plus Stage 1 first (the first impression),
  then one Stage per content step; a card with no Reaction yet is not a bug.
- **The test this must not fail:** the Lesson is always present, always visible (no tap-to-reveal, no
  hidden content), and the Better-Choices Proof is unaffected — the player still gets the connection
  between outcome and Concept, just not a teacher's closing line on top of it.

### Q16 — The copy rules (ban list)

❓ **Q16** - **What are the voice's rules, concretely — and what is banned?**: "Less like a class" is
only real if it is written down as rules an author (and a reviewer) can apply, in three languages,
without losing the teaching. What are they?

➡️ **Settled: seven rules and a ban list.**
1. **The Reaction never speaks for the world, only from inside it.** No "this game", no "you will
   learn", no narrator stepping out (`"best-paid three hours in this entire game"` is the pattern to
   retire).
2. **No maxims, no imperatives** in the Reaction: no "remember", "should", "always", "never", "the
   point is", "that is what … is for".
3. **The Lesson is short and personal**: one sentence, about *this* month and *this* money wherever
   possible; a rule of thumb only at a Teachable Moment.
4. **The narrator may be surprised, dry or pleased; it is never certain.** Confidence is the smell of
   a classroom.
5. **Two defensible options** where the card is a decision: if one choice is obviously correct, the
   card is a comprehension check (ticket 08) — fix the card, not the copy.
6. **Humour is situational, never idiomatic.** Puns, wordplay and English idioms ("the till aisle",
   "paid in the other currency") do not survive machine translation ×3 without a Fink pass; write
   concrete scenes and dry facts instead. This is a real constraint on "funny" and is accepted.
7. **No numbers the player cannot see** in the copy; no outcome leaks in the chips or the labels
   (ticket 03's chip rule, kept).
- **Ban list (review gate, English at least):** *lesson, learn, teach, quiz, test, unlock, curriculum,
  course, mastery, score, points, streak, remember, should, always, never, "the point is", "this
  game"*. Where one of these is genuinely the right word (a card about a course, e.g.
  `evening_course`), it is the *fiction's* word and the review says so.

### Q17 — Where the general lessons live now

❓ **Q17** - **If the moment stops generalising, where does the general learning go?**: The pass cannot
lose the rules of thumb the research says work (ticket 08 research §5: rules of thumb beat
curricula). Moving them out of the Answer means they need a home where they are *earned* — and the
only surfaces allowed to judge are retrospective (Q3). Where?

➡️ **Settled: three retrospective homes, all derived from the record — and one new module.**
1. **The Money Story gains a closing reflection: "What the five years taught you"** — 2 to 4 lines,
   derived from the player's own record, never generic. Candidate derivations (a new pure module,
   `reflections.ts`, in the `metrics.ts` / `stats.ts` tradition):
   - the year you kept to your own plan most often (*"Year 3: eleven months of twelve inside your own
     budget"*);
   - where the leak was (*"Wants took ◈1,240 of the five years — the single biggest line you chose"*);
   - the debt chapter (*"You carried debt from month 34 to month 47, and it stayed cleared"* — or
     *"You never borrowed"*);
   - the investing outcome after Q25 (*"You held through the crash and the recovery arrived before
     the Run ended"*).
   Picked by precedence, capped at four, each a *"you"* statement — no imperative, no general law, no
   scold. This is the pass's centrepiece for "learning carried by fun": **the game stops telling you
   how money works and shows you how *yours* worked.**
2. **The Year in Review keeps its shipped shape** (money headline, months inside budget, the year's
   Milestones) — no new row, per `docs/adr/0003`. Its behavioural line is already the retrospective lesson in
   miniature.
3. **The spine cards' Teachable Moments keep the one general line each** (via Q15's rule), because a
   first experience is exactly where a rule of thumb lands.
- The reflections are tested like the metrics (table-driven unit tests, empty/legacy record cases) and
  appear only on the Money Story.

### Q18 — Curriculum → "met"

❓ **Q18** - **How visible may the curriculum be?**: The Stage-up says "Unlocks budgeting & tracking";
the Stats Sheet and Journal show Concept Coverage; the Journal header says "Concepts met: 7/8". The
gamification design shipped Coverage deliberately. What changes?

➡️ **Settled: the vocabulary of a syllabus goes; the Concepts and Coverage stay.**
- Stage-up: the **life-change headline** leads (Q13), and `stage_up_unlocks` becomes *"What you'll
  meet: {concepts}"* — one string ×3 locales. "Meet" is already the Journal's word (shipped);
  "unlock" is a course word and appears exactly once in the game.
- Concept Coverage stays exactly as shipped (Introduced / Experienced / Not yet), because it is the
  learning payoff and the Journal's memory; its framing is already "met", never "mastered" (the
  glossary forbids mastery language, kept).
- The Stats Sheet keeps its location and its locked-row behaviour (names nothing the banner has not
  announced); no new rows.
- The ban list (Q16) prohibits "unlock/curriculum/course/mastery" in player-facing copy; the coverage
  states keep their shipped words.

### Q19 — Onboarding

❓ **Q19** - **What happens in the first ninety seconds?**: Today: three screens of instructions
("who you are", "the goal", "how a month works") before month 1, then the first card. It is the single
most classroom-shaped sequence in the game, and the shipped philosophy is already "no tutorial — the
first card teaches" (ticket 04). Rewrite how?

➡️ **Settled: two screens, hook first, loop second; the privacy line and language switcher stay.**
- **Screen 1 — the hook** (keeps the shipped opening's best line): *"You are 14. You have ◈60 and a
  roof you do not pay for."* Body: five years from now nobody hands you the money — you earn it, and
  you decide what it becomes. Footnote: *"Nothing here is a test. It just goes better if you know how
  it works."*
- **Screen 2 — the month, in one breath:** plan it / something happens / see what it cost — three
  short clauses, not three paragraphs; the Named Goal and its ◈4,000 sit here as the horizon, and the
  privacy/language lines keep their shipped placement. No third screen; the first card is the
  tutorial, as designed.
- The intro keeps its dot progress and single `Next`/`Start month 1` button; no new components.

### Q20 — The name

❓ **Q20** - **Does the game keep the title "Financial Life-Sim"?**: The name appears in the browser
tab, the Journal, Settings and Privacy titles. It is a genre label, and it is the first thing a teen
reads. Change it?

➡️ **Settled: yes — the working title becomes **"Five Years"** (alternatives: "Payday", "Ledger").**
- It is warm, specific to this game's one structural fact (a five-year run), works untranslated
  ("Five Years" / "Cinque anni" / "Cinci ani" — each locale gets its own string), and is not a
  finance-class word.
- Cost: `app_title` + four `*_title` strings ×3 locales; no code. Branding, domain and store presence
  remain the owner's decision (map: "working title, branding, domain name" is explicitly unowned).
- If the owner declines, the same strings stay as they are; nothing else in this design depends on it.

### Q21 — Time texture (the date)

❓ **Q21** - **Should the game say where the character is in time, not just which month number it
is?**: Today the HUD reads "Month 13 of 60" and "15 · First Budget". The run is a life with seasons;
`Intl` can give locale-correct month names for free. Add a date?

➡️ **Settled: yes — a diegetic date line, locale-safe, no new catalogue keys.**
- The HUD's month line becomes *"Age 15 · Year 2 · March"* (run starts in September; month *n* maps to
  a month name via `Intl.DateTimeFormat` with the **same explicit-locale pattern `formatMoney` uses**
  so SSR and hydration agree — ticket 26's rule). The plain `Month 13 of 60` kicker remains where the
  record is being read (the Stats Sheet, the close).
- Ages step at year boundaries exactly as shipped; no birthdays, no new state, no new model.
- This is the cheapest life-sim texture in the design: it turns a counter into a calendar.

**Frontier after round 3:** Q15's seam gates everything copy-shaped in Q16–Q19 and the epilogue
(Q14); Q17's reflections depend on the Fund's outcome only after Q25 (a phase gate, not a blocker —
the first three reflections ship without it); Q18's "what you'll meet" depends on Q13's poster; Q21
has no dependants.

---

## Round 4 — Life: variety, stakes, memory

### Q22 — Threads, the memory engine

❓ **Q22** - **How does the game's best fun device get more use?**: A Thread is a choice that comes
back — the single most life-sim thing the code does. There are three (`course_enrolled`,
`friend_loan`, `risky_tip`), at most one live at a time, and their chips name things ("The course",
"The money you lent"). Should the pass add more, loosen the one-live rule, or leave it?

➡️ **Settled: a Threads content pass — four to six new plants/resolves; the one-live rule stays.**
- **New Threads** (each a plant Choice + a resolve card with its own choices, in the existing
  vocabulary): a **subscription started** (the renewal creep returns), a **bike bought** (repair or
  sell), a **Saturday rota taken** (exams and friends arrive), a **favour done for a sibling**
  (returned, or not), a **scam reported** (the fraud line and the aftermath), and a **team joined**
  (fees and time). Four to six, spread across Stages 2–5.
- **The one-live rule stays.** Two chips is a dashboard; one is a story. It also keeps the draw logic
  (plant waits for a free slot, resolve waits for its Thread) exactly as tested today.
- **People in the chips.** Where a Thread belongs to a person, the label says so (*"Priya's course"*,
  *"the money you lent Ravi"*) — the cheapest recurring-character device the game has (Q27), zero new
  state.
- Threads remain the model for all recurring consequence: **no new state, one `thread` field, one
  countdown, one payoff card.**

### Q23 — Deck rules and the balance gate

❓ **Q23** - **How much content may be added, under what rules, and what stops it becoming a balance
accident?**: The gamification design froze the deck; Q5 reopens it for content. Variety is the
cheapest fun and the biggest risk: two more cards in Stage 5 can move the ◈4,000 goal, the lean year 5,
and the Better-Choices Proof. What is the size, the rules, and the gate?

➡️ **Settled: a bounded content pass under three rules and one automated gate.**
- **Size target:** every Stage's **guaranteed-unseen floor** (`deck.test.ts`) rises to **at least its
  draws + 3** — from today's 14 / 11 / 11 / 11 / 8 to 14 / 14 / 14 / 14 / 11 (shared path) — which is
  ≈ +12 cards before the 4–6 Threads' resolve cards and the handful of windfalls, risks and the
  villain card (≈ +20 in all). The longer-term aim is draws + 6; this pass buys the first real
  headroom. **4–6 new Threads** come with it (Q22), each plant a Choice and each resolve a new card.
- **Rule 1 — two defensible options** (Q16 #5): a card whose right answer is obvious is a quiz;
  either it earns its place as a *consequence* card (a shock, a bill) or it gets cut.
- **Rule 2 — no new mechanics:** the effect vocabulary stays `cost`/`gain`/`freeTime`/`category`/
  `insuredCost`/`sets{insurance,bnpl,path,overdraft,minimumStreak,thread}` plus Q25's two Fund fields.
  New fun comes from *situations*, not systems.
- **Rule 3 — the lean year stays lean:** no card may guarantee year-5 survival; shocks stay bounded
  (≤400 and rare); gains stay windfalls, not wages.
- **The gate — a balance harness (`balance.test.ts`):** run ~100 seeded Runs per scripted policy
  (an "impulse" policy and a "steady" policy) through the real reducer; assert that the outcome-band
  distribution, the final-net-worth spread, and the year-5 obligations-to-income ratio stay inside
  bands recorded from the current deck. **A variety test in the same harness** asserts the mean
  overlap between two Runs' 52 drawn cards (across seed pairs) falls below the threshold recorded
  before the pass — déjà vu, made testable. Content PRs that move either number the wrong way fail
  the suite and must tune the *cards*, never the economy. (No telemetry; a build-time gate.)
- i18n: every new card is ~2–4 strings ×3 locales; the Fink debt grows and is stated as owed.

### Q24 — Windfalls, risks and the villain

❓ **Q24** - **Which kinds of moment are missing, and may the player finally play the villain?**:
The deck has 2 shocks, 2 risk moments, 2 scams, 27 cards with gains, and no card where the player is
on the *selling* side. The villain card was out of scope in the gamification pass. Add what, and
what may it teach?

➡️ **Settled: 2 windfalls, 1–2 risk moments, 1 villain card — consequences, never a lecture.**
- **Windfalls (2):** one mid-run, one late — money arriving for reasons the player did not earn,
  with the same two-defensible-options shape as `grandma_windfall` (save it / spend it well). Wins
  should be as real as losses; the balance harness guards the totals.
- **Risk moments (1–2):** one earlier (Stage 2–3, beyond the phone) and one late (after the crash):
  premium vs risk with the odds shown, insurance as a choice, never a quiz (ticket 08).
- **The villain card (1, Stage 4–5):** the player is the one *selling* — a market stall, a phone-shop
  Saturday, a mate's resale hustle — and the customer is offered the easy payments. The card's
  choices are about what you say and what you take; the Lesson names the design ("four payments,
  decided in a second — that was yours to sell this time"), and the game never tells the player off.
  It teaches predatory terms by *making* them (ticket 08 research §3.6) and it is the pass's strongest
  anti-classroom device.
- No new card kinds; no changes to the draw; weight tuning keeps the new moments occasional.

### Q25 — The Fund: investing made real

❓ **Q25** - **Do we wire the Fund — and if so, how far?**: The code never increments `RunState.fund`:
`the_fund` "open" spends ◈400 from Save into nothing, `the_crash` "buy" spends ◈200 into nothing,
`boring_fund` "fund" spends ◈50 into nothing — against a Work-path goal of net worth ≥ ◈4,000, while
`CONTEXT.md` calls the Fund *"the only place money can grow faster than inflation"* and the crash's
copy promises *"the recovery always happens without you if you sell"*. The gamification design
deferred the wiring as "a separate, larger decision". This pass is that decision. Options: (a) leave
it; (b) minimal honesty — move the money into `fund` and stop there; (c) a real, seeded market: the
money grows and falls, the crash is a real loss, the recovery really happens; (d) a full investing
system (units, prices, rebalancing).

➡️ **Settled: (c) — a bounded, seeded market, because (a) is mechanically false, (b) is a static pot
that teaches nothing, and (d) is a different game.**
- **Deposit:** the new `sets.fund: N` moves up to N into the Fund **from what the draw actually
  provided** (envelope + Save; never from Debt) — so "investing borrowed money" is silently
  impossible, which is itself an honest rule. **Liquidation** is the second new field
  (`sets.liquidate: true`): the Fund moves to Cash at its current value, which is how `the_crash`'s
  "sell" locks the loss.
- **Growth:** `closeMonth` applies a **seeded monthly return** to `fund` when it is non-zero, drawn
  from the Run's own seed via the existing `turnRng(seed, month)` — the market is part of the world a
  seed defines, so Twin Runs (Q28) share it, and no new RNG enters the game. Mean ≈ 7 %/yr, monthly
  volatility ≈ 16 %/yr, clipped so a single month cannot swing more than ±15 %.
- **The crash is real:** at the spine month 55 the market falls ≈ 25 % for holders. The card's
  shipped choices become true: **hold** rides a scripted partial recovery over months 56–60 (the
  copy's promise, kept); **sell** liquidates the Fund at the crashed value (the loss locked, as the
  copy says); **buy** adds at the fallen price and rides the same recovery.
- **Where it shows:** the **Fund row** in the Month Close when the Fund holds money (Q12); the Stats
  Sheet's existing Fund row becomes live; the goal progress (which already counts `fund`) finally
  means something; **no HUD change** — the Fund stays a Stage-5 instrument, not a third wallet.
- **The two Fund milestones the gamification design blocked become possible** — at most two
  (`fund_opened`, `rode_the_recovery`), beside the shipped choice-derived `weathered_the_crash`.
- **Costs and gates:** it is the pass's one economy change; it must be **prototyped first** (the repo
  has a `/prototype` skill) and pass the **balance harness** (Q23), because the Work goal, the bands
  and the Better-Choices Proof all read `netWorth`/`savings + fund`. If the harness moves the bands,
  tune the market, not the goal. ADR-0003.
- **What it buys:** the final year gets its missing climax. Today "buying the dip" destroys money and
  "holding" does nothing; after this, the player has real skin in the market, the crash lands in the
  receipt, and the investing Concept is as interactive as credit and risk — which is exactly what
  ticket 08's research found works.

### Q26 — Stakes and recovery feel

❓ **Q26** - **Is "recoverable" enough for fun — should the pass make failure harsher?**: The game is
deliberately non-punitive (PISA: 82 % of 15-year-olds overspend; a shaming game loses the teens it
most needs). But flatness is not kindness. Do we raise the stakes, and how does failure *feel*?

➡️ **Settled: stakes stay recoverable; consequences become *felt*, never harsher.**
- No new failure states, no game-over, no lost progress, no punitive sound; the shipped caps stay
  (shocks ≤400; the crash bounded; debt surmountable).
- The change is **legibility and weight**: the cascade is emphasised where it lands (Q9), the Fund
  makes the crash consequential (Q25), the overdraft is a named turning point that the Money Story
  narrates honestly (shipped), and the Tally states where the money came from in plain facts (Q12).
- **Recovery keeps its dignity:** clearing debt is already a Milestone (shipped); the pass adds no
  "you failed" surface. The "Behind" band keeps its non-judgemental shipped copy, and the Epilogue
  (Q14) says what is still open at 19.
- The rule for reviewers: **a consequence may be sharp; a surface may never be ashamed.**

### Q27 — Recurring people

❓ **Q27** - **Do we need a character system (relationships, arcs) for the game to feel alive?**:
The cards name people once and forget them; the Threads are the only memory. A relationship system
would need state, a UI, and translation. Is there a cheaper way to make the world feel populated?

➡️ **Settled: no new system — express people through copy and Threads, not state.**
- **Threads carry the arcs** (Q22): the person attached to a Thread comes back when it resolves, and
  the chip names them. That is one memory, already modelled, already visible.
- **Copy continuity:** a small editorial rule lets a few named people (Priya the café manager, Ravi,
  Danny, a parent, the neighbour) recur across unrelated cards, cross-referenced in the copy where
  natural — no state, no branching, no arc tracker.
- **The avatar ages; nothing else needs a face.** The research's "a character you care about" is
  satisfied by second person, continuity and the Journal's Chapters — the player *is* the character.
- Rejected for stated cost: named relationships with state (new fields, new translation surface, new
  tests, a second UI language for something the Threads already do).

### Q28 — Replay: the Twin Run

❓ **Q28** - **Should same-seed replay ship, and what exactly is it?**: The seed is already stored on
every archived Run; the Journal shows it as a fact. Same-seed replay was deferred in the gamification
design ("revisit with playtest evidence"). A Run replayed from the same seed is the purest you-vs-you
the game can offer — but it cannot be a controlled experiment, because choices change the deck's
`requires`/`seen` state and the world legitimately diverges. Ship it? And if so, as what?

➡️ **Settled: ship the **Twin Run** — "the same starting world, lived differently" — retrospective
by construction.**
- **Definition (CONTEXT-delta):** a Run started from a finished **Chapter**'s seed. The spine, the
  seeded draws and the market (post-Q25) start identical; choices make the worlds diverge — that is
  the point, and the copy must say so (*"Same seed. Same start. Your choices change what comes
  next."*), never promise an identical deck.
- **Entry:** one quiet action on a Chapter in the Journal, offered **only when no Run is in
  progress** (starting one must never overwrite a live Run), and only for a seed the player's own
  archive holds. Server-side: the seed is validated against the archive; nothing new is stored.
- **No live twin data, ever.** The twin Run shows nothing of the other Run while it plays; after it
  finishes, it is simply another Chapter in the Journal (in the order lived). Any comparison is
  retrospective and verbal, and the Journal never ranks (ADR-0004; `docs/adr/0003`'s rule holds).
- **Build note:** the Journal keys Chapters by `seed` today; two Chapters can now share a seed
  (a Run and its twin), so the key must become `seed + finishedAt` before this ships. (Same class of
  latent bug the gamification ledger already flagged for turning-point keys.)
- **What it is not:** not a Challenge Run, no modifiers, no difficulty settings, no "better than your
  last try" score — all still deferred (gamification design §11).

**Frontier after round 4:** the content pass (Q23–Q24) depends on Q16's copy rules and Q22's Thread
shape; the Fund's build (Q25) depends on the prototype and gates the crash's payoff (Q13/Q14 copy)
and one reflection (Q17); the Twin Run (Q28) depends on the Journal key fix and Q5's ADR; none of
round 4 depends on round 5.

---

## Round 5 — Carry, verify, sequence

### Q29 — Learning carried by fun (the test)

❓ **Q29** - **What is the pass's rule for "learning through fun"?**: The ask is to feel less like a
class *without* losing the teaching (the Better-Choices Proof is the product's success criterion). If
every new device must justify itself, what is the rule that keeps the teaching intact while the
lecture goes?

➡️ **Settled: one rule and one non-negotiable.**
- **The rule:** every device must name (1) the Concept it carries, (2) the moment it lands, and (3)
  why a player experiences it rather than reads it. "Because it's fun" is not an answer; "because you
  feel the ◈0.12 arrive and then it is gone into the price of things" is.
- **The non-negotiable:** the Better-Choices Proof stays the single success criterion, and nothing in
  this pass may make a choice that worsens it more attractive. The you-vs-you comparison, the
  outcome bands, the seven metrics and the reveal rule are untouched.
- **Where the teaching now lives:** the fiction and the numbers (the Answer's outcome, the chips, the
  receipts), the first-experience Lesson on spine cards, the retrospective reflections (Q17) and the
  shipped Year in Review / Money Story / Journal. The pass moves the *general* voice to the end and
  the *specific* voice to the moment; it never removes the connection between what you did and what
  it meant.

### Q30 — Fun verification without telemetry

❓ **Q30** - **How will we know it worked, with no analytics allowed?**: Privacy (ticket 12) bans
telemetry, and no automated test can assert "fun". What is the verification story for this pass, and
what can be automated honestly?

➡️ **Settled: one human playtest, three automated proxies, one review checklist.**
- **Human playtest protocol** (no telemetry, no PII; notes use no names): five teens 13–18, one at a
  time, 25 minutes, think-aloud, on their own phone where possible. Observe: where they stop, whether
  they talk about the *character* or the *lesson*, laughter/groans, whether they re-read the card.
  Ask afterwards: *"What happened in your five years?"*, *"What would you tell a friend about it?"*,
  *"Would you play again — and what would you do differently?"* Record quotes, not scores; file
  issues. Ticket 09's prototype question ("taps and seconds per month") is answered by the next item.
- **Automated proxy 1 — interaction cost:** a Playwright script drives a scripted month; assert taps
  ≤ 5 and no dead ends, as a friction regression line (ticket 09's own metric).
- **Automated proxy 2 — balance harness:** Q23's seeded policy runs; the economy cannot drift
  content-by-content.
- **Automated proxy 3 — the a11y/i18n gates:** every new beat, block and row joins the axe screens
  and the catalogue parity gate (Q31).
- **Review checklist (human, per PR):** does any new copy contain a banned pattern (Q16)? Is any
  new motion one-shot, ≤600 ms, reduced-motion-safe, meaning-carried-by-text? Does any new surface
  show a competence-derived live number (Q3)? Would a player optimise the new thing *instead of* the
  life (Q4)? These four questions are the pass's review gate.

### Q31 — A11y, i18n and privacy obligations

❓ **Q31** - **What does the pass owe the existing gates, and what could it plausibly break?**: Every
device here touches something that CI and three locales currently guarantee. Enumerate the
obligations before build.

➡️ **Settled: obligations, by gate.**
- **a11y (tickets 14/24):** every new state joins the axe seed and screens — the Deal's variants, the
  restructured Answer (Reaction/Lesson/cascade emphasis), the Tally's Fund row and emphasis, the
  Stage-up poster, the epilogue and reflections, the Journal's Twin action. The reflow and keyboard
  proxies cover the new blocks. Motion stays one-shot and reduced-motion-collapsed; the count-ups
  have a static equivalent; nothing new may become the only carrier of meaning; the four manual
  passes (muted, zoomed, keyboard-only, greyscale) are re-run and the results filed.
- **i18n (tickets 07/26/28):** all new copy in all three catalogues; the parity gate runs on the new
  keys (reactions, life-change headlines, epilogue ×6, reflections ×~5, Threads ×4–6 labels/payoffs,
  the new cues' Settings text stays as is). Keep strings short and idiom-free (Q16 #6); the Fink pass
  debt is stated as owed and grows by the new content.
- **Privacy (ticket 12):** nothing new is collected; the Twin Run's seed is already stored in the
  archive; export/delete/retention cover every new surface by construction (the reflections and
  epilogue are derived at render time, the Fund is RunState already saved). No new cookie, no
  analytics, no PII, and the playtest protocol collects none.
- **Determinism (ticket 03/07):** the Fund's market draws from the existing per-month seeded RNG;
  locale never feeds it; Twin Runs share the start by construction.
- **Art/audio (ticket 13):** no new illustrations; three new synthesised cues and five motifs inside
  the existing bank; `ATTRIBUTION.md` unchanged (still self-authored CC0); the art-audio doc gains a
  note for the human designer's line-weight review, unchanged in scope.

### Q32 — Risks and mitigations

❓ **Q32** - **What could this pass get wrong, and what stops each?**: Name the risks honestly before
the sequence is written, so the plan carries the mitigations rather than the optimism.

➡️ **Settled: seven risks with their controls.**

| Risk | Control |
|---|---|
| The quieter Lesson weakens learning. | The Lesson stays visible, always (no tap-to-reveal); general rules remain on Teachable Moments; the reflections carry the retrospective teaching; the Better-Choices Proof is unaffected and tested; playtest asks what they learned. |
| Peaks read as noise or cheap juice. | Eight named beats only; one-shot, ≤600 ms; quiet by default; sound off by default; the statement identity untouched; a review rule that a beat must "carry meaning or lose it". |
| Content growth drifts the balance or the bands. | The balance harness as a hard gate; Rule 3 (lean year 5); shocks capped; content PRs tune cards, never the economy. |
| The Fund wiring moves the proof or the goal. | Prototype first; the harness; the goal and bands are tuning *targets*, not variables; two milestones at most; the market's parameters are the tuning surface. |
| Copy ×3 locales degrades (machine translation, idiom). | Short strings; situational humour; the ban list; the Fink debt recorded and growing; the playtest run per locale if the owner can. |
| Motion/animation regressions in a11y. | The shipped reduced-motion rule + axe screens + the four manual passes; no loops; text carries all meaning. |
| Scope creep turns a pass into a rebuild. | Six independent steps (Q33); every step shippable alone; the Fund isolated in its own step behind a prototype; the pass can stop after any step and the game is better. |

### Q33 — The additive sequence

❓ **Q33** - **In what order does this land, building on the shipped gamification layer?**: The pass
touches voice, presentation, content, economy and replay — a big surface. What is the additive
sequence, what does each step depend on, and how does each leave the game shippable?

➡️ **Settled: six build steps plus the human verification pass, each independently landable, each
gated by the existing suite plus its own new gate.** Built *on* the shipped gamification surfaces
(Milestones, Year in Review, Coverage, Journal) — none of which is re-opened; the Money Story is
extended (reflections + epilogue), the Journal gains an action (Twin), and the Year in Review is
untouched.

1. **Peaks pass** — motion tokens; the Deal, the Answer (restructured Feedback block with the shipped
   fallback), the Tally (hierarchy + plain-fact note), the Stage-up poster shell; the `deal` cue.
   *No new copy beyond the Stage-up headline strings; no economy; no art.* Gate: axe screens for the
   new states; reduced-motion check; interaction-cost proxy.
2. **Voice pass** — the Reaction keys for the spine and Stage 1 (then one Stage per later content
   step); the copy rules and ban list; Stage-up *"what you'll meet"*; the 2-screen intro; the title.
   *The direct answer to "less like a class".* Gate: i18n parity ×3; the copy review.
3. **Reflection pass** — `reflections.ts` + the Money Story's "what the five years taught you"; the
   Epilogue (6 strings ×3). *No economy; the biggest emotional payoff per cost.* Gate: table-driven
   unit tests; axe screen for the Money Story additions.
4. **Memory pass** — the Threads content (+4–6), the people rule, the deck rules, ≈ +12 cards across
   the thin Stages plus the windfalls, risks and the villain card, the balance harness. *Content
   alone; the economy untouched.* Gate: harness (+ the variety test); new a11y seeds per kind; Fink
   debt noted.
5. **Investing pass** — the Fund wiring (Q25): prototype → `sets.fund`/liquidation fields, the seeded
   monthly market in `closeMonth`, the crash's real fall + recovery, the Fund row in the Tally, the
   Stats Sheet going live, ≤2 new Milestones. *The one economy change, isolated.* Gate: prototype
   findings; harness; crash/exit unit tests; a11y screen for the Fund row; ADR-0003.
6. **Replay pass** — the Twin Run (Q28): the Journal action, seed validation against the archive, the
   `seed + finishedAt` key fix, copy. *Uses stored data only.* Gate: unit tests for the projection and
   the key fix; a11y screen for the action; playtest question about replaying.
7. **Verification and docs pass** — the human playtest run; the four manual a11y passes; the docs
   updates (`CONTEXT.md` merge, ADR merge, `docs/art-audio.md`, `docs/accessibility.md`); the Fink
   debt register. *Human-owed.*

Each step is a tracer bullet: it leaves the game playable, gated, and better on its own; the sequence
can stop after any step.

### Q34 — Human-owned and still open

❓ **Q34** - **What does this design deliberately leave to people, and what remains genuinely open?**:
The frontier must be empty of *design* questions, not of *human* decisions. What stays open, and with
what recommendation?

➡️ **Settled: five human-owned items, each with a recommendation.**
1. **The playtest** (Q30) — the only way to know if it is fun; my recommendation is in the protocol.
2. **The Fink pass** on it/ro (existing debt, growing with this pass) — recommend running it *after*
   step 2 so the voice pass is translated once, not twice.
3. **The art review** by a human designer on the ten existing pieces (already flagged in
   `docs/art-audio.md`) — unchanged by this pass; recommend it before step 1 ships so the poster
   compositions are reviewed against the final line weights.
4. **The name/branding/domain** (Q20) — "Five Years" is the working recommendation; the domain and any
   store presence are the owner's call.
5. **The Fund's tuning** after the prototype (Q25) — the market's mean/volatility/recovery are the
   knob; the goal, the bands and the proof are not. Recommendation on record: retire the no-op sink,
   keep the market boring (7 % mean), make the crash honest.

**Nothing else is open. The frontier is empty.**

---

## Frontier closure — what this run settled, in one place

- **The constitution:** fun = a life you author, felt in the money; peaks, not currencies; every
  device answers "what part of living does this deepen?" and "what would a player optimise?" (Q1–Q4,
  ADR-0001).
- **The four reopenings, explicit:** deck content may grow under a balance gate; the Fund is wired;
  the Twin Run ships; one villain card. Everything else reaffirmed (Q5, ADR-0002–0004).
- **The class leaves the room through the voice and the surfaces:** Reaction + Lesson; copy rules and
  ban list; concepts met, not unlocked; two-screen intro; a real name; the reflections and the
  Epilogue as the new home of the general lessons (Q15–Q21, Q17, Q14).
- **The game learns to peak:** eight named beats, a motion vocabulary, moving money, a receipt for a
  close, a poster for a Stage, sound without noise (Q7–Q13).
- **The game gets a memory and a second life:** more Threads, more deck, a real market, the Twin Run
  (Q22–Q28).
- **Nothing is claimed that cannot be checked:** the playtest, three automated proxies, one review
  checklist, the existing gates (Q29–Q32).
