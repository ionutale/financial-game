/**
 * The stub deck. Ticket 03's real schema, populated with the handful of cards
 * the prototype proved. The real 81-card pool lands with the deck slice, drawn
 * server-side from (seed, turnIndex).
 */

import type { Card } from './types';

export const CARDS: Card[] = [
	{
		id: 'extra_shift',
		kind: 'decision',
		stages: [2, 3, 4],
		concept: 'earning_work',
		branch: 'shared',
		weight: 3,
		teaches: 'effort maps visibly to money',
		title: 'An extra shift',
		situation:
			'Your manager is short-staffed on Saturday and asks if you can cover. It is the same day as the match.',
		choices: [
			{
				id: 'take',
				label: 'Take the shift',
				gain: 80,
				freeTime: -12,
				category: null,
				feedback:
					'You worked 8 hours at 10 an hour and it landed as \u25c880. Money you earn is hours you do not get back \u2014 that is the trade, every time.'
			},
			{
				id: 'pass',
				label: 'Keep your Saturday',
				gain: 0,
				freeTime: 0,
				category: null,
				feedback:
					'You kept the day. Nothing wrong with that \u2014 but the \u25c880 does not exist, and next month\u2019s plan has to live without it.'
			}
		]
	},
	{
		id: 'birthday_gift',
		kind: 'decision',
		stages: [1, 2, 3, 4],
		concept: 'needs_wants',
		branch: 'shared',
		weight: 3,
		teaches: 'a Want envelope is a plan, not a permission slip',
		title: 'A birthday you forgot',
		situation: 'Your best friend\u2019s birthday is on Friday. You have nothing for them yet.',
		choices: [
			{
				id: 'buy',
				label: 'Buy the gift everyone is chipping in for',
				cost: 25,
				category: 'want',
				feedback:
					'\u25c825 out of the Want envelope. That is exactly what a Want envelope is for \u2014 the only question is whether it was still there when Friday came.'
			},
			{
				id: 'make',
				label: 'Make something instead',
				cost: 0,
				freeTime: -6,
				category: 'want',
				feedback:
					'Six hours of your time instead of \u25c825. Free is never free \u2014 you paid in the only currency you cannot borrow.'
			},
			{
				id: 'skip',
				label: 'Show up empty-handed',
				cost: 0,
				category: null,
				feedback:
					'You saved the money and spent something else. The game will not tell you that was wrong \u2014 you will find out.'
			}
		]
	},
	{
		id: 'phone_cracked',
		kind: 'shock',
		stages: [1, 2, 3, 4, 5],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 1,
		teaches: 'what an emergency fund is actually for',
		title: 'The phone goes down',
		situation: 'It slipped out of your hand on the stairs. The screen is a spiderweb.',
		choices: [
			{
				id: 'ack',
				label: 'Deal with it',
				cost: 120,
				category: 'need',
				insuredCost: 0,
				feedback:
					'A repair bill you did not plan for. This is what an emergency fund is for \u2014 and if it came out of the Save envelope or went onto Debt, that is the cascade doing its job.'
			}
		]
	},
	{
		id: 'insurance_offer',
		kind: 'risk_moment',
		stages: [1, 2, 3],
		concept: 'tax_insurance_scams',
		branch: 'shared',
		weight: 2,
		teaches: 'paying a known small cost to delete an unknown big one',
		title: 'Cover, or risk it',
		situation: 'Your phone is still in one piece \u2014 for now. Cover costs \u25c86 a month.',
		odds: 'About 1 in 3 of phones this age take a knock this year.',
		choices: [
			{
				id: 'insure',
				label: 'Take the cover',
				cost: 6,
				category: 'need',
				sets: { insurance: true },
				feedback:
					'\u25c86 a month buys certainty. You will probably not claim \u2014 that is what insurance is: paying a small known amount to delete a big unknown one.'
			},
			{
				id: 'risk',
				label: 'Risk it',
				cost: 0,
				category: null,
				feedback:
					'You kept the \u25c86 and took the risk. Fine odds \u2014 until the month the phone lands on the stairs and you are paying the whole repair yourself.'
			}
		]
	},
	{
		id: 'bnpl_trainers',
		kind: 'decision',
		stages: [3, 4, 5],
		concept: 'credit',
		branch: 'shared',
		weight: 3,
		teaches: 'instalments are debt that builds no credit history',
		title: 'Four easy payments',
		situation:
			'The trainers are \u25c8120. The shop offers four monthly payments of \u25c830, interest-free.',
		choices: [
			{
				id: 'now',
				label: 'Pay for them now',
				cost: 120,
				category: 'want',
				feedback: 'Paid and done. Painful in one month, and the whole thing is behind you.'
			},
			{
				id: 'bnpl',
				label: 'Take the four payments',
				cost: 0,
				category: 'want',
				sets: { bnpl: 4 },
				feedback:
					'Four payments of \u25c830 \u2014 and here is the part nobody says out loud: it built you no credit score. Paying it perfectly changes nothing about your file. It is a debt, not a credit history.'
			},
			{
				id: 'skip',
				label: 'Leave them',
				cost: 0,
				category: null,
				feedback: 'Not this month. Nothing was lost.'
			}
		]
	},
	{
		id: 'the_fork',
		kind: 'decision',
		stages: [5],
		branch: 'shared',
		weight: 0,
		teaches: 'the choice the whole run was preparing for',
		title: 'School is over',
		situation:
			'That is it \u2014 school done. Study, or start working? This one you do not get back.',
		choices: [
			{
				id: 'study',
				label: 'Study \u2014 part-time work, and a 3,000 loan',
				cost: 0,
				category: null,
				sets: { path: 'study' },
				feedback:
					'You took the loan. It is on the balance sheet from today, which is the point: deferred debt is still debt, and your net worth starts this year flat rather than rich.'
			},
			{
				id: 'work',
				label: 'Work \u2014 full time, and a flat of your own',
				cost: 0,
				category: null,
				sets: { path: 'work' },
				feedback:
					'Full-time wage, and rent the moment you move. Your obligations are about to take most of what you earn \u2014 this is why the Save envelope mattered in year one.'
			}
		]
	}
];

export function cardById(id: string): Card | undefined {
	return CARDS.find((c) => c.id === id);
}
