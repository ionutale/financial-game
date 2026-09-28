# The fun playtest — the human-owed protocol

The fun pass (design §8, `.scratch/fun/design.md`) chartered one instrument: a small
think-aloud playtest, run by a person, with **no telemetry**. This file is the
protocol, filed by ticket 12. Running it is **human-owed** — the agent pass
cannot perform it, and nothing in the code depends on it: the gates hold the
learning, the playtest holds the *feel*.

## What it decides

The pass's success criterion is a one-line test: **nobody calls it a
course, a lesson, a quiz or homework.** Every other question below is a quote
to file, not a score to compute. Findings are **filed as issues** exactly like
the accessibility passes — never noted and forgotten.

## Participants and setting

- **5–8 players**, aged 14–18 if reachable (older is fine; note the ages).
- **Think-aloud**, one at a time, with a person present. No recording of the
  screen; quotes may be written down with consent. No analytics, no video, no
  accounts: the game keeps a random id and a Run, and the playtest adds
  nothing to that.
- Give the URL and the one instruction — *play for a while and say what you
  are thinking* — and do not explain the game. Five years is long; a session
  may stop at the Stage they reach.

## What to record

1. **Pacing.** Seconds and taps per month once a plan exists (the design
   target is ≤ ~20 s and ≤ ~6 taps; it is a target, not a timer). Where did
   the loop feel like a form?
2. **The voice.** Did any Reaction make them laugh, and which? Read a few
   back. Did anything feel like being told off, graded or congratulated?
3. **The Why.** Did they open *Why it happened* at the first encounter? Did
   they keep opening it after? If they stopped, what replaced it?
4. **Consequence.** Can they retell one decision that came back later — a
   Thread, a Callback, the crash, the Repayment? The money is the teacher;
   can they hear it?
5. **The world.** Did they mention a person (Priya, Ravi, Danny, Mum,
   Grandma) unprompted? Did a Chapter feel like theirs?
6. **The villain cards.** The phone-shop shift and the referral page: did
   either read as a telling-off, a trick, or a trap? ADR-0007's cut rule
   applies — if a player reports being told off, the card's commit
   (`a8a45ef`, `074d6ac`) is reverted without residue.
7. **The rest.** The close as a receipt; the ending (Reflections, Epilogue,
   Chapter Title, The Other Path); would they start a second Run, and why?
8. **The one line.** *"Game or lesson?"* — asked at the end, verbatim.

## Reading the room

- A Reaction that lands only in en is not landed: if the playtest is not run
  per locale, note which locale the player read.
- The **pilot gate** from the design ("the pilot wave is playtested before the
  copy sweep") was sequenced before tickets 04–11 landed; the sweep has since
  shipped under the mechanical gates. This protocol still leads the fixes, and
  the **Fink pass** (`docs/fink-debt.md`) remains the it/ro release gate.
- The **Beat Art review** and the **Fund tuning** are separate chartered
  human gates (design §8); this protocol does not replace them.

## Where results go

- A short write-up (quotes, counts, locale) attached to the run record, and
  one issue per finding in the issue tracker.
- Failures that name a card cut it or rewrite it; a failure that names the
  whole register reopens `docs/voice.md`, not a card.

## The facilitator's sheet

One card per player; fill it while they play (quotes in their own words; note the locale they read).

| Field | Notes / quotes |
| --- | --- |
| Age · locale · prior gaming | |
| 1. Time to a settled plan; seconds + taps for one month (sample 2–3 months) | |
| 2. Any Reaction that made them laugh — read it back; any moment that felt like being told off | |
| 3. Did they open "Why it happened" at the first encounter? Later? Why / why not | |
| 4. Retell one decision that came back (Thread, Callback, crash, Repayment) | |
| 5. Did they name a person unprompted? Which Chapter felt theirs? | |
| 6. Villain cards: told-off / trick / trap / fine? (ADR-0007's cut rule applies) | |
| 7. Close as receipt; the ending (Reflections, Epilogue, Title, Other Path); second Run? Why? | |
| 8. **"Game or lesson?"** — asked at the end, verbatim | |

Session checklist:

- [ ] Consent noted; no recording; no accounts (the game's random id only).
- [ ] One instruction only: *play for a while and say what you are thinking* — explain nothing.
- [ ] Stop where they stop; note the Stage reached.
- [ ] File each finding as one issue (quote + screen + locale), exactly like the a11y passes.
- [ ] Write the short summary and attach it to the run record.
