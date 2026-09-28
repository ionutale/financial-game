import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARDS } from '../game/cards';
import { choiceReactionKey } from './card-keys';
import {
	COPY_ALLOW_LIST,
	catalogueViolations,
	lintCatalogue,
	lintText,
	type CopyRuleId,
	type CopyScope
} from './copy-lint';
import { hasMessage } from './messages';

/**
 * The copy lint (ADR-0004, spec § "Copy lint"; ticket 01): the mechanical half
 * of `docs/voice.md`. Player-facing moment strings — every situation, Why
 * (`_feedback`) and Reaction (`_reaction`) — must not carry the classroom's
 * vocabulary. The it/ro catalogues are held by the translation brief and the
 * Fink pass: the same idea does not translate to the same letters, so this
 * lexical gate runs on English only.
 *
 * The lint is a review gate, not a natural-language checker. It catches the
 * ban list's lexemes and frames, not every maxim an author could write; a
 * hand-curated allow-list records where the fiction legitimately uses a word
 * and where the copy waves still owe a rewrite. The lint fails on a stale
 * allowance, so the list can only shrink.
 */

const en = JSON.parse(
	readFileSync(new URL('../../../messages/en.json', import.meta.url), 'utf8')
) as Record<string, unknown>;

/** The ban list from the design's §3.1, one seeded string per item. */
const SEEDED: Array<{ item: string; text: string; rule: CopyRuleId; scope: CopyScope }> = [
	{ item: 'lesson', text: 'That is the lesson.', rule: 'classroom', scope: 'situation' },
	{ item: 'learn', text: 'You will learn to budget.', rule: 'classroom', scope: 'why' },
	{ item: 'teach', text: 'This teaches you to save.', rule: 'classroom', scope: 'why' },
	{ item: 'quiz', text: 'A short quiz follows.', rule: 'classroom', scope: 'situation' },
	{ item: 'test', text: 'You passed the test.', rule: 'classroom', scope: 'situation' },
	{ item: 'unlock', text: 'You unlock budgeting.', rule: 'classroom', scope: 'situation' },
	{ item: 'curriculum', text: 'The curriculum says so.', rule: 'classroom', scope: 'situation' },
	{ item: 'course', text: 'A course in money.', rule: 'classroom', scope: 'situation' },
	{ item: 'mastery', text: 'Mastery of budgeting.', rule: 'classroom', scope: 'situation' },
	{ item: 'streak', text: 'Keep the streak alive.', rule: 'classroom', scope: 'situation' },
	{ item: 'the point is', text: 'The point is to pay yourself first.', rule: 'frame', scope: 'why' },
	{ item: 'this game', text: 'Nothing else in this game pays.', rule: 'frame', scope: 'why' },
	{ item: 'points', text: 'Five points for you.', rule: 'reward', scope: 'reaction' },
	{ item: 'score-as-behaviour', text: 'Your score goes up.', rule: 'reward', scope: 'reaction' },
	{ item: 'remember', text: 'Remember to check it.', rule: 'maxim', scope: 'reaction' },
	{ item: 'should', text: 'You should save more.', rule: 'maxim', scope: 'reaction' },
	{ item: 'always', text: 'Always pay yourself first.', rule: 'maxim', scope: 'reaction' },
	{ item: 'never', text: 'Never borrow for a want.', rule: 'maxim', scope: 'reaction' }
];

describe('the copy lint’s ban list (ADR-0004)', () => {
	for (const { item, text, rule, scope } of SEEDED) {
		it(`fails on "${item}"`, () => {
			expect(lintText(text, scope).map((v) => v.rule), `${item}: ${text}`).toContain(rule);
		});
	}

	it('holds a Reaction to maxims, where a Why may carry a Rule of Thumb', () => {
		const maxim = 'Remember: always keep it boring.';
		expect(lintText(maxim, 'reaction').map((v) => v.rule)).toContain('maxim');
		// A Why is where a Rule of Thumb may legitimately be said; the review,
		// which knows the Teachable Moment, judges that one.
		expect(lintText(maxim, 'why')).toEqual([]);
	});

	it('stays quiet on honest prose', () => {
		expect(lintText('The bus was late and the fare went up.', 'situation')).toEqual([]);
		expect(lintText('You kept the weekend.', 'reaction')).toEqual([]);
	});

	it('scans situations, Whys and Reactions', () => {
		const violations = lintCatalogue({
			card_the_allowance_situation: 'A lesson begins.',
			card_the_allowance_choice_spend_feedback: 'A lesson begins.',
			card_the_allowance_choice_spend_reaction: 'Remember this.'
		});
		expect(violations.map((v) => [v.key, v.rule])).toEqual([
			['card_the_allowance_situation', 'classroom'],
			['card_the_allowance_choice_spend_feedback', 'classroom'],
			['card_the_allowance_choice_spend_reaction', 'maxim']
		]);
	});

	it('scans the Callback lines, where nothing general is ever said', () => {
		const violations = lintCatalogue({
			callback_first_spent: 'Remember how the first allowance went.',
			callback_first_kept: 'A lesson on keeping money.'
		});
		expect(violations.map((v) => [v.key, v.rule])).toEqual([
			['callback_first_spent', 'maxim'],
			['callback_first_kept', 'classroom']
		]);
	});
});

