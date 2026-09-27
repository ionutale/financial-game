# Accessibility

The MVP's accessibility commitment, the automated gates that hold it, and the four manual passes
that remain a human's job. This is the verification half of ticket 14; the target itself is stated
there and repeated here so one file can be read on its own.

## The target

**WCAG 2.2 Level AA with a documented subset, and the game fully playable with a screen reader.**

The game is real DOM — no canvas, no drag-only interaction, no real-time gameplay, no time-based
media — so most of AA falls out of doing the DOM properly rather than being retrofitted.

### The documented subset — criteria that do not apply

| Criterion | Why not |
|---|---|
| 1.2.x Time-based Media | No audio or video content. SFX only, and never load-bearing. |
| 2.2.2 Pause, Stop, Hide | No moving, blinking or auto-updating content. A month waits for the player. |
| 2.3.x Seizure / Flashing | Nothing flashes. |
| 2.5.1 Pointer Gestures | No path-based or multipoint gestures. |
| 2.5.4 Motion Actuation | No device-motion input. |
| 3.3.4 Error Prevention (Legal/Financial) | No real transactions. In-game mistakes are the content, not form errors. The one irreversible action, *Delete everything*, carries a typed confirmation. |

Everything else applies, including **4.1.3 Status Messages** — which the game actively uses.

## The automated gates

