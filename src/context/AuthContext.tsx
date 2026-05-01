/** @format */

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
		const fetchSessionAndRole = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const sbUser = session?.user ?? null;

			if (sbUser) {
				// Fetch both role and full_name from your custom table
				const { data: profile } = await supabase
					.from("profiles")
					.select("role, full_name")
					.eq("id", sbUser.id)
					.single();

				setUser({
					id: sbUser.id,
					email: sbUser.email ?? "",
					full_name: profile?.full_name ?? "",
				});
				setIsAdmin(profile?.role === "admin");
			} else {
				setUser(null);
				setIsAdmin(false);
			}
			setLoading(false);
		};

		fetchSessionAndRole();

		// Listen for changes (login/logout)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			const sbUser = session?.user ?? null;

			if (sbUser) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("role, full_name")
					.eq("id", sbUser.id)
					.single();

				setUser({
					id: sbUser.id,
					email: sbUser.email ?? "",
					full_name: profile?.full_name ?? "",
				});
				setIsAdmin(profile?.role === "admin");
			} else {
				setUser(null);
				setIsAdmin(false);
			}
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ user, isAdmin, loading }}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
