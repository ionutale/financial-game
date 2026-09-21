declare global {
	namespace App {
		interface Locals {
			/** The peppered digest of the anonymous profile cookie (ticket 12). */
			profileKey: string;
		}
	}
}

export {};
