/** @format */

import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/context/AuthContext";
import {
	BookA,
	Layers,
	LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import { Contribution, BaseWord, LexiconEntry } from "@/src/lib/types";
import {
	normalizeWord,
	getAlphabetChar,
	compareBaseAndVariant,
} from "../lib/utils";
import { EditVariantModal } from "@/src/components/modals/EditVariantModal";
import { EditBaseWordModal } from "@/src/components/modals/EditBaseWordModal";
import { DashboardOverview } from "@/src/components/dashboard/DashboardOverview";
import { DashboardBaseWordForm } from "@/src/components/dashboard/DashboardBaseWordForm";
import { DashboardVariantForm } from "@/src/components/dashboard/DashboardVariantForm";

const INITIAL_VISIBLE = 10;
const LOAD_MORE_COUNT = 10;

type Tab = "overview" | "base-words" | "variants";

export const Dashboard: React.FC = () => {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<Tab>("overview");

	// Modals
	const [editingVariantId, setEditingVariantId] = useState<string | null>(
		null,
	);

	// Overview State
	const [overviewTab, setOverviewTab] = useState<"variants" | "base-words">("variants");
	const [contributions, setContributions] = useState<Contribution[]>([]);
	const [loadingContributions, setLoadingContributions] = useState(true);
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const [contributionsFilter, setContributionsFilter] = useState<
		"all" | "verified" | "unverified"
	>("all");
	const [contributionsSortBy, setContributionsSortBy] = useState<
		"date-down" | "date-up" | "a-z" | "z-a"
	>("date-down");

	const [overviewBaseWords, setOverviewBaseWords] = useState<BaseWord[]>([]);
	const [loadingOverviewBaseWords, setLoadingOverviewBaseWords] = useState(true);
	const [overviewBaseWordsVisible, setOverviewBaseWordsVisible] = useState(INITIAL_VISIBLE);
	const [overviewBaseWordsFilter, setOverviewBaseWordsFilter] = useState<string>("all");
	const [overviewBaseWordsSortBy, setOverviewBaseWordsSortBy] = useState<
		"date-down" | "date-up" | "a-z" | "z-a"
	>("date-down");
	const [editingBaseWordId, setEditingBaseWordId] = useState<string | null>(null);

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
			fetchOverviewBaseWords(user.id);
		}
	}, [user]);

	const fetchOverviewBaseWords = async (userId: string) => {
		setLoadingOverviewBaseWords(true);
		const { data, error } = await supabase
			.from("base_words")
			.select("*")
			.eq("created_by", userId)
			.order("created_at", { ascending: false });

		if (!error && data) {
			setOverviewBaseWords(data);
		}
		setLoadingOverviewBaseWords(false);
	};

	useEffect(() => {
		if (activeTab !== "variants" || selectedBaseWord) return;
		if (loadedBaseWordsLetter !== selectedLetter) {
			fetchBaseWordsByLetter(selectedLetter);
		}
	}, [selectedLetter, activeTab, selectedBaseWord, loadedBaseWordsLetter]);

	useEffect(() => {
		if (selectedBaseWord) {
			fetchExistingVariants(selectedBaseWord.id);
			
			// Scroll to the top of the page so the form is immediately visible
			setTimeout(() => {
				window.scrollTo({
					top: 0,
					behavior: "smooth"
				});
			}, 100);
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
			.order("created_at", { ascending: false });

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

	const handleDeleteOverviewBaseWord = async (id: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this base word? All related variants may also be removed.",
			)
		)
			return;

		const { error } = await supabase.from("base_words").delete().eq("id", id);
		if (error) {
			toast.error("Error deleting base word.");
		} else {
			toast.success("Base Word deleted.");
			if (user) fetchOverviewBaseWords(user.id);
		}
	};

	const availableOverviewAlphabets = Array.from(
		new Set(overviewBaseWords.map((bw) => bw.alphabet).filter(Boolean)),
	).sort((a, b) => a.localeCompare(b));

	const getSortedAndFilteredOverviewBaseWords = () => {
		let filtered = overviewBaseWords.filter((bw) =>
			overviewBaseWordsFilter === "all" ? true : bw.alphabet === overviewBaseWordsFilter,
		);

		const sorted = [...filtered].sort((a, b) => {
			switch (overviewBaseWordsSortBy) {
				case "date-up":
					return (
						new Date(a.created_at).getTime() -
						new Date(b.created_at).getTime()
					);
				case "date-down":
					return (
						new Date(b.created_at).getTime() -
						new Date(a.created_at).getTime()
					);
				case "a-z":
					return (a.word || "").localeCompare(b.word || "");
				case "z-a":
					return (b.word || "").localeCompare(a.word || "");
				default:
					return 0;
			}
		});

		return sorted;
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
			fetchExistingVariants(selectedBaseWord.id);
			fetchContributions(user.id);
		} catch (err: any) {
			toast.error(err.message || "Error submitting variant.");
		} finally {
			setIsSubmittingVariant(false);
		}
	};

	const displayFirstName =
		user?.full_name?.trim()?.split(/\s+/)[0] ||
		user?.email?.split("@")[0] ||
		"Contributor";

	const getSortedAndFilteredContributions = () => {
		let filtered = contributions.filter((c) =>
			contributionsFilter === "all" ? true : c.status === contributionsFilter,
		);

		const sorted = [...filtered].sort((a, b) => {
			switch (contributionsSortBy) {
				case "date-up":
					return (
						new Date(a.created_at).getTime() -
						new Date(b.created_at).getTime()
					);
				case "date-down":
					return (
						new Date(b.created_at).getTime() -
						new Date(a.created_at).getTime()
					);
				case "a-z":
					return (a.word || "").localeCompare(b.word || "");
				case "z-a":
					return (b.word || "").localeCompare(a.word || "");
				default:
					return 0;
			}
		});

		return sorted;
	};

	const visibleContributions = getSortedAndFilteredContributions().slice(0, visibleCount);
	const hasMore = visibleCount < getSortedAndFilteredContributions().length;

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
						<DashboardOverview
							contributions={contributions}
							getSortedAndFilteredContributions={getSortedAndFilteredContributions}
							visibleContributions={visibleContributions}
							hasMore={hasMore}
							handleLoadMore={handleLoadMore}
							loadingContributions={loadingContributions}
							overviewTab={overviewTab}
							setOverviewTab={setOverviewTab}
							contributionsFilter={contributionsFilter}
							setContributionsFilter={setContributionsFilter}
							contributionsSortBy={contributionsSortBy}
							setContributionsSortBy={setContributionsSortBy}
							INITIAL_VISIBLE={INITIAL_VISIBLE}
							setVisibleCount={setVisibleCount}
							setEditingVariantId={setEditingVariantId}
							deleteEntry={deleteEntry}
							overviewBaseWords={overviewBaseWords}
							getSortedAndFilteredOverviewBaseWords={getSortedAndFilteredOverviewBaseWords}
							overviewBaseWordsVisible={overviewBaseWordsVisible}
							setOverviewBaseWordsVisible={setOverviewBaseWordsVisible}
							overviewBaseWordsFilter={overviewBaseWordsFilter}
							setOverviewBaseWordsFilter={setOverviewBaseWordsFilter}
							overviewBaseWordsSortBy={overviewBaseWordsSortBy}
							setOverviewBaseWordsSortBy={setOverviewBaseWordsSortBy}
							availableOverviewAlphabets={availableOverviewAlphabets}
							loadingOverviewBaseWords={loadingOverviewBaseWords}
							handleDeleteOverviewBaseWord={handleDeleteOverviewBaseWord}
							LOAD_MORE_COUNT={LOAD_MORE_COUNT}
							setEditingBaseWordId={setEditingBaseWordId}
						/>
					)}

					{activeTab === "base-words" && (
						<DashboardBaseWordForm
							submitBaseWord={submitBaseWord}
							baseWordInput={baseWordInput}
							setBaseWordInput={setBaseWordInput}
							baseWordSyllables={baseWordSyllables}
							setBaseWordSyllables={setBaseWordSyllables}
							baseWordNote={baseWordNote}
							setBaseWordNote={setBaseWordNote}
							isSubmittingBaseWord={isSubmittingBaseWord}
						/>
					)}

					{activeTab === "variants" && (
						<DashboardVariantForm
							selectedBaseWord={selectedBaseWord}
							setSelectedBaseWord={setSelectedBaseWord}
							selectedLetter={selectedLetter}
							setSelectedLetter={setSelectedLetter}
							baseWords={baseWords}
							loadingBaseWords={loadingBaseWords}
							existingVariants={existingVariants}
							setExistingVariants={setExistingVariants}
							loadingExistingVariants={loadingExistingVariants}
							formData={variantForm}
							setFormData={setVariantForm}
							isSubmittingVariant={isSubmittingVariant}
							submitVariant={submitVariant}
						/>
					)}
				</div>
			</div>

			<EditVariantModal
				id={editingVariantId}
				onClose={() => setEditingVariantId(null)}
				onSuccess={() => {
					if (user) {
						fetchContributions(user.id);
					}
				}}
			/>

			<EditBaseWordModal
				id={editingBaseWordId}
				onClose={() => setEditingBaseWordId(null)}
				onSuccess={() => {
					if (user) {
						fetchOverviewBaseWords(user.id);
					}
				}}
			/>
		</div>
	);
};
