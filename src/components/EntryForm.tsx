/** @format */

import { Save } from "lucide-react";
import { LexiconEntryForm } from "../lib/types";
import { BaseWordAutocomplete } from "./BaseWordAutocomplete";

import { PARTS_OF_SPEECH } from "../lib/constants";

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
			className='p-6 max-h-[75vh] overflow-y-auto space-y-6'
		>
			<div className='grid grid-cols-1 gap-4'>
				<div className='space-y-2'>
					<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
						Variant Word (Tone-Marked) <span className='text-brand-orange'>*</span>
					</label>
					<input
						type='text'
						className='input-field'
						placeholder='e.g. Olùkọ́'
						value={entry.word}
						onChange={(e) => updateField("word", e.target.value)}
						required
					/>
				</div>

				<div className='space-y-2'>
					<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
						Definition <span className='text-brand-orange'>*</span>
					</label>
					<textarea
						rows={3}
						className='input-field py-3'
						placeholder='Provide a clear definition in English...'
						value={entry.definition}
						onChange={(e) => updateField("definition", e.target.value)}
						required
					/>
				</div>

				<div className='space-y-2'>
					<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
						Part of Speech <span className='text-brand-orange'>*</span>
					</label>
					<select
						className='input-field appearance-none'
						value={entry.part_of_speech}
						onChange={(e) =>
							updateField("part_of_speech", e.target.value)
						}
						required
					>
						{PARTS_OF_SPEECH.map((pos) => (
							<option key={pos.value} value={pos.value}>
								{pos.label}
							</option>
						))}
					</select>
				</div>

				<div className='space-y-2'>
					<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
						Phonetic Signature
					</label>
					<input
						type='text'
						className='input-field'
						placeholder='e.g. m-d-r'
						value={entry.phonetic}
						onChange={(e) => updateField("phonetic", e.target.value)}
					/>
				</div>

				<div className='space-y-2'>
					<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
						Example (Yorùbá)
					</label>
					<input
						type='text'
						className='input-field'
						placeholder='e.g. Òlùkọ̀ mi dùn'
						value={entry.example_yoruba}
						onChange={(e) =>
							updateField("example_yoruba", e.target.value)
						}
					/>
				</div>

				<div className='space-y-2'>
					<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
						Example (English Translation)
					</label>
					<input
						type='text'
						className='input-field'
						placeholder='e.g. My teacher is nice'
						value={entry.example_english}
						onChange={(e) =>
							updateField("example_english", e.target.value)
						}
					/>
				</div>

				<div className='pt-4 flex flex-col md:flex-row gap-4'>
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
			</div>
		</form>
	);
};
