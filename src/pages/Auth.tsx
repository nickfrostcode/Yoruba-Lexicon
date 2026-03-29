/** @format */

import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Github, Twitter } from "lucide-react";
import { motion } from "motion/react";

export const Auth: React.FC = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			if (isLogin) {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});
				if (error) throw error;
			} else {
				const { error, data } = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: { full_name: fullName },
					},
				});
				if (error) throw error;

				// Create profile if sign up successful
				if (data.user) {
					const { error: profileError } = await supabase
						.from("profiles")
						.insert([{ id: data.user.id, email, full_name: fullName }]);
					if (profileError)
						console.error("Error creating profile:", profileError);
				}
			}
			navigate("/dashboard");
		} catch (err: any) {
			setError(err.message || "An error occurred during authentication.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center'>
			<div className='w-full max-w-md'>
				<div className='text-center mb-12'>
					<h1 className='text-4xl md:text-5xl font-serif font-bold mb-4'>
						{isLogin ? "Welcome Back" : "Join the Archive"}
					</h1>
					<p className='text-brand-ink/60'>
						{isLogin
							? "Sign in to manage your contributions and explore the lexicon."
							: "Create an account to start contributing to the Yorùbá lexicon."}
					</p>
				</div>

				<div className='glass-card p-8 rounded-3xl border border-brand-ink/5 shadow-2xl'>
					<form onSubmit={handleAuth} className='space-y-6'>
						{!isLogin && (
							<div className='space-y-2'>
								<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
									Full Name
								</label>
								<div className='relative'>
									<User
										size={18}
										className='absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30'
									/>
									<input
										type='text'
										placeholder='Olúwaṣeun Adébáyọ̀'
										className='input-field pl-12'
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										required={!isLogin}
									/>
								</div>
							</div>
						)}

						<div className='space-y-2'>
							<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
								Email Address
							</label>
							<div className='relative'>
								<Mail
									size={18}
									className='absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30'
								/>
								<input
									type='email'
									placeholder='seun@lexicon.org'
									className='input-field pl-12'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
								Password
							</label>
							<div className='relative'>
								<Lock
									size={18}
									className='absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30'
								/>
								<input
									type='password'
									placeholder='••••••••'
									className='input-field pl-12'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>
						</div>

						{error && (
							<div className='p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm'>
								{error}
							</div>
						)}

						<button
							type='submit'
							disabled={loading}
							className='btn-primary w-full flex items-center justify-center space-x-2 py-4'
						>
							<span>
								{loading
									? "Processing..."
									: isLogin
										? "Sign In"
										: "Create Account"}
							</span>
							{!loading && <ArrowRight size={18} />}
						</button>
					</form>

					<div className='mt-8 pt-8 border-t border-brand-ink/5 text-center'>
						<p className='text-brand-ink/60 text-sm mb-6'>
							Or continue with
						</p>
						<div className='flex justify-center space-x-4'>
							<button className='p-3 rounded-xl border border-brand-ink/10 hover:bg-brand-ink/5 transition-colors'>
								<Github size={20} />
							</button>
							<button className='p-3 rounded-xl border border-brand-ink/10 hover:bg-brand-ink/5 transition-colors'>
								<Twitter size={20} />
							</button>
						</div>
					</div>
				</div>

				<div className='mt-8 text-center'>
					<button
						onClick={() => setIsLogin(!isLogin)}
						className='text-brand-ink/60 hover:text-brand-orange transition-colors text-sm font-medium'
					>
						{isLogin
							? "Don't have an account? Sign Up"
							: "Already have an account? Sign In"}
					</button>
				</div>
			</div>
		</div>
	);
};
