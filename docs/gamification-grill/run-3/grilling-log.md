# Gamification grill — run 3

**Ask:** *"grill-with-docs — I want gamification added to this game."*

**Mode:** non-interactive. There is no human in the loop for this run, so every question is
settled immediately with the run's own ➡️ recommended answer, which stands as the user's answer.
Nothing is silently assumed: every branch of the design tree is written down, answered, and the
frontier recomputed until it is empty.

**Sandbox:** this run writes only under `docs/gamification-grill/run-3/`. It does **not** edit
`CONTEXT.md`, `docs/adr/`, or any source file. `CONTEXT-delta.md` and `adr/` here are *proposals*.

**Grounding facts gathered from the repo first** (the decisions below are anchored to these):

- The MVP is **built and shipped**; the build tickets (01–32) are closed. This is an *addition* to a
  finished design, not a greenfield question.
- The teaching metrics are **never visible during a Run** (`src/lib/game/metrics.ts` header;
  ticket 05): *"a player who can see a score optimises the score."* The Money Story is the payoff.
- **Ticket 08 (prior art) explicitly rules out XP, coins, lives and leaderboards**, and found that
  *"if we use points at all, they must be the money itself, not a parallel currency."* Reward loops
  that teach hoarding or speculation are named failure modes.
- The game already ships two strong game-feel systems: the **Stage ladder** (five stages = levels,
  add-only) and **the money itself** (`◈`, Net Worth) as the single score. It also ships a **Named
  Goal** progress bar, **Stage-up year summaries**, a **Money Story**, and **replay with archived
  Runs** (`RunProfile { active, archive }`).
- `RunState` already carries `history` (60 month snapshots), `flags` (turning points), and `log`
  (every card/choice). The archive holds finished Runs *in full*. So a great deal is **derivable**
  without new persisted state.
- Constraints that bind any addition: anonymised device-keyed profile, no analytics, no new PII
  (ticket 12); WCAG 2.2 AA, fully screen-reader playable, **no timers**, colour/motion never
  load-bearing (tickets 13/14); three locales, en/it/ro, every string in the catalogue (tickets
  07/26); one author, ~10 CC0 illustrations total, SFX off by default (ticket 13/30).

---

## The design tree

```
GAMIFICATION
├── A. Framing .................................... ROUND 1 (Q1–Q4)
│   ├── A1 job to be done (motivation / retention / learning / replay)
│   ├── A2 inviolable constraints (ticket 05 reveal rule, ticket 08 no-XP rule, a11y, privacy)
│   ├── A3 where the weight sits (in-run / end-of-run / cross-run)
│   └── A4 primary audience segment (first-time vs returning)
├── B. Core mechanics ............................. ROUND 2 (Q5–Q9)
│   ├── B1 mechanic families in/out
│   ├── B2 is there a second level system? (no — Stages are the levels)
│   ├── B3 any new currency or tangible reward? (no — money is the only currency)
│   ├── B4 in-run acknowledgement surface, or reuse existing beats
│   └── B5 challenge runs in v1? (deferred, seam kept)
├── C. Reveal & measurement ....................... ROUND 3 (Q10–Q14)
│   ├── C1 live-vs-retrospective reveal policy
│   ├── C2 trigger model (authored beats vs derived predicates)
│   ├── C3 granularity / volume
│   ├── C4 retrospective streaks
│   └── C5 do milestones ever touch Behavioural Measures?
├── D. Architecture & data ........................ ROUND 4 (Q15–Q19)
│   ├── D1 state home (RunState / profile / derived)
│   ├── D2 persist vs derive
│   ├── D3 back-compat & old saves
│   ├── D4 privacy: export / delete / retention
│   └── D5 i18n & a11y obligations
├── E. Surfaces, art, audio, vocabulary ........... ROUND 5 (Q20–Q24)
│   ├── E1 screens & route vs sheet
│   ├── E2 Money Story / Stage-up / Stats integration
│   ├── E3 art budget
│   ├── E4 audio
│   └── E5 canonical vocabulary
└── F. Risks, success, rollout .................... ROUND 6 (Q25–Q29)
    ├── F1 risk register + mitigations
    ├── F2 success criteria without analytics
    ├── F3 out of scope / invariants restated
    ├── F4 rollout sequence
    └── F5 open questions for the human
```

