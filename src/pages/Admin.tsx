/** @format */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
	CheckCircle,
	Edit3,
	Trash2,
	Search,
	Save,
	X,
	ChevronRight,
	ChevronLeft,
	Volume2,
	ShieldCheck,
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
	created_at: string;
	contributor_id: string | null;
}

const ITEMS_PER_PAGE = 12;

export const Admin: React.FC = () => {
	const [entries, setEntries] = useState<Entry[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

	useEffect(() => {
		fetchEntries();
	}, []);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filter]);

	const fetchEntries = async () => {
		setLoading(true);
		const { data, error } = await supabase
			.from("lexicon_entries")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching entries:", error);
		} else {
			setEntries(data || []);
		}
		setLoading(false);
	};

	const handleApprove = async (id: string) => {
		const { error } = await supabase
			.from("lexicon_entries")
			.update({ status: "approved" })
			.eq("id", id);

		if (error) {
			toast.error("Error approving entry");
		} else {
			setEntries(
				entries.map((e) =>
					e.id === id ? { ...e, status: "approved" } : e,
				),
			);
			toast.success("Entry approved");
		}
	};

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingEntry) return;

		const { error } = await supabase
			.from("lexicon_entries")
			.update({
				word: editingEntry.word,
				phonetic: editingEntry.phonetic,
				part_of_speech: editingEntry.part_of_speech,
				definition: editingEntry.definition,
				example_yoruba: editingEntry.example_yoruba,
				example_english: editingEntry.example_english,
			})
			.eq("id", editingEntry.id);

		if (error) {
			toast.error("Error updating entry");
		} else {
			setEntries(
				entries.map((e) => (e.id === editingEntry.id ? editingEntry : e)),
			);
			setEditingEntry(null);
			toast.success("Entry updated");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this entry?")) return;

		const { error } = await supabase
			.from("lexicon_entries")
			.delete()
			.eq("id", id);

		if (error) {
			toast.error("Error deleting entry");
		} else {
			setEntries(entries.filter((e) => e.id !== id));
			toast.success("Entry deleted");
		}
	};

	const filteredEntries = entries.filter((e) => {
		const matchesFilter = filter === "all" || e.status === filter;
		const matchesSearch =
			e.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
			e.definition.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesFilter && matchesSearch;
	});

	const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE) || 1;
	const paginatedEntries = filteredEntries.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

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

	const statusFilters: { key: "all" | "pending" | "approved"; label: string }[] =
		[
			{ key: "all", label: "All" },
			{ key: "pending", label: "Pending" },
			{ key: "approved", label: "Approved" },
		];

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-8 md:space-y-0'>
				<div className='max-w-xl'>
					<h1 className='text-4xl md:text-6xl font-serif font-bold mb-4'>
						Admin Console
					</h1>
					<p className='text-brand-ink/60 text-lg'>
						Review, edit, and approve community contributions. Layout
						matches the archive browse experience.
					</p>
				</div>

				<div className='relative w-full md:w-96'>
					<Search
						className='absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30 z-10 pointer-events-none'
						size={20}
					/>
					<input
						type='text'
						placeholder='Search for a word or definition...'
						className='input-field pl-12'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			{/* Status filter — same pill style as Browse alphabet */}
			<div className='mb-12'>
				<div className='flex flex-wrap gap-2 justify-center'>
					{statusFilters.map(({ key, label }) => (
						<button
							key={key}
							type='button'
							onClick={() => setFilter(key)}
							className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
								filter === key
									? "bg-brand-orange text-white"
									: "bg-white/50 text-brand-ink/60 hover:bg-white"
							}`}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			{!loading && filteredEntries.length > 0 && (
				<div className='mb-6 flex items-center justify-between flex-wrap gap-2'>
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
								<AdminLexiconCard
									entry={entry}
									onApprove={handleApprove}
									onEdit={setEditingEntry}
									onDelete={handleDelete}
								/>
							</motion.div>
						))
					) : (
						<div className='col-span-full py-24 text-center'>
							<ShieldCheck
								size={48}
								className='mx-auto text-brand-ink/10 mb-6'
							/>
							<h3 className='text-2xl font-serif font-bold mb-2'>
								No entries found
							</h3>
							<p className='text-brand-ink/60'>
								Try adjusting your filters or search terms.
							</p>
						</div>
					)}
				</AnimatePresence>
			</div>

			{!loading && totalPages > 1 && (
				<div className='mt-16 flex items-center justify-center gap-2'>
					<button
						type='button'
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
									type='button'
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

					<button
						type='button'
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

			<AnimatePresence>
				{editingEntry && (
					<div className='fixed inset-0 z-100 flex items-center justify-center p-4'>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setEditingEntry(null)}
							className='absolute inset-0 bg-brand-ink/40 backdrop-blur-sm'
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							className='relative w-full max-w-2xl bg-brand-cream rounded-3xl shadow-2xl overflow-hidden'
						>
							<div className='p-8 border-b border-brand-ink/5 flex justify-between items-center'>
								<h3 className='text-2xl font-serif font-bold'>
									Edit Entry
								</h3>
								<button
									type='button'
									onClick={() => setEditingEntry(null)}
									className='p-2 rounded-xl hover:bg-brand-ink/5 text-brand-ink/40'
								>
									<X size={24} />
								</button>
							</div>

							<form
								onSubmit={handleUpdate}
								className='p-8 max-h-[70vh] overflow-y-auto space-y-6'
							>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div className='space-y-2'>
										<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
											Word
										</label>
										<input
											type='text'
											className='input-field'
											value={editingEntry.word}
											onChange={(e) =>
												setEditingEntry({
													...editingEntry,
													word: e.target.value,
												})
											}
											required
										/>
									</div>
									<div className='space-y-2'>
										<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
											Phonetic
										</label>
										<input
											type='text'
											className='input-field'
											value={editingEntry.phonetic || ""}
											onChange={(e) =>
												setEditingEntry({
													...editingEntry,
													phonetic: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
										Part of Speech
									</label>
									<select
										className='input-field appearance-none'
										value={editingEntry.part_of_speech || "noun"}
										onChange={(e) =>
											setEditingEntry({
												...editingEntry,
												part_of_speech: e.target.value,
											})
										}
									>
										<option value='noun'>Orúkọ (Noun)</option>
										<option value='pronoun'>
											Àrọ̀pò orúkọ (Pronoun)
										</option>
										<option value='verb'>Òrò ìṣe (Verb)</option>
										<option value='adjective'>
											Àpèjúwe (Adjective)
										</option>
										<option value='adverb'>
											Àrọ̀pò òrò ìṣe (Adverb)
										</option>
										<option value='conjunction'>
											Òrò àsopò (Conjunction)
										</option>
										<option value='preposition'>
											Òrò ìbáṣepọ̀ (Preposition)
										</option>
										<option value='pronominal'>
											Àrọ̀pò orúkọ àfikún (Pronominal)
										</option>
									</select>
								</div>

								<div className='space-y-2'>
									<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
										Definition
									</label>
									<textarea
										rows={3}
										className='input-field py-4'
										value={editingEntry.definition}
										onChange={(e) =>
											setEditingEntry({
												...editingEntry,
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
									<input
										type='text'
										className='input-field'
										value={editingEntry.example_yoruba || ""}
										onChange={(e) =>
											setEditingEntry({
												...editingEntry,
												example_yoruba: e.target.value,
											})
										}
									/>
								</div>

								<div className='space-y-2'>
									<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
										Example (English Translation)
									</label>
									<input
										type='text'
										className='input-field'
										value={editingEntry.example_english || ""}
										onChange={(e) =>
											setEditingEntry({
												...editingEntry,
												example_english: e.target.value,
											})
										}
									/>
								</div>

								<div className='pt-4 flex space-x-4'>
									<button
										type='button'
										onClick={() => setEditingEntry(null)}
										className='btn-secondary flex-1'
									>
										Cancel
									</button>
									<button
										type='submit'
										className='btn-primary flex-1 flex items-center justify-center space-x-2'
									>
										<Save size={18} />
										<span>Save Changes</span>
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
};

const AdminLexiconCard: React.FC<{
	entry: Entry;
	onApprove: (id: string) => void;
	onEdit: (entry: Entry) => void;
	onDelete: (id: string) => void;
}> = ({ entry, onApprove, onEdit, onDelete }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const speak = (text: string) => {
		speechSynthesis.cancel();
		const voices = speechSynthesis.getVoices();
		const yorubaVoice = voices.find((v) => v.lang === "yo-NG");
		if (yorubaVoice) {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.voice = yorubaVoice;
			utterance.lang = "yo-NG";
			speechSynthesis.speak(utterance);
			return;
		}
		toast.error("Yoruba voice not available on your device.");
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
			<div className='flex justify-between items-start mb-4 gap-2'>
				<div className='min-w-0 flex-1'>
					<h3 className='text-3xl font-serif font-bold text-brand-ink group-hover:text-brand-orange transition-colors break-words'>
						{entry.word}
					</h3>
					<div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-1'>
						<span
							className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
								entry.status === "approved"
									? "bg-green-100 text-green-600"
									: "bg-brand-orange/10 text-brand-orange"
							}`}
						>
							{entry.status}
						</span>
						<span className='text-xs font-bold uppercase tracking-widest text-brand-orange'>
							{entry.part_of_speech || "N/A"}
						</span>
						<span className='text-brand-ink/30 text-xs font-mono truncate max-w-[140px]'>
							{entry.phonetic || "/.../"}
						</span>
					</div>
				</div>
				<div
					className='flex items-center gap-1 shrink-0'
					onClick={(e) => e.stopPropagation()}
				>
					{entry.status === "pending" && (
						<button
							type='button'
							onClick={() => onApprove(entry.id)}
							className='p-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors'
							title='Approve'
						>
							<CheckCircle size={20} />
						</button>
					)}
					<button
						type='button'
						onClick={() => onEdit(entry)}
						className='p-2 rounded-xl bg-brand-ink text-white hover:bg-brand-ink/80 transition-colors'
						title='Edit'
					>
						<Edit3 size={18} />
					</button>
					<button
						type='button'
						onClick={() => onDelete(entry.id)}
						className='p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors'
						title='Delete'
					>
						<Trash2 size={18} />
					</button>
					<button
						type='button'
						className='text-brand-ink/20 hover:text-brand-orange transition-colors p-2'
						title='Pronounce'
						onClick={() => speak(entry.word)}
					>
						<Volume2 size={22} />
					</button>
				</div>
			</div>

			<p
				className={`text-brand-ink/70 leading-relaxed mb-4 ${isExpanded ? "" : "line-clamp-2"}`}
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
							<p className='text-xs font-bold uppercase tracking-widest text-brand-ink/40'>
								Submitted{" "}
								<span className='text-brand-ink/60 font-medium normal-case'>
									{new Date(entry.created_at).toLocaleString()}
								</span>
							</p>
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
				<div className='flex items-center text-xs font-bold uppercase tracking-widest text-brand-ink/30 mt-2 group-hover:text-brand-orange transition-colors'>
					<span>View Details</span>
					<ChevronRight size={14} className='ml-1' />
				</div>
			)}
		</div>
	);
};
