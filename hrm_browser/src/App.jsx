import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useAuth } from './contexts/AuthContext';

import AdminDashboard from './pages/AdminDashboard';
import HRDashboard from './pages/HRDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import SharedCalendar from './pages/SharedCalendar';

/* Redirect already-authenticated users away from public pages */
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    if (user) {
        const path = user.role === 'admin' ? '/admin' : user.role === 'hr' ? '/hr' : '/employee';
        return <Navigate to={path} replace />;
    }
    return children;
};

function App() {
    const { loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <Router>
            <Routes>
                {/* Public Routes - Landing Page and Login */}
                <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

                {/* Admin Dashboard */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin/*" element={<AdminDashboard />} />
                </Route>

                {/* HR Dashboard */}
                <Route element={<ProtectedRoute allowedRoles={['hr']} />}>
                    <Route path="/hr/*" element={<HRDashboard />} />
                </Route>

                {/* Employee Dashboard */}
                <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
                    <Route path="/employee/*" element={<EmployeeDashboard />} />
                </Route>

                {/* Shared Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'hr', 'employee']} />}>
                    <Route path="/dashboard" element={<DashboardRouter />} />
                    <Route path="/dashboard/calendar" element={<SharedCalendar />} />
                    <Route path="/admin/calendar" element={<SharedCalendar />} />
                    <Route path="/hr/calendar" element={<SharedCalendar />} />
                    <Route path="/employee/calendar" element={<SharedCalendar />} />
                </Route>

                {/* Error Routes */}
                <Route path="/unauthorized" element={<div className="p-8 text-slate-700">Unauthorized Access</div>} />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

const DashboardRouter = () => {
    const { user } = useAuth();
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'hr') return <Navigate to="/hr" replace />;
    return <Navigate to="/employee" replace />;
};

export default App;
