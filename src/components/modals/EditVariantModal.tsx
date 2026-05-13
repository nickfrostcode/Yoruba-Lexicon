/** @format */

import React, { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/src/lib/supabase";
import { LexiconEntryForm } from "@/src/lib/types";
import { compareBaseAndVariant } from "@/src/lib/utils";

type LexiconEntryRow = {
	base_word_id: string;
	word: string;
	phonetic: string | null;
	part_of_speech: string | null;
	definition: string;
	example_yoruba: string | null;
	example_english: string | null;
};
import { EntryForm } from "@/src/components/forms/EntryForm";
import { Modal } from "@/src/components/modals/Modal";
import { toast } from "sonner";
import { Loader } from "@/src/components/ui/Loader";

interface EditVariantModalProps {
	id: string | null;
	onClose: () => void;
	onSuccess: () => void;
}

export const EditVariantModal: React.FC<EditVariantModalProps> = ({
	id,
	onClose,
	onSuccess,
}) => {
	const [loading, setLoading] = useState(false);
	const [entry, setEntry] = useState<LexiconEntryForm | null>(null);
	const [baseWord, setBaseWord] = useState<string>("");

	useEffect(() => {
		if (id) fetchEntry();
	}, [id]);

	const fetchEntry = async () => {
		if (!id) return;
		setLoading(true);
		const { data, error } = (await (supabase.from("lexicon_entries") as any)
			.select("*, base_word:base_words(id, word)")
			.eq("id", id)
			.single()) as {
			data: LexiconEntryRow & { base_word: { word: string } } | null;
			error: unknown;
		};

		if (error || !data) {
			toast.error("Could not load entry");
			onClose();
		} else {
			setEntry({
				base_word_id: data.base_word_id,
				word: data.word,
				phonetic: data.phonetic || "",
				part_of_speech: data.part_of_speech || "noun",
				definition: data.definition,
				example_yoruba: data.example_yoruba || "",
				example_english: data.example_english || "",
			});
			setBaseWord(data.base_word?.word || "");
		}
		setLoading(false);
	};

	const handleUpdate = async (event: FormEvent) => {
		event.preventDefault();
		if (!entry || !id) return;

		if (baseWord && !compareBaseAndVariant(baseWord, entry.word)) {
			toast.error("The variant must structurally match the selected base word (ignoring tones).");
			return;
		}

		const { error } = await (supabase.from("lexicon_entries") as any)
			.update({
				word: entry.word.trim().toLowerCase(),
				phonetic: entry.phonetic ? entry.phonetic.trim().toLowerCase() : null,
				part_of_speech: entry.part_of_speech,
				definition: entry.definition.trim().toLowerCase(),
				example_yoruba: entry.example_yoruba ? entry.example_yoruba.trim().toLowerCase() : null,
				example_english: entry.example_english ? entry.example_english.trim().toLowerCase() : null,
			})
			.eq("id", id);

		if (error) {
			toast.error("Error updating entry");
			return;
		}

		toast.success("Entry updated successfully");
		onSuccess();
		onClose();
	};

	return (
		<Modal open={!!id} onClose={onClose} title='Edit Variant'>
			{loading ? (
				<Loader text='Loading entry...' />
			) : entry ? (
				<EntryForm
					entry={entry}
					onChange={setEntry}
					onSubmit={handleUpdate}
					onCancel={onClose}
					submitLabel='Save Changes'
				/>
			) : null}
		</Modal>
	);
};
