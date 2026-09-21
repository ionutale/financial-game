# Charting decisions — Financial Game MVP

Record of the grilling that named the destination and mapped the frontier, 2026-09-20.
These are framing decisions; their design detail lives in the ticket that resolves it.

| # | Decision | Answer | Detail ticket |
|---|----------|--------|---------------|
| 1 | Destination | Buildable MVP spec | — |
| 2 | Audience | Teens 13–18 | — |
| 3 | Game shape | Life-sim / virtual economy | 01, 04 |
| 4 | Player frame | One character, life stages, monthly turns | 02, 04 |
| 5 | Time & run length | Monthly turns; 3→**5 in-game years** run | 01, 05 |
| 6 | Concepts | All eight, wide & shallow, unlocked by stage | 02 |
| 7 | Delivery context | Public web app; no adult layer | — |
| 8 | Stack | Locked: SvelteKit + MongoDB Atlas + Vercel + DaisyUI | 06 |
| 9 | Identity | Anonymous-first; **accounts deferred entirely** | 06 |
| 10 | MongoDB role | Content **+** device-keyed anonymous progress (no PII) | 06 |
| 11 | Privacy posture | Dodged by shipping no accounts | 06 |
| 12 | Locale strategy | Translate-only, one economy | 07 |
| 13 | MVP locales | en + it + ro | 07 |
| 14 | Content authoring | Data-driven JSON event deck | 03 |
| 15 | Content budget | **5 years × 1 event/month = 60 cards** | 01, 03 |
| 16 | Success measurement | In-run metrics + end-of-run report | 05 |
| 17 | Look & feel | Flat vector, playful | 09, 10 |
| 18 | World | Modern realistic teen life | 03 |
| 19 | Failure tone | Real consequences, recoverable | 01, 05 |
| 20 | Platform | Mobile-first responsive | 06, 09 |
| 21 | Randomness | Seeded draws from the deck | 03, 06 |
| 22 | Out of scope | Multiplayer/social; leaderboards | — |
| 23 | How design is settled | Later sessions, one ticket at a time | — |
