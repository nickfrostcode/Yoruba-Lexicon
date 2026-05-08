-- ==============================================================================================
-- Yorùbá Lexicon - Final Database Setup Script
-- ==============================================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Profiles Table (No avatar_url)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Base Words Table
-- normalized_word is UNIQUE to prevent duplicate base roots, even if someone types accents
CREATE TABLE IF NOT EXISTS base_words (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  word TEXT NOT NULL,
  normalized_word TEXT NOT NULL UNIQUE,
  alphabet TEXT,
  syllables NUMERIC CHECK (syllables > 0),
  note TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_base_words_normalized ON base_words(normalized_word);
CREATE INDEX IF NOT EXISTS idx_base_words_alphabet ON base_words(alphabet);

-- 4. Create Lexicon Entries (Variants) Table
CREATE TABLE IF NOT EXISTS lexicon_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  base_word_id UUID NOT NULL REFERENCES base_words(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  phonetic TEXT,
  part_of_speech TEXT,
  definition TEXT NOT NULL,
  example_yoruba TEXT,
  example_english TEXT,
  contributor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_variant UNIQUE (base_word_id, word) -- Enforces variant uniqueness inside its base word
);

CREATE INDEX IF NOT EXISTS idx_lexicon_entries_base_word_id ON lexicon_entries(base_word_id);

-- 5. Helper Function: is_admin
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

-- 6. RPC: get_contributors_leaderboard
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
        COUNT(l.id)::BIGINT AS contribution_count,
        MAX(l.created_at) AS last_contribution_at
    FROM 
        public.profiles p
    JOIN 
        public.lexicon_entries l ON p.id = l.contributor_id
    WHERE 
        l.status = 'verified'
    GROUP BY 
        p.id, p.full_name, p.email
    ORDER BY 
        contribution_count DESC, last_contribution_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Auth Trigger for New Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE lexicon_entries ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Base Words (Public can view, Auth can insert, Auth can update HIS OWN base words)
DROP POLICY IF EXISTS "Base words are viewable by everyone." ON base_words;
DROP POLICY IF EXISTS "Authenticated users can insert base words." ON base_words;
DROP POLICY IF EXISTS "Admins can update base words." ON base_words;
DROP POLICY IF EXISTS "Users can update own base words" ON base_words;
DROP POLICY IF EXISTS "Admins can delete base words." ON base_words;

CREATE POLICY "Base words are viewable by everyone." ON base_words FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert base words." ON base_words FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own base words" ON base_words FOR UPDATE USING (auth.uid() = created_by OR is_admin());
CREATE POLICY "Admins can delete base words." ON base_words FOR DELETE USING (is_admin());

-- Lexicon Entries (Variants) - Fix for Auth requirement
DROP POLICY IF EXISTS "Verified entries are viewable by everyone." ON lexicon_entries;
DROP POLICY IF EXISTS "Users can view all entries joining base words." ON lexicon_entries;
DROP POLICY IF EXISTS "Users can view their own entries." ON lexicon_entries;
DROP POLICY IF EXISTS "Authenticated users can insert entries." ON lexicon_entries;
DROP POLICY IF EXISTS "Admins can update any entry." ON lexicon_entries;
DROP POLICY IF EXISTS "Users can delete their own entries." ON lexicon_entries;
DROP POLICY IF EXISTS "Authenticated users can only insert variants on their own base words." ON lexicon_entries;

CREATE POLICY "Verified entries are viewable by everyone." ON lexicon_entries FOR SELECT USING (status = 'verified' OR is_admin());
CREATE POLICY "Users can view all entries joining base words." ON lexicon_entries FOR SELECT USING (true);
CREATE POLICY "Users can view their own entries." ON lexicon_entries FOR SELECT USING (auth.uid() = contributor_id OR is_admin());

-- THIS ENFORCES THAT AN AUTH USER CAN ONLY INSERT A VARIANT IF THEY CREATED THE BASE WORD
CREATE POLICY "Users can insert variants ONLY on base words they created." 
ON lexicon_entries FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' 
  AND contributor_id = auth.uid()
  AND EXISTS (SELECT 1 FROM base_words WHERE id = base_word_id AND created_by = auth.uid())
);

