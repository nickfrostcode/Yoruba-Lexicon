/** @format */

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/src/lib/supabase";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { FilterPills } from "@/src/components/ui/FilterPills";
import { BrowseBaseWords } from "@/src/components/browse/BrowseBaseWords";
import { BrowseAllWords } from "@/src/components/browse/BrowseAllWords";
import { BrowseEntry, LexiconEntry } from "@/src/lib/types";
import { YORUBA_ALPHABET } from "@/src/lib/constants";

const ITEMS_PER_PAGE = 12; // divisible by 3, 2, and 1 — fits all grid layouts

export const Browse: React.FC = () => {
	const [entries, setEntries] = useState<BrowseEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedLetter, setSelectedLetter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [baseWordFilter, setBaseWordFilter] = useState<
		"all" | "verified" | "multiple"
	>("all");
	const [browseTab, setBrowseTab] = useState<"base-words" | "all-words">("base-words");
	const [allWords, setAllWords] = useState<LexiconEntry[]>([]);
	const [loadingAllWords, setLoadingAllWords] = useState(true);
	const [allWordsPage, setAllWordsPage] = useState(1);
	const [isRestored, setIsRestored] = useState(false);
	const isInitialRender = useRef(true);

	useEffect(() => {
		// Restore state from sessionStorage on mount
		const savedSearchTerm = sessionStorage.getItem("browseSearchTerm");
		const savedLetter = sessionStorage.getItem("browseSelectedLetter");
		const savedPage = sessionStorage.getItem("browseCurrentPage");
		const savedFilter = sessionStorage.getItem("browseBaseWordFilter");
		const savedTab = sessionStorage.getItem("browseTab");
		const savedAllWordsPage = sessionStorage.getItem("browseAllWordsPage");

		if (savedSearchTerm) setSearchTerm(savedSearchTerm);
		if (savedLetter) setSelectedLetter(savedLetter);
		if (savedPage) setCurrentPage(parseInt(savedPage));
		if (savedFilter)
			setBaseWordFilter(savedFilter as "all" | "verified" | "multiple");
		if (savedTab) setBrowseTab(savedTab as "base-words" | "all-words");
		if (savedAllWordsPage) setAllWordsPage(parseInt(savedAllWordsPage));

		// Mark restoration as complete
		setIsRestored(true);

		const savedScrollY = sessionStorage.getItem("browseScrollY");
		if (savedScrollY) {
			setTimeout(() => {
				window.scrollTo(0, parseInt(savedScrollY));
			}, 100);
		}
	}, []);

	useEffect(() => {
		if (!isRestored) return;

		// Save state to sessionStorage whenever it changes
		sessionStorage.setItem("browseSearchTerm", searchTerm);
		sessionStorage.setItem("browseSelectedLetter", selectedLetter);
		sessionStorage.setItem("browseCurrentPage", currentPage.toString());
		sessionStorage.setItem("browseBaseWordFilter", baseWordFilter);
		sessionStorage.setItem("browseTab", browseTab);
		sessionStorage.setItem("browseAllWordsPage", allWordsPage.toString());
	}, [isRestored, searchTerm, selectedLetter, currentPage, baseWordFilter, browseTab, allWordsPage]);

	useEffect(() => {
		// Only fetch if we've restored state
		if (isRestored) {
			fetchEntries();
			fetchAllWords();
		}
	}, [isRestored, selectedLetter, baseWordFilter]);

	useEffect(() => {
		if (!isRestored) return;
		if (isInitialRender.current) {
			isInitialRender.current = false;
			return;
		}

		setCurrentPage(1);
		setAllWordsPage(1);
	}, [isRestored, searchTerm, selectedLetter, baseWordFilter, browseTab]);

	const fetchEntries = async () => {
		setLoading(true);
		let query = supabase
			.from("base_words")
			.select(
				"id, word, normalized_word, syllables, lexicon_entries!inner(id, status)",
			)
			.order("word", { ascending: true });

		if (selectedLetter !== "all") {
			// use the alphabet column for better precision if possible, but ILIKE works too
			query = query.ilike(
				"normalized_word",
				`${selectedLetter.toLowerCase()}%`,
			);
		}

		const { data, error } = await query;
		if (error) {
			console.error("Error fetching entries:", error);
		} else {
			// Because there might be multiple variants
			const formatted = ((data as any[]) || []).map((b) => ({
				id: b.id,
				word: b.word,
				syllables: b.syllables,
				variant_count: Array.isArray(b.lexicon_entries)
					? b.lexicon_entries.length
					: 0,
				has_verified: Array.isArray(b.lexicon_entries)
					? b.lexicon_entries.some((e: any) => e.status === "verified")
					: false,
			}));

			// Due to !inner, a single base_word may be duplicated if PostgREST flattens it, but usually it nests.
			// Just unique by id to be safe
			const unique = Array.from(
				new Map(formatted.map((item) => [item.id, item])).values(),
			);

			setEntries(unique);
		}
		setLoading(false);
	};

	const filteredEntries = entries.filter((entry) => {
		const matchesSearch = entry.word
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		let matchesFilter = true;

		switch (baseWordFilter) {
			case "verified":
				matchesFilter = entry.has_verified;
				break;
			case "multiple":
				matchesFilter = entry.variant_count > 1;
				break;
			default:
				matchesFilter = true;
		}

		return matchesSearch && matchesFilter;
	});

	const fetchAllWords = async () => {
		setLoadingAllWords(true);
		let query = supabase
			.from("lexicon_entries")
			.select("*, base_word:base_words(syllables), profiles!lexicon_entries_contributor_id_fkey(full_name)")
			.order("word", { ascending: true });

		if (selectedLetter !== "all") {
			query = query.ilike("word", `${selectedLetter.toLowerCase()}%`);
		}

		const { data, error } = await query;
		if (error) {
			console.error("Error fetching all words:", error);
		} else {
			setAllWords((data as any) || []);
		}
		setLoadingAllWords(false);
	};

	const filteredAllWords = allWords.filter((entry) => {
		return entry.word.toLowerCase().includes(searchTerm.toLowerCase());
	});

	const allWordsTotalPages = Math.ceil(filteredAllWords.length / ITEMS_PER_PAGE);

	const handleAllWordsPageChange = (page: number) => {
		setAllWordsPage(page);
		sessionStorage.setItem("browseScrollY", "0");
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		// Save scroll position
		sessionStorage.setItem("browseScrollY", "0");
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<PageHeader
				title='Browse Archive'
				description='Discover the depth and richness of the Yorùbá lexicon. Search by word, meaning, or browse alphabetically.'
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				searchPlaceholder='Search for a word...'
			/>

			<div className='flex space-x-4 mb-6 border-b border-brand-ink/10 pb-2 mt-8'>
				<button
					onClick={() => setBrowseTab("base-words")}
					className={`pb-2 font-bold cursor-pointer transition-colors ${
						browseTab === "base-words"
							? "text-brand-orange border-b-2 border-brand-orange"
							: "text-brand-ink/40 hover:text-brand-ink"
					}`}
				>
					Base Words
				</button>
				<button
					onClick={() => setBrowseTab("all-words")}
					className={`pb-2 font-bold cursor-pointer transition-colors ${
						browseTab === "all-words"
							? "text-brand-orange border-b-2 border-brand-orange"
							: "text-brand-ink/40 hover:text-brand-ink"
					}`}
				>
					All Words
				</button>
			</div>

			<div className='mb-8'>
				<h3 className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-3'>
					Filter by Letter
				</h3>
				<FilterPills
					items={[
						{ key: "all", label: "All" },
						...YORUBA_ALPHABET.map((letter) => ({
							key: letter,
							label: letter,
						})),
					]}
					value={selectedLetter}
					onChange={setSelectedLetter}
				/>
			</div>

			{browseTab === "base-words" && (
				<div className='mb-12'>
					<h3 className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-3'>
						Filter by Base Word
					</h3>
					<FilterPills
						items={[
							{ key: "all", label: "All Words" },
							{ key: "verified", label: "Has Verified Variants" },
							{ key: "multiple", label: "Multiple Variants" },
						]}
						value={baseWordFilter}
						onChange={(value) => setBaseWordFilter(value as any)}
					/>
				</div>
			)}

			{browseTab === "base-words" ? (
				<BrowseBaseWords
					entries={filteredEntries}
					loading={loading}
					currentPage={currentPage}
					totalPages={totalPages}
					itemsPerPage={ITEMS_PER_PAGE}
					onPageChange={handlePageChange}
				/>
			) : (
				<BrowseAllWords
					words={filteredAllWords}
					loading={loadingAllWords}
					currentPage={allWordsPage}
					totalPages={allWordsTotalPages}
					itemsPerPage={ITEMS_PER_PAGE}
					onPageChange={handleAllWordsPageChange}
				/>
			)}
		</div>
	);
};
