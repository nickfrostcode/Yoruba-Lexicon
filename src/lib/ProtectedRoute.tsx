/** @format */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
	const { user, initialized } = useAuth();

	if (!initialized) {
		return (
			<div className='min-h-[60vh] flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange'></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to='/auth' replace />;
	}

	return <Outlet />;
};
