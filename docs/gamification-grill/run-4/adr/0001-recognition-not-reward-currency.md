# Recognition, not a reward currency: gamification grants no points, coins, lives or money

The game adds gamification (Milestones, the Year in Review, the Record Book) but **no parallel reward currency**: no XP, points, coins, lives, loot or purchasable anything. A Milestone grants recognition only — it never changes money or state. The money is the only score and the player's own past is the only benchmark. This is deliberate and counterintuitive: the obvious way to "add gamification" is a points economy, and a future reader will wonder why one is absent from a game that calls itself gamified.

**Status:** accepted (design; v1.1)

**Considered Options:**
- *A points/XP currency layered on top of the money* — rejected. It would create a second, meaningless score beside the one the game teaches, invite optimisation of the counter instead of the competence, and risk distorting the economy and the Outcome Band. The prior-art research (ticket 08) found that "expected tangible rewards reliably undermine intrinsic motivation" and that XP/coins attach reward to completing prompts, not to financial competence.
- *Milestones that pay a small cash bonus* — rejected. Either the payout is trivial (no motivation) or it moves the balance and the Better-Choices Proof.
- *Cosmetic unlocks as the reward* — deferred, not rejected. It is a genuinely non-distorting reward but pulls in art/asset work; revisit in v2 only if playtesting shows recognition alone is too thin.

**Consequences:**
- The HUD, the Month close and the Money Story gain no new number to accumulate.
- Any future "reward" proposal must answer *"what competence does this point at?"* before it can be added.
- Milestone milestones are event-shaped, never rate-shaped (see ADR-0002), which is what makes "no currency" motivating rather than hollow.
