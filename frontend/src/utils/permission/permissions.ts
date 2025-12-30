import {
    ROLE_ADMIN, ROLE_PHOTOGRAPHER, ROLE_EVENT_MANAGER, ROLE_USER, ROLE_IMG_MEMBER
} from "./roles";
type Role = {
    role_name : string;
    event_name?: string | null;
};

export const hasRole = (
    roles: Role[] | undefined,
    roleName : string
) : boolean => {
    if (!roles) return false;
    return roles.some((role) => role.role_name === roleName);
};

export const isAdmin = (roles?: Role[]) : boolean => hasRole(roles, ROLE_ADMIN);

export const canManagePhotos = (roles?: Role[]) : boolean => {
    return (
        hasRole(roles, ROLE_ADMIN) ||
        hasRole(roles, ROLE_PHOTOGRAPHER) || hasRole(roles, ROLE_EVENT_MANAGER)
    );
};

export const canManageSpecificEvents = (roles?: Role[]) : boolean => hasRole(roles, ROLE_EVENT_MANAGER) || hasRole(roles, ROLE_ADMIN);