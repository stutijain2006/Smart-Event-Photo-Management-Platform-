import { Navigate } from 'react-router-dom';
import React, { JSX } from 'react';
import { useAppSelector } from '../../app/hooks';

type Role = {
    role_name : string;
    event_name?: string | null
};

interface RoleGuardProps {
    children: JSX.Element;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, loading } = useAppSelector((state) => state.auth);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (!user){
        return <Navigate to="/login" replace />
    }
    console.log("USER ROLES: ", user.roles);
    const roles: Role[] = user.roles || [];
    const hasPermission = roles.some(role => {
        return allowedRoles.includes(role.role_name);
    });

    if (!hasPermission){
        return <Navigate to="/unauthorized" replace />
    }

    return children;
}