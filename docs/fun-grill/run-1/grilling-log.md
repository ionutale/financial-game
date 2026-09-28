# Fun & framing grilling — run 1

**Ask:** *"I want to improve the game even more, make it more fun, more attractive, and make it feel
less like a teaching class and more like having a good time and fun."*

**Mode:** non-interactive. There is no human to interview, so every frontier question is settled
immediately with this run's own **recommended** answer (➡️). That recommendation *is* the answer for
this run. Nothing is left silently assumed; every decision is written down, and the frontier is
recomputed after each round until it is empty.

**Repo:** `/Users/ionutale/games-development/financial-game` — a SvelteKit 5 "Financial Life-Sim" for
teens, mobile-first, en/it/ro, anonymous device-keyed profile, MongoDB Atlas. v1 shipped; the
gamification layer (Milestones, Year in Review, Journal, goal ticks, one milestone cue) shipped
immediately before this pass — commits `345a76a … 1ba5f85`.

**Artifacts (this run only, sandboxed under `docs/fun-grill/run-1/`):**

- `grilling-log.md` (this file) — every round, questions + recommended answers
- `CONTEXT-delta.md` — proposed glossary terms, sandboxed
- `adr/0001-card-formats-are-presentation-mapped-outside-the-deck.md`
- `adr/0002-play-the-villain-cards-are-admitted.md`
- `FINAL-DESIGN.md` — the settled design

**Constraint:** design/docs only. No game source, `CONTEXT.md`, `docs/adr/`, or `.scratch/` was
touched.

---

## Ground truth established before the grill

Facts are this run's job, not the user's. These were read from the code and docs, not assumed.

