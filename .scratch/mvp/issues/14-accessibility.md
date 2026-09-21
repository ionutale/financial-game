# 14 — Accessibility target

Type: grilling
Status: resolved
Blocked by: —

## Question

[11 — Spec assembly](11-spec-assembly.md) must state **testing and acceptance criteria**, and nothing
on the map sets an accessibility bar. Define one the MVP can actually meet and verify.

- **Level**: WCAG 2.2 A / AA, or a documented subset — and which success criteria genuinely apply to
  a touch game rather than a website.
- **Game-specific**: never colour alone (the Need/Want/Save envelopes and the outcome band are
  colour-bearing), no content that requires reacting under time pressure, text scaling that does not
  break the month screen, reduced-motion support, and touch targets sized for one-handed play.
- **Content**: reading level is already bounded by ticket 03 — what else? Screen-reader behaviour
  for an inherently visual game is the hard one; decide whether it is in or explicitly out.
- **Verification**: automated audit, manual pass, or both — and what "done" means for the MVP.
- **Honesty**: what the MVP explicitly does *not* meet, stated rather than implied.

Output: the accessibility commitments the spec states, and how they are verified.

## Answer

Resolved over one grilling round.

**Commitment: WCAG 2.2 AA with a documented subset, and the game fully playable with a screen
reader.** Ticket 13's typographic-first direction is what makes this affordable — the game is real
DOM, not a canvas, so native inputs, buttons, headings and live regions do most of the work.

### Why this is cheap here

No canvas. No drag-only interaction. No real-time gameplay. No time-based media. Most of AA falls
out of doing the DOM properly rather than being retrofitted onto a render loop.

### The documented subset — criteria that do not apply

| Criterion | Why not |
|---|---|
| 1.2.x Time-based Media | No audio or video content. SFX only, and never load-bearing. |
| 2.2.2 Pause, Stop, Hide | No moving, blinking or auto-updating content. A month waits for the player. |
| 2.3.x Seizure / Flashing | Nothing flashes. |
| 2.5.1 Pointer Gestures | No path-based or multipoint gestures. |
| 2.5.4 Motion Actuation | No device-motion input. |
| 3.3.4 Error Prevention (Legal/Financial) | No real transactions. **In-game mistakes are the content, not form errors** — the one genuinely irreversible action, *Delete everything*, carries a typed confirmation. |

Everything else applies, including 4.1.3 Status Messages — which the game actively uses.

### Screen reader: fully playable

- The month screen is semantics, not div soup: the Plan step is three labelled range inputs plus a
  labelled work-hours input; the card is a labelled section; each choice is a button whose
  accessible name includes its cost chips; the Feedback is an `aria-live="polite"` region; the month
  close is a labelled region that **receives focus**.
- The HUD is a labelled group of real values, not a decorative bar.
- The stats sheet is a real table with headers.
- Focus order follows the loop: plan → card → feedback → close → next month.
- Illustrations carry alt text; purely decorative ones are `alt=""`.
- A **keyboard-only path** is mandatory and is one of the manual checks.

### No timers, ever

Nothing requires reacting within a time limit — no countdowns, no auto-advance, no expiring
prompts. This removes 2.2.1 entirely, and it costs nothing because the game never rewards speed.

### Text scaling

The month screen survives **200% text zoom** (1.4.4) and reflows without clipping or horizontal
scrolling (1.4.10). Practical constraint for the build: **no fixed heights on text containers**. The
envelope bars and the sparkline are SVG, and neither is ever the only carrier of a value.

### Colour

Carried over from [13](13-art-and-audio.md): **colour never carries meaning alone.** The envelopes
are labelled, the outcome band carries its word, the chips carry text, the crash marker is labelled
on the chart. Contrast: body text ≥ 4.5:1, large text and UI components ≥ 3:1, with the single
accent checked against the single light surface.

### Touch and motion

- Primary actions are **≥ 44 × 44 CSS px** — above AA's 24px minimum, because one-handed phone play
  is the whole design.
- Destructive actions confirm; a mis-tap can never delete progress.
- `prefers-reduced-motion` is respected: animation collapses to instant state change, and **no
  meaning is carried by motion alone**.

### Sound

Off by default, never load-bearing, every sound with a visual counterpart. Playable muted — and that
is a test, not a hope.

### Verification

- **CI**: axe via Playwright across the month screen, close sheet, stats sheet and Settings, plus a
  Lighthouse pass.
- **Manual, per release**: play a month **muted** · play at **200% zoom** · play **keyboard-only** ·
  play with **colour removed** (greyscale).
- **"Done" for the MVP** = the automated suite green *and* all four manual passes performed, with
  any failures filed as issues rather than noted.

### Explicitly not met — stated, not implied

- No AAA anywhere.
- No audio description for illustrations; they carry text alternatives and are never the sole carrier
  of meaning.
- No dyslexia-friendly font toggle in the MVP — a v2 candidate, recorded.
- No dark mode (per [13](13-art-and-audio.md)), so no dark-mode contrast pass.
- No captions or sign language, because there is no time-based media.
- No cognitive-load certification beyond the reading limits already set by
  [03](03-event-card-schema.md).

### Consequence for other tickets

- **[11](11-spec-assembly.md)** must carry this subset, the four manual passes, and the "done"
  definition as acceptance criteria.
- **The build** inherits one hard rule: no fixed heights on text containers in the month screen.
