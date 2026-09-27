/**
 * The copy lint (ADR-0004, ticket 01): the mechanical half of `docs/voice.md`.
 *
 * Player-facing moment strings — a card's situation, a Choice's Why
 * (`card_<id>_choice_<choice>_feedback`) and a Choice's Reaction
 * (`card_<id>_choice_<choice>_reaction`) — must not carry the classroom's
 * vocabulary. The Reaction is held to the whole ban list: it shows what the
 * world did and never states a general rule. The situation is held to the
 * whole list too — it sets a scene, it does not lecture. The Why is held to
 * the classroom lexemes and the narrator-stepping-out frames, because a Why is
 * exactly where a Rule of Thumb may legitimately be said at a Teachable
 * Moment; the review, which knows the Moment, judges those.
 *
 * A review gate, not a natural-language checker: it catches the ban list's
 * lexemes and frames, not every maxim an author could write. English only —
 * the same idea does not translate to the same letters (translation brief; the
 * Fink pass holds it/ro).
 *
 * The curated allow-list below records the current catalogue's exceptions, one
 * per offending word: where the fiction legitimately uses the word, and where
 * the copy waves still owe a rewrite (the design's waves 03/12). The lint
 * fails on a stale allowance, so the list can only shrink; a new banned word
 * on an already-allowed key still fails.
 */
import { CARDS } from '../game/cards';
import { cardSituationKey, choiceFeedbackKey, choiceReactionKey } from './card-keys';

export type CopyScope = 'situation' | 'reaction' | 'why';

export type CopyRuleId = 'classroom' | 'frame' | 'maxim' | 'reward';

export interface CopyViolation {
	rule: CopyRuleId;
	/** The offending word or phrase, as matched in the source text. */
	match: string;
}

export interface CatalogueViolation extends CopyViolation {
	key: string;
}

interface CopyRule {
	id: CopyRuleId;
	scopes: readonly CopyScope[];
	pattern: RegExp;
}

/**
 * The ban list from the design (§3.1), as lexemes. `classroom` is the
 * curriculum's own vocabulary; `frame` is the narrator stepping outside the
 * fiction; `reward` is the reward-economy language the pass excludes; `maxim`
 * is the imperative/general-law register, banned in the moment but legitimate
 * inside a Why (CONTEXT: the Why is the only place a Rule of Thumb may appear).
 */
const RULES: readonly CopyRule[] = [
	{
		id: 'classroom',
		scopes: ['situation', 'reaction', 'why'],
		pattern:
			/\b(?:lesson|lessons|learn|learns|learned|learning|learnt|teach|teaches|teaching|taught|quiz|quizzes|test|tests|tested|testing|unlock|unlocks|unlocked|unlocking|curriculum|mastery|mastered|mastering|course|courses|streak|streaks)\b/gi
	},
	{
		id: 'frame',
		scopes: ['situation', 'reaction', 'why'],
		pattern: /\bthis game\b|\bthe point\b/gi
	},
	{
		id: 'reward',
		scopes: ['situation', 'reaction'],
		pattern: /\b(?:points|score)\b/gi
	},
	{
		id: 'maxim',
		scopes: ['situation', 'reaction'],
		pattern: /\b(?:always|never|should|remember)\b/gi
	}
];

/** Every ban the lint applies to one player-facing string in a given scope. */
export function lintText(text: string, scope: CopyScope): CopyViolation[] {
	const violations: CopyViolation[] = [];
	for (const rule of RULES) {
		if (!rule.scopes.includes(scope)) continue;
		for (const match of text.matchAll(rule.pattern)) {
			violations.push({ rule: rule.id, match: match[0] });
		}
	}
	return violations;
}

/**
 * Every violation the deck's own keys currently hold, before the allow-list.
 * Situations and Whys are mandatory, Reactions optional; a catalogue missing
 * a key is skipped, like every other gate.
 */
export function catalogueViolations(messages: Record<string, unknown>): CatalogueViolation[] {
	const violations: CatalogueViolation[] = [];
	for (const card of CARDS) {
		const targets: Array<[string, CopyScope]> = [
			[cardSituationKey(card.id), 'situation'],
			...card.choices.flatMap((choice): Array<[string, CopyScope]> => [
				[choiceFeedbackKey(card.id, choice.id), 'why'],
				[choiceReactionKey(card.id, choice.id), 'reaction']
			])
		];
		for (const [key, scope] of targets) {
			const text = messages[key];
			if (typeof text !== 'string') continue;
			for (const violation of lintText(text, scope)) violations.push({ key, ...violation });
		}
	}
	return violations;
}

