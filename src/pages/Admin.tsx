/** @format */

import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
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
import { BaseWord, LexiconEntry } from "@/src/lib/types";
import { AdminLexiconCard } from "@/src/components/AdminLexiconCard";
import { EditVariantModal } from "@/src/components/EditVariantModal";
import { EditBaseWordModal } from "@/src/components/EditBaseWordModal";
import { Loader } from "@/src/components/Loader";

const LOAD_MORE_COUNT = 20;

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
		unverifiedVariants: 0,
		verifiedVariants: 0,
	});

	const [baseWords, setBaseWords] = useState<BaseWord[]>([]);
	const [loadingBaseWords, setLoadingBaseWords] = useState(false);

	const [variants, setVariants] = useState<LexiconEntry[]>([]);
	const [loadingVariants, setLoadingVariants] = useState(false);
	const [variantsFilter, setVariantsFilter] = useState<
		"all" | "verified" | "unverified"
	>("all");
	const [variantsSortBy, setVariantsSortBy] = useState<
		"date-down" | "date-up" | "a-z" | "z-a"
	>("date-down");

	const [baseWordsFilter, setBaseWordsFilter] = useState<string>("all");
	const [baseWordsSortBy, setBaseWordsSortBy] = useState<
		"date-down" | "date-up" | "a-z" | "z-a"
	>("date-down");

	const [visibleBaseWords, setVisibleBaseWords] = useState(LOAD_MORE_COUNT);
	const [visibleVariants, setVisibleVariants] = useState(LOAD_MORE_COUNT);
	const [statsLoaded, setStatsLoaded] = useState(false);
	const [baseWordsLoaded, setBaseWordsLoaded] = useState(false);
	const [variantsLoaded, setVariantsLoaded] = useState(false);

	useEffect(() => {
		if (activeTab === "overview" && !statsLoaded) fetchStats();
		if (activeTab === "base-words" && !baseWordsLoaded) fetchBaseWords();
		if (activeTab === "variants" && !variantsLoaded) fetchVariants();
	}, [activeTab, statsLoaded, baseWordsLoaded, variantsLoaded]);

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

		const verified =
			(variantsData as any)?.filter((v: any) => v.status === "verified")
				.length || 0;
		const unverified =
			(variantsData as any)?.filter((v: any) => v.status === "unverified")
				.length || 0;

		setStats({
			totalBaseWords: bwCount || 0,
			totalVariants: vCount || 0,
			unverifiedVariants: unverified,
			verifiedVariants: verified,
		});
		setStatsLoaded(true);
	};

	const fetchBaseWords = async () => {
		setLoadingBaseWords(true);
		const { data, error } = await supabase
			.from("base_words")
			.select("*, profiles!base_words_created_by_fkey(full_name)")
			.order("word", { ascending: true });
		if (!error && data) {
			setBaseWords(data);
			setVisibleBaseWords(LOAD_MORE_COUNT);
			setBaseWordsLoaded(true);
		}
		setLoadingBaseWords(false);
	};

	const fetchVariants = async () => {
		setLoadingVariants(true);
		const { data, error } = await supabase
			.from("lexicon_entries")
			.select(
				"*, base_word:base_words(id, word), profiles!lexicon_entries_contributor_id_fkey(full_name)",
			)
			.order("created_at", { ascending: false });
		if (!error && data) {
			setVariants(data);
			setVisibleVariants(LOAD_MORE_COUNT);
			setVariantsLoaded(true);
		}
		setLoadingVariants(false);
	};

	const handleApprove = async (id: string) => {
		const { error } = await (supabase.from("lexicon_entries") as any)
			.update({ status: "verified" })
			.eq("id", id);
		if (error) {
			toast.error("Error approving entry");
			return;
		}
		setVariants((curr) =>
			curr.map((v) => (v.id === id ? { ...v, status: "verified" } : v)),
		);
		toast.success("Entry verified");
	};

	const handleUnverify = async (id: string) => {
		const { error } = await (supabase.from("lexicon_entries") as any)
			.update({ status: "unverified" })
			.eq("id", id);
		if (error) {
			toast.error("Error unverifying entry");
			return;
		}
		setVariants((curr) =>
			curr.map((v) => (v.id === id ? { ...v, status: "unverified" } : v)),
		);
		toast.success("Entry unverified");
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

	const getSortedAndFilteredVariants = () => {
		let filtered = variants.filter((entry) =>
			variantsFilter === "all" ? true : entry.status === variantsFilter,
		);

		const sorted = [...filtered].sort((a, b) => {
			switch (variantsSortBy) {
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
					return (a.base_word?.word || "").localeCompare(
						b.base_word?.word || "",
					);
				case "z-a":
					return (b.base_word?.word || "").localeCompare(
						a.base_word?.word || "",
					);
				default:
					return 0;
			}
		});

		return sorted;
	};

	const availableAlphabets = Array.from(
		new Set(baseWords.map((bw) => bw.alphabet).filter(Boolean)),
	).sort((a, b) => a.localeCompare(b));

	const getSortedAndFilteredBaseWords = () => {
		let filtered = baseWords.filter((bw) =>
			baseWordsFilter === "all" ? true : bw.alphabet === baseWordsFilter,
		);

		const sorted = [...filtered].sort((a, b) => {
			switch (baseWordsSortBy) {
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
										<span className='text-3xl font-bold font-serif mb-1 text-green-500'>
											{stats.verifiedVariants}
										</span>
										<span className='text-xs font-bold uppercase tracking-widest text-brand-ink/40'>
											Verified Variants
										</span>
									</div>
								</div>
								<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
									<div className='flex flex-col items-center justify-center text-center'>
										<Clock
											size={24}
											className='text-brand-orange mb-2'
										/>
										<span className='text-3xl font-bold font-serif mb-1 text-brand-orange'>
											{stats.unverifiedVariants}
										</span>
										<span className='text-xs font-bold uppercase tracking-widest text-brand-ink/40'>
											Unverified Variants
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
							<div className='flex justify-between items-center mb-6 flex-wrap gap-4'>
								<h2 className='text-3xl font-serif font-bold'>
									Manage Base Words
								</h2>
								<div className='flex gap-3'>
									<select
										className='input-field appearance-none cursor-pointer text-sm py-2 px-4 bg-white border border-brand-ink/10 rounded-xl'
										style={{ width: "auto" }}
										value={baseWordsFilter}
										onChange={(e) => {
											setBaseWordsFilter(e.target.value);
											setVisibleBaseWords(LOAD_MORE_COUNT);
										}}
									>
										<option value='all'>All Letters</option>
										{availableAlphabets.map((letter) => (
											<option key={letter} value={letter}>
												Letter {letter.toUpperCase()}
											</option>
										))}
									</select>
									<select
										className='input-field appearance-none cursor-pointer text-sm py-2 px-4 bg-white border border-brand-ink/10 rounded-xl'
										style={{ width: "auto" }}
										value={baseWordsSortBy}
										onChange={(e) => {
											setBaseWordsSortBy(e.target.value as any);
											setVisibleBaseWords(LOAD_MORE_COUNT);
										}}
									>
										<option value='date-down'>Newest First</option>
										<option value='date-up'>Oldest First</option>
										<option value='a-z'>A - Z</option>
										<option value='z-a'>Z - A</option>
									</select>
								</div>
							</div>
							<div className='bg-white rounded-2xl border border-brand-ink/5 overflow-hidden'>
								{loadingBaseWords ? (
									<Loader text='Loading base words...' />
								) : baseWords.length > 0 ? (
									<div className='flex flex-col'>
										<ul className='divide-y divide-brand-ink/5 max-h-[60vh] overflow-y-auto'>
											{getSortedAndFilteredBaseWords()
												.slice(0, visibleBaseWords)
												.map((bw) => (
													<li
														key={bw.id}
														className='p-4 flex justify-between items-center group'
													>
														<div>
															<span className='font-serif font-bold text-lg'>
																{bw.word} &ensp;
															</span>
															<span className='text-sm text-brand-ink/40 truncate max-w-50'>
																{bw.profiles?.full_name
																	? `${bw.syllables ?? "N/A"} syllables •
                                                   by ${bw.profiles.full_name}`
																	: `${bw.syllables ?? "N/A"} syllables`}
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
										{visibleBaseWords < getSortedAndFilteredBaseWords().length && (
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
							<div className='flex justify-between items-center mb-6 flex-wrap gap-4'>
								<h2 className='text-3xl font-serif font-bold'>
									Manage Variants
								</h2>
								<div className='flex gap-3'>
									<select
										className='input-field appearance-none cursor-pointer text-sm py-2 px-4 bg-white border border-brand-ink/10 rounded-xl'
										style={{ width: "auto" }}
										value={variantsFilter}
										onChange={(e) => {
											setVariantsFilter(e.target.value as any);
											setVisibleVariants(LOAD_MORE_COUNT);
										}}
									>
										<option value='all'>All Variants</option>
										<option value='verified'>Verified</option>
										<option value='unverified'>Unverified</option>
									</select>
									<select
										className='input-field appearance-none cursor-pointer text-sm py-2 px-4 bg-white border border-brand-ink/10 rounded-xl'
										style={{ width: "auto" }}
										value={variantsSortBy}
										onChange={(e) => {
											setVariantsSortBy(e.target.value as any);
											setVisibleVariants(LOAD_MORE_COUNT);
										}}
									>
										<option value='date-down'>Newest First</option>
										<option value='date-up'>Oldest First</option>
										<option value='a-z'>A - Z</option>
										<option value='z-a'>Z - A</option>
									</select>
								</div>
							</div>
							{loadingVariants ? (
								<Loader text='Loading variants...' />
							) : (
								<div className='flex flex-col'>
									<div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
										{getSortedAndFilteredVariants()
											.slice(0, visibleVariants)
											.map((entry) => (
												<motion.div
													key={entry.id}
													initial={{ opacity: 0, scale: 0.95 }}
													animate={{ opacity: 1, scale: 1 }}
													transition={{ delay: 1 * 0.1 }}
												>
													<AdminLexiconCard
														key={entry.id}
														entry={entry}
														onApprove={handleApprove}
														onUnverify={handleUnverify}
														onEdit={() =>
															setEditingVariantId(entry.id)
														}
														onDelete={handleDeleteVariant}
													/>
												</motion.div>
											))}
									</div>
									{visibleVariants <
										getSortedAndFilteredVariants().length && (
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
