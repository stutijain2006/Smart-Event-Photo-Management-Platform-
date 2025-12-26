import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAppSelector } from "../../app/hooks";

export default function DashboardHome() {
    const { user } = useAppSelector((state: any) => state.auth);

    return(
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <h2 className="text-[1.5rem] font-bold">Welcome, {user?.person_name}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <DashboardCard title="Events" />
                    <DashboardCard title="Albums" />
                    <DashboardCard title="Photos" />
                    {user?.roles?.includes("ADMIN") && (
                        <DashboardCard title= "Admin Panel" />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function DashboardCard({ title }: { title: string }) {
    return (
        <div className="p-4 bg-[#f5f5f5] shadow-md rounded-lg">
            <h3 className="text-[1rem] font-semibold">{title}</h3>
        </div>
    );
}