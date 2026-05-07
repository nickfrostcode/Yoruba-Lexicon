/** @format */

// src/App.tsx
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Browse } from "./pages/Browse";
import { BaseWordDetail } from "./pages/BaseWordDetail";
import { Dashboard } from "./pages/Dashboard";
import { Auth } from "./pages/Auth";
import { Admin } from "./pages/Admin";
import { Contributors } from "./pages/Contributors";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./lib/ProtectedRoute";
import { AdminRoute } from "./lib/AdminRoute";
import { ScrollToTop } from "./components/ScrollToTop";

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
