import {Routes, Route} from 'react-router-dom';
import Register from "../components/auth/RegisterEmailForm";
//import Login from "../pages/auth/Login";
//import VerifyOTP from "../pages/auth/VerifyOTP";
import ProtectedRoute from '../components/routing/ProtectedRoute'; 
import RoleGuard from '../components/routing/RoleGuard';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/register" element={<Register />} />
        </Routes>
    );
}