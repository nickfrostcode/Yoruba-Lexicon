/** @format */

import React, { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/src/lib/supabase";
import { Modal } from "@/src/components/modals/Modal";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Loader } from "@/src/components/ui/Loader";
import { normalizeWord, getAlphabetChar } from "@/src/lib/utils";

import { YorubaKeyboard } from "@/src/components/forms/YorubaKeyboard";

type BaseWordRow = {
	word: string;
	syllables: number | null;
	note: string | null;
};

interface EditBaseWordModalProps {
	id: string | null;
	onClose: () => void;
	onSuccess: () => void;
}

export const EditBaseWordModal: React.FC<EditBaseWordModalProps> = ({
	id,
	onClose,
	onSuccess,
}) => {
	const [loading, setLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [word, setWord] = useState("");
	const [syllables, setSyllables] = useState("");
	const [note, setNote] = useState("");

	useEffect(() => {
		if (id) fetchBaseWord();
	}, [id]);

	const fetchBaseWord = async () => {
		if (!id) return;
		setLoading(true);
		const { data, error } = (await (supabase.from("base_words") as any)
			.select("*")
			.eq("id", id)
			.single()) as {
			data: BaseWordRow | null;
			error: unknown;
		};

		if (error || !data) {
			toast.error("Could not load base word");
			onClose();
		} else {
			setWord(data.word);
			setSyllables(data.syllables?.toString() || "");
			setNote(data.note || "");
		}
		setLoading(false);
	};

	const handleUpdate = async (event: FormEvent) => {
		event.preventDefault();
		if (!id) return;

		const wordTrimmed = word.trim().toLowerCase();
		if (!wordTrimmed) {
			toast.error("Word cannot be empty");
			return;
		}

		const sylCount = parseInt(syllables);
		if (isNaN(sylCount) || sylCount < 1) {
			toast.error("Syllables must be at least 1");
			return;
		}

		setIsSubmitting(true);
		const normalized = normalizeWord(wordTrimmed);
		const alphabet = getAlphabetChar(wordTrimmed);

		const { error } = await (supabase.from("base_words") as any)
			.update({
				word: wordTrimmed,
				normalized_word: normalized,
				alphabet: alphabet,
				syllables: sylCount,
				note: note ? note.trim().toLowerCase() : null,
			})
			.eq("id", id);

		setIsSubmitting(false);

		if (error) {
			toast.error("Error updating base word");
			return;
		}

		toast.success("Base Word updated successfully");
		onSuccess();
		onClose();
	};

	return (
		<Modal open={!!id} onClose={onClose} title='Edit Base Word'>
			{loading ? (
				<Loader text='Loading base word...' />
			) : (
				<form onSubmit={handleUpdate} className='p-6 space-y-6'>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
								Word (Yorùbá){" "}
								<span className='text-brand-orange'>*</span>
							</label>
							<input
								type='text'
								className='input-field'
								value={word}
								onChange={(e) => setWord(e.target.value.normalize("NFC").trim())}
								required
							/>
							<YorubaKeyboard
								baseMode={true}
								onCharClick={(char) => setWord((prev) => prev + char)}
							/>
						</div>

						<div className='space-y-2'>
							<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
								Syllables <span className='text-brand-orange'>*</span>
							</label>
							<input
								type='number'
								min='1'
								className='input-field'
								value={syllables}
								onChange={(e) => setSyllables(e.target.value.trim())}
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
								value={note}
								onChange={(e) => setNote(e.target.value.trim())}
							/>
						</div>
					</div>

					<div className='flex gap-4 pt-4'>
						<button
							type='button'
							onClick={onClose}
							className='btn-secondary flex-1 cursor-pointer'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='btn-primary flex-1 flex items-center justify-center space-x-2 cursor-pointer'
						>
							{isSubmitting ? (
								<Loader2 size={18} className='animate-spin' />
							) : (
								<Save size={18} />
							)}
							<span>Save Changes</span>
						</button>
					</div>
				</form>
			)}
		</Modal>
	);
};
