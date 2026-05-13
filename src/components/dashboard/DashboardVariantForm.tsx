import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Loader } from "@/src/components/ui/Loader";
import { YorubaKeyboard } from "@/src/components/forms/YorubaKeyboard";
import { Loader2, Save } from "lucide-react";
import { BaseWord, LexiconEntry } from "@/src/lib/types";
import { PARTS_OF_SPEECH, YORUBA_ALPHABET } from "@/src/lib/constants";

interface DashboardVariantFormProps {
	selectedBaseWord: BaseWord | null;
	setSelectedBaseWord: (val: BaseWord | null) => void;
	selectedLetter: string;
	setSelectedLetter: (val: string) => void;
	baseWords: BaseWord[];
	loadingBaseWords: boolean;
	existingVariants: LexiconEntry[];
	setExistingVariants: (val: LexiconEntry[]) => void;
	loadingExistingVariants: boolean;
	formData: any;
	setFormData: (val: any) => void;
	isSubmittingVariant: boolean;
	submitVariant: (e: React.FormEvent) => void;
}

export const DashboardVariantForm: React.FC<DashboardVariantFormProps> = ({
	selectedBaseWord,
	setSelectedBaseWord,
	selectedLetter,
	setSelectedLetter,
	baseWords,
	loadingBaseWords,
	existingVariants,
	setExistingVariants,
	loadingExistingVariants,
	formData,
	setFormData,
	isSubmittingVariant,
	submitVariant,
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className='space-y-6'
		>
			{!selectedBaseWord ? (
				<div className='glass-card p-8 rounded-3xl border border-brand-ink/5'>
					<h2 className='text-3xl font-serif font-bold mb-2'>
						Select a Base Word
					</h2>
					<p className='text-brand-ink/60 mb-8'>
						Choose a letter to load available base words.
					</p>

					<div className='flex flex-wrap gap-2 mb-8'>
						{YORUBA_ALPHABET.map((letter) => (
							<button
								key={letter}
								onClick={() => setSelectedLetter(letter)}
								className={`w-10 h-10 rounded-lg font-bold transition-all cursor-pointer ${
									selectedLetter === letter
										? "bg-brand-orange text-white shadow-md"
										: "bg-white border border-brand-ink/10 text-brand-ink hover:border-brand-orange/30 hover:text-brand-orange"
								}`}
							>
								{letter}
							</button>
						))}
					</div>
					<div className='text-sm font-medium'>
						{" "}
						Click on word to add variants
					</div>
					<div className='bg-white rounded-2xl border border-brand-ink/5 overflow-hidden'>
						{loadingBaseWords ? (
							<Loader text='Loading base words...' />
						) : baseWords.length > 0 ? (
							<ul className='divide-y divide-brand-ink/5'>
								{baseWords.map((bw) => (
									<li
										key={bw.id}
										onClick={() =>
											setSelectedBaseWord(bw)
										}
										className='p-4 hover:bg-brand-orange/5 cursor-pointer flex justify-between items-center transition-colors group'
									>
										<div>
											<span className='font-serif font-bold text-lg group-hover:text-brand-orange transition-colors'>
												{bw.word}
											</span>
											{bw.note && (
												<p className='text-xs text-brand-ink/40 line-clamp-1'>
													{bw.note}
												</p>
											)}
										</div>
										<Plus
											size={20}
											className='text-brand-ink/20 group-hover:text-brand-orange'
										/>
									</li>
								))}
							</ul>
						) : (
							<div className='py-12 text-center text-brand-ink/40'>
								No base words found for letter{" "}
								{selectedLetter}.
							</div>
						)}
					</div>
				</div>
			) : (
				<div className='glass-card p-8 rounded-3xl border border-brand-ink/5'>
					<div className='flex items-center justify-between mb-4 pb-4 border-b border-brand-ink/5'>
						<div>
							<h2 className='text-3xl font-serif font-bold'>
								Add Variant
							</h2>
							<p className='text-brand-ink/60'>
								For base word:{" "}
								<span className='font-bold text-brand-orange'>
									{selectedBaseWord.word}
								</span>
							</p>
						</div>
						<button
							onClick={() => {
								setSelectedBaseWord(null);
								setExistingVariants([]);
							}}
							className='text-sm font-bold uppercase tracking-widest text-brand-ink/40 hover:text-brand-orange transition-colors cursor-pointer'
						>
							Change
						</button>
					</div>

					{loadingExistingVariants ? (
						<div className='mb-6'>
							<div className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-2'>
								Loading existing variants...
							</div>
						</div>
					) : existingVariants.length > 0 ? (
						<div className='mb-6'>
							<div className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-2'>
								Existing Variants ({existingVariants.length}
								)
							</div>
							<div className='flex flex-wrap gap-2'>
								{existingVariants.map((variant) => (
									<div
										key={variant.id}
										className={`px-3 py-1 rounded-full text-xs font-medium ${
											variant.status === "verified"
												? "bg-green-100 text-green-700 border border-green-200"
												: "bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
										}`}
									>
										{variant.word}
										{variant.status === "verified" && (
											<span className='ml-1 text-green-600'>
												✓
											</span>
										)}
									</div>
								))}
							</div>
						</div>
					) : (
						<div className='mb-6'>
							<div className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-2'>
								Existing Variants (0)
							</div>
							<div className='text-sm text-brand-ink/40'>
								No variants exist for this base word yet.
								Be the first!
							</div>
						</div>
					)}

					<div className='bg-brand-orange/10 p-4 rounded-xl border border-brand-orange/20 mb-8'>
						<h4 className='font-bold text-brand-orange mb-2 uppercase tracking-widest text-xs'>
							Tone Marking Guidelines
						</h4>
						<p className='text-sm text-brand-ink/80 leading-relaxed'>
							Unlike the base word, the variant{" "}
							<strong>must</strong> include the precise tone
							marks (´, `, etc.) that define its specific
							pronunciation and meaning. Example:{" "}
							<em>Olùkọ́</em>.
						</p>
					</div>

					<form onSubmit={submitVariant} className='space-y-6'>
						<div className='grid md:grid-cols-2 gap-6'>
							<div className='space-y-2 md:col-span-2'>
								<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
									Fully Tone-Marked Word{" "}
									<span className='text-brand-orange'>
										*
									</span>
								</label>
								<input
									type='text'
									className='input-field'
									placeholder='e.g. Olùkọ́'
									value={formData.word}
									onChange={(e) =>
										setFormData({
											...formData,
											word: e.target.value.normalize("NFC").trim(),
										})
									}
									required
								/>
								<YorubaKeyboard
									onCharClick={(char) => setFormData({ ...formData, word: formData.word + char })}
								/>
							</div>

							<div className='space-y-2'>
								<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
									Phonetic Signature (Optional)
								</label>
								<input
									type='text'
									className='input-field'
									placeholder='e.g. m-d-r'
									pattern='^[drm](-[drm])*$'
									title='Only use d, r, m and hyphens (e.g. m-d-r)'
									value={formData.phonetic}
									onChange={(e) =>
										setFormData({
											...formData,
											phonetic: e.target.value.normalize("NFC").trim(),
										})
									}
								/>
								<p className='text-[10px] text-brand-ink/40 ml-1'>
									Use 'd' (low), 'r' (mid), 'm' (high).
								</p>
							</div>

							<div className='space-y-2'>
								<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
									Part of Speech{" "}
									<span className='text-brand-orange'>
										*
									</span>
								</label>
								<select
									className='input-field appearance-none cursor-pointer'
									value={formData.part_of_speech}
									onChange={(e) =>
										setFormData({
											...formData,
											part_of_speech: e.target.value,
										})
									}
									required
								>
									{PARTS_OF_SPEECH.map((pos) => (
										<option
											key={pos.value}
											value={pos.value}
										>
											{pos.label}
										</option>
									))}
								</select>
							</div>

							<div className='space-y-2 md:col-span-2'>
								<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
									Definition{" "}
									<span className='text-brand-orange'>
										*
									</span>
								</label>
								<textarea
									rows={2}
									className='input-field py-3'
									placeholder='Provide a clear definition in English...'
									value={formData.definition}
									onChange={(e) =>
										setFormData({
											...formData,
											definition: e.target.value.normalize("NFC"),
										})
									}
									required
								/>
							</div>

							<div className='space-y-2'>
								<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
									Example (Yorùbá)
								</label>
								<textarea
									rows={2}
									className='input-field py-3'
									placeholder='e.g. Òlùkọ̀ mi dùn'
									value={formData.example_yoruba}
									onChange={(e) =>
										setFormData({
											...formData,
											example_yoruba: e.target.value.normalize("NFC"),
										})
									}
								/>
							</div>

							<div className='space-y-2'>
								<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
									Translation (English)
								</label>
								<textarea
									rows={2}
									className='input-field py-3'
									placeholder='e.g. My teacher is nice'
									value={formData.example_english}
									onChange={(e) =>
										setFormData({
											...formData,
											example_english: e.target.value.normalize("NFC"),
										})
									}
								/>
							</div>
						</div>

						<button
							type='submit'
							disabled={isSubmittingVariant}
							className='btn-primary w-full flex items-center justify-center space-x-2 mt-4'
						>
							{isSubmittingVariant ? (
								<Loader2
									size={20}
									className='animate-spin'
								/>
							) : (
								<Save size={20} />
							)}
							<span>Submit Variant</span>
						</button>
					</form>
				</div>
			)}
		</motion.div>
	);
};
