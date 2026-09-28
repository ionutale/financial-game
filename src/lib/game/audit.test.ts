/**
 * The phantom-save audit (fun-pass ticket 10, design §3.5, ADR-0006).
 *
 * The rule: **no Choice may withdraw from Save while promising to set money
 * aside.** Where the fiction has a deadline, a Thread carries the commitment
 * and the money stays in the Plan's Save envelope; where it does not, the
 * choice costs time and the deposit stays where it truly lives.
 *
 * This is the review record, as a test: the audited Choices and what the audit
 * decided for each, plus a deck-wide shape pin — every `cost` on
 * `category: 'save'` must be an accounted-for, genuinely-spent payment. A new
 * save-cost Choice fails here until it is audited.
 */
import { describe, expect, it } from 'vitest';
import { CARDS, cardById } from './cards';
import type { Choice } from './types';

interface Audited {
	card: string;
	choice: string;
	/**
	 * The cost the Choice has earned: `null` — the withdrawal is gone and the
	 * money stays in the envelope; a number — a real payment for something the
	 * fiction truthfully buys.
	 */
	cost: number | null;
	/** The Thread that carries the commitment when the fiction has a deadline. */
	thread?: string;
	/** Why this line stands, for the reader. */
	note: string;
}

/**
 * The audit list (design §3.5 + the sweep): the six named Choices, plus every
 * other save-cost whose copy promises the money is kept.
 */
const AUDITED: Audited[] = [
	{
		card: 'interest_first',
		choice: 'more',
		cost: null,
		note: 'the twenty lives in the Plan’s Save envelope; the choice spends an hour, not the money'
	},
	{
		card: 'quarterly_interest',
		choice: 'leave',
		cost: null,
		note: 'leaving the nine compounding takes nothing out; the old cost was the opposite of the copy'
	},
	{
		card: 'savings_milestone',
		choice: 'add',
		cost: null,
		note: 'the month’s saving stays in the envelope; the milepost costs attention, not twenty'
	},
	{
		card: 'savings_goal',
		choice: 'bike',
		cost: null,
		note: 'naming the fund puts a face on the envelope; no withdrawal was ever in the fiction'
	},
	{
		card: 'hype_trainers',
		choice: 'save',
		cost: null,
		thread: 'trainer_drop',
		note: 'the drop has a date: the Thread carries the commitment, the money stays in the envelope'
	},
	{
		card: 'trip_deposit',
		choice: 'deposit',
		cost: 20,
		thread: 'trip_balance',
		note: 'a real deposit paid to the trip; the Thread carries the balance due in two months'
	},
	{
		card: 'grandma_windfall',
		choice: 'save',
		cost: null,
		note: 'the windfall lands for real (gain 50); the choice keeps it, and the envelope holds it'
	},
	{
		card: 'bnpl_pressure',
		choice: 'save',
		cost: null,
		note: 'the money waits in the envelope; the choice costs the two months of waiting'
	},
	{
		card: 'student_budget',
		choice: 'spread',
		cost: null,
		note: 'the term’s rent is ring-fenced by the plan; the choice spends the hour of setting it up'
	}
];

/**
 * The save-costs the audit leaves standing: money genuinely spent or paid away,
 * with copy that says so. Every `cost` on `category: 'save'` in the deck must
 * appear here — that is the pin.
 */
const HONEST_SAVE_SPENDS: Array<[string, string]> = [
	['first_budget', 'cover'], // covers a shortfall from the buffer — spent
	['gift_fund', 'plan'], // the presents, capped and bought — spent
	['concert_tickets', 'go'], // spending from Save, said plainly
	['lend_to_friend', 'lend'], // a real loan out, a Thread back
	['evening_course', 'enrol'], // the course fee
	['trip_everyone_pays', 'deposit'], // a real deposit, its Thread already carries the balance
	['trip_final_call', 'pay'], // the trip’s balance, paid
	['the_drop', 'buy'], // the trainers, bought — honestly paid at the drop
	['trip_balance_due', 'pay'], // the school trip’s balance, paid
	['rent_share', 'commit'], // the flat deposit
	['instalment_week', 'dip'], // dipping into savings, said plainly
	['the_fork', 'work'], // the deposit that starts the working life
	['scam_opportunity', 'in'], // the scam takes the money and says so
	['housemate_leaves', 'cover'], // the rent gap
	['student_discount', 'buy'], // the railcard, a purchase
	['trip_deposit', 'deposit'] // the one audited cost kept: a real deposit
];

function choiceOf(cardId: string, choiceId: string): Choice {
	const choice = cardById(cardId)?.choices.find((c) => c.id === choiceId);
	if (!choice) throw new Error(`audit fixture moved: ${cardId}/${choiceId}`);
	return choice;
}

const key = (cardId: string, choiceId: string) => `${cardId}/${choiceId}`;

describe('the phantom-save audit', () => {
	it('leaves no set-aside Choice drawing on Save', () => {
		for (const row of AUDITED) {
			const choice = choiceOf(row.card, row.choice);
			expect(
				choice.cost ?? 0,
				`${key(row.card, row.choice)} still withdraws while promising to set aside — ${row.note}`
			).toBe(row.cost ?? 0);
		}
	});

	it('keeps the two deadline commitments on their Threads', () => {
		for (const row of AUDITED.filter((r) => r.thread)) {
			const choice = choiceOf(row.card, row.choice);
			expect(choice.sets?.thread, `${key(row.card, row.choice)} must plant its Thread`).toBe(row.thread);
		}
	});

	it('keeps the real deposit’s cost exactly where the copy says it goes', () => {
		const deposit = choiceOf('trip_deposit', 'deposit');
		expect(deposit.cost).toBe(20);
		expect(deposit.category).toBe('save');
	});

	it('accounts for every save-cost Choice in the deck', () => {
		const audited = new Map(AUDITED.map((r) => [key(r.card, r.choice), r.cost]));
		const allowed = new Set(HONEST_SAVE_SPENDS.map(([card, choice]) => key(card, choice)));
		for (const card of CARDS) {
			for (const choice of card.choices) {
				if ((choice.cost ?? 0) <= 0 || choice.category !== 'save') continue;
				const where = key(card.id, choice.id);
				const auditedCost = audited.get(where);
				expect(
					auditedCost === undefined ? allowed.has(where) : auditedCost,
					`${where} spends Save money and is neither audited nor listed as an honest spend`
				).toBeTruthy();
			}
		}
		// And the lists are not stale: every honest spend really is one.
		for (const [cardId, choiceId] of HONEST_SAVE_SPENDS) {
			const choice = choiceOf(cardId, choiceId);
			expect(
				(choice.cost ?? 0) > 0 && choice.category === 'save',
				`stale honest-spend entry: ${key(cardId, choiceId)} no longer draws on Save`
			).toBe(true);
		}
	});
});
