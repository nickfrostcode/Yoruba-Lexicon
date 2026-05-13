import { motion } from "motion/react";
import { BookA, Layers, CheckCircle, Clock } from "lucide-react";

interface AdminOverviewProps {
	stats: {
		totalBaseWords: number;
		totalVariants: number;
		verifiedVariants: number;
		unverifiedVariants: number;
	};
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ stats }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className='space-y-8'
		>
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
				<div className='glass-card p-6 rounded-2xl border border-brand-ink/5 bg-brand-orange text-white'>
					<div className='flex flex-col items-center justify-center text-center'>
						<BookA size={32} className='mb-2 opacity-80' />
						<span className='text-4xl font-bold font-serif mb-1'>
							{stats.totalBaseWords}
						</span>
						<span className='text-sm font-bold uppercase tracking-widest opacity-80'>
							Total Base Words
						</span>
					</div>
				</div>
				<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
					<div className='flex flex-col items-center justify-center text-center'>
						<Layers
							size={32}
							className='mb-2 text-brand-orange/80'
						/>
						<span className='text-4xl font-bold font-serif mb-1'>
							{stats.totalVariants}
						</span>
						<span className='text-sm font-bold uppercase tracking-widest text-brand-ink/40'>
							Total Variants
						</span>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
				<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
					<div className='flex flex-col items-center justify-center text-center'>
						<CheckCircle
							size={24}
							className='text-green-500 mb-2'
						/>
						<span className='text-3xl font-bold font-serif mb-1 text-green-500'>
							{stats.verifiedVariants}
						</span>
						<span className='text-xs font-bold uppercase tracking-widest text-brand-ink/40'>
							Verified Variants
						</span>
					</div>
				</div>
				<div className='glass-card p-6 rounded-2xl border border-brand-ink/5'>
					<div className='flex flex-col items-center justify-center text-center'>
						<Clock
							size={24}
							className='text-brand-orange mb-2'
						/>
						<span className='text-3xl font-bold font-serif mb-1 text-brand-orange'>
							{stats.unverifiedVariants}
						</span>
						<span className='text-xs font-bold uppercase tracking-widest text-brand-ink/40'>
							Unverified Variants
						</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
};