describe('the copy lint over the en catalogue', () => {
	it('passes: every current exception is on the curated allow-list', () => {
		expect(lintCatalogue(en)).toEqual([]);
	});

	it('applies the allow-list per offending word — new copy on a known key still fails', () => {
		const course = en.card_evening_course_situation as string;
		expect(lintCatalogue({ card_evening_course_situation: course })).toEqual([]);
		expect(
			lintCatalogue({ card_evening_course_situation: `${course} A lesson, too.` }).map((v) =>
				v.match.toLowerCase()
			)
		).toEqual(['lesson']);
	});

	it('allows an exception only while the catalogue still needs it — the list may only shrink', () => {
		const current = new Set(
			catalogueViolations(en).map((v) => `${v.key}|${v.rule}|${v.match.toLowerCase()}`)
		);
		for (const allowance of COPY_ALLOW_LIST) {
			expect(
				current.has(`${allowance.key}|${allowance.rule}|${allowance.match.toLowerCase()}`),
				`stale allowance: ${allowance.key} no longer trips ${allowance.rule} on "${allowance.match}" — remove it`
			).toBe(true);
			expect(allowance.reason.length, `allowance ${allowance.key} has no reason`).toBeGreaterThan(0);
		}
	});

	it('keeps every allowance scoped to a real choice or situation key', () => {
		for (const allowance of COPY_ALLOW_LIST) {
			expect(
				/^card_.+(_situation|_choice_.+_(feedback|reaction))$/.test(allowance.key),
				`allowance ${allowance.key} is not a moment key`
			).toBe(true);
		}
	});
});

/**
 * The copy waves (fun-pass tickets 03 and 12): every Choice in the deck is
 * answered with a Reaction beside its Why. This is the waves' ratchet — a
 * Choice that loses its Reaction fails here. The single-paragraph fallback
 * remains the resolver's behaviour for an absent key (pinned in
 * `card-text.test.ts`); no deck Choice uses it any more.
 */
describe('the copy waves (fun-pass tickets 03 and 12)', () => {
	it('answers every Choice in the deck with a Reaction', () => {
		for (const card of CARDS) {
			for (const choice of card.choices) {
				expect(
					hasMessage(choiceReactionKey(card.id, choice.id)),
					`${card.id}/${choice.id} has no Reaction`
				).toBe(true);
			}
		}
	});

	it('leaves only the fiction’s own words on the allow-list — the sweep debt is paid, not excused', () => {
		// The whole catalogue's raw violations, allow-list aside: exactly the
		// five words whose card is *about* them (the evening course, the Credit
		// Score's points). Any other word anywhere in a situation, Why or
		// Reaction fails this test before the allow-list can excuse it.
		const expected = [
			'card_credit_check_free_situation|reward|score',
			'card_credit_limit_rise_situation|reward|points',
			'card_evening_course_situation|classroom|course',
			'card_score_check_situation|reward|points',
			'card_score_goal_situation|reward|score'
		];
		const actual = catalogueViolations(en)
			.map((v) => `${v.key}|${v.rule}|${v.match.toLowerCase()}`)
			.sort();
		expect(actual).toEqual(expected);
	});

	it('keeps the month-loop chrome (intro, plan, event, resolve) free of the ban list', () => {
		// Ticket 03's chrome change shipped without a regression pin: the lint's
		// card-moment scope never reached this copy. The lint is still not a
		// chrome scanner (the record surfaces legitimately say "score" and
		// "never"), but the surfaces a player meets before any card should not
		// carry the classroom — pin the four prefixes.
		const prefixes = ['intro_', 'plan_', 'event_', 'resolve_'];
		for (const [key, value] of Object.entries(en)) {
			if (!prefixes.some((prefix) => key.startsWith(prefix))) continue;
			if (typeof value !== 'string') continue;
			expect(lintText(value, 'situation'), `${key}: ${value}`).toEqual([]);
		}
	});
});
