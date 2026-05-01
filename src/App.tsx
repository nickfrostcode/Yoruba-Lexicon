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
import { Dashboard } from "./pages/Dashboard";
import { Auth } from "./pages/Auth";
import { Admin } from "./pages/Admin";
import { Contributors } from "./pages/Contributors";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./lib/ProtectedRoute";

export default function App() {
	return (
		<AuthProvider>
			<Router>
				<Layout>
					<Routes>
						{/* Public Routes */}
						<Route path='/' element={<Landing />} />
						<Route path='/browse' element={<Browse />} />
						<Route
							path='/contributors'
							element={<Contributors />}
						/>
						<Route path='/auth' element={<Auth />} />

						{/* Protected Routes Wrapper */}
						<Route element={<ProtectedRoute />}>
							<Route path='/dashboard' element={<Dashboard />} />
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
