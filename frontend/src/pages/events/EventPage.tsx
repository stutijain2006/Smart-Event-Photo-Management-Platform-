import React, {useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/events/").then(response => {
            setEvents(response.data);
        }).catch(error => {
            console.error("Error fetching events:", error);
        });
    }, []);

    return(
        <DashboardLayout>
            <div className='text-[1.3rem] font-bold mb-4 p-4'>My Events</div>
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