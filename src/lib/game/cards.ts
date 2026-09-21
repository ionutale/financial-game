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

	// ---------------------------------------------------------------- Stage 5
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
				cost: 650,
				category: 'save',
				sets: { path: 'work' },
				feedback:
					'Full-time wage, and rent the moment you move \u2014 starting with the deposit. This is why the Save envelope mattered in year one.'
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
		weight: 3,
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
	}
];

export function cardById(id: string): Card | undefined {
	return CARDS.find((c) => c.id === id);
}
