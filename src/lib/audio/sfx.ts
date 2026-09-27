/**
 * The sound effects bank (ticket 30; fun-pass ticket 04 adds `deal` and
 * `payoff`): seven synthesised cues, off by default, never load-bearing.
 * Every cue has a visual counterpart, the bank is quiet and tonal, and
 * nothing here imports a file — Web Audio makes the sound, so there is no
 * asset to license.
 *
 * Autoplay rules: the AudioContext is created and resumed inside a user
 * gesture, which is where every cue is played from (a choice tap, the month
 * close — or the milestone it carries — a Stage-up, the crash). If the
 * platform has no Web Audio, storage is unavailable, or anything else fails,
 * the game stays silent — sound must never break play.
 *
 * The preference lives in localStorage under `financial-game:sfx`; it is a
 * UI preference, never part of RunState, and it survives a Run being deleted.
 */

/** Preference storage seam: `window.localStorage` in the app, a map in tests. */
export interface PreferenceStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

export const SFX_STORAGE_KEY = 'financial-game:sfx';

/** Off by default: only the literal `on` enables sound. */
export function readSfxEnabled(storage: PreferenceStorage | null | undefined): boolean {
	if (!storage) return false;
	try {
		return storage.getItem(SFX_STORAGE_KEY) === 'on';
	} catch {
		return false;
	}
}

/** Best effort: storage can be full, private or hostile; silence is the fallback. */
export function writeSfxEnabled(
	storage: PreferenceStorage | null | undefined,
	enabled: boolean
): void {
	if (!storage) return;
	try {
		storage.setItem(SFX_STORAGE_KEY, enabled ? 'on' : 'off');
	} catch {
		// The choice still applies for this page load via the in-memory flag.
	}
}

export type SfxCue = 'choice' | 'month_close' | 'stage_up' | 'crash' | 'milestone' | 'deal' | 'payoff';

export interface SfxNote {
	freq: number;
	/** Seconds after the cue starts. */
	at: number;
	/** Seconds from the note's attack to its release. */
	duration: number;
	/** Peak gain. The bank is deliberately quiet: nothing exceeds 0.05. */
	gain: number;
	type: OscillatorType;
	/** End frequency, for a glide (the crash thud slides downward). */
	glide?: number;
}

/**
 * The cue table. Frequencies are real notes so the bank stays tonal: the
 * choice is a short fifth, the month close two rising ticks, the Stage-up a
 * C–E–G arpeggio, the crash one low sine sliding down, the milestone
 * (gamification ticket 06) the close's two ticks fused into one rising note —
 * positive-only by construction, because only a Milestone plays it.
 *
 * Fun-pass ticket 04 adds two: the deal (a card arriving: two soft notes a
 * major third apart) and the payoff (a Thread coming back with money: a
 * rising B–E–B arpeggio that closes on its longest note). The payoff is
 * positive-only by the mapping that plays it — a scam survived is answered in
 * silence — and it replaces the tap's own cue rather than joining it.
 */
export const SFX_CUES: Record<SfxCue, SfxNote[]> = {
	choice: [
		{ freq: 587.33, at: 0, duration: 0.09, gain: 0.022, type: 'triangle' },
		{ freq: 880, at: 0.045, duration: 0.07, gain: 0.012, type: 'triangle' }
	],
	month_close: [
		{ freq: 659.25, at: 0, duration: 0.06, gain: 0.02, type: 'sine' },
		{ freq: 987.77, at: 0.07, duration: 0.08, gain: 0.016, type: 'sine' }
	],
	stage_up: [
		{ freq: 523.25, at: 0, duration: 0.12, gain: 0.02, type: 'triangle' },
		{ freq: 659.25, at: 0.09, duration: 0.12, gain: 0.02, type: 'triangle' },
		{ freq: 783.99, at: 0.18, duration: 0.18, gain: 0.022, type: 'triangle' }
	],
	crash: [{ freq: 138.59, at: 0, duration: 0.5, gain: 0.035, type: 'sine', glide: 55 }],
	milestone: [
		{ freq: 659.25, at: 0, duration: 0.2, gain: 0.022, type: 'sine', glide: 987.77 }
	],
	deal: [
		{ freq: 440, at: 0, duration: 0.07, gain: 0.018, type: 'sine' },
		{ freq: 554.37, at: 0.06, duration: 0.1, gain: 0.016, type: 'sine' }
	],
	payoff: [
		{ freq: 493.88, at: 0, duration: 0.1, gain: 0.018, type: 'triangle' },
		{ freq: 659.25, at: 0.1, duration: 0.12, gain: 0.018, type: 'triangle' },
		{ freq: 987.77, at: 0.2, duration: 0.24, gain: 0.02, type: 'triangle' }
	]
};

