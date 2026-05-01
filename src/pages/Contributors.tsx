/** @format */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Medal, Users } from "lucide-react";
import { supabase } from "../lib/supabase";

interface ContributorCardData {
	id: string;
	fullName: string;
	email: string;
	avatarUrl: string | null;
	totalContributions: number;
	lastContributionAt: string | null;
}

type SortOption =
	| "highest"
	| "lowest"
	| "name-asc"
	| "name-desc"
	| "latest-activity";

export const Contributors: React.FC = () => {
	const [contributors, setContributors] = useState<ContributorCardData[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState<SortOption>("highest");

	useEffect(() => {
		fetchContributors();
	}, []);

	const fetchContributors = async () => {
		setLoading(true);

		const { data: entries, error: entriesError } = await supabase
			.from("lexicon_entries")
			.select("contributor_id, created_at")
			.eq("status", "approved")
			.not("contributor_id", "is", null);

		if (entriesError) {
			console.error("Error fetching contributor entries:", entriesError);
			setContributors([]);
			setLoading(false);
			return;
		}

		const contributionMap = new Map<
			string,
			{ count: number; lastContributionAt: string }
		>();

		(entries || []).forEach((entry) => {
			if (!entry.contributor_id) return;
			const existing = contributionMap.get(entry.contributor_id);

			if (existing) {
				existing.count += 1;
				if (
					new Date(entry.created_at).getTime() >
					new Date(existing.lastContributionAt).getTime()
				) {
					existing.lastContributionAt = entry.created_at;
				}
				return;
			}

			contributionMap.set(entry.contributor_id, {
				count: 1,
				lastContributionAt: entry.created_at,
			});
		});

		const contributorIds = Array.from(contributionMap.keys());

		if (contributorIds.length === 0) {
			setContributors([]);
			setLoading(false);
			return;
		}

		const { data: profiles, error: profilesError } = await supabase
			.from("profiles")
			.select("id, full_name, email, avatar_url")
			.in("id", contributorIds);

		if (profilesError) {
			console.error("Error fetching contributor profiles:", profilesError);
			setContributors([]);
			setLoading(false);
			return;
		}

		const contributorCards = (profiles || []).map((profile) => {
			const stats = contributionMap.get(profile.id);
			return {
				id: profile.id,
				fullName: profile.full_name || profile.email.split("@")[0],
				email: profile.email,
				avatarUrl: profile.avatar_url,
				totalContributions: stats?.count || 0,
				lastContributionAt: stats?.lastContributionAt || null,
			};
		});

		setContributors(contributorCards);
		setLoading(false);
	};

	const sortedContributors = useMemo(() => {
		const sorted = [...contributors];

		switch (sortBy) {
			case "highest":
				return sorted.sort(
					(a, b) => b.totalContributions - a.totalContributions,
				);
			case "lowest":
				return sorted.sort(
					(a, b) => a.totalContributions - b.totalContributions,
				);
			case "name-asc":
				return sorted.sort((a, b) =>
					a.fullName.localeCompare(b.fullName),
				);
			case "name-desc":
				return sorted.sort((a, b) =>
					b.fullName.localeCompare(a.fullName),
				);
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

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<div className='flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-8 md:space-y-0'>
				<div className='max-w-2xl'>
					<h1 className='text-4xl md:text-6xl font-serif font-bold mb-4'>
						Contributors
					</h1>
					<p className='text-brand-ink/60 text-lg'>
						Meet the people preserving Yorùbá language knowledge.
						Contributors are ranked by approved lexicon entries and can
						be sorted by contribution or activity.
					</p>
				</div>

				<div className='glass-card rounded-2xl p-5 border border-brand-ink/5 min-w-[250px]'>
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
							<span className='text-brand-ink/60'>Total Entries</span>
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
						onChange={(e) =>
							setSortBy(e.target.value as SortOption)
						}
						className='input-field py-2! px-3! w-auto! min-w-[220px]'
					>
						<option value='highest'>Highest Contribution</option>
						<option value='lowest'>Lowest Contribution</option>
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
								<div className='flex items-start justify-between mb-6'>
									<div className='flex items-center space-x-4'>
										{contributor.avatarUrl ? (
											<img
												src={contributor.avatarUrl}
												alt={contributor.fullName}
												className='w-12 h-12 rounded-xl object-cover border border-brand-ink/10'
											/>
										) : (
											<div className='w-12 h-12 rounded-xl bg-brand-orange/10 text-brand-orange font-bold flex items-center justify-center'>
												{contributor.fullName
													.charAt(0)
													.toUpperCase()}
											</div>
										)}
										<div>
											<h3 className='text-xl font-serif font-bold leading-tight'>
												{contributor.fullName}
											</h3>
											<p className='text-sm text-brand-ink/50 truncate max-w-[180px]'>
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

								<div className='space-y-3'>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-brand-ink/50 font-medium'>
											Approved entries
										</span>
										<span className='text-2xl font-bold text-brand-orange'>
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
								Contributor cards will appear here as soon as approved
								entries are added.
							</p>
						</div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};
