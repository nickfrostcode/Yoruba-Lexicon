/** @format */

import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	Menu,
	X,
	BookOpen,
	Users,
	LayoutDashboard,
	ShieldCheck,
	LogOut,
	ChevronDown,
	User,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const { user, isAdmin, signOut } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const profileRef = useRef<HTMLDivElement>(null);

	const navLinks = [
		{ name: "Browse", path: "/browse", icon: BookOpen },
		{ name: "Contributors", path: "/contributors", icon: Users },
		...(user
			? [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }]
			: []),
		...(user && isAdmin
			? [{ name: "Admin", path: "/admin", icon: ShieldCheck }]
			: []),
	];

	// Close profile dropdown on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (
				profileRef.current &&
				!profileRef.current.contains(e.target as Node)
			) {
				setIsProfileOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	// Close mobile menu on route change
	useEffect(() => {
		setIsOpen(false);
		setIsProfileOpen(false);
	}, [location.pathname]);

	const handleSignOut = async () => {
		await signOut();
		navigate("/", { replace: true });
		setIsOpen(false);
		setIsProfileOpen(false);
	};

	// Get initials from name or email
	const getInitials = () => {
		if (user?.full_name) {
			return user.full_name
				.split(" ")
				.map((n: string) => n[0])
				.slice(0, 2)
				.join("")
				.toUpperCase();
		}
		return user?.email?.[0]?.toUpperCase() ?? "U";
	};

	const displayName =
		user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

	return (
		<nav className='sticky top-0 z-50 bg-brand-cream/90 backdrop-blur-md border-b border-brand-ink/5'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-20'>
					{/* Logo */}
					<Link to='/' className='flex items-center space-x-2 shrink-0'>
						<span className='text-2xl font-serif font-bold text-brand-orange'>
							Yorùbá<span className='text-brand-ink'> Lexicon</span>
						</span>
					</Link>

					{/* Desktop nav links — centered */}
					<div className='hidden md:flex items-center gap-1 bg-brand-ink/4 rounded-xl p-1'>
						{navLinks.map((link) => {
							const isActive = location.pathname === link.path;
							return (
								<Link
									key={link.path}
									to={link.path}
									className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
										isActive
											? "text-brand-orange"
											: "text-brand-ink/60 hover:text-brand-ink hover:bg-brand-ink/5"
									}`}
								>
									{isActive && (
										<motion.div
											layoutId='active-pill'
											className='absolute inset-0 bg-white rounded-xl shadow-sm'
											transition={{
												type: "spring",
												stiffness: 380,
												damping: 32,
											}}
										/>
									)}
									<span className='relative z-10 flex items-center gap-1.5'>
										<link.icon size={15} />
										{link.name}
									</span>
								</Link>
							);
						})}
					</div>

					{/* Desktop right side */}
					<div className='hidden md:flex items-center gap-3'>
						{user ? (
							<div className='relative' ref={profileRef}>
								<button
									type='button'
									onClick={() => setIsProfileOpen(!isProfileOpen)}
									className='flex items-center gap-2.5 pl-2 pr-3 py-2 rounded-xl
										hover:bg-brand-ink/5 transition-all duration-200 group'
								>
									{/* Avatar */}
									<div
										className='w-8 h-8 rounded-lg bg-brand-orange text-white
										flex items-center justify-center text-xs font-bold shrink-0'
									>
										{getInitials()}
									</div>
									<div className='text-left'>
										<p className='text-xs font-bold text-brand-ink leading-none'>
											{displayName}
										</p>
										{isAdmin && (
											<p className='text-[10px] text-brand-orange font-bold uppercase tracking-wider mt-0.5'>
												Admin
											</p>
										)}
									</div>
									<ChevronDown
										size={14}
										className={`text-brand-ink/30 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
									/>
								</button>

								{/* Profile dropdown */}
								<AnimatePresence>
									{isProfileOpen && (
										<motion.div
											initial={{ opacity: 0, y: 6, scale: 0.97 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: 6, scale: 0.97 }}
											transition={{ duration: 0.15 }}
											className='absolute right-0 w-52 bg-white rounded-xl shadow-xl
												border border-brand-ink/5 overflow-hidden py-1.5'
										>
											{/* User info header */}
											<div className='px-4 py-3 border-b border-brand-ink/5'>
												<p className='text-xs text-brand-ink/40 mb-0.5'>
													Signed in as
												</p>
												<p className='text-sm font-bold text-brand-ink truncate'>
													{user.email}
												</p>
											</div>

											<div className='py-1.5'>
												<button
													type='button'
													onClick={handleSignOut}
													className='w-full flex items-center gap-3 px-4 py-2.5
														text-sm font-medium text-red-500 hover:bg-red-50 transition-colors'
												>
													<LogOut size={15} />
													Sign Out
												</button>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						) : (
							<Link
								to='/auth'
								className='btn-primary py-2.5 px-5 text-sm flex items-center gap-2'
							>
								<User size={15} />
								Sign In
							</Link>
						)}
					</div>

					{/* Mobile hamburger */}
					<button
						type='button'
						onClick={() => setIsOpen(!isOpen)}
						className='md:hidden p-2 rounded-xl text-brand-ink hover:bg-brand-ink/5 transition-colors'
						aria-label='Toggle menu'
					>
						<AnimatePresence mode='wait' initial={false}>
							{isOpen ? (
								<motion.span
									key='close'
									initial={{ rotate: -90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: 90, opacity: 0 }}
									transition={{ duration: 0.15 }}
								>
									<X size={22} />
								</motion.span>
							) : (
								<motion.span
									key='open'
									initial={{ rotate: 90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: -90, opacity: 0 }}
									transition={{ duration: 0.15 }}
								>
									<Menu size={22} />
								</motion.span>
							)}
						</AnimatePresence>
					</button>
				</div>
			</div>

			{/* Mobile sidebar overlay */}
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							onClick={() => setIsOpen(false)}
							className='fixed inset-0 bg-black/30 md:hidden z-40'
						/>

						{/* Sidebar */}
						<motion.div
							initial={{ opacity: 0, x: 300 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 300 }}
							transition={{ duration: 0.22, ease: "easeInOut" }}
							className='fixed right-0 top-0 h-screen w-[80vw] max-w-sm bg-brand-cream border-l border-brand-ink/5 overflow-y-auto md:hidden z-50'
						>
							<div className='px-4 pt-5 pb-6 space-y-1'>
								{/* Close button */}
								<div className='flex justify-end mb-4'>
									<button
										type='button'
										onClick={() => setIsOpen(false)}
										className='p-2 rounded-xl text-brand-ink hover:bg-brand-ink/5 transition-colors'
										aria-label='Close menu'
									>
										<X size={22} />
									</button>
								</div>

								{/* User greeting on mobile */}
								{user && (
									<div className='flex items-center gap-3 px-3 py-4 mb-2 border-b border-brand-ink/5'>
										<div
											className='w-10 h-10 rounded-xl bg-brand-orange text-white
											flex items-center justify-center text-sm font-bold shrink-0'
										>
											{getInitials()}
										</div>
										<div className='min-w-0 flex-1'>
											<p className='font-bold text-brand-ink text-sm truncate'>
												{displayName}
											</p>
											<p className='text-xs text-brand-ink/40 truncate'>
												{user.email}
											</p>
										</div>
										{isAdmin && (
											<span
												className='text-[10px] font-bold uppercase tracking-wider
												text-brand-orange bg-brand-orange/10 px-2 py-1 rounded-full whitespace-nowrap'
											>
												Admin
											</span>
										)}
									</div>
								)}

								{navLinks.map((link, i) => {
									const isActive = location.pathname === link.path;
									return (
										<motion.div
											key={link.path}
											initial={{ opacity: 0, x: 12 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: i * 0.05 }}
										>
											<Link
												to={link.path}
												className={`flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm font-medium transition-all ${
													isActive
														? "bg-brand-orange/10 text-brand-orange"
														: "text-brand-ink/70 hover:bg-brand-ink/5 hover:text-brand-ink"
												}`}
											>
												<link.icon size={18} />
												<span className='truncate'>
													{link.name}
												</span>
												{isActive && (
													<div className='ml-auto w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0' />
												)}
											</Link>
										</motion.div>
									);
								})}

								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: navLinks.length * 0.05 }}
									className='pt-3 border-t border-brand-ink/5 mt-2'
								>
									{user ? (
										<button
											type='button'
											onClick={handleSignOut}
											className='w-full flex items-center justify-center gap-2 py-3 rounded-xl
												text-sm font-bold text-red-500 hover:bg-red-50 transition-colors'
										>
											<LogOut size={16} />
											<span className='truncate'>Sign Out</span>
										</button>
									) : (
										<Link
											to='/auth'
											className='btn-primary w-full flex items-center justify-center gap-2 py-3'
										>
											<User size={16} />
											<span className='truncate'>Sign In</span>
										</Link>
									)}
								</motion.div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</nav>
	);
};
