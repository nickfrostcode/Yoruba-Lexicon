/** @format */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ChevronLeft } from "lucide-react";
import { Loader } from "../components/Loader";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { BaseWord, LexiconEntry } from "../lib/types";
import { VariantDetailCard } from "../components/VariantDetailCard";

export const BaseWordDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [baseWord, setBaseWord] = useState<BaseWord | null>(null);
	const [variants, setVariants] = useState<LexiconEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (id) {
			fetchWordDetails();
		}
	}, [id]);

	const fetchWordDetails = async () => {
		if (!id) {
			setLoading(false);
			return;
		}
		setLoading(true);

		// Fetch Base Word
		const { data: bData, error: bError } = await supabase
			.from("base_words")
			.select("*")
			.eq("id", id)
			.single();

		if (bError) {
			console.error("Error fetching base word:", bError);
			toast.error("Word not found.");
			setLoading(false);
			return;
		}

		setBaseWord(bData);

		// Fetch Approved Variants for this base word
		const { data: vData, error: vError } = await supabase
			.from("lexicon_entries")
			.select("*, profiles!lexicon_entries_contributor_id_fkey(full_name)")
			.eq("base_word_id", id ?? "")
			.eq("status", "approved")
			.order("created_at", { ascending: false });

		if (!vError && vData) {
			setVariants(vData);
		}

		setLoading(false);
	};

	if (loading) {
		return <Loader text='Loading details...' className='h-[50vh]' />;
	}

	if (!baseWord) {
		return (
			<div className='max-w-4xl mx-auto px-4 py-24 text-center'>
				<h2 className='text-3xl font-serif font-bold text-brand-ink mb-4'>
					Word Details Unavailable
				</h2>
				<Link
					to='/browse'
					className='btn-primary inline-flex items-center space-x-2'
				>
					<ChevronLeft size={16} />
					<span>Back to Browse</span>
				</Link>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<Link
				to='/browse'
				className='inline-flex items-center space-x-2 text-brand-ink/40 hover:text-brand-orange transition-colors font-bold uppercase tracking-widest text-xs mb-8'
			>
				<ChevronLeft size={14} />
				<span>Back to Browse</span>
			</Link>

			<div className='mb-12'>
				<h1 className='text-5xl md:text-7xl font-serif font-bold mb-4 text-brand-ink'>
					{baseWord.word}
				</h1>
				{baseWord.note && (
					<div className='mt-6 p-4 rounded-xl bg-brand-orange/5 border border-brand-orange/10'>
						<p className='text-sm font-bold uppercase tracking-widest text-brand-orange/60 mb-1'>
							Editor's Note
						</p>
						<p className='text-brand-ink/80 italic'>{baseWord.note}</p>
					</div>
				)}
			</div>

			<div className='space-y-8'>
				<h2 className='text-xl font-bold uppercase tracking-widest text-brand-ink/30 border-b border-brand-ink/10 pb-4'>
					Variants & Meanings ({variants.length})
				</h2>

				<AnimatePresence>
					{variants.length > 0 ? (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							{variants.map((variant, index) => (
								<motion.div
									key={variant.id}
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.1 }}
								>
									<VariantDetailCard
										variant={variant}
										baseWordSyllables={
											baseWord.syllables ?? undefined
										}
									/>
								</motion.div>
							))}
						</div>
					) : (
						<div className='text-center py-16 bg-white/30 rounded-3xl border-2 border-dashed border-brand-ink/5'>
							<p className='text-brand-ink/50 text-lg'>
								No approved variants found for this word.
							</p>
						</div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};
