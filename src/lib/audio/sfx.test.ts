import { describe, expect, it } from 'vitest';
import {
	playCue,
	readSfxEnabled,
	scheduleCue,
	setSfxEnabled,
	SFX_CUES,
	SFX_STORAGE_KEY,
	writeSfxEnabled,
	type PreferenceStorage,
	type SfxContextLike,
	type SfxGain,
	type SfxOscillator,
	type SfxParam
} from './sfx';

/**
 * Ticket 30's sound gate, in two halves. The preference half drives the
 * storage seam; the bank half drives a recording fake of the Web Audio calls,
 * so what the browser would hear is asserted note by note. No real audio is
 * played in tests, and none of these tests can produce sound in CI.
 */

/** An in-memory `localStorage` with the seam's shape. */
function memory(initial: Record<string, string> = {}) {
	const data = new Map(Object.entries(initial));
	return {
		data,
		getItem: (key: string) => data.get(key) ?? null,
		setItem: (key: string, value: string) => void data.set(key, value)
	};
}

describe('the sound preference (ticket 30)', () => {
	it('is off unless the stored token is exactly "on"', () => {
		expect(readSfxEnabled(null)).toBe(false);
		expect(readSfxEnabled(memory())).toBe(false);
		expect(readSfxEnabled(memory({ [SFX_STORAGE_KEY]: 'on' }))).toBe(true);
		expect(readSfxEnabled(memory({ [SFX_STORAGE_KEY]: 'off' }))).toBe(false);
		expect(readSfxEnabled(memory({ [SFX_STORAGE_KEY]: 'yes' }))).toBe(false);
	});

	it('writes the choice as an on/off token', () => {
		const storage = memory();
		writeSfxEnabled(storage, true);
		expect(storage.data.get(SFX_STORAGE_KEY)).toBe('on');
		writeSfxEnabled(storage, false);
		expect(storage.data.get(SFX_STORAGE_KEY)).toBe('off');
	});

	it('treats hostile storage as off, and never throws while writing', () => {
		const hostile: PreferenceStorage = {
			getItem() {
				throw new Error('denied');
			},
			setItem() {
				throw new Error('denied');
			}
		};
		expect(readSfxEnabled(hostile)).toBe(false);
		expect(() => writeSfxEnabled(hostile, true)).not.toThrow();
		expect(() => writeSfxEnabled(null, true)).not.toThrow();
	});
});

interface ParamEvent {
	kind: 'set' | 'linear' | 'exponential';
	value: number;
	at: number;
}

type RecordingParam = SfxParam & { events: ParamEvent[] };

function recordingParam(): RecordingParam {
	const events: ParamEvent[] = [];
	return {
		events,
		setValueAtTime: (value, at) => void events.push({ kind: 'set', value, at }),
		linearRampToValueAtTime: (value, at) => void events.push({ kind: 'linear', value, at }),
		exponentialRampToValueAtTime: (value, at) =>
			void events.push({ kind: 'exponential', value, at })
	};
}

interface RecordingOscillator extends SfxOscillator {
	frequency: RecordingParam;
	started: number[];
	stopped: number[];
}

interface RecordingGain extends SfxGain {
	gain: RecordingParam;
}

/** A context that records everything `scheduleCue` does, and nothing else. */
function fakeContext() {
	const oscillators: RecordingOscillator[] = [];
	const gains: RecordingGain[] = [];
	const transport = { currentTime: 5 };
	const ctx: SfxContextLike = {
		get currentTime() {
			return transport.currentTime;
		},
		destination: {},
		createOscillator: () => {
			const osc: RecordingOscillator = {
				type: 'sine',
				frequency: recordingParam(),
				started: [],
				stopped: [],
				connect: () => {},
				start: (when = 0) => void osc.started.push(when),
				stop: (when = 0) => void osc.stopped.push(when)
			};
			oscillators.push(osc);
			return osc;
		},
		createGain: () => {
			const gain: RecordingGain = { gain: recordingParam(), connect: () => {} };
			gains.push(gain);
			return gain;
		}
	};
	return { ctx, oscillators, gains };
}

describe('the cue bank (ticket 30)', () => {
	it('is four cues, every note quiet, tonal and time-ordered', () => {
		expect(Object.keys(SFX_CUES).sort()).toEqual(['choice', 'crash', 'month_close', 'stage_up']);
		for (const [cue, notes] of Object.entries(SFX_CUES)) {
			expect(notes.length, cue).toBeGreaterThan(0);
			let previous = 0;
			for (const note of notes) {
				expect(note.freq, cue).toBeGreaterThan(50);
				expect(note.freq, cue).toBeLessThan(2000);
				expect(note.at, cue).toBeGreaterThanOrEqual(previous);
				expect(note.duration, cue).toBeGreaterThan(0);
				expect(note.gain, cue).toBeGreaterThan(0);
				expect(note.gain, cue).toBeLessThanOrEqual(0.05);
				previous = note.at;
			}
		}
	});

	it('schedules exactly the table, note for note', () => {
		const { ctx, oscillators, gains } = fakeContext();
		scheduleCue(ctx, 'stage_up', 10);

		const notes = SFX_CUES.stage_up;
		expect(oscillators).toHaveLength(notes.length);
		expect(gains).toHaveLength(notes.length);

		notes.forEach((note, i) => {
			const osc = oscillators[i];
			const gain = gains[i];
			expect(osc.type).toBe(note.type);

			const at = 10 + note.at;
			expect(osc.started[0]).toBeCloseTo(at, 5);
			expect(osc.stopped[0]).toBeCloseTo(at + note.duration + 0.02, 5);

			// The pitch is set first, at the note's own start.
			expect(osc.frequency.events[0]).toEqual({ kind: 'set', value: note.freq, at });

			// The envelope: silent, attack, then a near-silent release.
			expect(gain.gain.events[0].kind).toBe('set');
			expect(gain.gain.events[0].value).toBe(0);
			expect(gain.gain.events[1].kind).toBe('linear');
			expect(gain.gain.events[1].value).toBe(note.gain);
			const release = gain.gain.events[2];
			expect(release.kind).toBe('exponential');
			expect(release.value).toBeLessThan(note.gain);
			expect(release.at).toBeCloseTo(at + note.duration, 5);
		});
	});

	it('glides the crash thud down to its end pitch', () => {
		const { ctx, oscillators } = fakeContext();
		scheduleCue(ctx, 'crash', 0);

		const note = SFX_CUES.crash[0];
		expect(note.glide).toBeDefined();
		const events = oscillators[0].frequency.events;
		expect(events[0]).toEqual({ kind: 'set', value: note.freq, at: 0 });
		expect(events[1].kind).toBe('exponential');
		expect(events[1].value).toBe(note.glide);
	});

	it('stays silent when sound is off, or when Web Audio is unavailable', () => {
		setSfxEnabled(false);
		expect(() => playCue('choice')).not.toThrow();

		// No AudioContext in the test environment: the cue is a no-op, not a crash.
		setSfxEnabled(true);
		expect(() => playCue('choice')).not.toThrow();
		setSfxEnabled(false);
	});
});
