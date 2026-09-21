/**
 * A deterministic generator per Turn (ticket 03): the same seed and the same
 * month always deal the same card, so a Run is reproducible from its seed.
 */
export function turnRng(seed: number, turnIndex: number): () => number {
	let a = (seed ^ Math.imul(turnIndex + 1, 0x9e3779b9)) >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** A seed for a fresh Run. Kept in the Run so a replay can differ. */
export function freshSeed(): number {
	return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
