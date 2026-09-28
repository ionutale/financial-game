# One villain moment ships, as content

**Status:** proposed (2026-09-27), from the `fun-grill` run-4. Reopens the settled decision "the 'play the villain' card → out of scope" carried by the gamification design (`.scratch/gamification/design.md` §10) and the spec's Out of Scope.

The prior-art research (ticket 08) called *"let the player play the villain"* the strongest anti-moralising device in the catalogue — NGPF's *Shady Sam* teaches predatory terms by making the player sell them — and recommended one villain card per relevant stage. The first gamification layer parked it as out of scope, correctly, because that layer was about recognition. This layer is about fun and voice, so the boundary is reopened deliberately: **exactly one villain moment ships**, as content.

The moment: in Stage 4, the shop app offers the player a **referral bonus for bringing friends into the BNPL plan** ("Bring three friends, get ◈60"). Taking it pays real money and plants a Thread — the friend's first instalment, which lands badly and forces a second choice (help them out, or not). Declining pays nothing and costs a little social capital. Nobody is told off in either direction; the mechanism is felt from the inside.

## Boundaries (binding on the card)

- **Content, not a mechanic.** No new currency, no villain mode, no villain track, no repeatable villain loop. One card, one Thread.
- **No shaming, in either direction.** Declining is not heroic; accepting is not condemned. The copy shows the terms honestly and lets the consequence speak.
- **The friend is never a punchline.** Their outcome is recoverable and narrated without contempt.
- **No reward loop.** The bonus is money in the world (the only score); there is no villain currency and nothing to farm.
- **Cuttable.** The card ships playtest-gated and is removed without residue if it misfires.

## Considered options

- **Never build it (the carried decision).** Rejected for this layer: it is the strongest fun device the research recommends, the audience already plays games that let them be messy (*BitLife*), and the classroom feel lives precisely where the game refuses to let the player be complicated.
- **A full villain mode (play the lender across a Stage).** Rejected: scope, art budget, and a second fictional frame the one-author budget cannot carry.
- **A milder villain moment (market-stall pricing).** Rejected as the *only* moment: weaker, more generic, and it does not touch the concept the game most needs felt — credit and BNPL.
- **One referral moment (chosen).** Current, teen-scale, teaches the concept from the inside, and resolves through the Thread machinery already shipped.

## Consequences

- The ADR records *why* a finance game for teens deliberately lets the player profit from a friend's debt, so that a future reader does not "fix" it away.
- The card's playtest question is explicit: did taking it feel like a real choice, or like a trap set by the game? The second answer cuts the card.
- The "no shaming" rule means the Turning Points narration must cover the card if the Thread resolves badly, which extends the existing `flags` list by one kind or reuses an existing one.
