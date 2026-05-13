import { motion, AnimatePresence } from "motion/react";
import { LexiconCard } from "@/src/components/cards/LexiconCard";
import { Pagination } from "@/src/components/ui/Pagination";
import { BrowseEntry } from "@/src/lib/types";

interface BrowseBaseWordsProps {
	entries: BrowseEntry[];
	loading: boolean;
	currentPage: number;
	totalPages: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
}

export const BrowseBaseWords: React.FC<BrowseBaseWordsProps> = ({
	entries,
	loading,
	currentPage,
	totalPages,
	itemsPerPage,
	onPageChange,
}) => {
	const paginatedEntries = entries.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	return (
		<>
			{!loading && entries.length > 0 && (
				<div className='mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
					<p className='text-sm text-brand-ink/40 font-medium'>
						Showing{" "}
						<span className='text-brand-ink/70 font-bold'>
							{entries.length > 0
								? (currentPage - 1) * itemsPerPage + 1
								: 0}
							–
							{Math.min(
								currentPage * itemsPerPage,
								entries.length,
							)}
						</span>{" "}
						of{" "}
						<span className='text-brand-ink/70 font-bold'>
							{entries.length}
						</span>{" "}
						{entries.length === 1 ? "entry" : "entries"}
					</p>
					<p className='text-sm text-brand-ink/40'>
						Page {currentPage} of {totalPages}
					</p>
				</div>
			)}

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
				<AnimatePresence mode='popLayout'>
					{loading ? (
						Array.from({ length: itemsPerPage }).map((_, i) => (
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
				onPageChange={onPageChange}
			/>
		</>
	);
};
