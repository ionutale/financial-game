# 12 — Privacy & data handling for device-keyed play

Type: grilling
Status: resolved
Blocked by: —

## Question

Ticket [06 — architecture](06-architecture.md) established that a stable, server-set device cookie
is **pseudonymous personal data** under GDPR/ePrivacy even though the MVP ships no accounts. That
softens the original "privacy dodged" framing — decide what the MVP actually commits to.

- **Key**: server-set `httpOnly; Secure; SameSite=Lax` cookie, 32 random bytes, stored only as a
  peppered SHA-256. Confirm, and choose the pepper's storage/rotation.
- **Data minimisation**: no IP, no user agent, no fingerprinting. Confirm as a hard rule.
- **Retention**: how long an untouched Anonymous Profile and its Run state live before deletion.
- **Lawful basis**: legitimate interest vs consent for the cookie, given the EU/UK audience.
- **Notices**: what the privacy policy and any cookie notice must state; is an age statement
  needed (13+)?
- **Player control**: the "delete my progress" action, what it deletes, and how it is confirmed.
- **Analytics**: whether any privacy-safe telemetry ships in the MVP beyond the metrics stored on
  the profile, and where it lands.
- **Archived Runs**: per [05](05-ending-report-metrics.md), finished Runs are archived on the
  Anonymous Profile so the player can replay. Decide how long archives are retained, and whether
  the delete-my-progress action clears them too.

Output: the privacy commitments the spec must state, and what the build must implement.

## Answer

Resolved over one grilling round. **The posture in one line: a random id and the game state it
points at — nothing else.** No accounts, no PII, no analytics, no banner. Every decision below
follows from refusing to collect anything in the first place.

### The key

- Server-set `httpOnly; Secure; SameSite=Lax` cookie carrying **32 random bytes**.
- Stored in Atlas only as a **peppered SHA-256 digest**; the pepper is a server-only environment
  variable in Vercel and never touches the database.
- **No rotation in the MVP.** The digest is a lookup key, so rotating the pepper would orphan every
  profile at once. Rotation is a v2 problem, not a v1 feature — record it, do not build it.
- **No IP, no user agent, no fingerprinting** — enforced by never reading them, not by promising
  not to.
- Clearing device storage loses progress irrecoverably, and the first-run line says so plainly.

### Lawful basis and notices

- **ePrivacy strictly-necessary exemption**: the cookie exists solely to deliver the game the
  player asked for. **No consent banner.**
- **GDPR lawful basis: legitimate interest**, documented in a short assessment kept in the repo at
  `docs/privacy/lia.md` — necessity, balancing, and the player's reasonable expectation.
- **Privacy policy must state**: what is stored (a random id plus game state), why, and for how long
  (12 months of inactivity); that there are no accounts, no name, no email, no IP and no analytics;
  that nothing is shared beyond the host and the database; that the game is for **13+**; how to
  download or delete everything; and a contact address for privacy requests.
- **First run**: one line — *"Your progress is saved on this device with a random id. No name, no
  email, no tracking."* — plus a policy link. **No date-of-birth gate**, because nothing is
  collected that a gate would protect.

### Player control

The **Settings** screen carries both rights, in-product, with no email required:

- **Download my data** — a JSON export of the profile and every Run.
- **Delete everything** — deletes the profile, all Runs and all archives, and clears the cookie,
  behind a typed confirmation.

### Retention

- An untouched profile (no Run activity) is **deleted automatically after 12 months**, by a daily
  scheduled sweep (Vercel cron).
- **Archived Runs** are retained under the same 12-month clock, and **Delete everything clears
  them too** — per [05](05-ending-report-metrics.md), archives exist for replay, not for record.

### Hosting

- Vercel functions and the Atlas cluster live in the **same EU region** (e.g. Frankfurt or Paris).
- This also satisfies ticket 06's co-location requirement for latency. **Data does not leave the
  EU**, so no transfer mechanism is needed.

### Analytics

- **None.** Aggregate traffic comes from Vercel's own logs, not from anything the game sends.
  Nothing extra to disclose, nothing extra to retain.

### What the build must implement

1. Cookie mint/read middleware; pepper read from env; digest lookup, never the raw value.
2. `GET /api/profile/export` and `DELETE /api/profile`.
3. The Settings screen carrying both actions, with typed confirmation on delete.
4. A cron sweep enforcing the 12-month rule.
5. The first-run notice line and the policy link.
6. The privacy policy page itself, and `docs/privacy/lia.md`.

### Consequence for the map

The charting line "privacy dodged by shipping no accounts" is now precise rather than optimistic:
**not dodged — reduced.** One cookie, one policy page, one short assessment, two buttons in
Settings, and a cron job. [11 — Spec assembly](11-spec-assembly.md) must carry a Privacy section
stating every commitment above.
