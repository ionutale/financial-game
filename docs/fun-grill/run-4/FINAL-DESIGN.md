# FINAL DESIGN — More fun, more attractive, less like a teaching class (v1.1, additive)

Run: `run-4` · Date: 2026-09-27 · Status: **settled** (frontier empty; see `grilling-log.md`, 39 questions over 7 rounds)
Scope: design/docs only. No game source changed, nothing committed. Artifacts sandboxed under `docs/fun-grill/run-4/`.

## 1. The one-sentence design

Make the game feel like **a life you are living, not a lesson you are sitting through**, by letting the money tell the truth, the world talk back, and the story come back for you — without a reward currency, a new scoreboard, a new stored field, or a single quiz.

> Stop explaining the month. Let it happen, let it cost something, and let it come back.

## 2. Why this shape, and not the obvious one

The obvious "make it fun" answers — XP, streaks, cosmetics, a faster loop, a funny narrator — are closed by decisions this project made on evidence (ticket 08: detached rewards teach counter-optimisation; ticket 05: a visible score replaces the life; ADR-0001). The ask still has to be met, so the design attacks what actually reads as school. The diagnosis, evidenced in the repo:

| Classroom signal | Evidence | Fix in this design |
|---|---|---|
| Every Choice ends in a verdict/rule (~190 strings) | `card_<id>_choice_<id>_feedback` in all three catalogues | **Reaction + Why**, taught once (ADR-0001) |
| The numbers contradict the lesson | The Fund never funds (and `the_fund` **destroys** ◈400); the card copy claims interest the loop never charges; "put it aside" choices withdraw | **The money tells the truth** (ADR-0003): Fund wired, minimum becomes a real Repayment, phantom saving removed |
| Curriculum vocabulary on player surfaces | *"Unlocks {concepts}"*, *"Concept coverage"*, *"Introduced / Experienced"* | Display vocabulary map (`CONTEXT-delta.md`) |
| Nobody in it | 84 cards, four names, none recur | **The Cast** — five recurring people; Threads get faces |
| It looks and moves like a form | identical cards; a table for a close; two *aria-hidden* pulses | Calendar, card-kind identity, four one-shot motions, a shock beat, a receipt-shaped close |
| The first ninety seconds are a lecture | three intro screens of maxims | A **cold open** that ends in the first decision |

## 3. What changes

### 3.1 Voice — the game stops teaching out loud

- **Feedback splits into a Reaction and a Why.** The Reaction (≤ 15 words) is a person, a text, a fact — never a lesson, never a verdict. The Why (≤ 40 words) is a disclosure labelled *"Why it happened"*, and the only place a lesson may live.
- **Taught once, trusted after.** The Why auto-opens at a **Concept's first card** — the Teachable Moment the Spine already guarantees — and is collapsed at every later card. The guarantee survives; the register changes.
- **The eight Rules of Thumb**, one per Concept, live in that first Why and nowhere else.
- **The Cast:** **Danny** (always certain), **Priya** (the shift manager, becomes the reference), **Ravi** (the colleague), **Mum** (the allowance, the phone, the family month), **Grandma** (the windfall note). Each appears ≥ 2 and ≤ 3 times per Run, one line each, never explains a lesson, never a moral authority, names identical across locales. A Chapter's cast is derived from its log.
- **A `docs/voice.md`** style guide and per-locale translation brief: wry, specific, warm, second person, the world speaks more than the narrator. Banned: second-person scolding, imperatives, *smart/stupid*, sarcasm at the player, maxims outside a Why, emoji.
- **Three copy waves** by Stage (1–2, 3, 4–5), the pilot wave playtested before the sweep.

### 3.2 Play feel — consequence you can see

- **Pacing:** a returning player clears a month in ≤ 20 s and ≤ 6 taps; the three phases are untouched (the commitment *is* the game). `Keep last month` gets more prominence; nothing is added to the Plan.
- **Money motion:** a one-shot **flash** on a changed figure (never a count-up, which would spam screen readers), and a **cascade trail** beside the existing cascade sentence when Save drains or Debt lights. Both reduced-motion-gated; both text-backed.
- **The close becomes a receipt:** an in-voice headline, a **Debt line** (balance and direction) whenever Debt is non-zero, the existing Milestone line — and the existing table, heading focus and no-live-region discipline, unchanged.
- **The covered moment:** when insurance absorbs a shock (`insuredCost` applied), a dedicated Reaction celebrates it — the payoff of a decision made months earlier that the game never currently acknowledges.
- **Decision weight** stays honest: cost chips keep showing costs and hiding outcomes; Risk Moments keep showing odds; nothing is invented to manufacture tension.

