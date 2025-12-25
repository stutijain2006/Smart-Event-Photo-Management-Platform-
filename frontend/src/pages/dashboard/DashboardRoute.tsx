import { useAppSelector } from "../../app/hooks";
/*import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import PhotographerDashboard from './PhotographerDashboard';
import EventManagerDashboard from './EventManagerDashboard';

export default function DashboardRoute() {
    const { user } = useAppSelector((state: any) => state.auth);
    if (!user) return null;

    if (user.roles.includes('admin')) {
        return <AdminDashboard />;
    }
    if (user.roles.includes('photographer')) {
        return <PhotographerDashboard />;
    }
    if (user.roles.includes('event_manager')) {
        return <EventManagerDashboard />;
    }
    return <UserDashboard />;
}*/