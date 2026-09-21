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
	sets?: { insurance?: boolean; bnpl?: number; path?: PathId };
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
	netWorthBefore: number;
	netWorthAfter: number;
	adherence: { need: boolean; want: boolean };
	nextObligations: number;
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

	phase: Phase;
	card: Card | null;
	chosen: string | null;
	feedback: string | null;
	cascade: DrawResult | null;
	close: Close | null;
	log: Array<{ month: number; card: string; choice: string }>;

	/** Prototype/test scaffolding: force the next card to be drawn. */
	forcedCard: string | null;
}

export type Action =
	| { type: 'SET_HOURS'; hours: number }
	| { type: 'SET_NEED'; amount: number }
	| { type: 'SET_WANT'; amount: number }
	| { type: 'CONFIRM_PLAN' }
	| { type: 'CHOOSE'; choiceId: string }
	| { type: 'CONTINUE' }
	| { type: 'NEXT_MONTH' }
	| { type: 'JUMP_STAGE'; stage: number }
	| { type: 'FORCE_CARD'; id: string }
	| { type: 'RESET' };
