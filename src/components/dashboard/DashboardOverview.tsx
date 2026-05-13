import { motion } from "motion/react";
import { CheckCircle, Clock, AlertCircle, ChevronDown, Edit3, Trash2 } from "lucide-react";
import { Loader } from "@/src/components/ui/Loader";
import { ContributionCard } from "@/src/components/cards/ContributionCard";

const StatItem = ({ icon, label, value }: { icon: any; label: string; value: number }) => (
	<div className='flex flex-col items-center justify-center text-center'>
		<div className='mb-2'>{icon}</div>
		<span className='text-4xl font-bold font-serif mb-1'>{value}</span>
		<span className='text-sm font-bold uppercase tracking-widest text-brand-ink/40'>
			{label}
		</span>
	</div>
);

interface DashboardOverviewProps {
	contributions: any[];
	getSortedAndFilteredContributions: () => any[];
	visibleContributions: any[];
	hasMore: boolean;
	handleLoadMore: () => void;
	loadingContributions: boolean;
	overviewTab: "variants" | "base-words";
	setOverviewTab: (tab: "variants" | "base-words") => void;
	contributionsFilter: string;
	setContributionsFilter: (val: "all" | "verified" | "unverified") => void;
	contributionsSortBy: string;
	setContributionsSortBy: (val: "date-down" | "date-up" | "a-z" | "z-a") => void;
	INITIAL_VISIBLE: number;
	setVisibleCount: (val: number | ((prev: number) => number)) => void;
	setEditingVariantId: (id: string) => void;
	deleteEntry: (id: string) => void;
	overviewBaseWords: any[];
	getSortedAndFilteredOverviewBaseWords: () => any[];
	overviewBaseWordsVisible: number;
	setOverviewBaseWordsVisible: (val: number | ((prev: number) => number)) => void;
	overviewBaseWordsFilter: string;
	setOverviewBaseWordsFilter: (val: string) => void;
	overviewBaseWordsSortBy: string;
	setOverviewBaseWordsSortBy: (val: "date-down" | "date-up" | "a-z" | "z-a") => void;
	availableOverviewAlphabets: string[];
	loadingOverviewBaseWords: boolean;
	handleDeleteOverviewBaseWord: (id: string) => void;
	LOAD_MORE_COUNT: number;
	setEditingBaseWordId: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
	contributions,
	getSortedAndFilteredContributions,
	visibleContributions,
	hasMore,
	handleLoadMore,
	loadingContributions,
	overviewTab,
	setOverviewTab,
	contributionsFilter,
	setContributionsFilter,
	contributionsSortBy,
	setContributionsSortBy,
	INITIAL_VISIBLE,
	setVisibleCount,
	setEditingVariantId,
	deleteEntry,
	overviewBaseWords,
	getSortedAndFilteredOverviewBaseWords,
	overviewBaseWordsVisible,
	setOverviewBaseWordsVisible,
	overviewBaseWordsFilter,
	setOverviewBaseWordsFilter,
	overviewBaseWordsSortBy,
	setOverviewBaseWordsSortBy,
	availableOverviewAlphabets,
	loadingOverviewBaseWords,
	handleDeleteOverviewBaseWord,
	LOAD_MORE_COUNT,
	setEditingBaseWordId,
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className='space-y-8'
		>
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
				<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
					<StatItem
						icon={
							<CheckCircle
								size={24}
								className='text-green-500'
							/>
						}
						label='Verified'
						value={
							contributions.filter(
								(c) => c.status === "verified",
							).length
						}
					/>
				</div>
				<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
					<StatItem
						icon={
							<Clock
								size={24}
								className='text-brand-orange'
							/>
						}
						label='Unverified'
						value={
							contributions.filter(
								(c) => c.status === "unverified",
							).length
						}
					/>
				</div>
				<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
					<StatItem
						icon={
							<AlertCircle
								size={24}
								className='text-brand-ink/20'
							/>
						}
						label='Total'
						value={contributions.length}
					/>
				</div>
			</div>

			<div className='p-8 rounded-3xl bg-brand-orange text-white shadow-lg'>
				<h3 className='text-2xl font-serif font-bold mb-4'>
					How to Contribute
				</h3>
				<p className='text-white/80 leading-relaxed mb-6'>
					Our lexicon follows a Base-Word → Variant
					architecture. This ensures a clean grouping of
					dialects and precise definitions.
				</p>
				<div className='grid md:grid-cols-2 gap-6'>
					<div className='bg-white/10 p-5 rounded-2xl'>
						<h4 className='font-bold flex items-center space-x-2 mb-2'>
							<span className='w-6 h-6 rounded-full bg-white text-brand-orange flex items-center justify-center text-sm'>
								1
							</span>
							<span>Add a Base Word</span>
						</h4>
						<p className='text-sm text-white/80'>
							Check if the root word exists under "Base
							Words". If it doesn't, add it without specific
							dialectal tone marks (e.g. Olukọ).
						</p>
					</div>
					<div className='bg-white/10 p-5 rounded-2xl'>
						<h4 className='font-bold flex items-center space-x-2 mb-2'>
							<span className='w-6 h-6 rounded-full bg-white text-brand-orange flex items-center justify-center text-sm'>
								2
							</span>
							<span>Add carefully marked Variants</span>
						</h4>
						<p className='text-sm text-white/80'>
							Under "Variants", find your base word and add
							your fully tone-marked word, along with meaning
							and phonetic signature.
						</p>
					</div>
				</div>
			</div>

