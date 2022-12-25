<script lang="ts">
	import type { Word } from '$lib/types';
	import type { PageData } from './$types';

	export let data: PageData;

	$: words = data.words;

	const keys: (keyof Word)[] = [
		'partOfSpeech',
		'language',
		'sortingSubtype',
		'creator'
	];

	$: unique = keys.map(key => ({
		key,
		values: [...new Set(words.map(row => row[key]))]
	}));
</script>

<h1 class="mt-12 font-bold text-4xl">kata ixo</h1>

{#each unique as { key, values }}
	<p class="mt-2">
		<b>{key}</b>: {values.map(value => JSON.stringify(value)).join(', ')}
	</p>
{/each}

<pre class="mt-4 whitespace-pre-wrap">{JSON.stringify(words, null, 2)}</pre>
