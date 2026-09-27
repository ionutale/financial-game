# Behavioural progress is retrospective: it surfaces once a year, never as a live score

The game keeps its teaching metrics (budget adherence, savings rate, want share) hidden during a Run and shows them at exactly one new moment — the **Year in Review** at each Stage-up — plus the end-of-Run Money Story. Milestones are event-shaped (a thing that happened), never rate-shaped (a level maintained). A player can never see a live behavioural number and therefore cannot optimise the dashboard instead of living the month.

**Status:** accepted (design; v1.1)

**Considered Options:**
- *A live adherence meter or streak counter* — rejected. Ticket 05's principle is that "a player who can see a score optimises the score"; a live adherence bar would flatten the Want envelope and the Better-Choices Proof would end up measuring the meter. It is also the classic loss-averse streak dark pattern.
- *Behavioural numbers only at month 60 (the status quo)* — rejected. It is the problem the gamification is for: all recognition is deferred behind ~60 taps.
- *A Year in Review the player can act on* — rejected by construction: it reports a closed year and is shown after the year is locked.

**Consequences:**
- The Year in Review is a small, fixed block, not a dashboard; it must never grow a fifth live row.
- Milestone conditions must not read a rate mid-Run; a regression test asserts the Year in Review appears only at a Stage-up.
- The existing Turning Points (which may name mistakes such as a minimum-payment run) remain the place honest, non-positive moments are narrated; Milestones stay positive-only, so the two never contradict.
