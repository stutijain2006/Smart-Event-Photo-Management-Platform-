import React from 'react';
import {useNavigate} from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import AppLogo from '../../assets/logo.png';

const BACKEND_URL = "http:// 127.0.0.1:8000";

export default function TopBar() {
    const navigate = useNavigate();
    const { user }= useAppSelector((state) => state.auth);
    const isAdmin = user?.roles?.some(
        (r:any) => r.role_name === 'ADMIN'
    )
    const profilePicture = user?.profile_picture ? `${BACKEND_URL}${user.profile_picture}` : 'https://via.placeholder.com/40';

    return (
        <div className="flex items-center justify-between p-4 bg-[#f5f5f5] shadow-md">
            <img src={AppLogo} alt="App Logo" className="w-[10vw] h-auto px-4" onClick={() => navigate("/")} />
            <h1 className="text-[1.3rem] font-bold text-gray-950">Dashboard</h1>
            <div className='flex items-center justify-center gap-6'>
                <div className='text-[1rem] font-semibold' onClick={() => navigate("/events")}>Events</div>
                <div className='text-[1rem] font-semibold' onClick={() => navigate("/albums")}>My Albums</div>
                {isAdmin && (
                    <div className='text-[1rem] font-semibold' onClick= {() => navigate("/admin/people")} >People</div>
                )}
                {user && (
                    <img src={profilePicture} alt="Profile" className="w-[6vw] h-auto rounded-full cursor-pointer" onClick={() => navigate('/profile')} /> 
                )}
            </div>
        </div>
    );
}