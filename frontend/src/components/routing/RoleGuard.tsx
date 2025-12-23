import { Navigate } from 'react-router-dom';
import React, { JSX } from 'react';
import { useAppSelector } from '../../app/hooks';

export default function RoleGuard({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) {
    const { user, loading } = useAppSelector((state) => state.auth);

    if (loading) {
        return <div>Loading...</div>;
    }
    const roles = user?.roles || [];

    if (!user || !allowedRoles.some(role => roles.includes(role))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}