import React from 'react';
import {useNavigate} from 'react-router-dom';
import AppLogo from '../../assets/logo.svg';

export default function TopBar() {
    const navigate = useNavigate();
    const [role, setRole] = React.useState<string | null>(null);
    const {user} = JSON.parse(localStorage.getItem('authState') || '{}');

    React.useEffect(() => {
        if (user) {
            setRole(user.role);
        }
    }, [user]);

    return (
        <div className="flex items-center p-4 bg-[#f5f5f5] shadow-md">
            <img src={AppLogo} alt="App Logo" className="w-[10vw] h-auto px-4" />
            <h1 className="text-[1.3rem] font-bold text-gray-950">Dashboard</h1>
            <div className='flex items-center justify-center gap-6'>
                <div className='text-[1rem] font-semibold'>Events</div>
                <div className='text-[1rem] font-semibold'>My Albums</div>
                {role === 'ADMIN' && (
                    <div className='text-[1rem] font-semibold'>People</div>
                )}
                <div className='text-[1rem] font-semibold'>
                    <img src={user?.profilePicture || 'https://via.placeholder.com/40'} alt="Profile" className="w-[6vw] h-auto rounded-full cursor-pointer" onClick={() => navigate('/dashboard/profile')} /> 
                </div>
            </div>
        </div>
    );
}