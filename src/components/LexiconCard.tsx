/** @format */

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { BrowseEntry } from "../lib/types";

interface LexiconCardProps {
	entry: BrowseEntry;
}

export const LexiconCard: React.FC<LexiconCardProps> = ({ entry }) => {
	return (
		<Link
			to={`/browse/${entry.id}`}
			className={`block glass-card p-8 rounded-2xl transition-all duration-300 cursor-pointer group hover:border-brand-orange/30 hover:shadow-md`}
		>
			<div className='flex justify-between items-start mb-4'>
				<div>
					<div className='flex items-center gap-3'>
						<h3 className='text-3xl font-serif font-bold text-brand-ink group-hover:text-brand-orange transition-colors'>
							{entry.word}
						</h3>
						{entry.syllables && (
							<span className='text-xs font-bold uppercase tracking-widest text-brand-ink/50'>
								({entry.syllables}{" "}
								{entry.syllables === 1 ? "Syllable" : "Syllables"})
							</span>
						)}
					</div>
				</div>
			</div>
			<div className='flex items-center text-xs font-bold uppercase tracking-widest text-brand-ink/30 mt-4 group-hover:text-brand-orange transition-colors'>
				{entry.variant_count}{" "}
				{entry.variant_count === 1 ? "Variant" : "Variants"}
				<ChevronRight size={14} className='ml-1' />
			</div>
		</Link>
	);
};
