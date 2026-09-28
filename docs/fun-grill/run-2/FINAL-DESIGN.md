# FINAL-DESIGN — Fun Pass (Run 2)

**Ask:** *"I want to improve the game even more, make it more fun, more attractive, and make it feel
less like a teaching class and more like having a good time and fun."*

**Answer in one line:** the classroom feeling is made of **register, a worldless deck and a uniform
card form** — not of the guardrails — so this pass buys fun with **fiction, voice and choreography**
(Narrator, Cast, Callbacks, card forms, pacing, one beat of art) and **adds no reward device of any
kind** (log Q3, ADR-0001). No economy, deck schema, draw, reducer, `RunState`, metrics, privacy or
a11y commitment changes.

Settled in the [grilling log](grilling-log.md) across 39 questions; vocabulary proposed in
[CONTEXT-delta.md](CONTEXT-delta.md); three ADRs in [`adr/`](adr/).

---

## 1. Diagnosis — what makes it feel like a class

| Cause (found in the shipped build) | Evidence | Remedy |
|---|---|---|
| **Teacher-voice Feedback** names the lesson | "that is what insurance is…", "This is the whole lesson", "the lesson being that deferred debt is still debt" | **Shows, never explains** (ADR-0002); consequences carry the rule, retrospective surfaces name it |
| **No world** — 84 generic cards, no recurring people, no continuity | Priya/Ravi/Danny each appear once | **Cast + Callbacks + Life Lines** (log Q24–Q26) |
| **Curriculum labels mid-run** | "Unlocks budgeting & tracking"; Journal "Concepts met 7/8" | Stage-up names the **moment**, not the concept; concept names stay on retrospective surfaces (Q11) |
| **Exam chrome** | "Month 12 of 60", "What happened", dashed "over" marks, report sheets | Chrome copy pass; HUD reframed into You / The money / The world; no countdown (Q13, Q16) |
| **One uniform card form, 60 times** | every card is one panel with identical rhythm | **Four templates by `kind`** + kind motifs (Q17, Q20) |
| **One-sided "correct answer" choices** | "The boring one — and it was cheaper" | **True Dilemma** authoring rule: ≥ 1 in 3 per Stage, no declared winner (Q27) |
| 60-month syllabus feel | fixed finish, 12 cards/year | **Keep** — comparability and the ending depend on it; earn the length with variety (Q33) |
| Hidden metrics | ticket 05 reveal rule | **Keep, explicitly** — not a cause (Q2, Q3) |

**The deal:** fun = *consequential agency + a world with a voice* (Q1). Every device must answer *what
does this make more alive?*; none may grant anything (ADR-0001).

---

## 2. The changes

### 2.1 Voice & copy (T1 — the highest-leverage work)

