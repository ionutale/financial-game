/**
 * The 12-month inactivity cutoff (ticket 12). Calendar months in UTC, not 365
 * days, so an untouched profile is deleted a year after its last write.
 */
export function retentionCutoff(now: Date): Date {
	const cutoff = new Date(now);
	cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
	return cutoff;
}
