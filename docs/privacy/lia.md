# Legitimate-interest assessment: the anonymous profile

This is the assessment behind the privacy policy's statement that the game relies on **legitimate
interest** (Article 6(1)(f) GDPR) for the one piece of personal data it keeps. It is written to be
read by whoever maintains the game next, not to sound like a court.

## What is processed, and why

When a player opens the game, the server mints 32 random bytes and sets them in an
`httpOnly; Secure; SameSite=Lax` cookie. The database stores only a **peppered SHA-256 digest** of
that value — never the cookie itself — alongside the game state it points at: the Run in progress
and any finished Runs kept for replay, each holding the month, the money, the plan and the choices
made. Nothing else is derived from the player. There is no account, no name, no email, no IP
address, no user agent, no fingerprinting and no analytics.

The cookie exists for exactly one purpose: to find the player's saved Run on the next request.
Delete the key and the game cannot know there is progress to resume.

## Necessity

A saved game across visits needs some stable handle, and this is the least intrusive one available.
The alternatives all collect more or deliver less:

- **An account** collects an email or a social identity to solve a problem the game does not have.
- **A server-side key from the IP address** would treat IP addresses as identifiers, which is more
  personal data, not less.
- **Browser storage on its own** would still store an identifier, and would add cross-site scripting
  exposure without removing the processing.

The cookie is strictly necessary in the ePrivacy sense: without it the game the player asked for —
a Run that continues tomorrow — does not exist. That is why no consent banner ships. There are no
cookies for advertising, measurement or preferences.

## Balancing

On the player's side: the processing is tiny in scope (an opaque random value and a game state), it
cannot be used to infer anything about the person, it is not profiled, combined or shared, and no
one is tracked across sites or over time. It stays inside the EU, with the host and the database the
only recipients. Players aged 13 and over can exercise both data rights inside the game, with no
email and no waiting.

On the developer's side: game state must persist for the game to function, and there is no viable
way to deliver that with less data. The intrusion is minimal and the player's autonomy is preserved
by the in-product download and delete actions.

The balance favours the developer's interest, because the cost to the player is a random id they
never see and a game state they asked to be saved.

## Reasonable expectation

A player who starts a Run and sees the first-run line — "Your progress is saved on this device with
a random id. No name, no email, no tracking." — expects exactly one thing: that their progress is
remembered. That is precisely what happens, and the privacy policy says so in the same words,
including how long it is kept. Nothing is hidden from the player, so nothing about the processing
would surprise them.

## Retention

A profile that has had no activity for **12 months** is deleted by a daily scheduled sweep — the Run
in progress and every finished Run kept for replay go with it, and an archive append counts as
activity on the same clock. The cookie carries the same one-year life. There is no second store, no
log and no analytics copy of any of it. "Delete everything" in Settings removes all of it immediately
and expires the cookie on the spot; clearing browser storage destroys the key at once, which means
the profile can no longer be found.

## Rights

- **Access and portability** — "Download my data" returns a JSON file of everything stored.
- **Erasure** — "Delete everything" removes the Run and expires the cookie, behind a typed
  confirmation.
- **Objection** — a player can object to the processing by opening an issue; because the processing
  is the game, the practical outcome is deletion.
- **Complaint** — a player can complain to their national data protection authority.

No automated decision-making and no profiling with legal effect takes place. The only judgement the
game makes about a player is the Outcome Band at the end of their own Run, which they see and which
has no consequence for them.

## Conclusion

The processing is minimal, purpose-bound, transparent and genuinely necessary to deliver the game.
Legitimate interest is an appropriate basis, and the safeguards above keep the player's reasonable
expectations met. Reassess if the game ever adds accounts, analytics or any new category of data —
today, there is nothing else to assess.
