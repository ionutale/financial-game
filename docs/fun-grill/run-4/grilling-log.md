# Grilling log — "Make the game more fun, more attractive, less like a teaching class"

Run: `run-4` (non-interactive, parallel background run)
Date: 2026-09-27
Repo: `/Users/ionutale/games-development/financial-game` — SvelteKit "Financial Life-Sim" (teens 14→19, 60 monthly Turns, 8 Concepts, Money Story ending, gamification layer just shipped).
Method: `grill-with-docs` → `/grilling` + `/domain-modeling`. Because this run is non-interactive, every frontier question is **settled immediately with its recommended answer**, recorded below, and the frontier recomputed. Nothing is silently assumed; every settled answer is explicit.
Sandbox: all artifacts under `docs/fun-grill/run-4/`. Nothing outside this folder is edited.

Facts were gathered from the repository, not from a human: `CONTEXT.md`; `docs/adr/0001–0003`; `docs/art-audio.md`; `docs/accessibility.md`; `docs/privacy/lia.md`; `.scratch/mvp/map.md` and issues 01, 03, 04, 05, 08, 12, 13, 14, 30 plus `.scratch/mvp/research/08-prior-art.md`; the shipped gamification design/spec and `docs/gamification-grill/run-4/`; the whole deck (`src/lib/game/cards.ts`, 84 cards) and every game module (`types`, `loop`, `economy`, `spine`, `threads`, `metrics`, `milestones`, `journal`, `presentation`, `beats`, `stats`); every component (`MonthScreen`, `Hud`, `PlanStep`, `EventStep`, `ResolveStep`, `StageUp`, `StatsSheet`, `MoneyStory`, `Intro`, `BeatArt`, `Avatar`); `src/app.css`; `src/lib/audio/sfx.ts`; `messages/en.json` (785 lines, 695 keys ×3 locales).

## The four facts that drive this session

1. **The classroom feeling is made of prose and vocabulary, not of learning.** Every Choice carries a `card_<id>_choice_<id>_feedback` string that closes on a rule, a maxim or a verdict — 84 cards × ~2.2 meanings ≈ **190 teaching lines**, e.g. *"That is the best-paid three hours in this entire game."* The UI speaks curriculum: `stage_up_unlocks` = *"Unlocks {concepts}"* (en.json:77), `stats_coverage` = *"Concept coverage"*, `coverage_introduced`/`coverage_experienced`/`coverage_not_yet` = *"Introduced / Experienced / Not yet"* (en.json:105–108). The intro is a three-screen lecture (*"Money you do not spend is the only money you keep."*, en.json:10). The Plan is sliders plus a `50 / 30 / 20` preset, and the close is an accounting table. None of that is required by the pedagogy; all of it reads as school.
2. **Some of the teaching is asserted over the numbers, not carried by them** — the exact inverse of the game's own principle (*legible cause and effect*, ticket 08 research). The clearest cases, verified in code:
   - `RunState.fund` is never incremented (`loop.ts` writes `savings`, never `fund`), so `the_fund`'s *"Put some in"* (`cost: 400, category: 'save'`, cards.ts:1298) **destroys ◈400 of the player's money**; `the_crash`'s *"buy"* (`cost: 200`, cards.ts:1319) and `boring_fund`'s *"fund"* (`cost: 50`) do the same. The crash cannot crash anything you own.
   - There is no card balance and no debt interest: ticket 01 promised *"One credit card. APR 19.9%/yr (1.66%/mo). Minimum payment 5%"* (01-economy-model.md:102), but `loop.ts` only credits savings interest, and the minimum-payment path only moves the score. Yet the copy says *"◈15 comes off the balance and almost all of it was interest."*
   - Several *saving* choices are mechanically destructive while their copy promises growth: `interest_first.more` (*"Move another ◈20 across"*) is `cost: 20, category: 'save'`; the same pattern in `quarterly_interest.leave`, `savings_milestone.add`, `savings_goal.bike`, `hype_trainers.save`, `trip_deposit.deposit`. In this model a "cost" from the Save envelope is money **spent**, not set aside.
3. **The gamification layer just shipped and is the recognition substrate to build on** — Milestones (12 + `both_paths`), Year in Review on every Stage-up, Concept Coverage, the Journal (`/journal`), goal ticks, one `milestone` cue; all **derived** from `history`/`flags`/`log`/`stage`/`path`/`archive`, no new persisted state (ADR-0002), behavioural numbers retrospective (ADR-0003), no reward currency (ADR-0001). It also added the curriculum vocabulary the game now speaks out loud — this layer must warm it, not duplicate it.
4. **The guardrails are real and mostly correct.** No XP/coins/lives/leaderboards (ticket 08; ADR-0001); teaching metrics hidden until a year closes or the Run ends (ticket 05; ADR-0003); no analytics, no PII, one strictly-necessary cookie (ticket 12); WCAG 2.2 AA, screen-reader playable, no timers, reduced-motion respected, colour never load-bearing (ticket 14); one-author art, beats only, ~10 illustrations, SFX off by default (ticket 13/30); one live Thread (ticket 03); exactly 60 draws from an 84-card pool; fixed 60-month ending (ticket 05). The asks "more fun, more attractive, less classroom" must be met **inside** these, or by an explicit, reasoned reopening.

---

## Round 1 — Framing and diagnosis

### ❓ **Q1** — **Destination and scope of this work**
Is this a rewrite of the game, a new game mode, an economy rebuild, or an additive layer? What exactly changes, and what is out of bounds?

