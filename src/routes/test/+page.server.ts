import type { Word } from '$lib/types';

import type { PageServerLoad } from './$types';

export const load = (async ({ fetch }) => {
	return {
		words: fetch('/api/words').then(r => r.json()) as Promise<Word[]>
	};
}) satisfies PageServerLoad;