- **`docs/voice.md`** — the style sheet: one Narrator ("someone who has already lived it, and won't lie
  to you": dry, warm, unsentimental, never congratulates, never scolds); the **show-don't-explain**
  rule with worked before/after pairs; the humour rules (dry; never at the player's expense; the
  villain may seduce, the game never sneers); no exclamation marks, no money puns; failure named
  plainly; one fun moment per Stage authored on purpose.
- **Full en copy pass, sequenced** (intro + Feedback → Stage-up/chrome → situations → Closing Notes),
  machine-translated, **Fink pass promoted to a launch gate** for this work (Q15).
- **Copy-lint test** over the en catalogue: player-facing Feedback/situation strings must not contain a
  curated banned list ("this is what … is", "the lesson", "you learned", "teaches you", "remember",
  maxim-style "always/never"). Warn-list, hand-curated, CI-run beside the i18n gate (Q14).
- **Closing Notes** — the only place a rule of thumb is said out loud: one short authored line at the
  end of a Chapter and the Money Story, chosen deterministically from the Run's record/band (Q10).
- **Chrome pass** — verbs/nouns of a life, not a course: "Plan the month" → "The month ahead";
  "Start the month" → "Go"; "What happened" → "How it went"; "Month 12 closes" → "Month 12, done";
  "Next month" → "Next". "Net worth", "Your call", "Stats" stay (Q13).
- **Stage-up wording** — headline becomes the authored moment in fiction ("This year: the first
  payslip, and the line taken out before you see it."); the Concept name moves to a small secondary
  line; Coverage keeps the full vocabulary retrospectively (Q11).

**Worked Feedback examples (recommended copy):**

| Current | Recommended |
|---|---|
| "◈6 a month buys certainty. You will probably not claim — that is what insurance is: a small known amount to delete a big unknown one." | "Six a month, gone. The phone can now break once without it becoming your problem." |
| "You held. The loss only becomes real if you sell, and the recovery always happens without you if you do. This is the whole lesson." | "You held. The number fell and nothing was decided — which is what holding means." |
| "Urgency is the tell. Real investments survive being thought about overnight, and everything that cannot is selling you something else." | "You asked why it had to be today. The answer was another deadline. Real money never needs the hurry." |
| "Four payments of ◈30 — and the part nobody says out loud: it built you no credit score." | "Four payments of ◈30, and nothing on your file to show for them. The record starts when the bank decides it starts." |
| "You ended up behind where you needed to be. Nothing is unrecoverable from here; that is the point of the five years." | "Behind where the goal sat. Five years is long enough to know exactly how it happened — the moments above are where." |

### 2.2 Presentation & choreography (T2)

- **HUD reframed, no number removed** (Q16): Band 1 *You* — avatar, age + Stage name, one **Life
  Line**; Band 2 *The money* — Net worth hero, Named-Goal bar + ticks (kept), Cash · Free time strip;
  Band 3 *The world* — Thread / BNPL chips. **"Month X of 60" drops from the HUD** (the close still
  numbers the month; the intro and goal still show the five years).
- **Plan pacing** (Q19): when `lastPlan` exists, Repeat becomes the primary action ("Same as last
  month") with the sliders behind "Change the plan"; month 1 gets an authored **suggested-plan chip**
  (one tap, never automatic, defaults unchanged — ticket 17 stays intact; the Shortfall Warning still
  fires on a bad repeat).
- **Four card templates by `kind`** (Q17): `decision` unchanged; `shock` leads with a receipt-style
  hit; `risk_moment` renders the odds as a two-outcome strip; `scam` renders the pitch as a
  message-bubble block. Same strings, same semantics, same buttons; new axe seeds + reflow entries.
- **Motion vocabulary — four motions, meaningful, reduced-motion-gated, text-backed** (Q18): money
  counts on a Choice; the Save→Debt cascade animates in sequence; the close's net-worth change ticks
  once; the goal bar overshoots ~2% and settles on a Save landing.
- **Money Story restage** (Q23): keep every block, order it story → moments → you-vs-you → band
  (word-only, **neutral treatment, no red/green wash**) → "The record" (numbers, Milestones, Coverage,
  year-5 recap) → Closing Note → Journal → What next. "What next" names the other path explicitly.
- **Art** (Q20): one new beat — `debt_cleared` ("the climb-out") — shown when its Milestone fires;
  four card-kind motifs; eight concept marks for retrospective surfaces only (ticket 13's promised
  "small icon set"); the silhouette reused as a then/now pair on the Money Story. No per-card art,
  no animated illustrations.
- **Sound** (Q21, Q22): no new cues, no default change, no prompting; Settings gains five tiny preview
  buttons so the existing bank is discoverable.

### 2.3 World & continuity (T3)

- **The Cast** (Q24): five named recurring characters — keep Priya, Ravi, Danny; add a school friend
  and a flatmate. Each recurs 2+ times, carries continuity, never explains a lesson. Copy only.
- **Callbacks** (Q25, ADR-0003): pure `callbacks.ts`; at most one authored, derived, deterministic
  line per card ("The group chat still brings up the trip you skipped."); ≤ 12 in v1; no numbers, no
  maxims, non-judgemental, legacy-safe; catalogue ×3; unit-tested like `milestones.ts`.
- **Life Lines** (Q26): one authored HUD line per Stage; text only; never a wellbeing stat.

### 2.4 Stakes, content & completeness (T3)

- **True Dilemmas** (Q27): authoring rule — ≥ 1 in 3 cards per Stage with all choices defensible and
  no declared winner; the spine keeps the teaching cards.
- **Villain Cards** (Q28): three cards, one per late Stage, using only existing fields (`gain` +
  `sets.thread`): you are the seller, the money is yours now, a Thread carries the buyer's consequence
  back in three months. Reopens the gamification merge's content scope note explicitly.
- **Thread payoffs** (Q29): bigger authored swings, named Cast, felt in the fiction. No new mechanics.
- **Complete the annual payoff** (Q39): add the three missing Stage-up interstitial cards (stages 2–4,
  one "begin the year" Choice each, `weight: 0`), so the shipped Year in Review renders every year as
  the merged gamification design intended. No reducer or draw change.

### 2.5 Onboarding, replay, failure

- **Cold Open** (Q30): two screens — a scene in second person present tense, then the goal inside the
  fiction; "how a month works" moves to just-in-time hints (Plan subtitle, first-card kicker, a
  one-time note in the first close derived from `history.length === 1`). Reopens ticket 04's
  three-screen intro explicitly.
- **Replay** (Q31): same-seed replay stays deferred; "What next" offers the other path as a first-class
  CTA beside "Play another five years"; no new modes in v1.1.
- **Failure & recovery** (Q32): new Milestone **`the_climb`** — "the first month your money turned back
  up after three months down", derived from `history.netWorth`, positive-only, event-shaped,
  catalogue ×3 (extends the merged catalogue by one, same derive-only rules); band chips neutralised;
  the `debt_cleared` beat marks the moment; the "Behind" copy fixed (no false promise of recovery).

---

## 3. Guardrail mapping — nothing silent

| Guardrail | How this design honours it |
|---|---|
| Ticket 05 — teaching metrics hidden; "a player who sees a score optimises the score" | No new live metric. Callbacks/Life Lines are fiction; Closing Notes are retrospective; `the_climb` is derived and grants nothing; the HUD keeps only the already-live figures |
| Ticket 08 — no XP/coins/lives/leaderboards; consequences not quizzes | ADR-0001; no reward device of any kind; True Dilemmas and Villain Cards make choices less quiz-like, not more; no other-player comparison |
| ADR-0001/0002/0003 (repo) — recognition not reward; derived not persisted; behavioural numbers retrospective | Reaffirmed; `callbacks.ts` is a pure derived module; `the_climb` derives from stored `history`; nothing new persisted |
| Ticket 12 — privacy | No analytics, no PII, no player-typed name; no new server surface |
| Tickets 13/30 — one-author art, beats only, CC0 | One beat + twelve tiny glyphs, all within ticket 13's original inventory; no per-card art; SFX unchanged |
| Tickets 14/24 — WCAG 2.2 AA, no timers, colour never load-bearing, reduced motion | New templates seeded into axe + reflow; all motion gated and text-backed; band colour neutralised; no timed interaction; sound never load-bearing |
| Tickets 07/26/28 — en/it/ro parity gates | Every new string lands ×3; lint runs on en; Fink pass promoted to launch gate |
| Add-only rule; determinism | No run-taking-away; no RNG in new devices; old saves render (fewer callbacks, no `the_climb`) |
| Better-Choices Proof | Untouched by construction: economy, metrics, `outcomeBand`, draw and record unchanged |

---

## 4. Reopenings ledger (deliberate, for the merge)

1. **Ticket 02 — Stage-up announces the unlocked Concept.** Reopened: the headline names the moment in
   fiction; the Concept name moves to a quiet secondary line; Coverage keeps naming. (Q11)
2. **Ticket 04 — three-screen intro (who you are, the goal, how a month works).** Reopened: two
   screens (scene + goal); "how a month works" becomes just-in-time. Fallback: three screens, all in
   the narrator's voice. (Q30)
3. **Gamification merge §10 — "the 'play the villain' card → out of scope".** Reopened for content:
   three Villain Cards using existing fields; no mechanic or schema change. (Q28)
4. **Not a reopening — a completion:** the merged gamification design's "every Stage-up carries the
   Year in Review" was unmet for years 1–3; three stage-up cards close it. (Q39)
5. **Explicitly NOT reopened:** hidden metrics, no reward loop, no leaderboards, the fixed 60-month
   run, the one-live-Thread rule, privacy, a11y, art budget.

---

## 5. Risks and fallbacks

| Risk | Mitigation | Fallback if it fails |
|---|---|---|
| Voice overcorrects — vague/twee, teaches less | One checkable fact per Feedback; lint; playtest; numbers never move | Keep explicit explanation for tax/scams/insurance/credit only |
| Callbacks feel like gimmicks or repeat | Cap 12; one per card; authored; no numbers | Drop the module; Cast + templates still carry continuity |
| Templates break a11y/reflow | Per-template axe seeds + reflow entries | Revert a template to the `decision` form |
| Translations flatten the voice | Fink pass is a launch gate for this work | Ship voice work only when Fink is done |
| Still feels like a class after all of it | Q1's playtest questions + greyscale/muted passes | Structural v2 candidates recorded: shorter run (48 months), more authored life content; ending framing C from ticket 10 |
| Merge divergence across the four runs | All artifacts sandboxed under `docs/fun-grill/run-2/`; reopenings and fallbacks marked | Orchestrator accepts/drops per device; every device is independently droppable |

---

## 6. Additive sequence (built on the shipped gamification layer)

1. **Voice Pass A** + `docs/voice.md` + copy lint (intro, Feedback worst offenders, chrome; en → it/ro).
2. **Chrome & HUD framing** — three bands, countdown removed, Repeat-primary, suggested chip,
   first-close note.
3. **Card templates + kind motifs** + a11y/reflow seeds.
4. **Callbacks + Cast + Life Lines** — pure module + ~12 callbacks + copy.
5. **Cold Open** — two-screen intro.
6. **Art** — `debt_cleared` beat, twelve glyphs, Money Story then/now pair.
7. **Ending pass** — neutral bands, Money Story restage, `the_climb`, Closing Notes, other-path CTA,
   "Behind" copy fix.
8. **Voice Pass B + Villain Cards + True-Dilemma pass** across the Stages.
9. **Stage-up completion (Q39)** + docs/gates close: `CONTEXT.md` delta, ADRs, `docs/art-audio.md`,
   `docs/accessibility.md`, `docs/translation-brief.md`, `docs/voice.md`, full `pnpm verify`.

Steps 1–3 carry most of the felt change; nothing later blocks anything earlier. None touches economy,
deck schema, draw/RNG, reducer, `RunState`, metrics or privacy.

---

## 7. Verification

- **Automated:** copy lint; `callbacks` unit suite (predicate firing, one-per-card cap, empty/legacy
  records, determinism); `the_climb` unit tests; stage-2/3/4 Year-in-Review fixtures; axe seeds for
  every new template and close state with no excludes; reflow entries; the existing `pnpm verify`.
- **Human-owned (per `docs/accessibility.md`):** muted pass extended with the Settings previews;
  greyscale pass extended with kind motifs and neutral bands; keyboard-only and zoomed passes over the
  new templates; **and the Fun Pass playtest** — Q1's four questions plus "did anything make you
  laugh, and did any card feel like a test?" — recorded as issues, never as telemetry.
- **Review gate (no test can enforce):** no reward device; no new live competence metric; no maxim
  outside a Closing Note; no per-card art; no change to the Better-Choices Proof.

## 8. Open questions — CLOSED (orchestrator answers recorded below)

All six items are now settled by the orchestrator; the recommendations below were accepted as-is.

### Settled decisions (orchestrator answers)

1. **Working title: "Nineteen"** — accepted; fallback "Five years" recorded.
2. **Fink pass as a launch gate for the voice work: yes** — accepted.
3. **`the_climb` entering the merged Milestone catalogue: yes** — accepted, subject to the final merge
   reconciliation.
4. **Villain Cards + True-Dilemma brief: yes to both** — accepted.
5. **Settings sound previews: yes** — accepted.
6. **Which of the four runs' devices merge: the orchestrator's call** — no action for this run.

The design in this document is therefore the settled Run 2 design; only the merge in §6 step 9
remains with the orchestrator.
