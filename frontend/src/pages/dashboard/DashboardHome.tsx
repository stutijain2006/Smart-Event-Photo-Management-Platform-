import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAppSelector } from "../../app/hooks";
import { useNavigate } from "react-router-dom";

export default function DashboardHome() {
    const { user } = useAppSelector((state: any) => state.auth);
    const navigate = useNavigate();
    const isAdmin = user?.roles?.some(
        (r: any) => r.role_name === "ADMIN"
    );
    console.log("USER FROM API:", user);

    return(
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <h2 className="text-[1.5rem] font-bold">Welcome, {user?.person_name}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <DashboardCard title="Events" onClick={() => navigate('/events')} />
                    <DashboardCard title="Albums" onClick={() => navigate('/albums')} />
                    <DashboardCard title="Photos" onClick={() => navigate('/photos')} />
                    {isAdmin && (
                        <DashboardCard title= "Admin Panel" onClick={() => navigate('/admin/people')} />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function DashboardCard({ title, onClick }: { title: string, onClick?: () => void }) {
    return (
        <div className="p-4 bg-[#f5f5f5] shadow-md rounded-lg">
            <h3 className="text-[1rem] font-semibold" onClick={onClick} >{title}</h3>
        </div>
    );
}