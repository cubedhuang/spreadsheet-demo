import { env } from '$env/dynamic/private';
import type { JSONClient } from 'google-auth-library/build/src/auth/googleauth';
import { google } from 'googleapis';

import type { PageServerLoad } from './$types';

async function listMajors(auth: JSONClient) {
	const sheets = google.sheets({ version: 'v4', auth });
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
		range: 'Class Data!A2:E'
	});
	const rows = res.data.values;
	if (!rows || rows.length === 0) {
		console.log('No data found.');
		return;
	}
	console.log('Name, Major:');

	return rows;
}

export const load: PageServerLoad = async () => {
	const client = google.auth.fromJSON({
		type: 'authorized_user',
		client_id: env.GOOGLE_CLIENT_ID,
		client_secret: env.GOOGLE_CLIENT_SECRET,
		refresh_token: env.GOOGLE_REFRESH_TOKEN
	});

	const rows = await listMajors(client);

	return { rows };
};