/** One (key, rule, word) the current catalogue is allowed to keep. */
export interface CopyAllowance {
	key: string;
	rule: CopyRuleId;
	/** The exact offending word, as the lint matched it. */
	match: string;
	/** Why it stands: the fiction's own word, or the sweep debt it belongs to. */
	reason: string;
}

/**
 * The curated allow-list. Not a place to put new copy: each entry pins one
 * offending word on one key, and the test fails the moment the word is gone
 * (a stale allowance) or another banned word arrives on that key.
 */
export const COPY_ALLOW_LIST: readonly CopyAllowance[] = [
	// --- The fiction's own word -------------------------------------------------
	{
		key: 'card_evening_course_situation',
		rule: 'classroom',
		match: 'course',
		reason: 'fiction’s own word: the college runs an evening coding course (design §3.1’s example)'
	},
	{
		key: 'card_credit_limit_rise_situation',
		rule: 'reward',
		match: 'points',
		reason: 'fiction’s own word: ‘a friend points out’ — the verb, not a count'
	},
	{
		key: 'card_score_check_situation',
		rule: 'reward',
		match: 'points',
		reason: 'fiction’s own word: the Credit Score’s points, shown in the app'
	},
	{
		key: 'card_score_goal_situation',
		rule: 'reward',
		match: 'score',
		reason: 'fiction’s own word: the credit check and the file'
	},
	{
		key: 'card_credit_check_free_situation',
		rule: 'reward',
		match: 'score',
		reason: 'fiction’s own word: the Credit Score, seen for free'
	},

	// --- Sweep debt: the copy waves (03/12) rewrite these -----------------------
	{
		key: 'card_the_crash_choice_hold_feedback',
		rule: 'classroom',
		match: 'lesson',
		reason: 'sweep debt: ‘This is the whole lesson.’'
	},
	{
		key: 'card_app_vanishes_choice_chalk_feedback',
		rule: 'classroom',
		match: 'learn',
		reason: 'sweep debt: ‘to learn that guaranteed money is a story’'
	},
	{
		key: 'card_app_vanishes_choice_chalk_feedback',
		rule: 'classroom',
		match: 'lesson',
		reason: 'sweep debt: ‘a cheap version of a lesson’'
	},
	{
		key: 'card_score_goal_choice_wait_feedback',
		rule: 'classroom',
		match: 'learn',
		reason: 'sweep debt: ‘to learn which payments move the number’'
	},
	{
		key: 'card_graduate_job_choice_take_feedback',
		rule: 'classroom',
		match: 'learn',
		reason: 'sweep debt: ‘what you learn to do next’'
	},
	{
		key: 'card_credit_limit_rise_choice_ignore_feedback',
		rule: 'classroom',
		match: 'teaches',
		reason: 'sweep debt: ‘most of what this stage teaches’'
	},
	{
		key: 'card_savings_milestone_choice_celebrate_feedback',
		rule: 'classroom',
		match: 'streak',
		reason: 'sweep debt: ‘how the streak survives’'
	},
	{
		key: 'card_subscription_creep_choice_cut_feedback',
		rule: 'frame',
		match: 'this game',
		reason: 'sweep debt: the narrator stepping out of the fiction'
	},
	{
		key: 'card_interest_first_choice_more_feedback',
		rule: 'frame',
		match: 'this game',
		reason: 'sweep debt: the narrator stepping out of the fiction'
	},
	{
		key: 'card_odd_job_choice_take_feedback',
		rule: 'frame',
		match: 'the point',
		reason: 'sweep debt: ‘which is exactly the point’'
	},
	{
		key: 'card_savings_milestone_choice_add_feedback',
		rule: 'frame',
		match: 'the point',
		reason: 'sweep debt: ‘The number is not the point’'
	},
	{
		key: 'card_the_fork_choice_study_feedback',
		rule: 'frame',
		match: 'the point',
		reason: 'sweep debt: ‘which is the point’'
	}
];

const allowanceKey = (key: string, rule: CopyRuleId, match: string): string =>
	`${key}|${rule}|${match.toLowerCase()}`;

/** The catalogue's violations with the curated allowances removed. */
export function lintCatalogue(messages: Record<string, unknown>): CatalogueViolation[] {
	const allowed = new Set(COPY_ALLOW_LIST.map((a) => allowanceKey(a.key, a.rule, a.match)));
	return catalogueViolations(messages).filter(
		(violation) => !allowed.has(allowanceKey(violation.key, violation.rule, violation.match))
	);
}
