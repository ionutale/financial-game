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
		title: 'The allowance',
		situation:
			'Your parents sit you down. From now on you get \u25c840 a month, and it is yours to get wrong. No top-ups.',
		choices: [
			{
				id: 'spend',
				label: 'Buy the thing you have been wanting',
				cost: 40,
				category: 'want',
				feedback:
					'\u25c840 in and \u25c840 out in the same month. The first money you ever control is the easiest to spend, because nothing is asking for it yet.'
			},
			{
				id: 'keep',
				label: 'Leave it where you cannot reach it',
				cost: 0,
				category: 'save',
				feedback:
					'\u25c840 that stayed put. Boring, invisible, and the only reason month one matters at all.'
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
		title: 'Both, obviously',
		situation:
			'The game you have waited months for is out, and the headphones you actually need for school are on sale. You can afford one, today.',
		choices: [
			{
				id: 'game',
				label: 'The game',
				cost: 40,
				category: 'want',
				feedback:
					'You picked the thing you wanted over the thing you needed. Nothing breaks today \u2014 the headphones not being there is next month\u2019s problem.'
			},
			{
				id: 'headphones',
				label: 'The headphones — on sale, \u25c835',
				cost: 35,
				category: 'need',
				feedback:
					'The boring one \u2014 and it was cheaper. That is not a sacrifice, it is a trade: \u25c835 to stop a future problem before it starts.'
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
		title: 'The neighbour\u2019s garden',
		situation:
			'Next door offers \u25c830 to clear their garden this weekend. It is the whole weekend.',
		choices: [
			{
				id: 'take',
				label: 'Do it',
				gain: 30,
				freeTime: -14,
				category: null,
				feedback:
					'Fourteen hours for \u25c830. That is about two an hour \u2014 and you will never forget it, which is exactly the point.'
			},
			{
				id: 'pass',
				label: 'Keep the weekend',
				gain: 0,
				freeTime: 0,
				category: null,
				feedback: 'Free time is real, and it is finite. You kept yours.'
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
		title: 'A birthday you forgot',
		situation: 'Your best friend\u2019s birthday is on Friday. You have nothing for them yet.',
		choices: [
			{
				id: 'buy',
				label: 'Buy the gift everyone is chipping in for',
				cost: 25,
				category: 'want',
				feedback:
					'\u25c825 out of the Want envelope. That is what it is for \u2014 the only question is whether it was still there when Friday came.'
			},
			{
				id: 'make',
				label: 'Make something instead',
				cost: 0,
				freeTime: -6,
				category: 'want',
				feedback:
					'Six hours instead of \u25c825. Free is never free \u2014 you paid in the only currency you cannot borrow.'
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
					'A bill you did not plan for. This is what an emergency fund is for \u2014 and if it came out of the Save envelope or went onto Debt, that is the cascade doing its job.'
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
					'\u25c86 a month buys certainty. You will probably not claim \u2014 that is what insurance is: a small known amount to delete a big unknown one.'
			},
			{
				id: 'risk',
				label: 'Risk it',
				cost: 0,
				category: null,
				feedback:
					'You kept the \u25c86 and took the risk. Fine odds \u2014 until the phone lands on the stairs and you pay the whole repair yourself.'
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
		title: 'Five lunches',
		situation:
			'The canteen takes about \u25c85 a day. Packing lunch takes ten minutes each morning and costs about half as much.',
		choices: [
			{
				id: 'pack',
				label: 'Pack it',
				cost: 0,
				freeTime: -4,
				category: null,
				feedback:
					'Four hours a month for half the money. Cheap food is only cheap if the time was free, and yours mostly is.'
			},
			{
				id: 'buy',
				label: 'Buy it there',
				cost: 25,
				category: 'want',
				feedback:
					'\u25c825 a month for not thinking about lunch. By summer that is a bike, and you will not remember a single sandwich.'
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
		title: 'The dog two streets over',
		situation:
			'A woman two streets over needs her dog walked on school days. Three units a walk, every walk, in cash.',
		choices: [
			{
				id: 'take',
				label: 'Take the round',
				gain: 30,
				freeTime: -8,
				category: null,
				feedback:
					'Thirty a month for eight hours. Not much, and it is yours \u2014 the first money nobody gave you.'
			},
			{
				id: 'pass',
				label: 'Too early in the morning',
				cost: 0,
				category: null,
				feedback: 'You kept your mornings. Somebody else got the thirty, and the dog got somebody else.'
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
		title: 'The drawer of games',
		situation:
			'Twenty-three games, none of them played since last year. The trade-in app offers \u25c845 for the lot.',
		choices: [
			{
				id: 'sell',
				label: 'Sell the lot',
				gain: 45,
				category: null,
				feedback:
					'\u25c845 for a shelf you had stopped seeing. Selling things you are finished with is the only tax-free income you have.'
			},
			{
				id: 'keep',
				label: 'You might replay them',
				cost: 0,
				category: null,
				feedback:
					'You might. The drawer is a museum, and museums cost money to run \u2014 this one costs whatever the games could still be.'
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
		title: 'The pass is gone',
		situation:
			'Your bus pass is not in any pocket. A replacement is \u25c830, or you walk forty minutes each way until it turns up.',
		choices: [
			{
				id: 'replace',
				label: 'Replace it',
				cost: 30,
				category: 'need',
				feedback:
					'Thirty, gone on a piece of plastic. The walk was the other price, and this month you decided the thirty was cheaper.'
			},
			{
				id: 'walk',
				label: 'Walk for now',
				cost: 0,
				freeTime: -12,
				category: null,
				feedback:
					'Twelve hours a month and sore shoes. The money would have been the cheaper price; you paid in the other currency.'
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
		title: 'Fifty from Grandma',
		situation: 'A card arrives late with \u25c850 inside and a note that says do not spend it all at once.',
		choices: [
			{
				id: 'save',
				label: 'Straight into savings',
				cost: 30,
				category: 'save',
				feedback:
					'Thirty hidden before you found a use for it. Grandma has been right about this since before you were born.'
			},
			{
				id: 'treat',
				label: 'Spend a little',
				cost: 15,
				category: 'want',
				feedback:
					'Fifteen out, thirty-five still yours. Spending a windfall is not the mistake; spending it twice is.'
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
		title: 'The trip is real',
		situation:
			'The school trip costs \u25c860, due in two months. The first \u25c820 holds your place until then.',
		choices: [
			{
				id: 'deposit',
				label: 'Pay the deposit',
				cost: 20,
				category: 'save',
				feedback:
					'Twenty holds the place, and now the other forty has a deadline and a reason.'
			},
			{
				id: 'wait',
				label: 'Wait and see',
				cost: 0,
				category: null,
				feedback: 'Waiting is free until the coach fills. Then it costs the whole trip.'
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
		title: 'Everyone will have them',
		situation:
			'The trainers everyone wants drop in four months at \u25c890. Yours have a hole and still work.',
		choices: [
			{
				id: 'save',
				label: 'Put twenty-five aside',
				cost: 25,
				category: 'save',
				feedback:
					'Now the drop is something you are ready for. Saved-for things cost less than wanted things \u2014 always.'
			},
			{
				id: 'later',
				label: 'Decide when they drop',
				cost: 0,
				category: null,
				feedback:
					'When they drop, ninety will feel like news. The version of you with the money already set aside is the version who gets them.'
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
		title: 'Where did it go',
		situation:
			'The \u25c840 landed a week ago. There is \u25c812 left and you honestly cannot say where the rest went.',
		choices: [
			{
				id: 'track',
				label: 'Write the week down',
				cost: 0,
				freeTime: -1,
				category: null,
				feedback:
					'One hour to find the leak. Most of it went on small things you would have sworn were nothing.'
			},
			{
				id: 'shrug',
				label: 'It is only twelve',
				cost: 12,
				category: 'want',
				feedback:
					'It is only twelve this week. Weeks are how months are made, and twenty-eight units went somewhere you cannot name.'
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
		title: 'The wheel is off it',
		situation:
			'Thirty for the bike with the loose wheel, an hour to fit the one you already have. Or \u25c840 for the one that works outside the shop.',
		choices: [
			{
				id: 'fix',
				label: 'Fix it up',
				cost: 30,
				freeTime: -3,
				category: 'need',
				feedback:
					'Thirty and an hour, and it rides. Time and money are the same wallet; this one just spent the cheaper half.'
			},
			{
				id: 'ready',
				label: 'Buy the ready one',
				cost: 40,
				category: 'need',
				feedback:
					'Forty for the version that needed nothing from you. Ten units was the fee for not getting your hands dirty.'
			}
		]
	},

	// ---------------------------------------------------------------- Stage 2
	{
		id: 'phone_plan',
		kind: 'decision',
		stages: [2],
		concept: 'budgeting',
		branch: 'shared',
		weight: 0,
		teaches: 'the first cost that arrives whether or not you earned anything',
		title: 'The first bill',
		situation:
			'Your parents will keep paying for the phone, but only if you take the \u25c815 a month plan yourself. It comes out either way.',
		choices: [
			{
				id: 'take',
				label: 'Take the plan',
				cost: 0,
				category: null,
				feedback:
					'Fifteen a month, forever, before you have earned anything. This is the shape of being a grown-up: costs that do not care how your month went.'
			},
			{
				id: 'cheaper',
				label: 'Shop around for a cheaper one',
				cost: 0,
				freeTime: -3,
				category: null,
				feedback:
					'Three hours of comparing saved you a few units a month, every month, for as long as you keep it. That is the best-paid three hours in this entire game.'
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
		title: 'Twelve short',
		situation:
			'Last month you planned carefully and still ended up \u25c812 short. Nothing dramatic happened \u2014 it was a lot of small things.',
		choices: [
			{
				id: 'cover',
				label: 'Cover it from what you saved',
				cost: 12,
				category: 'save',
				feedback:
					'That is what the Save envelope is for, and using it was the right call. A buffer you are afraid to touch is not a buffer.'
			},
			{
				id: 'tighten',
				label: 'Spend an evening working out where it went',
				cost: 0,
				freeTime: -2,
				category: null,
				feedback:
					'Two hours to find \u25c812 is a bad hourly rate. It is also how you find the six other things quietly doing the same, every month.'
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
		title: 'Something to save for',
		situation:
			'A \u25c8300 bike you actually want, or a number with nothing attached to it. Both are saving. Only one of them you will keep doing.',
		choices: [
			{
				id: 'bike',
				label: 'Start the bike fund',
				cost: 30,
				category: 'save',
				feedback:
					'Now the Save envelope has a face on it. Money with a job is far harder to raid than money with none.'
			},
			{
				id: 'number',
				label: 'Keep it in your pocket for now',
				cost: 0,
				category: null,
				feedback:
					'Saving with no name attached is the one that quietly gets spent in month four. Give it a reason and it survives.'
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
		title: 'Six things a month',
		situation:
			'You add it up for the first time: streaming, storage, a game pass, two apps you forgot about. \u25c828 a month.',
		choices: [
			{
				id: 'cut',
				label: 'Cancel the ones you forgot about',
				gain: 14,
				category: null,
				feedback:
					'\u25c814 a month back, forever, for ten minutes of admin. Nothing else in this game pays that well.'
			},
			{
				id: 'keep',
				label: 'Keep them, they are small',
				cost: 0,
				category: null,
				feedback:
					'They are small. That is the whole trick. \u25c828 a month is \u25c8336 a year, and you will never see it leave.'
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
		title: 'Tickets, tonight',
		situation:
			'Your friends are going tonight. Tickets are \u25c835 and you have \u25c860 saved toward the bike.',
		choices: [
			{
				id: 'go',
				label: 'Go',
				cost: 35,
				category: 'save',
				feedback:
					'The money came out of the Save envelope, which is exactly where it should come from if you have decided this is worth it. You did decide, right?'
			},
			{
				id: 'stay',
				label: 'Stay in',
				cost: 0,
				category: null,
				feedback:
					'You kept the \u25c835 and missed the night. There is no refund for that either \u2014 both options cost something.'
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
		title: 'Forty, not fifteen',
		situation:
			'The first bill arrives at \u25c840. The plan said \u25c815. The difference is data you apparently used without noticing.',
		choices: [
			{
				id: 'pay',
				label: 'Pay it and watch the usage',
				cost: 25,
				category: 'need',
				feedback:
					'\u25c825 for finding out that the plan and the bill are different documents. Watching the usage is part of the month now.'
			},
			{
				id: 'challenge',
				label: 'Call and go through it',
				cost: 0,
				freeTime: -3,
				category: null,
				feedback:
					'Twenty minutes of hold music and the charge was halved. Complaining, done properly, has an hourly rate.'
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
		title: 'A week of nothing',
		situation:
			'A zero-spend week: nothing that is not transport or food. Your friends think it is a joke.',
		choices: [
			{
				id: 'do',
				label: 'Do it',
				cost: 0,
				freeTime: -2,
				category: null,
				feedback:
					'Two hours of planning and a week that went where you said. A sense of control is hard to buy and easy to build.'
			},
			{
				id: 'skip',
				label: 'Skip the experiment',
				cost: 15,
				category: 'want',
				feedback:
					'Fifteen on the usual small things. Nothing dramatic, which is exactly how the envelope empties.'
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
		title: 'Three birthdays',
		situation: 'Three birthdays this month and presents will run about \u25c830. Payday is not soon.',
		choices: [
			{
				id: 'plan',
				label: 'List them and cap it',
				cost: 15,
				category: 'save',
				feedback:
					'A list, a cap, and gifts nobody squinted at. Planning made the same three birthdays half the price.'
			},
			{
				id: 'wing',
				label: 'Wing it on the day',
				cost: 30,
				category: 'want',
				feedback:
					'Thirty, and two of the presents were chosen in a panic at the till. Panic is the most expensive shop.'
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
		title: 'Two hundred',
		situation:
			'The savings account says \u25c8200 for the first time. Nothing happened except you not spending it, sixteen times.',
		choices: [
			{
				id: 'add',
				label: 'Leave it and add twenty',
				cost: 20,
				category: 'save',
				feedback:
					'Two hundred and twenty. The number is not the point; the sixteen decisions behind it are.'
			},
			{
				id: 'celebrate',
				label: 'Take ten and celebrate',
				cost: 10,
				category: 'want',
				feedback:
					'Ten spent on the milestone and one hundred ninety still working. Celebrating cheaply is how the streak survives.'
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
		title: 'More data than you use',
		situation:
			'The plan is \u25c815 a month for more data than you have ever used. The smaller one is \u25c89 and you will feel it on trips.',
		choices: [
			{
				id: 'shrink',
				label: 'Switch down',
				gain: 6,
				category: null,
				feedback:
					'Six a month, forever, for ten minutes of admin. The smaller plan stings twice a year and pays every month.'
			},
			{
				id: 'stay',
				label: 'Stay comfortable',
				cost: 6,
				category: 'need',
				feedback:
					'Comfort costs six a month. That is the trade: a little convenience now, a larger number by the end of school.'
			}
		]
	},

	// ---------------------------------------------------------------- Stage 3
	{
		id: 'first_payslip',
		kind: 'decision',
		stages: [3],
		concept: 'earning_work',
		branch: 'shared',
		weight: 0,
		teaches: 'the first money that is actually yours',
		title: 'First payslip',
		situation:
			'The caf\u00e9 takes you on, ten an hour. Your first shift is Saturday. Nobody has explained how many you will want.',
		choices: [
			{
				id: 'enthusiastic',
				label: 'Take every shift going',
				gain: 80,
				freeTime: -18,
				category: null,
				feedback:
					'\u25c880 and no weekend. Nothing is free, but look at what an hour is actually worth \u2014 now you know the exchange rate.'
			},
			{
				id: 'measured',
				label: 'Take two shifts a week',
				gain: 50,
				freeTime: -10,
				category: null,
				feedback:
					'\u25c850 and you still have a life. Working out how much time you are willing to sell is the whole negotiation.'
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
		title: 'It grew on its own',
		situation:
			'Your savings went up this month and you did not put anything in. It was \u25c80.12, and it was not there before.',
		choices: [
			{
				id: 'more',
				label: 'Move another \u25c820 across',
				cost: 20,
				category: 'save',
				feedback:
					'More in means more interest means more in. It is the only thing in this game that works while you sleep.'
			},
			{
				id: 'nothing',
				label: 'Leave it \u2014 twelve units is nothing',
				cost: 0,
				category: null,
				feedback:
					'\u25c80.12 is nothing. \u25c80.12 every month for forty years is not, and that is the bit nobody can see yet.'
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
					'Eight hours at ten an hour, and it landed as \u25c880. Money you earn is hours you do not get back \u2014 that is the trade, every time.'
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
					'Four payments of \u25c830 \u2014 and the part nobody says out loud: it built you no credit score. Paying it perfectly changes nothing about your file.'
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
		id: 'lend_to_friend',
		kind: 'decision',
		stages: [3, 4],
		concept: 'saving_goals',
		branch: 'shared',
		weight: 2,
		teaches: 'lending money is a decision with a friendship attached',
		title: 'Can I borrow forty',
		situation:
			'Your mate needs \u25c840 until next week. You have it. You have also watched them not pay people back.',
		choices: [
			{
				id: 'lend',
				label: 'Lend it',
				cost: 40,
				category: 'save',
				sets: { thread: 'friend_loan' },
				feedback:
					'It came out of the Save envelope. If it comes back, nothing happened. If it does not, you paid \u25c840 to find something out.'
			},
			{
				id: 'no',
				label: 'Say no',
				cost: 0,
				category: null,
				feedback:
					'You kept the money and the awkwardness. Saying no to money you cannot spare is a skill, and it never feels good.'
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
		title: 'The twenty on the table',
		situation:
			'Three weeks later your mate slides \u25c820 across the table. The other twenty is definitely next week, and the group chat is already planning the next night out.',
		choices: [
			{
				id: 'take',
				label: 'Take the twenty',
				gain: 20,
				category: null,
				feedback:
					'Half the money back without a conversation. The other half is now a question you will have to ask, and you both know it.'
			},
			{
				id: 'chase',
				label: 'Ask for all of it',
				gain: 40,
				freeTime: -2,
				category: null,
				feedback:
					'Forty recovered, and two hours of a friendship held at arm\u2019s length. The money came back; the borrowing probably will not.'
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
		title: 'Two evenings a week',
		situation:
			'The college runs an evening coding course \u2014 three months, two evenings a week, \u25c890 up front. Past students say the certificate is the part that gets you looked at.',
		choices: [
			{
				id: 'enrol',
				label: 'Pay and go',
				cost: 90,
				category: 'save',
				freeTime: -10,
				sets: { thread: 'course_enrolled' },
				feedback:
					'\u25c890 up front and two evenings a week until spring. The money was never the expensive half.'
			},
			{
				id: 'skip',
				label: 'Not this year',
				cost: 0,
				category: null,
				feedback:
					'The certificate stays on the college noticeboard, and so does the version of you that has one.'
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
		title: 'Certificate in a drawer',
		situation:
			'Last class done. The certificate sits in a drawer for a week, and then Priya offers you the closing shift \u2014 the one that pays a little more if you can hold the till and the book.',
		choices: [
			{
				id: 'ask',
				label: 'Ask for the rate',
				gain: 60,
				freeTime: -2,
				category: null,
				feedback:
					'You said the number out loud and got \u25c860 of better shifts. The certificate opened the door; asking walked through it.'
			},
			{
				id: 'quiet',
				label: 'Take it and keep quiet',
				gain: 30,
				category: null,
				feedback:
					'Thirty, and no conversation. The other thirty stayed in somebody else\u2019s budget.'
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
		title: 'Cover for Ravi',
		situation:
			'Ravi is ill and the caf\u00e9 needs Friday and Saturday covered. It is \u25c845 and your entire weekend.',
		choices: [
			{
				id: 'take',
				label: 'Take the shifts',
				gain: 45,
				freeTime: -14,
				category: null,
				feedback:
					'Forty-five for the weekend. When you spend time like money, you start seeing what it costs.'
			},
			{
				id: 'pass',
				label: 'Say you are busy',
				cost: 0,
				category: null,
				feedback:
					'You kept the weekend. Some weekends are worth forty-five; this one gets to be whatever you make it.'
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
		title: 'Same sandwich, more money',
		situation:
			'The meal deal went up again. Same sandwich, ten per cent more, and it is the fourth thing this year that quietly did.',
		choices: [
			{
				id: 'replan',
				label: 'Re-plan the envelopes',
				cost: 0,
				freeTime: -2,
				category: null,
				feedback:
					'Two hours to move the lines. Prices only cost what they cost \u2014 quietly not noticing is the expensive part.'
			},
			{
				id: 'carry',
				label: 'Absorb it for now',
				cost: 12,
				category: 'need',
				feedback:
					'Twelve this month. Prices rarely come back down, so absorbing it once means absorbing it every month.'
			}
		]
	},

	// ---------------------------------------------------------------- Stage 4
	{
		id: 'bnpl_offer',
		kind: 'decision',
		stages: [4],
		concept: 'credit',
		branch: 'shared',
		weight: 0,
		teaches: 'credit arrives looking like convenience, not debt',
		title: 'It offered you credit',
		situation:
			'At seventeen the shop app now offers you a limit of \u25c8300. No card, no paperwork, no explanation of what happens if you do not pay.',
		choices: [
			{
				id: 'use',
				label: 'Use it',
				cost: 0,
				category: null,
				sets: { bnpl: 3 },
				feedback:
					'It went through in one tap. That is the design. Something that takes one tap to start and months to finish is not convenience.'
			},
			{
				id: 'leave',
				label: 'Leave it alone',
				cost: 0,
				category: null,
				feedback:
					'You left the limit untouched. It will still be there next month, and the things you would have bought will not matter by then.'
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
		title: 'The statement',
		situation:
			'Your card statement arrives. You owe \u25c8300. The minimum payment is \u25c815, and the full payment is \u2014 well, \u25c8300.',
		choices: [
			{
				id: 'full',
				label: 'Pay it off in full',
				cost: 300,
				category: 'need',
				feedback:
					'Full payment, no interest, score up. It hurt once and then it was over. This is the only version of a card that is not a trap.'
			},
			{
				id: 'minimum',
				label: 'Pay the minimum',
				cost: 15,
				category: 'need',
				sets: { minimumStreak: 1 },
				feedback:
					'\u25c815 comes off the balance and almost all of it was interest. At this rate the trainers cost you far more than \u25c8300.'
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
		title: 'You have been upgraded',
		situation:
			'Your limit goes from \u25c8300 to \u25c8800. Nothing about your income changed. A friend points out you could finally afford the trip.',
		choices: [
			{
				id: 'accept',
				label: 'Put the trip on the card',
				cost: 150,
				category: 'want',
				feedback:
					'The trip was real and so is the balance. More room to spend is more rope \u2014 the limit was never your money.'
			},
			{
				id: 'ignore',
				label: 'Save up for it instead',
				cost: 0,
				freeTime: -1,
				category: null,
				feedback:
					'A credit limit is a permission slip, not a raise. Knowing the difference is most of what this stage teaches.'
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
		title: 'Short before payday',
		situation:
			'Five days until you are paid and you are \u25c840 short. Three friends are going out tonight.',
		choices: [
			{
				id: 'dip',
				label: 'Let the account go negative',
				cost: 40,
				category: 'need',
				sets: { overdraft: 1 },
				feedback:
					'The bank covers it and charges you for the favour, and the score notices. Borrowing \u25c840 at a rate you never agreed to.'
			},
			{
				id: 'wait',
				label: 'Stay in until payday',
				cost: 0,
				category: null,
				feedback:
					'You sat five days out. Boring, free, and it did nothing to your file. Most of the time this is the whole answer.'
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
		title: 'Moving out maths',
		situation:
			'Friends want you in a shared flat. Your share is \u25c8650, plus a deposit, plus the things nobody lists when they quote a rent.',
		choices: [
			{
				id: 'commit',
				label: 'Commit, and pay the deposit',
				cost: 100,
				category: 'save',
				feedback:
					'Rent is the cost that does not flinch. Everything else in your month bends around this number, so it has to be right.'
			},
			{
				id: 'wait',
				label: 'Not yet',
				cost: 0,
				category: null,
				feedback:
					'You stayed put. It costs nothing, buys time, and is the right call exactly as often as it is the easy one.'
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
		title: 'The payment bounced',
		situation:
			'The payment came out on a day the account was empty. The bank wants \u25c825 for the privilege.',
		choices: [
			{
				id: 'pay',
				label: 'Pay the fee today',
				cost: 25,
				category: 'need',
				feedback:
					'Twenty-five, and the account is square. Fees pay for the mistake; leaving them unpaid pays for it every month.'
			},
			{
				id: 'leave',
				label: 'Leave it on the account',
				cost: 0,
				category: null,
				sets: { overdraft: 1 },
				feedback:
					'It sits there, quietly growing a report card. Unpaid costs become a record, and records follow you.'
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
		title: 'The second instalment',
		situation:
			'The payment goes out this week and the week is already thin. You said the same thing last month.',
		choices: [
			{
				id: 'tighten',
				label: 'Eat in all week',
				cost: 0,
				freeTime: -2,
				category: null,
				feedback:
					'Two hours of cooking instead of a week of buying. The instalment was decided months ago; the week was decided today.'
			},
			{
				id: 'dip',
				label: 'Dip into savings',
				cost: 30,
				category: 'save',
				feedback:
					'Thirty out of savings to feed a decision you made months ago. That is what the four payments actually cost.'
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
		title: 'Six forty',
		situation:
			'The banking app has a number for you now: 640. It went down five points and nothing on screen says why.',
		choices: [
			{
				id: 'read',
				label: 'Read what moves it',
				cost: 0,
				freeTime: -2,
				category: null,
				feedback:
					'Five points, and a page explaining every rule that moves them. People who know the rules pay less for the same money.'
			},
			{
				id: 'close',
				label: 'Close the app',
				cost: 0,
				category: null,
				feedback:
					'The number is still there, still moving, still deciding what the next loan costs. Not looking is free until it is not.'
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
				cost: 650,
				category: 'save',
				sets: { path: 'work' },
				feedback:
					'Full-time wage, and rent the moment you move \u2014 starting with the deposit. This is why saving in year one mattered.'
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
		title: 'What is this line',
		situation:
			'Your first full payslip shows a number you agreed to and a smaller number arriving. Between them sits a line called withholding.',
		choices: [
			{
				id: 'read',
				label: 'Actually read it',
				cost: 0,
				freeTime: -1,
				category: null,
				feedback:
					'Twenty per cent, taken before you ever see it. Annoying \u2014 and the reason it hurts less than a bill you have to pay yourself.'
			},
			{
				id: 'ignore',
				label: 'Just take the number',
				cost: 0,
				category: null,
				feedback:
					'You skipped it. Most people do. The deduction happens whether or not you looked, and it is worth two minutes once a month.'
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
		title: 'Something that actually grows',
		situation:
			'Your savings keep pace with rising prices and barely beat them. There is a fund that has averaged seven per cent a year, and lost a quarter in a bad one.',
		choices: [
			{
				id: 'open',
				label: 'Put some in',
				cost: 400,
				category: 'save',
				feedback:
					'Four hundred in. You now own something that moves \u2014 which is the price of it being able to move upward.'
			},
			{
				id: 'wait',
				label: 'Leave it in savings',
				cost: 0,
				category: null,
				feedback:
					'You stayed in savings: safe, liquid, and losing to prices by a hair. There is no wrong answer here, only a trade.'
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
		title: 'The market falls',
		situation:
			'Everything in the fund is down a quarter in two months. Everyone on the internet has an opinion and all of them are panicking.',
		choices: [
			{
				id: 'buy',
				label: 'Put more in while it is cheap',
				cost: 200,
				category: 'save',
				feedback:
					'Buying when everyone is selling is the hardest version of this and historically the best-paying one. You will not feel clever this month.'
			},
			{
				id: 'hold',
				label: 'Hold it',
				cost: 0,
				category: null,
				feedback:
					'You held. The loss only becomes real if you sell, and the recovery always happens without you if you do. This is the whole lesson.'
			},
			{
				id: 'sell',
				label: 'Sell before it gets worse',
				cost: 0,
				freeTime: -2,
				category: null,
				feedback:
					'You sold at the bottom, which is when the story feels most convincing. The fall was temporary; locking it in was your decision.'
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
		title: 'Guaranteed returns',
		situation:
			'A message from someone who knows a friend of yours. \u25c8200 becomes \u25c8600 in six weeks, guaranteed, but you have to move today.',
		choices: [
			{
				id: 'in',
				label: 'Send the money',
				cost: 200,
				category: 'save',
				feedback:
					'Guaranteed, urgent, and paid by transfer. Those three words have never once been true together. The \u25c8200 is gone and nobody to ask.'
			},
			{
				id: 'check',
				label: 'Ask why it is urgent',
				cost: 0,
				freeTime: -1,
				category: null,
				feedback:
					'Urgency is the tell. Real investments survive being thought about overnight, and everything that cannot is selling you something else.'
			},
			{
				id: 'block',
				label: 'Delete it',
				cost: 0,
				category: null,
				feedback: 'Gone. They will try again with a different story, because it works on someone.'
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
		title: 'Danny has an app',
		situation:
			'Danny has an app. His cousin turned \u25c840 into \u25c852 last month and has screenshots. The button says invest and the countdown says nine minutes.',
		choices: [
			{
				id: 'in',
				label: 'Put in \u25c850',
				cost: 50,
				category: 'want',
				sets: { thread: 'risky_tip' },
				feedback:
					'Fifty into an app with a cartoon rocket and a countdown. Every part of that sentence was a tell.'
			},
			{
				id: 'out',
				label: 'Ask where the returns come from',
				cost: 0,
				freeTime: -1,
				category: null,
				feedback:
					'He did not know, and the group chat moved on. Nobody ever explains where guaranteed money comes from, because there is nowhere.'
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
		title: 'The app is gone',
		situation:
			'The app is gone from the store. Danny\u2019s cousin is typing in capitals. Yesterday your \u25c850 showed as \u25c868, and today there is no screen at all.',
		choices: [
			{
				id: 'report',
				label: 'Report it anyway',
				freeTime: -2,
				category: null,
				feedback:
					'The fraud line says the money left by choice and cannot be clawed back. The two hours still put a number on a list that gets someone caught.'
			},
			{
				id: 'chalk',
				label: 'Chalk it up',
				cost: 0,
				category: null,
				feedback:
					'Fifty to learn that guaranteed money is a story people tell. That is a cheap version of a lesson that usually costs more.'
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
		title: 'The limit went up',
		situation:
			'The card company has raised your limit to \u25c8500 and would like you to know it is there for you.',
		choices: [
			{
				id: 'ignore',
				label: 'Ignore the letter',
				cost: 0,
				category: null,
				feedback:
					'Five hundred available, zero used. A number going up is not money arriving, however much it looks like it.'
			},
			{
				id: 'use',
				label: 'Use some headroom',
				cost: 60,
				category: 'want',
				feedback:
					'Sixty on the card is sixty decided now and repaid later. The ceiling gets closer every time you touch it.'
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
		title: 'A weekend, in cash',
		situation:
			'A builder pays you \u25c8120 in notes for clearing a site. Nothing is written down anywhere.',
		choices: [
			{
				id: 'declare',
				label: 'Declare it',
				gain: 120,
				cost: 30,
				category: 'need',
				feedback:
					'Ninety after the deduction and a record that the work was real. Boring, and the version you can prove.'
			},
			{
				id: 'quiet',
				label: 'Keep it quiet',
				gain: 120,
				category: null,
				feedback:
					'One hundred twenty, untouched. Nothing happens until something else does and there is no record you were ever there.'
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
		title: 'We owe you',
		situation:
			'A text says the tax office owes you \u25c8240. The link asks for your bank details, and the deadline is today.',
		choices: [
			{
				id: 'click',
				label: 'Enter the details',
				cost: 120,
				category: 'need',
				feedback:
					'A refund you never claimed, a link, and a deadline. The \u25c8240 was the hook; the \u25c8120 was the price.'
			},
			{
				id: 'check',
				label: 'Check who sent it',
				cost: 0,
				freeTime: -1,
				category: null,
				feedback:
					'One hour on the real tax site and the text is gone. Refunds arrive in writing, from numbers you never had to ask about.'
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
		title: 'Somebody made a fortune',
		situation:
			'A friend of a friend turned \u25c8300 into \u25c82,000 in a month. He is posting the screenshots again.',
		choices: [
			{
				id: 'fund',
				label: 'Put it in the boring fund',
				cost: 50,
				category: 'save',
				feedback:
					'Fifty into seven per cent and a graph that moves too slowly to post. Slow is not a bug; it is the whole offer.'
			},
			{
				id: 'chase',
				label: 'Put thirty in the same thing',
				cost: 30,
				category: 'want',
				feedback:
					'Thirty in after the screenshot, which is when the story is most expensive. You bought at the part he was selling.'
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
		title: 'The first statement',
		situation:
			'One page, two numbers that matter: the full balance, or the minimum that keeps everything going.',
		choices: [
			{
				id: 'clear',
				label: 'Clear it now',
				cost: 40,
				category: 'need',
				feedback:
					'Paid in full before the interest existed. No fee, no letter next month, and the score moves the right way.'
			},
			{
				id: 'minimum',
				label: 'Pay the minimum',
				cost: 10,
				category: 'want',
				sets: { minimumStreak: 1 },
				feedback:
					'Ten now and a balance that ignores you. The minimum is affordable forever, which is exactly the business model.'
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
		title: 'Contents cover',
		situation:
			'You now own enough that losing it would matter. Cover on everything you own is \u25c812 a month.',
		odds: 'Roughly 1 in 12 renters claim in a given year.',
		choices: [
			{
				id: 'insure',
				label: 'Take it',
				cost: 12,
				category: 'need',
				sets: { insurance: true },
				feedback:
					'Twelve a month against losing everything at once. Insurance is not for the likely month, it is for the one you could not survive.'
			},
			{
				id: 'risk',
				label: 'Risk it',
				cost: 0,
				category: null,
				feedback:
					'You kept the \u25c812. Most years that is the right trade, and the year it is not, it is very much not.'
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
		title: 'Rent, again',
		situation:
			'Rent leaves on the first. It is more than half of everything you bring in, and it does not care what the rest of the month looked like.',
		choices: [
			{
				id: 'pay',
				label: 'Pay it and plan around it',
				cost: 0,
				category: null,
				feedback:
					'Paid first, everything else second. Planning backwards from the biggest fixed cost is the only version that survives.'
			},
			{
				id: 'delay',
				label: 'Let it go late this once',
				cost: 25,
				category: 'need',
				sets: { overdraft: 1 },
				feedback:
					'Once becomes the pattern faster than anyone expects, and the fee is the smallest part of what it costs you.'
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
		title: 'A real offer',
		situation:
			'Full-time, twelve and a half an hour, and the training nobody offers you in person. It is more than you have ever earned.',
		choices: [
			{
				id: 'take',
				label: 'Take it',
				cost: 0,
				category: null,
				feedback:
					'First real job. The wage is the small part \u2014 what you learn to do next is the bit that gets compounded.'
			},
			{
				id: 'push',
				label: 'Ask for more',
				cost: 0,
				freeTime: -2,
				category: null,
				feedback:
					'You asked. Two hours of preparation for a number you keep for years is the highest-paid work you will ever do.'
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
		title: 'Getting there',
		situation:
			'The monthly travel pass is \u25c890. Walking is an hour each way, and the shifts already finish late.',
		choices: [
			{
				id: 'pass',
				label: 'Buy the pass',
				cost: 90,
				category: 'need',
				feedback:
					'Ninety to arrive with a life left. The pass looks like the expensive option until you price the other one.'
			},
			{
				id: 'walk',
				label: 'Walk it',
				cost: 0,
				freeTime: -12,
				category: null,
				feedback:
					'Twelve hours a month on your own feet. The job pays the wage; getting to it charges rent.'
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
		title: 'The late shift',
		situation:
			'The late shift pays two an hour more and finishes after the last bus. Nobody else wants it.',
		choices: [
			{
				id: 'late',
				label: 'Take the late shifts',
				gain: 60,
				freeTime: -8,
				category: null,
				feedback:
					'Sixty for the shifts nobody wanted. Every workplace pays for the hours everyone else is asleep.'
			},
			{
				id: 'early',
				label: 'Keep the early ones',
				cost: 0,
				category: null,
				feedback:
					'You kept the evenings and left the premium on the table. A fair trade, as long as it was a trade.'
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
		title: 'Eleven shifts straight',
		situation:
			'You have covered eleven shifts in a row and the wage has not moved. The manager is in the office.',
		choices: [
			{
				id: 'ask',
				label: 'Ask for the raise',
				gain: 40,
				freeTime: -2,
				category: null,
				feedback:
					'Two hours of preparation and forty you keep every month after. Asking is the highest-paid work there is.'
			},
			{
				id: 'wait',
				label: 'Wait to be noticed',
				cost: 0,
				category: null,
				feedback:
					'You will be noticed eventually, when someone else asks and gets it. The wage does not move by itself.'
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
		title: 'One of them is leaving',
		situation:
			'A flatmate is moving out. Until someone else signs, the rent is a hundred a month more than the plan.',
		choices: [
			{
				id: 'cover',
				label: 'Cover the gap',
				cost: 100,
				category: 'save',
				feedback:
					'A hundred out of what you had put aside. This is what the buffer was for, and it will not last many months.'
			},
			{
				id: 'advertise',
				label: 'Advertise the room',
				cost: 0,
				freeTime: -6,
				category: null,
				feedback:
					'Six hours of viewings and awkward questions. Rooms fill; the gap only shrinks when someone does this.'
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
		title: 'Bring your own boots',
		situation:
			'The site needs steel-toe boots. New is \u25c870; a barely-used pair is \u25c830 if you can find the size.',
		choices: [
			{
				id: 'new',
				label: 'Buy them new',
				cost: 70,
				category: 'need',
				feedback:
					'Seventy and the right size straight away. The job pays for the boots eventually, and it is not the job paying today.'
			},
			{
				id: 'used',
				label: 'Find a used pair',
				cost: 30,
				freeTime: -4,
				category: 'need',
				feedback:
					'Thirty and four hours of hunting. Same steel, cheaper leather, and you paid the difference in time.'
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
		title: 'Loan day',
		situation:
			'The loan lands, and it feels like income. It is not income. It is next year\u2019s money arriving early, with your name on it.',
		choices: [
			{
				id: 'spread',
				label: 'Put the term\u2019s rent aside now',
				cost: 400,
				category: 'save',
				feedback:
					'Spread across the term, it becomes a wage. Spent in the first month, it becomes debt you are still paying at twenty-five.'
			},
			{
				id: 'celebrate',
				label: 'Deal with the details later',
				cost: 0,
				freeTime: 0,
				category: null,
				feedback:
					'The first month of a loan always feels like money. The fourth month is where the whole thing is decided.'
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
		title: 'Three books',
		situation:
			'Three books on the list, \u25c8120 new. Second-hand copies are about \u25c815 each, if you can find them.',
		choices: [
			{
				id: 'hunt',
				label: 'Chase second-hand copies',
				cost: 45,
				freeTime: -4,
				category: 'need',
				feedback:
					'Forty-five and an afternoon of messages. The knowledge is identical; the cover is cheaper.'
			},
			{
				id: 'new',
				label: 'Buy them new',
				cost: 120,
				category: 'need',
				feedback:
					'One hundred twenty for the convenience of starting today. The lecture is the same; the receipt is not.'
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
		title: 'Two weeks out',
		situation: 'Exams in a fortnight and the caf\u00e9 would give you every shift you asked for.',
		choices: [
			{
				id: 'revise',
				label: 'Book the library week',
				freeTime: -8,
				category: null,
				feedback:
					'Eight hours in the quiet room. The shifts will be there in three weeks; the exam will not.'
			},
			{
				id: 'shifts',
				label: 'Take the shifts anyway',
				gain: 50,
				freeTime: -10,
				category: null,
				feedback:
					'Fifty for a fortnight you will not get back before the exam. That is the trade: paid now, paid for later.'
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
		title: 'The lab needs a helper',
		situation:
			'A lab wants a summer helper \u2014 real work, a reference at the end, and two days a week all summer.',
		choices: [
			{
				id: 'take',
				label: 'Take the placement',
				gain: 100,
				freeTime: -14,
				category: null,
				feedback:
					'A hundred for the summer and a line on the CV that outlives every shift you did not take.'
			},
			{
				id: 'focus',
				label: 'Focus on the term',
				cost: 0,
				category: null,
				feedback:
					'You kept the summer for the term and the term for yourself. Nothing wasted, nothing gained, and doors do not stay open.'
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
		title: 'The railcard',
		situation:
			'A railcard is \u25c830 and takes a third off every train home for a year. You go home about once a month.',
		choices: [
			{
				id: 'buy',
				label: 'Buy the card',
				cost: 30,
				category: 'save',
				feedback:
					'Thirty up front against twelve cheaper trips. Spending to save wins whenever the trips actually happen.'
			},
			{
				id: 'fare',
				label: 'Pay as you go',
				cost: 15,
				category: 'need',
				feedback:
					'Fifteen this trip and fifteen next. Paying as you go keeps the choice open and the total higher.'
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
		title: 'The group meets at a caf\u00e9',
		situation:
			'The study group meets three times a week at a caf\u00e9, and everyone buys something. The cheapest thing is four.',
		choices: [
			{
				id: 'round',
				label: 'Buy your usual',
				cost: 24,
				category: 'want',
				feedback:
					'Twenty-four a month to belong to the group. That is not a scam \u2014 it is a cost, and now it is on the sheet.'
			},
			{
				id: 'host',
				label: 'Move it to yours',
				cost: 0,
				freeTime: -3,
				category: null,
				feedback:
					'Three hours tidying and a kettle. Belonging is still paid for; only the currency changed.'
			}
		]
	}
];

export function cardById(id: string): Card | undefined {
	return CARDS.find((c) => c.id === id);
}
