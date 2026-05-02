/** @format */

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Volume2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export interface LexiconCardEntry {
	id: string;
	base_word: string;
	syllables: number | null;
	phonetic: string | null;
	part_of_speech: string | null;
	definition: string;
	example_yoruba: string | null;
	example_english: string | null;
}

interface LexiconCardProps {
	entry: LexiconCardEntry;
}

export const LexiconCard: React.FC<LexiconCardProps> = ({ entry }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const speak = (text: string) => {
		speechSynthesis.cancel();
		const voices = speechSynthesis.getVoices();
		const yorubaVoice = voices.find((v) => v.lang === "yo-NG");

		if (yorubaVoice) {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.voice = yorubaVoice;
			utterance.lang = "yo-NG";
			speechSynthesis.speak(utterance);
			return;
		}

		toast.error("Yoruba voice not available on your device.");
	};

	return (
		<div
			className={`glass-card p-8 rounded-2xl transition-all duration-300 cursor-pointer group hover:border-brand-orange/30 ${
				isExpanded
					? "ring-2 ring-brand-orange/20 shadow-2xl"
					: "hover:shadow-lg"
			}`}
			onClick={() => setIsExpanded(!isExpanded)}
		>
			<div className='flex justify-between items-start mb-4'>
				<div>
					<h3 className='text-3xl font-serif font-bold text-brand-ink group-hover:text-brand-orange transition-colors'>
						{entry.base_word}{" "}
						<span className='text-brand-ink/40 text-sm'>
							({entry.phonetic})
						</span>
					</h3>
					<div className='flex items-center space-x-3 mt-1'>
						<span className='text-xs font-bold uppercase tracking-widest text-brand-orange'>
							{entry.part_of_speech || "N/A"}
							<span className='font-light lowercase text-brand-orange/90'>
								{" "}
								{entry.syllables
									? `| ${entry.syllables} syllables`
									: ""}
							</span>
						</span>
					</div>
				</div>
				<button
					type='button'
					className='text-brand-ink/20 hover:text-brand-orange transition-colors cursor-pointer'
					onClick={(e) => {
						e.stopPropagation();
						speak(entry.base_word);
					}}
				>
					<Volume2 size={24} />
				</button>
			</div>

			<p
				className={`text-brand-ink/70 leading-relaxed mb-6 ${
					isExpanded ? "" : "line-clamp-2"
				}`}
			>
				{entry.definition}
			</p>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className='overflow-hidden pt-4 border-t border-brand-ink/5'
					>
						<div className='space-y-6'>
							{entry.example_yoruba && (
								<div>
									<h4 className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-2'>
										Example (Yorùbá)
									</h4>
									<p className='text-lg font-serif italic text-brand-ink/80 leading-relaxed'>
										"{entry.example_yoruba}"
									</p>
								</div>
							)}
							{entry.example_english && (
								<div>
									<h4 className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-2'>
										Translation (English)
									</h4>
									<p className='text-brand-ink/60 leading-relaxed'>
										"{entry.example_english}"
									</p>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{!isExpanded && (
				<div className='flex items-center text-xs font-bold uppercase tracking-widest text-brand-ink/30 mt-4 group-hover:text-brand-orange transition-colors'>
					<span>View Details</span>
					<ChevronRight size={14} className='ml-1' />
				</div>
			)}
		</div>
	);
};
