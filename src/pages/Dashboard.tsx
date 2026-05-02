/** @format */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
	Plus,
	Clock,
	CheckCircle,
	AlertCircle,
	User,
	Trash2,
	Save,
	X,
	ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { Contribution, LexiconEntry } from "../types";
import { StatItem } from "../components/StatItem";

const INITIAL_VISIBLE = 5;
const LOAD_MORE_COUNT = 5;

export const Dashboard: React.FC = () => {
	const { user } = useAuth();
	const [contributions, setContributions] = useState<Contribution[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAdding, setIsAdding] = useState(false);
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const [loadingMore, setLoadingMore] = useState(false);
	const [newEntry, setNewEntry] = useState({
		word: "",
		phonetic: "",
		part_of_speech: "noun",
		definition: "",
		example_yoruba: "",
		example_english: "",
	});

	useEffect(() => {
		if (user) {
			fetchContributions(user.id);
		}
	}, [user]);

	const fetchContributions = async (userId: string) => {
		setLoading(true);
		const { data, error } = await (supabase.from("lexicon_entries") as any)
			.select("id, word, definition, status, created_at")
			.eq("contributor_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching contributions:", error);
		} else {
			setContributions(data || []);
			setVisibleCount(INITIAL_VISIBLE); // reset on refresh
		}
		setLoading(false);
	};

	const handleLoadMore = async () => {
		setLoadingMore(true);
		// Small delay so the skeleton feels intentional, not instant
		await new Promise((r) => setTimeout(r, 400));
		setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
		setLoadingMore(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;
		setLoading(true);
		try {
			const { error } = await (
				supabase.from("lexicon_entries") as any
			).insert([
				{
					...newEntry,
					contributor_id: user.id,
					status: "approved",
				},
			]);
			if (error) throw error;

			setIsAdding(false);
			setNewEntry({
				word: "",
				phonetic: "",
				part_of_speech: "noun",
				definition: "",
				example_yoruba: "",
				example_english: "",
			});
			fetchContributions(user.id);
		} catch (err: any) {
			toast.error(err.message || "Error submitting entry.");
		} finally {
			setLoading(false);
		}
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

	const visibleContributions = contributions.slice(0, visibleCount);
	const hasMore = visibleCount < contributions.length;
	const hiddenCount = contributions.length - visibleCount;

	const displayFirstName =
		user?.full_name?.trim()?.split(/\s+/)[0] ||
		user?.email?.split("@")[0] ||
		"Contributor";

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-6 md:space-y-0'>
				<div>
					<h1 className='text-4xl md:text-6xl font-serif font-bold mb-4'>
						Dashboard
					</h1>
					<div className='flex items-center space-x-4 text-brand-ink/60'>
						<div className='flex items-center space-x-2'>
							<User size={18} />
							<span className='font-medium'>
								{displayFirstName}
								{user?.email ? ` · ${user.email}` : ""}
							</span>
						</div>
					</div>
				</div>

				<button
					onClick={() => setIsAdding(true)}
					className='btn-primary flex items-center space-x-2'
				>
					<Plus size={20} />
					<span>New Contribution</span>
				</button>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
				{/* Stats Column */}
				<div className='lg:col-span-1 space-y-8'>
					<div className='lg:sticky flex flex-col gap-5 top-23'>
						<div className='glass-card p-8 rounded-3xl border border-brand-ink/5 shadow-md'>
							<h3 className='text-xl font-serif font-bold mb-6'>
								Your Impact
							</h3>
							<div className='space-y-6'>
								<StatItem
									icon={
										<CheckCircle
											size={20}
											className='text-green-500'
										/>
									}
									label='Approved'
									value={
										contributions.filter(
											(c) => c.status === "approved",
										).length
									}
								/>
								<StatItem
									icon={
										<Clock size={20} className='text-brand-orange' />
									}
									label='Pending'
									value={
										contributions.filter(
											(c) => c.status === "pending",
										).length
									}
								/>
								<StatItem
									icon={
										<AlertCircle
											size={20}
											className='text-brand-ink/20'
										/>
									}
									label='Total Contributions'
									value={contributions.length}
								/>
							</div>
						</div>

						<div className='p-8 rounded-3xl bg-brand-orange text-white'>
							<h3 className='text-xl font-serif font-bold mb-4'>
								Contributor Guide
							</h3>
							<p className='text-white/80 text-sm leading-relaxed mb-6'>
								Ensure your entries follow the standard Yorùbá
								orthography. Include diacritics where necessary to
								maintain phonetic accuracy.
							</p>
							<ul className='space-y-3 text-sm font-medium'>
								<li className='flex items-center space-x-2'>
									<div className='w-1.5 h-1.5 bg-white rounded-full' />
									<span>Use correct tone marks (à, á, a)</span>
								</li>
								<li className='flex items-center space-x-2'>
									<div className='w-1.5 h-1.5 bg-white rounded-full' />
									<span>Provide clear, concise definitions</span>
								</li>
								<li className='flex items-center space-x-2'>
									<div className='w-1.5 h-1.5 bg-white rounded-full' />
									<span>Include usage examples</span>
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Contributions List */}
				<div className='lg:col-span-2'>
					<div className='flex items-baseline justify-between mb-8'>
						<h3 className='text-2xl font-serif font-bold'>
							Recent Contributions
						</h3>
						{!loading && contributions.length > 0 && (
							<span className='text-sm text-brand-ink/40 font-medium'>
								Showing{" "}
								<span className='text-brand-ink/70 font-bold'>
									{Math.min(visibleCount, contributions.length)}
								</span>{" "}
								of{" "}
								<span className='text-brand-ink/70 font-bold'>
									{contributions.length}
								</span>
							</span>
						)}
					</div>

					<div className='space-y-3'>
						<AnimatePresence mode='popLayout'>
							{loading ? (
								Array.from({ length: INITIAL_VISIBLE }).map((_, i) => (
									<div
										key={i}
										className='h-32 rounded-xl bg-white/30 animate-pulse border border-brand-ink/5'
									/>
								))
							) : contributions.length > 0 ? (
								<>
									{visibleContributions.map((contribution, index) => (
										<motion.div
											key={contribution.id}
											layout
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{
												delay:
													index >= visibleCount - LOAD_MORE_COUNT
														? (index -
																(visibleCount -
																	LOAD_MORE_COUNT)) *
															0.05
														: 0,
											}}
											className='glass-card p-6 rounded-xl border border-brand-ink/5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0'
										>
											<div>
												<div className='flex items-center space-x-3 mb-2'>
													<h4 className='text-xl font-serif font-bold'>
														{contribution.word}
													</h4>
													<span
														className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
															contribution.status === "approved"
																? "bg-green-100 text-green-600"
																: "bg-brand-orange/10 text-brand-orange"
														}`}
													>
														{contribution.status}
													</span>
												</div>
												<p className='text-brand-ink/60 text-sm line-clamp-1 max-w-md'>
													{contribution.definition}
												</p>
											</div>
											<div className='flex items-center space-x-4 flex-row'>
												<div className='text-right mr-4'>
													<div className='text-[10px] font-bold uppercase tracking-widest text-brand-ink/30'>
														Submitted
													</div>
													<div className='text-xs font-medium'>
														{new Date(
															contribution.created_at,
														).toLocaleDateString()}
													</div>
												</div>
												<button
													onClick={() =>
														deleteEntry(contribution.id)
													}
													className='p-2 rounded-xl text-brand-ink/20 hover:text-red-500 hover:bg-red-50 transition-all'
												>
													<Trash2 size={18} />
												</button>
											</div>
										</motion.div>
									))}

									{/* Load more skeleton */}
									{loadingMore &&
										Array.from({
											length: Math.min(LOAD_MORE_COUNT, hiddenCount),
										}).map((_, i) => (
											<motion.div
												key={`skeleton-${i}`}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className='h-24 rounded-xl bg-white/30 animate-pulse border border-brand-ink/5'
											/>
										))}

									{/* Load More button */}
									{hasMore && !loadingMore && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className='pt-2'
										>
											<button
												onClick={handleLoadMore}
												className='w-full py-4 rounded-xl border-2 border-dashed border-brand-ink/10 
													text-brand-ink/40 hover:text-brand-ink/70 hover:border-brand-ink/20
													hover:bg-white/40 transition-all duration-200
													flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest'
											>
												<ChevronDown size={16} />
												Load{" "}
												{Math.min(
													LOAD_MORE_COUNT,
													hiddenCount,
												)}{" "}
												more
												<span className='text-brand-ink/25'>
													({hiddenCount} remaining)
												</span>
											</button>
										</motion.div>
									)}

									{/* All loaded indicator */}
									{!hasMore &&
										contributions.length > INITIAL_VISIBLE && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className='pt-2 text-center text-xs font-bold uppercase tracking-widest text-brand-ink/20 py-4'
											>
												All {contributions.length} contributions
												shown
											</motion.div>
										)}
								</>
							) : (
								<div className='py-24 text-center border-2 border-dashed border-brand-ink/5 rounded-3xl'>
									<Plus
										size={48}
										className='mx-auto text-brand-ink/10 mb-6'
									/>
									<h3 className='text-2xl font-serif font-bold mb-2'>
										No contributions yet
									</h3>
									<p className='text-brand-ink/60 mb-8'>
										Start by adding your first word to the archive.
									</p>
									<button
										onClick={() => setIsAdding(true)}
										className='btn-primary'
									>
										Add First Entry
									</button>
								</div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>

			{/* Add Entry Modal */}
			<AnimatePresence>
				{isAdding && (
					<div className='fixed inset-0 z-100 flex items-center justify-center p-4'>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsAdding(false)}
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
									New Lexicon Entry
								</h3>
								<button
									onClick={() => setIsAdding(false)}
									className='p-2 rounded-xl hover:bg-brand-ink/5 text-brand-ink/40'
								>
									<X size={24} />
								</button>
							</div>

							<form
								onSubmit={handleSubmit}
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
											placeholder='e.g. Àlàáfíà'
											value={newEntry.word}
											onChange={(e) =>
												setNewEntry({
													...newEntry,
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
											placeholder='e.g. /à.là.á.fí.à/'
											value={newEntry.phonetic}
											onChange={(e) =>
												setNewEntry({
													...newEntry,
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
										value={newEntry.part_of_speech}
										onChange={(e) =>
											setNewEntry({
												...newEntry,
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
										placeholder='Provide a clear definition in English...'
										value={newEntry.definition}
										onChange={(e) =>
											setNewEntry({
												...newEntry,
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
										placeholder='Use the word in a sentence...'
										value={newEntry.example_yoruba}
										onChange={(e) =>
											setNewEntry({
												...newEntry,
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
										placeholder='Provide the English translation...'
										value={newEntry.example_english}
										onChange={(e) =>
											setNewEntry({
												...newEntry,
												example_english: e.target.value,
											})
										}
									/>
								</div>

								<div className='pt-4 flex space-x-4'>
									<button
										type='button'
										onClick={() => setIsAdding(false)}
										className='btn-secondary flex-1'
									>
										Cancel
									</button>
									<button
										type='submit'
										disabled={loading}
										className='btn-primary flex-1 flex items-center justify-center space-x-2'
									>
										<Save size={18} />
										<span>
											{loading ? "Saving..." : "Save Entry"}
										</span>
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

