/** @format */

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { Session, User as SupabaseAuthUser } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface AuthUser {
	id: string;
	email: string;
	full_name: string;
}

interface Profile {
	id: string;
	role: string;
	full_name: string | null;
}

type AuthContextValue = {
	user: AuthUser | null;
	session: Session | null;
	isAdmin: boolean;
	initialized: boolean;
	profileLoaded: boolean;
	loading: boolean;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
	user: null,
	session: null,
	isAdmin: false,
	initialized: false,
	profileLoaded: false,
	loading: true,
	signOut: async () => {},
});

function authUserFromJwt(sbUser: SupabaseAuthUser): AuthUser {
	const meta = sbUser.user_metadata as Record<string, unknown> | undefined;
	const fromMeta =
		typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
	return {
		id: sbUser.id,
		email: sbUser.email ?? "",
		full_name: fromMeta,
	};
}

/**
 * Supabase client: never await other Supabase calls directly inside
 * `onAuthStateChange` — it can deadlock on the shared auth lock.
 * Defer profile fetch with queueMicrotask / setTimeout(0).
 */
const DEFER = (fn: () => void) => queueMicrotask(fn);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [initialized, setInitialized] = useState(false);
	const [profileLoaded, setProfileLoaded] = useState(false);

	const mountedRef = useRef(true);
	const activeUserIdRef = useRef<string | null>(null);
	const profileRequestIdRef = useRef(0);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const fetchProfileDeferred = useCallback(
		(userId: string, sbUser: SupabaseAuthUser) => {
			const requestId = ++profileRequestIdRef.current;

			const finish = () => {
				if (
					requestId === profileRequestIdRef.current &&
					activeUserIdRef.current === userId &&
					mountedRef.current
				) {
					setProfileLoaded(true);
				}
			};

			const run = async () => {
				try {
					const timeoutMs = 12_000;
					const query = supabase
						.from("profiles")
						.select<string, Profile>("role, full_name")
						.eq("id", userId)
						.maybeSingle();

					const result = await Promise.race([
						query,
						new Promise<never>((_, reject) =>
							setTimeout(
								() => reject(new Error("profile fetch timeout")),
								timeoutMs,
							),
						),
					]);

					if (
						requestId !== profileRequestIdRef.current ||
						activeUserIdRef.current !== userId ||
						!mountedRef.current
					) {
						return;
					}

					const { data: profile, error } = result as {
						data: Profile | null;
						error: any;
					};

					if (error) {
						console.error("Error fetching profile:", error);
					}

					const jwtName = authUserFromJwt(sbUser).full_name;
					const fullName = profile?.full_name?.trim() || jwtName || "";

					setUser({
						id: userId,
						email: sbUser.email ?? "",
						full_name: fullName,
					});
					setIsAdmin(profile?.role === "admin");
				} catch (e) {
					console.error("Profile load failed:", e);
					if (
						requestId === profileRequestIdRef.current &&
						activeUserIdRef.current === userId &&
						mountedRef.current
					) {
						setUser(authUserFromJwt(sbUser));
						setIsAdmin(false);
					}
				} finally {
					finish();
				}
			};

			void run();
		},
		[],
	);

	/** Sync session into React state only; profile fetch is always deferred. */
	const hydrateFromSession = useCallback(
		(nextSession: Session | null) => {
			const sbUser = nextSession?.user ?? null;
			activeUserIdRef.current = sbUser?.id ?? null;

			if (!sbUser) {
				profileRequestIdRef.current += 1;
				if (!mountedRef.current) return;
				setSession(null);
				setUser(null);
				setIsAdmin(false);
				setProfileLoaded(true);
				return;
			}

			if (!mountedRef.current) return;
			setSession(nextSession);
			setUser(authUserFromJwt(sbUser));
			setIsAdmin(false);
			setProfileLoaded(false);

			const userId = sbUser.id;
			DEFER(() => fetchProfileDeferred(userId, sbUser));
		},
		[fetchProfileDeferred],
	);

	useEffect(() => {
		let cancelled = false;

		const markReady = () => {
			if (!cancelled && mountedRef.current) setInitialized(true);
		};

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, nextSession) => {
			// Keep this callback synchronous; defer DB work inside hydrateFromSession.
			hydrateFromSession(nextSession);
			markReady();
		});

		const safeInit = async () => {
			try {
				const ms = 15_000;
				const {
					data: { session: initialSession },
					error,
				} = await Promise.race([
					supabase.auth.getSession(),
					new Promise<never>((_, reject) =>
						setTimeout(() => reject(new Error("getSession timeout")), ms),
					),
				]);

				if (cancelled) return;

				if (error) {
					console.error("getSession:", error);
				}

				hydrateFromSession(initialSession ?? null);
			} catch (e) {
				console.error("Session init failed:", e);
				if (typeof window !== "undefined") {
					Object.keys(window.localStorage)
						.filter(
							(k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
						)
						.forEach((k) => window.localStorage.removeItem(k));
				}
				hydrateFromSession(null);
			} finally {
				markReady();
			}
		};

		void safeInit();

		return () => {
			cancelled = true;
			subscription.unsubscribe();
		};
	}, [hydrateFromSession]);

	const signOut = useCallback(async () => {
		profileRequestIdRef.current += 1;
		activeUserIdRef.current = null;
		if (mountedRef.current) {
			setSession(null);
			setUser(null);
			setIsAdmin(false);
			setProfileLoaded(true);
		}
		try {
			await supabase.auth.signOut();
		} catch (e) {
			console.error("signOut:", e);
		}
	}, []);

	const value = useMemo(
		(): AuthContextValue => ({
			user,
			session,
			isAdmin,
			initialized,
			profileLoaded,
			loading: !initialized,
			signOut,
		}),
		[user, session, isAdmin, initialized, profileLoaded, signOut],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
