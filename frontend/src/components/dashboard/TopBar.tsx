import React from 'react';
import {useNavigate} from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import AppLogo from '../../assets/logo.png';

export default function TopBar() {
    const navigate = useNavigate();
    const { user }= useAppSelector((state) => state.auth);
    const roles = user?.roles || [];

    return (
        <div className="flex items-center justify-between p-4 bg-[#f5f5f5] shadow-md">
            <img src={AppLogo} alt="App Logo" className="w-[10vw] h-auto px-4" onClick={() => navigate(-1)} />
            <h1 className="text-[1.3rem] font-bold text-gray-950">Dashboard</h1>
            <div className='flex items-center justify-center gap-6'>
                <div className='text-[1rem] font-semibold' onClick={() => navigate("/events")}>Events</div>
                <div className='text-[1rem] font-semibold' onClick={() => navigate("/albums")}>My Albums</div>
                {roles.includes('ADMIN') && (
                    <div className='text-[1rem] font-semibold' onClick= {() => navigate("/admin/people")} >People</div>
                )}
                <div className='text-[1rem] font-semibold'>
                    <img src={user?.profile_picture || 'https://via.placeholder.com/40'} alt="Profile" className="w-[6vw] h-auto rounded-full cursor-pointer" onClick={() => navigate('/profile')} /> 
                </div>
            </div>
        </div>
    );
}