/** @format */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";

export const Auth: React.FC = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [fullName, setFullName] = useState("");
	const navigate = useNavigate();
	const { user, initialized } = useAuth();

	useEffect(() => {
		if (!initialized || !user) return;
		navigate("/dashboard", { replace: true });
	}, [initialized, user, navigate]);

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (isLogin) {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});
				if (error) throw error;
				toast.success("Successfully signed in!");
			} else {
				if (password !== confirmPassword) {
					throw new Error("Passwords do not match.");
				}
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
					const { error: profileError } = await (
						supabase.from("profiles") as any
					).insert([
						{
							id: data.user.id,
							email,
							full_name: fullName,
						},
					]);
					if (profileError)
						console.error("Error creating profile:", profileError);
				}
				toast.success("Account created successfully!");
			}
		} catch (err: unknown) {
			if (err instanceof AuthError || err instanceof Error) {
				toast.error(
					err.message || "An error occurred during authentication.",
				);
			} else {
				toast.error("An error occurred during authentication.");
			}
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

				<div className='glass-card p-8 rounded-3xl border border-brand-ink/5 shadow-md'>
					<form onSubmit={handleAuth} className='space-y-6'>
						{!isLogin && (
							<>
								<div className='space-y-2'>
									<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
										Full Name
									</label>
									<div className='relative'>
										<User
											size={18}
											className='absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30 z-10 pointer-events-none'
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
								{/* <div className='space-y-2'>
									<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
										Username
									</label>
									<div className='relative'>
										<AtSign
											size={18}
											className='absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30 z-10 pointer-events-none'
										/>
										<input
											type='text'
											placeholder='seun_lexicon'
											className='input-field pl-12'
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											required={!isLogin}
										/>
									</div>
								</div> */}
							</>
						)}

						<div className='space-y-2'>
							<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
								Email Address
							</label>
							<div className='relative'>
								<Mail
									size={18}
									className='absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30 z-10 pointer-events-none'
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
									className='absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30 z-10 pointer-events-none'
								/>
								<input
									type={showPassword ? "text" : "password"}
									placeholder='••••••••'
									className='input-field pl-12 pr-12'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute right-4 top-1/2 -translate-y-1/2 text-brand-ink/30 hover:text-brand-ink/60 transition-colors z-10'
								>
									{showPassword ? (
										<EyeOff size={18} />
									) : (
										<Eye size={18} />
									)}
								</button>
							</div>
						</div>

						{!isLogin && (
							<div className='space-y-2'>
								<label className='text-xs font-bold uppercase tracking-widest text-brand-ink/40 ml-1'>
									Confirm Password
								</label>
								<div className='relative'>
									<Lock
										size={18}
										className='absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30 z-10 pointer-events-none'
									/>
									<input
										type={showConfirmPassword ? "text" : "password"}
										placeholder='••••••••'
										className='input-field pl-12 pr-12'
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
										required={!isLogin}
									/>
									<button
										type='button'
										onClick={() =>
											setShowConfirmPassword(!showConfirmPassword)
										}
										className='absolute right-4 top-1/2 -translate-y-1/2 text-brand-ink/30 hover:text-brand-ink/60 transition-colors z-10'
									>
										{showConfirmPassword ? (
											<EyeOff size={18} />
										) : (
											<Eye size={18} />
										)}
									</button>
								</div>
								{confirmPassword.length > 0 && (
									<p
										className={`text-xs font-medium ml-1 ${
											password === confirmPassword
												? "text-green-600"
												: "text-red-500"
										}`}
									>
										{password === confirmPassword
											? "Passwords match"
											: "Passwords do not match"}
									</p>
								)}
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
