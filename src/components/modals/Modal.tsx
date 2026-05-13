/** @format */

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
	open,
	onClose,
	title,
	children,
}) => {
	return (
		<AnimatePresence>
			{open && (
				<div className='fixed inset-0 z-100 flex items-center justify-center p-4'>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className='absolute inset-0 bg-brand-ink/40 backdrop-blur-sm'
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						className='relative w-full max-w-2xl bg-brand-cream rounded-3xl shadow-2xl overflow-hidden'
					>
						<div className='p-8 border-b border-brand-ink/5 flex justify-between items-center'>
							<h3 className='text-2xl font-serif font-bold'>{title}</h3>
							<button
								type='button'
								onClick={onClose}
								className='p-2 rounded-xl hover:bg-brand-ink/5 text-brand-ink/40'
							>
								<X size={24} />
							</button>
						</div>
						<div>{children}</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
};
