/** @format */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		"Supabase URL and Anon Key are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.",
	);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
		storage: typeof window !== "undefined" ? window.localStorage : undefined,
	},
});

interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					email: string;
					full_name: string | null;
					role: "user" | "admin";
					created_at: string;
				};
				Insert: {
					id: string;
					email: string;
					full_name?: string | null;
					avatar_url?: string | null;
					role?: "user" | "admin";
					created_at?: string;
				};
				Update: {
					id?: string;
					email?: string;
					full_name?: string | null;
					role?: "user" | "admin";
					created_at?: string;
				};
			};
			base_words: {
				Row: {
					id: string;
					word: string;
					normalized_word: string;
					alphabet: string;
					syllables: number | null;
					note: string | null;
					created_by: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					word: string;
					normalized_word: string;
					alphabet: string;
					syllables?: number | null;
					note?: string | null;
					created_by?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					word?: string;
					normalized_word?: string;
					alphabet?: string;
					syllables?: number | null;
					note?: string | null;
					created_by?: string | null;
					created_at?: string;
				};
			};
			lexicon_entries: {
				Row: {
					id: string;
					base_word_id: string;
					phonetic: string | null;
					syllables: number | null;
					part_of_speech: string | null;
					definition: string;
					example_yoruba: string | null;
					example_english: string | null;
					contributor_id: string | null;
					status: "pending" | "approved";
					created_at: string;
				};
				Insert: {
					id?: string;
					base_word_id: string;
					phonetic?: string | null;
					syllables?: number | null;
					part_of_speech?: string | null;
					definition: string;
					example_yoruba?: string | null;
					example_english?: string | null;
					contributor_id?: string | null;
					status?: "pending" | "approved";
					created_at?: string;
				};
				Update: {
					id?: string;
					base_word_id?: string;
					phonetic?: string | null;
					syllables?: number | null;
					part_of_speech?: string | null;
					definition?: string;
					example_yoruba?: string | null;
					example_english?: string | null;
					contributor_id?: string | null;
					status?: "pending" | "approved";
					created_at?: string;
				};
			};
		};
		Views: {};
		Enums: {};
		Functions: {
			get_contributors_leaderboard: {
				Args: Record<string, never>;
				Returns: {
					id: string;
					full_name: string | null;
					email: string | null;
					contribution_count: number;
					last_contribution_at: string | null;
				}[];
			};
		};
	};
}
