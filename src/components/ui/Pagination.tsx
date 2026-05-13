/** @format */

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
	if (totalPages <= 1) {
		return null;
	}

	const pageNumbers: (number | "…")[] = [];
	if (totalPages <= 7) {
		for (let i = 1; i <= totalPages; i += 1) {
			pageNumbers.push(i);
		}
	} else {
		pageNumbers.push(1);
		if (currentPage > 3) pageNumbers.push("…");
		for (
			let i = Math.max(2, currentPage - 1);
			i <= Math.min(totalPages - 1, currentPage + 1);
			i += 1
		) {
			pageNumbers.push(i);
		}
		if (currentPage < totalPages - 2) pageNumbers.push("…");
		pageNumbers.push(totalPages);
	}

	return (
		<div className='mt-16 flex items-center justify-center gap-2'>
			<button
				type='button'
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/50 text-brand-ink/60 hover:bg-white hover:text-brand-ink disabled:hover:bg-white/50 disabled:hover:text-brand-ink/60'
			>
				Prev
			</button>

			<div className='flex items-center gap-1.5'>
				{pageNumbers.map((page, index) =>
					page === "…" ? (
						<span
							key={`ellipsis-${index}`}
							className='w-10 text-center text-brand-ink/30 font-bold select-none'
						>
							…
						</span>
					) : (
						<button
							key={page}
							type='button'
							onClick={() => onPageChange(page)}
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
				className='flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/50 text-brand-ink/60 hover:bg-white hover:text-brand-ink disabled:hover:bg-white/50 disabled:hover:text-brand-ink/60'
			>
				Next
			</button>
		</div>
	);
};
