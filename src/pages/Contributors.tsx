/** @format */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Medal, Users } from "lucide-react";
import { supabase } from "../lib/supabase";

interface ContributorCardData {
	id: string;
	fullName: string;
	email: string;
	totalContributions: number;
	verifiedContributions: number;
	lastContributionAt: string | null;
}

type SortOption =
	| "highest-verified"
	| "lowest-verified"
	| "highest-total"
	| "lowest-total"
	| "name-asc"
	| "name-desc"
	| "latest-activity";

export const Contributors: React.FC = () => {
	const [contributors, setContributors] = useState<ContributorCardData[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState<SortOption>("highest-verified");

	useEffect(() => {
		fetchContributors();
	}, []);

	const fetchContributors = async () => {
		setLoading(true);

		const mapRpcRowToCard = (row: {
			id: string;
			full_name: string | null;
			email: string | null;
			total_contribution_count: number | string;
			verified_contribution_count: number | string;
			last_contribution_at: string | null;
		}): ContributorCardData => ({
			id: row.id,
			fullName:
				row.full_name?.trim() || row.email?.split("@")[0] || "Contributor",
			email: row.email ?? "",
			totalContributions: Number(row.total_contribution_count),
			verifiedContributions: Number(row.verified_contribution_count),
			lastContributionAt: row.last_contribution_at,
		});

		const { data, error } = (await supabase.rpc(
			"get_contributors_leaderboard",
		)) as { data: any[] | null; error: any };

		if (error) {
			console.error("Error fetching contributors:", error);
			setContributors([]);
			setLoading(false);
			return;
		}

		setContributors((data || []).map(mapRpcRowToCard));
		setLoading(false);
	};

	const sortedContributors = useMemo(() => {
		const sorted = [...contributors];

		switch (sortBy) {
			case "highest-verified":
				return sorted.sort(
					(a, b) => b.verifiedContributions - a.verifiedContributions,
				);
			case "lowest-verified":
				return sorted.sort(
					(a, b) => a.verifiedContributions - b.verifiedContributions,
				);
			case "highest-total":
				return sorted.sort(
					(a, b) => b.totalContributions - a.totalContributions,
				);
			case "lowest-total":
				return sorted.sort(
					(a, b) => a.totalContributions - b.totalContributions,
				);
			case "name-asc":
				return sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
			case "name-desc":
				return sorted.sort((a, b) => b.fullName.localeCompare(a.fullName));
			case "latest-activity":
				return sorted.sort((a, b) => {
					const aTime = a.lastContributionAt
						? new Date(a.lastContributionAt).getTime()
						: 0;
					const bTime = b.lastContributionAt
						? new Date(b.lastContributionAt).getTime()
						: 0;
					return bTime - aTime;
				});
			default:
				return sorted;
		}
	}, [contributors, sortBy]);

	const totalContributions = contributors.reduce(
		(total, contributor) => total + contributor.totalContributions,
		0,
	);

	const totalVerifiedContributions = contributors.reduce(
		(total, contributor) => total + contributor.verifiedContributions,
		0,
	);

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-8 md:space-y-0'>
				<div className='max-w-2xl'>
					<h1 className='text-4xl md:text-6xl font-serif font-bold mb-4'>
						Contributors
					</h1>
					<p className='text-brand-ink/60 text-lg'>
						Meet the people preserving Yorùbá language knowledge.
						Contributors are ranked by verified contributions and show
						both verified and total entries.
					</p>
				</div>

				<div className='glass-card rounded-2xl p-5 border border-brand-ink/5 min-w-62.5'>
					<div className='text-xs uppercase tracking-widest text-brand-ink/40 font-bold mb-2'>
						Community Snapshot
					</div>
					<div className='space-y-2'>
						<div className='flex items-center justify-between text-sm'>
							<span className='text-brand-ink/60'>Contributors</span>
							<span className='font-bold text-lg'>
								{contributors.length}
							</span>
						</div>
						<div className='flex items-center justify-between text-sm'>
							<span className='text-brand-ink/60'>Verified entries</span>
							<span className='font-bold text-lg'>
								{totalVerifiedContributions}
							</span>
						</div>
						<div className='flex items-center justify-between text-sm'>
							<span className='text-brand-ink/60'>Total entries</span>
							<span className='font-bold text-lg'>
								{totalContributions}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className='mb-8 flex items-center justify-between flex-wrap gap-4'>
				<div className='text-sm text-brand-ink/50 font-medium'>
					{loading
						? "Loading contributors..."
						: `${sortedContributors.length} contributor${sortedContributors.length === 1 ? "" : "s"} found`}
				</div>

				<div className='flex items-center gap-3'>
					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as SortOption)}
						className='input-field py-2! px-3! w-auto! min-w-55'
					>
						<option value='highest-verified'>Highest Verified</option>
						<option value='lowest-verified'>Lowest Verified</option>
						<option value='highest-total'>Highest Total</option>
						<option value='lowest-total'>Lowest Total</option>
						<option value='latest-activity'>Latest Activity</option>
						<option value='name-asc'>Name A-Z</option>
						<option value='name-desc'>Name Z-A</option>
					</select>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
				<AnimatePresence mode='popLayout'>
					{loading ? (
						Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className='h-56 rounded-2xl bg-white/30 animate-pulse border border-brand-ink/5'
							/>
						))
					) : sortedContributors.length > 0 ? (
						sortedContributors.map((contributor, index) => (
							<motion.div
								key={contributor.id}
								layout
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -12 }}
								transition={{ duration: 0.2, delay: index * 0.02 }}
								className='glass-card border border-brand-ink/5 rounded-2xl p-6 hover:border-brand-orange/30 hover:shadow-lg transition-all'
							>
								<div className='flex items-start justify-between mb-3'>
									<div className='flex items-center space-x-4'>
										<div>
											<h3 className='text-xl font-serif font-bold leading-tight truncate max-w-50'>
												{contributor.fullName}
											</h3>
											<p className='text-sm text-brand-ink/50 truncate max-w-45'>
												{contributor.email}
											</p>
										</div>
									</div>

									{index < 3 && (
										<div className='px-2.5 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-[10px] font-bold uppercase tracking-widest flex items-center gap-1'>
											<Medal size={12} />
											Top {index + 1}
										</div>
									)}
								</div>

								<div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-brand-ink/50 font-medium'>
											Verified entries
										</span>
										<span className='text-2xl font-bold text-brand-orange'>
											{contributor.verifiedContributions}
										</span>
									</div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-brand-ink/50 font-medium'>
											Total contributions
										</span>
										<span className='text-2xl font-bold text-brand-ink'>
											{contributor.totalContributions}
										</span>
									</div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-brand-ink/50 font-medium'>
											Last activity
										</span>
										<span className='font-semibold text-brand-ink/70'>
											{contributor.lastContributionAt
												? new Date(
														contributor.lastContributionAt,
													).toLocaleDateString()
												: "N/A"}
										</span>
									</div>
								</div>
							</motion.div>
						))
					) : (
						<div className='col-span-full py-20 text-center border-2 border-dashed border-brand-ink/5 rounded-3xl'>
							<Users
								size={48}
								className='mx-auto text-brand-ink/10 mb-6'
							/>
							<h3 className='text-2xl font-serif font-bold mb-2'>
								No contributors yet
							</h3>
							<p className='text-brand-ink/60'>
								Contributor cards will appear here as soon as verified
								entries are added.
							</p>
						</div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};
