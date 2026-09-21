# 06 — SvelteKit + Vercel + MongoDB Atlas architecture

Findings for ticket [`06-architecture`](../issues/06-architecture.md). Research date: 2026-09-20.
Constraint in force: **anonymous-only, device-keyed progress, no accounts, no PII**; mobile-first
SvelteKit 5 web game; content + progress in MongoDB Atlas; hosted on Vercel.
Sibling research [`07-i18n`](07-i18n.md) has already fixed the i18n shape: **the event deck is
language-neutral structure, and all human strings are compiled at build time by Paraglide** — this
document treats that as given and works out how content actually reaches the client.

---

## Recommendation (short)

1. **Runtime: Vercel Functions on the Node.js runtime, never Edge.** The official `mongodb` driver
   needs Node TCP/TLS and is not in the Edge runtime's API subset; Vercel itself now recommends
   migrating off Edge, and SvelteKit's adapter does not support `runtime: 'edge'` for DB routes.
2. **Driver: the official `mongodb` Node driver**, one `MongoClient` cached in module scope so Fluid
   Compute's shared instances reuse it across invocations. Low pool (`maxPoolSize` ~5–10),
   `minPoolSize: 0`, short `maxIdleTimeMS`, short `serverSelectionTimeoutMS`. Never `close()` per
   request.
3. **Data placement: Atlas stores the Anonymous Profile + Run state only.** The deck (structure) and
   all text (Paraglide catalog) are **build-time server assets in git** — not served from Atlas and
   **not shipped whole to the client**. Each turn, the server resolves exactly one card view
   (situation + choice labels + feedback, in the active locale) and sends only that.
4. **Anonymous identity: a random opaque token in a server-set `httpOnly` cookie; store only its
   SHA-256 hash** (peppered) as the profile key. No IP, UA, fingerprint or email is ever stored.
   Progress is per-device and is **lost when the cookie/site data is cleared** — an accepted MVP
   trade-off, surfaced honestly in the UI.
5. **Seeded runs: server-authoritative.** A crypto-random seed is generated server-side at Run
   creation and stored in the Run document; each turn's draw is derived from `(seed, turnIndex)` with
   a versioned PRNG, and turn resolution is an **idempotent, optimistic-concurrency
   `findOneAndUpdate`** so double taps / retries cannot double-apply.
6. **Privacy caution:** a stable device key is **pseudonymous personal data under GDPR** even with no
   account, and the ePrivacy/PECR rules on storing things on a device may still apply. Ship a
   plain-language notice, a “delete my progress” action, and a retention cap; do not rely on “no
   accounts” alone.

---

## 0. Version baseline and a naming caveat

Pinned from npm on 2026-09-20:

| Package | Latest | Note |
|---|---|---|
| `svelte` | 5.57.1 | Svelte 5 (runes) |
| `@sveltejs/kit` | 2.70.3 | SvelteKit **2** — there is no shipped “SvelteKit 5” |
| `@sveltejs/adapter-vercel` | 6.3.4 | |
| `mongodb` | 7.6.0 | official Node driver |
| `@vercel/functions` | 3.9.8 | `waitUntil` etc. |

> **Naming caveat.** The ticket says “SvelteKit 5”; the current stable framework is **Svelte 5 +
> SvelteKit 2**. (SvelteKit 3 exists only as an unreleased docs branch — it changes the env API to
> `$app/env/private` / `defineEnvVars` and drops the adapter `edge` runtime.) Everything below targets
> **Svelte 5 + SvelteKit 2.70.x**, which is what `npm create svelte` scaffolds today. Pin exact
> versions in the spec so a future SvelteKit 3 migration is a deliberate step, not a surprise.

---

## 1. Runtime and MongoDB driver on Vercel

### 1.1 Node runtime is mandatory for DB routes

- Vercel **Edge** runs V8 isolates with a Web-API subset and **no filesystem, no TCP sockets**; the
  `mongodb` driver is a native-Node library, so it cannot run there.
- Vercel now says plainly: “We recommend migrating from edge to Node.js for improved performance and
  reliability,” and Edge Functions are deprecated in favour of Vercel Functions.
- SvelteKit’s `adapter-vercel` documents `runtime: 'edge' | 'nodejs20.x' | 'nodejs22.x'`; the adapter
  marks the `runtime` option **deprecated** — the function follows the project’s Node version.

