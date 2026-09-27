/**
 * The deck. Language-neutral data per ticket 03; prose lives in the message
 * catalogue keyed by card and choice id (ticket 07). Cards named in SPINE are
 * spine-only and carry weight 0 — they are never drawn at random.
 *
 * Weight is relative within a Stage. Higher means more likely.
 */

import type { Card } from './types';

export const CARDS: Card[] = [
	// ---------------------------------------------------------------- Stage 1
	{
		id: 'the_allowance',
		kind: 'decision',
		stages: [1],
		concept: 'earning_work',
		branch: 'shared',
		weight: 0,
		teaches: 'money arrives because someone decided to give it to you — that ends',
		choices: [
			{
				id: 'spend',
				cost: 40,
				category: 'want'
			},
			{
				id: 'keep',
				cost: 0,
				category: 'save'
			}
		]
	},
	{
		id: 'two_wants',
		kind: 'decision',
		stages: [1, 2],
		concept: 'needs_wants',
		branch: 'shared',
		weight: 4,
		teaches: 'a Want envelope is a plan, not a permission slip',
		choices: [
			{
				id: 'game',
				cost: 40,
				category: 'want'
			},
			{
				id: 'headphones',
				cost: 35,
				category: 'need'
			}
		]
	},
	{
		id: 'odd_job',
		kind: 'decision',
		stages: [1],
		concept: 'earning_work',
		branch: 'shared',
		weight: 4,
		teaches: 'effort maps visibly to money',
		choices: [
			{
				id: 'take',
				gain: 30,
				freeTime: -14,
				category: null
			},
			{
				id: 'pass',
				gain: 0,
				freeTime: 0,
				category: null
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
		teaches: 'every purchase has a hidden second price',
		choices: [
			{
				id: 'buy',
				cost: 25,
				category: 'want'
			},
			{
				id: 'make',
				cost: 0,
				freeTime: -6,
				category: 'want'
			},
			{
				id: 'skip',
				cost: 0,
				category: null
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
		choices: [
			{
				id: 'ack',
				cost: 120,
				category: 'need',
				insuredCost: 0
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
		choices: [
			{
				id: 'insure',
				cost: 6,
				category: 'need',
				sets: { insurance: true }
			},
			{
				id: 'risk',
				cost: 0,
				category: null
			}
		]
	},

	{
		id: 'canteen_week',
		kind: 'decision',
		stages: [1],
		concept: 'needs_wants',
		branch: 'shared',
		weight: 3,
		teaches: 'convenience is a line item',
		choices: [
			{
				id: 'pack',
				cost: 0,
				freeTime: -4,
				category: null
			},
			{
				id: 'buy',
				cost: 25,
				category: 'want'
			}
		]
	},
	{
		id: 'dog_walking',
		kind: 'decision',
		stages: [1],
		concept: 'earning_work',
		branch: 'shared',
		weight: 3,
		teaches: 'a small wage is still a wage',
		choices: [
			{
				id: 'take',
				gain: 30,
				freeTime: -8,
				category: null
			},
			{
				id: 'pass',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'sell_games',
		kind: 'decision',
		stages: [1],
		branch: 'shared',
		weight: 3,
		teaches: 'things you do not use are money you already spent',
		choices: [
			{
				id: 'sell',
				gain: 45,
				category: null
			},
			{
				id: 'keep',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'bus_pass',
		kind: 'decision',
		stages: [1],
		concept: 'needs_wants',
		branch: 'shared',
		weight: 2,
		teaches: 'a need has more than one price',
		choices: [
			{
				id: 'replace',
				cost: 30,
				category: 'need'
			},
			{
				id: 'walk',
				cost: 0,
				freeTime: -12,
				category: null
			}
		]
	},
	{
		id: 'grandma_windfall',
		kind: 'decision',
		stages: [1],
		branch: 'shared',
		weight: 2,
		teaches: 'windfalls are where saving starts',
		choices: [
			{
				id: 'save',
				cost: 30,
				category: 'save'
			},
			{
				id: 'treat',
				cost: 15,
				category: 'want'
			}
		]
	},
	{
		id: 'trip_deposit',
		kind: 'decision',
		stages: [1],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 2,
		teaches: 'a deadline turns saving into a plan',
		choices: [
			{
				id: 'deposit',
				cost: 20,
				category: 'save'
			},
			{
				id: 'wait',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'hype_trainers',
		kind: 'decision',
		stages: [1],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 2,
		teaches: 'planned purchases cost less than sudden ones',
		choices: [
			{
				id: 'save',
				cost: 25,
				category: 'save'
			},
			{
				id: 'later',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'pocket_money_gone',
		kind: 'decision',
		stages: [1],
		concept: 'needs_wants',
		branch: 'shared',
		weight: 2,
		teaches: 'tracking starts when you notice the leak',
		choices: [
			{
				id: 'track',
				cost: 0,
				freeTime: -1,
				category: null
			},
			{
				id: 'shrug',
				cost: 12,
				category: 'want'
			}
		]
	},
	{
		id: 'fixer_bike',
		kind: 'decision',
		stages: [1],
		concept: 'needs_wants',
		branch: 'shared',
		weight: 2,
		teaches: 'the sticker price is not the whole price',
		choices: [
			{
				id: 'fix',
				cost: 30,
				freeTime: -3,
				category: 'need'
			},
			{
				id: 'ready',
				cost: 40,
				category: 'need'
			}
		]
	},

	// ---------------------------------------------------------------- Stage 2
	{
		id: 'the_second_year',
		kind: 'stage_up',
		stages: [2],
		branch: 'shared',
		weight: 0,
		teaches: 'the year turns: a fixed cost arrives before the money does',
		choices: [
			{
				id: 'begin',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'phone_plan',
		kind: 'decision',
		stages: [2],
		concept: 'budgeting',
		branch: 'shared',
		weight: 0,
		teaches: 'the first cost that arrives whether or not you earned anything',
		choices: [
			{
				id: 'take',
				cost: 0,
				category: null
			},
			{
				id: 'cheaper',
				cost: 0,
				freeTime: -3,
				category: null
			}
		]
	},
	{
		id: 'first_budget',
		kind: 'decision',
		stages: [2],
		concept: 'budgeting',
		branch: 'shared',
		weight: 4,
		teaches: 'a plan is a guess you make on purpose',
		choices: [
			{
				id: 'cover',
				cost: 12,
				category: 'save'
			},
			{
				id: 'tighten',
				cost: 0,
				freeTime: -2,
				category: null
			}
		]
	},
	{
		id: 'savings_goal',
		kind: 'decision',
		stages: [2],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 4,
		teaches: 'saving without a name does not survive',
		choices: [
			{
				id: 'bike',
				cost: 30,
				category: 'save'
			},
			{
				id: 'number',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'subscription_creep',
		kind: 'decision',
		stages: [2, 3],
		concept: 'budgeting',
		branch: 'shared',
		weight: 3,
		teaches: 'small recurring costs are the hardest to notice',
		choices: [
			{
				id: 'cut',
				gain: 14,
				category: null
			},
			{
				id: 'keep',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'concert_tickets',
		kind: 'decision',
		stages: [2, 3],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 3,
		teaches: 'the save envelope is the first thing sacrificed',
		choices: [
			{
				id: 'go',
				cost: 35,
				category: 'save'
			},
			{
				id: 'stay',
				cost: 0,
				category: null
			}
		]
	},

	{
		id: 'phone_bill_spike',
		kind: 'decision',
		stages: [2],
		concept: 'budgeting',
		branch: 'shared',
		weight: 3,
		teaches: 'the first bill is a forecast, not a promise',
		choices: [
			{
				id: 'pay',
				cost: 25,
				category: 'need'
			},
			{
				id: 'challenge',
				cost: 0,
				freeTime: -3,
				category: null
			}
		]
	},
	{
		id: 'no_spend_week',
		kind: 'decision',
		stages: [2],
		concept: 'budgeting',
		branch: 'shared',
		weight: 3,
		teaches: 'a spend you plan is a spend you control',
		choices: [
			{
				id: 'do',
				cost: 0,
				freeTime: -2,
				category: null
			},
			{
				id: 'skip',
				cost: 15,
				category: 'want'
			}
		]
	},
	{
		id: 'gift_fund',
		kind: 'decision',
		stages: [2],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 3,
		teaches: 'a planned cost is cheaper than an emergency',
		choices: [
			{
				id: 'plan',
				cost: 15,
				category: 'save'
			},
			{
				id: 'wing',
				cost: 30,
				category: 'want'
			}
		]
	},
	{
		id: 'savings_milestone',
		kind: 'decision',
		stages: [2],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 2,
		teaches: 'the first milestone is why the habit survives',
		choices: [
			{
				id: 'add',
				cost: 20,
				category: 'save'
			},
			{
				id: 'celebrate',
				cost: 10,
				category: 'want'
			}
		]
	},
	{
		id: 'data_plan_shrink',
		kind: 'decision',
		stages: [2, 3],
		concept: 'budgeting',
		branch: 'shared',
		weight: 2,
		teaches: 'the quiet recurring costs are the ones to renegotiate',
		choices: [
			{
				id: 'shrink',
				gain: 6,
				category: null
			},
			{
				id: 'stay',
				cost: 6,
				category: 'need'
			}
		]
	},

	{
		id: 'till_impulse',
		kind: 'decision',
		stages: [2],
		concept: 'budgeting',
		branch: 'shared',
		weight: 2,
		teaches: 'small repeated purchases are the budget leak',
		choices: [
			{
				id: 'rule',
				cost: 0,
				freeTime: -1,
				category: null
			},
			{
				id: 'buy',
				cost: 12,
				category: 'want'
			}
		]
	},

	// Fun-pass ticket 07: Mum's week — the cast's first consequence, and two
	// Stage-2 moments (the group's money, the envelope nobody planned for).
	{
		id: 'mum_late_pay',
		kind: 'decision',
		stages: [2],
		concept: 'budgeting',
		branch: 'shared',
		weight: 3,
		teaches: 'family money runs on favours until a payday lands',
		choices: [
			{
				id: 'cover',
				cost: 25,
				category: 'need',
				sets: { thread: 'mum_shop' }
			},
			{
				id: 'wait',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'mum_pays_back',
		kind: 'decision',
		stages: [2, 3],
		branch: 'shared',
		weight: 5,
		requires: ['thread:mum_shop'],
		resolves: 'mum_shop',
		teaches: 'a favour between family is real money, returned in its own time',
		choices: [
			{
				id: 'take',
				gain: 30,
				category: null
			},
			{
				id: 'leave',
				gain: 0,
				category: null
			}
		]
	},
	{
		id: 'trip_everyone_pays',
		kind: 'decision',
		stages: [2],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 3,
		teaches: 'the deposit is the cheapest thing about a group trip',
		choices: [
			{
				id: 'deposit',
				cost: 30,
				category: 'save',
				sets: { thread: 'trip_tally' }
			},
			{
				id: 'later',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'trip_final_call',
		kind: 'decision',
		stages: [2, 3, 4],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 5,
		requires: ['thread:trip_tally'],
		resolves: 'trip_tally',
		teaches: 'the balance of a trip arrives in a month that already had plans',
		choices: [
			{
				id: 'pay',
				cost: 60,
				category: 'save'
			},
			{
				id: 'sell_spot',
				gain: 20,
				category: null
			}
		]
	},
	{
		id: 'birthday_money',
		kind: 'decision',
		stages: [2],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 2,
		teaches: 'money nobody planned for is the easiest money to keep',
		choices: [
			{
				id: 'bank',
				gain: 50,
				category: null
			},
			{
				id: 'treat',
				gain: 50,
				cost: 20,
				category: 'want'
			}
		]
	},
	{
		id: 'laptop_cover',
		kind: 'risk_moment',
		stages: [2, 3],
		concept: 'tax_insurance_scams',
		branch: 'shared',
		weight: 2,
		teaches: 'cover is priced before the repair exists',
		choices: [
			{
				id: 'add_cover',
				cost: 8,
				category: 'need',
				sets: { insurance: true }
			},
			{
				id: 'run_it',
				cost: 0,
				category: null
			}
		]
	},

	// ---------------------------------------------------------------- Stage 3
	{
		id: 'the_third_year',
		kind: 'stage_up',
		stages: [3],
		branch: 'shared',
		weight: 0,
		teaches: 'the allowance stops; the hours start paying',
		choices: [
			{
				id: 'begin',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'first_payslip',
		kind: 'decision',
		stages: [3],
		concept: 'earning_work',
		branch: 'shared',
		weight: 0,
		teaches: 'the first money that is actually yours',
		choices: [
			{
				id: 'enthusiastic',
				gain: 80,
				freeTime: -18,
				category: null
			},
			{
				id: 'measured',
				gain: 50,
				freeTime: -10,
				category: null
			}
		]
	},
	{
		id: 'interest_first',
		kind: 'decision',
		stages: [3],
		concept: 'interest',
		branch: 'shared',
		weight: 4,
		teaches: 'money can make money, slowly at first',
		choices: [
			{
				id: 'more',
				cost: 20,
				category: 'save'
			},
			{
				id: 'nothing',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'extra_shift',
		kind: 'decision',
		stages: [2, 3, 4],
		concept: 'earning_work',
		branch: 'shared',
		weight: 3,
		teaches: 'effort maps visibly to money',
		choices: [
			{
				id: 'take',
				gain: 80,
				freeTime: -12,
				category: null
			},
			{
				id: 'pass',
				gain: 0,
				freeTime: 0,
				category: null
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
		choices: [
			{
				id: 'now',
				cost: 120,
				category: 'want'
			},
			{
				id: 'bnpl',
				cost: 0,
				category: 'want',
				sets: { bnpl: 4 }
			},
			{
				id: 'skip',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'lend_to_friend',
		kind: 'decision',
		stages: [3, 4],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 2,
		teaches: 'lending money is a decision with a friendship attached',
		choices: [
			{
				id: 'lend',
				cost: 40,
				category: 'save',
				sets: { thread: 'friend_loan' }
			},
			{
				id: 'no',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'lend_returns',
		kind: 'decision',
		stages: [3, 4, 5],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 5,
		requires: ['thread:friend_loan'],
		resolves: 'friend_loan',
		teaches: 'a loan to a friend has two balances and you only control one',
		choices: [
			{
				id: 'take',
				gain: 20,
				category: null
			},
			{
				id: 'chase',
				gain: 40,
				freeTime: -2,
				category: null
			}
		]
	},
	{
		id: 'evening_course',
		kind: 'decision',
		stages: [3],
		concept: 'earning_work',
		branch: 'shared',
		weight: 3,
		teaches: 'training is a bet on your own future earning',
		choices: [
			{
				id: 'enrol',
				cost: 90,
				category: 'save',
				freeTime: -10,
				sets: { thread: 'course_enrolled' }
			},
			{
				id: 'skip',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'course_pays_off',
		kind: 'decision',
		stages: [3, 4],
		concept: 'earning_work',
		branch: 'shared',
		weight: 5,
		requires: ['thread:course_enrolled'],
		resolves: 'course_enrolled',
		teaches: 'qualifications only pay when you ask them to',
		choices: [
			{
				id: 'ask',
				gain: 60,
				freeTime: -2,
				category: null
			},
			{
				id: 'quiet',
				gain: 30,
				category: null
			}
		]
	},

	{
		id: 'overtime_offer',
		kind: 'decision',
		stages: [3],
		concept: 'earning_work',
		branch: 'shared',
		weight: 3,
		teaches: 'hours are the thing you are actually selling',
		choices: [
			{
				id: 'take',
				gain: 45,
				freeTime: -14,
				category: null
			},
			{
				id: 'pass',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'inflated_prices',
		kind: 'decision',
		stages: [3],
		concept: 'interest',
		branch: 'shared',
		weight: 3,
		teaches: 'prices drift, and budgets have to drift with them',
		choices: [
			{
				id: 'replan',
				cost: 0,
				freeTime: -2,
				category: null
			},
			{
				id: 'carry',
				cost: 12,
				category: 'need'
			}
		]
	},

	{
		id: 'payday_timing',
		kind: 'decision',
		stages: [3],
		concept: 'budgeting',
		branch: 'shared',
		weight: 3,
		teaches: 'when the wage lands decides how long it lasts',
		choices: [
			{
				id: 'move',
				cost: 0,
				freeTime: -1,
				category: null
			},
			{
				id: 'weekend',
				cost: 25,
				category: 'want'
			}
		]
	},
	{
		id: 'shift_clash',
		kind: 'decision',
		stages: [3],
		concept: 'earning_work',
		branch: 'shared',
		weight: 3,
		teaches: 'every shift is a trade, and the other side is invisible',
		choices: [
			{
				id: 'work',
				gain: 60,
				freeTime: -12,
				category: null
			},
			{
				id: 'life',
				cost: 15,
				category: 'want'
			}
		]
	},
	{
		id: 'meal_deal',
		kind: 'decision',
		stages: [3],
		concept: 'budgeting',
		branch: 'shared',
		weight: 2,
		teaches: 'a bundle only saves money on what you already wanted',
		choices: [
			{
				id: 'alone',
				cost: 4,
				category: 'need'
			},
			{
				id: 'deal',
				cost: 6,
				category: 'want'
			}
		]
	},
	{
		id: 'phone_repair',
		kind: 'decision',
		stages: [3],
		concept: 'budgeting',
		branch: 'shared',
		weight: 3,
		teaches: 'repair is usually cheaper than replace, and never feels like it',
		choices: [
			{
				id: 'repair',
				cost: 60,
				category: 'need'
			},
			{
				id: 'replace',
				cost: 150,
				category: 'need'
			}
		]
	},
	{
		id: 'cut_a_shift',
		kind: 'decision',
		stages: [3],
		concept: 'earning_work',
		branch: 'shared',
		weight: 3,
		teaches: 'hours given back are a purchase with a price',
		choices: [
			{
				id: 'cut',
				cost: 30,
				category: null
			},
			{
				id: 'keep',
				gain: 30,
				freeTime: -8,
				category: null
			}
		]
	},
	{
		id: 'trial_renewal',
		kind: 'decision',
		stages: [3],
		concept: 'budgeting',
		branch: 'shared',
		weight: 2,
		teaches: 'a subscription is the only bill you must remember to stop',
		choices: [
			{
				id: 'cancel',
				cost: 0,
				freeTime: -1,
				category: null
			},
			{
				id: 'renew',
				cost: 9,
				category: 'need'
			}
		]
	},
	{
		id: 'quarterly_interest',
		kind: 'decision',
		stages: [3],
		concept: 'interest',
		branch: 'shared',
		weight: 3,
		teaches: 'interest withdrawn is the snowball starting again',
		choices: [
			{
				id: 'leave',
				cost: 10,
				category: 'save'
			},
			{
				id: 'skim',
				gain: 9,
				category: null
			}
		]
	},

	// Fun-pass ticket 07: the Stage-3 cast — Priya's shift, Grandma's boxes,
	// Mum's lates, and the bank's own mistake.
	{
		id: 'mum_late_week',
		kind: 'decision',
		stages: [3],
		concept: 'budgeting',
		branch: 'shared',
		weight: 2,
		teaches: 'the evening meal is either hours or money',
		choices: [
			{
				id: 'cook',
				cost: 0,
				freeTime: -3,
				category: null
			},
			{
				id: 'takeaway',
				cost: 12,
				category: 'need'
			}
		]
	},
	{
		id: 'priya_shift_swap',
		kind: 'decision',
		stages: [3],
		concept: 'earning_work',
		branch: 'shared',
		weight: 3,
		teaches: 'a favour between friends is a debt with no paperwork',
		choices: [
			{
				id: 'take',
				gain: 40,
				freeTime: -10,
				category: null,
				sets: { thread: 'priya_swap' }
			},
			{
				id: 'cant',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'priya_swap_back',
		kind: 'decision',
		stages: [3, 4],
		concept: 'earning_work',
		branch: 'shared',
		weight: 5,
		requires: ['thread:priya_swap'],
		resolves: 'priya_swap',
		teaches: 'the favour comes back as time, not as money',
		choices: [
			{
				id: 'call_it_in',
				gain: 0,
				freeTime: 8,
				category: null
			},
			{
				id: 'let_it_go',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'grandma_asks_help',
		kind: 'decision',
		stages: [3],
		branch: 'shared',
		weight: 3,
		teaches: 'helping family costs a weekend or it costs money',
		choices: [
			{
				id: 'go',
				cost: 0,
				freeTime: -6,
				category: null,
				sets: { thread: 'grandma_visit' }
			},
			{
				id: 'send_money',
				cost: 15,
				category: 'need'
			}
		]
	},
	{
		id: 'grandma_sends_thanks',
		kind: 'decision',
		stages: [3, 4],
		branch: 'shared',
		weight: 5,
		requires: ['thread:grandma_visit'],
		resolves: 'grandma_visit',
		teaches: 'family thanks arrives whether or not it was asked for',
		choices: [
			{
				id: 'take',
				gain: 40,
				category: null
			},
			{
				id: 'send_it_back',
				gain: 0,
				category: null
			}
		]
	},
	{
		id: 'cashback_error',
		kind: 'decision',
		stages: [3],
		concept: 'budgeting',
		branch: 'shared',
		weight: 2,
		teaches: 'a bank’s mistake is still somebody’s money',
		choices: [
			{
				id: 'say_so',
				cost: 0,
				freeTime: -1,
				category: null
			},
			{
				id: 'say_nothing',
				gain: 30,
				category: null
			}
		]
	},

	// ---------------------------------------------------------------- Stage 4
	{
		id: 'the_fourth_year',
		kind: 'stage_up',
		stages: [4],
		branch: 'shared',
		weight: 0,
		teaches: 'credit arrives before the income that would carry it',
		choices: [
			{
				id: 'begin',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'bnpl_offer',
		kind: 'decision',
		stages: [4],
		concept: 'credit',
		branch: 'shared',
		weight: 0,
		teaches: 'credit arrives looking like convenience, not debt',
		choices: [
			{
				id: 'use',
				cost: 0,
				category: null,
				sets: { bnpl: 3 }
			},
			{
				id: 'leave',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'minimum_payment',
		kind: 'decision',
		stages: [4],
		concept: 'credit',
		branch: 'shared',
		weight: 4,
		teaches: 'the minimum payment is the most expensive option on the page',
		choices: [
			{
				id: 'full',
				cost: 300,
				category: 'need'
			},
			{
				id: 'minimum',
				cost: 15,
				category: 'need',
				sets: { minimumStreak: 1 }
			}
		]
	},
	{
		id: 'credit_limit_rise',
		kind: 'decision',
		stages: [4],
		concept: 'credit',
		branch: 'shared',
		weight: 3,
		teaches: 'a higher limit is not more money',
		choices: [
			{
				id: 'accept',
				cost: 150,
				category: 'want'
			},
			{
				id: 'ignore',
				cost: 0,
				freeTime: -1,
				category: null
			}
		]
	},
	{
		id: 'overdraft',
		kind: 'decision',
		stages: [4],
		concept: 'credit',
		branch: 'shared',
		weight: 3,
		teaches: 'spending money you do not have has a price list',
		choices: [
			{
				id: 'dip',
				cost: 40,
				category: 'need',
				sets: { overdraft: 1 }
			},
			{
				id: 'wait',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'rent_share',
		kind: 'decision',
		stages: [4],
		concept: 'budgeting',
		branch: 'shared',
		weight: 3,
		teaches: 'housing is the cost you build everything else around',
		choices: [
			{
				id: 'commit',
				cost: 100,
				category: 'save'
			},
			{
				id: 'wait',
				cost: 0,
				category: null
			}
		]
	},

	{
		id: 'late_fee',
		kind: 'decision',
		stages: [4],
		concept: 'credit',
		branch: 'shared',
		weight: 3,
		teaches: 'a missed payment costs more than the fee',
		choices: [
			{
				id: 'pay',
				cost: 25,
				category: 'need'
			},
			{
				id: 'leave',
				cost: 0,
				category: null,
				sets: { overdraft: 1 }
			}
		]
	},
	{
		id: 'instalment_week',
		kind: 'decision',
		stages: [4, 5],
		concept: 'credit',
		branch: 'shared',
		weight: 3,
		requires: ['bnpl_active'],
		teaches: 'instalments are a bill you already agreed to',
		choices: [
			{
				id: 'tighten',
				cost: 0,
				freeTime: -2,
				category: null
			},
			{
				id: 'dip',
				cost: 30,
				category: 'save'
			}
		]
	},
	{
		id: 'score_check',
		kind: 'decision',
		stages: [4],
		concept: 'credit',
		branch: 'shared',
		weight: 2,
		teaches: 'the number moves on rules you can learn',
		choices: [
			{
				id: 'read',
				cost: 0,
				freeTime: -2,
				category: null
			},
			{
				id: 'close',
				cost: 0,
				category: null
			}
		]
	},

	{
		id: 'score_goal',
		kind: 'decision',
		stages: [4],
		concept: 'credit',
		branch: 'shared',
		weight: 2,
		teaches: 'a score you understand is cheaper than a deposit you resent',
		choices: [
			{
				id: 'wait',
				cost: 0,
				freeTime: -2,
				category: null
			},
			{
				id: 'outright',
				cost: 120,
				category: 'need'
			}
		]
	},
	{
		id: 'refuse_the_limit',
		kind: 'decision',
		stages: [4],
		concept: 'credit',
		branch: 'shared',
		weight: 3,
		teaches: 'the checkout button is someone else’s arithmetic',
		choices: [
			{
				id: 'stick',
				cost: 0,
				category: null
			},
			{
				id: 'basket',
				cost: 80,
				category: 'want'
			}
		]
	},
	{
		id: 'credit_check_free',
		kind: 'decision',
		stages: [4],
		concept: 'credit',
		branch: 'shared',
		weight: 2,
		teaches: 'the people who watch the number pay less for the same money',
		choices: [
			{
				id: 'read',
				cost: 0,
				freeTime: -2,
				category: null
			},
			{
				id: 'skip',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'bnpl_pressure',
		kind: 'decision',
		stages: [4],
		concept: 'credit',
		branch: 'shared',
		weight: 3,
		teaches: 'the third instalment lands in a month you cannot see yet',
		choices: [
			{
				id: 'save',
				cost: 40,
				category: 'save'
			},
			{
				id: 'split',
				cost: 0,
				category: null,
				sets: { bnpl: 4 }
			}
		]
	},
	{
		id: 'payday_drain',
		kind: 'decision',
		stages: [4],
		concept: 'budgeting',
		branch: 'shared',
		weight: 3,
		teaches: 'wages land in spikes and lives cost in drips',
		choices: [
			{
				id: 'map',
				cost: 0,
				freeTime: -3,
				category: null
			},
			{
				id: 'wait',
				cost: 20,
				category: 'want'
			}
		]
	},

	// Fun-pass ticket 07: Stage 4's cast consequence (Ravi's weekend) and the
	// pipe that makes the cover real.
	{
		id: 'ravi_needs_cover',
		kind: 'decision',
		stages: [4],
		concept: 'earning_work',
		branch: 'shared',
		weight: 3,
		teaches: 'covering a sick colleague is hours now and a door later',
		choices: [
			{
				id: 'cover',
				gain: 55,
				freeTime: -12,
				category: null,
				sets: { thread: 'ravi_cover' }
			},
			{
				id: 'cant',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'ravi_returns_favour',
		kind: 'decision',
		stages: [4, 5],
		concept: 'earning_work',
		branch: 'shared',
		weight: 5,
		requires: ['thread:ravi_cover'],
		resolves: 'ravi_cover',
		teaches: 'a favour can be returned as money or as a door',
		choices: [
			{
				id: 'take_shift',
				gain: 50,
				freeTime: -6,
				category: null
			},
			{
				id: 'take_lead',
				gain: 30,
				freeTime: -1,
				category: null
			}
		]
	},
	{
		id: 'burst_pipe',
		kind: 'shock',
		stages: [4],
		concept: 'tax_insurance_scams',
		branch: 'shared',
		weight: 1,
		teaches: 'the emergency rate is what cover is priced against',
		choices: [
			{
				id: 'call_now',
				cost: 140,
				category: 'need',
				insuredCost: 0
			},
			{
				id: 'tape_it',
				cost: 30,
				category: 'need',
				freeTime: -8
			}
		]
	},

	// Fun-pass ticket 08 (ADR-0007): the villain cards. The player is the
	// seller — the shop pays the commission on the four-payment split, and the
	// buyer's consequence rides a Thread. No wrong-choice flag; the fence is in
	// `villain.test.ts`.
	{
		id: 'phone_shop_shift',
		kind: 'decision',
		stages: [4],
		concept: 'credit',
		branch: 'shared',
		// Half of the rarest shock: the harness's steady-consequence band has
		// ~±3 runs of slack, and at weight 1 this card drifts it one run past
		// the ceiling (the ticket-08 report records the numbers). Playtest-gated
		// content, so exposure is the tuning surface the frozen economy allows.
		weight: 0.5,
		teaches: 'selling the split is easy; the third payment belongs to the buyer',
		choices: [
			{
				id: 'split',
				gain: 20,
				freeTime: -1,
				category: null,
				sets: { thread: 'split_sold' }
			},
			{
				id: 'outright',
				gain: 10,
				category: null
			}
		]
	},
	{
		id: 'split_comes_due',
		kind: 'decision',
		stages: [4, 5],
		branch: 'shared',
		weight: 5,
		requires: ['thread:split_sold'],
		resolves: 'split_sold',
		teaches: 'the third payment lands in the buyer’s thin month, not the seller’s',
		choices: [
			{
				id: 'cover',
				cost: 30,
				category: 'want'
			},
			{
				id: 'leave',
				freeTime: -1,
				category: null
			}
		]
	},

	// ---------------------------------------------------------------- Stage 5
	{
		id: 'the_fork',
		kind: 'stage_up',
		stages: [5],
		branch: 'shared',
		weight: 0,
		teaches: 'the choice the whole run was preparing for',
		choices: [
			{
				id: 'study',
				cost: 0,
				category: null,
				sets: { path: 'study' }
			},
			{
				id: 'work',
				cost: 650,
				category: 'save',
				sets: { path: 'work' }
			}
		]
	},
	{
		id: 'first_taxed_payslip',
		kind: 'decision',
		stages: [5],
		branch: 'shared',
		weight: 0,
		teaches: 'nobody warns you about the gap between gross and net',
		choices: [
			{
				id: 'read',
				cost: 0,
				freeTime: -1,
				category: null
			},
			{
				id: 'ignore',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'the_fund',
		kind: 'decision',
		stages: [5],
		concept: 'investing',
		branch: 'shared',
		weight: 4,
		teaches: 'the only place money grows faster than prices',
		choices: [
			{
				id: 'open',
				// Fun-pass ticket 09: a real deposit — Save moves into the Fund,
				// blocked when unaffordable, and never from borrowed money.
				sets: { fund: 400 }
			},
			{
				id: 'wait',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'the_crash',
		kind: 'shock',
		stages: [5],
		concept: 'investing',
		branch: 'shared',
		weight: 0,
		teaches: 'the risk half of investing, felt rather than explained',
		choices: [
			{
				id: 'buy',
				// Buying the dip (fun-pass ticket 09): the crash has already landed
				// when this Choice is taken, so the deposit enters at the fallen price.
				sets: { fund: 200 }
			},
			{
				id: 'hold',
				cost: 0,
				category: null
			},
			{
				id: 'sell',
				cost: 0,
				freeTime: -2,
				category: null,
				// Selling locks the fallen value: the Fund moves to Savings.
				sets: { sellFund: true }
			}
		]
	},
	{
		id: 'scam_opportunity',
		kind: 'scam',
		stages: [5],
		concept: 'tax_insurance_scams',
		branch: 'shared',
		weight: 0,
		teaches: 'the tells are always the same three',
		choices: [
			{
				id: 'in',
				cost: 200,
				category: 'save'
			},
			{
				id: 'check',
				cost: 0,
				freeTime: -1,
				category: null
			},
			{
				id: 'block',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'app_tip',
		kind: 'decision',
		stages: [5],
		concept: 'tax_insurance_scams',
		branch: 'shared',
		weight: 3,
		teaches: 'guaranteed returns are a story with a countdown',
		choices: [
			{
				id: 'in',
				cost: 50,
				category: 'want',
				sets: { thread: 'risky_tip' }
			},
			{
				id: 'out',
				cost: 0,
				freeTime: -1,
				category: null
			}
		]
	},
	{
		id: 'app_vanishes',
		kind: 'decision',
		stages: [5],
		concept: 'tax_insurance_scams',
		branch: 'shared',
		weight: 5,
		requires: ['thread:risky_tip'],
		resolves: 'risky_tip',
		teaches: 'a scam is survivable, and reporting matters past your own loss',
		choices: [
			{
				id: 'report',
				freeTime: -2,
				category: null
			},
			{
				id: 'chalk',
				cost: 0,
				category: null
			}
		]
	},
	// Fun-pass ticket 08 (ADR-0007): the Stage-5 villain card. The app pays for
	// brought-in friends; the first bonus has already cleared, so the Choice is
	// whether to push the link — and the Thread carries the friend's consequence
	// back. The gain is the app's, not a reward; the game flags nothing.
	{
		id: 'app_referral',
		kind: 'decision',
		stages: [5],
		branch: 'shared',
		// No Concept: the villain mechanic is learned from the inside, and an
		// `investing` concept at this weight tipped one seed's Stage-5 scam
		// coverage below the deck floor (ticket-08 report).
		weight: 3,
		teaches: 'a referral bonus is paid out of the deposits that arrive after you',
		choices: [
			{
				id: 'post',
				gain: 25,
				freeTime: -1,
				category: null,
				sets: { thread: 'referral_sold' }
			},
			{
				id: 'stop',
				gain: 25,
				category: null
			}
		]
	},
	{
		id: 'referral_follow_up',
		kind: 'decision',
		stages: [5],
		branch: 'shared',
		weight: 5,
		requires: ['thread:referral_sold'],
		resolves: 'referral_sold',
		teaches: 'the bonus clears and the friend who funded the account keeps the loss',
		choices: [
			{
				id: 'square',
				cost: 25,
				category: 'want'
			},
			{
				id: 'explain',
				freeTime: -1,
				category: null
			}
		]
	},
	{
		id: 'the_limit_letter',
		kind: 'decision',
		stages: [5],
		concept: 'credit',
		branch: 'shared',
		weight: 3,
		requires: ['credit_card_open'],
		teaches: 'a limit is a ceiling, not income',
		choices: [
			{
				id: 'ignore',
				cost: 0,
				category: null
			},
			{
				id: 'use',
				cost: 60,
				category: 'want'
			}
		]
	},
	{
		id: 'cash_in_hand',
		kind: 'decision',
		stages: [5],
		concept: 'tax_insurance_scams',
		branch: 'shared',
		weight: 3,
		teaches: 'untaxed cash has a consequence you choose when to meet',
		choices: [
			{
				id: 'declare',
				gain: 120,
				cost: 30,
				category: 'need'
			},
			{
				id: 'quiet',
				gain: 120,
				category: null
			}
		]
	},
	{
		id: 'refund_text',
		kind: 'scam',
		stages: [5],
		concept: 'tax_insurance_scams',
		branch: 'shared',
		weight: 2,
		teaches: 'a refund you did not claim is a hook, not a payment',
		choices: [
			{
				id: 'click',
				cost: 120,
				category: 'need'
			},
			{
				id: 'check',
				cost: 0,
				freeTime: -1,
				category: null
			}
		]
	},
	{
		id: 'boring_fund',
		kind: 'decision',
		stages: [5],
		concept: 'investing',
		branch: 'shared',
		weight: 3,
		teaches: 'the boring thing is the competition',
		choices: [
			{
				id: 'fund',
				// Fun-pass ticket 09: the boring deposit, real at last.
				sets: { fund: 50 }
			},
			{
				id: 'chase',
				cost: 30,
				category: 'want'
			}
		]
	},
	{
		id: 'first_statement',
		kind: 'decision',
		stages: [5],
		concept: 'credit',
		branch: 'shared',
		weight: 0,
		teaches: 'the minimum is designed to be affordable forever',
		choices: [
			{
				id: 'clear',
				cost: 40,
				category: 'need'
			},
			{
				id: 'minimum',
				cost: 10,
				category: 'want',
				sets: { minimumStreak: 1 }
			}
		]
	},
	{
		id: 'payslip_error',
		kind: 'decision',
		stages: [5],
		concept: 'earning_work',
		branch: 'shared',
		weight: 2,
		teaches: 'payroll mistakes only get fixed when someone asks',
		choices: [
			{
				id: 'query',
				gain: 45,
				freeTime: -3,
				category: null
			},
			{
				id: 'drop',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'side_work',
		kind: 'decision',
		stages: [5],
		concept: 'earning_work',
		branch: 'shared',
		weight: 2,
		teaches: 'extra money always costs something, and the arithmetic starts at the number',
		choices: [
			{
				id: 'take',
				gain: 80,
				freeTime: -14,
				category: null
			},
			{
				id: 'one',
				gain: 40,
				freeTime: -7,
				category: null
			}
		]
	},
	{
		id: 'grown_up_cover',
		kind: 'risk_moment',
		stages: [5],
		concept: 'tax_insurance_scams',
		branch: 'shared',
		weight: 2,
		teaches: 'insurance on the things you cannot replace yourself',
		choices: [
			{
				id: 'insure',
				cost: 12,
				category: 'need',
				sets: { insurance: true }
			},
			{
				id: 'risk',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'rent_due',
		kind: 'decision',
		stages: [5],
		concept: 'budgeting',
		branch: 'shared',
		weight: 3,
		teaches: 'the biggest cost arrives whether or not the month went well',
		choices: [
			{
				id: 'pay',
				cost: 0,
				category: null
			},
			{
				id: 'delay',
				cost: 25,
				category: 'need',
				sets: { overdraft: 1 }
			}
		]
	},
	{
		id: 'graduate_job',
		kind: 'decision',
		stages: [5],
		concept: 'earning_work',
		branch: 'work',
		weight: 3,
		teaches: 'a first proper job is mostly a negotiation with yourself',
		choices: [
			{
				id: 'take',
				cost: 0,
				category: null
			},
			{
				id: 'push',
				cost: 0,
				freeTime: -2,
				category: null
			}
		]
	},
	{
		id: 'commute_costs',
		kind: 'decision',
		stages: [5],
		concept: 'budgeting',
		branch: 'work',
		weight: 3,
		teaches: 'the job has a price before the wage pays it',
		choices: [
			{
				id: 'pass',
				cost: 90,
				category: 'need'
			},
			{
				id: 'walk',
				cost: 0,
				freeTime: -12,
				category: null
			}
		]
	},
	{
		id: 'shift_swap',
		kind: 'decision',
		stages: [5],
		concept: 'earning_work',
		branch: 'work',
		weight: 3,
		teaches: 'the awkward shifts pay the premium',
		choices: [
			{
				id: 'late',
				gain: 60,
				freeTime: -8,
				category: null
			},
			{
				id: 'early',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'ask_for_rise',
		kind: 'decision',
		stages: [5],
		concept: 'earning_work',
		branch: 'work',
		weight: 3,
		teaches: 'wages move when someone asks',
		choices: [
			{
				id: 'ask',
				gain: 40,
				freeTime: -2,
				category: null
			},
			{
				id: 'wait',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'housemate_leaves',
		kind: 'decision',
		stages: [5],
		concept: 'budgeting',
		branch: 'work',
		weight: 3,
		teaches: 'shared costs are a plan that needs maintenance',
		choices: [
			{
				id: 'cover',
				cost: 100,
				category: 'save'
			},
			{
				id: 'advertise',
				cost: 0,
				freeTime: -6,
				category: null
			}
		]
	},
	{
		id: 'boots',
		kind: 'decision',
		stages: [5],
		concept: 'budgeting',
		branch: 'work',
		weight: 2,
		teaches: 'tools for a job are a wage cut you choose',
		choices: [
			{
				id: 'new',
				cost: 70,
				category: 'need'
			},
			{
				id: 'used',
				cost: 30,
				freeTime: -4,
				category: 'need'
			}
		]
	},
	{
		id: 'student_budget',
		kind: 'decision',
		stages: [5],
		concept: 'budgeting',
		branch: 'study',
		weight: 3,
		teaches: 'living on a loan means the money is already spent',
		choices: [
			{
				id: 'spread',
				cost: 400,
				category: 'save'
			},
			{
				id: 'celebrate',
				cost: 0,
				freeTime: 0,
				category: null
			}
		]
	},
	{
		id: 'textbook_week',
		kind: 'decision',
		stages: [5],
		concept: 'budgeting',
		branch: 'study',
		weight: 3,
		teaches: 'the same knowledge has several prices',
		choices: [
			{
				id: 'hunt',
				cost: 45,
				freeTime: -4,
				category: 'need'
			},
			{
				id: 'new',
				cost: 120,
				category: 'need'
			}
		]
	},
	{
		id: 'exam_crunch',
		kind: 'decision',
		stages: [5],
		concept: 'earning_work',
		branch: 'study',
		weight: 3,
		teaches: 'the hours you sell are the hours you revise',
		choices: [
			{
				id: 'revise',
				freeTime: -8,
				category: null
			},
			{
				id: 'shifts',
				gain: 50,
				freeTime: -10,
				category: null
			}
		]
	},
	{
		id: 'internship_lead',
		kind: 'decision',
		stages: [5],
		concept: 'earning_work',
		branch: 'study',
		weight: 3,
		teaches: 'early work is bought with time, not paid in cash',
		choices: [
			{
				id: 'take',
				gain: 100,
				freeTime: -14,
				category: null
			},
			{
				id: 'focus',
				cost: 0,
				category: null
			}
		]
	},
	{
		id: 'student_discount',
		kind: 'decision',
		stages: [5],
		concept: 'saving_goals',
		branch: 'study',
		weight: 2,
		teaches: 'spending to save only works when the trips are real',
		choices: [
			{
				id: 'buy',
				cost: 30,
				category: 'save'
			},
			{
				id: 'fare',
				cost: 15,
				category: 'need'
			}
		]
	},
	{
		id: 'study_group_coffee',
		kind: 'decision',
		stages: [5],
		concept: 'needs_wants',
		branch: 'study',
		weight: 2,
		teaches: 'the rent on belonging is a budget line',
		choices: [
			{
				id: 'round',
				cost: 24,
				category: 'want'
			},
			{
				id: 'host',
				cost: 0,
				freeTime: -3,
				category: null
			}
		]
	},

	// Fun-pass ticket 07: Danny's night — the social pressure the Want
	// envelope meets in Stage 5.
	{
		id: 'danny_flat_night',
		kind: 'decision',
		stages: [5],
		concept: 'needs_wants',
		branch: 'shared',
		weight: 3,
		teaches: 'the group night costs more than the envelope set aside for it',
		choices: [
			{
				id: 'chip_in',
				cost: 45,
				category: 'want'
			},
			{
				id: 'stay_in',
				cost: 0,
				category: null
			}
		]
	}
];

export function cardById(id: string): Card | undefined {
	return CARDS.find((c) => c.id === id);
}
