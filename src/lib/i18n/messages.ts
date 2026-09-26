/**
 * One seam over Paraglide's generated catalogue (ticket 26). Static keys are
 * called through the typed `m` namespace; keys derived from domain ids (card,
 * choice, concept, thread) go through `message()`, and the deck-integrity test
 * is what keeps those honest.
 */
import * as catalogue from '$lib/paraglide/messages';

export { m } from '$lib/paraglide/messages';

export type MessageParams = Record<string, string | number>;

export function message(key: string, params?: MessageParams): string {
	const fn = (catalogue as Record<string, unknown>)[key];
	if (typeof fn !== 'function') {
		throw new Error(`i18n: missing message "${key}"`);
	}
	return (fn as (p?: MessageParams) => string)(params);
}

export function hasMessage(key: string): boolean {
	return typeof (catalogue as Record<string, unknown>)[key] === 'function';
}