**Decision:** deploy as **Node.js** (`nodejs22.x`), and to be safe make the whole app Node rather
than mixing runtimes (a single runtime keeps the Mongo client, cookies and `AsyncLocalStorage`-scoped
locale handling simple — see 07’s SSR note).

### 1.2 Cache one `MongoClient` in module scope

Fluid Compute shares a physical instance across concurrent invocations (“multiple invocations can
share the same physical instance (a global state/process) concurrently”), so the documented
serverless pattern — create/connect the client **once at module level** — applies directly and the
pool is reused. MongoDB’s own Lambda test app shows exactly this: a module-level `new MongoClient(...)`,
`await mongoClient.connect()`, and a handler that only uses the cached client.

```ts
// src/lib/server/db.ts  — server-only by filename/import
import { MongoClient, type Db } from 'mongodb';
import { env } from '$env/dynamic/private';

declare global {
  // survives dev HMR and warm Fluid instances
  // eslint-disable-next-line no-var
  var __fgMongo: Promise<MongoClient> | undefined;
}

const uri = env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is not set');

function connect() {
  const client = new MongoClient(uri, {
    appName: 'financial-game',
    // Bounded pool: Fluid may run several requests on this instance at once,
    // so don't use 1, but keep the per-instance ceiling low (see §6.1).
    maxPoolSize: Number(env.MONGODB_MAX_POOL ?? 5),
    minPoolSize: 0,          // don't hold idle sockets
    maxIdleTimeMS: 30_000,   // drop idle sockets before a proxy/firewall severs them
    serverSelectionTimeoutMS: 5_000, // fail fast instead of hitting the 504 wall
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    retryWrites: true,
  });
  return client.connect(); // eagerly populate the pool
}

export const mongo: Promise<MongoClient> =
  globalThis.__fgMongo ?? (globalThis.__fgMongo = connect());

export async function db(): Promise<Db> {
  return (await mongo).db(env.MONGODB_DB ?? 'financial_game');
}
```

Why the `globalThis` guard: in `vite dev` (and any module re-evaluation) a fresh module-level client
would otherwise be created on every reload, leaking pools. This is the SvelteKit analogue of the
Next.js global-cache idiom, and the driver’s Lambda example endorses the module-level client itself.

**Do not** call `mongo.close()` in a request handler — closing kills the shared pool. Let
`maxIdleTimeMS` / platform suspension handle cleanup.

### 1.3 Pool options, briefly justified

- `maxPoolSize` default is **100**, far too high for serverless: each instance would hold up to 100
  connections plus 2 monitoring sockets per server node.
- `minPoolSize: 0` + `maxIdleTimeMS` is the driver’s documented optimum for “sustained periods of low
  activity”.
- `serverSelectionTimeoutMS` bounds how long a stalled cluster stalls a function; without it a slow
  Atlas region can eat the whole function duration and return a bare 504.
- Vercel’s relational advice (“avoid max pool size of 1; keep minimum pool size to 1”) is specifically
  about `attachDatabasePool` for SQL pools — it does **not** apply to `MongoClient`, which manages its
  own pool. Copy the *spirit* (don’t starve concurrency, do bound the pool), not the letter.

### 1.4 Region

Functions default to a single region (`iad1`) and SvelteKit’s adapter defaults serverless functions
to `["iad1"]`; multiple serverless regions are Enterprise-only. **Co-locate Atlas and Functions** in
the same cloud region, chosen via the Atlas↔Vercel integration (which maps a Vercel region to the
nearest Atlas region). Keep the adapter `regions` value and the Atlas cluster region in sync in the
spec’s deployment notes.

---

## 2. What lives where

| Concern | Home | Ships to client? |
|---|---|---|
| Deck **structure** (ids, stage, concept, weights, effects, art refs) | git, `content/cards/*.json`, imported **server-side**; optionally mirrored to Atlas for future hot-editing | **Never** |
| Card / UI **text** (en/it/ro) | git, `messages/{locale}.json`, compiled by Paraglide at build | UI chrome only; card text **resolved server-side** (§5) |
| **Anonymous Profile** (device key, created/updated, settings) | Atlas `profiles` | No |
| **Run** (seed, turn index, economy state, draw log, history) | Atlas `runs` | Only a view |
| Turn log / Money Story data | Atlas `runs.history` (+ derived report) | Report view only |
| Ephemeral UI state (open card, animations, unsent choice) | Svelte 5 runes / component state | n/a (client by nature) |
| Active locale | Paraglide runtime + URL prefix (07) | n/a |

