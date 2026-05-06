/** @format */

interface FilterPillItem<K extends string> {
	key: K;
	label: string;
}

interface FilterPillsProps<K extends string> {
	items: FilterPillItem<K>[];
	value: K;
	onChange: (value: K) => void;
	className?: string;
}

export const FilterPills = <K extends string>({
	items,
	value,
	onChange,
	className = "",
}: FilterPillsProps<K>) => {
	return (
		<div className={`flex flex-wrap gap-2 justify-center ${className}`}>
			{items.map(({ key, label }) => (
				<button
					key={key}
					type='button'
					onClick={() => onChange(key)}
					className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
						value === key
							? "bg-brand-orange text-white"
							: "bg-white/50 text-brand-ink/60 hover:bg-white"
					}`}
				>
					{label}
				</button>
			))}
		</div>
	);
};
