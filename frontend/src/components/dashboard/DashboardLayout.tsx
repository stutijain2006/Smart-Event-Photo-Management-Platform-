import Topbar from './TopBar';
import Footer from './Footer';
import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { setUser } from '../../features/auth/authslice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useNotifications } from '../../hooks/useNotifications';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state : any) => state.auth);
    
    useNotifications((data) => {
        console.log("Notification: ", data);
    });
    useEffect(() => {
        if (!user) {
            const fetchUser = async() => {
                try {
                    const response = await api.get("/auth/me/");
                    dispatch(setUser(response.data));
                } catch (error) {
                    console.error(error);
                    navigate("/login");
                }
            };
            fetchUser();
        }
    }, [user, dispatch, navigate]);

    if (!user){
        return <div>Loading...</div>;
    }


    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Topbar />
            <main className="flex flex-col flex-1 items-start p-4 flex-wrap bg-blue-100 overflow-y-auto overflow-x-hidden">
                <div className='w-full max-w-7xl'>
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}