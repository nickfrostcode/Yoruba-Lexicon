/** @format */

import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
	Search,
	Book,
	Users,
	ShieldCheck,
	ArrowRight,
	Sparkles,
	Globe,
	Heart,
} from "lucide-react";

export const Landing: React.FC = () => {
	// We'll use variants for stagger effects
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, ease: "easeOut" as const },
		},
	};

	return (
		<div className='overflow-hidden bg-brand-cream selection:bg-brand-orange/30 selection:text-brand-ink'>
			{/* Modern Hero Section */}
			<section className='relative min-h-[90vh] flex items-center justify-center pt-24 pb-32 md:pt-32 md:pb-48'>
				{/* Abstract Background Elements */}
				<div className='absolute inset-0 z-0 overflow-hidden pointer-events-none'>
					<div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))]from-brand-orange/10 via-brand-cream to-brand-cream'></div>
				</div>

				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
					<motion.div
						variants={containerVariants}
						initial='hidden'
						animate='visible'
						className='text-center max-w-4xl mx-auto'
					>
						<motion.div variants={itemVariants} className='mb-8'>
							<span className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-brand-orange/20 text-brand-orange text-sm font-bold uppercase tracking-widest shadow-sm'>
								<Sparkles size={16} />
								The Living Archive
							</span>
						</motion.div>

						<motion.h1
							variants={itemVariants}
							className='text-6xl md:text-8xl lg:text-9xl font-serif font-bold tracking-tight text-brand-ink mb-6 leading-[0.9]'
						>
							Preserving the <br />
							<span className='italic text-brand-orange relative inline-block'>
								Yorùbá
								<svg
									className='absolute -bottom-2 md:-bottom-4 left-0 w-full h-3 md:h-6 text-brand-orange/30'
									viewBox='0 0 100 12'
									preserveAspectRatio='none'
								>
									<path
										d='M0,10 Q50,0 100,10'
										fill='none'
										stroke='currentColor'
										strokeWidth='4'
										strokeLinecap='round'
									/>
								</svg>
							</span>{" "}
							Legacy
						</motion.h1>

						<motion.p
							variants={itemVariants}
							className='max-w-2xl mx-auto text-xl md:text-2xl text-brand-ink/70 mb-12 leading-relaxed'
						>
							A collaborative digital space dedicated to documenting,
							preserving, and celebrating the linguistic depth of the
							Yorùbá language for generations to come.
						</motion.p>

						<motion.div
							variants={itemVariants}
							className='inline-flex flex-col sm:flex-row p-2 bg-white/40 backdrop-blur-xl rounded-3xl sm:rounded-full border border-white/40 shadow-xl shadow-brand-orange/5'
						>
							<Link
								to='/browse'
								className='btn-primary w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 text-lg'
							>
								<span>Explore Lexicon</span>
								<ArrowRight size={20} />
							</Link>
							<Link
								to='/dashboard'
								className='w-full sm:w-auto px-8 py-4 text-lg font-bold text-brand-ink hover:text-brand-orange transition-colors flex items-center justify-center'
							>
								Start Contributing
							</Link>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Bento Box Features Section */}
			<section className='py-32 bg-white relative'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className='text-center mb-16'
					>
						<h2 className='text-4xl md:text-5xl font-serif font-bold mb-4'>
							Why Build a Lexicon?
						</h2>
						<p className='text-xl text-brand-ink/60 max-w-2xl mx-auto'>
							Traditional dictionaries capture words. We capture the
							soul, tones, and history behind them.
						</p>
					</motion.div>

					<div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
						{/* Large feature box */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className='md:col-span-8 group p-10 rounded-[2rem] bg-linear-to-br from-brand-cream/50 to-white border border-brand-ink/5 hover:border-brand-orange/30 hover:shadow-2xl hover:shadow-brand-orange/5 transition-all duration-500 overflow-hidden relative'
						>
							<div className='absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700'>
								<Search size={160} />
							</div>
							<div className='relative z-10 h-full flex flex-col justify-end'>
								<div className='w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-8 group-hover:bg-brand-orange group-hover:text-white text-brand-orange transition-colors duration-500'>
									<Search size={32} />
								</div>
								<h3 className='text-3xl font-serif font-bold mb-4'>
									Smart Search
								</h3>
								<p className='text-brand-ink/60 text-lg leading-relaxed max-w-md'>
									Find words, meanings, and phonetic pronunciations
									with our intuitive search engine designed explicitly
									for Yorùbá diacritics and complex tone marks.
								</p>
							</div>
						</motion.div>

						{/* Smaller feature boxes */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.1 }}
							className='md:col-span-4 flex flex-col gap-6'
						>
							<div className='flex-1 p-8 rounded-[2rem] bg-brand-ink text-brand-cream group hover:shadow-xl hover:shadow-brand-ink/20 transition-all duration-500'>
								<div className='w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6 text-brand-orange'>
									<Users size={24} />
								</div>
								<h3 className='text-2xl font-serif font-bold mb-3'>
									Community Driven
								</h3>
								<p className='text-brand-cream/70'>
									Every entry is contributed by native speakers and
									linguists.
								</p>
							</div>
							<div className='flex-1 p-8 rounded-[2rem] bg-linear-to-tr from-brand-orange/20 to-brand-cream border border-brand-orange/20 group hover:border-brand-orange/40 transition-all duration-500'>
								<div className='w-12 h-12 rounded-full bg-white flex items-center justify-center mb-6 text-brand-orange shadow-sm'>
									<ShieldCheck size={24} />
								</div>
								<h3 className='text-2xl font-serif font-bold mb-3'>
									Verified Accuracy
								</h3>
								<p className='text-brand-ink/70'>
									Peer-reviewed system ensures high linguistic
									standards.
								</p>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Rich Gradient Stats & Quote Section */}
			<section className='relative py-32 bg-brand-ink text-brand-cream overflow-hidden'>
				<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,99,33,0.15)_0%,rgba(26,26,26,0)_70%)]ointer-events-none' />

				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-20 items-center'>
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8 }}
						>
							<h2 className='text-5xl md:text-7xl font-serif font-bold mb-8 leading-[1.1]'>
								Building the <br />
								<span className='text-brand-orange italic font-light'>
									Greatest Archive
								</span>{" "}
								<br />
								Together
							</h2>
							<p className='text-brand-cream/70 text-xl mb-16 leading-relaxed max-w-lg'>
								Language is more than just words; it's the vessel of
								culture. By documenting the Yorùbá lexicon, we are
								preserving a worldview, a history, and a future.
							</p>

							<div className='flex gap-16'>
								<div>
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										className='text-6xl font-serif font-bold text-brand-orange mb-2'
									>
										12k<span className='text-brand-cream'>+</span>
									</motion.div>
									<div className='text-sm uppercase tracking-widest text-brand-cream/40 font-bold'>
										Words Archived
									</div>
								</div>
								<div>
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: 0.2 }}
										className='text-6xl font-serif font-bold text-brand-orange mb-2'
									>
										3.5k<span className='text-brand-cream'>+</span>
									</motion.div>
									<div className='text-sm uppercase tracking-widest text-brand-cream/40 font-bold'>
										Active Contributors
									</div>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 1 }}
							className='relative'
						>
							<div className='aspect-square rounded-[3rem] bg-linear-to-brrom-white/10 to-white/0 border border-white/10 p-12 flex items-center justify-center backdrop-blur-sm shadow-2xl relative overflow-hidden'>
								<div className='absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />

								<div className='text-center relative z-10'>
									<Book
										size={80}
										className='text-brand-orange mb-10 mx-auto'
									/>
									<p className='text-4xl md:text-5xl font-serif italic text-white leading-tight mb-6'>
										"Èdè Yorùbá <br />
										kò ní parun."
									</p>
									<p className='text-brand-orange font-bold uppercase tracking-widest'>
										The Yorùbá language shall not perish.
									</p>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Modern Split History & Purpose Section */}
			<section className='py-32 bg-brand-cream'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					{/* Project About Split */}
					<div className='grid lg:grid-cols-2 gap-20 items-center mb-32'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
						>
							<span className='text-brand-orange font-bold uppercase tracking-widest text-sm mb-4 block'>
								The Methodology
							</span>
							<h2 className='text-4xl md:text-5xl font-serif font-bold mb-6 text-brand-ink leading-tight'>
								A Living Digital Archive
							</h2>
							<p className='text-brand-ink/70 leading-relaxed text-lg mb-6'>
								Unlike traditional dictionaries, our platform
								distinguishes between base root words and dialectical or
								tone-marked variants. This allows linguists, students,
								and everyday speakers to understand the deep phonetic
								and semantic relationships within the language.
							</p>
							<p className='text-brand-ink/70 leading-relaxed text-lg'>
								Tone marks in Yorùbá are not just accents; they are the
								DNA of meaning. We built this platform to respect that
								structural reality.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 20 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							className='bg-white p-10 rounded-[3rem] shadow-xl shadow-brand-ink/5 border border-brand-ink/5'
						>
							<h3 className='text-2xl font-serif font-bold mb-8 text-brand-ink flex items-center gap-3'>
								<Globe className='text-brand-orange' />
								How to Contribute
							</h3>
							<ol className='space-y-6'>
								<li className='flex gap-4 items-start'>
									<div className='shrink-0 w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold'>
										1
									</div>
									<p className='text-brand-ink/80 pt-1'>
										Create a free account or sign in.
									</p>
								</li>
								<li className='flex gap-4 items-start'>
									<div className='shrink-0 w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold'>
										2
									</div>
									<p className='text-brand-ink/80 pt-1'>
										Search to ensure the word isn't already archived.
									</p>
								</li>
								<li className='flex gap-4 items-start'>
									<div className='shrink-0h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold'>
										3
									</div>
									<p className='text-brand-ink/80 pt-1'>
										Add the <strong>Base Word</strong> (without
										specific tonal modifications).
									</p>
								</li>
								<li className='flex gap-4 items-start'>
									<div className='shrink-0 w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold'>
										4
									</div>
									<p className='text-brand-ink/80 pt-1'>
										Add <strong>Variants</strong> (the fully
										tone-marked words) with definitions and examples.
									</p>
								</li>
							</ol>
						</motion.div>
					</div>

					{/* Center Aligned History */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className='max-w-3xl mx-auto text-center'
					>
						<Heart className='mx-auto text-brand-orange mb-6' size={40} />
						<h2 className='text-4xl md:text-5xl font-serif font-bold mb-8 text-brand-ink'>
							A Global Legacy
						</h2>
						<div className='text-brand-ink/70 leading-relaxed text-xl space-y-6'>
							<p>
								Yorùbá is a Niger-Congo language spoken by over 40
								million people worldwide. Its origins trace back to the
								Oyo Empire in present-day Nigeria, but through
								historical trade, migration, and the transatlantic slave
								trade, its influence has spread globally.
							</p>
							<p>
								Today, Yorùbá is primarily spoken in Southwestern{" "}
								<strong>Nigeria</strong>,{" "}
								<strong>Benin Republic</strong>, and{" "}
								<strong>Togo</strong>. However, its linguistic and
								cultural artifacts are deeply woven into the spiritual
								practices of communities in <strong>Brazil</strong> (as
								Lucumí), <strong>Cuba</strong>,{" "}
								<strong>Trinidad and Tobago</strong>, and among diaspora
								populations worldwide.
							</p>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Edge-to-edge CTA Banner */}
			<section className='p-4 md:p-8'>
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					className='w-full max-w-7xl mx-auto bg-brand-orange rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden'
				>
					{/* Decorative abstract shapes */}
					<div className='absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3' />
					<div className='absolute bottom-0 left-0 w-96 h-96 bg-brand-ink/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3' />

					<div className='relative z-10'>
						<h2 className='text-5xl md:text-7xl font-serif font-bold text-white mb-8'>
							Ready to contribute?
						</h2>
						<p className='text-2xl text-white/80 mb-12 max-w-2xl mx-auto'>
							Join our community of linguists, elders, and passionate
							speakers to help document the Yorùbá language.
						</p>
						<Link
							to='/auth'
							className='inline-flex items-center justify-center space-x-3 bg-brand-ink text-white hover:bg-brand-ink/90 px-10 py-5 rounded-full text-xl font-bold transition-transform hover:scale-105 active:scale-95'
						>
							<span>Create an Account</span>
							<ArrowRight size={24} />
						</Link>
					</div>
				</motion.div>
			</section>
		</div>
	);
};
