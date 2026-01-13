import React, {useState, useEffect} from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ProfileEditComponent from '../../components/profile/ProfileEditComponent';
import ProfileRoleChangeRequest from '../../components/profile/ProfileRoleChangeRequest';
import Modal from '../../components/common/Modal';
import { useNavigate } from 'react-router-dom';

interface userRole {
    id: string;
    event_name: string;
    role_name: string;
};

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [userRoles, setUserRoles] = useState<userRole[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRoleModelOpen, setIsRoleModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async() => {
            const res = await api.get("/auth/me/");
            setUser(res.data);
            setUserRoles(res.data.roles || []);
        }
        fetchData();
    }, []);
    console.log("USER FROM API:", user);

    if (!user) {
        return <div>Loading...</div>;
    };

    const handleBackClick = () => {
        window.history.back();
    };
    const handleLogOut = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return(
        <>
        <DashboardLayout>
            <div className='flex flex-col items-start justify-center gap-4'>
                <div className='flex items-start justify-center w-full px-4'>
                    <div className='text-[1.3rem] font-semibold mr-6' onClick={handleBackClick}>←</div>
                    <div className='text-[1.4rem] font-bold'>Profile</div>
                </div>
                <div className='w-full flex items-start justify-start gap-8 px-4 my-8'>
                    <div className='w-[30vw] h-[40vh] mr-6'><img src={user.profile_picture ? `http://127.0.0.1:8000${user.profile_picture}` : "http://via.placeholder.com/40"} alt="Profile Picture" className='w-full h-full object-cover rounded-lg' /></div>
                    <div className='flex flex-col items-start justify-center gap-4 mr-12'>
                        <div className='text-[1.2rem] font-semibold'>{user.person_name}</div>
                        <div className='text-[1.05rem] font-semibold'>{user.email_id}</div>
                        <div className='text-[1.05rem] font-semibold'>{user.short_bio}</div>
                        <div className='text-[1.05rem] font-semibold'>{user.batch}</div>
                        <div className='text-[1.05rem] font-semibold'>{user.department}</div>
                    </div>
                    <div className='text-[1.2rem] font-semibold' onClick={() => setIsEditModalOpen(true)}>✎</div>
                </div>

                <div className='flex flex-col items-start justify-center gap-4 w-full'>
                    <div className='text-[1.3rem] font-bold'>Request Role Change :</div>
                    <button onClick={() => setIsRoleModalOpen(true)} className='bg-blue-400 text-white px-4 py-2 rounded-xl'>Request Role Change</button>
                </div>


                <div className='flex flex-col items-start justify-center w-full mb-6'> 
                    <div className='text-[1.2rem] font-bold mb-4'>Your Roles : </div>
                    <div className='flex flex-wrap flex-col gap-4'>
                        {userRoles.map((ur) => (
                            <div key={ur.id} className='bg-gray-200 p-3 rounded-xl text-[0.8rem]'>
                                <span>{ur.event_name || "Overall"} </span>
                                <span> - {ur.role_name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <button onClick={handleLogOut} className='font-semibold text-[0.8rem] shadow z-50 rounded-lg px-4 py-2 bg-red-700'>Logout</button>
        </DashboardLayout>
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
            <ProfileEditComponent user={user} />
        </Modal>

        <Modal isOpen={isRoleModelOpen} onClose={() => setIsRoleModalOpen(false)}>
            <ProfileRoleChangeRequest onClose={() => setIsRoleModalOpen(false)} />
        </Modal>
        </>
    );
}