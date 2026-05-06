import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Volume2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { LexiconEntry } from "../lib/types";

interface VariantDetailCardProps {
	variant: LexiconEntry;
	baseWordSyllables?: number;
}

export const VariantDetailCard: React.FC<VariantDetailCardProps> = ({ variant, baseWordSyllables }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const speak = (e: React.MouseEvent, text: string) => {
		e.stopPropagation();
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
			className={`glass-card p-6 rounded-2xl transition-all duration-300 cursor-pointer group hover:border-brand-orange/30 flex flex-col ${
				isExpanded
					? "ring-2 ring-brand-orange/20 shadow-2xl"
					: "hover:shadow-lg"
			}`}
			onClick={() => setIsExpanded(!isExpanded)}
		>
			<div className='flex justify-between items-start mb-4 gap-2'>
				<div className='min-w-0 flex-1'>
					<h3 className='text-3xl font-serif font-bold text-brand-ink group-hover:text-brand-orange transition-colors wrap-break-word'>
						{variant.word}{" "}
						{variant.phonetic && (
							<span className='text-brand-ink/40 text-sm'>
								({variant.phonetic})
							</span>
						)}
					</h3>
					<div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-1'>
						<span className='text-xs font-bold uppercase tracking-widest text-brand-orange'>
							{variant.part_of_speech || "N/A"}
						</span>
						{baseWordSyllables && (
							<span className='text-xs font-bold uppercase tracking-widest text-brand-ink/40'>
								• {baseWordSyllables} syllables
							</span>
						)}
					</div>
				</div>
				<button
					type='button'
					className='shrink-0 p-2 rounded-full bg-brand-ink/5 text-brand-ink/40 hover:text-brand-orange hover:bg-brand-orange/10 transition-colors cursor-pointer'
					onClick={(e) => speak(e, variant.word || "")}
				>
					<Volume2 size={18} />
				</button>
			</div>

			<p className={`text-brand-ink/70 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
				{variant.definition}
			</p>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className='overflow-hidden pt-4 border-t border-brand-ink/5 mt-4'
					>
						<div className='space-y-4'>
							{variant.example_yoruba && (
								<div>
									<h4 className='text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-1'>
										Example (Yorùbá)
									</h4>
									<p className='text-base font-serif italic text-brand-ink/80'>
										"{variant.example_yoruba}"
									</p>
								</div>
							)}
							{variant.example_english && (
								<div>
									<h4 className='text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-1'>
										Translation (English)
									</h4>
									<p className='text-sm text-brand-ink/70'>
										"{variant.example_english}"
									</p>
								</div>
							)}
						</div>
						
						{variant.profiles?.full_name && (
							<div className="mt-6 pt-4 border-t border-brand-ink/5 flex justify-end">
								<p className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/30">
									Contributed by {variant.profiles.full_name}
								</p>
							</div>
						)}
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
