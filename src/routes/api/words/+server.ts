import { json } from '@sveltejs/kit';
import { google } from 'googleapis';

import { env } from '$env/dynamic/private';
import type { Word } from '$lib/types';
import type { RequestHandler } from './$types';

interface RawWord {
	lexeme: string;
	partOfSpeech: string;
	definition: string;
	etymology: string;
	creator: string;
	sortingSubtype: string;
	language: string;
	indoeuropeanLang: string;
}

function toCamelCase(str: string) {
	return str
		.toLowerCase()
		.replace(/[^a-zA-Z0-9 ]/g, '')
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
			return index === 0
				? word.toLowerCase()
				: word[0].toUpperCase() + word.slice(1).toLowerCase();
		})
		.replace(/\s+/g, '');
}

async function fetchRows(): Promise<string[][]> {
	const client = google.auth.fromJSON({
		type: 'authorized_user',
		client_id: env.GOOGLE_CLIENT_ID,
		client_secret: env.GOOGLE_CLIENT_SECRET,
		refresh_token: env.GOOGLE_REFRESH_TOKEN
	});

	const sheets = google.sheets({ version: 'v4', auth: client });
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId: '1vmDp7_kpWDiAEaNjbDlpKVzU9DfbLVVerHfXDbyL9Bs',
		range: 'Official words!A1:H'
	});

	return res.data.values ?? [];
}

function buildRawWordsFromRows(rows: string[][]) {
	const keys = rows[0].map(toCamelCase) as (keyof RawWord)[];

	const words = rows
		.slice(1)
		.map(row => Object.fromEntries(row.map((value, i) => [keys[i], value])));

	// @ts-expect-error string Object.fromEntries returns { [key: string]: string }
	return words as RawWord[];
}

function cleanUpRawWords(rawWords: RawWord[]) {
	return rawWords.map(word => {
		const etymology = word.etymology.startsWith(word.language)
			? word.etymology.slice(word.language.length).trim()
			: word.etymology;

		return {
			...word,
			etymology,
			indoeuropeanLang: word.indoeuropeanLang === 'Yes'
		} as Word;
	});
}

// only fetch from google sheets once every 5 minutes

const cache = {
	words: [] as Word[],
	lastFetched: 0,
	timesFetched: 0
};

export const GET = (async ({ setHeaders }) => {
	const now = Date.now();

	if (now - cache.lastFetched > 5 * 60 * 1000) {
		cache.words = cleanUpRawWords(buildRawWordsFromRows(await fetchRows()));
		cache.lastFetched = now;
		cache.timesFetched++;
	}

	setHeaders({
		'Cache-Control': 'max-age=300, public',
		'X-Times-Fetched': cache.timesFetched.toString()
	});

	return json(cache.words);
}) satisfies RequestHandler;
