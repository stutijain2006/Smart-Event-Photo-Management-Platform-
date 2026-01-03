import {Routes, Route} from 'react-router-dom';
import ProtectedRoute from '../components/routing/ProtectedRoute';
import RoleGuard from '../components/routing/RoleGuard';
import RegisterPage from '../pages/auth/RegisterPage';
import LoginPage from '../pages/auth/LoginPage';
import VerifyEmailForm from '../components/auth/VerifyEmailForm';
import OmniportCallBack from '../components/auth/OmniportCallBack';
import Unauthorized from "../pages/errors/Unauthorized";
import DashboardHome from '../pages/dashboard/DashboardHome';
import ProfilePage from '../pages/profile/ProfilePage';
import EventPage from '../pages/events/EventPage';
import EventDetailPage from '../pages/events/EventDetailPage';
import AlbumsPage from '../pages/albums/AlbumsPage';
import AlbumDetailPage from '../pages/albums/AlbumDetailPage';
import PhotoDetailPage from '../pages/photos/PhotoDetailPage';
import AdminPeoplePage from '../pages/admin/AdminPeoplePage';
import MyFavourite from '../pages/photos/MyFavourite';
import MyPhotos from '../pages/photos/MyPhotos';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-email" element={<VerifyEmailForm />} />
            <Route path="/omniport/callback" element={<OmniportCallBack />} />

            <Route path="/" element={
                <ProtectedRoute >
                    <DashboardHome />
                </ProtectedRoute>
            } />

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

            <Route path="/albums" element={
                <ProtectedRoute>
                    <AlbumsPage />
                </ProtectedRoute>
            } />

            <Route path="/albums/:albumId" element={
                <ProtectedRoute>
                    <AlbumDetailPage />
                </ProtectedRoute>
            } />

            <Route path="/photos/:photoId" element={
                <ProtectedRoute>
                    <PhotoDetailPage />
                </ProtectedRoute>
            } />            

            <Route path="/admin/people" element={
                <ProtectedRoute>
                    <RoleGuard allowedRoles={['ADMIN']} >
                        <AdminPeoplePage />
                    </RoleGuard>
                </ProtectedRoute>
            } />

            <Route path="/my-favourite" element={
                <ProtectedRoute>
                    <MyFavourite />
                </ProtectedRoute>
            } />

            <Route path="/photos" element={
                <ProtectedRoute>
                    <MyPhotos />
                </ProtectedRoute>
            } />

            <Route path="/unauthorized" element={<Unauthorized />} />

        </Routes>
    );
}