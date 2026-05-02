/** @format */

import { Save } from "lucide-react";

export interface LexiconEntryForm {
	word: string;
	phonetic: string;
	part_of_speech: string;
	definition: string;
	example_yoruba: string;
	example_english: string;
	syllables: string;
}

interface EntryFormProps {
	entry: LexiconEntryForm;
	onChange: (entry: LexiconEntryForm) => void;
	onSubmit: (event: React.FormEvent) => void;
	submitLabel: string;
	onCancel: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({
	entry,
	onChange,
	onSubmit,
	submitLabel,
	onCancel,
}) => {
	const updateField = (field: keyof LexiconEntryForm, value: string) => {
		onChange({
			...entry,
			[field]: value,
		});
	};

	return (
		<form
			onSubmit={onSubmit}
			className='p-8 max-h-[70vh] overflow-y-auto space-y-6'
		>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				<div className='space-y-2'>
					<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
						Word
					</label>
					<input
						type='text'
						className='input-field'
						placeholder='e.g. Àlàáfíà'
						value={entry.word}
						onChange={(e) => updateField("word", e.target.value)}
						required
					/>
				</div>
				<div className='space-y-2'>
					<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
						Phonetic
					</label>
					<input
						type='text'
						className='input-field'
						placeholder='e.g. /à.là.á.fí.à/'
						value={entry.phonetic}
						onChange={(e) => updateField("phonetic", e.target.value)}
					/>
				</div>
			</div>

			<div className='space-y-2'>
				<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
					Part of Speech
				</label>
				<select
					className='input-field appearance-none'
					value={entry.part_of_speech}
					onChange={(e) => updateField("part_of_speech", e.target.value)}
				>
					<option value='noun'>Orúkọ (Noun)</option>
					<option value='pronoun'>Àrọ̀pò orúkọ (Pronoun)</option>
					<option value='verb'>Òrò ìṣe (Verb)</option>
					<option value='adjective'>Àpèjúwe (Adjective)</option>
					<option value='adverb'>Àrọ̀pò òrò ìṣe (Adverb)</option>
					<option value='conjunction'>Òrò àsopò (Conjunction)</option>
					<option value='preposition'>Òrò ìbáṣepọ̀ (Preposition)</option>
					<option value='pronominal'>
						Àrọ̀pò orúkọ àfikún (Pronominal)
					</option>
				</select>
			</div>

			<div className='space-y-2'>
				<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
					Syllables
				</label>
				<input
					type='number'
					className='input-field'
					min='1'
					placeholder='e.g. 3'
					value={entry.syllables}
					onChange={(e) => updateField("syllables", e.target.value)}
				/>
			</div>

			<div className='space-y-2'>
				<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
					Definition
				</label>
				<textarea
					rows={3}
					className='input-field py-4'
					value={entry.definition}
					onChange={(e) => updateField("definition", e.target.value)}
					required
				/>
			</div>

			<div className='space-y-2'>
				<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
					Example (Yorùbá)
				</label>
				<input
					type='text'
					className='input-field'
					value={entry.example_yoruba}
					onChange={(e) => updateField("example_yoruba", e.target.value)}
				/>
			</div>

			<div className='space-y-2'>
				<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
					Example (English Translation)
				</label>
				<input
					type='text'
					className='input-field'
					value={entry.example_english}
					onChange={(e) => updateField("example_english", e.target.value)}
				/>
			</div>

			<div className='pt-4 flex flex-col sm:flex-row gap-4'>
				<button
					type='button'
					onClick={onCancel}
					className='btn-secondary flex-1'
				>
					Cancel
				</button>
				<button
					type='submit'
					className='btn-primary flex-1 flex items-center justify-center space-x-2'
				>
					<Save size={18} />
					<span>{submitLabel}</span>
				</button>
			</div>
		</form>
	);
};
