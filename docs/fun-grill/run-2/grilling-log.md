# Fun Grill — Run 2 grilling log

**Task:** *"I want to improve the game even more, make it more fun, more attractive, and make it feel
less like a teaching class and more like having a good time and fun."*

**Run mode:** non-interactive (background subagent). There is no human to interview, so every frontier
question below is answered immediately with this run's own ➡️ recommendation, and that recommendation
**is** the recorded answer for this run. Nothing is left silently assumed; where a question remains
genuinely for the merge, it is listed at the end with its recommended option.

**Facts gathered first (no question was asked before the facts):** the shipped game
(`src/lib/components`, `src/lib/game`, `messages/{en,it,ro}.json`, `src/app.css`), the glossary
`CONTEXT.md` incl. the Gamification cluster, `docs/adr/0001–0003`, the gamification design + progress
ledger + the six gamification reports, `.scratch/mvp/map.md` and issues 02/04/05/08/09/10/12/13/14/17/19/30,
`.scratch/mvp/research/08-prior-art.md`, `docs/art-audio.md`, `docs/accessibility.md`,
`docs/privacy/lia.md`, `docs/translation-brief.md`.

**Shipped just now and therefore not re-proposed (built ON, never re-proposed):** Milestones, Year in
Review, the Journal, goal ticks, the one `milestone` SFX cue, Concept Coverage, the Month Close
Milestone line — gamification tickets 01–06 on `master`.

---

## The design tree (root: *make it more fun, more attractive, less classroom-like*)

```
Root: more fun / more attractive / less classroom
├── A. What fun means here, and what the classroom feeling is made of   (R1: Q1–Q8)
├── B. Voice & register — the copy layer                                (R2: Q9–Q15)
├── C. Presentation & choreography — screens, motion, art, audio        (R3: Q16–Q23)
├── D. World & continuity — cast, callbacks, life lines                 (R4: Q24–Q27)
├── E. Stakes, variety, onboarding, replay, failure                     (R4: Q28–Q33)
├── F. Learning carried by fun, not by lecturing                        (R5: Q34–Q35)
└── G. Verification, sequencing, risks, anti-scope                      (R5: Q36–Q38)
```

Rounds run in dependency order. Each round re-computes the frontier from the settled answers above it;
every branch terminates in a settled answer, and the frontier closes at Q38.

---

# Round 1 — The diagnosis and the deal

*Frontier: root decisions. Nothing above them is unsettled, so all of this round is askable now.*

❓ **Q1** - **What does "fun" mean for *this* game, and what is the success signal?**: The request
could mean amusement-park fun (juice, rewards, surprises) or dramatic fun (agency, a world that
answers, mastery, wanting to know what happens next). The two point at different builds, and only one
survives ticket 08's evidence and ADR-0001.

➡️ **Recommended (settled): dramatic fun — "a life you're living", not "a game you're scoring".** The
felt loop is *I decided → the world answered → I saw what it cost*. The success signals are the four
questions ticket 09 left unvalidated: does a month feel like a decision or a formality; is the
Feedback read or skipped; does the player want to know what happens next; do they feel like a person
in a life or a student in a course. No telemetry: a human playtest answers them, the existing gates
protect the rest. Amusement-park devices (points, streaks, loot) are out because they measure
completion, not competence — ticket 08's failure mode #1.

❓ **Q2** - **What actually makes it feel like a class? Rank the causes**: candidates found in the
build: (a) teacher-voice Feedback that names the lesson ("that is what insurance is…", "This is the
whole lesson"); (b) curriculum labels in player-facing copy ("Unlocks budgeting & tracking",
"Concepts met 7/8"); (c) exam-paper chrome ("Month 1 of 60", report sheets, dashed "over" marks);
(d) one uniform card form repeated ~60 times; (e) no world — generic situations, no recurring people,
no continuity between cards; (f) one-sided "correct answer" choices; (g) the fixed 60-draw syllabus;
(h) the hidden-metrics rule itself.

➡️ **Recommended (settled): the dominant causes are (a) and (e), with (b) a loud second. (c)/(d) are
atmosphere, (f) is a real credibility problem, (g) is structure and stays, (h) is not a cause at
all.** Order of attack for the whole pass: voice first (a, b), world second (e), card form third
(d, c), dilemma balance fourth (f). Do **not** spend the pass on (g) or (h): the fixed finish and the
hidden metrics are what make the ending and the Better-Choices Proof mean anything.

❓ **Q3** - **Do we reopen any guardrail to buy fun?**: the three live ADRs (recognition-not-reward,
derived-not-persisted, behavioural-numbers-are-retrospective) and ticket 05's reveal rule. A future
"fun" pass would be tempted to add a live streak, a daily hook, a cosmetic currency, or a
friend-comparison "for engagement".

