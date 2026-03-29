# Supabase Setup Guide for Yorùbá Lexicon

To get this application fully functional, you need to set up a Supabase project and configure the database schema.

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com/) and create a new project.
2. Once the project is created, go to **Project Settings > API** to get your `URL` and `anon public` key.
3. Add these to your AI Studio **Secrets** panel:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key

## 2. Database Schema
Run the following SQL in the **SQL Editor** of your Supabase dashboard:

```sql
-- Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Lexicon Entries Table
CREATE TABLE lexicon_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  phonetic TEXT,
  part_of_speech TEXT,
  definition TEXT NOT NULL,
  example_yoruba TEXT,
  example_english TEXT,
  contributor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lexicon_entries ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Lexicon Entries Policies
CREATE POLICY "Approved entries are viewable by everyone." ON lexicon_entries
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own pending entries." ON lexicon_entries
  FOR SELECT USING (auth.uid() = contributor_id);

CREATE POLICY "Authenticated users can insert entries." ON lexicon_entries
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own entries." ON lexicon_entries
  FOR DELETE USING (auth.uid() = contributor_id);
```

## 3. Authentication
- Go to **Authentication > Providers** and ensure **Email** is enabled.
- (Optional) Enable **Google** or **GitHub** if you want social login.

## 4. Initial Data (Optional)
You can add some initial entries to `lexicon_entries` with `status = 'approved'` to see them in the browse page immediately.