			<div>
				<div className='flex space-x-4 mb-6 border-b border-brand-ink/10 pb-2'>
					<button
						onClick={() => setOverviewTab("variants")}
						className={`pb-2 font-bold cursor-pointer transition-colors ${
							overviewTab === "variants"
								? "text-brand-orange border-b-2 border-brand-orange"
								: "text-brand-ink/40 hover:text-brand-ink"
						}`}
					>
						Variants
					</button>
					<button
						onClick={() => setOverviewTab("base-words")}
						className={`pb-2 font-bold cursor-pointer transition-colors ${
							overviewTab === "base-words"
								? "text-brand-orange border-b-2 border-brand-orange"
								: "text-brand-ink/40 hover:text-brand-ink"
						}`}
					>
						Base Words
					</button>
				</div>

				{overviewTab === "variants" && (
					<div>
						<div className='flex justify-between items-center mb-6 flex-wrap gap-4'>
							<h3 className='text-2xl font-serif font-bold'>
								My Contributions
							</h3>
							<div className='flex gap-3'>
								<select
									className='input-field appearance-none cursor-pointer text-sm py-2 px-4 bg-white border border-brand-ink/10 rounded-xl'
									style={{ width: "auto" }}
									value={contributionsFilter}
									onChange={(e) => {
										setContributionsFilter(e.target.value as any);
										setVisibleCount(INITIAL_VISIBLE);
									}}
								>
									<option value='all'>All Status</option>
									<option value='verified'>Verified</option>
									<option value='unverified'>Unverified</option>
								</select>
								<select
									className='input-field appearance-none cursor-pointer text-sm py-2 px-4 bg-white border border-brand-ink/10 rounded-xl'
									style={{ width: "auto" }}
									value={contributionsSortBy}
									onChange={(e) => {
										setContributionsSortBy(e.target.value as any);
										setVisibleCount(INITIAL_VISIBLE);
									}}
								>
									<option value='date-down'>Newest First</option>
									<option value='date-up'>Oldest First</option>
									<option value='a-z'>A - Z</option>
									<option value='z-a'>Z - A</option>
								</select>
							</div>
						</div>
						<div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
							{loadingContributions ? (
								<div className='col-span-2'>
									<Loader text='Loading contributions...' />
								</div>
							) : getSortedAndFilteredContributions().length > 0 ? (
								visibleContributions.map((contribution) => (
									<motion.div
										key={contribution.id}
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: 1 * 0.1 }}
									>
										<ContributionCard
											key={contribution.id}
											contribution={contribution}
											onEdit={setEditingVariantId}
											onDelete={deleteEntry}
										/>
									</motion.div>
								))
							) : (
								<div className='col-span-2 text-center py-12 text-brand-ink/40 font-medium'>
									No contributions yet.
								</div>
							)}
						</div>
						{hasMore && (
							<button
								onClick={handleLoadMore}
								className='w-full py-4 flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest text-brand-orange hover:bg-brand-orange/5 mt-4 rounded-xl transition-colors cursor-pointer'
							>
								<ChevronDown size={16} /> Load More
							</button>
						)}
					</div>
				)}

				{overviewTab === "base-words" && (
					<div>
						<div className='flex justify-between items-center mb-6 flex-wrap gap-4'>
							<h3 className='text-2xl font-serif font-bold'>
								My Base Words
							</h3>
							<div className='flex gap-3'>
								<select
									className='input-field appearance-none cursor-pointer text-sm py-2 px-4 bg-white border border-brand-ink/10 rounded-xl'
									style={{ width: "auto" }}
									value={overviewBaseWordsFilter}
									onChange={(e) => {
										setOverviewBaseWordsFilter(e.target.value);
										setOverviewBaseWordsVisible(LOAD_MORE_COUNT);
									}}
								>
									<option value='all'>All Letters</option>
									{availableOverviewAlphabets.map((letter) => (
										<option key={letter} value={letter}>
											Letter {letter.toUpperCase()}
										</option>
									))}
								</select>
								<select
									className='input-field appearance-none cursor-pointer text-sm py-2 px-4 bg-white border border-brand-ink/10 rounded-xl'
									style={{ width: "auto" }}
									value={overviewBaseWordsSortBy}
									onChange={(e) => {
										setOverviewBaseWordsSortBy(e.target.value as any);
										setOverviewBaseWordsVisible(LOAD_MORE_COUNT);
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
							{loadingOverviewBaseWords ? (
								<Loader text='Loading base words...' />
							) : overviewBaseWords.length > 0 ? (
								<div className='flex flex-col'>
									<ul className='divide-y divide-brand-ink/5 max-h-[60vh] overflow-y-auto'>
										{getSortedAndFilteredOverviewBaseWords()
											.slice(0, overviewBaseWordsVisible)
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
															{`${bw.syllables ?? "N/A"} syllables`}
														</span>
														{bw.note && (
															<p className='text-xs text-brand-ink/40 line-clamp-1 mt-1'>
																{bw.note}
															</p>
														)}
													</div>
													<div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
														<button
															className='text-brand-ink/40 hover:text-brand-orange cursor-pointer p-2'
															onClick={() => setEditingBaseWordId(bw.id)}
														>
															<Edit3 size={18} />
														</button>
														<button
															className='text-brand-ink/40 hover:text-red-500 cursor-pointer p-2'
															onClick={() => handleDeleteOverviewBaseWord(bw.id)}
														>
															<Trash2 size={18} />
														</button>
													</div>
												</li>
											))}
									</ul>
									{overviewBaseWordsVisible < getSortedAndFilteredOverviewBaseWords().length && (
										<div className='p-4 border-t border-brand-ink/5 bg-gray-50/50'>
											<button
												onClick={() =>
													setOverviewBaseWordsVisible((prev) => prev + LOAD_MORE_COUNT)
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
					</div>
				)}
			</div>
		</motion.div>
	);
};
