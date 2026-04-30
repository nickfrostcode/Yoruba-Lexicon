/** @format */

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

const AuthContext = createContext<{ user: User | null; isAdmin: boolean; loading: boolean }>({
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
			const { data: { session } } = await supabase.auth.getSession();
			const currentUser = session?.user ?? null;
			setUser(currentUser);

			if (currentUser) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("role")
					.eq("id", currentUser.id)
					.single();
				setIsAdmin(profile?.role === "admin");
			} else {
				setIsAdmin(false);
			}
			setLoading(false);
		};

		fetchSessionAndRole();

		// Listen for changes (login/logout)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			const currentUser = session?.user ?? null;
			setUser(currentUser);

			if (currentUser) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("role")
					.eq("id", currentUser.id)
					.single();
				setIsAdmin(profile?.role === "admin");
			} else {
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
