import { env } from '$env/dynamic/private';
import type { Word } from '$lib/types';
import { json } from '@sveltejs/kit';
import { google } from 'googleapis';
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

export const prerender = true;

export const GET = (async () => {
	return json(cleanUpRawWords(buildRawWordsFromRows(await fetchRows())));
}) satisfies RequestHandler;
