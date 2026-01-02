import React , { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Modal from '../../components/common/Modal';
import AdminRoleModel from '../../components/admin/AdminRoleModel';

export default function AdminPeoplePage() {
    const [people, setPeople] = useState<any[]>([]);  
    const [requests, setRequests] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [search , setSearch] = useState("")
    const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
    const [selectedPerson, setSelectedPerson] = useState<any>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async() => {
        const [peopleRes, reqRes, eventRes] = await Promise.all([
            api.get('/admin/people/list/'),
            api.get('/role-requests/admin/'),
            api.get('/events/')
        ]);

        setPeople(peopleRes.data);
        setRequests(reqRes.data);
        setEvents(eventRes.data);
    };

    const filteredPeople = people.filter( p => {
        const email = p.email_id || "";
        const name = p.person_name || "";
        return (
            email.toLowerCase().includes(search.toLowerCase()) || 
            name.toLowerCase().includes(search.toLowerCase())
        )
    });

    return(
        <DashboardLayout>
            <input placeholder='Search People' value={search} onChange={e => setSearch(e.target.value)} className='border p-2 rounded-lg w-full' />
            
            <Section title="Events">
                {events.map(event => (
                    <div key={event.event_id} className='bg-gray-300 rounded-lg shadow'>
                        <div className='flex items-center justify-between'>
                            <div className='font-bold'>{event.event_name}</div>
                            <button className='text-blue-600' onClick={() => {
                                setExpandedEventId(expandedEventId === event.event_id ? null : event.event_id);
                            }} >
                                {expandedEventId === event.event_id ? 'Close' : 'Manage'}
                            </button>
                        </div>

                        {expandedEventId === event.event_id && (
                            <div className='mt-3 space-y-2'>
                                {event.members?.length ?(
                                    event.members?.map((m: any) => (
                                        <div key={m.user_id} className='flex justify-around flex-col items-center bg-white p-2 rounded '>
                                            <span>{m.user_name} - {" "} <span className='text-gray-600'>{m.role_name}</span></span>
                                            <button className='text-blue-600' onClick={() => {
                                                setSelectedPerson({
                                                    user_id: m.user_id,
                                                    person_name: m.user_name,
                                                    current_role: m.role_name,
                                                    event_id : event.event_id,
                                                    event_name: event.name
                                                });
                                                setIsRoleModalOpen(true);
                                            }} >
                                                Manage Role
                                            </button>
                                        </div>
                                    ))
                                ):(
                                   <p className='text-[0.8rem] text-gray-500'>No Roles Assigned </p> 
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </Section>

            <Section title="People List">
                {filteredPeople.map(p => (
                    <div key={p.user_id} className='grid grid-cols-3 bg-white p-3 rounded-lg shadow gap-4 w-[25vw] '>
                        <div className='font-bold'>{p.person_name}</div>
                        <div className='text-[0.8rem] text-gray-600'>{p.email_id}</div>
                        <button className='text-blue-600' onClick={() => {
                            setSelectedPerson({
                                user_id: p.user_id,
                                person_name: p.person_name
                            });
                            setIsRoleModalOpen(true);
                        }}>Manage Access</button>
                    </div>
                ))}
            </Section>

            <Section title="Pending Requests">
                {requests.map(r => (
                    <div key={r.request_id} className='grid grid-cols-4 bg-white p-3 rounded-lg shadow'>
                        <div className='font-bold'>{r.user_name}</div>
                        <div className='font-semibold'>{r.event_name}</div>
                        <div className='text-gray-600'>{r.target_role_name}</div>
                        <div className='text-[0.8rem] text-gray-600'>{r.status}</div>
                        <div className='text-[0.8rem] text-gray-600'>{r.reason}</div>
                        <div className='flex gap-2'>
                            <button className='text-green-600' onClick={() => handleReview(r.request_id, "approve")} >Accept</button>
                            <button className='text-red-600' onClick={() => handleReview(r.request_id, "reject")}>Decline</button>
                        </div>
                    </div>
                ))}
            </Section>
            <Modal isOpen={isRoleModalOpen} onClose={() => {
                setIsRoleModalOpen(false);
                setSelectedPerson(null);
            }}>
                {selectedPerson && (
                    <AdminRoleModel person={selectedPerson} onClose={() => {
                        setIsRoleModalOpen(false);
                        setSelectedPerson(null);
                        loadData();
                    }} />
                )}
            </Modal>
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