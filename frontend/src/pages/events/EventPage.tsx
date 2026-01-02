import React, {useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import BatchProvider, { useBatch } from '../../components/batch/BatchProvider';
import BatchToolbar from '../../components/batch/BatchToolbar';
import SelectableCard from '../../components/batch/SelectableCard';
import { canManageSpecificEvents} from '../../utils/permission/permissions';
import NewEvent from '../../components/events/NewEvent';

export default function EventsPage() {
    return(
        <BatchProvider>
            <EventContent />
        </BatchProvider>
    );
}

function EventContent(){
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const [createdEvents, setCreatedEvents] = useState<any[]>([]);
    const [taggedEvents, setTaggedEvents] = useState<any[]>([]);
    const [otherEvents, setOtherEvents] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const {selectionMode, setSelectionMode} = useBatch();
    console.log("USER FROM API:", user);
    
    
    const canManage = canManageSpecificEvents(user?.roles);
    console.log("CAN MANAGE:", canManage);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async() => {
        const [eventsRes, taggedRes] = await Promise.all([
            api.get('/events/'),
            api.get('/my/tags')
        ]);

        const allEvents = eventsRes.data;
        const tagged = taggedRes.data.events || [];

        const created = allEvents.filter(
            (event: any) => event.created_by === user?.person_name
        );

        const other = allEvents.filter(
            (e:any) => 
                !created.some((c:any) => c.event_id === e.event_id) &&
                !tagged.some((t:any) => t.event_id === e.event_id)
            
        );

        setCreatedEvents(created);
        setTaggedEvents(tagged);
        setOtherEvents(other);
    };

    const filterBySearch = (events: any[]) => {
       return events.filter(e => e.event_name.toLowerCase().includes(search.toLowerCase()));
    };

    return(
        <DashboardLayout>
            {selectionMode && (
                <BatchToolbar type="event" canManage={canManage} />
            )}
            <div className='flex justify-around items-center mb-6'>
                <button onClick={() => navigate("/")} className='text-[1.2rem] font-semibold'>←</button>
                <div className='text-[1.3rem] font-bold mb-4 p-4'>My Events</div>
                    {canManage && 
                        <div className='flex gap-4'>
                            <button className='px-4 py-2 border rounded-lg' onClick= {() => setSelectionMode(!selectionMode)}>
                                {selectionMode ? "Cancel" : "Select"}
                            </button>

                            <button onClick={() => setShowCreateModal(true)} className='px-4 py-2 bg-gray-300 rounded-lg '>
                                    + New Event
                            </button>
                        </div>
                    }
            </div>
            <input placeholder='Search Events ...' value={search} onChange={e => setSearch(e.target.value)} className='border p-2 rounded-lg w-full mb-3' />
            <EventSection title = "Events Created by You" events={filterBySearch(createdEvents)} onNavigate={navigate} />
            <EventSection title = "Events You are Tagged In" events={filterBySearch(taggedEvents)} onNavigate={navigate} />
            <EventSection title = "Other Accessible Events" events={filterBySearch(otherEvents)} onNavigate={navigate} />
            <NewEvent isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={loadEvents} />
        </DashboardLayout>
    )
}

function EventSection({ title, events, onNavigate} : {
    title: string;
    events: any[];
    onNavigate: (path: string) => void;
}) {
    if (events.length === 0) return null;
    return(
        
        <div className='mb-8'>
            <h3 className='text-[1.2rem] font-semibold mb-3'>{title}</h3>
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
        </div>
    );
}