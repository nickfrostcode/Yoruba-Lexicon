/** @format */

import React from "react";
import { Search } from "lucide-react";

interface PageHeaderProps {
	title: string;
	description: string;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	searchPlaceholder?: string;
	rightContent?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
	title,
	description,
	searchValue,
	onSearchChange,
	searchPlaceholder = "Search...",
	rightContent,
}) => {
	return (
		<div className='flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-8 md:space-y-0'>
			<div className='max-w-xl'>
				<h1 className='text-4xl md:text-6xl font-serif font-bold mb-4'>
					{title}
				</h1>
				<p className='text-brand-ink/60 text-lg'>{description}</p>
			</div>

			{onSearchChange ? (
				<div className='relative w-full md:w-96'>
					<Search
						className='absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30 z-10 pointer-events-none'
						size={20}
					/>
					<input
						type='text'
						placeholder={searchPlaceholder}
						className='input-field pl-12'
						value={searchValue}
						onChange={(e) => onSearchChange(e.target.value.normalize("NFC").trim())}
					/>
				</div>
			) : (
				rightContent && (
					<div className='w-full md:w-auto'>{rightContent}</div>
				)
			)}
		</div>
	);
};