➡️ **Recommended (settled): keep all three ADRs and the reveal rule intact — explicitly, not
silently.** The classroom feel is made of register and choreography, not of the guardrails; a points
system would break the one thing the game is for (the Better-Choices Proof) to fix a problem it did
not cause. The only *spec* lines this pass deliberately reopens are presentational (the Stage-up's
concept announcement, ticket 02; the three-screen intro and the intro's concept list, ticket 04) and
one card-content scope call from the gamification merge (the "play the villain" card); each is named
as a reopening in the log and in `FINAL-DESIGN.md`. This decision gets ADR-0001.

❓ **Q4** - **What is the scope and the budget?**: presentation-and-copy only, or mechanics too? One
author, three locales, a verified build.

➡️ **Recommended (settled): a three-tier "Fun Pass" on the existing build.**
**T1 Voice & register** — copy only (catalogues ×3, no code), plus a voice style sheet and a copy
lint. **T2 Presentation & choreography** — HUD framing, Plan pacing, card templates by kind, motion
vocabulary, kind motifs, Money Story staging (component-level code; no loop/economy/schema).
**T3 Small additive systems** — the Cast continuity pass, a derived Callbacks module, one new
Milestone, the villain card, beat art reuse. **Forbidden for the whole pass:** economy, deck schema,
draw/RNG, reducer, `RunState` fields, `computeMetrics`/`outcomeBand`, privacy surface, analytics,
per-card illustrations. Each tier is independently landable.

❓ **Q5** - **Whose voice is the game's?**: currently several registers mix: ledger-clean chrome, a
dry narrator in the Money Story, and a teacher in the Feedback ("Nobody is going to test you on
this" is the good voice; "that is the best-paid three hours in this entire game" is the teacher).

➡️ **Recommended (settled): one narrator — "someone who has already lived it, and won't lie to you".**
Dry, warm, unsentimental, never congratulates, never scolds, never explains the lesson. The Money
Story's current voice is the target; the Feedback and chrome move to it. Second person stays ("You").
The narrator is not a bank, not a coach, not a meme account, and never breaks the fiction to teach.

❓ **Q6** - **Does the product name change, and what attracts a stranger to click?**: `app_title` is
"Financial Life-Sim" — the genre label, not a name. The map lists "working title, branding" as not-yet-
specified. Attractiveness has two subjects: the player already inside (voice, world, form) and the
stranger deciding to open it (name, description, one image).

➡️ **Recommended (settled): rename the product (working title *Nineteen*), keep "financial life-sim"
as the genre description in metadata, and do not build a marketing landing page.** The intro *is* the
landing. Metadata: title `Nineteen`, description "Five years with the money you have when you're
fourteen.", one OG image composed from the existing `money_story` beat panel. Rename touches
`app_title` + the three `*_title` strings ×3 locales. Fallback if the name collides or the owner
vetoes: keep the product unnamed and use "Five years" as the title. In-game the game never names
itself, so nothing else changes.

❓ **Q7** - **Who are the "fun" changes *for*, and what do they cost the audience we need most?**:
PISA: 18% of 15-year-olds are below baseline financial literacy and 36% say money is "not relevant
to me right now" — the class register is precisely what loses them.

➡️ **Recommended (settled): optimise for the bored, not the enthusiast.** Every device is judged by
"does this make the next tap worth taking for someone who did not choose to be here" — lower register,
faster months, more life, fewer labels. The three-locale and a11y commitments stay: this audience
skews mobile and often shares devices. Cost if wrong: a slightly less "smart" tone for the already-
interested — acceptable.

❓ **Q8** - **Is "less like a class" compatible with the Better-Choices Proof?**: the proof needs the
player to make measurably better choices; making the game warmer could soften the consequences that
teach.

➡️ **Recommended (settled): yes — keep every mechanic, change only how the game *talks about*
mechanics.** Consequence-first copy (Q9) keeps the causality the proof rests on; the numbers stay
identical; the moments stay honestly narrated (turning points). A Fun Pass that changed the economy
would invalidate the proof; this one cannot by construction.

**Frontier after R1:** the guardrails are settled as untouched; fun is defined as fiction+agency;
scope is a three-tier pass; the voice is chosen; the name and audience are chosen. Open now: the
voice rules themselves (R2), the presentation layer (R3), and everything that needs a voice to exist
first — Cast, Callbacks, life lines (R4), then verification/sequencing (R5).

---

# Round 2 — Voice and register (the copy layer)

*Frontier: everything beneath Q5 (whose voice) and Q3 (nothing hidden is touched). The copy pass is
the highest-leverage change in the whole design.*

❓ **Q9** - **What is the Feedback rule, exactly?**: Feedback currently *connects the outcome to the
Concept* by explaining it ("this is what insurance is", "This is the whole lesson", "the lesson being
that deferred debt is still debt"). That is the single loudest classroom tell in the game — and it is
also the teaching payload.

➡️ **Recommended (settled): "Feedback shows, never explains."** A Feedback is 1–2 sentences (≤ 40
words, unchanged) containing **one concrete, checkable fact** (a number, a trade, a cause) and **no
abstract noun and no named Concept**. It may be wry; it may not be a definition, a maxim, or a
sentence addressed to a student. The Concept connection is carried **retrospectively** — by Concept
Coverage, the Year in Review and the Money Story — and by the consequence itself. Worked examples:

| Current (teacher) | Recommended (narrator) |
|---|---|
| "◈6 a month buys certainty. You will probably not claim — that is what insurance is: a small known amount to delete a big unknown one." | "Six a month, gone. The phone can now break once without it becoming your problem." |
| "You held. The loss only becomes real if you sell, and the recovery always happens without you if you do. This is the whole lesson." | "You held. The number fell and nothing was decided — which is what holding means." |
| "Urgency is the tell. Real investments survive being thought about overnight, and everything that cannot is selling you something else." | "You asked why it had to be today. The answer was another deadline. Real money never needs the hurry." |
| "Four payments of ◈30 — and the part nobody says out loud: it built you no credit score." | "Four payments of ◈30, and nothing on your file to show for them. The record starts when the bank decides it starts." |
| "You went past one of your envelopes this month. That is allowed — the cascade covered it — but the money came from somewhere." | "One envelope gave way. Fine — but it came out of somewhere, and somewhere remembers." |
| "You ended up behind where you needed to be. Nothing is unrecoverable from here; that is the point of the five years." | "Behind where the goal sat. Five years is long enough to know exactly how it happened — the moments above are where." |

Reasoning: the evidence (ticket 08) says just-in-time *consequences* beat generic instruction, so
this is not less teaching — it is the teaching mechanism moved from the sentence into the outcome.
This is ADR-0002.

❓ **Q10** - **Where do the maxims go?**: things like "Money you do not spend is the only money you
keep" and "pay yourself first" are the rules of thumb the evidence says actually work; deleting them
outright would teach less.

➡️ **Recommended (settled): they become retrospective Closing Notes — never live instruction.**
One short authored line at the end of a Chapter in the Journal and at the Money Story's close,
chosen from a small authored set (deterministic, derived from the Run's own record/band): e.g. a Run
that cleared debt closes with "Borrowed, and got out. Both ends of that belong to you." They are
memories, not instructions, so they create no live optimisation pressure. Cost: ~10 strings ×3.

❓ **Q11** - **What happens to the curriculum labels the player sees?**: "Unlocks budgeting & tracking"
(Stage-up), "Concepts met 7/8" (Journal), Concept names in Stats/Money Story. These are the
education's own vocabulary, visible mid-run — and the fix must not silently gut the learning payoff or
ticket 02.

➡️ **Recommended (settled): name the moment, not the curriculum — and reopen ticket 02's Stage-up
wording explicitly.** The Stage-up headline becomes the authored *teachable moment in fiction*
("This year: the first payslip, and the line taken out before you see it."); the Concept name moves to
a small secondary line (so ticket 02 is still satisfied) and stays fully present on the retrospective
surfaces. The Journal keeps "Concepts met" (it is the learning payoff and is retrospective). No
Concept names on live cards.

❓ **Q12** - **What are the humour rules?**: the research says irreverence beats instruction (vampires,
Shady Sam), but a "funny money game" is one finger-wag away from cringe.

➡️ **Recommended (settled): dry and warm; never at the player's expense; the villain may seduce, the
game never sneers.** Rules: no exclamation marks; no puns on money words; no sarcasm aimed at the
player; failure named plainly with no adjective of shame; at least one moment per Stage is funny on
purpose (authored); the funniest lines are allowed in the situations, never in the Feedback's verdict.
A joke sits inside a sentence, it does not replace the fact.

❓ **Q13** - **What does the chrome say?**: high-frequency strings set the register more than any
single card: "Plan the month", "Start the month", "What happened", "Month 12 closes", "Next month",
"Continue".

➡️ **Recommended (settled): a chrome pass with one rule — verbs and nouns of a life, not of a
course.** "Plan the month" → "The month ahead"; "Start the month" → "Go"; "What happened" → "How it
went"; "Month 12 closes" → "Month 12, done"; "Next month" → "Next". "Your call" stays (already
diegetic); "Net worth" stays (the game's own honest score word); "Stats" stays. Cost: ~10 strings ×3.

❓ **Q14** - **How do we keep the voice from drifting back to teacher over time?**: this is a
60-card authoring pipeline with machine translation and an existing key-parity gate.

➡️ **Recommended (settled): write `docs/voice.md` and add a copy-lint test.** `docs/voice.md` = the
style sheet (rules, worked before/after pairs, banned lexemes, the humour rules, the Closing-Note
rule); the lint is a Vitest over the **en** catalogue asserting player-facing Feedback/situation
strings contain none of a curated banned list ("this is what … is", "the lesson", "you learned",
"remember", "teaches you", "the point is", "always/never" as maxims) — warn-list curated by hand, not
a natural-language checker. The it/ro catalogues are covered by reviewer checklist, not by a lexical
test (the same idea does not translate to the same letters). Update `docs/translation-brief.md` with
a Voice section.

❓ **Q15** - **Do we rewrite everything, and in what order?**: roughly 340 player-facing strings exist
(~170 card strings, ~85 situations, ~85 elsewhere); a full rewrite ×3 locales is the pass's biggest
human cost.

➡️ **Recommended (settled): yes, a full pass in en, sequenced, machine-translated, with the Fink pass
promoted from "owed" to a launch gate for this work.** Priority order: (1) intro + Feedback (the
teacher's voice lives here); (2) Stage-up and chrome; (3) situations; (4) Closing Notes and the new
keys. If the budget must shrink, cut situations first and keep the rules + Feedback — but the voice
*is* the product of this pass, so the Fink pass is no longer a nice-to-have.

**Frontier after R2:** the copy rules are settled and checkable; maxims have a home; the labels
question is settled with an explicit ticket-02 reopening; translation risk is named. Open now: the
presentation layer (R3) — which depends only on Q1–Q4 — and the world/continuity devices (R4), which
need the voice to exist but not R3.

---

# Round 3 — Presentation and choreography

*Frontier: everything that changes pixels rather than words, plus pacing. Depends on Q3's scope and
Q1's definition; independent of the R4 devices.*

❓ **Q16** - **Does the HUD stay a dashboard?**: today it is a leaderboard of your life: avatar,
"Month 12 of 60", Net worth hero, goal bar, Cash, Free time, chips. It is clean and correct — and it
reads like the top of a report.

➡️ **Recommended (settled): restructure into three bands — You / The money / The world — without
removing a single number.** Band 1 "You": avatar, age + Stage name, and one authored **life line**
(Q27). Band 2 "The money": Net worth hero, the Named-Goal bar with its ticks (kept), and a compact
Cash · Free time strip. Band 3 "The world": the Thread chip and BNPL chip. **Drop "Month X of 60"**
from the HUD; the fixed ending stays visible in the intro, the goal and the Journal. The month number
still appears in the close heading ("Month 12, done") where it belongs to the record, not to a
countdown. Ticket 04's HUD contents are all preserved; only the framing changes.

❓ **Q17** - **How do we break the "same form 60 times" problem without per-card art?**: every card
renders through one component with one rhythm: kicker → title → situation → choices → Feedback. The
deck is 77 `decision`, 2 `shock`, 2 `risk_moment`, 2 `scam`, 1 `stage_up`.

➡️ **Recommended (settled): four typographic card templates keyed by `kind`, plus the existing
Stage-up.** `decision` keeps the clean panel; `shock` leads with "the hit" as a receipt-style block
(what broke, what it costs) before the choices; `risk_moment` renders the odds line as a small
two-outcome strip ("1 in 3 this year") so the gamble reads as a gamble; `scam` renders the pitch as a
message-bubble block above the choices (the tells stay in the words). Same strings, same semantics,
same choice buttons — only composition changes. Cost: component code + a small CSS vocabulary; no
assets, no i18n keys. Each template needs its own axe seed/screen (the gate precedent exists).

❓ **Q18** - **What is the motion vocabulary?**: today: the `rise` entrance, the goal pulse, the
Milestone ease-in. Ticket 13 says motion carries meaning and nothing else; ticket 14 gates reduced
motion.

➡️ **Recommended (settled): four motions, all meaningful, all reduced-motion-gated, all text-backed.**
(1) *Money moves* — when a Choice lands, the HUD figure counts to its new value (~300 ms). (2) *The
cascade* — when money comes out of Save or goes onto Debt, the cascade line animates Save → Debt in
sequence. (3) *The close counts* — the month-close net-worth change ticks once, up or down. (4) *The
goal bar overshoots ~2% and settles* when Save lands. Nothing loops, nothing auto-advances, nothing
is announced by motion alone. Cost: code only.

❓ **Q19** - **The Plan step is the game's most repeated screen — can 60 repetitions feel lighter
without changing the economy?**: ticket 17 deliberately keeps hours at 0 and warns; the Repeat button
exists but is a small chip; the month can be planned without engaging with it.

➡️ **Recommended (settled): make Repeat the primary action when a plan exists, and give month 1 a
suggested-plan chip.** With `lastPlan` set, the primary button becomes "Same as last month" and the
sliders sit behind "Change the plan"; without one, the button stays "Go". On month 1 only, an
authored suggestion chip ("Try: a third aside") fills a sensible split in one tap — never automatic,
never changing the defaults. The Shortfall Warning still fires when a repeated plan cannot cover
Obligations, so ticket 17's legibility is untouched. This turns the modal month into two taps
without removing the plan as an act.

❓ **Q20** - **Do we add art beyond the ten beats?**: the one-author budget is real; "more attractive"
invites per-card art and a big illustration pass.

➡️ **Recommended (settled): one new beat illustration, twelve small glyphs, and one reuse — all inside
ticket 13's existing inventory.** New beat: `debt_cleared` ("the climb-out"), shown in the Month Close
when the Milestone first fires and reusable in the Money Story. New small set: **four card-kind
motifs** (decision, shock, risk, scam) used by the templates, plus **eight concept marks** used only
on retrospective surfaces (Coverage, Journal, Year in Review) — this is ticket 13's promised "one
small icon set", never delivered. Reuse: the existing silhouette as a **"then / now" pair** on the
Money Story (two compositions of one asset). Total art: 11 beats + 12 glyphs + 1 reuse. No per-card
art; no animated illustrations.

❓ **Q21** - **Does the sound bank change?**: five synthesised cues, off by default; most players will
never hear them; the `milestone` cue already landed with the gamification work.

➡️ **Recommended (settled): no new cues, no default change, no prompting — one small discoverability
add.** In Settings, the Sound section lists the five cues as tiny preview buttons ("hear the choices")
so the bank is discoverable without a nag; the toggle stays off by default and never load-bearing.
Cost: ~15 lines + 5 labels ×3. If the merge disagrees, drop the preview; nothing else depends on it.

❓ **Q22** - **Is sound/motion ever allowed to carry the drama (the crash, the Fork)?**: the crash
currently has one low glide plus the chart; the Fork has a picture and an arpeggio.

➡️ **Recommended (settled): no escalation.** The restraint is the brand; the drama comes from copy and
consequence, not from a louder sting. Ticket 13's "positive-only, never load-bearing" stands. The
`crash` cue keeps its one glide; the Fork keeps its arpeggio.

❓ **Q23** - **Does the Money Story still read as a report card?**: it is now a long scroll: story,
turning points, you-vs-you, the seven numbers, Milestones, Coverage, year-5 recap, inside-budget line,
Journal link, What next. Ticket 05's choice of story-first was never human-validated (ticket 10).

➡️ **Recommended (settled): keep every block, restage the order so the record is the appendix, not
the verdict.** Order: (1) the story and the closing panel; (2) the moments; (3) you-vs-you; (4) the
band as a word with **neutral treatment — no red/green wash on any band** (colour never carries the
verdict; the words already do); (5) "The record" heading containing the numbers, Milestones, Coverage
and year-5 recap; (6) the Closing Note; (7) Journal link; (8) What next. Two copy fixes: the "Behind"
line stops saying "nothing is unrecoverable from here" (at month 60 there is nothing to recover — it
is a false promise, and it is the game's worst sentence), and "What next" names the other path
explicitly when the Run completed one. Fallback if the restage feels worse in playtest: ticket 10's
framing C (you-vs-you first) as originally recorded.

**Frontier after R3:** layout, motion, art and pacing are settled. Open now: the world/continuity
devices, which need the voice (R2) — Cast, Callbacks, life lines — and the stakes/onboarding/replay/
failure questions (R4), then verification and sequencing (R5).

---

# Round 4 — World, stakes, variety, onboarding, replay, failure

*Frontier: devices that only exist once there is a voice; each is additive and derived, per Q3.*

❓ **Q24** - **Does the game get a recurring cast?**: cards already name Priya, Ravi and Danny once
each, then never again; between cards there is no continuity of people, so 60 cards read as 60
worksheets.

➡️ **Recommended (settled): a small Cast — five named recurring characters, authored, with no new
art.** Keep the existing names (Priya the manager, Ravi the colleague, Danny the friend with an app
for everything) and add two: a school friend and a flatmate; each recurs 2+ times across Stages,
never as a lesson, only as continuity ("Priya's rota", "Danny, again"). Rule: a Cast member may
carry a theme but never explains it. Cost: copy only. Content-merge note: the deck's authoring brief
gains "recurring cast" as a rule.

❓ **Q25** - **Can the world remember what you did — without new state?**: the run record already
holds `log`, `flags`, `history`; a game that never refers back to a choice feels like a simulator,
not a life.

➡️ **Recommended (settled): the Callbacks module — one authored, derived line per card at most.**
A pure `callbacks.ts` in the `milestones.ts` tradition: given the record and the month, return **at
most one** authored Callback to render under the card's situation, chosen deterministically (no RNG);
each Callback names a past Choice in the world's voice ("The group chat still brings up the trip you
skipped."). Constraints: derived only, no state, no numbers, never a maxim, never contradicts a
Milestone, non-judgemental, ≤ 12 in v1, authored in the catalogue ×3, plain text (no live region).
Legacy saves simply have fewer predicates true. This is ADR-0003.

❓ **Q26** - **Life lines: does the HUD carry a life?**: the "You" band has an avatar and a stage name;
the world outside money is invisible between cards.

➡️ **Recommended (settled): one authored life line per Stage, in the HUD's "You" band.** Five
strings ×3 ("Football Thursdays. The phone's on a plan now."). Text only, never a mechanic, never a
wellbeing claim (Free Time is a resource, not a stat — CONTEXT stands). Optional second line per
year-end if the year-in-review proves to need it.

❓ **Q27** - **Does the deck change to make choices feel like life instead of a quiz?**: many current
cards have a clearly dominant option, and the Feedback names it ("The boring one — and it was
cheaper"). That is prior-art failure mode #3 (a lecture disguised as a choice).

➡️ **Recommended (settled): an authoring rule, not a schema change — at least one in three cards per
Stage must be a True Dilemma.** Both choices defensible, the tension in values rather than in the
ledger, no dominant arithmetic winner, and the Feedback must not declare a winner. Card count stays;
only the brief changes. The deck keeps enough "right-way" cards to teach (the spine especially).

❓ **Q28** - **Should the player get to play the villain?**: ticket 08's research calls "play the
villain" the strongest anti-moralising device in the catalogue and recommends one such card; the
gamification merge put "the play-the-villain card" out of scope *for the gamification layer*.

➡️ **Recommended (settled): reopen that scope call for content — three villain cards, one per late
Stage, using only existing mechanics.** You are the seller: you earn money now (`gain`), and your
Choice plants a Thread that comes back in three months (`sets.thread` → a new resolve card), with the
Feedback delivered from the buyer's side. Example: the bike you sell with the loose wheel; the
"guaranteed" app you promote to Danny; the room you sublet with the broken heating. No schema change
(Choice already has `gain` + `sets.thread`), no new kind, no new screen. Cost: 6 card pairs authored
+ 3 Thread specs + copy ×3. This is a *content* reopening of a gamification-layer scope note, not a
guardrail change, and it is listed for the merge.

❓ **Q29** - **Do stakes and drama change?**: shocks are capped at 400, everything is recoverable, the
crash is scripted. That is correct and should not become cruelty — but mid-run can feel flat.

➡️ **Recommended (settled): no new mechanics; raise the authored stakes inside the existing ones.**
(a) Thread payoffs get a bigger authored swing and a named Cast member, so the one live Thread is
felt. (b) The Thin Month — the Shortfall Warning keeps its arithmetic and gains a diegetic restyle;
the close stays neutral, never punitive. (c) The crash and the scam remain the guaranteed drama (the
spine). No random disasters, no poverty-sim grimness (prior-art failure mode #6), no unloseable
"setbacks".

❓ **Q30** - **What do the first five minutes do?**: today: three briefing screens (who you are, the
goal, how a month works), then a Plan screen with zero guidance, then the allowance card. Ticket 04's
"no tutorial — the first card teaches" is honoured in spirit, but the intro still reads as a briefing.

➡️ **Recommended (settled): a Cold Open — two screens, a scene and a goal, then just-in-time hints.**
Screen 1 is a scene in second person present tense (the ◈60 on the kitchen table, "you're fourteen"),
screen 2 states the goal inside the fiction ("the envelope you're not supposed to open"); "how a month
works" moves to the Plan's one-line subtitle, the first card's kicker, and a one-time note in the
first month close (derived from `history.length === 1`, in the narrator's voice, no overlay). Keep the
privacy line and the language switcher. This reopens ticket 04's three-screen intro explicitly;
fallback if the merge prefers: keep three screens but write all three in the narrator's voice.

❓ **Q31** - **Does replay change?**: same-seed replay is deferred (gamification §11), the Journal
shows the seed, "What next" teaches that the Fork comes round again.

➡️ **Recommended (settled): keep same-seed replay deferred; make the other path a first-class CTA.**
"What next" names the path this Run did not take ("You worked. Study plays very differently — the loan
is on the sheet from day one.") and offers it as a direct second choice beside "Play another five
years". No new modes in v1.1: a short "Year One" run stays a v2 candidate (it would break the shared
finish line that makes runs comparable).

❓ **Q32** - **How does failure and recovery *feel*?**: recovery is mechanically free and emotionally
invisible — you can climb out of debt and the game notes only `debt_cleared`. The band's red/green
chip is the only verdict the ending gives.

➡️ **Recommended (settled): add one Milestone — `the_climb` — and neutralise the band's treatment.**
`the_climb`: "the first month your money turned back up after three months down", derived from
`history.netWorth` (already stored — legal under ADR-0002), positive-only, event-shaped, announced in
the Month Close like every other Milestone, catalogue ×3. Plus: the band chip loses red/green (words
carry it), the `debt_cleared` beat illustration marks the moment (Q20), and the Money Story's
Closing Notes name a comeback when one happened. This extends the merged gamification catalogue by
one with the same derive-only rules; if the merge refuses, fallback is the narrative line only.

❓ **Q33** - **Is 60 months the right length for fun?**: fatigue risk is real: ticket 09 warned "a
month may prove to be a formality" and no human validated the pacing.

➡️ **Recommended (settled): keep 60 months; earn the length with variety; record the fallback.**
The Fun Pass's variety (templates, callbacks, Cast, dilemmas, villain cards) is exactly what makes
months 25–45 distinct; the Year in Review marks each year; Repeat-primary cuts the taps. **Recorded
fallback if playtest shows fatigue before month 30:** a 48-month (4-year) or shorter Stage-5 variant —
a v2 decision, not v1.1, because it changes the shared finish line. No mid-run "skip".

**Frontier after R4:** the world, stakes, onboarding, replay and failure are settled. Open now:
verification of the new copy/devices, the sequencing of the work, the risk register and anti-scope —
all R5, which depends on everything above.

---

# Round 5 — Verification, sequencing, risks, anti-scope

*Frontier: the last decisions — how the pass is proven, in what order it lands, and what it must
never become. Every branch above is now settled.*

❓ **Q34** - **How is the Fun Pass verified without analytics?**: there is no telemetry by design; the
existing gates are `pnpm verify` (check · tests · i18n · a11y) plus four human passes.

➡️ **Recommended (settled): extend the existing gates; add one human playtest script; no analytics.**
New/updated checks: the copy-lint test (Q14); unit tests for `callbacks.ts` (predicate firing, the
one-per-card cap, legacy/empty records, determinism) and for `the_climb`; axe seeds/screens for every
new template and new close state (no excludes); the reflow entries for the new HUD and templates; the
greyscale pass adds the kind motifs; the muted pass adds the Settings previews. The playtest script is
Q1's four questions plus "did anything make you laugh, and did any card feel like a test?" — run by a
human, recorded as an issue list, not telemetry.

❓ **Q35** - **What is the additive sequence, building on the shipped gamification layer?**: the work
must land in tracer bullets, each independently shippable, none touching economy/deck/draw/reducer.

➡️ **Recommended (settled) — in this order:**
1. **Voice Pass A + `docs/voice.md` + copy lint** — intro, Feedback worst-offenders, chrome (en → it/ro
   machine, Fink owed); the lint lands with it.
2. **Chrome & HUD framing** — three bands, month-count removed, Plan Repeat-primary + suggested chip,
   first-close note.
3. **Card templates + kind motifs** — four templates, a11y seeds, reflow entries.
4. **Callbacks + Cast + life lines** — `callbacks.ts` (pure), ~12 callbacks, Cast pass, 5 HUD lines.
5. **Cold Open** — two-screen intro; the third screen's content moves just-in-time.
6. **Art pass** — `debt_cleared` beat, the twelve glyphs, the Money Story then/now pair.
7. **Ending pass** — neutral band, Money Story restage, `the_climb`, Closing Notes, "What next" CTA,
   the "Behind" copy fix.
8. **Voice Pass B + villain cards + dilemma pass** — remainder of the copy; the three villain cards
   and their Thread resolve cards; the True-Dilemma authoring brief applied per Stage.
9. **Docs & gates close** — `CONTEXT.md` delta merged, ADRs merged, `docs/art-audio.md`,
   `docs/accessibility.md`, `docs/translation-brief.md`, `docs/voice.md`; full `pnpm verify` + Fink.
   Steps 1–3 already move the needle most; nothing later is blocked by anything earlier except the
   voice docs.

❓ **Q36** - **What are the risks, and what are the fallbacks?**: this pass rewrites the product's
voice and adds state-dependent surfaces — both can go wrong.

➡️ **Recommended (settled) — the risk register:**
- *Voice overcorrects into vague/twee, teaching less.* Mitigation: consequence-first rule (one
  checkable fact per Feedback), the lint, the playtest, and the numbers never move. Fallback: keep
  explicit explanation for the four hardest Concepts only (tax, scams, insurance, credit).
- *Callbacks read as gimmicks or repeat.* Mitigation: cap 12, one per card, authored, no numbers.
  Fallback: cut the module; the Cast and templates still carry continuity.
- *Templates break a11y/reflow.* Mitigation: per-template axe seeds and reflow entries; fix, never
  exclude.
- *Translations flatten the voice.* Mitigation: Fink pass is a launch gate for this work (Q15).
- *The classroom feeling survives anyway (structure, not register).* Fallback recorded: ticket 10
  framing C for the ending; and the v2 structural candidates (shorter run, more authored life
  content) with this pass's evidence attached.
- *The Better-Choices Proof is disturbed.* By construction it cannot be: no economy, metric or
  record changes; `the_climb` is derived and grants nothing; callbacks are fiction.
- *Four parallel runs diverge.* This run's output is sandboxed under `docs/fun-grill/run-2/`; the
  merge (orchestrator) decides. Reopenings are all marked, so the merge can accept or reject each.

❓ **Q37** - **What must the Fun Pass never do (anti-scope)?**: the failure modes the project already
fought would each return wearing a "fun" hat.

➡️ **Recommended (settled) — review gate, forbidden without exception:** XP · points · coins · lives ·
stars · gems · streak mechanics · leaderboards or any other-player comparison · live competence
meters · timers or countdowns · daily cadence, notifications, FOMO · loot or variable rewards ·
purchases · analytics/telemetry · new personal data (including a player-typed name) · shareable
Journals · per-card illustrations · animated illustrations · music · punitive sound or colour ·
"fun" copy that declares winners or sneers at the player · maxims delivered live · any change to the
economy, deck schema, draw, reducer, `RunState`, `computeMetrics` or `outcomeBand`.

❓ **Q38** - **What remains genuinely open for the human/merge, with a recommendation each?**: the
run is closing; these are the only items this run leaves unsettled, and each already has its
recommended answer.

➡️ **Recommended (settled as recommendations to the merge):**
1. **Working title** — recommend *Nineteen* (fallback: no name, "Five years" as the title).
2. **Fink pass as a launch gate for the voice work** — recommend yes.
3. **`the_climb` into the merged Milestone catalogue** — recommend yes (fallback: narrative line only).
4. **Villain cards and the True-Dilemma brief** — recommend yes to both; they reopen a gamification
   *scope note*, not a guardrail.
5. **Settings sound previews** — recommend yes (trivially droppable).
6. **Which of the four parallel runs' devices merge** — the orchestrator's call; this run's full set
   is coherent on its own and every device is independently droppable.

❓ **Q39** - **Late fact found while writing the design — the annual payoff only fires once**:
`stageUpFor()` finds `kind: 'stage_up'` cards, and the deck has exactly one: `the_fork`
(`stages: [5]`, `weight: 0`). Stages 2–4 therefore transition silently — no interstitial, so the
shipped **Year in Review renders only at the Fork (year 4)** and again for year 5 on the Money Story;
years 1–3 are computed but never shown, and the merged gamification design's "every Stage-up Card
carries the Year in Review" is unmet. This is a gap to complete, not a device to re-propose.

➡️ **Recommended (settled): add the three missing Stage-up interstitial cards — stages 2, 3 and 4 —
with a single "begin the year" Choice each, `weight: 0` like the Fork.** No reducer change is needed
(`startMonth`/`stageUpFor` are already generic; `CHOOSE`/`CONTINUE` handle a one-choice card), no draw
change (weight 0 cards are never drawn). Each card carries Q11's diegetic "what changes this year"
line plus the Year in Review the derivation already produces; the Fork keeps its path Choices. Cost: 3
cards + ~9 catalogue keys ×3 + one a11y seed (stage 2) + year-1/2/3-review unit fixtures. This is what
makes the Fun Pass's annual rhythm actually land, and it is the one place where "more fun" requires a
deck addition rather than copy.

**Frontier empty.** Every branch of the tree is visited; nothing is silently assumed. Settled answers
above are the design; `FINAL-DESIGN.md` assembles them, `CONTEXT-delta.md` proposes the vocabulary,
and the ADRs record the three decisions that meet the hard-to-reverse/surprising/trade-off test.
