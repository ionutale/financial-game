# 06 — SvelteKit + Vercel + MongoDB Atlas architecture

Type: research
Status: resolved
Blocked by: —

## Question

Research the architecture for a mobile-first SvelteKit 5 game on Vercel backed by MongoDB Atlas,
with **anonymous, device-keyed progress** and **no accounts**.

- **Driver & pooling**: which MongoDB driver pattern is correct for Vercel's serverless model
  (connection reuse, `maxPoolSize`, cold starts, Edge vs Node runtime).
- **Data placement**: what lives in MongoDB (event-deck content vs anonymous progress) and what
  lives client-side, given "content + anonymous progress" was chosen.
- **Anonymous identity**: how a device-keyed Anonymous Profile is created and transmitted without
  collecting personal data, and what happens when storage is cleared.
- **Seeded runs**: where the seed lives and how a run is persisted and resumed.
- **Content delivery**: how the JSON event deck reaches the client (build-time import vs API) and
  the i18n implications.
- **Pitfalls**: rate limiting, cost, serverless timeouts, and known Atlas/Vercel gotchas.

Output: a short findings document the spec's architecture and 09's prototype can rely on.

## Answer

Resolved 2026-09-20. Findings: [`../research/06-architecture.md`](../research/06-architecture.md).

**Verdict.** Deploy SvelteKit 5 (Svelte 5 + SvelteKit 2.70.x) on Vercel **Node.js** functions — the
`mongodb` driver cannot run on the Edge runtime and Vercel now recommends Node anyway. Use one
official `mongodb` `MongoClient` cached in module scope (Fluid Compute shares instances, so the pool
is reused): `maxPoolSize` ~5–10, `minPoolSize: 0`, `maxIdleTimeMS` ~30 s,
`serverSelectionTimeoutMS` ~5 s, and never `close()` per request. Co-locate the Atlas cluster with the
function region.

**Data.** Atlas stores only the **Anonymous Profile and Run state**. The deck structure and all text
stay build-time server assets in git (07 already compiles all card text via Paraglide); git remains
the source of truth, with an optional Atlas overlay only if post-MVP wants hot authoring. The client
receives **one server-resolved card view per turn** (situation + choice labels for the active locale);
effects, weights and the rest of the deck never ship — this also sidesteps Paraglide's dynamic-key
tree-shaking problem and its lack of per-locale builds on SvelteKit.

**Identity.** On first request, mint 32 random bytes, set them in a server-set `httpOnly; Secure;
SameSite=Lax` cookie, and store only `SHA-256(token + pepper)` as the profile key. No IP/UA/email/
fingerprint. Clearing site data destroys the key and the progress with it — accepted, surfaced in the
UI, with a delete-my-progress action. Note for the spec: a stable device key is **pseudonymous
personal data** under GDPR and ePrivacy/PECR may apply; “no accounts” is not the same as “anonymous”,
so plan minimisation, a retention TTL and a plain-language notice.

**Runs.** Server-generated crypto seed stored on the Run; per-turn PRNG derived from `(seed,
turnIndex)` with an `engineVersion`; resolution is an idempotent optimistic-concurrency
`findOneAndUpdate` keyed on `turnIndex` so retries/double-taps cannot double-apply.

**Ops.** Set `maxDuration` explicitly (~15 s) on interactive routes and fail fast on `serverSelectionTimeoutMS`;
budget Atlas Free/Flex (500 connections/node) against instance count × pool size and alarm on
connections; add one WAF rate-limit rule on `/api/run/*`. Full code sketches, layout and the
connection-ceiling math are in the findings file.
