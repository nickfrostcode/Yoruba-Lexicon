/** @format */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
	Search,
	ChevronRight,
	ChevronLeft,
	Volume2,
	BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface Entry {
	id: string;
	word: string;
	phonetic: string | null;
	part_of_speech: string | null;
	definition: string;
	example_yoruba: string | null;
	example_english: string | null;
	status: "pending" | "approved";
}

const ITEMS_PER_PAGE = 12; // divisible by 3, 2, and 1 — fits all grid layouts

export const Browse: React.FC = () => {
	const [entries, setEntries] = useState<Entry[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
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

	// Reset to page 1 whenever search or letter filter changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, selectedLetter]);

	const fetchEntries = async () => {
		setLoading(true);
		let query = supabase
			.from("lexicon_entries")
			.select("*")
			.eq("status", "approved")
			.order("word", { ascending: true });

		if (selectedLetter) {
			query = query.ilike("word", `${selectedLetter}%`);
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
			entry.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

	// Build the page number list with ellipsis
	const getPageNumbers = () => {
		const pages: (number | "…")[] = [];
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}
		pages.push(1);
		if (currentPage > 3) pages.push("…");
		for (
			let i = Math.max(2, currentPage - 1);
			i <= Math.min(totalPages - 1, currentPage + 1);
			i++
		) {
			pages.push(i);
		}
		if (currentPage < totalPages - 2) pages.push("…");
		pages.push(totalPages);
		return pages;
	};

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-8 md:space-y-0'>
				<div className='max-w-xl'>
					<h1 className='text-4xl md:text-6xl font-serif font-bold mb-4'>
						Browse Archive
					</h1>
					<p className='text-brand-ink/60 text-lg'>
						Discover the depth and richness of the Yorùbá lexicon. Search
						by word, meaning, or browse alphabetically.
					</p>
				</div>

				<div className='relative w-full md:w-96'>
					<Search
						className='absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30 z-10 pointer-events-none'
						size={20}
					/>
					<input
						type='text'
						placeholder='Search for a word...'
						className='input-field pl-12'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			{/* Alphabet Filter */}
			<div className='mb-12'>
				<div className='flex flex-wrap gap-2 justify-center'>
					<button
						onClick={() => setSelectedLetter(null)}
						className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
							selectedLetter === null
								? "bg-brand-orange text-white"
								: "bg-white/50 text-brand-ink/60 hover:bg-white"
						}`}
					>
						All
					</button>
					{alphabet.map((letter) => (
						<button
							key={letter}
							onClick={() => setSelectedLetter(letter)}
							className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
								selectedLetter === letter
									? "bg-brand-orange text-white"
									: "bg-white/50 text-brand-ink/60 hover:bg-white"
							}`}
						>
							{letter}
						</button>
					))}
				</div>
			</div>

			{/* Results count */}
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

			{/* Results Grid */}
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
							<BookOpen
								size={48}
								className='mx-auto text-brand-ink/10 mb-6'
							/>
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

			{/* Pagination */}
			{!loading && totalPages > 1 && (
				<div className='mt-16 flex items-center justify-center gap-2'>
					{/* Prev */}
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all
							disabled:opacity-30 disabled:cursor-not-allowed
							bg-white/50 text-brand-ink/60 hover:bg-white hover:text-brand-ink
							disabled:hover:bg-white/50 disabled:hover:text-brand-ink/60'
					>
						<ChevronLeft size={16} />
						Prev
					</button>

					{/* Page numbers */}
					<div className='flex items-center gap-1.5'>
						{getPageNumbers().map((page, i) =>
							page === "…" ? (
								<span
									key={`ellipsis-${i}`}
									className='w-10 text-center text-brand-ink/30 font-bold select-none'
								>
									…
								</span>
							) : (
								<button
									key={page}
									onClick={() => handlePageChange(page as number)}
									className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
										currentPage === page
											? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
											: "bg-white/50 text-brand-ink/60 hover:bg-white hover:text-brand-ink"
									}`}
								>
									{page}
								</button>
							),
						)}
					</div>

					{/* Next */}
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all
							disabled:opacity-30 disabled:cursor-not-allowed
							bg-white/50 text-brand-ink/60 hover:bg-white hover:text-brand-ink
							disabled:hover:bg-white/50 disabled:hover:text-brand-ink/60'
					>
						Next
						<ChevronRight size={16} />
					</button>
				</div>
			)}
		</div>
	);
};

const LexiconCard: React.FC<{ entry: Entry }> = ({ entry }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const speak = (text: string) => {
		console.log("speaking", text);
		speechSynthesis.cancel();
		const voices = speechSynthesis.getVoices();
		const yorubaVoice = voices.find((v) => v.lang === "yo-NG");
		// If Yoruba voice exists → use Web Speech API
		if (yorubaVoice) {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.voice = yorubaVoice;
			utterance.lang = "yo-NG";

			speechSynthesis.speak(utterance);
			console.log("spoken with system Yoruba voice");
			return;
		}
		// Fallback → Google TTS
		toast.error("Yoruba voice not available on your device.");
		// const audio = new Audio(
		// 	`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
		// 		text,
		// 	)}&tl=yo&client=tw-ob`,
		// );
		// audio.play().catch((err) => {
		// 	console.error("Audio playback failed:", err);
		// });
		// console.log("spoken with Google TTS fallback");
	};

	return (
		<div
			className={`glass-card p-8 rounded-2xl transition-all duration-300 cursor-pointer group hover:border-brand-orange/30 ${
				isExpanded
					? "ring-2 ring-brand-orange/20 shadow-2xl"
					: "hover:shadow-lg"
			}`}
			onClick={() => setIsExpanded(!isExpanded)}
		>
			<div className='flex justify-between items-start mb-4'>
				<div>
					<h3 className='text-3xl font-serif font-bold text-brand-ink group-hover:text-brand-orange transition-colors'>
						{entry.word}
					</h3>
					<div className='flex items-center space-x-3 mt-1'>
						<span className='text-xs font-bold uppercase tracking-widest text-brand-orange'>
							{entry.part_of_speech || "N/A"}
						</span>
						<span className='text-brand-ink/30 text-xs font-mono'>
							{entry.phonetic || "/.../"}
						</span>
					</div>
				</div>
				<button className='text-brand-ink/20 hover:text-brand-orange transition-colors cursor-pointer'>
					<Volume2
						size={24}
						onClick={(e) => {
							e.stopPropagation();
							speak(entry.word);
						}}
					/>
				</button>
			</div>

			<p
				className={`text-brand-ink/70 leading-relaxed mb-6 ${isExpanded ? "" : "line-clamp-2"}`}
			>
				{entry.definition}
			</p>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className='overflow-hidden pt-4 border-t border-brand-ink/5'
					>
						<div className='space-y-6'>
							{entry.example_yoruba && (
								<div>
									<h4 className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-2'>
										Example (Yorùbá)
									</h4>
									<p className='text-lg font-serif italic text-brand-ink/80 leading-relaxed'>
										"{entry.example_yoruba}"
									</p>
								</div>
							)}
							{entry.example_english && (
								<div>
									<h4 className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-2'>
										Translation (English)
									</h4>
									<p className='text-brand-ink/60 leading-relaxed'>
										"{entry.example_english}"
									</p>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{!isExpanded && (
				<div className='flex items-center text-xs font-bold uppercase tracking-widest text-brand-ink/30 mt-4 group-hover:text-brand-orange transition-colors'>
					<span>View Details</span>
					<ChevronRight size={14} className='ml-1' />
				</div>
			)}
		</div>
	);
};
