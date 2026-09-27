# Cross-Run progression stays private and you-vs-you: no leaderboards, no other players

The gamification layer's cross-Run surface, the **Record Book**, compares the player only to their own finished Runs. There is no leaderboard, no ranking, no other-player comparison, and no social graph. This restates and hardens the MVP's existing "leaderboards are out of scope" decision at the moment gamification makes ranking tempting.

**Status:** accepted (design; v1.1)

**Considered Options:**
- *A friends' or global league table* — rejected. The prior-art research found that ranking by savings/wealth partly measures the random walk and starting position, rewarding luck rather than capability; it is also incompatible with the anonymous, device-keyed, account-less privacy posture.
- *Anonymous aggregate comparison ("players like you saved X")* — rejected. It needs telemetry the privacy build forbids, and it would hand the player a number to chase that is not their own life.

**Consequences:**
- The Record Book's "Personal Best" is always the player's own prior figure; a first Run has an empty Record Book rather than a zero.
- A Record Book has no retention curve and no reason to add one — its value is memory, not competition.
- Should the game ever gain accounts (v2), this decision does not travel: it must be re-decided against the privacy model, not assumed.
