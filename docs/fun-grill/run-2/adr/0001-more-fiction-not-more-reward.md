# More fun means more fiction, not a reward loop

**Status:** proposed (run 2 of the fun grill; merge decides).

Asked for *"more fun, more attractive, less like a teaching class"*, we decided the pass buys fun with
**fiction, voice and choreography** — the Narrator, the Cast, Callbacks, card forms, pacing, one beat
of art — and adds **no reward device of any kind**. The repo's ADR-0001 (recognition, not a reward
economy) is reaffirmed, not reversed: the classroom feeling comes from register and a worldless deck,
not from the absence of points. Prior-art evidence (ticket 08, failure mode #1) says rewards attach to
completing prompts rather than to competence, so a points system would trade the Better-Choices Proof
for engagement the game does not need.

## Considered options

- **A light reward layer** (streaks, cosmetic unlocks, "days played", a fun badge grid) — rejected:
  hard to remove once shipped, invites optimising the badge instead of the life, and repeats the
  documented failure mode.
- **Visible progress meters for fun** — rejected: ticket 05's reveal rule exists because a player who
  can see a score optimises the score.
- **Fiction-first fun (chosen)** — every device must make the life more alive, and every device must
  grant nothing.

## Consequences

- The pass's budget goes to copy and presentation; the economy, deck schema, draw, reducer and
  `RunState` are untouched by construction.
- A future "make it fun" request has a precedent to argue with: *what does this device make more
  alive?* — the same shape as ADR-0001's "what competence does this point at?".
- If a human playtest still calls the game a classroom, the recorded fallback is structural (shorter
  run, more authored life content — see `FINAL-DESIGN.md`), never a reward loop.
