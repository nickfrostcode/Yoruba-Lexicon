/** @format */

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

interface User {
	id: string;
	email: string;
	full_name: string;
}

const AuthContext = createContext<{
	user: User | null;
	isAdmin: boolean;
	loading: boolean;
}>({
	user: null,
	isAdmin: false,
	loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const clearStoredSupabaseSession = () => {
			if (typeof window === "undefined") return;

			Object.keys(window.localStorage)
				.filter(
					(key) =>
						key.startsWith("sb-") && key.endsWith("-auth-token"),
				)
				.forEach((key) => window.localStorage.removeItem(key));
		};

		const syncAuthState = async (session: Session | null) => {
			const sbUser = session?.user ?? null;

			if (!sbUser) {
				setUser(null);
				setIsAdmin(false);
				return;
			}

			try {
				const { data: profile, error } = await supabase
					.from("profiles")
					.select("role, full_name")
					.eq("id", sbUser.id)
					.single();

				if (error) {
					console.error("Error fetching profile:", error);
				}

				setUser({
					id: sbUser.id,
					email: sbUser.email ?? "",
					full_name: profile?.full_name ?? "",
				});
				setIsAdmin(profile?.role === "admin");
			} catch (profileError) {
				console.error("Unexpected profile sync error:", profileError);
				setUser({
					id: sbUser.id,
					email: sbUser.email ?? "",
					full_name: "",
				});
				setIsAdmin(false);
			}
		};

		const fetchSessionAndRole = async () => {
			try {
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					throw error;
				}

				await syncAuthState(session);
			} catch (sessionError) {
				console.error("Session hydration failed:", sessionError);
				// Recover from corrupted persisted auth payloads that can break refresh.
				clearStoredSupabaseSession();
				setUser(null);
				setIsAdmin(false);
			} finally {
				setLoading(false);
			}
		};

		fetchSessionAndRole();

		// Listen for changes (login/logout)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			try {
				await syncAuthState(session);
			} catch (authChangeError) {
				console.error("Auth state change sync failed:", authChangeError);
				setUser(null);
				setIsAdmin(false);
			} finally {
				setLoading(false);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ user, isAdmin, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
