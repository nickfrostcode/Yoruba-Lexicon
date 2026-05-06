import React, { useState, useEffect, FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { LexiconEntryForm, LexiconEntry } from "../lib/types";
import { EntryForm } from "./EntryForm";
import { Modal } from "./Modal";
import { toast } from "sonner";
import { Loader } from "../components/Loader";

interface EditVariantModalProps {
	id: string | null;
	onClose: () => void;
	onSuccess: () => void;
}

export const EditVariantModal: React.FC<EditVariantModalProps> = ({ id, onClose, onSuccess }) => {
	const [loading, setLoading] = useState(false);
	const [entry, setEntry] = useState<LexiconEntryForm | null>(null);

	useEffect(() => {
		if (id) fetchEntry();
	}, [id]);

	const fetchEntry = async () => {
		setLoading(true);
		const { data, error } = await supabase
			.from("lexicon_entries")
			.select("*, base_word:base_words(id, word)")
			.eq("id", id)
			.single();

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
		}
		setLoading(false);
	};

	const handleUpdate = async (event: FormEvent) => {
		event.preventDefault();
		if (!entry || !id) return;

		const { error } = await supabase
			.from("lexicon_entries")
			.update({
				word: entry.word.trim(),
				phonetic: entry.phonetic,
				part_of_speech: entry.part_of_speech,
				definition: entry.definition,
				example_yoruba: entry.example_yoruba,
				example_english: entry.example_english,
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
		<Modal open={!!id} onClose={onClose} title="Edit Variant">
			{loading ? (
				<Loader text="Loading entry..." />
			) : entry ? (
				<EntryForm 
					entry={entry}
					onChange={setEntry}
					onSubmit={handleUpdate}
					onCancel={onClose}
					submitLabel="Save Changes"
				/>
			) : null}
		</Modal>
	);
};
