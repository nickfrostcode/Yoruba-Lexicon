import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getSupabase = (): SupabaseClient => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL and Anon Key are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables (Secrets panel in AI Studio).'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

// Lazy-initialized Supabase client using a Proxy
let instance: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    if (!instance) {
      instance = getSupabase();
    }
    return (instance as any)[prop];
  },
});

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      lexicon_entries: {
        Row: {
          id: string
          word: string
          phonetic: string | null
          part_of_speech: string | null
          definition: string
          example_yoruba: string | null
          example_english: string | null
          contributor_id: string | null
          status: 'pending' | 'approved'
          created_at: string
        }
        Insert: {
          id?: string
          word: string
          phonetic?: string | null
          part_of_speech?: string | null
          definition: string
          example_yoruba?: string | null
          example_english?: string | null
          contributor_id?: string | null
          status?: 'pending' | 'approved'
          created_at?: string
        }
        Update: {
          id?: string
          word?: string
          phonetic?: string | null
          part_of_speech?: string | null
          definition?: string
          example_yoruba?: string | null
          example_english?: string | null
          contributor_id?: string | null
          status?: 'pending' | 'approved'
          created_at?: string
        }
      }
    }
  }
}
