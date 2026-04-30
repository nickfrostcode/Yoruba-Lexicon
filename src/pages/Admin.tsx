/** @format */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
	CheckCircle,
	Edit3,
	Trash2,
	Filter,
	Search,
	ShieldAlert,
	Save,
	X,
	Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

export const Admin: React.FC = () => {
	const { user, isAdmin, loading: authLoading } = useAuth();
	const [entries, setEntries] = useState<Entry[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<"all" | "pending" | "approved">(
		"pending",
	);
	const [searchTerm, setSearchTerm] = useState("");
	const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (authLoading) return;
		if (!user) {
			navigate("/auth");
		} else if (isAdmin) {
			fetchEntries();
		} else {
			setLoading(false);
		}
	}, [user, isAdmin, authLoading, navigate]);

	const fetchEntries = async () => {
		setLoading(true);
		let query = supabase
			.from("lexicon_entries")
			.select("*")
			.order("created_at", { ascending: false });

		const { data, error } = await query;
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
			alert("Error approving entry");
		} else {
			setEntries(
				entries.map((e) =>
					e.id === id ? { ...e, status: "approved" } : e,
				),
			);
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
			alert("Error updating entry");
		} else {
			setEntries(
				entries.map((e) => (e.id === editingEntry.id ? editingEntry : e)),
			);
			setEditingEntry(null);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this entry?")) return;

		const { error } = await supabase
			.from("lexicon_entries")
			.delete()
			.eq("id", id);

		if (error) {
			alert("Error deleting entry");
		} else {
			setEntries(entries.filter((e) => e.id !== id));
		}
	};

	const filteredEntries = entries.filter((e) => {
		const matchesFilter = filter === "all" || e.status === filter;
		const matchesSearch =
			e.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
			e.definition.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesFilter && matchesSearch;
	});

	if (!isAdmin && !authLoading) {
		return (
			<div className='max-w-7xl mx-auto px-4 py-24 text-center'>
				<ShieldAlert size={64} className='mx-auto text-red-500 mb-6' />
				<h1 className='text-4xl font-serif font-bold mb-4'>
					Access Denied
				</h1>
				<p className='text-brand-ink/60 mb-8'>
					You do not have administrative privileges to access this page.
				</p>
				<button onClick={() => navigate("/")} className='btn-primary'>
					Return Home
				</button>
			</div>
		);
	}

	if (authLoading || loading) {
		return (
			<div className='max-w-7xl mx-auto px-4 py-24 text-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto'></div>
				<p className='mt-4 text-brand-ink/60'>Verifying credentials...</p>
			</div>
		);
	}

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-12 space-y-6 md:space-y-0'>
				<div>
					<h1 className='text-4xl md:text-6xl font-serif font-bold mb-4'>
						Admin Console
					</h1>
					<p className='text-brand-ink/60 text-lg'>
						Review, edit, and approve community contributions.
					</p>
				</div>

				<div className='flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto'>
					<div className='relative grow'>
						<Search
							className='absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30'
							size={18}
						/>
						<input
							type='text'
							placeholder='Search entries...'
							className='input-field pl-12'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<select title="status"
						className='input-field min-w-37.5'
						value={filter}
						onChange={(e) =>
							setFilter(e.target.value as "all" | "pending" | "approved")
						}
					>
						<option value='pending'>Pending</option>
						<option value='approved'>Approved</option>
						<option value='all'>All Entries</option>
					</select>
				</div>
			</div>

			<div className='space-y-6'>
				<AnimatePresence mode='popLayout'>
					{filteredEntries.map((entry) => (
						<motion.div
							key={entry.id}
							layout
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className='glass-card p-6 rounded-2xl border border-brand-ink/5 hover:border-brand-orange/20 transition-all'
						>
							<div className='flex flex-col lg:flex-row justify-between gap-6'>
								<div className='grow'>
									<div className='flex items-center space-x-3 mb-2'>
										<h3 className='text-2xl font-serif font-bold'>
											{entry.word}
										</h3>
										<span
											className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
												entry.status === "approved"
													? "bg-green-100 text-green-600"
													: "bg-brand-orange/10 text-brand-orange"
											}`}
										>
											{entry.status}
										</span>
									</div>
									<div className='flex items-center space-x-4 text-xs font-bold uppercase tracking-widest text-brand-ink/30 mb-4'>
										<span>{entry.part_of_speech}</span>
										<span>{entry.phonetic}</span>
										<span className='flex items-center'>
											<Clock size={12} className='mr-1' />
											{new Date(
												entry.created_at,
											).toLocaleDateString()}
										</span>
									</div>
									<p className='text-brand-ink/70 leading-relaxed max-w-3xl'>
										{entry.definition}
									</p>
								</div>

								<div className='flex flex-row lg:flex-col justify-end items-center lg:items-end space-x-2 lg:space-x-0 lg:space-y-2'>
									{entry.status === "pending" && (
										<button
											onClick={() => handleApprove(entry.id)}
											className='p-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20'
											title='Approve'
										>
											<CheckCircle size={20} />
										</button>
									)}
									<button
										onClick={() => setEditingEntry(entry)}
										className='p-3 rounded-xl bg-brand-ink text-white hover:bg-brand-ink/80 transition-colors'
										title='Edit'
									>
										<Edit3 size={20} />
									</button>
									<button
										onClick={() => handleDelete(entry.id)}
										className='p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors'
										title='Delete'
									>
										<Trash2 size={20} />
									</button>
								</div>
							</div>
						</motion.div>
					))}
				</AnimatePresence>

				{filteredEntries.length === 0 && (
					<div className='py-24 text-center border-2 border-dashed border-brand-ink/5 rounded-3xl'>
						<Filter
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
			</div>

			{/* Edit Modal */}
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
