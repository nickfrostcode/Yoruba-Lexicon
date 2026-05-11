/** @format */

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
	CheckCircle,
	Edit3,
	Trash2,
	ChevronRight,
	XCircle,
} from "lucide-react";
import { LexiconEntry } from "@/src/lib/types";

interface AdminLexiconCardProps {
	entry: LexiconEntry;
	onApprove: (id: string) => void;
	onUnverify: (id: string) => void;
	onEdit: (entry: LexiconEntry) => void;
	onDelete: (id: string) => void;
}

export const AdminLexiconCard: React.FC<AdminLexiconCardProps> = ({
	entry,
	onApprove,
	onUnverify,
	onEdit,
	onDelete,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	return (
		<div
			className={`relative glass-card p-6 rounded-2xl transition-all duration-300 cursor-pointer group hover:border-brand-orange/30 flex flex-col ${
				isExpanded
					? "ring-2 ring-brand-orange/20 shadow-2xl"
					: "hover:shadow-lg"
			}`}
			onClick={() => setIsExpanded(!isExpanded)}
		>
			<div className='flex justify-between items-start mb-4 gap-2'>
				<div className='min-w-0 flex-1'>
					<h3 className='text-3xl font-serif font-bold text-brand-ink group-hover:text-brand-orange transition-colors wrap-break-word'>
						{entry.word}{" "}
						{entry.phonetic && (
							<span className='text-brand-ink/40 text-sm'>
								({entry.phonetic})
							</span>
						)}
					</h3>
					<div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-1'>
						<span className='text-xs font-bold uppercase tracking-widest text-brand-orange'>
							{entry.part_of_speech || "N/A"}
						</span> 
					</div>
				</div>

				<div
					className='flex items-center gap-1 shrink-0'
					onClick={(e) => e.stopPropagation()}
				>
					{entry.status === "unverified" && (
						<button
							type='button'
							onClick={() => onApprove(entry.id)}
							className='p-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors'
							title='Verify'
						>
							<CheckCircle size={18} />
						</button>
					)}
					{entry.status === "verified" && (
						<button
							type='button'
							onClick={() => onUnverify(entry.id)}
							className='p-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors'
							title='Unverify'
						>
							<XCircle size={18} />
						</button>
					)}
					<button
						type='button'
						onClick={() => onEdit(entry)}
						className='p-2 rounded-xl bg-brand-ink text-white hover:bg-brand-ink/80 transition-colors'
						title='Edit'
					>
						<Edit3 size={18} />
					</button>
					<button
						type='button'
						onClick={() => onDelete(entry.id)}
						className='p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors'
						title='Delete'
					>
						<Trash2 size={18} />
					</button>
				</div>
			</div>

			<p
				className={`text-brand-ink/70 leading-relaxed mb-4 ${isExpanded ? "" : "line-clamp-2"}`}
			>
				{entry.definition}
			</p>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className='overflow-hidden pt-4 border-t border-brand-ink/5'
					>
						<div className='space-y-6'>
							{entry.example_yoruba && (
								<div>
									<h4 className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-2'>
										Example (Yorùbá)
									</h4>
									<p className='text-lg font-serif italic text-brand-ink/80 leading-relaxed'>
										"{entry.example_yoruba}"
									</p>
								</div>
							)}
							{entry.example_english && (
								<div>
									<h4 className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-2'>
										Translation (English)
									</h4>
									<p className='text-brand-ink/60 leading-relaxed'>
										"{entry.example_english}"
									</p>
								</div>
							)}
						</div>

						<div className='mt-6 pt-4 border-t border-brand-ink/5 flex items-center'>
							<p className='text-xs font-medium text-brand-ink/40'>
								{new Date(entry.created_at).toLocaleDateString()}
							</p>
							{entry.profiles?.full_name && (
								<p className='text-[10px] font-bold uppercase tracking-widest text-brand-ink/30 truncate max-w-50 ml-4'>
									by {entry.profiles.full_name}
								</p>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{!isExpanded && (
				<div className='flex items-center text-xs font-bold uppercase tracking-widest text-brand-ink/30 mt-2 group-hover:text-brand-orange transition-colors'>
					<span>More Details</span>
					<ChevronRight size={14} className='ml-1' />
				</div>
			)}

			<div
				className={`absolute bottom-6 right-6 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
					entry.status === "verified"
						? "bg-green-100 text-green-600"
						: "bg-brand-orange/10 text-brand-orange"
				}`}
			>
				{entry.status}
			</div>
		</div>
	);
};
