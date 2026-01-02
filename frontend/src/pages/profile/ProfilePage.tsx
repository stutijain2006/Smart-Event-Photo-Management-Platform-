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
                <div className='flex items-center justify-center w-full px-4'>
                    <div className='text-[1.3rem] font-semibold' onClick={handleBackClick}>←</div>
                    <div className='text-[1.3rem] font-bold'>Profile</div>
                </div>
                <div className='w-[80vw] flex items-start justify-center px-4 my-8'>
                    <div className='w-[30vw] h-[40vh] object-contain'><img src={user.profile_picture || "https://via.placeholder.com/150"} alt="Profile Picture" /></div>
                    <div className='flex flex-col items-start justify-center gap-4'>
                        <div className='text-[1.2rem] font-semibold'>{user.person_name}</div>
                        <div className='text-[1.05rem] font-semibold'>{user.email_id}</div>
                        <div className='text-[1.05rem] font-semibold'>{user.short_bio}</div>
                        <div className='text-[1.05rem] font-semibold'>{user.batch}</div>
                        <div className='text-[1.05rem] font-semibold'>{user.department}</div>
                    </div>
                    <div className='text-[1.2rem] font-semibold' onClick={() => setIsEditModalOpen(true)}>✎</div>
                </div>

                <div className='flex flex-col items-start justify-center gap-4'>
                    <div className='text-[1.3rem] font-bold'>Request Role Change :</div>
                    <button onClick={() => setIsRoleModalOpen(true)} className='bg-blue-400 text-white px-4 py-2 rounded-xl'>Request Role Change</button>
                </div>


                <div className='flex flex-col items-start justify-center px-4'> 
                    <div className='text-[1.2rem] font-bold mb-2'>Your Roles : </div>
                    <div className='flex flex-wrap flex-col gap-2'>
                        {userRoles.map((ur) => (
                            <div key={ur.id} className='bg-gray-200 p-3 rounded-xl text-[0.8rem]'>
                                <span>{ur.event_name} </span>
                                <span> - {ur.role_name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <button onClick={handleLogOut} className='fixd bottom -6 left-6 px-5 py-2 bg-red-400 text-white shadow z-50 rounded-lg'>Logout</button>
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