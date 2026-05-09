/** @format */

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { PageHeader } from "../components/PageHeader";
import { FilterPills } from "../components/FilterPills";
import { Pagination } from "../components/Pagination";
import { LexiconCard } from "../components/LexiconCard";
import { BrowseEntry } from "../lib/types";
import { YORUBA_ALPHABET } from "../lib/constants";

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
	const [isRestored, setIsRestored] = useState(false);
	const isInitialRender = useRef(true);

	useEffect(() => {
		// Restore state from sessionStorage on mount
		const savedSearchTerm = sessionStorage.getItem("browseSearchTerm");
		const savedLetter = sessionStorage.getItem("browseSelectedLetter");
		const savedPage = sessionStorage.getItem("browseCurrentPage");
		const savedFilter = sessionStorage.getItem("browseBaseWordFilter");

		if (savedSearchTerm) setSearchTerm(savedSearchTerm);
		if (savedLetter) setSelectedLetter(savedLetter);
		if (savedPage) setCurrentPage(parseInt(savedPage));
		if (savedFilter)
			setBaseWordFilter(savedFilter as "all" | "verified" | "multiple");

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
	}, [isRestored, searchTerm, selectedLetter, currentPage, baseWordFilter]);

	useEffect(() => {
		// Only fetch if we've restored state
		if (isRestored) {
			fetchEntries();
		}
	}, [isRestored, selectedLetter, baseWordFilter]);

	useEffect(() => {
		if (!isRestored) return;
		if (isInitialRender.current) {
			isInitialRender.current = false;
			return;
		}

		setCurrentPage(1);
	}, [isRestored, searchTerm, selectedLetter, baseWordFilter]);

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

	const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
	const paginatedEntries = filteredEntries.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

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

			{!loading && filteredEntries.length > 0 && (
				<div className='mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
					<p className='text-sm text-brand-ink/40 font-medium'>
						Showing{" "}
						<span className='text-brand-ink/70 font-bold'>
							{filteredEntries.length > 0
								? (currentPage - 1) * ITEMS_PER_PAGE + 1
								: 0}
							–
							{Math.min(
								currentPage * ITEMS_PER_PAGE,
								filteredEntries.length,
							)}
						</span>{" "}
						of{" "}
						<span className='text-brand-ink/70 font-bold'>
							{filteredEntries.length}
						</span>{" "}
						{filteredEntries.length === 1 ? "entry" : "entries"}
					</p>
					<p className='text-sm text-brand-ink/40'>
						Page {currentPage} of {totalPages}
					</p>
				</div>
			)}

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
				<AnimatePresence mode='popLayout'>
					{loading ? (
						Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
							<div
								key={i}
								className='h-64 rounded-2xl bg-white/30 animate-pulse border border-brand-ink/5'
							/>
						))
					) : paginatedEntries.length > 0 ? (
						paginatedEntries.map((entry, index) => (
							<motion.div
								key={entry.id}
								layout
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{ duration: 0.2, delay: index * 0.03 }}
							>
								<LexiconCard entry={entry} />
							</motion.div>
						))
					) : (
						<div className='col-span-full py-24 text-center'>
							<h3 className='text-2xl font-serif font-bold mb-2'>
								No entries found
							</h3>
							<p className='text-brand-ink/60'>
								Try adjusting your search or filter criteria.
							</p>
						</div>
					)}
				</AnimatePresence>
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
			/>
		</div>
	);
};
