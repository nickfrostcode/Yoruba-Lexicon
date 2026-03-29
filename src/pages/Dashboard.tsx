/** @format */

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
	Plus,
	Clock,
	CheckCircle,
	AlertCircle,
	User,
	Trash2,
	Edit3,
	Save,
	X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

interface Contribution {
	id: string;
	word: string;
	definition: string;
	status: "pending" | "approved";
	created_at: string;
}

export const Dashboard: React.FC = () => {
	const [user, setUser] = useState<any>(null);
	const [contributions, setContributions] = useState<Contribution[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAdding, setIsAdding] = useState(false);
	const [newEntry, setNewEntry] = useState({
		word: "",
		phonetic: "",
		part_of_speech: "noun",
		definition: "",
		example_yoruba: "",
		example_english: "",
	});
	const navigate = useNavigate();

	useEffect(() => {
		const checkUser = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				navigate("/auth");
			} else {
				setUser(session.user);
				fetchContributions(session.user.id);
			}
		};
		checkUser();
	}, [navigate]);

	const fetchContributions = async (userId: string) => {
		setLoading(true);
		const { data, error } = await supabase
			.from("lexicon_entries")
			.select("id, word, definition, status, created_at")
			.eq("contributor_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching contributions:", error);
		} else {
			setContributions(data || []);
		}
		setLoading(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const { error } = await supabase.from("lexicon_entries").insert([
				{
					...newEntry,
					contributor_id: user.id,
					status: "pending",
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
			alert(err.message || "Error submitting entry.");
		} finally {
			setLoading(false);
		}
	};

	const deleteEntry = async (id: string) => {
		if (!confirm("Are you sure you want to delete this contribution?"))
			return;

		const { error } = await supabase
			.from("lexicon_entries")
			.delete()
			.eq("id", id);
		if (error) {
			alert("Error deleting entry.");
		} else {
			fetchContributions(user.id);
		}
	};

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
							<span className='font-medium'>{user?.email}</span>
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
					<div className='glass-card p-8 rounded-3xl border border-brand-ink/5 shadow-xl'>
						<h3 className='text-xl font-serif font-bold mb-6'>
							Your Impact
						</h3>
						<div className='space-y-6'>
							<StatItem
								icon={
									<CheckCircle size={20} className='text-green-500' />
								}
								label='Approved'
								value={
									contributions.filter((c) => c.status === "approved")
										.length
								}
							/>
							<StatItem
								icon={<Clock size={20} className='text-brand-orange' />}
								label='Pending'
								value={
									contributions.filter((c) => c.status === "pending")
										.length
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
							Ensure your entries follow the standard Yorùbá orthography.
							Include diacritics where necessary to maintain phonetic
							accuracy.
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

				{/* Contributions List */}
				<div className='lg:col-span-2'>
					<h3 className='text-2xl font-serif font-bold mb-8'>
						Recent Contributions
					</h3>
					<div className='space-y-6'>
						<AnimatePresence mode='popLayout'>
							{loading ? (
								Array.from({ length: 3 }).map((_, i) => (
									<div
										key={i}
										className='h-32 rounded-2xl bg-white/30 animate-pulse border border-brand-ink/5'
									/>
								))
							) : contributions.length > 0 ? (
								contributions.map((contribution) => (
									<motion.div
										key={contribution.id}
										layout
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 20 }}
										className='glass-card p-6 rounded-2xl border border-brand-ink/5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0'
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
										<div className='flex items-center space-x-4'>
											<div className='text-right mr-4 hidden md:block'>
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
												onClick={() => deleteEntry(contribution.id)}
												className='p-2 rounded-xl text-brand-ink/20 hover:text-red-500 hover:bg-red-50 transition-all'
											>
												<Trash2 size={18} />
											</button>
										</div>
									</motion.div>
								))
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
					<div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
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
										<option value='noun'>Noun</option>
										<option value='verb'>Verb</option>
										<option value='adjective'>Adjective</option>
										<option value='adverb'>Adverb</option>
										<option value='phrase'>Phrase</option>
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

const StatItem: React.FC<{
	icon: React.ReactNode;
	label: string;
	value: number;
}> = ({ icon, label, value }) => (
	<div className='flex items-center justify-between'>
		<div className='flex items-center space-x-3'>
			{icon}
			<span className='text-sm font-medium text-brand-ink/60'>{label}</span>
		</div>
		<span className='text-lg font-bold'>{value}</span>
	</div>
);
