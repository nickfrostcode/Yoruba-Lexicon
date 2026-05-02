/** @format */

export interface LexiconEntry {
	id: string;
	base_word: string;
	phonetic: string | null;
	syllables: number | null;
	part_of_speech: string | null;
	definition: string;
	example_yoruba: string | null;
	example_english: string | null;
	status: "pending" | "approved";
	created_at: string;
	contributor_id: string | null;
}

export interface LexiconEntryForm {
	base_word: string;
	phonetic: string;
	part_of_speech: string;
	definition: string;
	example_yoruba: string;
	example_english: string;
	syllables: string;
}

export interface Contribution {
	id: string;
	base_word: string;
	phonetic: string;
	definition: string;
	status: "pending" | "approved";
	created_at: string;
}

export interface BrowseEntry {
	id: string;
	base_word: string;
	phonetic: string | null;
	syllables: number | null;
	part_of_speech: string | null;
	definition: string;
	example_yoruba: string | null;
	example_english: string | null;
	status: "approved";
}
