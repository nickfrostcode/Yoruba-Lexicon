import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
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

	if (totalPages <= 1) return null;

	return (
		<div className='mt-16 flex items-center justify-center gap-2'>
			<button
				type='button'
				onClick={() => onPageChange(currentPage - 1)}
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
							onClick={() => onPageChange(page as number)}
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
				onClick={() => onPageChange(currentPage + 1)}
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
	);
};