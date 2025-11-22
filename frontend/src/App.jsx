import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RetailerDashboard from './pages/RetailerDashboard'; // This imports your real dashboard
import CustomerDashboard from './pages/CustomerDashboard';
import Payment from './pages/Payment';
import WholesalerDashboard from './pages/WholesalerDashboard';
import MyOrders from './pages/MyOrders';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" />;

    // Check role (UPPERCASE from backend)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
};

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Public Routes - Redirect to dashboard if already logged in */}
            <Route path="/login" element={user ? <Navigate to={`/${user.role.toLowerCase()}/dashboard`} /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to={`/${user.role.toLowerCase()}/dashboard`} /> : <Signup />} />

            {/* Protected Routes */}
            <Route
                path="/customer/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['CUSTOMER']}>
                        <CustomerDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/customer/orders"
                element={
                    <ProtectedRoute allowedRoles={['CUSTOMER']}>
                        <MyOrders />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payment"
                element={
                    <ProtectedRoute allowedRoles={['CUSTOMER']}>
                        <Payment />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/retailer/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['RETAILER']}>
                        <RetailerDashboard /> {/* This now loads the Real Page */}
                    </ProtectedRoute>
                }
            />
            <Route
                path="/wholesaler/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['WHOLESALER']}>
                        <WholesalerDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Default Catch-all */}
            <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;