### 3.3 An 84-card deck becomes a place with weather

- **A calendar, derived from `month`:** month 1 is September, so the school year and the Stage boundaries line up. The HUD kicker reads *"Month 17 of 60 · January"*; spine cards carry a seasonal line. Twelve month names ×3 locales; no state, no mechanics.
- **Card-kind identity, typographically:** shock (top rule, tight leading, the new beat), scam (framed as a message, sender line weighted), risk-moment (odds promoted), decision (plain), stage-up (banner). Colour never carries it.
- **Social pressure as a recurring theme** (PISA: ~60% of 15-year-olds bought because friends had): 4–6 new cast-led cards — the group night that costs more than the Want envelope, the trip everyone is paying for, the birthday you can't skip, the family month, the friend's "basically an investment".
- **Threads get faces and grow from three to five or six:** the trip balance due, the trainers' drop, the friend's first instalment. Still **one live at a time** — legibility is the feature. Every Run should see at least two consequences return.
- **The villain moment** (ADR-0002): one Stage-4 referral card where the app pays the player to bring friends into BNPL; a Thread carries the friend's first instalment; no shaming either way; playtest-gated and cuttable.
- **More reassurance, not more content:** no seed-derived opening textures, no challenge modes, no difficulty settings, no same-seed UI. Replay is carried by the other path, the unmet Concepts, the cast and the draw.

### 3.4 Presentation — attractive without a second art budget

- **Cold open:** one scene — *"You are 14."* / Mum's *"◈40 a month. No top-ups."* / *"You decide where it goes before the month does."* — then Start month 1. Privacy line, language switcher and the **sound toggle** stay or are surfaced; the goal moves into the HUD block it already has.
- **Art, beats only (ticket 13 kept):** a **human pass on the ten existing pieces** (already flagged owed in `docs/art-audio.md`), **one new beat** — the shock — and the avatar given more presence on the Stage-up beside the Year in Review. No per-card art, no mascots, no baked-in text, no new visual language.
- **Motion vocabulary:** **deal · flash · cascade · settle** — four one-shot motions, each meaning-carrying, each duplicated in text, all reduced-motion-gated, no loops, no timers.
- **Sound:** no new cues; the existing off-by-default toggle is surfaced at the cold open. Audio stays never-load-bearing.
- **Identity:** the warm-paper "Statement" look, the one money accent, DM Mono figures and Bricolage Grotesque stay. No stage hues, no per-kind colours; any new tint is contrast-checked before it ships.

### 3.5 Payoff — the story gets personal

Four additions to the Money Story, all derived from the record, all inside the existing five-part order:

1. **"The bank paid you ◈X"** — total interest credited, split so compounding is visible (*"◈X of it in year five alone"*). The savings lesson's payoff, currently never mentioned in the story.
2. **Choice Tally** — 3–5 prose facts counted from the log (*"You packed lunch fourteen times."* *"You checked before you trusted, three times."*): what the player did, never what it meant, never compared across Runs.
3. **Chapter Title** — one story-led title per Run (*The Balance That Followed*, *The Year the Market Fell*, *The Ones You Saw Coming*, *Five Ordinary Years*), never a band label, never ranked.
4. **The Other Path** — an authored portrait of the unchosen Fork branch in "What next"; no simulation claimed.

