/** @format */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";

export const AdminRoute = () => {
	const { user, isAdmin, initialized, profileLoaded } = useAuth();

	if (!initialized || !profileLoaded) {
		return (
			<div className='min-h-[60vh] flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange'></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to='/auth' replace />;
	}

	if (!isAdmin) {
		return <Navigate to='/dashboard' replace />;
	}

	return <Outlet />;
};