Rationale for **content = build asset, not Atlas** even though charting decision #10 says MongoDB
holds “content + progress”:

- 60 cards are authored in git and change only on deploy; serving them from Atlas adds a network hop
  and a failure mode for zero user-specific benefit.
- 07 already compiles card text into the app at build time, so per-locale content is a *build*
  concern, not a query concern.
- The game has no leaderboard and no adversarial stakes; the real reason to keep structure
  server-only is integrity and payload size, not anti-cheat.
- If post-MVP wants authoring without redeploys, add an **Atlas overlay** (`content` collection keyed
  by card id + `contentVersion`) that *overrides* the bundled deck; git stays the source of truth and
  the app falls back to the bundle. Do not make Atlas the sole copy.

This is a deliberate refinement of #10, not a contradiction: MongoDB’s MVP job is the **Anonymous
Profile and Run state**; content remains versioned in the repo and compiled in.

Suggested indexes (created by a one-off migration, not per request):

```ts
await db().collection('profiles').createIndex({ deviceId: 1 }, { unique: true });
await db().collection('runs').createIndex({ deviceId: 1, status: 1, updatedAt: -1 });
await db().collection('runs').createIndex({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 }); // retention cap (§3)
```

---

## 3. The Anonymous Profile: create and transmit without PII

### 3.1 Lifecycle

```
first request ──► no fg_dev cookie
                  generate 32 random bytes (base64url)  ← the only secret
                  set httpOnly, Secure, SameSite=Lax cookie
                  store SHA-256(token + DEVICE_PEPPER) as profiles.deviceId
every later request ──► cookie sent automatically
                        hash again, look up profile + active run
```

- **Token**: `crypto.randomBytes(32).toString('base64url')` — unguessable, no structure.
- **Cookie**: server-set `httpOnly; Secure; SameSite=Lax; Path=/`. `httpOnly` means JS cannot read it
  (no XSS exfiltration of the credential); `SameSite=Lax` still sends it on top-level navigations.
- **Stored key**: the **hash**, never the raw token. A database dump then contains nothing that can be
  replayed as a credential.
- **No PII**: do not log or persist IP, user agent, geolocation, referrer, or email. All of those are
  the usual accidental PII in an “anonymous” system.