CREATE POLICY "Admins can update any entry." ON lexicon_entries FOR UPDATE USING (is_admin());
CREATE POLICY "Users can delete their own entries." ON lexicon_entries FOR DELETE USING (auth.uid() = contributor_id OR is_admin());

-- ==============================================================================================
-- 9. Seed Data Section
-- This will run successfully if we find at least one user to assign the base words/variants to.
-- If no user exists yet, it skips seeding gracefully.
-- ==============================================================================================
DO $$
DECLARE
  seed_user_id UUID;

  bw_oja UUID := gen_random_uuid();
  bw_oko UUID := gen_random_uuid();
  bw_oko_vehicle UUID := gen_random_uuid();
  bw_iwa UUID := gen_random_uuid();
  bw_aja UUID := gen_random_uuid();
  bw_owo UUID := gen_random_uuid();
  bw_owo_hand UUID := gen_random_uuid();
  bw_ile UUID := gen_random_uuid();
  bw_ile_ground UUID := gen_random_uuid();
  bw_ebi UUID := gen_random_uuid();
  bw_ebi_family UUID := gen_random_uuid();
  bw_ogun UUID := gen_random_uuid();
  bw_igba UUID := gen_random_uuid();
  bw_igbale UUID := gen_random_uuid();
  bw_agbado UUID := gen_random_uuid();
  bw_daradara UUID := gen_random_uuid();
