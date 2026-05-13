import { motion } from "motion/react";
import { Edit3, Trash2, ChevronDown } from "lucide-react";
import { Loader } from "@/src/components/ui/Loader";
import { BaseWord } from "@/src/lib/types";

interface AdminBaseWordsProps {
	loadingBaseWords: boolean;
	baseWords: BaseWord[];
	baseWordsFilter: string;
	setBaseWordsFilter: (filter: string) => void;
	availableAlphabets: string[];
	baseWordsSortBy: "date-down" | "date-up" | "a-z" | "z-a";
	setBaseWordsSortBy: (sortBy: "date-down" | "date-up" | "a-z" | "z-a") => void;
	getSortedAndFilteredBaseWords: () => BaseWord[];
	visibleBaseWords: number;
	setVisibleBaseWords: (count: number | ((prev: number) => number)) => void;
	LOAD_MORE_COUNT: number;
	setEditingBaseWordId: (id: string | null) => void;
	handleDeleteBaseWord: (id: string) => void;
}

export const AdminBaseWords: React.FC<AdminBaseWordsProps> = ({
	loadingBaseWords,
	baseWords,
	baseWordsFilter,
	setBaseWordsFilter,
	availableAlphabets,
	baseWordsSortBy,
	setBaseWordsSortBy,
	getSortedAndFilteredBaseWords,
	visibleBaseWords,
	setVisibleBaseWords,
	LOAD_MORE_COUNT,
	setEditingBaseWordId,
	handleDeleteBaseWord,
}) => {
	const filteredBaseWords = getSortedAndFilteredBaseWords();

	return (
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
							{filteredBaseWords
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
													? `${bw.syllables ?? "N/A"} syllables • by ${bw.profiles.full_name}`
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
												onClick={() => setEditingBaseWordId(bw.id)}
											>
												<Edit3 size={18} />
											</button>
											<button
												className='text-brand-ink/40 hover:text-red-500 cursor-pointer'
												onClick={() => handleDeleteBaseWord(bw.id)}
											>
												<Trash2 size={18} />
											</button>
										</div>
									</li>
								))}
						</ul>
						{visibleBaseWords < filteredBaseWords.length && (
							<div className='p-4 border-t border-brand-ink/5 flex justify-center'>
								<button
									onClick={() =>
										setVisibleBaseWords(
											(prev: number) => prev + LOAD_MORE_COUNT,
										)
									}
									className='flex items-center space-x-2 px-6 py-2 rounded-full border border-brand-ink/10 text-sm font-bold text-brand-ink/60 hover:bg-brand-ink/5 transition-colors cursor-pointer'
								>
									<span>Load More</span>
									<ChevronDown size={16} />
								</button>
							</div>
						)}
					</div>
				) : (
					<div className='p-12 text-center text-brand-ink/40'>
						No base words found.
					</div>
				)}
			</div>
		</motion.div>
	);
};
