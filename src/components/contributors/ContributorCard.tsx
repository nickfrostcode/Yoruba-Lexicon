import { motion } from "motion/react";
import { Medal } from "lucide-react";

export interface ContributorCardData {
	id: string;
	fullName: string;
	email: string;
	totalContributions: number;
	verifiedContributions: number;
	lastContributionAt: string | null;
}

interface ContributorCardProps {
	contributor: ContributorCardData;
	index: number;
}

export const ContributorCard: React.FC<ContributorCardProps> = ({ contributor, index }) => {
	return (
		<motion.div
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
							? new Date(contributor.lastContributionAt).toLocaleDateString()
							: "N/A"}
					</span>
				</div>
			</div>
		</motion.div>
	);
};
