<script lang="ts">
	import { fly } from 'svelte/transition';

	import type { Word } from '$lib/types';
	import type { PageData } from './$types';

	export let data: PageData;

	enum SearchMode {
		Word = 'ixo',
		Definition = 'definition',
		Etymology = 'etymology',
		Language = 'language',
		PartOfSpeech = 'part of speech'
	}

	const keys: Record<SearchMode, keyof Word> = {
		[SearchMode.Word]: 'lexeme',
		[SearchMode.Definition]: 'definition',
		[SearchMode.Etymology]: 'etymology',
		[SearchMode.Language]: 'language',
		[SearchMode.PartOfSpeech]: 'partOfSpeech'
	};

	$: words = data.words;

	let searchMode = SearchMode.Word;
	let search = '';

	$: filteredWords = words.filter(word => {
		if (search === '') return true;

		const key = keys[searchMode];

		return (word[key] as string).toLowerCase().includes(search.toLowerCase());
	});

	let selectedWord: Word | null = null;
</script>

<h1 class="mt-12 font-bold text-4xl">kata ixo</h1>

<p class="mt-4">
	<select bind:value={searchMode} class="px-2 py-1 interactable cursor-pointer">
		{#each Object.values(SearchMode) as mode}
			<option value={mode}>{mode}</option>
		{/each}
	</select>
</p>

<p class="mt-2 faded">
	{filteredWords.length} / {words.length}
</p>

<p class="mt-1">
	<input
		type="text"
		placeholder="{searchMode}..."
		bind:value={search}
		class="w-96 max-w-full px-3 py-2 interactable"
	/>
</p>

<div class="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
	{#each filteredWords as word}
		<button
			class="flex flex-col text-left p-4 clickable"
			on:click={() => {
				if (selectedWord === word) {
					selectedWord = null;
				} else {
					selectedWord = word;
				}
			}}
		>
			<h2 class="font-bold text-xl">{word.lexeme}</h2>
			<p class="faded">{word.partOfSpeech}</p>
			<p>
				{word.definition.length > 120
					? word.definition.slice(0, 120) + '...'
					: word.definition}
			</p>
		</button>
	{/each}
</div>

{#if selectedWord}
	{#key selectedWord.lexeme}
		<div
			transition:fly={{ y: 24, duration: 300 }}
			class="fixed p-4 bottom-0 left-0 right-0 border-t border-gray-200
				sm:w-96 sm:left-auto sm:bottom-4 sm:right-4 sm:box shadow-lg"
		>
			<h2 class="font-bold text-xl">{selectedWord.lexeme}</h2>
			<p class="faded">{selectedWord.partOfSpeech}</p>
			<p class="mt-2">{selectedWord.definition}</p>
			<p class="mt-2">
				{selectedWord.language} &middot;
				{selectedWord.etymology}
			</p>
			<p class="mt-2 italic">{selectedWord.creator}</p>

			<button
				class="mt-4 px-2 py-1 clickable"
				on:click={() => (selectedWord = null)}
			>
				Close
			</button>
		</div>
	{/key}
{/if}
