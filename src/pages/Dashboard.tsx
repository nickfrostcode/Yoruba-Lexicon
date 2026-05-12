/** @format */

import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/context/AuthContext";
import {
	Plus,
	Clock,
	CheckCircle,
	AlertCircle,
	ChevronDown,
	LayoutDashboard,
	BookA,
	Layers,
	Save,
	Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Contribution, BaseWord, LexiconEntry } from "@/src/lib/types";
import {
	normalizeWord,
	getAlphabetChar,
	compareBaseAndVariant,
} from "../lib/utils";
import { YORUBA_ALPHABET, PARTS_OF_SPEECH } from "@/src/lib/constants";
import { YorubaKeyboard } from "@/src/components/YorubaKeyboard";
import { ContributionCard } from "@/src/components/ContributionCard";

import { EditVariantModal } from "@/src/components/EditVariantModal";
import { Loader } from "@/src/components/Loader";

const INITIAL_VISIBLE = 6;
const LOAD_MORE_COUNT = 6;

type Tab = "overview" | "base-words" | "variants";

export const Dashboard: React.FC = () => {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<Tab>("overview");

	// Modals
	const [editingVariantId, setEditingVariantId] = useState<string | null>(
		null,
	);

	// Overview State
	const [contributions, setContributions] = useState<Contribution[]>([]);
	const [loadingContributions, setLoadingContributions] = useState(true);
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

	// Base Word Form State
	const [baseWordInput, setBaseWordInput] = useState("");
	const [baseWordSyllables, setBaseWordSyllables] = useState("");
	const [baseWordNote, setBaseWordNote] = useState("");
	const [isSubmittingBaseWord, setIsSubmittingBaseWord] = useState(false);

	// Variants Flow State
	const [selectedLetter, setSelectedLetter] = useState("");
	const [baseWords, setBaseWords] = useState<BaseWord[]>([]);
	const [loadingBaseWords, setLoadingBaseWords] = useState(false);
	const [selectedBaseWord, setSelectedBaseWord] = useState<BaseWord | null>(
		null,
	);
	const [loadedBaseWordsLetter, setLoadedBaseWordsLetter] = useState<
		string | null
	>(null);

	const [existingVariants, setExistingVariants] = useState<LexiconEntry[]>([]);
	const [loadingExistingVariants, setLoadingExistingVariants] =
		useState(false);

	const [variantForm, setVariantForm] = useState({
		word: "",
		phonetic: "",
		part_of_speech: "noun",
		definition: "",
		example_yoruba: "",
		example_english: "",
	});
	const [isSubmittingVariant, setIsSubmittingVariant] = useState(false);

	useEffect(() => {
		if (user) {
			fetchContributions(user.id);
		}
	}, [user]);

	useEffect(() => {
		if (activeTab !== "variants" || selectedBaseWord) return;
		if (loadedBaseWordsLetter !== selectedLetter) {
			fetchBaseWordsByLetter(selectedLetter);
		}
	}, [selectedLetter, activeTab, selectedBaseWord, loadedBaseWordsLetter]);

	useEffect(() => {
		if (selectedBaseWord) {
			fetchExistingVariants(selectedBaseWord.id);
		}
	}, [selectedBaseWord]);

	const fetchContributions = async (userId: string) => {
		setLoadingContributions(true);
		const { data, error } = await (supabase.from("lexicon_entries") as any)
			.select(
				"id, word, phonetic, part_of_speech, definition, example_yoruba, example_english, status, created_at, base_word_id, base_word:base_words(id, word, normalized_word), profiles!lexicon_entries_contributor_id_fkey(full_name)",
			)
			.eq("contributor_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching contributions:", error);
		} else {
			setContributions(data || []);
			setVisibleCount(INITIAL_VISIBLE);
		}
		setLoadingContributions(false);
	};

	const fetchBaseWordsByLetter = async (letter: string) => {
		if (selectedLetter === "") return;
		if (!user) return;
		if (loadedBaseWordsLetter === letter) return;
		setLoadingBaseWords(true);
		const { data, error } = await supabase
			.from("base_words")
			.select("*")
			.eq("alphabet", letter)
			.eq("created_by", user.id)
			.order("word", { ascending: true });

		if (!error && data) {
			setBaseWords(data);
			setLoadedBaseWordsLetter(letter);
		}
		setLoadingBaseWords(false);
	};

	const fetchExistingVariants = async (baseWordId: string) => {
		setLoadingExistingVariants(true);
		const { data, error } = await supabase
			.from("lexicon_entries")
			.select("id, word, status")
			.eq("base_word_id", baseWordId)
			.order("word", { ascending: true });

		if (!error && data) {
			setExistingVariants(data);
		}
		setLoadingExistingVariants(false);
	};

	const handleLoadMore = async () => {
		await new Promise((r) => setTimeout(r, 400));
		setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
	};

	const deleteEntry = async (id: string) => {
		if (!confirm("Are you sure you want to delete this contribution?"))
			return;

		const { error } = await (supabase.from("lexicon_entries") as any)
			.delete()
			.eq("id", id);
		if (error) {
			toast.error("Error deleting entry.");
		} else if (user) {
			fetchContributions(user.id);
		}
	};

	const submitBaseWord = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;
		if (!baseWordInput.trim()) {
			toast.error("Word is required");
			return;
		}

		const syllables = parseInt(baseWordSyllables);
		if (isNaN(syllables) || syllables < 1) {
			toast.error("Syllable count must be at least 1.");
			return;
		}

		setIsSubmittingBaseWord(true);
		try {
			const word = baseWordInput.trim().toLowerCase();
			const normalized = normalizeWord(word);
			const alphabet = getAlphabetChar(word);

			const { error } = await (supabase.from("base_words") as any).insert([
				{
					word,
					normalized_word: normalized,
					alphabet,
					syllables,
					note: baseWordNote ? baseWordNote.trim().toLowerCase() : null,
					created_by: user.id,
				},
			]);

			if (error) {
				if (error.code === "23505") {
					toast.error("This base word already exists.");
				} else {
					throw error;
				}
				return;
			}

			toast.success("Base word added successfully!");
			setBaseWordInput("");
			setBaseWordSyllables("");
			setBaseWordNote("");
		} catch (err: any) {
			toast.error(err.message || "Error submitting base word.");
		} finally {
			setIsSubmittingBaseWord(false);
		}
	};

	const submitVariant = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user || !selectedBaseWord) return;
		if (!variantForm.word.trim()) {
			toast.error("Fully tone-marked word is required.");
			return;
		}

		if (!compareBaseAndVariant(selectedBaseWord.word, variantForm.word)) {
			toast.error(
				"The variant must structurally match the selected base word (ignoring tones).",
			);
			return;
		}

		setIsSubmittingVariant(true);
		try {
			const { error } = await (
				supabase.from("lexicon_entries") as any
			).insert([
				{
					base_word_id: selectedBaseWord.id,
					word: variantForm.word.trim().toLowerCase(),
					phonetic: variantForm.phonetic
						? variantForm.phonetic.trim().toLowerCase()
						: null,
					part_of_speech: variantForm.part_of_speech,
					definition: variantForm.definition.trim().toLowerCase(),
					example_yoruba: variantForm.example_yoruba
						? variantForm.example_yoruba.trim().toLowerCase()
						: null,
					example_english: variantForm.example_english
						? variantForm.example_english.trim().toLowerCase()
						: null,
					contributor_id: user.id,
					status: "unverified",
				},
			]);
			if (error) throw error;
			toast.success("Variant submitted successfully!");
			setVariantForm({
				word: "",
				phonetic: "",
				part_of_speech: "noun",
				definition: "",
				example_yoruba: "",
				example_english: "",
			});
			setSelectedBaseWord(null);
			setExistingVariants([]);
			fetchContributions(user.id);
		} catch (err: any) {
			toast.error(err.message || "Error submitting variant.");
		} finally {
			setIsSubmittingVariant(false);
		}
	};

	const insertCharToVariantWord = (char: string) => {
		setVariantForm((prev) => ({ ...prev, word: prev.word + char }));
	};

	const displayFirstName =
		user?.full_name?.trim()?.split(/\s+/)[0] ||
		user?.email?.split("@")[0] ||
		"Contributor";

	const visibleContributions = contributions.slice(0, visibleCount);
	const hasMore = visibleCount < contributions.length;

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='flex items-center space-x-4 mb-12'>
				<div className='w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-2xl font-serif'>
					{displayFirstName.charAt(0).toUpperCase()}
				</div>
				<div>
					<h1 className='text-4xl font-serif font-bold'>
						Hello, {displayFirstName}
					</h1>
					<p className='text-brand-ink/60 font-medium'>
						Manage your contributions
					</p>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
				{/* Sidebar */}
				<div className='md:col-span-1 space-y-2'>
					<button
						onClick={() => setActiveTab("overview")}
						className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
							activeTab === "overview"
								? "bg-brand-orange text-white shadow-md font-bold"
								: "text-brand-ink/60 hover:bg-brand-orange/10 hover:text-brand-orange font-medium"
						}`}
					>
						<LayoutDashboard size={20} />
						<span>Overview</span>
					</button>
					<button
						onClick={() => setActiveTab("base-words")}
						className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
							activeTab === "base-words"
								? "bg-brand-orange text-white shadow-md font-bold"
								: "text-brand-ink/60 hover:bg-brand-orange/10 hover:text-brand-orange font-medium"
						}`}
					>
						<BookA size={20} />
						<span>Base Words</span>
					</button>
					<button
						onClick={() => setActiveTab("variants")}
						className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
							activeTab === "variants"
								? "bg-brand-orange text-white shadow-md font-bold"
								: "text-brand-ink/60 hover:bg-brand-orange/10 hover:text-brand-orange font-medium"
						}`}
					>
						<Layers size={20} />
						<span>Variants</span>
					</button>
				</div>

				{/* Main Content Area */}
				<div className='md:col-span-3'>
					{activeTab === "overview" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className='space-y-8'
						>
							<div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
								<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
									<StatItem
										icon={
											<CheckCircle
												size={24}
												className='text-green-500'
											/>
										}
										label='Verified'
										value={
											contributions.filter(
												(c) => c.status === "verified",
											).length
										}
									/>
								</div>
								<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
									<StatItem
										icon={
											<Clock
												size={24}
												className='text-brand-orange'
											/>
										}
										label='Unverified'
										value={
											contributions.filter(
												(c) => c.status === "unverified",
											).length
										}
									/>
								</div>
								<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
									<StatItem
										icon={
											<AlertCircle
												size={24}
												className='text-brand-ink/20'
											/>
										}
										label='Total'
										value={contributions.length}
									/>
								</div>
							</div>

							<div className='p-8 rounded-3xl bg-brand-orange text-white shadow-lg'>
								<h3 className='text-2xl font-serif font-bold mb-4'>
									How to Contribute
								</h3>
								<p className='text-white/80 leading-relaxed mb-6'>
									Our lexicon follows a Base-Word → Variant
									architecture. This ensures a clean grouping of
									dialects and precise definitions.
								</p>
								<div className='grid md:grid-cols-2 gap-6'>
									<div className='bg-white/10 p-5 rounded-2xl'>
										<h4 className='font-bold flex items-center space-x-2 mb-2'>
											<span className='w-6 h-6 rounded-full bg-white text-brand-orange flex items-center justify-center text-sm'>
												1
											</span>
											<span>Add a Base Word</span>
										</h4>
										<p className='text-sm text-white/80'>
											Check if the root word exists under "Base
											Words". If it doesn't, add it without specific
											dialectal tone marks (e.g. Olukọ).
										</p>
									</div>
									<div className='bg-white/10 p-5 rounded-2xl'>
										<h4 className='font-bold flex items-center space-x-2 mb-2'>
											<span className='w-6 h-6 rounded-full bg-white text-brand-orange flex items-center justify-center text-sm'>
												2
											</span>
											<span>Add carefully marked Variants</span>
										</h4>
										<p className='text-sm text-white/80'>
											Under "Variants", find your base word and add
											your fully tone-marked word, along with meaning
											and phonetic signature.
										</p>
									</div>
								</div>
							</div>

							<div>
								<h3 className='text-2xl font-serif font-bold mb-6'>
									My Contributions
								</h3>
								<div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
									{loadingContributions ? (
										<div className='col-span-2'>
											<Loader text='Loading contributions...' />
										</div>
									) : contributions.length > 0 ? (
										visibleContributions.map((contribution) => (
											<motion.div
												key={contribution.id}
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ delay: 1 * 0.1 }}
											>
												<ContributionCard
													key={contribution.id}
													contribution={contribution}
													onEdit={setEditingVariantId}
													onDelete={deleteEntry}
												/>
											</motion.div>
										))
									) : (
										<div className='col-span-2 text-center py-12 text-brand-ink/40 font-medium'>
											No contributions yet.
										</div>
									)}
								</div>
								{hasMore && (
									<button
										onClick={handleLoadMore}
										className='w-full py-4 flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest text-brand-orange hover:bg-brand-orange/5 mt-4 rounded-xl transition-colors'
									>
										<ChevronDown size={16} /> Load More
									</button>
								)}
							</div>
						</motion.div>
					)}

					{activeTab === "base-words" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className='glass-card p-8 rounded-3xl border border-brand-ink/5'
						>
							<h2 className='text-3xl font-serif font-bold mb-2'>
								Add Base Word
							</h2>
							<p className='text-brand-ink/60 mb-8'>
								Register a root word before adding dialectal or
								tone-specific variants.
							</p>

							<div className='bg-brand-orange/10 p-4 rounded-xl border border-brand-orange/20 mb-8'>
								<h4 className='font-bold text-brand-orange mb-2 uppercase tracking-widest text-xs'>
									Important Guidelines
								</h4>
								<ul className='list-disc list-inside text-sm text-brand-ink/80 space-y-1'>
									<li>
										Use accurate sub-dotted letters:{" "}
										<strong>ẹ, ọ, ṣ</strong>. Do not use standard e,
										o, s if they shouldn't be.
									</li>
									<li>
										Do <strong>not</strong> include tone marks (á, à)
										on the base word unless the root naturally
										requires it to distinguish meaning globally.
									</li>
									<li>
										The syllable count is registered at the base word
										level.
									</li>
								</ul>
							</div>

							<form onSubmit={submitBaseWord} className='space-y-6'>
								<div className='space-y-2'>
									<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
										Word (Yorùbá){" "}
										<span className='text-brand-orange'>*</span>
									</label>
									<input
										type='text'
										className='input-field'
										placeholder='e.g. Olukọ'
										value={baseWordInput}
										onChange={(e) =>
											setBaseWordInput(
												e.target.value.normalize("NFC"),
											)
										}
										required
									/>
									<YorubaKeyboard
										baseMode={true}
										onCharClick={(char) =>
											setBaseWordInput((prev) => prev + char)
										}
									/>
								</div>

								<div className='space-y-2'>
									<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
										Syllables{" "}
										<span className='text-brand-orange'>*</span>
									</label>
									<input
										type='number'
										min='1'
										className='input-field'
										placeholder='e.g. 3'
										value={baseWordSyllables}
										onChange={(e) =>
											setBaseWordSyllables(e.target.value)
										}
										required
									/>
								</div>

								<div className='space-y-2'>
									<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
										Note (Optional)
									</label>
									<textarea
										rows={2}
										className='input-field py-3'
										placeholder='Any etymological or historical notes...'
										value={baseWordNote}
										onChange={(e) => setBaseWordNote(e.target.value)}
									/>
								</div>

								<button
									type='submit'
									disabled={isSubmittingBaseWord}
									className='btn-primary w-full flex items-center justify-center space-x-2'
								>
									{isSubmittingBaseWord ? (
										<Loader2 size={20} className='animate-spin' />
									) : (
										<Save size={20} />
									)}
									<span>Save Base Word</span>
								</button>
							</form>
						</motion.div>
					)}

					{activeTab === "variants" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className='space-y-6'
						>
							{!selectedBaseWord ? (
								<div className='glass-card p-8 rounded-3xl border border-brand-ink/5'>
									<h2 className='text-3xl font-serif font-bold mb-2'>
										Select a Base Word
									</h2>
									<p className='text-brand-ink/60 mb-8'>
										Choose a letter to load available base words.
									</p>

									<div className='flex flex-wrap gap-2 mb-8'>
										{YORUBA_ALPHABET.map((letter) => (
											<button
												key={letter}
												onClick={() => setSelectedLetter(letter)}
												className={`w-10 h-10 rounded-lg font-bold transition-all cursor-pointer ${
													selectedLetter === letter
														? "bg-brand-orange text-white shadow-md"
														: "bg-white border border-brand-ink/10 text-brand-ink hover:border-brand-orange/30 hover:text-brand-orange"
												}`}
											>
												{letter}
											</button>
										))}
									</div>

									<div className='bg-white rounded-2xl border border-brand-ink/5 overflow-hidden'>
										{loadingBaseWords ? (
											<Loader text='Loading base words...' />
										) : baseWords.length > 0 ? (
											<ul className='divide-y divide-brand-ink/5'>
												{baseWords.map((bw) => (
													<li
														key={bw.id}
														onClick={() =>
															setSelectedBaseWord(bw)
														}
														className='p-4 hover:bg-brand-orange/5 cursor-pointer flex justify-between items-center transition-colors group'
													>
														<div>
															<span className='font-serif font-bold text-lg group-hover:text-brand-orange transition-colors'>
																{bw.word}
															</span>
															{bw.note && (
																<p className='text-xs text-brand-ink/40 line-clamp-1'>
																	{bw.note}
																</p>
															)}
														</div>
														<Plus
															size={20}
															className='text-brand-ink/20 group-hover:text-brand-orange'
														/>
													</li>
												))}
											</ul>
										) : (
											<div className='py-12 text-center text-brand-ink/40'>
												No base words found for letter{" "}
												{selectedLetter}.
											</div>
										)}
									</div>
								</div>
							) : (
								<div className='glass-card p-8 rounded-3xl border border-brand-ink/5'>
									<div className='flex items-center justify-between mb-4 pb-4 border-b border-brand-ink/5'>
										<div>
											<h2 className='text-3xl font-serif font-bold'>
												Add Variant
											</h2>
											<p className='text-brand-ink/60'>
												For base word:{" "}
												<span className='font-bold text-brand-orange'>
													{selectedBaseWord.word}
												</span>
											</p>
										</div>
										<button
											onClick={() => {
												setSelectedBaseWord(null);
												setExistingVariants([]);
											}}
											className='text-sm font-bold uppercase tracking-widest text-brand-ink/40 hover:text-brand-orange transition-colors'
										>
											Change
										</button>
									</div>

									{loadingExistingVariants ? (
										<div className='mb-6'>
											<div className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-2'>
												Loading existing variants...
											</div>
										</div>
									) : existingVariants.length > 0 ? (
										<div className='mb-6'>
											<div className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-2'>
												Existing Variants ({existingVariants.length}
												)
											</div>
											<div className='flex flex-wrap gap-2'>
												{existingVariants.map((variant) => (
													<div
														key={variant.id}
														className={`px-3 py-1 rounded-full text-xs font-medium ${
															variant.status === "verified"
																? "bg-green-100 text-green-700 border border-green-200"
																: "bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
														}`}
													>
														{variant.word}
														{variant.status === "verified" && (
															<span className='ml-1 text-green-600'>
																✓
															</span>
														)}
													</div>
												))}
											</div>
										</div>
									) : (
										<div className='mb-6'>
											<div className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-2'>
												Existing Variants (0)
											</div>
											<p className='text-sm text-brand-ink/60'>
												No variants exist for this base word yet. Be
												the first to add one!
											</p>
										</div>
									)}

									<div className='bg-brand-orange/10 p-4 rounded-xl border border-brand-orange/20 mb-8'>
										<h4 className='font-bold text-brand-orange mb-2 uppercase tracking-widest text-xs'>
											Tone Marking Guidelines
										</h4>
										<p className='text-sm text-brand-ink/80 leading-relaxed'>
											Unlike the base word, the variant{" "}
											<strong>must</strong> include the precise tone
											marks (´, `, etc.) that define its specific
											pronunciation and meaning. Example:{" "}
											<em>Olùkọ́</em>.
										</p>
									</div>

									<form onSubmit={submitVariant} className='space-y-6'>
										<div className='grid md:grid-cols-2 gap-6'>
											<div className='space-y-2 md:col-span-2'>
												<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
													Fully Tone-Marked Word{" "}
													<span className='text-brand-orange'>
														*
													</span>
												</label>
												<input
													type='text'
													className='input-field'
													placeholder='e.g. Olùkọ́'
													value={variantForm.word}
													onChange={(e) =>
														setVariantForm({
															...variantForm,
															word: e.target.value,
														})
													}
													required
												/>
												<YorubaKeyboard
													onCharClick={insertCharToVariantWord}
												/>
											</div>

											<div className='space-y-2'>
												<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
													Phonetic Signature (Optional)
												</label>
												<input
													type='text'
													className='input-field'
													placeholder='e.g. m-d-r'
													pattern="^(d|r|m)(-(d|r|m))*$"
													title="Only use d, r, m and hyphens (e.g. m-d-r)"
													value={variantForm.phonetic}
													onChange={(e) =>
														setVariantForm({
															...variantForm,
															phonetic: e.target.value,
														})
													}
												/>
												<p className='text-[10px] text-brand-ink/40 ml-1'>
													Use 'd' (low), 'r' (mid), 'm' (high).
												</p>
											</div>

											<div className='space-y-2'>
												<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
													Part of Speech{" "}
													<span className='text-brand-orange'>
														*
													</span>
												</label>
												<select
													className='input-field appearance-none cursor-pointer'
													value={variantForm.part_of_speech}
													onChange={(e) =>
														setVariantForm({
															...variantForm,
															part_of_speech: e.target.value,
														})
													}
													required
												>
													{PARTS_OF_SPEECH.map((pos) => (
														<option
															key={pos.value}
															value={pos.value}
														>
															{pos.label}
														</option>
													))}
												</select>
											</div>

											<div className='space-y-2 md:col-span-2'>
												<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
													Definition{" "}
													<span className='text-brand-orange'>
														*
													</span>
												</label>
												<textarea
													rows={2}
													className='input-field py-3'
													placeholder='Provide a clear definition in English...'
													value={variantForm.definition}
													onChange={(e) =>
														setVariantForm({
															...variantForm,
															definition: e.target.value,
														})
													}
													required
												/>
											</div>

											<div className='space-y-2'>
												<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
													Example (Yorùbá)
												</label>
												<textarea
													rows={2}
													className='input-field py-3'
													placeholder='e.g. Òlùkọ̀ mi dùn'
													value={variantForm.example_yoruba}
													onChange={(e) =>
														setVariantForm({
															...variantForm,
															example_yoruba: e.target.value,
														})
													}
												/>
											</div>

											<div className='space-y-2'>
												<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
													Translation (English)
												</label>
												<textarea
													rows={2}
													className='input-field py-3'
													placeholder='e.g. My teacher is nice'
													value={variantForm.example_english}
													onChange={(e) =>
														setVariantForm({
															...variantForm,
															example_english: e.target.value,
														})
													}
												/>
											</div>
										</div>

										<button
											type='submit'
											disabled={isSubmittingVariant}
											className='btn-primary w-full flex items-center justify-center space-x-2 mt-4'
										>
											{isSubmittingVariant ? (
												<Loader2
													size={20}
													className='animate-spin'
												/>
											) : (
												<Save size={20} />
											)}
											<span>Submit Variant</span>
										</button>
									</form>
								</div>
							)}
						</motion.div>
					)}
				</div>
			</div>

			<EditVariantModal
				id={editingVariantId}
				onClose={() => setEditingVariantId(null)}
				onSuccess={() => {
					if (user) fetchContributions(user.id);
				}}
			/>
		</div>
	);
};

const StatItem: React.FC<{
	icon: React.ReactNode;
	label: string;
	value: number;
}> = ({ icon, label, value }) => (
	<div className='flex flex-col items-center justify-center text-center'>
		<div className='mb-2 bg-brand-ink/5 p-3 rounded-full'>{icon}</div>
		<span className='text-2xl font-bold font-serif mb-1'>{value}</span>
		<span className='text-xs font-bold uppercase tracking-widest text-brand-ink/40'>
			{label}
		</span>
	</div>
);
