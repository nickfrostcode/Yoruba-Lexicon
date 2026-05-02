export interface Entry {
	id: string;
	word: string;
	phonetic: string | null;
	part_of_speech: string | null;
	definition: string;
	example_yoruba: string | null;
	example_english: string | null;
	status: "pending" | "approved";
	created_at: string;
	contributor_id: string | null;
}

export interface Contribution {
	id: string;
	word: string;
	definition: string;
	status: "pending" | "approved";
	created_at: string;
}

export interface LexiconEntry {
	word: string;
	phonetic: string;
	part_of_speech: string;
	definition: string;
	example_yoruba: string;
	example_english: string;
	contributor_id: string;
	status: string;
}
