import React , { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Modal from '../../components/common/Modal';

export default function AdminPeoplePage() {
    const [people, setPeople] = useState<any[]>([]);  
    const [requests, setRequests] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [search , setSearch] = useState("")

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async() => {
        const [peopleRes, reqRes, eventRes] = await Promise.all([
            api.get('/admin/people/'),
            api.get('/role-requests/admin/'),
            api.get('/events/')
        ]);

        setPeople(peopleRes.data);
        setRequests(reqRes.data);
        setEvents(eventRes.data);
    };

    const filteredPeople = people.filter( p => 
        p.email.toLowerCase().includes(search.toLowerCase()) || 
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return(
        <DashboardLayout>
            <input placeholder='Search People' value={search} onChange={e => setSearch(e.target.value)} className='border p-2 rounded-lg w-full' />

            <Section title="Events">
                {events.map(event => (
                    <div key={event.event_id} className='flex items-center justify-center bg-gray-300 rounded-lg shadow'>
                        <div className='flex flex-col items-center justify-center'>
                            <div className='font-bold'>{event.name}</div>
                            <ul className='text-[0.8rem] text-gray-600'>
                                {event.roles?.map((r: any) => {
                                    <li key={r.user_id}>{r.user_name} - {r.role_name}</li>
                                })}
                            </ul>
                        </div>
                        <button className='text-blue-600'>Manage </button>
                    </div>
                ))}
            </Section>

            <Section title="People List">
                {filteredPeople.map(p => (
                    <div key={p.user_id} className='grid grid-cols-3 bg-white p-3 rounded-lg shadow'>
                        <div className='font-bold'>{p.name}</div>
                        <div className='text-[0.8rem] text-gray-600'>{p.email}</div>
                        <button className='text-blue-600'>Manage Access </button>
                    </div>
                ))}
            </Section>

            <Section title="Pending Requests">
                {requests.map(r => (
                    <div key={r.id} className='grid grid-cols-4 bg-white p-3 rounded-lg shadow'>
                        <div className='font-bold'>{r.user_name}</div>
                        <div className='text-[0.8rem] text-gray-600'>{r.email}</div>
                        <div className='text-[0.8rem] text-gray-600'>{r.requested_role}</div>
                        <div className='flex gap-2'>
                            <button className='text-green-600' onClick={() => handleReview(r.request_id, "approve")} >Accept</button>
                            <button className='text-red-600' onClick={() => handleReview(r.request_id, "reject")}>Decline</button>
                        </div>
                    </div>
                ))}
            </Section>
        </DashboardLayout>
    );

    async function handleReview(id: string, action: "approve" | "reject") {
        await api.post(`/role-requests/${id}/review`, {status: action});
        loadData();
    }
};

function Section({title, children} : any){
    return(
        <div className="mb-8">
            <h2 className="text-[1.2rem] font-semibold mb-4">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {children}
            </div>
        </div>
    );
}