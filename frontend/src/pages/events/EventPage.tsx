import React, {useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    const roles = user?.roles || [];
    const canCreateEvent = roles.includes("PHOTOGRAPHER") || roles.includes("ADMIN");

    useEffect(() => {
        api.get("/events/").then(response => {
            setEvents(response.data);
        }).catch(error => {
            console.error("Error fetching events:", error);
        });
    }, []);

    const onClose = () => navigate("/");

    return(
        <DashboardLayout>
            <div className='flex justify-around items-center'>
                <button onClick={onClose} className='text-[1.2rem] font-semibold'>←</button>
                <div className='text-[1.3rem] font-bold mb-4 p-4'>My Events</div>
                {canCreateEvent && <button onClick={() => navigate("/events/create")} className='text-[1.2rem] font-semibold'>+ New Event</button>}
            </div>
            <div className='grid grid-cols-2 gap-4'>
                {events.map((event: any) => (
                    <div 
                        key={event.id}
                        className='bg-white p-4 rounded-xl shadow cursor-pointer'
                        onClick={() => navigate(`/events/${event.id}`)}
                        >
                            <h3 className='font-semibold text-[1rem]'>{event.event_name}</h3>
                            <p className='font-medium text-[0.8rem]'>{event.event_date}</p>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}