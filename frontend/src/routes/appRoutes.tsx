import {Routes, Route} from 'react-router-dom';
import ProtectedRoute from '../components/routing/ProtectedRoute';
import RoleGuard from '../components/routing/RoleGuard';
import RegisterPage from '../pages/auth/RegisterPage';
import LoginPage from '../pages/auth/LoginPage';
import VerifyEmailForm from '../components/auth/VerifyEmailForm';
import OmniportCallBack from '../components/auth/OmniportCallBack';
import Unauthorized from "../pages/errors/Unauthorized";
//import DashboardRoute from '../pages/dashboard/DashboardRoute';
import ProfilePage from '../pages/profile/ProfilePage';
import EventPage from '../pages/events/EventPage';
import EventDetailPage from '../pages/events/EventDetailPage';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-email" element={<VerifyEmailForm />} />
            <Route path="/omniport/callback" element={<OmniportCallBack />} />

            <Route path="/profile" element={
                <ProtectedRoute>
                    <ProfilePage />
                </ProtectedRoute>
            } />

            <Route path="/events" element={
                <ProtectedRoute>
                    <EventPage />
                </ProtectedRoute>
            } />

            <Route path="/events/:eventId" element={
                <ProtectedRoute>
                    <EventDetailPage />
                </ProtectedRoute>
            } />

            <Route path="/unauthorized" element={<Unauthorized />} />

        </Routes>
    );
}