| Gate | Tool | Scope | Passes when |
|---|---|---|---|
| axe | `@axe-core/playwright` (axe-core with the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` tag set) | eleven screens: intro/home, Plan (with the Named-Goal ticks), event + Feedback, month close (with its Milestone line), Stats Sheet (with its Milestones and Concept Coverage), state chips, Stage-up (the Fork, with its Year in Review), the Money Story (with its Milestones, Coverage, year-5 recap and inside-budget line), the Journal (empty and populated), privacy policy, Settings | zero violations |
| Lighthouse | Lighthouse Node API, **accessibility category only** | the home screen | score ≥ 0.95 |

The Lighthouse threshold is **0.95, not 1.0** on purpose: the score is weighted, and one
non-AA best-practice audit can shave a few points without breaking a WCAG 2.2 AA commitment. A
real AA regression — contrast, accessible names, roles, the audits axe also watches — costs far
more than 0.05 and lands below the line. Performance and SEO are deliberately not gated: a slow
font load or a missing meta description must not fail an accessibility run.

### Running the gates

```sh
pnpm exec playwright install chromium   # once per machine
pnpm a11y                               # build + serve + axe + Lighthouse, one command
pnpm a11y:axe                           # axe only (starts and stops its own server)
pnpm a11y:lighthouse                    # Lighthouse only (needs a server on :4173)
```

`pnpm a11y` builds with the real adapter and serves the result with `vite preview`. That works
because adapter-vercel leaves the SvelteKit server output in `.svelte-kit/output`, which is exactly
what Vite preview serves — no Vercel runtime needed locally. Preview is a production build: the
scripts pass a throwaway `PROFILE_PEPPER` and set `A11Y_MEMORY_STORE=1`, the explicit opt-in that
lets a production build without Atlas use the in-process store (a production build otherwise
refuses to serve — ticket 32). Set `A11Y_BASE_URL` to audit an already-running server instead.

The whole gate set — type check, unit tests, this accessibility gate and the translation gate — also
runs as one command, `pnpm verify`; see the pre-deploy use in
[deployment.md](deployment.md#7-the-gate-pnpm-verify).

### How the month screens are seeded

`/` mints a fresh seed on every load, so the gate cannot use the UI path for a reproducible card.
Instead `tests/a11y/seed.ts` builds RunState values with a fixed seed (`20260926`) through the
game's own reducer, and `seedRun()` stores one through the real save API (`POST /api/run`) before
loading `/`. That exercises the same loader a real save does; no test-only server seam exists.

### What axe checks, and what it cannot

axe is roughly fifty WCAG-tagged rules run against the live DOM and computed styles: contrast,
accessible names and roles, labels, headings, document title, target size (the AA 24px floor),
language, and so on. It runs on the **reduced-motion path** (`reducedMotion: 'reduce'` in
`playwright.config.ts`): the month screen's 280ms entrance fade would otherwise be sampled
mid-animation and reported as a phantom contrast failure. The finished state is the one that must
pass, and this also exercises the `prefers-reduced-motion` promise.

axe cannot check, and this gate therefore does not prove:

- **keyboard operability**, focus order, visible focus, or focus traps (partly covered by the
  keyboard smoke below, never fully);
- **reduced-motion behaviour** as experienced by a person;
- **200% zoom reflow** as experienced by a person;
- **whether colour removal leaves meaning intact**;
- **screen-reader comprehension** — names can all be present and the result still unusable;
- **the 44px target commitment** — axe checks AA's 24px, ticket 14 commits to 44px for one-handed
  play;
- interaction states (hover, focus-visible, disabled), content quality, and anything that only
  appears after a particular sequence of play.

## The four manual passes

Per release, on the built app. Failures are filed as issues, not noted and forgotten.

### 1. Muted

**Steps:** turn the device volume to zero (or mute the system). Play from the intro through a full
month — Plan, card, Feedback, close — then through the gamification surfaces: a Stage-up with its
Year in Review, a Month Close with a Milestone line, the Stats Sheet's Milestones and Concept
Coverage, a finished Run's Money Story and the Journal. Nothing important may arrive only as sound;
every one of those blocks must read without it.

**Status now:** the SFX bank ships (ticket 30) and stays off until the player switches it on in
Settings; the suite proves the off-by-default default, the toggle and its persistence. Gamification
ticket 06 adds the one `milestone` cue on the same terms — a Milestone month hears it instead of
the close's ticks, and the text line already carries the event. The mute pass itself is
**human-owed** from the first release that ships SFX: ticket 14 requires sound off by default,
never load-bearing, and every sound with a visual counterpart.

### 2. Zoomed

**Steps:** on desktop, set browser zoom to 200% and play the month screen: nothing clips, nothing
scrolls sideways, every control stays reachable. Then try text-only zoom (Firefox → View → Zoom →
Zoom Text Only) and a narrow window. Repeat on the Plan step, the month close and the Stats Sheet.

**Status now:** an automated proxy exists in `tests/a11y/zoom.spec.ts` — each key screen is rendered
at a 320px viewport (what a 1280px window becomes at 400% zoom, WCAG 1.4.10) and again with the
root font at 200% (WCAG 1.4.4), and must have no horizontal overflow. **Human-owed:** the visual
judgement — clipped versus merely narrow, legibility at zoom, and the interactive states a
screenshot-height check cannot see.

### 3. Keyboard-only

**Steps:** put the mouse away. From the intro: Tab to Next, Enter, twice more. On the Plan step Tab
to each range and move it with the arrow keys, then Enter on *Start the month*. Tab to a Choice and
Enter; Enter on Continue; Enter on Next month. Open and close the Stats Sheet with the keyboard
alone. Throughout: focus is always visible, never trapped, never lands somewhere unreachable.

**Status now:** `tests/a11y/zoom.spec.ts` drives intro → Plan → work hours (ArrowRight) → month
start → a reachable Choice using only Tab and Enter; axe verifies the names and roles; the Stats
Sheet's own focus trap and Escape-to-close are implemented in `StatsSheet.svelte`; and the month
close test in `tests/a11y/screens.spec.ts` proves the close arrives as a labelled region whose
heading receives focus — the focus move ticket 14 promised, which axe cannot see (ticket 25).
**Human-owed:** a complete month played keyboard-only, the visible-focus judgement, and hearing the
month close actually announced — a tool can prove focus landed on the heading, only a person can
hear that it was spoken and made sense.

### 4. Greyscale

**Steps:** enable the OS greyscale filter (macOS: System Settings → Accessibility → Display →
Colour Filters → Greyscale; Windows: Settings → Accessibility → Colour filters → Grayscale), or
add `html { filter: grayscale(1) }` in devtools. Play a month and check that Need / Want / Save
remain distinguishable, the outcome band still reads, choice chips still name their costs, and the
crash marker is still labelled on the chart. Then check the gamification blocks: the Month Close's
Milestone line, the Stats Sheet's and Money Story's Milestones and Coverage words (Introduced /
Experienced / Not yet), the Stage-up's Year in Review, and the Journal's Chapters, coverage and
collected Milestones. Every state there is a word; colour may never be the only difference.

**Status now: human-owed, entirely.** No tool can judge whether meaning survives colour removal.
The DOM is built for it — every colour-bearing value also carries text (envelope labels, the
outcome word, chips, chart annotations) — but that is a design property to be seen, not asserted.

## What "done" means for the MVP

The automated suite is green **and** all four manual passes have been performed, with any failures
filed as issues. The gates run in `.github/workflows/a11y.yml` on every push and pull request;
reports (`reports/axe.json`, `reports/axe-html/`, `reports/lighthouse-accessibility.*`) and failure
traces (`test-results/`) are uploaded as workflow artifacts on every run.

## Explicitly not met

- No AAA anywhere.
- No audio description for illustrations; they carry text alternatives and are never the sole
  carrier of meaning.
- No dyslexia-friendly font toggle in the MVP — a v2 candidate.
- No dark mode, so no dark-mode contrast pass.
- No captions or sign language, because there is no time-based media.
- No cognitive-load certification beyond the reading limits set by ticket 03.

## Maintenance notes

- **Adding a screen to the gate:** build its deterministic state in `tests/a11y/seed.ts`, add one
  axe test in `tests/a11y/screens.spec.ts`, and (if it is a key screen) one reflow entry in
  `tests/a11y/zoom.spec.ts`. Do not add axe `exclude`s to make a run green; fix the thing.
- The first run of this gate forced these fixes, kept here as context:
  - WCAG 2.4.2 document titles on every route;
  - an accessible name for the work-hours range;
  - `--money` darkened from `#1f6feb` to `#1a5ec7` (the old accent measured 4.18:1 on paper,
    under AA's 4.5:1 for small text, and 4.00:1 on its own wash);
  - the `.kicker` class moved into Tailwind's `components` layer so `text-[var(--money)]`
    overrides actually apply;
  - `max-w-full` on the Settings delete button, so its label can wrap instead of pushing the
    document 10px sideways at 200% text.
- Later gate runs forced their own fixes, kept for the same reason (gamification tickets 03–04):
  - the HUD's cash / free-time row gained `flex-wrap` — its 320px + 200%-text overflow made the
    reflow proxy flaky;
  - `app.css` darkened `--up` / `--down` (`#16794a` → `#126b41`, `#ad4f1c` → `#9c4413`) and added
    the explicit `--up-wash` / `--down-wash` tints: the Money Story's band chip joined the gate and
    measured 4.17:1 / 4.11:1 on its own wash, under AA's 4.5:1 — the `--money` precedent above,
    applied again.
- The Feedback's `aria-live="polite"` region, promised by ticket 14 but missing from the build,
  was added too — axe cannot detect that one.
- **Judge calls on record:** axe runs with reduced motion (see above); Lighthouse gates only the
  accessibility category; the `landmark-one-main` audit is the kind of best-practice item the 0.95
  threshold tolerates, though the intro was given a `<main>` anyway.
- **The month close's announcement (ticket 25):** a named `<section>` — an implicit `region`, so the
  explicit `role="region"` is left off and Svelte's `a11y_no_redundant_roles` warning stays quiet —
  labelled by the heading that takes focus (`tabindex="-1"`) when the close appears. **No live
  region** — the focus move already announces the heading, and one would say it twice; **no focus
  trap** — the close is inline, not modal, so Tab must still reach the HUD and the Stats pill.
  Focus moves only on arrival, after CONTINUE, so the Feedback's own live region is never
  interrupted.
- **A saved Run can load straight into the close** (the write at CONTINUE is the month's snapshot).
  Focusing the heading on mount is deliberate there too: a full page load announces the document,
  and the focus move says which screen the save restored.