/** The slice of the Web Audio API the bank uses — fake-able in tests. */
export interface SfxParam {
	setValueAtTime(value: number, when: number): void;
	linearRampToValueAtTime(value: number, when: number): void;
	exponentialRampToValueAtTime(value: number, when: number): void;
}

export interface SfxOscillator {
	type: OscillatorType;
	frequency: SfxParam;
	connect(destination: unknown): void;
	start(when?: number): void;
	stop(when?: number): void;
}

export interface SfxGain {
	gain: SfxParam;
	connect(destination: unknown): void;
}

export interface SfxContextLike {
	currentTime: number;
	destination: unknown;
	createOscillator(): SfxOscillator;
	createGain(): SfxGain;
}

/** Attack is a hair of the note; release is exponential and near-silent. */
const ATTACK = 0.012;
const FLOOR = 0.0001;

/**
 * Schedule one cue on a context. Pure with respect to the context — the tests
 * drive it with a fake and read back exactly what the browser would hear.
 */
export function scheduleCue(ctx: SfxContextLike, cue: SfxCue, when?: number): void {
	const start = when ?? ctx.currentTime + 0.01;
	for (const note of SFX_CUES[cue]) {
		const at = start + note.at;
		const end = at + note.duration;

		const gain = ctx.createGain();
		gain.gain.setValueAtTime(0, at);
		gain.gain.linearRampToValueAtTime(note.gain, at + ATTACK);
		gain.gain.exponentialRampToValueAtTime(FLOOR, end);
		gain.connect(ctx.destination);

		const osc = ctx.createOscillator();
		osc.type = note.type;
		osc.frequency.setValueAtTime(note.freq, at);
		if (note.glide) osc.frequency.exponentialRampToValueAtTime(note.glide, end);
		osc.connect(gain);
		osc.start(at);
		osc.stop(end + 0.02);
	}
}

/** `localStorage`, or null in SSR, private mode, or a hostile embedder. */
function browserStorage(): PreferenceStorage | null {
	try {
		return typeof window === 'undefined' ? null : window.localStorage;
	} catch {
		return null;
	}
}

let enabledCache: boolean | null = null;
let context: AudioContext | null = null;

/** Read once per page load; `setSfxEnabled` keeps it current. */
export function sfxEnabled(): boolean {
	enabledCache ??= readSfxEnabled(browserStorage());
	return enabledCache;
}

/** The Settings toggle. Writes the preference, never the Run. */
export function setSfxEnabled(enabled: boolean): void {
	enabledCache = enabled;
	writeSfxEnabled(browserStorage(), enabled);
}

function audioContext(): SfxContextLike | null {
	if (typeof window === 'undefined') return null;
	if (!window.AudioContext) return null;
	try {
		context ??= new window.AudioContext();
		if (context.state === 'suspended') {
			// Resuming succeeds because cues fire from gestures; if it does not,
			// the next cue tries again and the game is unaffected.
			context.resume().catch(() => {});
		}
		return context;
	} catch {
		return null;
	}
}

/**
 * Whether a cue may sound: the stored preference rules the game, and a
 * preview is an explicit ask that may sound while the game is muted — without
 * ever writing the preference (fun-pass ticket 04).
 */
export function cueAudible(enabled: boolean, preview: boolean): boolean {
	return preview || enabled;
}

/**
 * Play one cue. A no-op when sound is off, when Web Audio is missing, or when
 * anything at all goes wrong — never thrown, never awaited, never required.
 */
export function playCue(cue: SfxCue): void {
	if (!cueAudible(sfxEnabled(), false)) return;
	schedule(cue);
}

/**
 * The Settings previews (fun-pass ticket 04): the one path that may sound
 * while the toggle is off, so the bank is discoverable before it is enabled.
 * Still a gesture, still best-effort, and it never changes the preference.
 */
export function previewCue(cue: SfxCue): void {
	if (!cueAudible(sfxEnabled(), true)) return;
	schedule(cue);
}

function schedule(cue: SfxCue): void {
	try {
		const ctx = audioContext();
		if (ctx) scheduleCue(ctx, cue);
	} catch {
		// Silence is always an acceptable outcome.
	}
}
