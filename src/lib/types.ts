export interface Word {
	lexeme: string;
	definition: string;

	/**
	 * One word, "e", has "particle, interjection" as its part of speech.
	 */
	partOfSpeech: string;

	/**
	 * The raw data from the spreadsheet includes the language name at the start of the
	 * field despite also having a separate column for the language name. This property
	 * removes that word.
	 */
	etymology: string;

	creator: string;

	/**
	 * This property can be used to sort words into general categories with localeCompare.
	 */
	sortingSubtype: string;

	language: string;

	/**
	 * This property is not reliable since some of the words don't have a Yes/No value
	 * in the spreadsheet.
	 */
	indoeuropeanLang: boolean;
}
