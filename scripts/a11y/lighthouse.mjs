#!/usr/bin/env node
/**
 * The Lighthouse half of the accessibility gate (ticket 24).
 *
 * Audits the home screen's accessibility category only. Performance and SEO
 * are deliberately not gated: this run is a WCAG 2.2 AA check, and a slow
 * font load or a missing meta description must not fail it.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

const PORT = Number(process.env.A11Y_PORT ?? 4173);
const BASE_URL = process.env.A11Y_BASE_URL ?? `http://localhost:${PORT}`;
const TARGET = new URL('/', BASE_URL).href;

/**
 * The gate is 0.95, not 1.0. The score is weighted, and one non-AA
 * best-practice audit can shave a few points without breaking a WCAG 2.2 AA
 * commitment; a real AA regression (contrast, names, roles — the audits the
 * axe gate also watches) costs far more than 0.05 and lands below the line.
 */
const THRESHOLD = 0.95;

const REPORT_DIR = 'reports';
const JSON_REPORT = path.join(REPORT_DIR, 'lighthouse-accessibility.json');
const HTML_REPORT = path.join(REPORT_DIR, 'lighthouse-accessibility.html');

/** Prefer an explicit Chrome, then the Chromium Playwright installed. */
function findChrome() {
	if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
	try {
		const bundled = chromium.executablePath();
		if (fs.existsSync(bundled)) return bundled;
	} catch {
		// Playwright is not installed for this platform; let Chrome Launcher search.
	}
	return undefined;
}

const chrome = await launch({
	chromePath: findChrome(),
	chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
	logLevel: 'error'
});

let exitCode = 1;
try {
	const result = await lighthouse(TARGET, {
		port: chrome.port,
		output: ['json', 'html'],
		onlyCategories: ['accessibility'],
		logLevel: 'error'
	});

	if (!result || !result.lhr) throw new Error('Lighthouse returned no result');

	const [json, html] = result.report;
	fs.mkdirSync(REPORT_DIR, { recursive: true });
	fs.writeFileSync(JSON_REPORT, json);
	fs.writeFileSync(HTML_REPORT, html);

	const score = result.lhr.categories.accessibility.score ?? 0;
	const belowOne = Object.values(result.lhr.audits)
		.filter((audit) => typeof audit.score === 'number' && audit.score < 1)
		.map((audit) => `  - ${audit.id}: ${audit.title}${audit.displayValue ? ` (${audit.displayValue})` : ''}`);

	console.log(`Lighthouse accessibility on ${TARGET}: ${score.toFixed(2)}`);
	if (belowOne.length) console.log(`Audits scoring below 1.00:\n${belowOne.join('\n')}`);

	if (score < THRESHOLD) {
		console.error(`FAIL: ${score.toFixed(2)} is below the ${THRESHOLD} gate — see ${JSON_REPORT}`);
	} else {
		console.log(`PASS: ${score.toFixed(2)} ≥ ${THRESHOLD} — report written to ${JSON_REPORT}`);
		exitCode = 0;
	}
} catch (error) {
	console.error(`Lighthouse failed: ${error instanceof Error ? error.message : error}`);
} finally {
	await chrome.kill();
}

process.exitCode = exitCode;
