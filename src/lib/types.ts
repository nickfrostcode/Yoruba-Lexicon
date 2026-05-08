/** @format */

export interface BaseWord {
	id: string;
	word: string;
	normalized_word: string;
	alphabet: string;
	syllables: number | null;
	note: string | null;
	created_by: string | null;
	created_at: string;
	variant_count?: number;
}

export interface LexiconEntry {
	id: string;
	base_word_id: string;
	word: string;
	phonetic: string | null;
	part_of_speech: string | null;
	definition: string;
	example_yoruba: string | null;
	example_english: string | null;
	status: "unverified" | "verified";
	created_at: string;
	contributor_id: string | null;
	base_word?: BaseWord; // joined data
	profiles?: { full_name: string }; // joined data
}

export interface LexiconEntryForm {
	base_word_id: string;
	word: string;
	phonetic: string;
	part_of_speech: string;
	definition: string;
	example_yoruba: string;
	example_english: string;
}

export interface Contribution {
	id: string;
	base_word_id: string;
	word: string;
	phonetic: string;
	definition: string;
	status: "unverified" | "verified";
	created_at: string;
	base_word?: BaseWord; // joined data
}

export interface BrowseEntry {
	id: string;
	word: string;
	syllables?: number;
	variant_count: number;
	has_verified?: boolean;
}
