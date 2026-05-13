/** @format */

import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Loader } from "@/src/components/ui/Loader";
import { AdminLexiconCard } from "@/src/components/cards/AdminLexiconCard";
import { LexiconEntry } from "@/src/lib/types";

interface AdminVariantsProps {
	loadingVariants: boolean;
	variants: LexiconEntry[];
	variantsFilter: string;
	setVariantsFilter: (filter: "unverified" | "verified" | "all") => void;
	variantsSortBy: "date-down" | "date-up" | "a-z" | "z-a";
	setVariantsSortBy: (sortBy: "date-down" | "date-up" | "a-z" | "z-a") => void;
	getSortedAndFilteredVariants: () => LexiconEntry[];
	visibleVariants: number;
	setVisibleVariants: (count: number | ((prev: number) => number)) => void;
	LOAD_MORE_COUNT: number;
	handleApprove: (id: string) => void;
	handleUnverify: (id: string) => void;
	setEditingVariantId: (id: string | null) => void;
	handleDeleteVariant: (id: string) => void;
}

export const AdminVariants: React.FC<AdminVariantsProps> = ({
	loadingVariants,
	variants,
	variantsFilter,
	setVariantsFilter,
	variantsSortBy,
	setVariantsSortBy,
	getSortedAndFilteredVariants,
	visibleVariants,
	setVisibleVariants,
	LOAD_MORE_COUNT,
	handleApprove,
	handleUnverify,
	setEditingVariantId,
	handleDeleteVariant,
}) => {
	const filteredVariants = getSortedAndFilteredVariants();

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className='space-y-6'
		>
			<div className='flex justify-between items-center mb-6 flex-wrap gap-4'>
				<h2 className='text-3xl font-serif font-bold'>Manage Variants</h2>
				<div className='flex gap-3'>
					<select
						className='input-field appearance-none cursor-pointer text-sm py-2 px-4 bg-white border border-brand-ink/10 rounded-xl'
						style={{ width: "auto" }}
						value={variantsFilter}
						onChange={(e) => {
							setVariantsFilter(
								e.target.value as "unverified" | "verified" | "all",
							);
							setVisibleVariants(LOAD_MORE_COUNT);
						}}
					>
						<option value='all'>All Status</option>
						<option value='unverified'>Unverified</option>
						<option value='verified'>Verified</option>
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
						<option value='a-z'>Base Word A - Z</option>
						<option value='z-a'>Base Word Z - A</option>
					</select>
				</div>
			</div>
			{loadingVariants ? (
				<Loader text='Loading variants...' />
			) : variants.length > 0 ? (
				<>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						{filteredVariants.slice(0, visibleVariants).map((variant) => (
							<motion.div
								key={variant.id}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.2 }}
							>
								<AdminLexiconCard
									key={variant.id}
									entry={variant}
									onApprove={handleApprove}
									onUnverify={handleUnverify}
									onEdit={() => setEditingVariantId(variant.id)}
									onDelete={handleDeleteVariant}
								/>
							</motion.div>
						))}
					</div>
					{visibleVariants < filteredVariants.length && (
						<div className='flex justify-center mt-8'>
							<button
								onClick={() =>
									setVisibleVariants(
										(prev: number) => prev + LOAD_MORE_COUNT,
									)
								}
								className='flex items-center space-x-2 px-6 py-2 rounded-full border border-brand-ink/10 text-sm font-bold text-brand-ink/60 hover:bg-brand-ink/5 transition-colors cursor-pointer'
							>
								<span>Load More Variants</span>
								<ChevronDown size={16} />
							</button>
						</div>
					)}
				</>
			) : (
				<div className='bg-white rounded-2xl border border-brand-ink/5 p-12 text-center text-brand-ink/40'>
					No variants found.
				</div>
			)}
		</motion.div>
	);
};