---

## Round 1 — Framing

Frontier: Q1–Q4 (prerequisites: none).

❓ **Q1** - **What job is gamification doing here?**: The game is already "fun" via consequence,
scarcity and story. Is the missing thing (a) moment-to-moment motivation inside a Run, (b) a reason
to *finish* a 60-turn Run, (c) reinforcement of the learning, or (d) a reason to *replay*? Pick the
primary job, because it decides where the feature lives.

➡️ **Primary job: (d) give replay a purpose, by turning a finished Run into a kept chapter in a
personal record — with (c) reinforcement as the co-benefit and (a)/(b) as secondary.** The game's
biggest structural weakness is that after 60 months the only reward is a report and a "play again"
button; nothing accumulates. A cross-run record is the honest reason to play a second five years
(try the other path, meet the concepts you missed). Retention-by-streak or retention-by-FOMO is
ruled out by the no-timers/no-analytics constraints, so the retention lever that remains is
*intrinsic and story-shaped*: accumulation of your own history.

❓ **Q2** - **Which existing decisions are inviolable constraints?**: A naive gamification pass
(XP, levels, coins, badges, streaks, leaderboards, daily rewards) contradicts shipped decisions. Do
we treat those as constraints to design *within*, or does "gamification" licence overriding them?

➡️ **Inviolable, and this is the central move of the whole design.** Specifically inviolable:
(i) ticket 05's rule that a *score visible live* makes players optimise it — so no live competence
meter; (ii) ticket 08's ruling out of XP/coins/lives/leaderboards and of any *parallel currency* —
money stays the only currency; (iii) ticket 14's no-timers, colour/motion-never-load-bearing,
screen-reader playable; (iv) ticket 12's no new PII, no analytics. Gamification is reframed from
"add reward loops" to **"add acknowledgement and memory without adding a second score."** This is not
a compromise; it is the only version that doesn't undermine the product's thesis ("Better-Choices
Proof", not "maximise a number").

❓ **Q3** - **Where does the weight of the feature sit?**: Choose the centre of gravity: inside a
single Turn, at the end of a Run, or across Runs on the profile.

➡️ **Centre of gravity: across Runs, on the Anonymous Profile.** In-run, the game's feedback
(immediate Feedback, the month-close sheet, the Stage-up year summary) is already excellent and
should not be layered with noise. End-of-run, the Money Story already carries the payoff. What is
genuinely absent is the **cross-Run layer**: nothing on the profile remembers *you*. The feature is
a **Journal** whose spine is the existing archive, with light in-Run acknowledgements (at the month
close) and a Money Story section as the connectors.

❓ **Q4** - **Who is the primary audience segment for this addition?**: (a) a first-time teen who
might abandon at month 12, or (b) a returning player who has finished one Run and might play the
other path?

➡️ **(b) the returning player is primary; (a) is a beneficiary, not the target.** The Journal only
has content once a Run finishes, so it cannot fix first-Run abandonment without becoming an
extrinsic retention loop — which we just ruled out. It *can* make the second Run feel like adding to
something. Design it for the player who is about to finish, not the player we are trying to hook.
(This also keeps us honest: we are not shipping a casino.)

**Settled (R1):** primary job = replay-with-memory; constraints inviolable; centre of gravity =
cross-Run profile; primary audience = the returning player.

**Frontier after R1:** Q5–Q9 (Round 2). Q10+ still blocked on Q5.

---

## Round 2 — Core mechanics

Frontier: Q5–Q9 (prerequisites: R1 settled).

❓ **Q5** - **Which mechanic families are in and out?**: Candidates: (a) milestone
acknowledgements, (b) a concept collection, (c) a cross-run Journal, (d) retrospective
streaks-in-prose, (e) optional challenge runs, (f) cosmetic unlocks, (g) a second level/XP system,
(h) points/coins, (i) leaderboards, (j) daily/login rewards.

➡️ **In for v1: (a) + (b) + (c), and (d) as an optional prose line.**
- (a) **Milestones** — authored acknowledgements of competence moments, shown at the month close.
- (b) **Concept Coverage** — the eight Concepts, recorded as "met" when the player plays a card
  tagged with that Concept; fills up across Runs.
- (c) **Journal** — the cross-run scrapbook on the profile: every finished Run as a **Chapter**,
  plus Milestones and Concept Coverage.
- (d) **Retrospective streaks** — e.g. "your longest stretch inside budget was 14 months", revealed
  only in the Money Story, because it is competence-derived.
**Deferred to a later phase: (e) challenge runs** (design the seam now, ship later).
**Out: (f) cosmetics** (one-author art budget, ticket 13), **(g) XP/levels** (Stages already are the
levels), **(h) points/coins** (money is the only currency), **(i) leaderboards** (out of scope and
anti-thesis), **(j) daily rewards / timers** (ticket 14 forbids timers; PISA/research: tangible
extrinsic rewards crowd out intrinsic motivation).

❓ **Q6** - **Do Stages already serve as the level system, or do we add a second ladder?**: A
gamified game usually has levels. This one already has five add-only Stages with concept unlocks.

➡️ **Stages are the only level system; add no second ladder.** Adding an XP "level" alongside Stage
would be redundant, would run on a parallel (hidden) competence metric, and would dilute the
add-only rule. The Journal should *record* Stages reached (a Chapter notes the path and the band),
never introduce a new number to chase.

❓ **Q7** - **Does any reward grant money, interest, score, free time, or an in-game advantage?**:
The tempting gamification move is a reward that changes the economy (a bonus, a discount, extra
hours).

➡️ **No. Zero mechanical effect, ever.** A Milestone grants nothing: no `◈`, no interest, no score
delta, no Free Time, no unlock that changes play. This preserves the difficulty curve (tickets 01,
17), avoids teaching "rewards come from nowhere", and keeps the feature immune to optimisation. The
*only* thing earned is acknowledgement and a line in the Journal. (This is the operational meaning
of ticket 08's "the money itself is the only currency".)

❓ **Q8** - **Does the in-Run experience get a new acknowledgement surface, or reuse existing
beats?**: Options: (a) a floating toast on the month screen, (b) a line at the **month close**
(ResolveStep), (c) a line at the **Stage-up** recap, (d) nothing in-Run at all.

➡️ **(b) + (c), and explicitly not (a).** Milestones are evaluated **once per Turn at the close**
and displayed on the existing month-close region, which already takes focus and is a labelled
region — a11y-safe, no timers, no auto-dismiss problem. The Stage-up already carries the
year-in-review (ticket 05) and folds in the year's Milestones and newly met Concepts. A floating
toast is rejected: timed, motion-carried, screen-reader-hostile, and it would interrupt the
decision. Mid-event acknowledgement is rejected too — it would break the "commit at close" model
(ticket 04).

❓ **Q9** - **Do Challenge Runs ship in v1?**: A "challenge" is an optional self-imposed constraint
("no credit card", "save something every month") that is recorded but grants nothing.

➡️ **Defer to a later phase, but keep the seam.** Challenges are real replay fuel and fit the
agency ethos, but they need content affordances, a start-flow, an `end`-of-challenge verdict, and
extra QA, and they risk becoming a second scoring axis. v1 ships the Journal; the seam is one
optional `challenge` attribute on a Run that a Chapter can render. Record it, don't build it.

**Settled (R2):** in = milestones + concept coverage + journal (+ retrospective streaks in prose);
stages are the only levels; zero mechanical effect; acknowledge at close and stage-up, never a
toast; challenges deferred.

**Frontier after R2:** Q10–Q14 (Round 3), then Q15–Q19 (Round 4).

---

## Round 3 — Reveal & measurement

Frontier: Q10–Q14 (prerequisites: R2 settled).

❓ **Q10** - **What may appear live during a Run, and what is held for the ending?**: The game's
hardest rule is ticket 05's reveal rule. Which of the new things can break it?

➡️ **The Honest-reveal rule, stated once and applied everywhere: a thing may appear live only if
it is already legible in the fiction and seeing it would not invite optimising a number; anything
competence-derived and numeric is held for the ending.** Applied: Milestones are **event-tied**
("you cleared the card", "the crash came and you held") and may show at the close. Concept
"met" may show live (the Stage-up already announces unlocks). A live adherence meter, savings-rate
ticker, or streak counter may **not** show live. Retrospective competence aggregates may appear in
the Money Story and Journal, exactly where ticket 05 already reveals the Behavioural Measures.

❓ **Q11** - **Milestone trigger model: authored beats, derived predicates, or both?**: Do we store
"milestones earned" as data, or compute them?

➡️ **Both, cleanly separated: an *authored catalogue* of milestone definitions (id, trigger
predicate, copy keys) evaluated by *pure derived functions* over the Run's existing `history`,
`flags`, `log` and state.** We do not add a milestone list to `RunState` unless derivation proves
fragile; we derive. Triggers are predicates like `interest > 0 first time`, `debt returned to 0
after being > 0`, `goal reached`, `crash resolved with fund > 0`, `first month money reached
Savings`. This keeps the feature testable (pure functions + tests, like `metrics.ts`/`stats.ts`) and
the save shape unchanged.

❓ **Q12** - **How many milestones, and how often do they fire?**: Too few and it's invisible; too
many and it's confetti that rewards nothing.

➡️ **A v1 catalogue of ~10–14 milestones over a 60-month Run — roughly one every 5–8 months, with
natural clustering at the spine beats (first payslip, first interest, the crash, the Fork).** They
must feel scarce enough to be worth a line of text. Proposed v1 set: `first_pay` (the first
payslip), `first_interest` (interest lands), `first_saved` (money reaches Savings), `goal_started`,
`goal_halfway`, `goal_reached`, `debt_cleared` (debt returns to zero), `first_month_inside_budget`
(evaluated at close, event-legible), `survived_a_shortfall` (the Shortfall Warning fired and the
month still closed without an overdraft), `insured_and_claimed` (cover absorbed a shock),
`held_through_the_crash` (did not panic-sell), `fork_chosen`. All are events the player already saw.

❓ **Q13** - **Retrospective streaks: in or out, and how framed?**: A live streak is the most
common gamification device and the most dangerous here (it leaks a hidden metric and invites
farming). Do we ship any streak at all?

➡️ **In, but retrospective and prose-only.** At the Money Story, one optional line: *"Your longest
run inside your own budget was 14 months."* Framed as part of the story of the five years, in the
same tone as the naming of the turning points (honest, non-judgemental, ticket 05). No live counter,
no reset-on-miss, no notification. This is the only streak, and it exists because the Behavioural
Measures are already revealed at the ending.

❓ **Q14** - **May a Milestone ever reference a Behavioural Measure?**: e.g. "You kept to plan 8
months this year."

➡️ **Only in retrospective form, and the boundary must be explicit in the glossary.** A Milestone
is **event-tied**; a Behavioural Measure is **numeric and hidden until the ending**. `first_month_inside_budget`
is acceptable because it is triggered by something the close already shows and is binary; a live
"adherence 8/12" milestone is not, because it is the hidden metric wearing a badge. The dividing
line is documented in `CONTEXT-delta.md` (Milestone vs Behavioural Measure).

**Settled (R3):** Honest-reveal rule adopted; authored catalogue + derived predicates; ~10–14 v1
milestones; one retrospective streak in prose; Milestones are event-tied, never live competence
numbers.

**Frontier after R3:** Q15–Q19 (Round 4).

---

## Round 4 — Architecture & data

Frontier: Q15–Q19 (prerequisites: R2/R3 settled).

❓ **Q15** - **Where does the new state live — `RunState`, the profile, or nowhere?**: A gamification
feature usually wants a `badges`/`achievements` store.

➡️ **Nowhere new: derive everything from what is already persisted.** The archive already holds
finished Runs *in full* (`state` with `history`, `flags`, `log`), and the active Run is loaded
separately. So:
- **Per-Run Milestones** = `milestonesFor(run)` pure projection over `history`/`flags`/`log`.
- **Concept Coverage** = concepts of the cards present in `log` (plus reached Stages), pure.
- **Journal/Chapters** = projection over `active` + `archive` from `loadProfile()`.
No `RunState` field, no new Mongo field, no new endpoint.

❓ **Q16** - **Persist or derive?**: The alternative is a durable `journal` document that survives
archive pruning.

➡️ **Derive (v1).** Persisting a durable trophy case means a schema, a migration, a second source
of truth that can disagree with the archive, and a new privacy surface. Deriving means the Journal
is *automatically* covered by the existing **export**, **delete**, and **retention sweep** (tickets
12/23) and needs no migration. The accepted cost: if the archive is pruned or the device is cleared,
the Journal shrinks — which is exactly the already-documented contract ("clearing storage loses
progress"). Recorded as ADR `0002`.

❓ **Q17** - **Back-compatibility and old saves?**: There are stored documents from before ticket 23
and mid-investigation states.

➡️ **Automatic, because nothing is added.** Old-shaped documents load via `readProfile`; derivation
reads only fields that already exist. The only defensiveness needed is tolerating `history`

`flags`/`log` that may be shorter or missing on old saves (mirror the existing `run.thread ?? null`
pattern in `stats.ts`). No migration, no version bump, no write path change.

❓ **Q18** - **Privacy: what does the Journal change about export, delete and retention?**: Does a
cross-run record count as new personal data?

➡️ **Nothing new is collected, so no new privacy obligations — but the copy must say so.** The
Journal is a *view* over stored Run data, not a new datastore. Therefore: `Download my data` already
contains it; `Delete everything` already clears it; the 12-month inactivity sweep already bounds it.
The only work is honesty in the UI: Settings and the Journal should state that the Journal is
"built from the Runs saved on this device", so a player never suspects hidden tracking (which would
contradict the first-run promise). No analytics, no leaderboard, no server aggregation.

❓ **Q19** - **What are the i18n and a11y obligations?**: Two features can silently violate the
project's gates.

➡️ **i18n: every new string is a catalogue key × en/it/ro, enforced by the existing
`messages.test.ts` key-set equality; milestone copy is keyed by milestone id exactly like card copy
is keyed by card id; the catalogue may not contain untranslated literals.** A11y: the Journal is a
real route with headings and lists/tables (no canvas); the milestone line at the close lives inside
the already-focused labelled region and is announced politely; no auto-dismiss, no timer; state is
carried by text not colour; `prefers-reduced-motion` respected; the three manual passes (muted,
zoomed, greyscale) and keyboard-only are extended to the Journal and the new Money Story section.

**Settled (R4):** derive everything; no new state, no migration; privacy unchanged but copy honest;
i18n/a11y gates extended.

**Frontier after R4:** Q20–Q24 (Round 5).

---

## Round 5 — Surfaces, art, audio, vocabulary

Frontier: Q20–Q24 (prerequisites: R2/R4 settled).

❓ **Q20** - **Which screens, and is the Journal a route or a sheet?**: Options: a section inside
the Money Story, a full-screen sheet like the Stats Sheet, or a top-level route like Settings.

➡️ **A top-level localized route `/journal`, plus a section inside the Money Story that links to
it.** A route is deep-linkable, screen-reader friendly, survives a reload, and matches the existing
Settings/Privacy pattern; the Stats Sheet is the wrong model because it is *live in-Run* UI state
(ticket 20) whereas the Journal is a *profile* artifact. The Money Story is where a player is most
receptive, so it carries "Your Journal" (this Run's Milestones, concepts met, a link), and Settings
carries the quieter link and the derivation note.

❓ **Q21** - **How do the Money Story and Stage-up absorb the new material?**: Both already exist
and are tightly designed.

➡️ **Additively, never reordering the Money Story's existing five parts.** The Money Story gains a
"Your Journal" section *after* the numbers (part 4) and before "What next": this Run's Milestones,
Concept Coverage, and the optional retrospective streak line. The Stage-up year summary gains the
year's Milestones and the newly met Concepts (it already announces concepts). Nothing is removed;
story-first ordering is preserved (ticket 05/10). The Stats Sheet is **not** changed — it stays a
live view of money, not of achievement.

❓ **Q22** - **What is the art budget for this?**: Ticket 13 spends ~10 illustrations, one author,
CC0/permissive only, no text baked into images.

➡️ **Zero new illustrations for v1; reuse the existing `money_story` beat for the Journal header,
or draw one new CC0/hand-made `journal` beat at most.** The direction is typographic-first and
illustrated at the beats; a badge grid would be a new visual language and 8–14 new assets, which the
budget cannot carry. Milestones are presented as typed lines with the existing kicker/number
rhythm. If one image is added, it must carry alt text in all three catalogues (the existing
`beats.test.ts` gate).

❓ **Q23** - **What does it sound like?**: The SFX bank is four synthesised cues, off by default,
never load-bearing.

➡️ **Reuse `stage_up` for a milestone cluster and (optionally) add one quiet synthesised
`milestone` cue; never required, never load-bearing, off by default.** No new CC0 stings (budget and
licensing), no music, and — per ticket 13 — a *positive-only* philosophy: missing a milestone is
never answered with a punitive sound. Every milestone has its visual text counterpart, verified by
the muted playthrough.

❓ **Q24** - **What is the canonical vocabulary?**: "Badge", "achievement", "XP", "streak",
"scrapbook", "level" are all loaded words that would drag the design back toward the rejected
version.

➡️ **Adopt: Milestone, Journal, Chapter, Concept Coverage, and the Honest-reveal rule.** Explicitly
**avoid**: badge, achievement, trophy, reward, bonus, XP, level, coin, gem, streak (live), quest,
unlock-as-reward, leaderboard. Full definitions and `_Avoid_` lines in `CONTEXT-delta.md`. This is
the domain-modeling discipline doing real work: the vocabulary *is* the boundary — calling it a
"Milestone" and not a "badge" is what keeps it from becoming one.

**Settled (R5):** `/journal` route + Money Story section; additive Stage-up; zero new art (one beat
at most); reuse/add one quiet cue; vocabulary locked.

**Frontier after R5:** Q25–Q29 (Round 6).

---

## Round 6 — Risks, success, rollout

Frontier: Q25–Q29 (prerequisites: all settled).

❓ **Q25** - **What is the risk register, and the mitigation for each?**:

➡️

| # | Risk | Mitigation |
|---|---|---|
| 1 | **Score optimisation / metric leakage** — a live achievement number recreates the failure ticket 05 avoided. | Honest-reveal rule (Q10); Milestones event-tied only (Q14); no live competence counter. |
| 2 | **Extrinsic reward crowds out intrinsic motivation** (Deci et al.; ticket 08). | Zero tangible reward (Q7); no streak-reset, no daily loop, no currency. |
| 3 | **Rewarding the wrong behaviour** — hoarding, speculation, "money = score". | Milestones are competence/event-shaped (clearing debt, holding the crash), never balance-size; goal is the game's own target. |
| 4 | **Moralising / patronising tone.** | Milestone copy follows ticket 05's honest, non-judgemental voice; the mistake is content, not shame. |
| 5 | **A11y debt** (toasts, motion, colour). | Display at the focused close region; text-first; no timer; reduced-motion; keyboard/manual passes extended. |
| 6 | **i18n debt** (694 keys × 3 already). | Catalogue keys + the existing key-set equality test; no literals. |
| 7 | **Privacy confusion** (does a "profile record" mean tracking?). | Journal is derived, not collected; Settings/Journal copy says so; export/delete/sweep already cover it. |
| 8 | **Scope creep into a parallel game** (challenges, battle pass, cosmetics). | Invariant list; challenges explicitly deferred; zero mechanical effect. |
| 9 | **Empty-state / offline disappointment.** | Honest empty copy ("no chapters yet"); derived from whatever is stored; no fake progress. |

❓ **Q26** - **How do we know it worked, given no analytics are allowed?**: We cannot instrument
completion or replay server-side (ticket 12).

➡️ **Qualitative validation plus the unchanged headline criterion.** The product's success criterion
stays **Better-Choices Proof** (the you-vs-you comparison); Milestones must not become a competing
success metric. For this feature, the questions go to the **playtest** (already owed by tickets 09/
10): *Did the Milestones feel earned or patronising? Did the Journal make you want to try the other
path? Did anything tempt you to play for the badge instead of the life?* Optionally, a
**device-local, player-visible** counter ("Runs played: 3", "Concepts met: 7/8") doubles as both a
feature and a self-report — no server telemetry. Recorded honestly as a design limitation.

❓ **Q27** - **What is explicitly out of scope, restated as invariants?**:

➡️ No XP, levels, coins/gems, lives, energy, or any parallel currency. No live score, adherence or
savings-rate meter. No leaderboards, social comparison, or other players' numbers. No loot boxes,
random rewards, daily-login rewards, timers, or FOMO. No change to the economy, the deck, the
difficulty curve, or the a11y/privacy/i18n commitments. No new personal data. No second visual
language (badge grid). No reward that changes play.

❓ **Q28** - **What is the rollout sequence?**:

➡️
1. **Domain lock** — adopt the vocabulary and the Honest-reveal rule (this run's CONTEXT delta; ADRs 0001/0002).
2. **Milestone catalogue + derivation** — authored definitions + pure functions + tests (mirror `metrics.ts`/`stats.ts`).
3. **In-run surfacing** — month-close line + Stage-up recap.
4. **Money Story section** — this Run's Milestones + coverage + optional retrospective streak.
5. **`/journal` route** — Chapter list, coverage, i18n keys ×3, a11y gate, link from Money Story/Settings.
6. **Retrospective streak line** — if playtest supports it.
7. **(Later) Challenge Runs** — using the reserved seam.

❓ **Q29** - **What genuinely remains open for the human?**:

➡️ Four things, each with a recommended default already chosen here so work is never blocked:
(i) **whether the retrospective streak ships at all** (recommended: yes, prose-only);
(ii) **whether one new `journal` illustration is worth the one-author budget** (recommended: no, reuse
`money_story`);
(iii) **whether to reserve the `challenge` field in the save now or when Challenge Runs are built**
(recommended: reserve as optional, write nothing);
(iv) **whether the Journal should ever be a shareable artifact** (recommended: no — sharing implies
social comparison and contradicts "nobody else's numbers"; keep it private). None of these changes
the v1 shape.

**Settled (R6):** risks mitigated; success is qualitative + Better-Choices Proof; invariants locked;
seven-step rollout; four open questions all with safe defaults.

**Frontier after R6:** **empty.** Every branch of the tree is visited; nothing is silently assumed.

---

## Decision summary (the settled design)

**Thesis.** This game is already gamified in the two ways that survive its own research: **Stages are
its levels, and money is its score.** What it lacks is not reward — it is *acknowledgement* and
*memory*. Add exactly those, and nothing that creates a second score, a parallel currency, a live
competence meter, or a leaderboard.

**What ships (v1).**
1. **Milestones** — ~10–14 authored, *event-tied* acknowledgements shown at the month close and the
   Stage-up recap. Zero mechanical effect.
2. **Concept Coverage** — the eight Concepts marked "met" when a tagged card is played; accumulates
   across Runs.
3. **Journal** — a localized `/journal` route: every finished Run as a **Chapter**, plus Milestones
   and Coverage, derived entirely from the existing profile archive.
4. **Money Story "Your Journal" section** — this Run's Milestones, Coverage, and an optional
   retrospective streak line, added after the numbers, story-first order preserved.

**What is rejected.** XP, levels, coins, lives, points, badges-as-rewards, live streaks, a live
adherence/savings meter, leaderboards, cosmetics, daily rewards, timers, and any economy change.

**Why it fits.** It reuses the archive (tickets 05/23) instead of adding a datastore; it obeys the
reveal rule (ticket 05) instead of breaking it; it obeys "the money is the only currency" (ticket
08); it is text-first, timer-free and screen-reader-playable (tickets 13/14); and it adds no personal
data (ticket 12). Its only new surface is a settled vocabulary and two ADRs.
