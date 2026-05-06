-- Yorùbá Lexicon Test Data Seed Script (Corrected)
-- Clears existing data then inserts the seed rows.

TRUNCATE TABLE public.lexicon_entries CASCADE;
TRUNCATE TABLE public.base_words CASCADE;

DO $$
DECLARE
  user_id UUID := '132f779d-5774-4896-b292-29385fe41f91';

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

  INSERT INTO public.base_words (id, word, normalized_word, alphabet, syllables, note, created_by) VALUES
    (bw_oja, 'Ọja', 'ọja', 'Ọ', 2, 'Root word representing market and sash concepts.', user_id),
    (bw_oko, 'Oko', 'oko', 'O', 2, 'Root word for agriculture/farm and related tools.', user_id),
    (bw_oko_vehicle, 'Ọkọ', 'ọkọ', 'Ọ', 2, 'Root word for vehicle, husband, or spear.', user_id),
    (bw_iwa, 'Iwa', 'iwa', 'I', 2, 'Root word denoting existence, search, and character.', user_id),
    (bw_aja, 'Aja', 'aja', 'A', 2, 'Root word for dog, ceiling, and fairy.', user_id),
    (bw_owo, 'Owo', 'owo', 'O', 2, 'Root word representing trade currency and money.', user_id),
    (bw_owo_hand, 'Ọwọ', 'ọwọ', 'Ọ', 2, 'Root word for hand, respect, or broom concepts.', user_id),
    (bw_ile, 'Ile', 'ile', 'I', 2, 'Root word for buildings and home.', user_id),
    (bw_ile_ground, 'Ilẹ', 'ilẹ', 'I', 2, 'Root word for the earth and the ground.', user_id),
    (bw_ebi, 'Ebi', 'ebi', 'E', 2, 'Root word for hunger/starvation.', user_id),
    (bw_ebi_family, 'Ẹbi', 'ẹbi', 'Ẹ', 2, 'Root word for family/kin and guilt.', user_id),
    (bw_ogun, 'Ogun', 'ogun', 'O', 2, 'Vast root grouping war, iron deity, medicine, inheritance, and number twenty.', user_id),
    (bw_igba, 'Igba', 'igba', 'I', 2, 'Root word for time, calabashes, and garden eggs.', user_id),
    (bw_igbale, 'Igbale', 'igbale', 'I', 3, 'Root word for sweepers or sacred spaces, utilizing the GB digraph.', user_id),
    (bw_agbado, 'Agbado', 'agbado', 'A', 3, 'Root word for corn/maize, utilizing the GB digraph.', user_id),
    (bw_daradara, 'Daradara', 'daradara', 'D', 4, 'A four-syllable root word denoting quality or goodness.', user_id);

  INSERT INTO public.lexicon_entries (
    base_word_id, word, phonetic, part_of_speech, definition,
    example_yoruba, example_english, contributor_id, status
  ) VALUES
    (bw_oja, 'Ọjà', 'd-d', 'noun', 'Market (A place for trading)', 'Mo lọ sí ọjà láti ra ata.', 'I went to the market to buy pepper.', user_id, 'approved'),
    (bw_oja, 'Ọjá', 'd-r', 'noun', 'Sash or baby tie', 'Ó fi ọjá pọ̀n ọmọ rẹ̀.', 'She strapped her baby to her back with a sash.', user_id, 'pending'),

    (bw_oko, 'Oko', 'm-m', 'noun', 'Farm or agricultural land', 'Bàbá mi lọ sí oko.', 'My father went to the farm.', user_id, 'approved'),
    (bw_oko, 'Okó', 'm-r', 'noun', 'A traditional hoe used in farming', 'Ó ra okó titun.', 'He bought a new hoe.', user_id, 'pending'),

    (bw_oko_vehicle, 'Ọkọ', 'm-m', 'noun', 'Husband', 'Ọkọ rẹ̀ ti dé láti ibi iṣẹ́.', 'Her husband has arrived from work.', user_id, 'approved'),
    (bw_oko_vehicle, 'Ọkọ̀', 'm-d', 'noun', 'Vehicle, Car, or Canoe', 'Ọkọ̀ ayọ́kẹ́lẹ́ mi ti bàjẹ́.', 'My car has broken down.', user_id, 'approved'),
    (bw_oko_vehicle, 'Ọ̀kọ̀', 'd-d', 'noun', 'Spear (traditional weapon)', 'Jagunjagun náà lo ọ̀kọ̀.', 'The warrior used a spear for the battle.', user_id, 'pending'),

    (bw_iwa, 'Ìwà', 'd-d', 'noun', 'Behavior, character, or attitude', 'Ìwà rẹ̀ kò dára rárá.', 'His behavior is not good at all.', user_id, 'approved'),
    (bw_iwa, 'Ìwá', 'd-r', 'noun', 'Existence or digging up an item', 'Wọ́n bẹ̀rẹ̀ sí í wá a kiri.', 'They started searching for it around.', user_id, 'pending'),

    (bw_aja, 'Ajá', 'm-r', 'noun', 'Dog', 'Ajá wa n gbó lóru.', 'Our dog barks at night.', user_id, 'approved'),
    (bw_aja, 'Àjà', 'd-d', 'noun', 'Ceiling, attic, or roof space', 'Eku wà ní àjà wa.', 'There is a rat in our ceiling.', user_id, 'approved'),
    (bw_aja, 'Àjá', 'd-r', 'noun', 'A fairy or magical spirit', 'Wọ́n sọ pé àjá gbé e lọ.', 'They said a fairy whisked him away.', user_id, 'pending'),

    (bw_owo, 'Owó', 'm-r', 'noun', 'Money or currency', 'Owó ni gbòǹgbò ẹ̀ṣẹ̀ gbogbo.', 'Money is the root of all evil.', user_id, 'approved'),

    (bw_owo_hand, 'Ọwọ́', 'm-r', 'noun', 'Hand (or arm)', 'Kí àwọn ọwọ́ rẹ dáadáa.', 'Wash your hands properly.', user_id, 'approved'),
    (bw_owo_hand, 'Ọ̀wọ̀', 'd-d', 'noun', 'Respect or honor', 'Ọ̀wọ̀ fún àgbà ló ń mú ọmọdékùnrin gùn.', 'Respect for elders grants youth a long life.', user_id, 'approved'),
    (bw_owo_hand, 'Ọwọ̀', 'm-d', 'noun', 'Broom', 'Mu ọwọ̀ kò gbálẹ̀ ilé.', 'Take a broom to sweep the floor.', user_id, 'pending'),

    (bw_ile, 'Ilé', 'm-r', 'noun', 'House, Home, or Dwelling', 'Ilé wa kò jìnnà sí ibí.', 'Our house is not far from here.', user_id, 'approved'),

    (bw_ile_ground, 'Ilẹ̀', 'm-d', 'noun', 'Ground, floor, soil, or earth', 'Jókòó sórí ilẹ̀.', 'Sit on the floor.', user_id, 'approved'),

    (bw_ebi, 'Ebi', 'm-m', 'noun', 'Hunger or starvation', 'Ebi ń pa mí.', 'I am hungry.', user_id, 'approved'),

    (bw_ebi_family, 'Ẹbí', 'm-r', 'noun', 'A family, relative, or kin', 'Mo fẹ́ràn ẹbí mi.', 'I love my family.', user_id, 'approved'),
    (bw_ebi_family, 'Ẹ̀bi', 'd-m', 'noun', 'Guilt, fault, or blame', 'Ẹ̀bi rẹ̀ kọ́ yìí.', 'This is not his fault.', user_id, 'pending'),

    (bw_ogun, 'Ogun', 'm-m', 'noun', 'War or battlefield', 'Wọ́n ti kúrò ní ojú ogun.', 'They have left the war front.', user_id, 'approved'),
    (bw_ogun, 'Ògún', 'd-r', 'noun', 'The Yorùbá god of iron and war', 'Ògún a gbè wá o.', 'The god of iron will favor us.', user_id, 'approved'),
    (bw_ogun, 'Ogún', 'm-r', 'numeral', 'Number Twenty (20)', 'Mo fún un ní ogún náírà.', 'I gave him twenty naira.', user_id, 'approved'),
    (bw_ogun, 'Oògùn', 'm-d-d', 'noun', 'Medicine or Traditional charm', 'Bàbá fún mi ní oògùn.', 'The elder gave me medicine.', user_id, 'approved'),
    (bw_ogun, 'Ogún', 'm-r', 'noun', 'Heritage or Inheritance', 'Wọ́n ń pín ogún bàbá wọn.', 'They are sharing their father''s inheritance.', user_id, 'pending'),

    (bw_igba, 'Ìgbà', 'd-d', 'noun', 'Time, season, or era', 'Ní ìgbà gbogbo ni a máa dúpẹ́.', 'At all times we should give thanks.', user_id, 'approved'),
    (bw_igba, 'Igbá', 'm-r', 'noun', 'Calabash (A dried gourd container)', 'Lọ gbé igbá ọtí wá.', 'Go and bring the calabash of wine.', user_id, 'approved'),
    (bw_igba, 'Igba', 'm-m', 'numeral', 'Number Two hundred (200)', 'Iye owo iwé yẹn jẹ igba.', 'The price of that book is two hundred.', user_id, 'approved'),
    (bw_igba, 'Ìgbá', 'd-r', 'noun', 'Eggplant / Garden Egg', 'Mo jẹ ìgbá pẹ̀lú ẹ̀pà.', 'I ate garden egg with groundnuts.', user_id, 'pending'),

    (bw_igbale, 'Ìgbálẹ̀', 'd-r-d', 'noun', 'Broom (used for sweeping)', 'Mú ìgbálẹ̀ wá láti gbálẹ̀.', 'Bring the broom to sweep the floor.', user_id, 'approved'),
    (bw_igbale, 'Ìgbàlẹ̀', 'd-d-d', 'noun', 'A sacred grove or burial ground for ancestral spirits', 'Wọ́n ti wọ ìgbàlẹ̀ fún àjọ̀dún.', 'They have entered the sacred grove for the festival.', user_id, 'pending'),
    
    (bw_agbado, 'Àgbàdo', 'd-d-m', 'noun', 'Corn or maize', 'Mo fẹ́ jẹ àgbàdo yíyan.', 'I want to eat roasted corn.', user_id, 'approved'),

    (bw_daradara, 'Dáradára', 'r-m-r-m', 'adjective', 'Very good or excellent (Reduplication of dára)', 'Iṣẹ́ rẹ̀ jẹ́ dáradára.', 'His work is excellent.', user_id, 'approved');

END $$;