- **The game is already a game, and a deliberately un-classroom one in places.** The deck copy is
  irreverent and non-moralising throughout (`messages/en.json`: "The boring one — and it was cheaper.
  That is not a sacrifice, it is a trade"; "The game will not tell you that was wrong — you will find
  out"). `research/08-prior-art.md` §3 names *irreverence over instruction*, *let the player play the
  villain*, *a character you care about beats a ledger*, and *animate the money on every choice* as
  the devices that make money consequential and fun.
- **The classroom tells are specific and countable.** (1) The intro is three expository screens —
  "You are 14" / "The goal" / "How a month works" (`Intro.svelte`, `intro_screen_*` keys). (2) Every
  Stage-up announces `Unlocks {concepts}` (`StageUp.svelte` line 38, `stage_up_unlocks`). (3) The
  Stats Sheet carries `Concept coverage` with `Introduced / Experienced / Not yet`
  (`StatsSheet.svelte` lines 249–253, `coverage_*` keys), repeated on the Money Story and Journal.
  (4) The Money Story is a report: "Months inside budget 34 / 60", the stacked "You, against you"
  bars, "The numbers" table (`MoneyStory.svelte`). (5) The Plan preset literally is the textbook
  rule: `50 / 30 / 20` (`plan_preset`). (6) The app title is a genre label: `Financial Life-Sim`
  (`app_title`).
- **The moment-to-moment experience is prose-only.** A Choice applies its effect and shows Feedback
  under the choice (`EventStep.svelte` lines 93–110, `aria-live="polite"`), but the money that moved
  is never shown *as a movement*. The HUD (above, off-screen on a phone while reading choices)
  silently re-renders. The research's #1 device — "money must visibly move the moment a choice is
  made" — is missing.
- **The month close repeats 60 times** and is a bank statement: heading, milestone line, hero
  net-worth change, seven rows, over-note, Next month (`ResolveStep.svelte`).
- **Guardrails that stand** (and are *not* the reason the game reads as a class):
  - teaching metrics hidden during a Run — ticket 05, ADRs 0001/0003 (`metrics.ts` header,
    `docs/adr/0003-behavioural-numbers-are-retrospective.md`);
  - no XP/coins/lives/leaderboards — ticket 08, ADR-0001 of the gamification merge;
  - privacy floor: no analytics, no PII, one strictly-necessary cookie — ticket 12, `docs/privacy/`;
  - WCAG 2.2 AA + documented subset, no timers, text-first, reduced-motion, 44px — ticket 14,
    `docs/accessibility.md`;
  - one accent reserved for money, colour never load-bearing, light theme only, ~10 beat
    illustrations, SFX-only off by default — ticket 13, `docs/art-audio.md`;
  - translate-only en/it/ro with a key-parity gate — tickets 07/26, `src/lib/i18n/messages.test.ts`;
  - deterministic seed, pure game modules, no new stored state — `rng.ts`, `loop.ts`, ADR-0002.
- **What just shipped** (build on it, do not re-propose it): `milestones.ts` (12 ids, derived,
  announced in the Month Close), the Year in Review on every Stage-up and the Money Story
  (`stageUpReview`, ADR-0003), Concept Coverage in the Stats Sheet, the Journal route with Chapters,
  goal quarter-ticks, the `milestone` cue. Boundaries recorded in `docs/adr/0001–0003` and
  `.scratch/gamification/design.md` §10: no second visual language, no new art, no music, play-the-
  villain deferred, no toasts.
- **A settled deferral this pass will reopen, explicitly:** `.scratch/gamification/design.md` §10
  records *"the 'play the villain' card → out of scope"* — out of scope *for a recognition layer*.
  This pass reopens it with reasons (ADR-0002).
- **A ticket-04 shape this pass will amend, explicitly:** the three-screen intro (ticket 04's
  "Intro — three screens"). Not a guardrail; a first-impression decision.
- **The story devices the deck already owns:** a scripted spine (`spine.ts`: allowance, phone plan,
  first payslip, BNPL, taxed payslip, first statement, scam, crash), three Threads
  (`threads.ts`: `course_enrolled`, `friend_loan`, `risky_tip`), one live at a time, and the Fork.
  The drama exists; it is under-felt.
- **Gates any change must pass:** `pnpm verify` = svelte-check + Vitest + i18n (three catalogues,
  identical key sets, placeholder agreement, no orphans) + axe/Lighthouse
  (`tests/a11y/screens.spec.ts`, `zoom.spec.ts`), with `docs/accessibility.md` as the manual-pass
  contract.

---

## Round 1 — Intent, guardrails, and what "fun" means here

Frontier: five framing decisions with no prerequisites. Everything else waits on them.

---

❓ **Q1** — **What kind of "fun" is being asked for?** "Fun" could mean at least five different
things, and they cost differently: (a) **craft** — juice, motion, sound, the moment a consequence
lands; (b) **framing/voice** — how the game talks to the player; (c) **variety/form** — how the same
loop feels different month to month; (d) **drama/stakes** — things at risk, things that pay off;
(e) **expression/identity** — my life, my calls. And two things it could mean that the project has
already ruled out: difficulty and competition.

➡️ **Recommended: all five, in the order (b) framing, (a) craft, (c) variety, (d) drama,
(e) expression — and explicitly not difficulty, speed, scores or competition.** The diagnosis behind
that order: the economy and the loop are already sound and studied; what makes the game feel like a
class is **how it frames itself and how it shows consequence**, not what it asks the player to do.
Concretely, the work order (Q5) is: the intro slide deck, the "Unlocks {concepts}" line, the
curriculum words on the coverage surfaces, the prose-only consequence, the report-shaped endings,
and the genre-label title. The governing sentence for the whole pass: *the same sixty months, told
better.*

---

❓ **Q2** — **Does this pass reopen the hidden-metrics rule or the reward-economy fence?** A "more
fun" pass is the classic moment someone proposes a visible score, XP, a combo meter, or a reward.
All three are documented no-s: ticket 05 ("a player who can see a score optimises the score"),
ticket 08 and gamification ADR-0001 (no parallel currency), ADR-0003 (behavioural numbers are
retrospective).

➡️ **Recommended: no — reaffirmed, not reopened.** Fun comes from tension, agency, momentum,
surprise and craft; none requires a number the player can optimise. The pass may make *consequence*
more legible (money moved, Q12) because balances are already live in the HUD and are not a
competence score — but it adds no new meter, no streak, no multiplier, and nothing competence-shaped
appears mid-Run. The shipped gamification boundaries hold verbatim.

---

❓ **Q3** — **Which settled scope decisions *are* deliberately reopened?** The grill's job is to
surface the tension between the ask and the record, not to ignore it.

➡️ **Recommended: exactly two, each with a reasoned note, the first of them an ADR.**

1. **Play-the-villain cards — reopened** (Q22, ADR-0002). The gamification merge deferred them as
   out of scope *for a recognition layer*; the MVP's own prior-art research calls them "the strongest
   anti-moralising device in the catalogue" (`research/08-prior-art.md` §3.6), and the ask is
   precisely about feeling less lectured.
2. **The three-screen intro — amended** (Q7). Ticket 04 chose "three screens, no tutorial"; the
   three screens are the game's first classroom tell. The amendment: a cold open plus a contextual
   first-month hint, i.e. *more* "no tutorial", not less.

Everything else stays closed: no new art (the one-author budget stands; variety comes from formats,
not drawings), no music, no second accent, no dark mode, no analytics, no accounts, no timers, no
shortened Run.

---

❓ **Q4** — **What is the success criterion for "more fun", given no analytics?** There is no
telemetry and never will be (ticket 12), so "fun" cannot be measured — only observed.

➡️ **Recommended: a playtest protocol as the instrument, with seven observable outcomes and no data
collected.** 5–8 players aged 13–18, one sitting each, moderator notes only, no recording, no
survey. The design has succeeded when, unprompted: (a) players reach month 60; (b) each recounts at
least one concrete moment from their Run ("the month I lent him the money"); (c) at least one choice
is described in terms of how it felt, not what it scored; (d) players read the Money Story's numbers
without being asked; (e) each names one thing they would do differently; (f) at least one starts a
second Run; and (g) **nobody describes the game as a course, a lesson, a quiz or homework.** (g) is
the "less like a class" test stated as a fail condition. The counter-metrics: the words "unlock",
"level", "homework" in participant language. Honest limit recorded: n is tiny, self-selected,
self-reported — the playtest finds *problems*, it does not prove *effects*.

---

❓ **Q5** — **What is the work order, and what is fenced off?** Without an order, "more fun" becomes
a wish list.

➡️ **Recommended work order** (the classroom tells, ranked by harm):

| # | Tell | Fix | Where |
|---|---|---|---|
| 1 | Three expository intro screens | Cold open + first-month hint | Q7 |
| 2 | `Unlocks {concepts}` on every Stage-up | Authored year beat | Q8 |
| 3 | Curriculum words on coverage surfaces | Rewrite player-facing words | Q9 |
| 4 | Prose-only consequence (no visible money move) | Ledger Line | Q12 |
| 5 | Bank-statement close, 60× | Receipt beat | Q14 |
| 6 | Report-card ending | Keep the proof, reframe the telling | Q30 |
| 7 | Genre-label title | Working title | Q11 |

**Fenced off (non-goals):** economy, deck rules/draw, RNG, `computeMetrics`/`outcomeBand`, storage/
export/retention, privacy posture, accounts/social, timers/dailies/push, purchases, new art files,
new personal data. The pass may touch: catalogue copy, presentation components, one presentation map
module, one SFX cue, one deck-content addition (villain cards, Q22), one derived field on the game
route's loader (Q27), and docs/gates.

---

❓ **Q6** — **What single rule keeps learning carried by fun rather than by lecturing?** The game
already has one governing reveal rule ("Honest-reveal rule", CONTEXT.md) and one voice precedent
("The game will not tell you that was wrong"). A fun pass needs the same kind of hard rule for
teaching, or new surfaces will drift into explaining.

➡️ **Recommended: adopt the Watch-it-happen rule as the pass's north star — every Concept is taught
by a consequence the player watched happen in the fiction; never by a definition, a quiz or an
instruction.** Two supporting principles: *the fiction is the interface* (a card can be a message, a
payslip, a receipt — not a worksheet) and *juice confirms, never carries* (motion and sound may only
emphasise words that already carry the meaning). Both go into the glossary delta (CONTEXT-delta.md).

---

**Frontier after Round 1:** the definition of fun, the guardrail stance, the two explicit
reopenings, the success instrument, the work order and the governing rule are fixed. This unblocks
framing and voice, which is where the answer starts.

---

## Round 2 — Framing and voice: less like a class

Frontier: what the game says and how it says it — the cheapest and highest-leverage half of the ask.

---

❓ **Q7** — **The intro is three expository screens. What replaces it?** It is the first thing a
player sees and it reads like a slide deck: "You are 14" / "The goal" / "How a month works"
(`Intro.svelte`). Ticket 04 chose three screens to avoid a tutorial; the screens became the tutorial.

➡️ **Recommended: a single Cold Open scene, and move "how a month works" to where it is needed.**
The cold open keeps the one great sentence the game owns ("You have ◈60 and a roof you do not pay
for…") on a single screen with the goal as one line ("By 19 you're aiming at ◈4,000 — money you
don't spend.") and the existing Start button, privacy line and language switcher. The third screen's
content becomes a **first-month Plan hint** shown while `month === 1 && history.length === 0` —
exactly the Wage Hint pattern (ticket 17), derived, no new state, gone forever after month 1 closes.
Result: one screen instead of three, and the loop explained at the moment of doing it.

---

❓ **Q8** — **Every Stage-up announces a syllabus: `Unlocks {concepts}`. What replaces it?** This is
the most classroom-looking string in the game (`StageUp.svelte`; ticket 02 wants the Concept and its
Teachable Moment announced at each Stage). Replacing it wholesale would lose the game's learning
transparency; keeping it keeps the lecture.

➡️ **Recommended: replace the list with an authored Year Beat per Stage — one in-fiction line that
names the moment, not the curriculum** (illustrative: Stage 3 — "The allowance stops. This year,
hours are the money."; Stage 5 — "School is over. Study, or start working."). Five catalogue keys,
written in the voice bible (Q10). The Concept's plain words move to the retrospective coverage
surfaces, where they read as *what you met*, not as a module list. This amends ticket 02's
presentation, not its model: every Concept is still unlocked on the ladder and still Experienced in
the coverage record. The Stage-up keeps the Year in Review block (shipped) and gains the character
at the year's age (Q18).

---

❓ **Q9** — **Concept Coverage reads as a curriculum tracker: "Concept coverage" /
"Introduced / Experienced / Not yet".** It shipped as gamification's learning-payoff surface (Stats
Sheet, Money Story, Journal). Deleting it would undo a deliberate device; keeping the words keeps
the curriculum feeling.

➡️ **Recommended: keep the model, rewrite the player-facing words.** Sections: "What money has shown
you" (Stats), "What the five years showed you" (Money Story), "What you've met" (Journal) — states
in plain language: *met* / *coming up* / *later*. The domain terms (Concept, Concept Coverage,
Introduced, Experienced) stay unchanged in code, CONTEXT and the internal vocabulary; this is a copy
decision, recorded in CONTEXT-delta.md as a note, not a new term. The locked-row convention (no
spoilers, a bare "later") stays.

---

❓ **Q10** — **Is the tone of voice a preference or a rule?** The deck's copy is already excellent
and non-moralising, but it is an emergent property of whoever wrote it. A pass that adds surfaces
without a voice rule will drift.

➡️ **Recommended: write the voice down — a Voice Bible (docs), applied to all new copy and to a
scoped pass.** Rules: second person, present tense, concrete nouns, short sentences; dry, deadpan,
on the player's side; the game never sneers at a choice; no exclamation marks, no emoji, no
"Great job!", no ranks; a rule of thumb appears only *after* the consequence, never before; humour
must survive literal translation (no idioms). **Copy-pass scope:** all surface copy (intro,
Stage-ups, Plan labels, month close, Stats, Money Story, Journal, Settings — changed keys only), the
nine spine cards and their feedbacks, the ~11 cards the formats touch (Q21), and the two villain
cards. The remaining pool cards are *not* rewritten — they are already in voice, and 84 cards × 3
locales is translation money spent for no felt gain. The added Fink-pass debt is listed, not hidden.

---

❓ **Q11** — **The app title is a genre label, not a name.** `Financial Life-Sim` is what the tab
says and what every route title ends with. The map still records "Working title, branding, domain
name" as unspecified.

➡️ **Recommended: adopt a short working title, used in the tab title and the Cold Open, with the
descriptive line kept as a subtitle.** Recommendation: **"Leftover"** — it names the game's actual
thesis ("money you do not spend is the only money you keep") and sounds like a game, not a course.
Runner-up: "Money Story" (cohesive with the ending, but reads as a podcast). This is a reversible
brand decision in a handful of catalogue keys, and brand taste belongs to the owner — but a name is
part of being attractive, so the pass should propose one rather than leave the genre label.

---

**Frontier after Round 2:** the game's first impression, its per-year announcement, its coverage
words, its voice and its name are settled. This unblocks the moment-to-moment craft, which is where
"having a good time" actually happens.

---

## Round 3 — Moment-to-moment feel: craft and pacing

Frontier: the loop's felt experience — the consequence moment, the close, the plan, sound, time.

---

❓ **Q12** — **After a Choice, the player reads prose but never sees the money move.** The
research's first principle is "money must visibly move the moment a choice is made". Today the HUD
silently re-renders above (off-screen while reading choices), and the Feedback block
(`EventStep.svelte` 93–110) is text. The single biggest craft gap.

➡️ **Recommended: a Ledger Line — the applied movement, inside the Feedback block.** After a Choice,
show a compact one-line account of what actually moved: the changed entries only (Cash, Save
envelope, Debt, Free time — later Fund), with signs and figures, e.g. `Cash +◈80 · Free time −14h`,
or `Save −◈20 · Debt +◈15` when the cascade bites. **Derivation: computed at the Month Screen edge
from the previous and next `RunState` the reducer already returns** — no new field, no economy
recomputation, automatically truthful for insurance, cascade and Threads. It joins the existing
`aria-live="polite"` Feedback region, so it is announced once, after the choice; colour is supported
by the sign and the words. This is the one change most likely to make the game feel like a game.

---

❓ **Q13** — **How much motion and "juice" is allowed?** Ticket 13's discipline is "motion carries
meaning and nothing else"; the gamification layer added two reduced-motion-gated emphases and one
cue. "More attractive" tempts confetti, counters, delays and celebrations.

➡️ **Recommended: keep the discipline and spend the budget on precision.** Allowed: one-shot
emphases, `prefers-reduced-motion` gated (the Ledger Line gets the existing `.milestone-land`
pattern; the goal ticks and milestone line stay); the five-year strip (Q18) fills with the existing
bar transition; the month close's headline eases in with `.rise`. Not allowed: counting/rolling
numbers (text that changes while being read breaks screen readers and calm), artificial delays before
cards, confetti, parallax, loops, more than two emphases on one screen. "Juice confirms, never
carries."

---

❓ **Q14** — **The month close repeats 60 times and is a bank statement.** It is the game's most
repeated screen: heading, milestone line, hero net-worth change, seven rows, over-note, button
(`ResolveStep.svelte`). It is also where cause and effect must land.

➡️ **Recommended: restyle it as a receipt beat — no figures removed, no folds.** Order: the
headline first ("The month moved you ◈+120", the existing hero change), then the Ledger Line, then
the rows grouped as *In / Out / Next month* (income and interest in; needs, wants, obligations, BNPL
out; next month's obligations as the tail), with the milestone line where it shipped. Same data,
same focus behaviour (heading receives focus, ticket 25), mono figures and dashed rules already fit
the "statement" design language. This shortens the reading of the most repeated screen without
hiding any of the proof.

---

❓ **Q15** — **Does the Plan step change?** It is the game's one strategic verb; the sliders,
`Keep last month` and `50 / 30 / 20` preset already make a month plannable in seconds (ticket 04),
and ticket 17's Shortfall Warning protects the do-nothing case.

➡️ **Recommended: keep the structure; add only the first-month hint (Q7).** No new presets (the
`50 / 30 / 20` label stays — it is a tool, not a lecture), no default-plan change, no drag
interactions (a11y), no "smart" suggestions. One micro-edit only: the first-month hint uses the
existing Wage-Hint visual pattern.

---

❓ **Q16** — **Sound: extend or leave alone?** The bank is five synthesised cues, off by default,
never load-bearing; ticket 13 allowed a small CC0-sting pass, which never shipped. "More attractive"
often means music.

➡️ **Recommended: no music; add exactly one cue.** Music costs a licence pass, download weight, and
attention in a reading game, and it would fight the deliberate quiet-gaps identity; it is also easy
to add later, so it needs no decision lock — just a no for this pass. Add one `payoff` cue for a
Thread resolving (the course certificate, the loan repaid, the app story) — the deck's one
*anticipation-then-closure* device deserves a sound. Same terms as every cue: gesture-fired, off by
default, positive-only, never load-bearing, `docs/art-audio.md` gains a row.

---

❓ **Q17** — **Is sixty months the right length for fun?** A player who bounces at month 12 never
meets interest, credit or the crash. A shorter "fun" mode tempts.

➡️ **Recommended: keep 60 months.** The fixed ending, the 5-year arc, the economy's Lean year 5, the
Outcome Bands and the Better-Choices Proof all depend on it, and the month is already designed to be
under a minute. Protect the median month through the close restyle (Q14) and the copy pass (Q10);
keep session resumability as the answer to mobile attention. A short-run mode is recorded as a
deferred product question, not a decision of this pass.

---

❓ **Q18** — **The HUD says "Month x of 60" in text only. Should time be *visible*?** The game's
drama is temporal — a five-year life — but the screen shows a number, not a life.

➡️ **Recommended: add a five-year strip to the HUD** — five segments (one per year), the current
year filled to the current month, the text readout unchanged. Pure CSS, `aria-hidden` decoration:
the words still carry the meaning, no new colour. It is time, not competence, so it is not a score;
it makes the life visible and gives the Year in Review a rhythm on screen. (Optional companion:
show the Avatar at the year's age on the Stage-up banner — one component argument, no new art.)

---

**Frontier after Round 3:** consequence is visible, the close is a beat, the plan is untouched, the
sound bank grows by one, the length stands, and time is visible. This unblocks variety and drama —
the feel is good; now it must stop repeating.

---

## Round 4 — Variety, stakes and drama

Frontier: how the same loop stops feeling like the same card; how the deck teaches from the inside.

---

❓ **Q19** — **Every card is the same shape: kicker, title, situation, choices — ~60 times a Run.**
That shape is what makes it read like a worksheet, even when the words are good. New art is
unaffordable (one author, beats only).

➡️ **Recommended: diegetic Card Formats — a card can be presented as the artefact it is.** Three
formats to start: **message** (a chat/text thread for scams and requests), **paper** (a payslip,
statement or letter block for wage and credit cards), **receipt** (an itemised till/statement block
for BNPL offers, subscription creep, the meal deal). Same words, different choreography: the
scam becomes a message thread with a countdown, the payslip becomes a payslip, the BNPL offer
becomes a checkout screen. Zero drawings, pure typography and layout, text-first, translation-safe.
This is the biggest variety win available inside the existing budget.

---

❓ **Q20** — **Where does the format live — the deck schema or code?** A `format` field on `Card`
would be language-neutral data; a code map (like `beats.ts`) keeps the deck untouched but splits a
card's words across a convention.

➡️ **Recommended: code, in `src/lib/game/forms.ts`** — `formatFor(cardId)` plus the line structure,
in the `beats.ts` tradition, tested the same way. The deck keeps its schema and its language-neutral
purity; the extra prose multi-line formats need lives in the catalogues under
`card_<id>_line_<n>` (a documented convention, enumerated by a gate). A form is presentation and
must not change the words' meaning or the mechanics. Recorded as **ADR-0001** — a future reader will
otherwise wonder why the deck knows nothing about how it is shown.

---

❓ **Q21** — **Which cards get a format, and what must hold for accessibility and i18n?** Formats
must not become a mini-project of their own.

➡️ **Recommended: three formats over eleven cards, with hard constraints.** `message`:
`scam_opportunity`, `app_tip`, `app_vanishes`, `refund_text`, `lend_to_friend`. `paper`:
`first_payslip`, `first_taxed_payslip`, `payslip_error`, `first_statement`, `minimum_payment`.
`receipt`: `bnpl_trainers`, `subscription_creep`, `meal_deal`. Constraints: every format renders
the same text (no meaning in layout); one heading and a linear reading order for screen readers;
each format adds one axe screen; form-only, no new controls; the line keys exist in all three
locales (`forms.test.ts` mirrors `beats.test.ts`); a format is never the only carrier of a value.
Extending to more cards later is a data edit plus copy, not a rebuild.

---

❓ **Q22** — **The research's strongest anti-moralising device — play the villain — is missing.**
You are always the customer, never the seller; predatory mechanics are only ever explained *to*
you. The gamification merge deferred villain cards as out of scope for its layer.

➡️ **Recommended: add two Play-the-Villain cards, ethically fenced (ADR-0002).** Stage 4 (credit):
you work the phone-shop till, the manager teaches you the four-payment pitch, and your friend is at
the counter. Stage 5 (scams): you are offered a cut to bring two friends into the app. Each choice
is real — a commission, a gain — and each plants a Thread that resolves with the friend's situation
(one new thread each: `sold_the_split`, `brought_them_in`). The game never tells you off; the
consequence is the lesson, exactly the deck's existing voice. The fence: no cruelty reward (the
commission is small; the thread costs more), no "wrong choice" flag, no new maxim, the Better-
Choices Proof untouched. This reopens the deferral with reasons: it was out of scope *for a
recognition layer*, not prohibited; the MVP's own research ranks it the best anti-lecture device;
and the ask is exactly "less like a class". Full reasoning in ADR-0002.

---

❓ **Q23** — **Do Threads and stakes change?** Threads are the game's one
anticipation→closure device; they are capped at one live at a time, always visible as a chip
(`Hud.svelte`), and resolve through authored cards.

➡️ **Recommended: no structural change — the one-live rule and the chip stay.** Two villain threads
join the three existing ones; the `payoff` cue (Q16) makes closure land; the resolve cards keep
their authored payoff lines. No second slot, no deadlines that can be missed, no timers. Stakes come
from scarcity, the Shortfall Warning and the seeded shocks — all present; the pass makes them felt,
not harsher.

---

❓ **Q24** — **Should we add "flavour" cards (life texture, no concept)?** The research's "a
character you care about beats a ledger" invites more life and less money.

➡️ **Recommended: no new flavour cards.** The pool is 84 cards; the variety problem is *form*, not
volume (Q19), and each new card costs authored copy ×3, tests, and a diluted concept draw. The
character stays visible through the copy pass and the villain cards, which reuse the existing names
(Priya, Ravi, Danny, Grandma, the neighbour, the manager). Recorded as a deliberate no.

---

❓ **Q25** — **Cast continuity: is it a system or a house style?** Names already recur
inconsistently (Priya is the café manager; Danny owns the app; Ravi is a colleague).

➡️ **Recommended: house style, written down — no system, no state.** A half-page cast note beside
the voice bible (Q10) fixes who exists and what they do, and new/edited copy must reuse those names.
No roster screen, no relationship stats (that would be a progression device and a new surface for no
felt gain).

---

**Frontier after Round 4:** variety has a mechanism (formats), teaching-from-the-inside has two
cards, stakes stay honest, and the deck's growth is bounded. This unblocks the run's edges —
onboarding beyond the intro, replay, failure and the ending's boundary.

---

## Round 5 — Onboarding, replay, failure and the ending

Frontier: the run's edges, where a player leaves or returns.

---

❓ **Q26** — **After the Cold Open, does anything else teach the loop?** Ticket 04's principle was
"no tutorial — the first card teaches", and the confidence is warranted; but the intro currently
takes over that job with three screens.

➡️ **Recommended: nothing else. The Cold Open (Q7) plus the first-month Plan hint is the whole
onboarding.** No coach marks, no forced sequence, no glossary screen, no "tips" system. The first
card (`the_allowance`) teaches by consequence, exactly as designed; the plan hint retires by
construction. This makes the onboarding *shorter* than today's, which is the point.

---

❓ **Q27** — **Replay: beyond a fresh seed, what makes a second Run worth starting?** The Money
Story's "What next" currently says the Fork comes round again, and the Journal holds past Chapters.
Same-seed replay was deferred by the gamification grill for a good reason (it invites optimising the
score).

➡️ **Recommended: the Road Not Taken line at the Money Story.** If the profile's archive holds a
Run on the other path, "What next" gains one line — "Your other life: Chapter N, <band>." — that
links to the Journal; otherwise the existing Fork tease stands. The server derives that one line
from the archive (the game route's loader gains a small derived field; no new stored data, no new
endpoint). It is the honest, non-optimising version of "what if" — a story you already lived, not a
score to beat. Same-seed replay stays deferred, reason unchanged.

---

❓ **Q28** — **Should Journal Chapters get titles?** A Chapter today is "Chapter 2" plus band, date,
seed, turning points and Milestones (`journal/+page.svelte`). It reads as a record, not a life.

➡️ **Recommended: yes — derive a Chapter Title from the Run's own record.** A pure function over
`flags`/`log` picks the most significant moment by authored priority (the market fall; the card;
the loan; the minimum-payment year; the quiet year) and maps to a catalogue title, e.g. "The year
the market fell". No new stored data (ADR-0002 holds), one new pure function plus a test, and the
Journal starts reading like a shelf of lives rather than a ledger.

---

❓ **Q29** — **Does failure and recovery feel change?** The ask names "more fun" and "less class",
not "be softer" — and the current design is already non-judgemental and recoverable: "That is
allowed — the cascade covered it" (`resolve_over_note`), the honest Turning Points, the
`debt_cleared` Milestone, no punitive sound.

➡️ **Recommended: no change.** Recorded deliberately as a *no*, with the reason: the failure feel is
not where the classroom feeling lives, and softening it would spend the pass's risk budget on the
one area that already works. The villain threads (Q22) add consequence without shame, which is the
only recovery-adjacent change this pass makes.

---

❓ **Q30** — **The Money Story is the run's report card. Restructure it?** Ticket 05 mandates
story-first-then-numbers and the Better-Choices Proof; the screen currently runs story, moments,
you-vs-you bars, numbers table, Milestones, coverage, year-5 recap, inside-budget line, Journal
link, What next.

➡️ **Recommended: keep the structure and every figure; change only the telling (Q9, Q11, Q27) and
do not hide the numbers behind a disclosure.** This is a boundary on the pass: the ending stays a
report *of a life* — but it is the proof, and folding the numbers away to make it feel less like a
report would trade the game's success criterion for a mood. The receipt treatment belongs to the
month close (Q14), not to the Money Story.

---

**Frontier after Round 5:** onboarding is one screen plus a hint; replay has a story-shaped hook;
Chapters have names; failure stays as it is; the proof stays visible. This unblocks verification,
gates, docs and delivery.

---

## Round 6 — Verification, gates, docs, delivery

Frontier: what the pass must prove, where it lives, and in what order it ships.

---

❓ **Q31** — **What must each new surface prove for accessibility?** The new work includes a cold
open, a hint block, three card formats, a ledger line, a restyled close, a HUD strip, Chapter
titles and a road-not-taken line.

➡️ **Recommended: the full existing bar, no reductions.** No timers, no auto-dismiss, text carries
all meaning (formats are text; the ledger line is text + sign; the strip is `aria-hidden`; Chapter
titles are text); every emphasis reduced-motion-gated; 44px targets unchanged; the cold open, the
first-month hint, one screen per format, the restyled close, the Journal titles and the
road-not-taken block are added to `tests/a11y/seed.ts` + `screens.spec.ts` (+ `zoom.spec.ts` for
the formats and the close). Focus behaviour stays exactly as ticket 25 built it (one heading per
surface, the close receives focus on arrival). The manual passes (muted, zoomed, keyboard-only,
greyscale) extend their steps to the new screens — `docs/accessibility.md` updated with them.

---

❓ **Q32** — **i18n and the catalogue gates?** New copy is the pass's largest actual cost, ×3.

➡️ **Recommended: every new key is enumerated by a gate, and no sentence is concatenated.**
`forms.test.ts` mirrors `beats.test.ts`: every format's card ids exist in the deck; every line key
exists in en/it/ro with agreeing placeholders; no orphan `card_*_line_*` keys. Villain cards and
their threads join the existing deck gate (`messages.test.ts`); Chapter-title and Road-Not-Taken
keys join a small gate beside them. The voice bible's "survives literal translation" rule is the
editorial check; the added Fink-pass debt is listed in the final design.

---

❓ **Q33** — **Determinism and purity?** The repo's hardest rule is "same seed, same Run", pure
modules, no new stored state (ADR-0002).

➡️ **Recommended: the pass adds no RNG, no `RunState` field, no reducer branch, no persistence.**
`forms.ts`, Chapter Title derivation and the loader's road-not-taken field are pure or read-only;
the Ledger Line compares two states the reducer returned. No `computeMetrics`/`outcomeBand` change.
The villain cards are deck *content* (cards + threads), executed by the existing reducer — no
economy or draw change.

---

❓ **Q34** — **Which docs change?** The repo treats docs as gates, not notes.

➡️ **Recommended:** `docs/art-audio.md` (formats, the `payoff` cue, the motion policy, the strip);
`docs/accessibility.md` (new screens, extended manual passes); `CONTEXT.md` (the new terms when
merged); new `docs/voice.md` (voice bible + cast note); new `docs/playtest.md` (the Q4 protocol);
and the ticket-02/ticket-04 amendments recorded where the map keeps its decisions when this run is
merged. In this sandboxed run, all of it lives in `FINAL-DESIGN.md` + `CONTEXT-delta.md`.

---

❓ **Q35** — **Delivery sequencing — how does this build on the shipped gamification layer without
disturbing it?**

➡️ **Recommended: five additive phases, each independently shippable and reversible:**

- **P0 — Framing and voice** (copy only): Cold Open, first-month hint, Year Beats on Stage-ups,
  coverage relabels, working title, voice bible. *This phase alone changes the felt genre.*
- **P1 — Craft**: Ledger Line, receipt close, five-year strip, avatar on Stage-up, `payoff` cue,
  motion policy. (Extends the shipped juice layer; touches no stored state.)
- **P2 — Formats**: `forms.ts` + three components + line copy + gates + a11y screens.
- **P3 — Drama**: two villain cards + two threads, Chapter Titles, Road Not Taken line.
- **P4 — Proof and docs**: playtest run, docs updates, manual a11y passes, gate extensions.

None touches the economy, the RNG, `computeMetrics`, the storage shape or the privacy posture; each
builds on the shipped Milestones/Year-in-Review/Journal layer rather than replacing it.

---

❓ **Q36** — **Definition of done for the fun pass?**

➡️ **Recommended:** the existing `pnpm verify` suite is green plus the new `forms` / chapter-title
unit tests and a11y screens; the playtest protocol (Q4) has been run and its notes filed; the
non-goals checklist (FINAL-DESIGN.md) reviewed against the diff with no violations; the Better-
Choices Proof is unchanged (no new device is optimisable for competence); and the vocabulary still
matches CONTEXT. **No engagement metric is claimed, because none is collected.**

---

❓ **Q37** — **Open and deferred?**

➡️ **Recommended: nothing open; the deferred list, each with a reason.** Same-seed replay (still —
aims the player at the score), a short-Run mode (breaks the fixed ending and the proof), music
(licence/attention; easy to add later, so no lock), avatar tint (identity decoration; weak against
the pass's priorities), dark mode (v2, per ticket 13), flavour cards (Q24), personal bests (v1.1
candidate from the gamification merge). None silently assumed; each is a recorded *no for now*.

---

**Frontier after Round 6: empty.** Every branch of the design tree — what fun means, what is
reopened, framing and voice, moment-to-moment craft, presentation, variety and drama, onboarding,
replay, failure and recovery, how learning is carried, accessibility, i18n, determinism, docs,
sequencing and done-ness — is settled. The deferred items are deferred *by decision*, each with a
recorded reason.

---

## Frontier check (final)

| Branch | Settled by |
| --- | --- |
| What "fun" means here | Q1 |
| Hidden metrics / no-XP fence | Q2 |
| Explicit reopenings (villain cards; intro) | Q3, Q22, ADR-0002 |
| Success instrument (playtest) | Q4, Q36 |
| Work order and non-goals | Q5 |
| Governing rule (watch-it-happen) | Q6 |
| Intro / cold open | Q7 |
| Stage-up year beat | Q8 |
| Coverage relabel | Q9 |
| Voice bible + copy scope | Q10 |
| Working title | Q11 |
| Ledger line (visible consequence) | Q12 |
| Motion policy | Q13 |
| Month-close receipt | Q14 |
| Plan step | Q15 |
| Sound (no music; + payoff cue) | Q16 |
| Run length | Q17 |
| Five-year strip / avatar | Q18 |
| Card formats | Q19, Q20, Q21, ADR-0001 |
| Play-the-villain cards | Q22, ADR-0002 |
| Threads and stakes | Q23 |
| No flavour-card sprinkles | Q24 |
| Cast continuity | Q25 |
| Onboarding beyond the cold open | Q26 |
| Replay / road not taken | Q27 |
| Journal chapter titles | Q28 |
| Failure and recovery | Q29 |
| Money Story boundary | Q30 |
| Accessibility | Q31 |
| i18n gates | Q32 |
| Determinism / purity | Q33 |
| Docs | Q34 |
| Sequencing | Q35 |
| Definition of done | Q36 |
| Open / deferred | Q37 |

Open questions: **none.** Deferred by decision: same-seed replay · short-Run mode · music · avatar
tint · dark mode · flavour cards · personal bests.