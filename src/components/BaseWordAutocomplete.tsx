import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { BaseWord } from "../lib/types";

interface BaseWordAutocompleteProps {
	value: string; // The selected base_word_id
	onChange: (id: string) => void;
}

export const BaseWordAutocomplete: React.FC<BaseWordAutocompleteProps> = ({
	value,
	onChange,
}) => {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<BaseWord[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedWord, setSelectedWord] = useState<BaseWord | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Fetch initial selected value details
	useEffect(() => {
		if (value && !selectedWord) {
			supabase
				.from("base_words")
				.select("*")
				.eq("id", value)
				.single()
				.then(({ data }) => {
					if (data) setSelectedWord(data);
				});
		} else if (!value) {
			setSelectedWord(null);
		}
	}, [value, selectedWord]);

	// Search
	useEffect(() => {
		if (!open) return;
		const search = async () => {
			setLoading(true);
			let q = supabase.from("base_words").select("*").limit(20);

			if (query) {
				q = q.ilike("normalized_word", `%${query}%`);
			}

			const { data, error } = await q;
			if (!error && data) {
				setResults(data);
			}
			setLoading(false);
		};

		const debounce = setTimeout(search, 300);
		return () => clearTimeout(debounce);
	}, [query, open]);

	return (
		<div className="relative" ref={containerRef}>
			<div
				role="combobox"
				aria-expanded={open}
				className="input-field flex items-center justify-between cursor-pointer"
				onClick={() => {
					setOpen(!open);
					setQuery("");
				}}
			>
				<span className={selectedWord ? "text-brand-ink" : "text-brand-ink/40"}>
					{selectedWord ? selectedWord.word : "Select a base word..."}
				</span>
				<ChevronsUpDown size={16} className="text-brand-ink/40" />
			</div>

			{open && (
				<div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto bg-white rounded-xl border border-brand-ink/10 shadow-lg p-1">
					<div className="sticky top-0 bg-white p-2">
						<input
							type="text"
							className="w-full bg-brand-ink/5 border-none rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
							placeholder="Search base words..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onClick={(e) => e.stopPropagation()}
						/>
					</div>
					
					{loading ? (
						<div className="p-4 flex justify-center text-brand-ink/40">
							<Loader2 size={18} className="animate-spin" />
						</div>
					) : results.length === 0 ? (
						<div className="p-4 text-center text-sm text-brand-ink/50">
							No base words found.
						</div>
					) : (
						<ul className="space-y-1 p-1">
							{results.map((word) => (
								<li
									key={word.id}
									className={`px-3 py-2 rounded-lg cursor-pointer text-sm flex items-center justify-between hover:bg-brand-orange/10 ${
										value === word.id ? "bg-brand-orange/5 font-semibold text-brand-orange" : ""
									}`}
									onClick={() => {
										onChange(word.id);
										setSelectedWord(word);
										setOpen(false);
									}}
								>
									{word.word}
									{value === word.id && <Check size={16} />}
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
};
