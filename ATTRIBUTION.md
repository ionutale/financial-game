# Attribution & rights

The game's art and audio are **self-authored** and dedicated to the public domain under
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). No credit line is required and none
is shown in the UI — ticket 13's rule of thumb: if a licence requires a credit line *in the UI*, the
asset does not ship.

Rules this file exists to enforce (ticket 13):

- **Art and audio: CC0 only.** Every shipped asset has a row below; a missing row fails review.
- **Icons and fonts: permissive allowed** (MIT / ISC / Apache-2.0 / OFL). They are dependencies with
  their own licence files, not assets, and are not listed here.

## Beat illustrations — ticket 30

Ten hand-authored SVG pieces live inside one component, `src/lib/components/BeatArt.svelte`; the
beat map that chooses them is `src/lib/game/beats.ts`, and their alt text is in the three message
catalogues (`beat_art_<id>_alt`). There are no image files to ship: the drawings use the app's
design tokens (`--money`, `--ink-40`, `--wash`, …) directly. The Fork and the Money Story panel are
the two pieces outside the spine map's card beats.

| Asset (beat id) | Drawn in | Source | Licence |
| --- | --- | --- | --- |
| `allowance` | `BeatArt.svelte` | self-authored | CC0-1.0 |
| `phone_plan` | `BeatArt.svelte` | self-authored | CC0-1.0 |
| `first_payslip` | `BeatArt.svelte` | self-authored | CC0-1.0 |
| `bnpl_offer` | `BeatArt.svelte` | self-authored | CC0-1.0 |
| `first_taxed_payslip` | `BeatArt.svelte` | self-authored | CC0-1.0 |
| `first_statement` | `BeatArt.svelte` | self-authored | CC0-1.0 |
| `scam` | `BeatArt.svelte` | self-authored | CC0-1.0 |
| `crash` | `BeatArt.svelte` | self-authored | CC0-1.0 |
| `fork` | `BeatArt.svelte` | self-authored | CC0-1.0 |
| `money_story` | `BeatArt.svelte` | self-authored | CC0-1.0 |
| The silhouette avatar | `src/lib/components/Avatar.svelte` | self-authored (ticket 13) | CC0-1.0 |

## Sound — ticket 30

| Asset | Made by | Source | Licence |
| --- | --- | --- | --- |
| The SFX bank: `choice`, `month_close`, `stage_up`, `crash` | Web Audio synthesis in `src/lib/audio/sfx.ts` | self-authored | CC0-1.0 |

No sampled audio ships. If a CC0 sting is ever added for a big beat, the rule above applies: add a
row here with its source URL and licence.