```ts
// src/lib/server/device.ts
import { createHash, randomBytes } from 'node:crypto';
import { env } from '$env/dynamic/private';

const COOKIE = 'fg_dev';

export const newToken = () => randomBytes(32).toString('base64url');
export const deviceKey = (token: string) =>
  createHash('sha256').update(token + (env.DEVICE_PEPPER ?? '')).digest('hex');

export function ensureDevice(cookies: import('@sveltejs/kit').Cookies) {
  let token = cookies.get(COOKIE);
  if (!token) {
    token = newToken();
    cookies.set(COOKIE, token, {
      path: '/', httpOnly: true, secure: true, sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 400, // browsers clamp anyway
    });
  }
  return deviceKey(token);
}
```

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { ensureDevice } from '$lib/server/device';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.deviceId = ensureDevice(event.cookies);
  return resolve(event);
};
```

```ts
// src/app.d.ts
declare global {
  namespace App {
    interface Locals { deviceId: string }
  }
}
export {};
```

SvelteKit sets cookies on the response even when set during `handle`, and applies `httpOnly`/`secure`
defaults; setting them explicitly documents intent. `$env/dynamic/private` reads `process.env` at
runtime (the documented way to keep server secrets out of the client bundle — SvelteKit **errors** if
a server-only module is imported from client code).

### 3.2 What breaks when device storage is cleared

Clearing cookies / “Clear website data” / a different browser / a new phone / private mode all destroy
the token, so the next visit mints a **new** Profile and the previous progress is unreachable. It is
not recoverable, by construction, because there is deliberately no account and no identifier that
could re-link it (this is the same reason it is privacy-friendly).

Mitigations, in order of preference:

1. **Be honest in the UI**: “Your progress is saved on this device only. Clearing your browser data
   will erase it.” A one-line note at Run start.
2. **Persist the cookie as long as the browser allows** (server-set, not `document.cookie`).
3. **A “keep this device” affordance** (optional): show a QR/link that carries the token once, so a
   player can move to another device without an account. This is effectively a bearer secret; treat it
   as account-like and flag it as post-MVP.
4. **Explicit “start over / delete my progress”** — deletes the profile server-side and clears the
   cookie. Good privacy hygiene and the natural inverse of the above.

### 3.3 Browser storage limits (why server-set cookie beats `localStorage`)

- Safari ITP caps **script-set** cookies (and other script-writable storage) to ~7 days; **server-set
  first-party HTTP cookies are not subject to that JS cap** and can persist far longer (Chrome up to
  400 days). A server-set `httpOnly` cookie is therefore the most durable anonymous key a browser
  offers.
- `localStorage` is not sent on requests, so SSR would need a round-trip to read it; it is also
  cleared together with cookies under “clear site data”, so a `localStorage` mirror buys almost
  nothing and adds complexity. **Use the cookie alone** for the MVP.
- Do **not** fingerprint the device to “recover” a cleared profile: device fingerprinting is
  explicitly in scope of ePrivacy Art. 5(3) (i.e. consent), fragile, and the opposite of the privacy
  posture.

### 3.4 Privacy reality check (important, contradicts “GDPR-K dodged”)

“No accounts” removes the need for a signup/consent flow for *accounts*, but it does **not** make the
system anonymous:

- A stable random device identifier is an **online identifier**; ICO guidance treats cookie
  identifiers as personal data, and pseudonymised data **remains personal data** under GDPR
  Recital 26. Italy and Romania are EU; the audience is 13–18.
- ePrivacy/PECR Art. 5(3) governs storing/accessing information on a device. A cookie that is
  *strictly necessary to provide the service the user requested* (saving their game) is commonly
  exempt from consent, but that is a per-jurisdiction reading — record the reasoning rather than
  assuming it.
- Age-appropriate design duties may apply even without accounts.

MVP posture that is defensible without a consent banner: **data minimisation** (random opaque id;
store the hash; no IP/UA/email), **retention cap** (TTL index, e.g. 12 months of inactivity), a
**plain-language privacy note**, a **delete-my-progress** action, and a spec note that this is not
legal advice and should be reviewed before launch. If a consent-free position is not acceptable, the
fallback is a minimal first-run notice (not a full CMP), decided with counsel.

---

## 4. Seeded runs: seed, persistence, resume

### 4.1 Where the seed lives

- Generated **server-side** with `crypto.randomBytes(16).toString('hex')` at Run creation.
- Stored **only** in the Run document. It is never trusted from or sent to the client, so a player
  cannot choose a favourable deck order.
- A `engineVersion` integer is stored alongside it. Dart/draw order is a function of the seed **and
  the engine version**, so changing weights or the PRNG later does not silently rewrite an in-flight
  Run’s history.

### 4.2 Deterministic, resumable draws without persisting PRNG state

Derive each turn’s randomness from `(seed, turnIndex)` rather than advancing a stored generator. Then
resume needs only `turnIndex`, and a replayed turn is bit-identical even across instances.

```ts
// src/lib/server/rng.ts
import { createHash } from 'node:crypto';

function turnSeed(seed: string, turnIndex: number): number {
  const h = createHash('sha256').update(`${seed}:${turnIndex}`).digest();
  return h.readUInt32BE(0);
}

