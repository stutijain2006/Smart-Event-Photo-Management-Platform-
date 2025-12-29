import React, {useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import BatchProvider, { useBatch } from '../../components/batch/BatchProvider';
import BatchToolbar from '../../components/batch/BatchToolbar';
import SelectableCard from '../../components/batch/SelectableCard';

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    const roles = user?.roles || [];
    const canManage = roles.includes("PHOTOGRAPHER") || roles.includes("ADMIN");

    useEffect(() => {
        api.get("/events/").then(response => {
            setEvents(response.data);
        }).catch(error => {
            console.error("Error fetching events:", error);
        });
    }, []);


    return(
        <BatchProvider>
            <EventsContent
                events={events}
                canManage={canManage}
                onNavigate={navigate}
            />
        </BatchProvider>
    );
}

function EventsContent({ events, canManage, onNavigate} : any) {
    const { selectionMode, setSelectionMode } = useBatch();

    return(
        <DashboardLayout>
            <BatchToolbar type="event" canManage={canManage} />
            <div className='flex justify-around items-center'>
                <button onClick={() => onNavigate("/")} className='text-[1.2rem] font-semibold'>←</button>
                <div className='text-[1.3rem] font-bold mb-4 p-4'>My Events</div>

                <div className='flex gap-4'>

                    {canManage && 
                    <>
                    <button className='px-4 py-2 border rounded-lg' onClick= {() => setSelectionMode(!selectionMode)}>
                        {selectionMode ? "Cancel" : "Select"}
                    </button>

                    <button onClick={() => onNavigate("/events/create")} className='px-4 py-2 bg-gray-300 rounded-lg '>
                        + New Event
                    </button>
                    </>
                    }
                </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
                {events.map((event: any) => (
                    <SelectableCard 
                        key={event.event_id}
                        id={event.event_id}
                        onClick={() => onNavigate(`/events/${event.event_id}`)}
                        >
                            <div className='bg-white p-4 rounded-lg shadow'>
                                <h3 className='font-semibold text-[1rem]'>{event.event_name}</h3>
                                <p className='font-medium text-[0.8rem]'>{event.event_date}</p>
                            </div>
                    </SelectableCard>
                ))}
            </div>
        </DashboardLayout>
    );
}