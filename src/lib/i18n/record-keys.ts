/**
 * The key convention for the record and the ending (fun-pass ticket 11): the
 * Reflections, the Chapter Titles and the Epilogue are derived from
 * language-neutral ids at render time, so their keys are built here rather
 * than typed by Paraglide — the same reason `card-keys.ts` exists for the
 * deck. Type-only imports keep this module dependency-free at runtime.
 */
import type { ChapterTitleId } from '$lib/game/journal';
import type { OutcomeBand } from '$lib/game/metrics';
import type { ReflectionId } from '$lib/game/reflections';
import type { PathId } from '$lib/game/types';

/** A Reflection line: `reflection_<id>` (the ids live in `game/reflections.ts`). */
export const reflectionKey = (id: ReflectionId): string => `reflection_${id}`;

/** A Chapter Title: `chapter_title_<slug>` (the slugs live in `game/journal.ts`). */
export const chapterTitleKey = (id: ChapterTitleId): string => `chapter_title_${id}`;

/** The Epilogue: `epilogue_<band>_<path>` — the six authored closes. */
export const epilogueKey = (band: OutcomeBand, path: PathId): string =>
	`epilogue_${band}_${path}`;