The **Journal** gains the same layer per Chapter (Title, cast list, that chapter's Tally) and keeps everything else: chronological, private, never shareable, derived from the archive so export/delete/retention already cover it. The coverage wording warms to *Seen / Lived / Later*.

### 3.6 The money tells the truth (the three repairs)

| Truth gap (verified) | v1.1 repair |
|---|---|
| `RunState.fund` never increments; `the_fund` *"Put some in"* destroys ◈400 (or creates Debt); the crash has nothing to crash | **Wire the Fund.** `invest` moves Save-pot → Savings → Fund (never Debt) and is **blocked** when unaffordable; 7%/yr growth in `closeMonth`; **Spine opens the Fund at month 52**; the crash at 55 takes 25% off and a scripted recovery (+10%/month, 56–58) restores it by 60. `the_fund`, `boring_fund`, `the_crash` rewired; buy/hold/sell become real. No new state; old saves carry `fund: 0`. |
| The minimum payment claims interest the loop never charges | The minimum becomes a real **six-month Repayment** through the existing recurring-payment state (per-choice amount; HUD chip generalises to "Repayment"), so *"the balance stays alive"* is lived. |
| *"Put it aside"* choices draw on the Save envelope and destroy the money | **Deck audit.** A Choice may never withdraw while promising to set aside. Where the fiction has a deadline, a Thread carries the commitment (`hype_trainers` → the drop; `trip_deposit` keeps its real ◈20 payment and adds the balance due). Where it does not, the choice costs **time** and the deposit stays where it truly lives — the Plan's Save envelope. Audit list: `interest_first.more`, `quarterly_interest.leave`, `savings_milestone.add`, `savings_goal.bike`, `hype_trainers.save`, `trip_deposit.deposit`, plus every `cost` on `category: 'save'` whose copy promises growth. |

**Deliberately deferred to v2, named so it cannot be mistaken for done:** a real card balance (`cardDebt`) with 19.9%/yr and a 5% minimum, a `deposit` verb with a `MonthSnapshot.deposited` row so card deposits count toward the savings-rate measure, a re-tuned Lean year 5, and a fresh Better-Choices Proof run. The full sketch is in ADR-0003.

### 3.7 The eight planned tickets (additive, dependency-ordered)

Each is independently landable and builds on the shipped gamification layer; none adds a route, an endpoint, a stored field, or a reward.

1. **Voice architecture** — `docs/voice.md`, ADR-0001, the `_reaction`/`_why` key migration, the first-encounter helper in `presentation.ts`. No copy sweep.
2. **Pilot wave** — cold open + Stage 1–2 copy + display vocabulary + the close receipt + the covered Reaction. **Playtest the pilot** (human-owed) before the sweep.
3. **Cast & Threads with faces** — cast bible, the social-pressure cards, the new Threads, the villain card is *not* here (ticket 8).
4. **Presentation** — calendar, kind identity, the four motions, the shock beat, the art pass, the avatar on Stage-ups.
5. **The money tells the truth** — the audit, the Fund, the minimum-payment Repayment, the Spine change, the retune check.
6. **Payoff & Journal** — bank-paid-you, Choice Tally, Chapter Titles, the Other Path, the Journal storybook.
7. **Copy waves 2–3 + translation + Fink** — Stages 3–5 and the full ×3 pass, all gates green.
8. **The villain moment + the fun playtest** — last, gated; then the v2 list and the evidence.

## 4. How it fits the existing domain and guardrails

| Guardrail (source) | Posture |
|---|---|
| Money is the only score; no XP/coins/lives/levels/leaderboards/streaks (ticket 08; ADR-0001) | **Kept.** Nothing in this design grants, ranks or counts toward a currency. The villain bonus is world money. |
| Teaching metrics hidden until a year closes or the Run ends (ticket 05; ADR-0003) | **Kept.** No live behavioural metric is added; the close's Debt line is live *money*, as the balances already are. |
| Progression derived, never persisted (ADR-0002) | **Kept.** Reaction/Why, the cast, tallies and titles are views over the log and archive; the Fund and Repayment use fields that already exist. |
| Privacy: a random id and the game state it points at, nothing else (ticket 12) | **Kept.** Cast names are authored content; nothing new is collected; export/delete/retention unchanged; the privacy page learns a surface, not a data class. |
| WCAG 2.2 AA, no timers, reduced motion, text-first, colour never load-bearing (ticket 14) | **Kept and extended.** The Why is a real disclosure; no count-up; kind identity is type only; new states join the axe seed with no excludes. |
| One-author art, beats only, ~10 images (ticket 13) | **Kept.** Human pass on the existing ten + one shock beat + avatar presence. |
| One live Thread (ticket 03) | **Kept**, and enriched with named, cast-led Threads. |
| 60 draws, fixed 60-month ending, bounded shocks, recoverable consequences | **Kept.** The crash is scripted and bounded; the Repayment is recoverable; no fail state is added. |
| The Better-Choices Proof is the success criterion (ticket 05) | **Untouched.** The Fund lives only in Stage 5 (months 52–60), so its balance impact is small; the behavioural measures and the band derivation are not edited. |
| Add-only rule (Stages only add) | **Kept.** No Concept, Stage or Milestone is removed; the pilot's cold open replaces a *presentation* surface, not learning content. |

**Reopened, explicitly, with an ADR each:** the Feedback contract (ADR-0001); the carried "villain card out of scope" decision (ADR-0002); the money-model honesty boundary — Fund wired, phantom saving removed, card balance deferred to v2 (ADR-0003).

## 5. Risks and mitigations

| Risk | Mitigation |
|---|---|
| **Tone** — humour reads as cringe or as a new lecture | `docs/voice.md`; the pilot wave is playtested before the sweep; the fallback is plain warmth, never a return to maxims |
| **Lesson invisibility** — players stop opening Whys | Auto-open at the first encounter; four carriers (consequence, first encounter, recognition, the world's reaction); the playtest asks directly |
| **Translation cost** | Adapt-don't-translate briefs; per-wave shipping; the already-owed Fink pass covers new copy; string budgets (Reaction 15, Why 40 words) bound the work |
| **The villain card misfires** | ADR-0002's boundaries; no shaming; recoverable outcome; cuttable without residue; playtest-gated |
| **Economy scope creep** | ADR-0003 draws the line: Fund + Repayment + audit only; the card balance is a named v2 ticket |
| **Balance drift from the Fund** | Stage-5-only (52–60); deterministic script; Outcome Band thresholds re-checked, not expected to move |
| **A cast member grates** | ≤ 3 appearances, one line each, own wants, no catchphrases; reducing a character to a name is a copy edit |
| **Attractiveness under-delivery** if the art pass slips | Type, motion, calendar and card-kind identity are independent of the art pass and ship regardless |
| **Scope** — a "feel" layer that grows a second game | The forbidden list in the log (`grilling-log.md` Q5/Q34) is the review gate; the eight tickets are bounded |

## 6. Verification

- **Unit (Vitest, pure, table-driven like `metrics.test.ts` / `stats.test.ts`):** first-encounter detection; Choice Tally counts (including legacy logs); Chapter Title precedence; the Fund maths (growth, crash, recovery, blocked invests); the revised card effects; the existing regression that the Year in Review renders only in the stage-up phase.
- **Gates:** `pnpm verify` (check · test · i18n · a11y), with the a11y seed and axe screens extended to the new states (a Why open, the covered Reaction, the debt line, a Chapter with a Title and cast, the cold open) and **no excludes**.
- **Manual passes:** the four documented passes (muted, zoomed, keyboard-only, greyscale) extend to the new blocks.
- **The fun playtest (human-owed, no telemetry):** 5–8 players aged 14–18 if reachable; record seconds and taps per month; whether any Reaction made them laugh (which); whether they opened a Why and whether they stopped opening them; whether anything felt like being told off; whether they can retell a consequence that came back; whether they started a second Run and why; and the one-line test — *"game or lesson?"* Failures are filed as issues, exactly like the accessibility passes.
- **Done when:** the suite and gates pass; the Better-Choices Proof is unaffected; the vocabulary matches `CONTEXT.md` + the display map; and the playtest does not answer "lesson".

## 7. Still open — nothing, by construction

Every frontier question was settled in-line with a recommended answer, none silently assumed. The four carried-over deferrals were re-examined: cosmetics and the profile home stay deferred; **the villain card is reopened** as one content moment (ADR-0002); Milestones-as-data stays code + catalogue (an optional `fund_opened` recognition may join the shipped twelve, derived from the log). The only decisions explicitly pushed beyond this layer are the v2 economy items in ADR-0003 — named, sketched and owned by a future ADR, not left implicit.

## 8. Artifacts in this run

- `docs/fun-grill/run-4/grilling-log.md` — 7 rounds, 39 questions, recommended answers, design tree.
- `docs/fun-grill/run-4/CONTEXT-delta.md` — proposed glossary additions, the Feedback redefinition, the display-vocabulary map, notation changes, anti-vocabulary.
- `docs/fun-grill/run-4/adr/0001-taught-once-trusted-after.md`
- `docs/fun-grill/run-4/adr/0002-one-villain-moment.md`
- `docs/fun-grill/run-4/adr/0003-fiction-may-not-outrun-the-money-model.md`
- `docs/fun-grill/run-4/FINAL-DESIGN.md` — this file.
