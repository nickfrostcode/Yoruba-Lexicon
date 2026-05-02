/** @format */

import { FormEvent, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { PageHeader } from "../components/PageHeader";
import { FilterPills } from "../components/FilterPills";
import { Pagination } from "../components/Pagination";
import { Modal } from "../components/Modal";
import { EntryForm, LexiconEntryForm } from "../components/EntryForm";
import { AdminLexiconCard } from "../components/AdminLexiconCard";

interface Entry {
	id: string;
	word: string;
	syllables: number | null;
	phonetic: string | null;
	part_of_speech: string | null;
	definition: string;
	example_yoruba: string | null;
	example_english: string | null;
	status: "pending" | "approved";
	created_at: string;
	contributor_id: string | null;
}

const ITEMS_PER_PAGE = 12;

export const Admin = () => {
	const [entries, setEntries] = useState<Entry[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

	const statusFilters = [
		{ key: "all", label: "All" },
		{ key: "pending", label: "Pending" },
		{ key: "approved", label: "Approved" },
	];

	useEffect(() => {
		fetchEntries();
	}, []);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filter]);

	const fetchEntries = async () => {
		setLoading(true);
		const { data, error } = await (supabase.from("lexicon_entries") as any)
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching entries:", error);
		} else {
			setEntries(data || []);
		}

		setLoading(false);
	};

	const handleApprove = async (id: string) => {
		const { error } = await (supabase.from("lexicon_entries") as any)
			.update({ status: "approved" })
			.eq("id", id);

		if (error) {
			toast.error("Error approving entry");
			return;
		}

		setEntries((current) =>
			current.map((entry) =>
				entry.id === id ? { ...entry, status: "approved" } : entry,
			),
		);

		toast.success("Entry approved");
	};

	const handleUpdate = async (event: FormEvent) => {
		event.preventDefault();
		if (!editingEntry) return;

		const syllables = parseInt(editingEntry.syllables?.toString() || "0");
		if (syllables < 1) {
			toast.error("Syllable count must be at least 1.");
			return;
		}

		const { error } = await (supabase.from("lexicon_entries") as any)
			.update({
				word: editingEntry.word,
				phonetic: editingEntry.phonetic,
				part_of_speech: editingEntry.part_of_speech,
				definition: editingEntry.definition,
				example_yoruba: editingEntry.example_yoruba,
				example_english: editingEntry.example_english,
				syllables,
			})
			.eq("id", editingEntry.id);

		if (error) {
			toast.error("Error updating entry");
			return;
		}

		setEntries((current) =>
			current.map((entry) =>
				entry.id === editingEntry.id ? editingEntry : entry,
			),
		);

		setEditingEntry(null);
		toast.success("Entry updated");
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this entry?")) return;

		const { error } = await (supabase.from("lexicon_entries") as any)
			.delete()
			.eq("id", id);

		if (error) {
			toast.error("Error deleting entry");
			return;
		}

		setEntries((current) => current.filter((entry) => entry.id !== id));
		toast.success("Entry deleted");
	};

	const filteredEntries = entries.filter((entry) => {
		const matchesFilter = filter === "all" || entry.status === filter;
		const matchesSearch =
			entry.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
			entry.definition.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesFilter && matchesSearch;
	});

	const totalPages = Math.max(
		1,
		Math.ceil(filteredEntries.length / ITEMS_PER_PAGE),
	);
	const paginatedEntries = filteredEntries.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleEditFormChange = (form: LexiconEntryForm) => {
		if (!editingEntry) return;
		setEditingEntry({
			...editingEntry,
			...form,
			syllables: parseInt(form.syllables) || null,
		});
	};

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			<PageHeader
				title='Admin Console'
				description='Review, edit, and approve community contributions. Layout matches the archive browse experience.'
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				searchPlaceholder='Search for a word or definition...'
			/>

			<div className='mb-12'>
				<FilterPills
					items={statusFilters}
					value={filter}
					onChange={setFilter}
				/>
			</div>

			{!loading && filteredEntries.length > 0 && (
				<div className='mb-6 flex items-center justify-between flex-wrap gap-2'>
					<p className='text-sm text-brand-ink/40 font-medium'>
						Showing{" "}
						<span className='text-brand-ink/70 font-bold'>
							{(currentPage - 1) * ITEMS_PER_PAGE + 1}–
							{Math.min(
								currentPage * ITEMS_PER_PAGE,
								filteredEntries.length,
							)}
						</span>{" "}
						of{" "}
						<span className='text-brand-ink/70 font-bold'>
							{filteredEntries.length}
						</span>{" "}
						{filteredEntries.length === 1 ? "entry" : "entries"}
					</p>
					<p className='text-sm text-brand-ink/40'>
						Page {currentPage} of {totalPages}
					</p>
				</div>
			)}

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
				<AnimatePresence mode='popLayout'>
					{loading ? (
						Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
							<div
								key={index}
								className='h-64 rounded-2xl bg-white/30 animate-pulse border border-brand-ink/5'
							/>
						))
					) : paginatedEntries.length > 0 ? (
						paginatedEntries.map((entry, index) => (
							<motion.div
								key={entry.id}
								layout
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{ duration: 0.2, delay: index * 0.03 }}
							>
								<AdminLexiconCard
									entry={entry}
									onApprove={handleApprove}
									onEdit={setEditingEntry}
									onDelete={handleDelete}
								/>
							</motion.div>
						))
					) : (
						<div className='col-span-full py-24 text-center'>
							<ShieldCheck
								size={48}
								className='mx-auto text-brand-ink/10 mb-6'
							/>
							<h3 className='text-2xl font-serif font-bold mb-2'>
								No entries found
							</h3>
							<p className='text-brand-ink/60'>
								Try adjusting your filters or search terms.
							</p>
						</div>
					)}
				</AnimatePresence>
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
			/>

			<Modal
				open={Boolean(editingEntry)}
				onClose={() => setEditingEntry(null)}
				title='Edit Entry'
			>
				{editingEntry && (
					<EntryForm
						entry={{
							word: editingEntry.word,
							phonetic: editingEntry.phonetic || "",
							part_of_speech: editingEntry.part_of_speech || "noun",
							definition: editingEntry.definition,
							example_yoruba: editingEntry.example_yoruba || "",
							example_english: editingEntry.example_english || "",
							syllables: editingEntry.syllables?.toString() || "",
						}}
						onChange={handleEditFormChange}
						onSubmit={handleUpdate}
						onCancel={() => setEditingEntry(null)}
						submitLabel='Save Changes'
					/>
				)}
			</Modal>
		</div>
	);
};
