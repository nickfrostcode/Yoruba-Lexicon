/** @format */

// src/App.tsx
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Layout } from "@/src/components/layout/Layout";
import { Landing } from "@/src/pages/Landing";
import { Browse } from "@/src/pages/Browse";
import { BaseWordDetail } from "@/src/pages/BaseWordDetail";
import { Dashboard } from "@/src/pages/Dashboard";
import { Auth } from "@/src/pages/Auth";
import { Admin } from "@/src/pages/Admin";
import { Contributors } from "@/src/pages/Contributors";
import { AuthProvider } from "@/src/context/AuthContext";
import { ProtectedRoute } from "@/src/lib/ProtectedRoute";
import { AdminRoute } from "@/src/lib/AdminRoute";
import { ScrollToTop } from "@/src/components/layout/ScrollToTop";

export default function App() {
	return (
		<AuthProvider>
			<Router>
				<ScrollToTop />
				<Layout>
					<Routes>
						{/* Public Routes */}
						<Route path='/' element={<Landing />} />
						<Route path='/browse' element={<Browse />} />
						<Route path='/browse/:id' element={<BaseWordDetail />} />
						<Route
							path='/contributors'
							element={<Contributors />}
						/>
						<Route path='/auth' element={<Auth />} />

						<Route element={<ProtectedRoute />}>
							<Route path='/dashboard' element={<Dashboard />} />
						</Route>

						<Route element={<AdminRoute />}>
							<Route path='/admin' element={<Admin />} />
						</Route>

						{/* Fallback Route */}
						<Route path='*' element={<Navigate to='/' replace />} />
					</Routes>
				</Layout>
			</Router>
		</AuthProvider>
	);
}