BEGIN
  -- Grab the first user in the auth table to own the seed data
  SELECT id INTO seed_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  
  IF seed_user_id IS NOT NULL THEN
      TRUNCATE TABLE public.lexicon_entries CASCADE;
      TRUNCATE TABLE public.base_words CASCADE;
      
      INSERT INTO public.base_words (id, word, normalized_word, alphabet, syllables, note, created_by) VALUES
        (bw_oja, 'ọja', 'ọja', 'Ọ', 2, 'root word representing market and sash concepts.', seed_user_id),
        (bw_oko, 'oko', 'oko', 'O', 2, 'root word for agriculture/farm and related tools.', seed_user_id),
        (bw_oko_vehicle, 'ọkọ', 'ọkọ', 'Ọ', 2, 'root word for vehicle, husband, or spear.', seed_user_id),
        (bw_iwa, 'iwa', 'iwa', 'I', 2, 'root word denoting existence, search, and character.', seed_user_id),
        (bw_aja, 'aja', 'aja', 'A', 2, 'root word for dog, ceiling, and fairy.', seed_user_id),
        (bw_owo, 'owo', 'owo', 'O', 2, 'root word representing trade currency and money.', seed_user_id),
        (bw_owo_hand, 'ọwọ', 'ọwọ', 'Ọ', 2, 'root word for hand, respect, or broom concepts.', seed_user_id),
        (bw_ile, 'ile', 'ile', 'I', 2, 'root word for buildings and home.', seed_user_id),
        (bw_ile_ground, 'ilẹ', 'ilẹ', 'I', 2, 'root word for the earth and the ground.', seed_user_id),
        (bw_ebi, 'ebi', 'ebi', 'E', 2, 'root word for hunger/starvation.', seed_user_id),
        (bw_ebi_family, 'ẹbi', 'ẹbi', 'Ẹ', 2, 'root word for family/kin and guilt.', seed_user_id),
        (bw_ogun, 'ogun', 'ogun', 'O', 2, 'vast root grouping war, iron deity, medicine, inheritance, and number twenty.', seed_user_id),
        (bw_igba, 'igba', 'igba', 'I', 2, 'root word for time, calabashes, and garden eggs.', seed_user_id),
        (bw_igbale, 'igbale', 'igbale', 'I', 3, 'root word for sweepers or sacred spaces, utilizing the gb digraph.', seed_user_id),
        (bw_agbado, 'agbado', 'agbado', 'A', 3, 'root word for corn/maize, utilizing the gb digraph.', seed_user_id),
        (bw_daradara, 'daradara', 'daradara', 'D', 4, 'a four-syllable root word denoting quality or goodness.', seed_user_id)
      ON CONFLICT DO NOTHING;
    
      INSERT INTO public.lexicon_entries (
        base_word_id, word, phonetic, part_of_speech, definition,
        example_yoruba, example_english, contributor_id, status
      ) VALUES
        (bw_oja, 'ọjà', 'd-d', 'noun', 'market (a place for trading)', 'mo lọ sí ọjà láti ra ata.', 'i went to the market to buy pepper.', seed_user_id, 'verified'),
        (bw_oja, 'ọjá', 'd-r', 'noun', 'sash or baby tie', 'ó fi ọjá pọ̀n ọmọ rẹ̀.', 'she strapped her baby to her back with a sash.', seed_user_id, 'unverified'),
        (bw_oko, 'oko', 'm-m', 'noun', 'farm or agricultural land', 'bàbá mi lọ sí oko.', 'my father went to the farm.', seed_user_id, 'verified'),
        (bw_oko, 'okó', 'm-r', 'noun', 'a traditional hoe used in farming', 'ó ra okó titun.', 'he bought a new hoe.', seed_user_id, 'unverified'),
        (bw_oko_vehicle, 'ọkọ', 'm-m', 'noun', 'husband', 'ọkọ rẹ̀ ti dé láti ibi iṣẹ́.', 'her husband has arrived from work.', seed_user_id, 'verified'),
        (bw_oko_vehicle, 'ọkọ̀', 'm-d', 'noun', 'vehicle, car, or canoe', 'ọkọ̀ ayọ́kẹ́lẹ́ mi ti bàjẹ́.', 'my car has broken down.', seed_user_id, 'verified'),
        (bw_oko_vehicle, 'ọ̀kọ̀', 'd-d', 'noun', 'spear (traditional weapon)', 'jagunjagun náà lo ọ̀kọ̀.', 'the warrior used a spear for the battle.', seed_user_id, 'unverified'),
        (bw_iwa, 'ìwà', 'd-d', 'noun', 'behavior, character, or attitude', 'ìwà rẹ̀ kò dára rárá.', 'his behavior is not good at all.', seed_user_id, 'verified'),
        (bw_iwa, 'ìwá', 'd-r', 'noun', 'existence or digging up an item', 'wọ́n bẹ̀rẹ̀ sí í wá a kiri.', 'they started searching for it around.', seed_user_id, 'unverified'),
        (bw_aja, 'ajá', 'm-r', 'noun', 'dog', 'ajá wa n gbó lóru.', 'our dog barks at night.', seed_user_id, 'verified'),
        (bw_aja, 'àjà', 'd-d', 'noun', 'ceiling, attic, or roof space', 'eku wà ní àjà wa.', 'there is a rat in our ceiling.', seed_user_id, 'verified'),
        (bw_aja, 'àjá', 'd-r', 'noun', 'a fairy or magical spirit', 'wọ́n sọ pé àjá gbé e lọ.', 'they said a fairy whisked him away.', seed_user_id, 'unverified'),
        (bw_owo, 'owó', 'm-r', 'noun', 'money or currency', 'owó ni gbòǹgbò ẹ̀ṣẹ̀ gbogbo.', 'money is the root of all evil.', seed_user_id, 'verified'),
        (bw_owo_hand, 'ọwọ́', 'm-r', 'noun', 'hand (or arm)', 'kí àwọn ọwọ́ rẹ dáadáa.', 'wash your hands properly.', seed_user_id, 'verified'),
        (bw_owo_hand, 'ọ̀wọ̀', 'd-d', 'noun', 'respect or honor', 'ọ̀wọ̀ fún àgbà ló ń mú ọmọdékùnrin gùn.', 'respect for elders grants youth a long life.', seed_user_id, 'verified'),
        (bw_owo_hand, 'ọwọ̀', 'm-d', 'noun', 'broom', 'mu ọwọ̀ kò gbálẹ̀ ilé.', 'take a broom to sweep the floor.', seed_user_id, 'unverified'),
        (bw_ile, 'ilé', 'm-r', 'noun', 'house, home, or dwelling', 'ilé wa kò jìnnà sí ibí.', 'our house is not far from here.', seed_user_id, 'verified'),
        (bw_ile_ground, 'ilẹ̀', 'm-d', 'noun', 'ground, floor, soil, or earth', 'jókòó sórí ilẹ̀.', 'sit on the floor.', seed_user_id, 'verified'),
        (bw_ebi, 'ebi', 'm-m', 'noun', 'hunger or starvation', 'ebi ń pa mí.', 'i am hungry.', seed_user_id, 'verified'),
        (bw_ebi_family, 'ẹbí', 'm-r', 'noun', 'a family, relative, or kin', 'mo fẹ́ràn ẹbí mi.', 'i love my family.', seed_user_id, 'verified'),
        (bw_ebi_family, 'ẹ̀bi', 'd-m', 'noun', 'guilt, fault, or blame', 'ẹ̀bi rẹ̀ kọ́ yìí.', 'this is not his fault.', seed_user_id, 'unverified'),
        (bw_ogun, 'ogun', 'm-m', 'noun', 'war or battlefield', 'wọ́n ti kúrò ní ojú ogun.', 'they have left the war front.', seed_user_id, 'verified'),
        (bw_ogun, 'ògún', 'd-r', 'noun', 'the yorùbá god of iron and war', 'ògún a gbè wá o.', 'the god of iron will favor us.', seed_user_id, 'verified'),
        (bw_ogun, 'ogún', 'm-r', 'numeral', 'number twenty (20)', 'mo fún un ní ogún náírà.', 'i gave him twenty naira.', seed_user_id, 'verified'),
        (bw_ogun, 'oògùn', 'm-d-d', 'noun', 'medicine or traditional charm', 'bàbá fún mi ní oògùn.', 'the elder gave me medicine.', seed_user_id, 'verified'),
        (bw_ogun, 'ogún', 'm-r', 'noun', 'heritage or inheritance', 'wọ́n ń pín ogún bàbá wọn.', 'they are sharing their father''s inheritance.', seed_user_id, 'unverified'),
        (bw_igba, 'ìgbà', 'd-d', 'noun', 'time, season, or era', 'ní ìgbà gbogbo ni a máa dúpẹ́.', 'at all times we should give thanks.', seed_user_id, 'verified'),
        (bw_igba, 'igbá', 'm-r', 'noun', 'calabash (a dried gourd container)', 'lọ gbé igbá ọtí wá.', 'go and bring the calabash of wine.', seed_user_id, 'verified'),
        (bw_igba, 'igba', 'm-m', 'numeral', 'number two hundred (200)', 'iye owo iwé yẹn jẹ igba.', 'the price of that book is two hundred.', seed_user_id, 'verified'),
        (bw_igba, 'ìgbá', 'd-r', 'noun', 'eggplant / garden egg', 'mo jẹ ìgbá pẹ̀lú ẹ̀pà.', 'i ate garden egg with groundnuts.', seed_user_id, 'unverified'),
        (bw_igbale, 'ìgbálẹ̀', 'd-r-d', 'noun', 'broom (used for sweeping)', 'mú ìgbálẹ̀ wá láti gbálẹ̀.', 'bring the broom to sweep the floor.', seed_user_id, 'verified'),
        (bw_igbale, 'ìgbàlẹ̀', 'd-d-d', 'noun', 'a sacred grove or burial ground for ancestral spirits', 'wọ́n ti wọ ìgbàlẹ̀ fún àjọ̀dún.', 'they have entered the sacred grove for the festival.', seed_user_id, 'unverified'),
        (bw_agbado, 'àgbàdo', 'd-d-m', 'noun', 'corn or maize', 'mo fẹ́ jẹ àgbàdo yíyan.', 'i want to eat roasted corn.', seed_user_id, 'verified'),
        (bw_daradara, 'dáradára', 'r-m-r-m', 'adjective', 'very good or excellent (reduplication of dára)', 'iṣẹ́ rẹ̀ jẹ́ dáradára.', 'his work is excellent.', seed_user_id, 'verified')
      ON CONFLICT DO NOTHING;
  END IF;
END $$;
