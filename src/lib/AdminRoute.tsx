/** @format */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AdminRoute = () => {
	const { user, isAdmin, loading } = useAuth();

	if (loading) {
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
