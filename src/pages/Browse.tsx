/** @format */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { PageHeader } from "../components/PageHeader";
import { FilterPills } from "../components/FilterPills";
import { Pagination } from "../components/Pagination";
import { LexiconCard } from "../components/LexiconCard";
import { BrowseEntry } from "../lib/types";

const ITEMS_PER_PAGE = 12; // divisible by 3, 2, and 1 — fits all grid layouts

export const Browse: React.FC = () => {
	const [entries, setEntries] = useState<BrowseEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedLetter, setSelectedLetter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);

	const alphabet = [
		"A",
		"B",
		"D",
		"E",
		"Ẹ",
		"F",
		"G",
		"GB",
		"H",
		"I",
		"J",
		"K",
		"L",
		"M",
		"N",
		"O",
		"Ọ",
		"P",
		"R",
		"S",
		"Ṣ",
		"T",
		"U",
		"W",
		"Y",
	];

	useEffect(() => {
		fetchEntries();
	}, [selectedLetter]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, selectedLetter]);

	const fetchEntries = async () => {
		setLoading(true);
		let query = supabase
			.from("lexicon_entries")
			.select("*")
			.eq("status", "approved")
			.order("base_word", { ascending: true });

		if (selectedLetter !== "all") {
			query = query.ilike("base_word", `${selectedLetter}%`);
		}

		const { data, error } = await query;
		if (error) {
			console.error("Error fetching entries:", error);
		} else {
			setEntries(data || []);
		}
		setLoading(false);
	};

	const filteredEntries = entries.filter(
		(entry) =>
			entry.base_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
			entry.definition.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
	const paginatedEntries = filteredEntries.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
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

			<div className='mb-12'>
				<FilterPills
					items={[
						{ key: "all", label: "All" },
						...alphabet.map((letter) => ({ key: letter, label: letter })),
					]}
					value={selectedLetter}
					onChange={setSelectedLetter}
				/>
			</div>

			{!loading && filteredEntries.length > 0 && (
				<div className='mb-6 flex items-center justify-between'>
					<p className='text-sm text-brand-ink/40 font-medium'>
						Showing{" "}
						<span className='text-brand-ink/70 font-bold'>
							{(currentPage - 1) * ITEMS_PER_PAGE + 1}–
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
