import { motion } from "motion/react";
import { Loader2, Save } from "lucide-react";
import { YorubaKeyboard } from "@/src/components/forms/YorubaKeyboard";

interface DashboardBaseWordFormProps {
	submitBaseWord: (e: React.FormEvent) => void;
	baseWordInput: string;
	setBaseWordInput: (val: string | ((prev: string) => string)) => void;
	baseWordSyllables: string;
	setBaseWordSyllables: (val: string) => void;
	baseWordNote: string;
	setBaseWordNote: (val: string) => void;
	isSubmittingBaseWord: boolean;
}

export const DashboardBaseWordForm: React.FC<DashboardBaseWordFormProps> = ({
	submitBaseWord,
	baseWordInput,
	setBaseWordInput,
	baseWordSyllables,
	setBaseWordSyllables,
	baseWordNote,
	setBaseWordNote,
	isSubmittingBaseWord,
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className='glass-card p-8 rounded-3xl border border-brand-ink/5'
		>
			<h2 className='text-3xl font-serif font-bold mb-2'>
				Add Base Word
			</h2>
			<p className='text-brand-ink/60 mb-8'>
				Register a root word before adding dialectal or
				tone-specific variants.
			</p>

			<div className='bg-brand-orange/10 p-4 rounded-xl border border-brand-orange/20 mb-8'>
				<h4 className='font-bold text-brand-orange mb-2 uppercase tracking-widest text-xs'>
					Important Guidelines
				</h4>
				<ul className='list-disc list-inside text-sm text-brand-ink/80 space-y-1'>
					<li>
						Use accurate sub-dotted letters:{" "}
						<strong>ẹ, ọ, ṣ</strong>. Do not use standard e,
						o, s if they shouldn't be.
					</li>
					<li>
						Do <strong>not</strong> include tone marks (á, à)
						on the base word unless the root naturally
						requires it to distinguish meaning globally.
					</li>
					<li>
						The syllable count is registered at the base word
						level.
					</li>
				</ul>
			</div>

			<form onSubmit={submitBaseWord} className='space-y-6'>
				<div className='space-y-2'>
					<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
						Word (Yorùbá){" "}
						<span className='text-brand-orange'>*</span>
					</label>
					<input
						type='text'
						className='input-field'
						placeholder='e.g. Olukọ'
						value={baseWordInput}
						onChange={(e) =>
							setBaseWordInput(
								e.target.value.normalize("NFC").trim(),
							)
						}
						required
					/>
					<YorubaKeyboard
						baseMode={true}
						onCharClick={(char) =>
							setBaseWordInput((prev) => prev + char)
						}
					/>
				</div>

				<div className='space-y-2'>
					<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
						Syllables{" "}
						<span className='text-brand-orange'>*</span>
					</label>
					<input
						type='number'
						min='1'
						className='input-field'
						placeholder='e.g. 3'
						value={baseWordSyllables}
						onChange={(e) =>
							setBaseWordSyllables(e.target.value.trim())
						}
						required
					/>
				</div>

				<div className='space-y-2'>
					<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
						Note (Optional)
					</label>
					<textarea
						rows={2}
						className='input-field py-3'
						placeholder='Any etymological or historical notes...'
						value={baseWordNote}
						onChange={(e) => setBaseWordNote(e.target.value)}
					/>
				</div>

				<button
					type='submit'
					disabled={isSubmittingBaseWord}
					className='btn-primary w-full flex items-center justify-center space-x-2'
				>
					{isSubmittingBaseWord ? (
						<Loader2 size={20} className='animate-spin' />
					) : (
						<Save size={20} />
					)}
					<span>Save Base Word</span>
				</button>
			</form>
		</motion.div>
	);
};
