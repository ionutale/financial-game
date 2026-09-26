/**
 * Domain types for the game. Pure data — no Svelte, no Mongo, no DOM.
 * Vocabulary follows CONTEXT.md.
 */

export type Phase = 'plan' | 'event' | 'resolve' | 'done';

export type ConceptId =
	| 'needs_wants'
	| 'earning_work'
	| 'budgeting'
	| 'saving_goals'
	| 'interest'
	| 'credit'
	| 'investing'
	| 'tax_insurance_scams';

export type CardKind = 'decision' | 'shock' | 'risk_moment' | 'scam' | 'stage_up';

export type Category = 'need' | 'want' | 'save';

export type PathId = 'study' | 'work';

export type Branch = 'shared' | 'study' | 'work';

/** A Choice Effect, restricted in slice 1 to what the loop itself applies. */
export interface Choice {
	id: string;
	label: string;
	/** Money spent, drawn from `category`'s envelope pot. */
	cost?: number;
	/** Money received. */
	gain?: number;
	/** Free Time delta. Negative costs hours; positive returns them. */
	freeTime?: number;
	category?: Category | null;
	/** Cost when the player holds insurance — a shock the cover absorbs. */
	insuredCost?: number;
	feedback: string;
	sets?: {
		insurance?: boolean;
		bnpl?: number;
		path?: PathId;
		overdraft?: number;
		minimumStreak?: number;
		/** Plant this Thread when the Choice is taken (ticket 03). */
		thread?: string;
	};
}

export interface Card {
	id: string;
	kind: CardKind;
	stages: number[];
	title: string;
	situation: string;
	odds?: string;
	concept?: ConceptId | null;
	branch?: Branch;
	weight?: number;
	/** Authoring metadata, never shown (ticket 03). */
	teaches?: string;
	/** Conditions a Run must satisfy before this card can be dealt (ticket 03). */
	requires?: string[];
	/** The live Thread this card resolves when played (ticket 03). */
	resolves?: string;
	choices: Choice[];
}

export interface Pots {
	need: number;
	want: number;
	save: number;
}

/** Where a payment came from. The cascade, made visible. */
export interface PayResult {
	fromCash: number;
	fromSavings: number;
	toDebt: number;
}

/** What a spending draw consumed. */
export interface DrawResult {
	fromPot: number;
	fromSave: number;
	toDebt: number;
}

export interface Close {
	income: number;
	spentNeed: number;
	spentWant: number;
	obligations: number;
	obligationCascade: PayResult;
	bnpl: PayResult | null;
	interest: number;
	/** Net worth when the month opened, before income landed. */
	netWorthBefore: number;
	netWorthAfter: number;
	/** The month's real movement: income and interest in, spending and obligations out. */
	monthChange: number;
	adherence: { need: boolean; want: boolean };
	nextObligations: number;
}

/** One month's record, kept for the Money Story (ticket 05). */
export interface MonthSnapshot {
	month: number;
	netWorth: number;
	savings: number;
	debt: number;
	income: number;
	/** What actually moved into savings this month. */
	saved: number;
	spentNeed: number;
	spentWant: number;
	interest: number;
	/** True when both Need and Want stayed inside their envelopes. */
	insideBudget: boolean;
}

/** One live Thread (ticket 03): a consequence planted by a Choice, due to resolve. */
export interface ThreadState {
	id: string;
	/** The month it was planted, which fixes the deadline. */
	since: number;
}

export interface RunState {
	month: number; // 1..60
	stage: number; // 1..5
	age: number;
	path: PathId | null;

	cash: number;
	pots: Pots;
	savings: number;
	fund: number;
	debt: number;
	score: number | null; // stays null until the credit slice

	freeTimeMax: number;
	freeTime: number;
	hours: number;
	income: number;

	need: number;
	want: number;
	saveAlloc: number;
	spent: { need: number; want: number };

	insurance: boolean;
	bnpl: { amount: number; monthsLeft: number } | null;
	obligations: number;
	/** Cumulative inflation applied to Obligations across the run. */
	inflationIndex: number;
	/** Net worth as this month opened, so the close can show the month's real movement. */
	netWorthAtStart: number;

	phase: Phase;
	card: Card | null;
	chosen: string | null;
	feedback: string | null;
	cascade: DrawResult | null;
	close: Close | null;
	log: Array<{ month: number; card: string; choice: string }>;

	/** Prototype/test scaffolding: force the next card to be drawn. */
	forcedCard: string | null;

	/** The previous month's plan, so it can be repeated (ticket 04). */
	lastPlan: { hours: number; need: number; want: number } | null;

	/** The three-screen intro (ticket 04) shows before the first month. */
	showIntro: boolean;

	/** The Stage-3 "hours are the money" hint, retired once hours are set (ticket 17). */
	workHintDone: boolean;

	/** Seeds the per-Turn draw (ticket 03). Same seed, same Run. */
	seed: number;

	/** Turning points, for the Money Story (ticket 05). */
	flags: Array<{ month: number; kind: string }>;

	/** The single live Thread, or null (ticket 03). At most one at a time. */
	thread: ThreadState | null;

	/** One record per closed month, for the Money Story (ticket 05). */
	history: MonthSnapshot[];
}

export type Action =
	| { type: 'SET_HOURS'; hours: number }
	| { type: 'SET_NEED'; amount: number }
	| { type: 'SET_WANT'; amount: number }
	| { type: 'REPEAT_PLAN' }
	| { type: 'CONFIRM_PLAN' }
	| { type: 'CHOOSE'; choiceId: string }
	| { type: 'CONTINUE' }
	| { type: 'NEXT_MONTH' }
	| { type: 'JUMP_STAGE'; stage: number }
	| { type: 'FORCE_CARD'; id: string }
	| { type: 'DISMISS_INTRO' }
	| { type: 'NEW_RUN'; seed: number }
	| { type: 'RESET' };
