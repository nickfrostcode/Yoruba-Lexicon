/** @format */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
	ShieldCheck,
	CheckCircle,
	Clock,
	LayoutDashboard,
	BookA,
	Layers,
	Edit3,
	Trash2,
	ChevronDown,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { BaseWord, LexiconEntry } from "../lib/types";
import { AdminLexiconCard } from "../components/AdminLexiconCard";
import { EditVariantModal } from "../components/EditVariantModal";
import { EditBaseWordModal } from "../components/EditBaseWordModal";
import { Loader } from "../components/Loader";

const LOAD_MORE_COUNT = 10;

type Tab = "overview" | "base-words" | "variants";

export const Admin = () => {
	const [activeTab, setActiveTab] = useState<Tab>("overview");

	const [editingVariantId, setEditingVariantId] = useState<string | null>(
		null,
	);
	const [editingBaseWordId, setEditingBaseWordId] = useState<string | null>(
		null,
	);

	const [stats, setStats] = useState({
		totalBaseWords: 0,
		totalVariants: 0,
		pendingVariants: 0,
		approvedVariants: 0,
	});

	const [baseWords, setBaseWords] = useState<BaseWord[]>([]);
	const [loadingBaseWords, setLoadingBaseWords] = useState(false);

	const [variants, setVariants] = useState<LexiconEntry[]>([]);
	const [loadingVariants, setLoadingVariants] = useState(false);
	const [variantsFilter, setVariantsFilter] = useState<
		"all" | "approved" | "pending"
	>("all");

	const [visibleBaseWords, setVisibleBaseWords] = useState(LOAD_MORE_COUNT);
	const [visibleVariants, setVisibleVariants] = useState(LOAD_MORE_COUNT);

	useEffect(() => {
		if (activeTab === "overview") fetchStats();
		if (activeTab === "base-words") fetchBaseWords();
		if (activeTab === "variants") fetchVariants();
	}, [activeTab]);

	const fetchStats = async () => {
		const [{ count: bwCount }, { count: vCount, data: variantsData }] =
			await Promise.all([
				supabase
					.from("base_words")
					.select("*", { count: "exact", head: true }),
				supabase
					.from("lexicon_entries")
					.select("status", { count: "exact" }),
			]);

		const approved =
			(variantsData as any)?.filter((v: any) => v.status === "approved")
				.length || 0;
		const pending =
			(variantsData as any)?.filter((v: any) => v.status === "pending")
				.length || 0;

		setStats({
			totalBaseWords: bwCount || 0,
			totalVariants: vCount || 0,
			pendingVariants: pending,
			approvedVariants: approved,
		});
	};

	const fetchBaseWords = async () => {
		setLoadingBaseWords(true);
		const { data, error } = await supabase
			.from("base_words")
			.select("*")
			.order("word", { ascending: true });
		if (!error && data) {
			setBaseWords(data);
			setVisibleBaseWords(LOAD_MORE_COUNT);
		}
		setLoadingBaseWords(false);
	};

	const fetchVariants = async () => {
		setLoadingVariants(true);
		const { data, error } = await supabase
			.from("lexicon_entries")
			.select("*, base_word:base_words(id, word)")
			.order("created_at", { ascending: false });
		if (!error && data) {
			setVariants(data);
			setVisibleVariants(LOAD_MORE_COUNT);
		}
		setLoadingVariants(false);
	};

	const handleApprove = async (id: string) => {
		const { error } = await (supabase.from("lexicon_entries") as any)
			.update({ status: "approved" })
			.eq("id", id);
		if (error) {
			toast.error("Error approving entry");
			return;
		}
		setVariants((curr) =>
			curr.map((v) => (v.id === id ? { ...v, status: "approved" } : v)),
		);
		toast.success("Entry approved");
	};

	const handleDeleteVariant = async (id: string) => {
		if (!confirm("Are you sure you want to delete this variant?")) return;
		const { error } = await supabase
			.from("lexicon_entries")
			.delete()
			.eq("id", id);
		if (error) {
			toast.error("Error deleting entry");
			return;
		}
		setVariants((curr) => curr.filter((v) => v.id !== id));
		toast.success("Variant deleted");
	};

	const handleDeleteBaseWord = async (id: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this base word? All related variants may also be removed.",
			)
		)
			return;
		const { error } = await supabase.from("base_words").delete().eq("id", id);
		if (error) {
			toast.error("Error deleting base word");
			return;
		}
		setBaseWords((curr) => curr.filter((b) => b.id !== id));
		toast.success("Base Word deleted");
	};

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='flex items-center space-x-4 mb-12'>
				<div className='w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange text-2xl'>
					<ShieldCheck size={32} />
				</div>
				<div>
					<h1 className='text-4xl font-serif font-bold'>Admin Console</h1>
					<p className='text-brand-ink/60 font-medium'>
						Manage all lexicon data
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
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
								<div className='glass-card p-6 rounded-2xl border border-brand-ink/5 bg-brand-orange text-white'>
									<div className='flex flex-col items-center justify-center text-center'>
										<BookA size={32} className='mb-2 opacity-80' />
										<span className='text-4xl font-bold font-serif mb-1'>
											{stats.totalBaseWords}
										</span>
										<span className='text-sm font-bold uppercase tracking-widest opacity-80'>
											Total Base Words
										</span>
									</div>
								</div>
								<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
									<div className='flex flex-col items-center justify-center text-center'>
										<Layers
											size={32}
											className='mb-2 text-brand-orange/80'
										/>
										<span className='text-4xl font-bold font-serif mb-1'>
											{stats.totalVariants}
										</span>
										<span className='text-sm font-bold uppercase tracking-widest text-brand-ink/40'>
											Total Variants
										</span>
									</div>
								</div>
							</div>

							<div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
								<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
									<div className='flex flex-col items-center justify-center text-center'>
										<CheckCircle
											size={24}
											className='text-green-500 mb-2'
										/>
										<span className='text-2xl font-bold font-serif mb-1'>
											{stats.approvedVariants}
										</span>
										<span className='text-xs font-bold uppercase tracking-widest text-brand-ink/40'>
											Approved Variants
										</span>
									</div>
								</div>
								<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
									<div className='flex flex-col items-center justify-center text-center'>
										<Clock
											size={24}
											className='text-brand-orange mb-2'
										/>
										<span className='text-2xl font-bold font-serif mb-1'>
											{stats.pendingVariants}
										</span>
										<span className='text-xs font-bold uppercase tracking-widest text-brand-ink/40'>
											Pending Variants
										</span>
									</div>
								</div>
							</div>
						</motion.div>
					)}

					{activeTab === "base-words" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className='space-y-6'
						>
							<div className='flex justify-between items-center mb-6'>
								<h2 className='text-3xl font-serif font-bold'>
									Manage Base Words
								</h2>
							</div>
							<div className='bg-white rounded-2xl border border-brand-ink/5 overflow-hidden'>
								{loadingBaseWords ? (
									<Loader text='Loading base words...' />
								) : baseWords.length > 0 ? (
									<div className='flex flex-col'>
										<ul className='divide-y divide-brand-ink/5 max-h-[60vh] overflow-y-auto'>
											{baseWords
												.slice(0, visibleBaseWords)
												.map((bw) => (
													<li
														key={bw.id}
														className='p-4 flex justify-between items-center group'
													>
														<div>
															<span className='font-serif font-bold text-lg'>
																{bw.word}
															</span>{" "}
															<span className='text-sm text-brand-ink/40'>
																({bw.syllables} syllables)
															</span>
															{bw.note && (
																<p className='text-xs text-brand-ink/40 line-clamp-1'>
																	{bw.note}
																</p>
															)}
														</div>
														<div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
															<button
																className='text-brand-ink/40 hover:text-brand-orange cursor-pointer'
																onClick={() =>
																	setEditingBaseWordId(bw.id)
																}
															>
																<Edit3 size={18} />
															</button>
															<button
																className='text-brand-ink/40 hover:text-red-500 cursor-pointer'
																onClick={() =>
																	handleDeleteBaseWord(bw.id)
																}
															>
																<Trash2 size={18} />
															</button>
														</div>
													</li>
												))}
										</ul>
										{visibleBaseWords < baseWords.length && (
											<div className='p-4 border-t border-brand-ink/5 bg-gray-50/50'>
												<button
													onClick={() =>
														setVisibleBaseWords(
															(prev) => prev + LOAD_MORE_COUNT,
														)
													}
													className='w-full py-2 flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest text-brand-orange hover:bg-brand-orange/5 rounded-xl transition-colors cursor-pointer'
												>
													<ChevronDown size={16} /> Load More
												</button>
											</div>
										)}
									</div>
								) : (
									<div className='py-12 text-center text-brand-ink/40'>
										No base words found.
									</div>
								)}
							</div>
						</motion.div>
					)}

					{activeTab === "variants" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<div className='flex justify-between items-center mb-6'>
								<h2 className='text-3xl font-serif font-bold'>
									Manage Variants
								</h2>
								<select
									className='input-field appearance-none cursor-pointer text-sm py-2 px-4 bg-white border border-brand-ink/10 rounded-xl'
									style={{ width: "auto" }}
									value={variantsFilter}
									onChange={(e) => {
										setVariantsFilter(e.target.value as any);
										setVisibleVariants(LOAD_MORE_COUNT); // Reset pagination on filter change
									}}
								>
									<option value='all'>All Variants</option>
									<option value='approved'>Approved</option>
									<option value='pending'>Pending</option>
								</select>
							</div>
							{loadingVariants ? (
								<Loader text='Loading variants...' />
							) : (
								<div className='flex flex-col'>
									<div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
										{variants
											.filter((entry) =>
												variantsFilter === "all"
													? true
													: entry.status === variantsFilter,
											)
											.slice(0, visibleVariants)
											.map((entry) => (
												<AdminLexiconCard
													key={entry.id}
													entry={entry}
													onApprove={handleApprove}
													onEdit={() =>
														setEditingVariantId(entry.id)
													}
													onDelete={handleDeleteVariant}
												/>
											))}
									</div>
									{visibleVariants <
										variants.filter((entry) =>
											variantsFilter === "all"
												? true
												: entry.status === variantsFilter,
										).length && (
										<button
											onClick={() =>
												setVisibleVariants(
													(prev) => prev + LOAD_MORE_COUNT,
												)
											}
											className='w-full mt-6 py-4 flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest text-brand-orange hover:bg-brand-orange/5 rounded-xl transition-colors cursor-pointer'
										>
											<ChevronDown size={16} /> Load More
										</button>
									)}
								</div>
							)}
						</motion.div>
					)}
				</div>
			</div>

			<EditVariantModal
				id={editingVariantId}
				onClose={() => setEditingVariantId(null)}
				onSuccess={fetchVariants}
			/>

			<EditBaseWordModal
				id={editingBaseWordId}
				onClose={() => setEditingBaseWordId(null)}
				onSuccess={() => {
					fetchBaseWords();
					fetchStats();
					fetchVariants();
				}}
			/>
		</div>
	);
};