➡️ **A strictly additive v1.1 "Feel" layer, specified here and delivered as tickets.** It changes four things: (a) **voice** — every player-facing string in the run is rewritten to a game register, and the Feedback is split; (b) **content** — a recurring cast, 4–8 new cards, 2–3 new Threads, and an honesty audit of the existing deck's effects; (c) **presentation** — a cold open, a calendar, card-kind identity, a motion vocabulary, one new beat illustration and a human art pass; (d) **payoff** — new derived reveals in the Money Story and the Journal. It adds **no new persisted state**, no reward currency, no live behavioural metric, no new route, and no timer. It does **not** rebuild the economy; it repairs the three places where the money model is actively untruthful (the Fund, the minimum payment, the phantom "set aside" choices) because those are the deepest source of lecture-feel, and it refuses the larger economy work (a real card balance) to v2 with a named sketch.
*Settled (non-interactive): additive v1.1 Feel layer; design/docs now; no economy rebuild; the only money-model work is the honesty repair.*

### ❓ **Q2** — **What "fun" means for this game**
"Fun" is overloaded. It could mean reward loops, speed, comedy, power fantasy, or mastery. Which definition governs, and what does the layer optimise for?

➡️ **Fun = the pleasure of living a consequential life in one sitting**, in four specific sources, in priority order: (1) **consequence that returns** — a decision made in month 22 shows up named in month 34 (the Threads are the game's best fun device and are under-used); (2) **a world that talks back** — people with names, opinions and memories, who react to what you did (the game currently has almost no one in it); (3) **mastery you can see without a scoreboard** — the Year in Review, chapter titles and the end-of-Run reveals, all retrospective, so nothing can be farmed; (4) **wit** — a register that respects a 15-year-old enough to be funny and specific rather than instructive. Explicitly **not** fun: XP/coins/lives, streak pressure, daily cadence, timers, loot, gore, memes, difficulty spikes, or a "funny" narrator who mugs for the camera.
*Settled: fun = consequence that returns + a world that talks back + retrospective mastery + wit.*

### ❓ **Q3** — **The classroom diagnosis: what exactly makes it feel like a class?**
Rank the causes so the fixes attack the real ones. Candidates: the Feedback maxims; the curriculum vocabulary; the accounting-shaped Plan/close; the three-screen intro; the absence of people; the static presentation; content that lectures about mechanics it does not simulate.

➡️ **Ranked, with the evidence above:**
1. **The Feedback maxim (highest).** Every choice ends in a verdict/rule, in the same omniscient voice, ~190 times. The player is *told what the month meant* before they can feel it. This is the single biggest "teacher" signal.
2. **Teaching that the numbers do not back (Q1 fact 2).** A player who starts a fund watches their money vanish; the game then explains that saving is good. Nothing says "worksheet" louder than a lesson that contradicts the ledger.
3. **Curriculum vocabulary on player surfaces** ("Unlocks", "Concept coverage", "Introduced/Experienced") plus the intro lecture; these are the *words* of a classroom bolted onto a life-sim.
4. **Nobody in it.** 84 cards contain four named people (Danny, Priya, Ravi, Grandma) and none recur; there is no one to care about, no social texture, no one to talk back — while the research says "a character you care about" is what makes money feel consequential.
5. **It looks and moves like a form.** Type is beautiful but static; cards look identical regardless of kind; the close is a table; the only motion is a page rise and two *aria-hidden* pulses.
6. **The intro** (a subset of 3–4, listed because it is the first ninety seconds).
*Settled: fix in that order — voice, honesty, vocabulary, cast, presentation, intro.*

### ❓ **Q4** — **Which guardrails are kept, and which are reopened?**
The ask can be met by warming the game, or by breaking its design. Decide the posture explicitly, and record every reopening.

➡️ **Kept, and restated in the design:** the money is the only score; no XP/coins/lives/levels/leaderboards/streaks (ADR-0001); behavioural numbers stay retrospective and Milestones stay event-shaped (ADR-0003); no analytics, no PII, no new stored state (ADR-0002 + ticket 12); one-author art with beats only; one live Thread; 60 draws; fixed 60-month ending; bounded shocks; no quizzes; no colour-only meaning; no timers; WCAG 2.2 AA; SFX off by default and never load-bearing.
**Reopened, with an ADR each:** (a) the **Feedback contract** — from "explain every time" to "taught once, trusted after" (ADR-0001 this run); (b) the carried-over decision **"the 'play the villain' card → out of scope"** (gamification design §10) — one moment ships, as content (ADR-0002); (c) the **money-model honesty boundary** — the Fund is wired and phantom saving is removed, while the real card balance stays a named v2 item (ADR-0003).
*Settled: three explicit reopenings; everything else affirmed.*

### ❓ **Q5** — **Non-goals and the forbidden list for this layer**
What must not be built, even though it would be fun or attractive?

➡️ **Forbidden (review gate):** XP · points · coins · lives · energy · stars · gems · levels (Stages stay the only ladder) · badges/achievements · leaderboards or any other-player comparison · live streaks or streak mechanics · timers, FOMO, daily cadence, notifications, guilt copy · loot or variable-reward loops · purchases · analytics/telemetry · new personal data · a shareable Journal · negative or mocking Milestones · Milestone payouts · quizzes or comprehension checks · a second scoreboard · stage hues or any colour that carries meaning · more than one live Thread · player naming (it would be personal data and a save field) · an authored "correct" ending · difficulty modifiers or challenge modes.
**Non-goals:** no new route, no new endpoint, no new stored field, no change to `computeMetrics`, `outcomeBand` or the Better-Choices Proof, no deck-size change to the draw rules, no branding/name change (owner's call, see Q39).
*Settled: the list above is the gate.*

---

## Round 2 — Voice: the biggest lever

### ❓ **Q6** — **What happens to Feedback?**
Feedback is the pedagogical heart of the loop (ticket 04: *"Feedback appears immediately under the Choice (≤ 40 words)"*), and it is also the main source of classroom feel. Remove it, keep it, or split it?

➡️ **Split it into two layers, and change the default.**
- **Reaction** — the short in-fiction line shown the instant the Choice lands: a friend's text, a shopkeeper's line, your own thought, the world being wry. **≤ 15 words**, no verdict, no lesson, no number about behaviour. Presses the "what happened" feeling, not the explanation.
- **Why** — the explanation, held behind a disclosure labelled **"Why it happened"**: one or two sentences, **≤ 40 words**, and the only home of the Concept link and the **Rule of Thumb**. Collapsed by default (with the one exception in Q7).
- **Unchanged:** the cascade line stays visible immediately (money telling the truth is not a lecture), the month close stays the plain-facts home, and the Concept still lands.
- **Keys:** `card_<id>_choice_<id>_feedback` is replaced by `_reaction` and `_why`; no player data is involved, so the rename is a code/catalogue migration, not a save migration.
Why an ADR: this changes the game's educational contract — the explicit lesson is no longer imposed at the moment of play — and a future reader will otherwise "fix" the missing explanations back into every card.
*Settled: Reaction + Why; ADR-0001.*

### ❓ **Q7** — **Does the player still get taught? ("Taught once, trusted after")**
If the Why is collapsed on every card, a player may never read it, and the Teaching guarantee quietly dies. How is the guarantee kept without re-lecturing?

➡️ **The Why auto-opens at the Concept's first card in the Run, and is collapsed at every later card.** The first time a card carrying a Concept is played (derived from the log prefix; a pure helper beside `planWarning` in `presentation.ts`), the Why renders open, preceded by that Concept's Rule of Thumb — this *is* the Teachable Moment, already guaranteed by the Spine and the Stage-up announcement. After that the game trusts the player. The Recap surfaces (Year in Review, Stats Sheet, Money Story) keep carrying the record.
*Settled: taught once at the Concept's first card; collapsed after. "Taught once, trusted after."*

### ❓ **Q8** — **The voice: what register do we write in?**
The current prose is elegant but uniform, omniscient and aphoristic. What replaces it, and what is banned?

➡️ **Wry, specific, warm, second-person; the world speaks more than the narrator.** Write a one-page **`docs/voice.md`** style guide + a translation brief with before/after examples. Rules: (1) a Reaction is a fact, a reaction or a joke — never a verdict; (2) no lesson outside a Why; (3) prefer a person's line over the narrator's; (4) ≤ 15 words for a Reaction, ≤ 40 for a Why; (5) concrete teen detail beats generic advice (a rota, a group chat, a mum's exact phrase); (6) no second-person scolding, no imperatives, no *"smart/stupid"*, no sarcasm at the player's expense, no *"you should have"*, no exclamation-mark narration, no emoji, no maxims.
Illustrative rewrites (current → new):
- `two_wants.game`: *"You picked the thing you wanted over the thing you needed…"* → **Reaction:** *"The game is brilliant. The headphones are still in the shop."* **Why:** *"Wants aren't wrong — but a Need deferred comes back next month, and the plan has to carry it."*
- `concert_tickets.go`: *"…You did decide, right?"* → **Reaction:** *"Good night. The bike fund says nothing, loudly."* **Why:** *"Spending from Save is allowed — the cascade decides how, you decide whether. Know what pays for it."*
- `minimum_payment.minimum`: *"◈15 comes off the balance and almost all of it was interest…"* → **Reaction:** *"The minimum again. The app is very happy with you."* **Why:** *"The minimum is designed to be affordable forever. On a real card that's years; here it's a plan you carry for six months."*
*Settled: the register and the banned moves above; `docs/voice.md` is a deliverable.*

### ❓ **Q9** — **The Cast: who is in the game, and on what terms?**
The research says a character you care about is what makes money consequential, and the deck already scatters four names it never reuses. Do we add a cast, and how big?

➡️ **Yes: five recurring people, authored, no storage.** **Danny** (the friend who is always certain — the schemes, `risky_tip`, the trainers), **Priya** (the café shift manager who becomes the reference), **Ravi** (the colleague — shifts, cover, quitting), **Mum** (the allowance, the phone, the family ask), **Grandma** (the windfall note; the one who says *do not spend it all at once*). Rules: each appears at least twice per Run and never more than three times; at most one line per appearance, 3–12 words; they **never explain the lesson** (the Why does); they are not moral authorities; no catchphrases; they have their own wants, not the player's; the same names across all three locales (proper nouns, identical spellings); a **cast list per Chapter** is derived from the log in the Journal. The three existing Threads get faces: the course → Priya, the friend loan → Danny's circle, the risky tip → Danny.
*Settled: five-person cast, recurring, rules above; Threads get faces.*

### ❓ **Q10** — **The maxim audit and the eight Rules of Thumb**
~190 Feedback strings end in a rule. How is the sweep done, and where do the rules go?

➡️ **Three waves, by Stage (1–2, 3, 4–5), each wave independent and shippable.** Every Feedback becomes a Reaction + Why pair; every concept gets exactly **one Rule of Thumb** that lives in its Why at the Teachable Moment and may be quoted nowhere else: needs_vs_wants *"Money you don't spend is the only money you keep."* · earning_work *"Every hour you sell is an hour you can't buy back."* · budgeting *"Decide where it goes before the month decides for you."* · saving_goals *"Give the money a name and it survives."* · interest *"Interest is the only money that works while you sleep."* · credit *"The minimum is designed to be affordable forever."* · investing *"You can't time it. You can only stay in it."* · tax_insurance_scams *"Urgency is the tell."* No new maxim may appear in a Reaction; a Reaction may be funny, but it may not be a lesson in disguise.
*Settled: three waves; one rule of thumb per Concept; no new maxims.*

### ❓ **Q11** — **Player-facing vocabulary: how do we stop speaking curriculum?**
"Unlocks", "Concept coverage", "Introduced / Experienced" are the words of a scheme of work. The glossary is canonical; the display copy does not have to be. What changes?

➡️ **Internal terms stay exactly (CONTEXT.md is unchanged); the player-facing copy warms, one canonical display phrase per term, recorded in `CONTEXT-delta.md` so it cannot drift:** `stage_up_unlocks` *"Unlocks {concepts}"* → **"New this year: {concepts}"**; `stats_coverage` *"Concept coverage"* → **"Money you've met"**; `coverage_introduced` → **"Seen"**; `coverage_experienced` → **"Lived"**; `coverage_not_yet` → **"Later"**; the Money Story's coverage section takes the same words. Keep **"Stats"**, **"Milestones"**, **"You, against you"**, **"The Money Story"** and the Stage names — they already read as life, not as class. "What happened" stays as the close/read-back frame.
*Settled: internal vocabulary unchanged; display vocabulary mapped and frozen in the delta.*

---

## Round 3 — Moment-to-moment play feel

### ❓ **Q12** — **Pacing: what is a month allowed to cost?**
60 months is the whole game; a month that takes a minute is an hour of play. Ticket 09 was asked to measure taps and seconds; that measurement was never human-validated. What is the target and what changes?

➡️ **A returning player should clear a month in ≤ 20 seconds and ≤ 6 taps, without skipping the commitment.** Keep the three phases exactly (Plan → Event → Close); the fun is the commitment, not a faster slider. Reduce friction only where there is none to feel: `Keep last month` becomes the prominent secondary action (it already exists), the plan's preset stays, and nothing new is added to the Plan step. The **first** month gets the opposite treatment: the cold open (Q25) ends inside month 1's Plan, so the first decision arrives in under a minute.
*Settled: ≤ 20s / ≤ 6 taps target; loop unchanged; onboarding faster.*

### ❓ **Q13** — **Money motion: how does the money move?**
Ticket 13 says motion carries meaning. Today the figures jump and the cascade is a sentence. How does money move on screen, accessibly?

➡️ **Two motions, both decoration, both text-backed, both reduced-motion-gated:** (1) **Flash** — the changed figure (HUD net worth, cash, close lines) gets a one-shot background flash of the accent wash in the direction of the change; **no count-up animation** (a counting number would spam screen readers and add a timer-like object); (2) **Cascade trail** — when a Choice draws on Save or Debt, one short one-shot visual of the Save envelope draining and the Debt marker lighting, beside the existing cascade sentence. Motion may never be the only carrier: the sentence is the meaning.
*Settled: flash + cascade trail; no count-up; reduced-motion-gated.*

### ❓ **Q14** — **Decision weight and honest uncertainty**
Where does tension come from, if not from hidden costs or fake randomness?

➡️ **From what is true:** cost chips stay honest (costs visible, outcomes hidden — ticket 03); Risk Moments keep showing odds; shocks keep being shocks. Add **one** honest uncertainty device already sanctioned by the schema: a card may say what is *unknown* ("The bill comes next month; the amount depends on what the month does") without inventing odds. Never make a chip lie, never hide a cost to manufacture drama, and never reward guessing.
*Settled: honest chips kept; odds kept; no manufactured uncertainty.*

### ❓ **Q15** — **The month close: from accounting table to receipt**
`ResolveStep` is a six-line table. It is the moment cause and effect becomes legible — and it reads like a bank statement. What changes?

➡️ **Keep the table, add three things above and inside it:** (1) an in-voice **headline line** ("You earned ◈80 and the month took ◈52 of it."); (2) a **Debt line** whenever Debt is non-zero — the balance and whether it moved this month (money is live, so this is allowed; it is not a behavioural metric); (3) the existing Milestone line and the existing focus-the-heading behaviour stay exactly. Nothing here may become actable: it reports.
*Settled: receipt + debt line; table and focus unchanged.*

### ❓ **Q16** — **Shocks and the insurance payoff**
Shocks are the drama; insurance is the decision that pays off months later. Today a shock looks like every other card and the cover is invisible when it works. What changes?

➡️ **Two things:** (1) the **shock kind gets its own beat** — the one new illustration (Q26) plus a distinct typographic treatment (Q19) and the `deal` motion, so "Out of nowhere" is felt; (2) the **covered moment** — when a Choice's `insuredCost` is applied because the player holds insurance, the Reaction is a dedicated one ("Covered. Those ◈6 months just bought themselves back.") and the cascade line shows the cover absorbing the cost. That is the payoff of a decision made months earlier, and the game currently never celebrates it.
*Settled: shock beat + covered Reaction.*

### ❓ **Q17** — **Failure and recovery feel**
The design promise is "real consequences, always recoverable". Today a mistake costs money and shows a red number; recovery is invisible. How does failure feel?

➡️ **Never punitive, always legible, never coached.** The debt line (Q15) names the hole and its direction; the Shortfall Warning keeps naming where the gap lands; the year's review shows the hole closing (or not). Add **no** advice and **no** recovery mechanic — recoverability is a property of the economy, and the game shows it rather than promising it. The one addition is tonal: the Reaction after a bad outcome is a fact, never a shrug, and the Turning Points in the Money Story remain the honest narration.
*Settled: legible, not punitive; no advice, no new mechanics.*

---

## Round 4 — Variety, stakes, arcs

### ❓ **Q18** — **The calendar: does the game have a year, or only a counter?**
Months are `1..60`. A teen life is shaped by terms, summers, exams and birthdays. Is a calendar texture added, and how is it derived?

➡️ **Yes, presentation-only and derived from `run.month`.** Month 1 = September, so the school year and the Stage boundaries line up (13, 25, 37, 49 are Septembers; the Fork opens the final school year). The HUD kicker becomes *"Month 17 of 60 · January"* (progress kept, season added); spine cards gain one seasonal line in the situation, and the close can name the month. Twelve month names ×3 locales; no new state, no new art. No weather systems, no seasonal mechanics.
*Settled: September start, month names in the HUD and on spine cards; derived only.*

### ❓ **Q19** — **Card-kind identity: how do the five kinds look different?**
`decision`, `shock`, `risk_moment`, `scam`, `stage_up` currently differ only in a small kicker label. Should they look different?

➡️ **Yes, typographically, never by colour.** Each kind gets a recognisable *layout*: shock = the kicker and situation set against a top rule with tighter leading and the new beat; scam = the situation framed as a message ("who is asking?"), with the sender line given weight; risk_moment = the odds line promoted above the situation; decision = the current plain card; stage_up = the current banner. All five remain text-first, all remain legible in greyscale, none uses the accent except where money is meant. No new illustrations beyond the shock beat (Q26).
*Settled: kind identity by type and layout; colour never load-bearing.*

### ❓ **Q20** — **Social pressure as a recurring theme**
The research is blunt: PISA 2022 finds ~60% of 15-year-olds bought something *because their friends had it*, and recommends modelling the social pressure of the teen years as a recurring theme, not a single card. Does the deck do this?

➡️ **No — it has a handful of social situations and no recurrence. Add 4–6 cards and a cast rule:** the group plan that costs more than the Want envelope; the trip everyone is paying for; the birthday you can't show up empty-handed to; the friend's scheme that is "basically an investment"; the family month where money is tight at home. Each has a real social cost (time, a friendship, being left out) and a real money cost, and each is cast-led. No card preaches about peer pressure; the choices carry it.
*Settled: 4–6 social-pressure cards, cast-led.*

### ❓ **Q21** — **Threads: the consequence engine**
Threads are the best fun device the game has — a choice that returns — and there are exactly three (`course_enrolled`, `friend_loan`, `risky_tip`), one live at a time, with a chip in the HUD and history in the Stats Sheet. Do we add more, and do we allow two live at once?

➡️ **More Threads, still one live at a time.** The one-live rule is legibility, not a limitation to fix; a teen holding two dangling consequences is worse play, not richer. Add **2–3** new Threads, all consequences of the audit and the new content: the trip balance due (Q33), the trainers' drop date, the balance that follows a minimum payment (Q33), and name each one after its person in the chip ("Danny's app — payout in 2 months"). Threads are where "decisions have consequences" stops being copy and becomes a structural promise: every Run should have at least two returns.
*Settled: one live Thread kept; 2–3 new, named ones.*

### ❓ **Q22** — **The villain moment**
The gamification runs carried a settled decision — *"the 'play the villain' card (Shady Sam-style) → out of scope for this layer"* — and the prior-art research called playing the villain the strongest anti-moralising device in the catalogue. Does this layer reopen it?

➡️ **Yes — one moment, as content, and it is the one new thing with a real moral test.** In Stage 4, the shop app offers the player a **referral bonus to bring friends into the BNPL plan** ("Bring three friends, get ◈60"). Taking it pays real money and plants a Thread: the friend's first instalment, which lands badly and offers a second choice (help them out, or let it be). Declining pays nothing and costs a little social capital. Nobody is told off; the mechanism is felt from the inside; the copy shows the terms honestly. Rules: no shaming either way, the friend is never a punchline, the consequence is recoverable, the card is **playtest-gated and cuttable**. ADR-0002 records the reopening and its boundaries.
*Settled: ship one referral moment; ADR-0002; playtest-gated.*

### ❓ **Q23** — **Run-to-run variation without new state**
Runs already vary by the 25-card surplus, the seed and the path. Is that enough for a second Run to feel different, or is more needed?

➡️ **Enough for v1.1 — variety comes from content and story, not from a modifier system.** The second Run is different because: the other Fork path story; the Concepts the Journal says are unmet (already shipped); the cast and the new Threads; and a different draw. **Defer** seed-derived opening textures (a family circumstance or town keyed to the seed): it multiplies copy by seeds, and the fiction must not assert mechanics that do not exist. **Refuse**, permanently: challenge modifiers, difficulty settings, "hard mode", score multipliers, same-seed UI, and any two-run ranking. The authored ending and the fixed 60 months are what make Runs comparable at all.
*Settled: no new variation system; story + path + Journal carry replay.*

### ❓ **Q24** — **The Fund: wire it, or leave the investing cards as theatre?**
Ticket 01 specifies a Fund at ~7%/yr and a scripted crash; the build shows the Fund in the Stats Sheet and `netWorth` counts it, but nothing ever adds to it, so `the_fund`/`the_crash`/`boring_fund` are theatre and `the_fund`'s "put some in" destroys money. Ticket 01's promise is unfulfilled; the gamification runs explicitly parked it ("a separate, larger decision"). Do we take it?

➡️ **Yes — as a bounded, deterministic Stage-5 story beat, because it is the single biggest "show, don't tell" fix available.** Scope, exactly: `Choice` gains `invest?: number` (money moved into the Fund, **blocked when not affordable** — you cannot invest money you do not have, unlike spending which cascades) and `sets.sellFund` (the whole Fund back to Savings); `closeMonth` grows the Fund at 7%/yr; the Spine gives the Fund its guaranteed opening at **month 52**, so every Run invests before the crash, which lands at **month 55** (−25%, then a scripted +10%/month for months 56–58, then normal); `netWorth` already counts it; nothing new is persisted; the Fund is only reachable in Stage 5, so the balance impact is small and the drama is large. `the_fund`, `boring_fund` and `the_crash` are rewired to it; the crash's three choices (buy more / hold / sell) finally mean something. Re-check the Outcome Band thresholds after implementation; add no Fund-based Milestone in this layer.
*Settled: wire the Fund, spine it at 52, crash at 55 with recovery; ADR-0003.*

---

## Round 5 — Presentation and production

### ❓ **Q25** — **The intro: three lecture screens, or a cold open?**
`Intro.svelte` runs three screens that state who you are, the goal and how a month works, in a teaching register (*"Money you do not spend is the only money you keep."*). Replace it?

➡️ **Yes: a 20-second cold open.** One screen, one scene: *"You are 14."* / Mum's exact line: *"◈40 a month. No top-ups."* / one line of loop: *"You decide where it goes before the month does."* — then **Start month 1** drops the player into the Plan step, and the Spine's first card (the allowance conversation) teaches. Keep, on that screen: the privacy line, the language switcher, and — new — the **sound toggle** (one-time, no nag). The goal statement moves into the HUD's existing goal block; no tutorial, no paging dots.
*Settled: cold open; privacy/language/sound kept or surfaced; goal moved to the HUD.*

### ❓ **Q26** — **The art plan, under a one-author budget**
Ticket 13 fixed "beats only, ~10 illustrations"; `docs/art-audio.md` says the ten have never been seen by a person with a pen and flags a human pass. What does "more attractive" mean here?

➡️ **Keep beats-only, spend the budget in this order:** (1) a **human art pass** on the ten existing pieces (line weight, composition at 320/390/430px), which is already flagged as owed and is the cheapest attractiveness win; (2) **exactly one new beat**, the shock (Q16), because every Run has shocks and no shock has ever had a picture; (3) the avatar gets more presence — shown larger on the Stage-up beside the Year in Review (the component exists; no new art). Nothing per-card, no new visual language, no mascots, no baked-in text, the Journal keeps reusing the Money Story panel. Any further illustration is the owner's call, not this layer's.
*Settled: human pass + one shock beat + avatar presence; beats-only kept.*

### ❓ **Q27** — **The motion vocabulary**
Today: a 280ms page rise, a goal-tick pulse, a milestone ease-in. That is all. What is the full motion language?

➡️ **Four named motions, each carrying meaning, each one-shot, each reduced-motion-gated, each with a text twin:** **deal** (a new card arrives — the phase change already animates; the shock gets a beat), **flash** (a changed figure — Q13), **cascade** (Save drains, Debt lights — Q13), **settle** (the close's lines land in order, once). No motion loops, no parallax, no idle animation, no timers. `app.css` gains the two new keyframes beside the existing ones; `docs/art-audio.md`'s motion note is updated.
*Settled: four one-shot motions; no loops; all gated.*

### ❓ **Q28** — **Sound**
`sfx.ts` synthesises five cues; off by default; never load-bearing; the milestone cue fuses the close's ticks. Add cues, or leave it?

➡️ **No new cues in v1.1.** The bank covers the beats, and off-by-default sound cannot carry "attractive". The one change is discovery: the toggle is surfaced at the cold open (Q25). A sound-design pass (more cues, a light music bed) is a v2 proposal with evidence that players turn it on.
*Settled: no new cues; toggle surfaced.*

### ❓ **Q29** — **Type, colour, and the avatar**
The identity is "The Statement": warm paper, one accent reserved for money, DM Mono figures, Bricolage Grotesque display. Does "more attractive" change any of it?

➡️ **No change to the identity — it is distinctive and already contrast-checked.** Two uses of what exists: (1) use the display face's weight range more expressively at hero moments (the net-worth figure, the Year in Review headline, the close headline) — no new fonts; (2) keep the accent meaning money only; **no stage hues, no per-kind colours**. Any new tint introduced by the motion/flash work gets the ticket-14 treatment: contrast-checked before it ships.
*Settled: identity kept; type emphasised; no new colour semantics.*

---

## Round 6 — Payoff, replay, learning

### ❓ **Q30** — **The Money Story's new reveals**
The Money Story is five parts, story-first, with the compact seven and you-vs-you. It is good and it is the only payoff. What does this layer add, deriving everything from the record?

➡️ **Four derived additions, inside the existing order:**
1. **"The bank paid you ◈X"** — total interest credited across the Run, split so the compounding is visible ("◈X of it in year five alone"). The record already has `MonthSnapshot.interest`; the story currently never mentions it. This is the savings lesson's payoff, finally shown rather than explained.
2. **Choice Tally** — 3–5 prose facts counted from the log: *"You walked it instead of replacing the pass seven times."* *"You packed lunch fourteen times."* *"You checked before you trusted, three times."* A new pure module over `log`; no storage; per-Run only, never compared across Runs; no judgement, no target.
3. **Chapter Title** — one authored title chosen from the Run's own story (flags, Milestones, band), e.g. *The Balance That Followed*, *The Year the Market Fell*, *The Ones You Saw Coming*, *Five Ordinary Years*. Titles are story-led, never band labels, never ranked.
4. **The Other Path** — an authored portrait of the Fork's unchosen branch in "What next", so the second Run has a face before it starts. No simulation is claimed.
*Settled: the four reveals above; all derived.*

### ❓ **Q31** — **The Journal as a storybook**
The Journal shipped as Chapters (band, turning points, Milestones, seed, date) plus coverage and collected Milestones. What changes?

➡️ **Warm the copy and add the story layer:** each Chapter shows its **Title** and its **cast list** (derived from the log, no storage), the Choice Tally of that chapter, and the existing band/turning points/Milestones; the across-Run coverage uses the new display words (Seen/Lived/Later); the empty state stays honest. Still chronological, still private, still never shareable, still derived from the archive so export/delete/retention already cover it.
*Settled: titles + cast + tallies per chapter; no ranking, no share.*

### ❓ **Q32** — **How learning is carried by fun rather than by lecturing**
State the mechanism so the layer cannot drift back into a course.

➡️ **Four carriers, in order of strength:** (1) **consequence** — the numbers move, the Threads return, the crash bites (Q21, Q24, Q33); (2) **the first encounter** — one Rule of Thumb at one Teachable Moment, in the Why, at the card that made it real (Q7, Q10); (3) **retrospective recognition** — the Year in Review, the tally, the titles (the gamification layer, extended); (4) **the world's reaction** — the cast, in voice (Q9). Explicitly: no quizzes, no comprehension checks, no lessons outside a Why, no live behavioural metric, and the Better-Choices Proof untouched. A player who never opens a Why still gets taught by the money.
*Settled: the four carriers; the Proof is untouched.*

### ❓ **Q33** — **The honesty audit of the deck, and the credit model's v2 gap**
Q1's fact 2 found saving choices that destroy money, a Fund that does not fund, and card copy that asserts interest the model never charges. Fix now or defer?

➡️ **Fix the phantom money in v1.1; defer the card balance to v2 with a named sketch.**
- **v1.1, content-level (the pattern):** a Choice may never *withdraw* while promising to *set aside*. Where the fiction is "commit", the choice costs **0** (or Free Time) and the commitment is carried by a **Thread** when the fiction has a deadline (`trip_deposit` → the trip balance due in 2 months; `hype_trainers` → the drop), or by a log tag for the Choice Tally when it does not (`savings_goal`, `savings_milestone`, `interest_first`, `quarterly_interest`). Deposit habits stay real in the Plan, where the Save envelope already works. Audit list: `interest_first.more`, `quarterly_interest.leave`, `savings_milestone.add`, `savings_goal.bike`, `hype_trainers.save`, `trip_deposit.deposit`, plus any other `cost` on `category: 'save'` whose copy promises growth.
- **v1.1, mechanic-level:** the Fund wiring (Q24) and the minimum payment becoming a real six-month **instalment plan** using the existing recurring-payment state (small typed extension: the state already carries `{amount, monthsLeft}`; the hardcoded `amount: 30` becomes per-choice), so *"the minimum keeps the balance alive"* is finally lived, the HUD chip generalises from "BNPL" to "Repayment", and `instalment_week` can fire after a minimum month.
- **v2, a named economy ticket ("Living Money") — not in this layer:** a real card balance with APR 19.9%/mo interest and a 5% minimum; a `deposit` verb and a `deposited` history field so card deposits count toward the savings-rate measure; and the consequential tuning. Sketch only, with its own ADR when it is taken.
ADR-0003 records the boundary and the copy rule: **the fiction may not assert a mechanic the loop does not run.**
*Settled: fix phantom saving + Fund + minimum-payment plan in v1.1; card balance is a named v2 item; ADR-0003.*

### ❓ **Q34** — **What we refuse, even though it would be fun**
The layer will be judged by what it declines as much as by what it ships. What is refused?

➡️ **Refused for this layer (and for the foreseeable roadmap unless re-decided):** same-seed replay UI (deferred with the gamification layer; revisit on playtest evidence) · Personal Bests and any cross-Run aggregate (deferred) · challenge/difficulty modifiers · shareable chapters or anything screenshot-facilitated (privacy posture) · push notifications and any return-pressure mechanic · a profile home screen (the Money Story's "What next" stays the hub) · cosmetics and avatar tints (v2) · player naming (personal data) · a "Fork reversal" or second chances (the Fork is the one irreversible choice, and that is its drama) · more than one live Thread · a second score of any kind.
*Settled: the refusal list above.*

---

## Round 7 — Craft, verification, sequence

### ❓ **Q35** — **i18n: the translation plan for a full voice rewrite**
The rewrite touches ~190 strings ×3 locales, renames ~190 keys, adds ~30 new ones and 4–8 cards. How is it managed without breaking the gates or reading as translated English?

➡️ **Wave-by-wave, with a style brief and an adaptation rule.** `docs/voice.md` gains a per-locale translation brief; translators **adapt, not translate** (idiom, names of places, the register of a mum's line); rules of thumb are translated as rules, not quoted; cast names stay identical; the key rename is one mechanical migration (code + catalogues together; no player data involved); every wave ships only when the three catalogues pass parity. The already-owed **Fink human pass** covers the new copy, and is the gate for tone in it/ro.
*Settled: three waves + style brief; adapt, don't translate; Fink pass.*

### ❓ **Q36** — **Accessibility: what the new surfaces must prove**
The gates are axe over eleven screens + reflow/keyboard proxies + Lighthouse ≥ 0.95, plus four human passes. What must the new work respect?

➡️ **The Why is a real disclosure** (a button with `aria-expanded`/`aria-controls`, keyboard-operable, never a hover or a tooltip), and the auto-open at a Teachable Moment is plain rendering, not a toggle. **No count-up numbers** (Q13). **Card-kind identity is type/layout only** and must survive greyscale and 200% text. **No timers** anywhere in the new motions. **Reactions are polite, text-carried, never auto-dismissed.** The a11y seed and axe screens gain the new states (a Why open, the covered Reaction, the debt line, a Chapter with a title and cast, the cold open), and no `exclude` is added. The four manual passes are extended to cover the new blocks.
*Settled: disclosure semantics; no count-up; gates extended; no excludes.*

### ❓ **Q37** — **Privacy and data: what, if anything, is added?**
The posture is "a random id and the game state it points at — nothing else". Does this layer change it?

➡️ **No new data of any kind.** The cast are authored constants, not player records; the Title, the Choice Tally and the cast list are derived at render time from the archive; nothing is collected, logged or sent; the Journal remains the archive view, so export, delete and the 12-month sweep cover everything already. The privacy page's wording gains a **surface** note (the story layers), not a data-class note.
*Settled: nothing new collected or stored; surface note only.*

### ❓ **Q38** — **Verification and the fun playtest protocol**
Fun is not testable by CI, and the project has no telemetry by design. How does this layer know it worked?

➡️ **Three rings.** (1) **Unit tests:** the new pure derivations (first-encounter detection, Choice Tally counts, Chapter Title precedence, the Fund maths, the revised card effects), plus updated deck/economy tests; the existing regression that the Year in Review never renders mid-month. (2) **Gates:** `pnpm verify` (check · test · i18n · a11y) with the extended seed/screens. (3) **A human playtest protocol (owed), with fun-specific questions, no telemetry:** time and taps per month; did you laugh or smile at any Reaction (which); did you open any Why, and did you skip it after the first encounter; did anything feel like being told off; could you retell one consequence that came back (a Thread); did you start a second Run, and why; would you describe it to a friend as a game or as a lesson. 5–8 players aged 14–18 if reachable; failures are filed as issues, exactly like the manual a11y passes.
*Settled: unit + gates + an owed fun playtest protocol.*

### ❓ **Q39** — **Risks, mitigations, and the additive sequence**
What can go wrong, and what order does the work ship in, building on the gamification layer that just landed?

➡️ **Risks:** *tone* (humour that lands as cringe; mitigated by the pilot wave, a style guide, and the ability to fall back to plain warmth — never to lecture); *translation cost blowout* (mitigated by adaptation briefs, string budgets and the three waves); *lesson invisibility* if no one opens a Why (mitigated by the first-encounter auto-open, the carriers in Q32, and the playtest question); *the villain card misfiring* (mitigated by ADR-0002's boundaries and the cuttable card); *scope creep into the economy* (mitigated by ADR-0003's boundary and the named v2 list); *over-familiarity* if a cast member grates (mitigated by ≤3 appearances, one line each, and the ability to reduce a character to a name in the deck); *attractiveness under-delivery* if the art pass slips (mitigated because the type/motion/calendar work is independent of it).
**Sequence (each independently landable, dependency-ordered):**
1. **Voice architecture** — this run's docs, `docs/voice.md`, ADRs, the Reaction/Why key migration, the first-encounter helper. No copy sweep yet.
2. **Pilot wave** — cold open + Stage 1–2 copy + display vocabulary + the close receipt; playtest the pilot (human-owed) before the rest.
3. **Cast & Threads with faces** — cast bible, the social-pressure cards, the new Threads, the covered Reaction.
4. **Presentation** — calendar, kind identity, the four motions, the shock beat, the art pass, the avatar at Stage-ups.
5. **The money tells the truth** — the audit fixes, the Fund wiring, the minimum-payment plan; retune check.
6. **Payoff & Journal** — the four Money Story reveals, the Journal storybook.
7. **Copy waves 2–3 + translation + Fink** — Stages 3–5 and the full ×3 pass.
8. **The referral moment** — last, playtest-gated; then the fun playtest and the v2 list.
*Settled: the risks and the sequence above.*

---

## Frontier — empty

Every branch of the design tree below has been visited and settled above; nothing is left silently assumed. The design tree, and the settled answer at each node:

```
Make the game more fun, more attractive, less like a teaching class
├── Framing & diagnosis
│   ├── Destination ................................. Q1  · additive v1.1 Feel layer; no economy rebuild
│   ├── What "fun" means ............................ Q2  · returning consequence · talking world · retrospective mastery · wit
│   ├── Classroom diagnosis (ranked) ................ Q3  · maxims → untruthful numbers → curriculum words → nobody in it → static form → intro
│   ├── Guardrails kept / reopened .................. Q4  · 3 reopenings, with ADRs
│   └── Forbidden list & non-goals .................. Q5
├── Voice
│   ├── Feedback → Reaction + Why ................... Q6  · ADR-0001
│   ├── Taught once, trusted after .................. Q7
│   ├── Register & banned moves ..................... Q8  · docs/voice.md
│   ├── The Cast .................................... Q9  · five recurring; Threads get faces
│   ├── Maxim audit + 8 Rules of Thumb .............. Q10 · three waves
│   └── Display vocabulary .......................... Q11 · internal terms unchanged
├── Play feel
│   ├── Pacing ...................................... Q12 · ≤20s a month; loop kept
│   ├── Money motion ................................ Q13 · flash + cascade trail; no count-up
│   ├── Decision weight ............................. Q14 · honest chips, odds kept
│   ├── Month close as a receipt .................... Q15 · headline + debt line
│   ├── Shocks & the covered moment ................. Q16
│   └── Failure & recovery .......................... Q17 · legible, not punitive
├── Variety, stakes, arcs
│   ├── Calendar & school-year rhythm ............... Q18 · September start
│   ├── Card-kind identity .......................... Q19 · type, never colour
│   ├── Social pressure ............................. Q20 · 4–6 cards, cast-led
│   ├── Threads with faces .......................... Q21 · one live kept; 2–3 new
│   ├── The villain moment .......................... Q22 · ADR-0002; playtest-gated
│   ├── Run variation ............................... Q23 · story, not modifiers
│   └── The Fund .................................... Q24 · wired; spine 52; crash 55
├── Presentation & production
│   ├── Cold open ................................... Q25
│   ├── Art ......................................... Q26 · human pass + one shock beat
│   ├── Motion vocabulary ........................... Q27 · deal · flash · cascade · settle
│   ├── Sound ....................................... Q28 · no new cues; toggle surfaced
│   └── Type, colour, avatar ........................ Q29 · identity kept
├── Payoff, replay, learning
│   ├── Money Story reveals ......................... Q30 · bank-paid-you · Choice Tally · Title · Other Path
│   ├── Journal as storybook ........................ Q31
│   ├── Learning carried by fun ..................... Q32 · four carriers; Proof untouched
│   ├── Honesty audit + credit v2 gap ............... Q33 · ADR-0003
│   └── Refusals .................................... Q34
└── Craft, verification, sequence
    ├── i18n & translation ........................... Q35 · three waves; adapt; Fink
    ├── Accessibility ................................ Q36 · disclosure; no count-up; gates extended
    ├── Privacy ...................................... Q37 · nothing new
    ├── Verification & the fun playtest ............... Q38
    └── Risks & sequence ............................. Q39
```

**Open items, all settled with a recommended answer, none silently assumed:** none remain in this run. The four carried-over deferrals (cosmetics, a profile home, the villain card, Milestones-as-data) were re-examined: cosmetics and the profile home stay deferred (Q5/Q34); the villain card is **reopened** for one content moment (Q22, ADR-0002); Milestones-as-data stays code + catalogue (the catalogue grows by at most one optional Fund recognition).

**Design docs produced by this run:** `CONTEXT-delta.md` (proposed glossary additions + the display-vocabulary map), `adr/0001-taught-once-trusted-after.md`, `adr/0002-one-villain-moment.md`, `adr/0003-fiction-may-not-outrun-the-money-model.md`, `FINAL-DESIGN.md` (the settled design, guardrails, sequence and risks).
