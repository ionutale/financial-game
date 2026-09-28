# More fun is peaks, not currencies

**Status:** proposed (fun-grill run 3, 2026-09-27).

The fun pass adds **peaks, content and voice** — staged moments in the month (the Deal, the Answer,
the Tally), more life to live (Threads, deck, the Fund, the Twin Run), and a narrator that reacts
instead of instructing — and adds **no** points, streaks, lives, currencies, levels, unlockables,
live competence score or leaderboard. Ticket 08's boundary and `docs/adr/0001`'s rule stand: the money and
the story are the only scores. This ADR exists because "make it more fun" is exactly the request that
reintroduces a reward loop, and this pass was asked to decline it on purpose.

## Considered options

- **A reward layer (XP, streaks, coins, unlocks).** Rejected: rewards attach to completing prompts
  rather than to financial competence, expected tangible rewards undermine intrinsic motivation
  (ticket 08 research), and a game about a life cannot afford a second score to optimise.
- **A live "how you're doing" meter (mood, adherence ring, streak).** Rejected by ticket 05 and
  `docs/adr/0003`: a player who can see a score optimises the score. Live surfaces stay money and arithmetic;
  judgement stays retrospective.
- **Peaks, content and voice (chosen).** Every device must answer two questions: *which part of living
  does it deepen?* and *what would a player optimise if they optimised it?* If the second answer is
  anything but the life and the money, it is out.

## Consequences

- The game stays quiet by design: no music bed, no confetti, no looping motion, no sound on by
  default. The pass spends its budget on few, meaningful moments instead of constant stimulation.
- Fun has no metric: it is judged by a human playtest and by whether players replay, never by
  telemetry (which is banned) or by a score (which is declined).
- Any future "juice" proposal has a written test to pass before it can ship; a proposal that cannot
  answer the two questions is rejected without a debate about taste.
- The Better-Choices Proof remains the single success criterion: a fun device that makes a
  proof-worsening choice more attractive is a regression, whatever it does for engagement.
