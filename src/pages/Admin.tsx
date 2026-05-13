/** @format */

import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import {
	ShieldCheck,
	LayoutDashboard,
	BookA,
	Layers,
} from "lucide-react";
import { toast } from "sonner";
import { BaseWord, LexiconEntry } from "@/src/lib/types";
import { EditVariantModal } from "@/src/components/modals/EditVariantModal";
import { EditBaseWordModal } from "@/src/components/modals/EditBaseWordModal";
import { AdminOverview } from "@/src/components/admin/AdminOverview";
import { AdminBaseWords } from "@/src/components/admin/AdminBaseWords";
import { AdminVariants } from "@/src/components/admin/AdminVariants";

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
						<AdminOverview stats={stats} />
					)}

					{activeTab === "base-words" && (
						<AdminBaseWords
							loadingBaseWords={loadingBaseWords}
							baseWords={baseWords}
							baseWordsFilter={baseWordsFilter}
							setBaseWordsFilter={setBaseWordsFilter}
							availableAlphabets={availableAlphabets}
							baseWordsSortBy={baseWordsSortBy}
							setBaseWordsSortBy={setBaseWordsSortBy}
							getSortedAndFilteredBaseWords={getSortedAndFilteredBaseWords}
							visibleBaseWords={visibleBaseWords}
							setVisibleBaseWords={setVisibleBaseWords}
							LOAD_MORE_COUNT={LOAD_MORE_COUNT}
							setEditingBaseWordId={setEditingBaseWordId}
							handleDeleteBaseWord={handleDeleteBaseWord}
						/>
					)}

					{activeTab === "variants" && (
						<AdminVariants
							loadingVariants={loadingVariants}
							variants={variants}
							variantsFilter={variantsFilter}
							setVariantsFilter={setVariantsFilter}
							variantsSortBy={variantsSortBy}
							setVariantsSortBy={setVariantsSortBy}
							getSortedAndFilteredVariants={getSortedAndFilteredVariants}
							visibleVariants={visibleVariants}
							setVisibleVariants={setVisibleVariants}
							LOAD_MORE_COUNT={LOAD_MORE_COUNT}
							handleApprove={handleApprove}
							handleUnverify={handleUnverify}
							setEditingVariantId={setEditingVariantId}
							handleDeleteVariant={handleDeleteVariant}
						/>
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