// mulberry32 — tiny, fast, deterministic
export function rngFor(seed: string, turnIndex: number) {
  let a = turnSeed(seed, turnIndex);
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

The draw itself filters the deck by `stage`, excludes cards already drawn (weights from ticket 03),
and picks with the derived RNG. Record the chosen id in `drawLog` so the Money Story and resume never
need to re-derive (and old runs survive engine changes).

### 4.3 Run document

```ts
type RunDoc = {
  _id: string;                 // runId (UUID v4)
  deviceId: string;            // hash from §3
  engineVersion: number;       // semantics version
  seed: string;                // server-only, never sent
  status: 'active' | 'finished';
  turnIndex: number;           // 0..59
  stage: string;
  economy: { cash: number; savings: number; debt: number; /* + ticket-01 fields */ };
  drawLog: string[];           // ordered card ids actually drawn
  history: Array<{ turnIndex: number; cardId: string; choiceId: string; at: Date }>;
  createdAt: Date;
  updatedAt: Date;
};
```

One document per Run (60 turns of history is tiny and comfortably under the 16 MB BSON limit). Resume
is `findOne({ deviceId, status: 'active' })` in the game's server `load`.

### 4.4 Idempotent turn resolution (the critical serverless pattern)

Requests can be retried (network, Fluid scaling, user double-tap). Make resolution a single conditional
update keyed on the expected turn, so a stale/duplicate submission changes nothing:

```ts
// POST /api/run/[turn]  (+server.ts)
const { runId, turnIndex, choiceId } = await request.json();
const now = new Date();

// 1. load run (must belong to this device)
const run = await runs.findOne({ _id: runId, deviceId: locals.deviceId, status: 'active' });
if (!run || run.turnIndex !== turnIndex) {
  return json({ ok: false, reason: 'stale' }, { status: 409 });
}

// 2. apply the choice deterministically (effects from ticket 01)
const next = applyChoice(run, choiceId); // pure

// 3. commit only if the turn still matches → optimistic concurrency
const updated = await runs.findOneAndUpdate(
  { _id: runId, deviceId: locals.deviceId, status: 'active', turnIndex },
  { $set: { ...next.state, updatedAt: now }, $push: { history: next.record }, $inc: { turnIndex: 1 } },
  { returnDocument: 'after' }
);
if (!updated) return json({ ok: false, reason: 'already_applied' }, { status: 409 });

return json({ cardView: viewOf(updated) }); // §5
```

Numeric economy invariants (no negative cash, debt ceiling) should be enforced in `applyChoice` and
also re-checked before commit. Prefer `findOneAndUpdate`'s atomicity over multi-document transactions:
a single document per Run means no transaction is needed, which avoids a known serverless latency
trap.

---

## 5. How the deck reaches the client (and its i18n interaction)

### 5.1 The interaction that matters

07 compiles every message, in **all locales**, into JavaScript functions. Two consequences from
Paraglide’s own docs:

- Vite tree-shakes messages that are **statically referenced**. But 07’s card accessor uses **dynamic
  keys** (`card_${id}_situation`) to keep the deck language-neutral — and **dynamic indexing cannot
  be tree-shaken**, so the entire card catalog (all cards, all locales) would be retained.
- Paraglide’s experimental **per-locale builds are rejected for SvelteKit** today: the docs state
  “TanStack Start and SvelteKit currently own their Vite application build and server rendering. The
  backend fails instead of inspecting their output.”

So the naive design — a `cardText()` accessor imported into a client component — ships ~60 cards ×
~8 strings × 3 locales to every phone. It is not a correctness bug (the strings are just text), but it
is a real mobile-first payload and it puts the *whole* deck's prose in the client.

### 5.2 Recommendation: the deck never reaches the client; only one card view does

```
Atlas run state ──► server: draw + resolve
                       │  structure  : bundled deck (server-only import)
                       │  text       : Paraglide server-side call for the active locale
                       ▼
             cardView { id, situation, choices: [{ id, label }] }  ──► client
                       │  (effects/weights/outcomes stay on the server)
```

- **Structure** (`content/cards/*.json`) is imported only from server modules
  (`$lib/server/deck.ts`), so effects and draw weights never ship.
- **Text** is resolved server-side: `+page.server.ts` / the turn endpoint calls the Paraglide message
  functions for the active locale and puts the resolved strings into the returned data. The client
  renders strings it was given; it never needs the card catalog. UI chrome still uses static
  Paraglide keys and tree-shakes normally.
- Keep the dynamic `card-text.ts` accessor **server-only** (put it under `$lib/server/` or import it
  only from `*.server.ts`); SvelteKit will then never let it leak into the client bundle.
- Resolution happens once per turn, so the per-card cost is one deck lookup + a few function calls —
  negligible.

### 5.3 Alternatives considered

| Option | Verdict |
|---|---|
| Bundle the whole deck + text on the client | Rejected: ships all cards/all locales, exposes outcomes, larger payload. Fine for a throwaway prototype, wrong for the MVP. |
| Deck served from Atlas via an API | Rejected for MVP: extra hop/failure mode for content that only changes on deploy. Revisit only if post-MVP wants runtime authoring. |
| Server resolves one card view (recommended) | Smallest payload, best integrity, aligns with 07’s server-side message use. |

### 5.4 i18n hand-offs

- Locale selection, routing, `AsyncLocalStorage` setup, currency/formatting and the CI gates are
  **07’s**; this ticket only adds: **the card view is locale-resolved on the server**, and locale
  must **never** be stored in Run/Profile state or fed to the PRNG (07’s rule; changing language
  mid-run re-renders text only).
- The `messages.js` dynamic-key cost above should be recorded as a **07 risk**: if the client bundle
  grows unexpectedly, it is because a dynamic accessor was imported client-side. Verify with a bundle
  report in CI and measure the client gzip size for the card catalog.

---

## 6. Pitfalls: connections, timeouts, cost, rate limiting

### 6.1 Connection ceiling math (do this before launch)

Atlas **Free** and **Flex** clusters allow **500 concurrent connections per node**; dedicated tiers
scale up from there. Each `MongoClient` also opens up to **2 monitoring sockets per server node**. A
3-node replica set with `maxPoolSize: P` on one server can therefore hold roughly `P + 6` sockets.

- Serverless has no global pool: total connections ≈ (live instances) × (pool per instance).
- With Fluid in-function concurrency, several requests share one instance and one pool, so
  `maxPoolSize` should be > 1 but modest. Pick a number from expected concurrency per instance
  (`maxPoolSize: 5–10` is a sane start) and **alarm on Atlas connection count**.
- Cap any autoscaling / abuse vector: without rate limiting, a traffic spike (or a loop on the turn
  endpoint) can open instances faster than Atlas allows. Connection storms are the classic failure
  and are **correlated** (e.g. a redeploy retires a whole fleet at once).

### 6.2 Timeouts

- Fluid Compute gives Vercel Functions a **300 s default/maximum on Hobby, 800 s (1 800 s beta) on
  Pro/Enterprise**; Edge streams for up to 300 s. The SvelteKit adapter doc still lists legacy
  `maxDuration` defaults (10 s Hobby / 15 s Pro / 900 s Enterprise). **Set `maxDuration` explicitly**
  per interactive route — e.g. `export const config = { maxDuration: 15 }` — so a misbehaving query
  cannot burn the platform maximum in provisioned-memory time.
- Always set `serverSelectionTimeoutMS` (short, e.g. 5 s) so an unreachable Atlas fails fast and you
  return a real error instead of a 504. Every code path must return a response; an upstream hang
  otherwise consumes the full duration.
- Keep the interactive path to **one document read + one atomic write** and avoid multi-document
  transactions, which add round-trips and can time out.
- Request/response body limit is **4.5 MB** — irrelevant here, but don’t send whole reports via POST.

### 6.3 Cost

- Vercel Fluid bills **active CPU** and **provisioned memory time**; waiting on I/O (the Atlas
  round-trip) does **not** count as active CPU. So the design’s cost driver is *time alive × memory*,
  which favours short, bounded functions with the default 1 GB or lower.
- Per Run: ~60 card views (one read each) and ~60 writes. This is trivial for Atlas Free/Flex, but
  **cache the deck in module memory** (content is static per deployment) and **write once per turn**,
  never per keystroke/animation.
- Prerender everything that is not user-specific (landing, rules, card art pages); only the game and
  turn routes need functions. Do **not** put user-specific server `load`s behind ISR.
- Vercel no longer offers first-party KV/Postgres for new projects; use Marketplace providers (e.g.
  Upstash Redis) if you need shared counters. Fluid is on by default for new projects.

### 6.4 Rate limiting and abuse

- The device cookie is client-held and can be reset, so **per-device limits are advisory**; pair them
  with an **IP-based edge** rule for coarse abuse control.
- **Vercel WAF rate limiting**: Hobby allows **1 rule**, counting keys **IP + JA4 digest**, fixed
  window **10 s–10 min**; Pro raises rule count and window options; Enterprise adds token bucket and
  arbitrary header keys. One rule on `/api/run/*` (e.g. 60 requests/min per IP) is enough for the MVP.
- Add **idempotency** (§4.4) so retries and double-taps are free, and cap Run creation per device in
  the endpoint (e.g. one active Run; starting a new one archives the old).
- If you need per-device buckets beyond the edge, Upstash Ratelimit (Marketplace Redis) is the
  sanctioned path — do not build a counter in a serverless instance’s memory (it is per-instance).

### 6.5 Security / ops gotchas checklist

- **Atlas IP access list must be `0.0.0.0/0`** because Vercel egress IPs are dynamic; the Atlas↔Vercel
  integration adds it for you. Scope the database user to the app database, not the
  `readWriteAnyDatabase` role the integration creates.
- **Co-locate regions** (Atlas ↔ Functions); cross-region round-trips are the most common latency
  source.
- Vercel functions are **read-only with `/tmp` scratch up to 500 MB**; do not rely on the filesystem.
  SvelteKit’s `read()` from `$app/server` is the supported way to read bundled assets.
- Functions are **archived after 2 weeks** (production) / 48 h (preview), adding ≥1 s to the next
  cold start. Bytecode caching reduces subsequent starts (production only).
- **File descriptors: 1 024 shared across concurrent executions** — bounded pools matter; an
  unbounded `MongoClient` can exhaust FDs before Atlas runs out of connections.
- SvelteKit bundles all dynamic routes for a framework into fewest functions, so the 12-function
  Hobby limit is not a concern.
- Use `$env/dynamic/private` for `MONGODB_URI` / `DEVICE_PEPPER`; never `$env/static/public`. SvelteKit
  blocks client imports of server-only modules, but keep secrets in `$lib/server/` to be safe.
- The Atlas↔Vercel **Native Integration** injects `MONGODB_URI` and manages billing; provisioning via
  `vercel install mongodb-atlas` or the dashboard. Pick Flex/Dedicated over the deprecated Serverless
  tier; Free is fine to start but has no backups.

---

## 7. Concrete layout and deployment config

```
content/cards/*.json              # language-neutral deck (source of truth, ticket 03)
content/cards.schema.json         # validated in CI
messages/{en,it,ro}.json          # card + UI text (ticket 07)
src/lib/server/db.ts              # MongoClient singleton (§1.2)
src/lib/server/device.ts          # token, hash, cookie (§3)
src/lib/server/runs.ts            # create/resume/resolve (§4)
src/lib/server/deck.ts            # load+validate deck, draw, locale-resolved card view (§5)
src/lib/server/rng.ts             # (seed, turnIndex) → deterministic RNG
src/routes/game/+page.server.ts   # resume + current card view
src/routes/api/run/+server.ts     # create run
src/routes/api/run/[turn]/+server.ts  # idempotent resolve (§4.4)
src/hooks.server.ts               # ensureDevice (+ Paraglide middleware from 07)
src/app.d.ts                      # Locals.deviceId
```

Deployment:

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'nodejs22.x',
      regions: ['fra1'], // match the Atlas cluster region
      // maxDuration is set per interactive route, not here
    }),
  },
};
```

```ts
// src/routes/api/run/[turn]/+server.ts
export const config = { maxDuration: 15 };
```

Environment variables (Vercel + `.env.local`): `MONGODB_URI`, `MONGODB_DB`,
`MONGODB_MAX_POOL` (optional), `DEVICE_PEPPER` (server secret), plus 07’s i18n vars.

---

## 8. Decisions this forces on other tickets

- **03 (Event Card schema)** — keep the deck structural and language-neutral (07 already requires
  this); define `stage`/`concept`/`weight`/effects precisely enough for a deterministic draw and a
  pure `applyChoice`. Card ids are immutable.
- **05 (metrics / Money Story)** — the report is derived from `run.history` + `run.drawLog`; no
  separate analytics store is needed. Define what the report reads so the Run document fields above
  are sufficient.
- **07 (i18n)** — resolve card text **server-side** into a card view; keep any dynamic-key accessor
  out of the client bundle; record the Paraglide “all locales, no per-locale SvelteKit build” payload
  as a measured risk.
- **11 (spec)** — pin Node runtime, pool numbers, cookie attributes, idempotency predicate, retention
  TTL, and the co-located region. State explicitly that “no accounts” still leaves a pseudonymous
  identifier in scope of GDPR/ePrivacy, with the minimisation/retention notice plan.

## 9. Risks / open questions

1. **Legal, not technical.** The device key is pseudonymous personal data; the consent-free reading
   of a strictly-necessary game cookie needs legal sign-off for IT/RO. Mitigations in §3.4.
2. **Progress loss on clear** is inherent to account-less design; decide whether the MVP offers the
   one-time device-transfer link (§3.2 option 3) or defers it.
3. **Paraglide payload** on SvelteKit cannot be split per locale yet; measure the client bundle and
   keep card text server-resolved.
4. **Atlas tier choice** (Free vs Flex) affects backups, connection ceiling and cost — decide with
   expected class sizes; alarm on connections from day one.
5. **SvelteKit 3** will change env access and may change adapter options; pin versions and treat the
   upgrade as a separate ticket.

---

## Sources

- SvelteKit adapter-vercel (usage, runtime, regions, maxDuration, ISR, env, skew protection, `read`,
  Node version) — <https://svelte.dev/docs/kit/adapter-vercel>
- SvelteKit server-only modules — <https://svelte.dev/docs/kit/server-only-modules>
- SvelteKit loading data / cookies in server `load` — <https://svelte.dev/docs/kit/load>
- SvelteKit environment variables — <https://svelte.dev/docs/kit/environment-variables>
- MongoDB Node driver — Manage Connections with Connection Pools (`maxPoolSize`, `minPoolSize`,
  `maxIdleTimeMS`, `waitQueueTimeoutMS`, `MongoClient.close()`, monitoring sockets) —
  <https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/connection-pools/>
- MongoDB Node driver — official Lambda test app using a module-level cached `MongoClient` —
  <https://github.com/mongodb/node-mongodb-native/blob/main/test/lambda/mongodb/app.mjs>
- MongoDB manual — Atlas connection limits (Free/Flex 500 per node; dedicated tiers) —
  <https://www.mongodb.com/docs/manual/reference/limits>
- MongoDB Atlas — Vercel Native Integration (`MONGODB_URI`, `0.0.0.0/0`, provisioning, billing) —
  <https://www.mongodb.com/docs/atlas/reference/partner-integrations/vercel/>
- Vercel — Fluid compute (shared instances/global state, in-function concurrency, bytecode caching,
  default/max duration) — <https://vercel.com/docs/functions/fluid-compute>
- Vercel — Functions Limits (300 s/800 s/1 800 s, 4.5 MB body, 1 024 FDs, bundle size) —
  <https://vercel.com/docs/functions/limitations>
- Vercel — Runtimes (single region default `iad1`, filesystem, archiving, SvelteKit function
  bundling) — <https://vercel.com/docs/functions/runtimes>
- Vercel — Edge Runtime (Web-API subset, no Node APIs, migrate-to-Node recommendation, streaming
  limits) — <https://vercel.com/docs/functions/runtimes/edge>
- Vercel — Connection pooling with Functions (global pool, rolling releases, leaked connections) —
  <https://vercel.com/kb/guide/connection-pooling-with-functions>
- Vercel — The real serverless compute-to-database connection problem, solved —
  <https://vercel.com/blog/the-real-serverless-compute-to-database-connection-problem-solved>
- Vercel — How to stop Functions from timing out (always return, check upstream latency) —
  <https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out>
- Vercel — Storage overview (co-locate data and functions; Marketplace Redis for rate limiting) —
  <https://vercel.com/docs/storage>
- Vercel — WAF rate limiting (Hobby 1 rule, IP/JA4 keys, fixed window 10 s–10 min) —
  <https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting>
- WebKit — Full third-party cookie blocking and more (7-day cap on script-writable storage) —
  <https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/>
- WebKit — CNAME cloaking and bounce tracking defense (7-day cap on responses from other IPs) —
  <https://webkit.org/blog/11338/cname-cloaking-and-bounce-tracking-defense>
- ICO — What is personal data? (online/cookie identifiers; pseudonymised data remains personal) —
  <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/personal-information-what-is-it/what-is-personal-data/what-is-personal-data>
- ICO — When is consent appropriate? (PECR/ePrivacy consent for cookies) —
  <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/when-is-consent-appropriate>
- Article 29 WP — Opinion 9/2014 on device fingerprinting and ePrivacy Art. 5(3) —
  <https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2014/wp224_en.pdf>
- Paraglide — Architecture (messages are functions, bundler tree-shakes) —
  <https://paraglidejs.com/architecture>
- Paraglide — Compiling messages (per-message per-locale output; experimental per-locale builds reject
  SvelteKit) — <https://paraglidejs.com/compiling-messages>
