import {Navigate} from 'react-router-dom';
import React, { JSX } from 'react';
import { useAppSelector } from '../../app/hooks';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const{isAuthenticated, loading} = useAppSelector((state) => state.auth);
    if (loading) {
        return <div>Loading...</div>;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
}
