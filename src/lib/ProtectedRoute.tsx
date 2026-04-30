/** @format */

// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
	// Assuming your useAuth hook returns the current user and a loading state
	const { user, loading } = useAuth();

	// Show a loading state while Supabase checks the session
	if (loading) {
		return (
			<div className='min-h-[60vh] flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange'></div>
			</div>
		);
	}

	// If no user is found, redirect to auth page.
	// The 'replace' prop ensures they can't use the back button to return to the protected route.
	if (!user) {
		return <Navigate to='/auth' replace />;
	}

	// If authenticated, render the child routes
	return <Outlet />;
};
