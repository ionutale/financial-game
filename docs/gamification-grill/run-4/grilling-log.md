# Grilling log — "I want gamification added to this game"

Run: `run-4` (non-interactive, parallel background run)
Date: 2026-09-27
Repo: `/Users/ionutale/games-development/financial-game` — SvelteKit "Financial Life-Sim" (teens 14→19, 60 monthly Turns, 8 Concepts, Money Story ending).
Method: `grill-with-docs` → `/grilling` + `/domain-modeling`. Each frontier question is settled **immediately with its recommended answer** (the standing instruction of this run replaces the human's answers). Nothing is silently assumed: every settled answer is written below.

Facts were gathered from the codebase, not the user: `CONTEXT.md`; `src/lib/game/*` (`types.ts`, `loop.ts`, `economy.ts`, `metrics.ts`, `stats.ts`, `cards.ts`, `spine.ts`, `threads.ts`, `beats.ts`, `presentation.ts`); `src/lib/components/*` (`MonthScreen`, `Hud`, `StageUp`, `EventStep`, `ResolveStep`, `StatsSheet`, `MoneyStory`, `Intro`); `src/lib/server/store.ts` + `profile-export.ts`; `messages/en.json`; `docs/accessibility.md` + `docs/art-audio.md`; `.scratch/mvp/map.md`, `.scratch/mvp/charting-decisions.md`, and `.scratch/mvp/issues/05` + `08` + `.scratch/mvp/research/08-prior-art.md`.

Two facts drive the whole session:

- The MVP **deliberately rejected** this exact request once. Ticket 08 and the map say: *"no XP/coins/lives or leaderboards"*, and *"Out of scope: multiplayer/social; leaderboards."* The research calls detached reward currencies and ranking-by-wealth the failure mode to avoid.
- The build already contains **unbuilt gamification that the design already sanctioned**: ticket 05 promises a **year-in-review metric line on every Stage-up card** (`"You stayed inside budget 8 of 12 months; net worth ◈1,240."`), and `StageUp.svelte` shows only `Unlocks {concepts}`. The 60-month history needed to render it already exists in `RunState.history`.

So the session's real question is not "add gamification" but "**which gamification**, given a design that already said no to the obvious kind."

---

## Round 1 — Framing: destination, definition, and the earlier "no"

### ❓ **Q1** — **Destination of this work**
Is this a spec-only exercise, a rebuild of the MVP, or an additive layer on the shipped game? Does it change the economy, the deck, or the Money Story?

➡️ **A post-MVP, strictly additive gamification layer specified for v1.1 and delivered as tickets.** It does **not** touch the economy (`economy.ts`), the 60-draw deck, the Spine, the month loop, or the Money Story's five-part order. It extends existing surfaces (`StageUp`, `StatsSheet`, `MoneyStory`, `Hud`) and adds one persistence field to the profile. Design/docs now; implementation is later tickets. Out of scope: multiplayer/social, accounts, push notifications, teacher/classroom tooling, monetisation.
*Settled (non-interactive): additive v1.1 layer, no economy change.*

### ❓ **Q2** — **What "gamification" means here**
Gamification is an overloaded word that can mean points/XP/coins/lives, cosmetic unlocks, streaks, leaderboards, achievements, narrative progression, or social play. Which definition governs?

➡️ **Gamification = making progress, competence and identity legible and rewarding inside the fiction and its own currency.** "The money is the score; the story is the reward." It **is** narrative progression, recognition, and a reason to replay. It **is not** a parallel reward currency, a luck-ranked table, or a pressure loop. Concretely, the delivered set is: an annual retrospective (Year in Review), event-based recognitions (Milestones), and a private cross-Run history (Record Book) — all built from state the game already holds.
*Settled: intrinsic, identity-and-recognition definition; no parallel currency.*

### ❓ **Q3** — **Relationship to the earlier explicit "no XP/coins/lives/leaderboards" decision**
Ticket 08 and the map ruled these out on evidence. Does asking for gamification override that decision, or does the decision stand as a boundary?

➡️ **The decision stands, and it is a boundary, not a ban on gamification.** Ticket 08 rejected reward currencies *detached from competence* and ranking that *rewards luck and wealth* — not progress, recognition or replay value. Re-read in that light, the ask is compatible. Everything in this design must pass the ticket-08 test: *"what behaviour would a player optimise if they played this to win?"* — and the answer must be a competence, not a counter. This reaffirmation is recorded as an ADR because a future reader will otherwise "fix" the absence of points.
*Settled: reaffirm the boundary; record the reasoning.*

### ❓ **Q4** — **What player problem are we actually solving**
Gamification is a means, not an end. Which specific weakness of the current game is it for?

➡️ **Three named problems, in priority order.** (1) **Mid-Run drift**: Stages 3–4 are where obligations bite and the month stops feeling like progress; the only live progress signal is one Named-Goal bar. (2) **No reason to replay**: once the Money Story is read, the archive is a dead end; the two paths are the content and nothing invites the second play. (3) **The payoff is too late**: the Money Story arrives only at month 60, so all recognition is deferred behind ~60 taps. Everything added must attack one of these three; anything that does not is out.
*Settled: three problems — mid-Run drift, no replay hook, deferred payoff.*

---

## Round 2 — The motivational model

### ❓ **Q5** — **The single live "score" during a Run**
Ticket 05's governing principle is that teaching metrics are never visible during the Run, because "a player who can see a score optimises the score." The Named-Goal progress bar is the one sanctioned live metric. Do we keep it as the *only* one, or add live behavioural meters (adherence %, savings rate, want share) to motivate?

➡️ **Keep the Named-Goal bar as the only live score-like metric.** Do **not** add live behavioural meters. Adding them would make the Better-Choices Proof self-defeating: a player shown "adherence 6/12" will flatten the Want envelope and stop living the month, and the proof would measure the meter, not the behaviour. Behavioural numbers surface **retrospectively** — after a year closes, when they cannot be farmed (Q10).
*Settled: one live metric, the Named Goal.*

### ❓ **Q6** — **In-Run vs cross-Run gamification**
Should the layer improve the current Run, the space between Runs, or both?

➡️ **Both, with in-Run primary and cross-Run second.** In-Run (Year in Review + Milestones) is where the motivation problem actually is, and it works with state already computed (`RunState.history`, `flags`). Cross-Run (the Record Book) is what makes replay mean something and is the natural home of the already-archived `ArchivedRun[]`. Ship in-Run first; cross-Run is Phase 2 because it needs a persistence change.
*Settled: both; in-Run Phase 1, cross-Run Phase 2.*

### ❓ **Q7** — **The recognition primitive**
What is the unit of recognition, and what do we call it? Candidates: badge, achievement, trophy, medal, milestone, mark.

➡️ **"Milestone" — a named recognition awarded the moment a specific money act happens.** Deliberately *not* "badge" or "achievement" (arcade/checklist connotations) and *not* "trophy" (implies a shelf of unrelated objects). A Milestone names an act the player did: *Cleared the card*, *Held through the crash*, *Fund opened*, *Goal reached*, *Fifty shifts*. It is drawn from the Run's own state and is **event-shaped, never rate-shaped** — a thing that happened, not a level maintained. Roughly 12–16 authored, reachable on both paths.
*Settled: Milestone, event-shaped.*

### ❓ **Q8** — **Does a Milestone pay a mechanical reward**
Do Milestones grant money, a game bonus, a stat, or a cosmetic? The research warns that tangible external rewards "reliably undermine intrinsic motivation," and a money payout would distort the economy and the Outcome Band.

➡️ **Recognition only. No money, no stat bonus, no economy effect.** The reward is legibility and identity: a named mark, a quiet cue, and the fact that the Money Story can say "you did these things." A cash payout would either break the balance or be trivial; a cosmetic (avatar tint) is attractive but is **deferred to v2** so Phase 1 cannot leak into art/asset work. This keeps the Outcome Band and the Better-Choices Proof honest.
*Settled: recognition only; cosmetics deferred.*

### ❓ **Q9** — **Streaks**
Streaks are the classic gamification device and the classic dark pattern ("you broke your streak"). Do we add a streak?

➡️ **No streak mechanic. No loss-averse counter, no daily/weekly cadence, no login bonus.** Instead, the *single* retrospective concession is a **year-scoped** recognition ("a year never over budget") evaluated once, after the year is locked — an event, not a live streak. This mirrors the existing tone rule ("a wrong Choice gets information, never a punitive noise") and avoids the engagement loop the privacy/design posture has already rejected.
*Settled: no streaks; year-scoped clean-year recognition only.*

---

## Round 3 — Surfaces and beats

### ❓ **Q10** — **The Year in Review at Stage-up**
Ticket 05 promises one metric line plus the money summary on every Stage-up card. The build does not have it. Is this the backbone of the gamification?

➡️ **Yes — build it, and expand it into the core annual beat.** Every Stage-up becomes the "level up" moment: the year's money (net-worth change, saved, interest credited) plus **one** behavioural line (months inside budget, from `MonthSnapshot.insideBudget`) plus any Milestones earned that year. It is **retrospective only** — the year is already closed, so nothing here can be farmed. This is the single highest-value change and closes a stated-but-unbuilt design gap.
*Settled: implement and expand the Year in Review at every Stage-up.*

### ❓ **Q11** — **What the Stage-up beat shows, and whether it needs new art**
`StageUp.svelte` currently shows `Stage {n} · {name} · age {age}`, `Unlocks {concepts}`, and for the Fork only, one beat illustration.

➡️ **Expand the existing interstitial; add no new illustrations.** Contents: chapter number/name, age, concept unlocks (existing), the Year in Review block, the Milestones earned that year, and the existing beat art where `BEAT_ART` already provides it (the Fork). Ticket 13's rule is "beats only, never per card"; a new drawing per Stage-up would break it and add asset cost. Typographic-first stays.
*Settled: expand StageUp; no new art.*

### ❓ **Q12** — **Where Milestones live and how they are announced**
The moment a Milestone lands (mid-month, most likely), where does the player see it?

➡️ **A quiet announcement at the month close, and a permanent list in the Stats Sheet.** The month close (`ResolveStep`) already takes focus and is the natural "what happened this month" surface; the Milestone line joins it with `aria-live="polite"` so it is announced but never the sole carrier of meaning. The Stats Sheet gains a Milestones section beside the existing Threads history — the sheet is on-demand, so it cannot become a dashboard. The HUD gains nothing (it is already dense and carries the one live metric).
*Settled: month-close announcement + Stats Sheet section.*

### ❓ **Q13** — **The Money Story's gamification layer**
The Money Story is the five-part ending. Should it carry a "collection" and cross-Run records?

➡️ **Yes, after Phase 1.** Add, inside the existing structure: (a) a **Milestones** block in "The numbers" — what the Run collected, honestly including none; and (b) a **Record Book** in "What next" — the player's own personal bests across archived Runs (best adherence year, best savings-rate year, largest final net worth, longest debt-free stretch), each **you-vs-you**. Keep the existing five-part order; this is a section, not a rewrite. No comparison to other players, ever.
*Settled: Milestones block + private Record Book, appended to the existing structure.*

### ❓ **Q14** — **Onboarding reframe**
The intro is three screens and states the goal (◈4,000). Does gamification change it?

➡️ **One added line, not a screen.** Screen 2 already names the goal; add a sentence naming the meta-loop: five chapters, marks for the acts that matter, and your own record to beat. No tutorial (the first card teaches), no "levels" language.
*Settled: minimal intro line; no new screen.*

---

## Round 4 — Vocabulary and domain model

### ❓ **Q15** — **Canonical terms and the words to avoid**
Which terms enter `CONTEXT.md`, and which are banned?

➡️ **Add:** **Gamification** (the recognition layer, not points), **Milestone** (named recognition for a money act), **Mark** (the visual token of a Milestone), **Year in Review** (annual retrospective at a Stage-up), **Record Book** (profile-level personal bests across Runs), **Personal Best** (the player's own best figure for one behavioural measure across Runs). **Avoid** per term: badge/achievement/trophy for Milestone; scorecard/report card/grade for Year in Review; leaderboard/ranking/high score for Record Book; score/ranking for Personal Best. **Anti-vocabulary (must not appear anywhere):** XP, points, coins, lives, level-up-as-noun, loot, streak (as a mechanic), leaderboard.
*Settled: as listed; recorded in `CONTEXT-delta.md`.*

### ❓ **Q16** — **Where Milestone definitions live**
Code registry, content JSON, or the event-deck mechanism?

➡️ **A small code registry keyed by id (evaluation logic) + prose in the message catalogue keyed by id.** Logic (thresholds, "first cleared debt", "held the crash") is code; names and descriptions are `concept_*`-style catalogue keys, exactly as Concepts, Threads and flags already work. Not content JSON: the deck's JSON is for authored *scenarios*, and Milestones are derived mechanics, not scenarios. A future authoring tool can externalise them later.
*Settled: code registry + catalogue prose.*

### ❓ **Q17** — **Boundary of the model: what is *not* a Milestone**
Where does the line sit between Milestone, Turning Point, Thread, and Choice Effect?

➡️ **Turning Point** (existing) = a *narrated* moment the Money Story tells, including bad ones ("you paid only the minimum"). **Milestone** = an *earned, named* recognition for an act, positive-only. They overlap in source (`flags`) but differ in purpose and tone; a flag may produce a Turning Point without a Milestone (the minimum-payment streak) and vice-versa. **Thread** = a pending consequence; **Choice Effect** = one Choice's mechanical result. Milestones never carry state or consequences — they observe.
*Settled: Milestones observe; they never change state.*

---

## Round 5 — Data, persistence, privacy, i18n, accessibility, verification

### ❓ **Q18** — **Where awarded Milestones are stored during a Run**
Derived on the fly, UI state only, or carried in `RunState`?

➡️ **Carried in `RunState`** as an ordered list with the month each was earned (like `flags` already is), so a reload or a resumed save restores them and the archive keeps them. The *announcement* (the toast line) is ephemeral UI state. Deriving them on the fly is tempting but fragile: "first debt cleared" needs the evaluation moment, and an old save would silently rewrite its own history.
*Settled: RunState carries earned Milestones (id + month); announcements are UI state.*

### ❓ **Q19** — **Cross-Run (Record Book) persistence, export, delete, retention**
The profile currently stores `active` and `archive`. Where do personal bests live, and how do they respect the privacy build?

➡️ **A new optional `records` field on the stored profile document, derived at Run-finish by comparing that Run's metrics to the existing records.** It must degrade gracefully for old documents, exactly as `readProfile` already handles the pre-ticket-23 single-Run shape. It is **player data**: it must appear in `buildProfileExport`, be removed by *Delete everything*, and be covered by the same 12-month inactivity `sweep` (it lives in the same document). No new PII, no new identifier, no analytics.
*Settled: profile-level `records`, additive, exported, deleted, swept.*

### ❓ **Q20** — **Localisation**
New strings in three locales; any plural or locale traps?

➡️ **Every new user-facing string is a catalogue key in `en/it/ro`** — Milestone names and descriptions, Year-in-Review labels, Record-Book labels, the intro line. Milestone **ids are stable and locale-free**; only presentation is localised (the existing ticket-07 rule). Counts ("8 of 12 months") use the existing plural machinery. The i18n gate (`messages.test.ts`) enforces key parity and non-empty values across all three catalogues, so ship all three together.
*Settled: 3-locale keys, stable ids, existing plural rules.*

### ❓ **Q21** — **Accessibility of the new surfaces**
The MVP commits to WCAG 2.2 AA and a full screen-reader playthrough.

➡️ **Extend the existing gates; add no `axe` excludes.** The two new states (a Stage-up with a Year in Review, a Stats Sheet with Milestones) each get a deterministic state in `tests/a11y/seed.ts` and an axe test in `screens.spec.ts`; reflow coverage follows if they are key screens. Rules: the Milestone announcement is `aria-live="polite"` and never the sole carrier; a Mark is never colour-only (name + text always present); `prefers-reduced-motion` respected; 44px targets; no new focus trap beyond the Stats Sheet's existing one.
*Settled: extend seed + screens; no excludes; text-first.*

### ❓ **Q22** — **How we will know it worked**
The game has no analytics by design (privacy build forbids it). How is the layer verified?

➡️ **Pure-function unit tests + the existing gates + a human playtest protocol; no telemetry.** The Milestone evaluator is a pure function over `RunState` and gets table-driven `*.test.ts` coverage like `metrics.test.ts`/`stats.test.ts`. A regression test asserts the Year in Review appears **only** at a Stage-up and that no milestone condition reads a live rate mid-Run. The success question ("does it make the five years better worth finishing?") is **human-owed**: a documented playtest protocol (finish a Run, note where motivation dipped, whether the second Run was started) — matching `docs/accessibility.md`'s existing "four manual passes" culture.
*Settled: unit + a11y + i18n gates; success is a human playtest; no analytics.*

---

## Round 6 — Risks, non-goals, sequencing

### ❓ **Q23** — **Dark patterns to forbid explicitly**
The prior-art research lists the failure modes. Which are hard rules?

➡️ **Forbidden by rule:** FOMO timers or expiring rewards; daily/weekly streaks or login bonuses; push notifications; loss aversion ("your streak is at risk"); random/loot rewards; any purchasable currency; leaderboards or any other-player comparison; guilt or judgement copy; infinite-engagement loops; milestones that reward speculation or hoarding (e.g. "trade often"). Each is a test the design must pass, not a preference.
*Settled: forbidden list recorded in `FINAL-DESIGN.md` and the ADR.*

### ❓ **Q24** — **The three real risks, and their mitigations**
What could this layer break?

➡️ **(1) Score optimisation:** mitigated by keeping behavioural metrics retrospective and making Milestones event-shaped, never rate-shaped. **(2) Reward-loop distortion:** mitigated by Milestones granting no money/stat — the economy and Outcome Band are untouched. **(3) Moralising tone:** mitigated by non-judgemental names ("Fund opened" not "Smart investor") and by keeping the existing honest Turning Points as the place mistakes are named. A fourth, **path inequity** — a Milestone set only the Work path can reach — is mitigated by auditing every Milestone against both the Study and Work paths.
*Settled: four risks, each with a mitigation.*

### ❓ **Q25** — **Sequencing into tickets**
In what order should this land?

➡️ **Seven tickets, dependency-ordered, each shippable alone:**
1. **Vocabulary + ADRs** — this run's docs (no code).
2. **Year in Review at Stage-up** — uses existing `history`; smallest, highest value; closes the ticket-05 gap.
3. **Milestone registry + evaluation + month-close announcement** — pure function + catalogue.
4. **Stats Sheet Milestones section** — UI only.
5. **Record Book at the Money Story + profile `records`** — persistence, export, delete, retention.
6. **Intro line + full i18n + a11y coverage.**
7. **Playtest protocol + playtest** — human-owed.
*Settled: as listed.*

### ❓ **Q26** — **What is still open after this run**
Which questions remain genuinely undecided, and what is the recommendation for each?

➡️ **Four open items, none blocking Phase 1:**
- **Cosmetic unlocks (avatar tints)** — recommended: defer to v2; revisit only if the playtest shows recognition alone is too thin.
- **A profile "home" screen** (a between-Runs hub) — recommended: do **not** build; the Money Story's "What next" is the hub.
- **A "play the villain" card** (from the research's *Shady Sam*) — recommended: out of scope for the gamification layer; it is a content/design change, not recognition.
- **Whether Milestone definitions should become data** — recommended: keep code + catalogue for v1.1; revisit if the set exceeds ~20.
*Settled: recommendations recorded; frontier otherwise empty.*
