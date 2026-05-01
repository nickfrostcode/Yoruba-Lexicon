/** @format */

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	Menu,
	X,
	User,
	BookOpen,
	Users,
	LayoutDashboard,
	ShieldCheck,
	LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { user, isAdmin, signOut } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const navLinks = [
		{ name: "Browse", path: "/browse", icon: BookOpen },
		{ name: "Contributors", path: "/contributors", icon: Users },
	];

	if (user) {
		navLinks.push({
			name: "Dashboard",
			path: "/dashboard",
			icon: LayoutDashboard,
		});
	}

	if (user && isAdmin) {
		navLinks.push({ name: "Admin", path: "/admin", icon: ShieldCheck });
	}

	const handleSignOut = async () => {
		await signOut();
		navigate("/", { replace: true });
		setIsOpen(false);
	};

	return (
		<nav className='sticky top-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-ink/5'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between h-20'>
					<div className='flex items-center'>
						<Link to='/' className='flex items-center space-x-2'>
							<span className='text-2xl font-serif font-bold text-brand-orange'>
								Yorùbá Lexicon
							</span>
						</Link>
					</div>

					<div className='hidden md:flex items-center space-x-8'>
						{navLinks.map((link) => (
							<Link
								key={link.path}
								to={link.path}
								className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-brand-orange ${
									location.pathname === link.path
										? "text-brand-orange"
										: "text-brand-ink/70"
								}`}
							>
								<link.icon size={18} />
								<span>{link.name}</span>
							</Link>
						))}
						{user ? (
							<button
								type='button'
								onClick={handleSignOut}
								className='btn-secondary py-2 px-5 text-sm flex items-center space-x-2'
							>
								<LogOut size={16} />
								<span>Sign Out</span>
							</button>
						) : (
							<Link
								to='/auth'
								className='btn-primary py-2 px-5 text-sm flex items-center space-x-2'
							>
								<User size={16} />
								<span>Sign In</span>
							</Link>
						)}
					</div>

					<div className='md:hidden flex items-center'>
						<button
							type='button'
							onClick={() => setIsOpen(!isOpen)}
							className='text-brand-ink p-2 rounded-md hover:bg-brand-ink/5'
						>
							{isOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					</div>
				</div>
			</div>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className='md:hidden bg-brand-cream border-b border-brand-ink/5 overflow-hidden'
					>
						<div className='px-4 pt-2 pb-6 space-y-2'>
							{navLinks.map((link) => (
								<Link
									key={link.path}
									to={link.path}
									onClick={() => setIsOpen(false)}
									className='flex items-center space-x-3 px-3 py-4 rounded-xl text-base font-medium text-brand-ink/70 hover:bg-brand-ink/5 hover:text-brand-orange'
								>
									<link.icon size={20} />
									<span>{link.name}</span>
								</Link>
							))}
							<div className='pt-4'>
								{user ? (
									<button
										type='button'
										onClick={handleSignOut}
										className='btn-secondary w-full text-center flex items-center justify-center space-x-2 py-3 rounded-xl'
									>
										<LogOut size={18} />
										<span>Sign Out</span>
									</button>
								) : (
									<Link
										to='/auth'
										onClick={() => setIsOpen(false)}
										className='btn-primary w-full text-center flex items-center justify-center space-x-2'
									>
										<User size={18} />
										<span>Sign In</span>
									</Link>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
};
