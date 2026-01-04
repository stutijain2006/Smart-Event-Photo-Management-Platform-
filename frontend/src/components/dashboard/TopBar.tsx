import React from 'react';
import { Bell } from "lucide-react";
import {useNavigate} from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import AppLogo from '../../assets/logo.png';
import NotificationList from '../notifications/NotificationList';  

const BACKEND_URL = "http://127.0.0.1:8000";

export default function TopBar() {
    const navigate = useNavigate();
    const { user }= useAppSelector((state) => state.auth);
    const unreadCount = useAppSelector(
        (state : any) => state.notifications.unreadCount
    )
    const [showNotifications, setShowNotifications] = React.useState(false);
    const isAdmin = user?.roles?.some(
        (r:any) => r.role_name === 'ADMIN'
    )
    const profilePicture = user?.profile_picture ? `${BACKEND_URL}${user.profile_picture}` : 'https://via.placeholder.com/40';

    return (
        <div className="flex items-center justify-between p-4 bg-[#f5f5f5] shadow-md">
            <img src={AppLogo} alt="App Logo" className="w-[10vw] h-auto px-4" onClick={() => navigate("/")} />
            <h1 className="text-[1.3rem] font-bold text-gray-950">Smart Event Gallery</h1>
            <div className='flex items-center justify-center gap-6'>
                <div className='text-[1rem] font-semibold' onClick={() => navigate("/events")}>Events</div>
                <div className='text-[1rem] font-semibold' onClick={() => navigate("/albums")}>My Albums</div>
                {isAdmin && (
                    <div className='text-[1rem] font-semibold' onClick= {() => navigate("/admin/people")} >People</div>
                )}
                <div className='text-[1rem] font-semibold' onClick={() => navigate("/photos")} >Photos</div>
                {user && (
                    <img src={profilePicture} alt="Profile" className="w-[6vw] h-auto rounded-full cursor-pointer" onClick={() => navigate('/profile')} /> 
                )}
                <div className='relative'>
                    <Bell className='w-[5vw] h-[10vh] cursor-pointer' onClick={() => setShowNotifications(prev => !prev)} />
                    {unreadCount > 0 && (
                        <span className='absolute -top-1 -right-2 bg-red-500 text-white text-[0.7rem]  px-2 rounded-full'>{unreadCount}</span>
                    )}

                    {showNotifications && (
                        <NotificationList onClose={() => setShowNotifications(false)} />
                    )}
                </div>
            </div>
        </div>
    );
}