/** @format */

import { Link } from "react-router-dom";
import { ChevronRight, Layers } from "lucide-react";
import { BrowseEntry } from "../lib/types";

interface LexiconCardProps {
	entry: BrowseEntry;
}

export const LexiconCard: React.FC<LexiconCardProps> = ({ entry }) => {
	return (
		<Link to={`/browse/${entry.id}`}
			className={`block glass-card p-8 rounded-2xl transition-all duration-300 cursor-pointer group hover:border-brand-orange/30 hover:shadow-lg`}
		>
			<div className='flex justify-between items-start mb-4'>
				<div>
					<h3 className='text-3xl font-serif font-bold text-brand-ink group-hover:text-brand-orange transition-colors'>
						{entry.word}
					</h3>
					<div className='flex items-center space-x-3 mt-2 text-brand-ink/50'>
                        <Layers size={16} />
						<span className='text-xs font-bold uppercase tracking-widest'>
							{entry.variant_count} {entry.variant_count === 1 ? "Variant" : "Variants"}
						</span>
						{entry.syllables && (
							<>
								<span className='text-brand-ink/20'>•</span>
								<span className='text-xs font-bold uppercase tracking-widest'>
									{entry.syllables} {entry.syllables === 1 ? "Syllable" : "Syllables"}
								</span>
							</>
						)}
					</div>
				</div>
			</div>

			<div className='flex items-center text-xs font-bold uppercase tracking-widest text-brand-ink/30 mt-6 group-hover:text-brand-orange transition-colors'>
				<span>View Variants</span>
				<ChevronRight size={14} className='ml-1' />
			</div>
		</Link>
	);
};
