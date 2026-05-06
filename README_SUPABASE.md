# Supabase Setup Guide for Yorùbá Lexicon (Base-Word Variant Architecture)

To get this application fully functional with the new Base-Word → Variant architecture, configure the database schema as follows.

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com/) and create a new project.
2. Once the project is created, go to **Project Settings > API** to get your `URL` and `anon public` key.
3. Update `.env.local`:
   ```env
   VITE_SUPABASE_URL=Your_URL
   VITE_SUPABASE_ANON_KEY=Your_Anon_Key
   ```

## 2. Database Schema Migrations

Run the following SQL in the **SQL Editor** of your Supabase dashboard. It will create the necessary tables, configure Foreign Keys, and set up Row Level Security.

```sql
-- Enable necessary extensions (UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Base Words Table
CREATE TABLE base_words (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  word TEXT NOT NULL,
  normalized_word TEXT NOT NULL UNIQUE,
  alphabet TEXT,
  syllables NUMERIC CHECK (syllables > 0),
  note TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_base_words_normalized ON base_words(normalized_word);
CREATE INDEX idx_base_words_alphabet ON base_words(alphabet);

-- 3. Create/Modify Lexicon Entries Table (Variants)
-- Note: If you already have existing lexicon_entries, you must rename the table or drop and recreate.
-- Assuming a fresh setup for simplicity or you can DROP TABLE lexicon_entries;
DROP TABLE IF EXISTS lexicon_entries;

CREATE TABLE lexicon_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  base_word_id UUID NOT NULL REFERENCES base_words(id) ON DELETE CASCADE,
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

CREATE INDEX idx_lexicon_entries_base_word_id ON lexicon_entries(base_word_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE lexicon_entries ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth Trigger to automatically create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Contributors Leaderboard RPC
CREATE OR REPLACE FUNCTION get_contributors_leaderboard()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    contribution_count BIGINT,
    last_contribution_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.email,
        COUNT(l.id) AS contribution_count,
        MAX(l.created_at) AS last_contribution_at
    FROM 
        profiles p
    JOIN 
        lexicon_entries l ON p.id = l.contributor_id
    WHERE 
        l.status = 'approved'
    GROUP BY 
        p.id, p.full_name, p.email
    ORDER BY 
        contribution_count DESC, last_contribution_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Base Words Policies
CREATE POLICY "Base words are viewable by everyone." ON base_words FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert base words." ON base_words FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update base words." ON base_words FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete base words." ON base_words FOR DELETE USING (is_admin());

-- Lexicon Entries (Variants) Policies
CREATE POLICY "Approved entries are viewable by everyone." ON lexicon_entries FOR SELECT USING (status = 'approved' OR is_admin());
CREATE POLICY "Users can view all entries joining base words." ON lexicon_entries FOR SELECT USING (true); -- needed for counts, filtering by approved
CREATE POLICY "Users can view their own entries." ON lexicon_entries FOR SELECT USING (auth.uid() = contributor_id OR is_admin());
CREATE POLICY "Authenticated users can insert entries." ON lexicon_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update any entry." ON lexicon_entries FOR UPDATE USING (is_admin());
CREATE POLICY "Users can delete their own entries." ON lexicon_entries FOR DELETE USING (auth.uid() = contributor_id OR is_admin());
```

## 3. Example Queries

**Insert a Base Word:**
```sql
INSERT INTO base_words (word, normalized_word, alphabet, created_by)
VALUES ('Olukọ', 'oluko', 'O', 'user-uuid-here');
```

**Insert a Variant (Lexicon Entry):**
```sql
INSERT INTO lexicon_entries (base_word_id, definition, contributor_id)
VALUES ('base-word-uuid', 'A teacher or instructor', 'user-uuid-here');
```

**Get Base Words with Variant Count:**
```sql
SELECT bw.*, COUNT(le.id) as variant_count
FROM base_words bw
LEFT JOIN lexicon_entries le ON le.base_word_id = bw.id
GROUP BY bw.id;
```
