import React, { useState, useEffect } from 'react';
import api from '../../services/api';
interface Event {
    event_id: string;
    event_name: string;
}
interface Role {
    role_id: string;
    role_name: string;
}
export default function ProfileRoleChangeRequest({onClose}: {onClose: () => void}) {
    const [events, setEvents] = useState<Event[]>([]);
    const [eventId, setEventId] = useState<string>('');
    const [roleId, setRoleId] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [roles, setRoles] = useState<Role[]>([]);

    useEffect(() => {
        api.get('/events/').then(res => {
            setEvents(res.data);
        });
        api.get('/roles/').then(res => {
            setRoles(res.data);
        });
    }, []);


    const handleSubmit = async () => {
        if (!eventId || !roleId || !reason) {
            setMessage('Please fill all fields.');
            return;
        }
        try{
            await api.post('/role-requests', {
                event_id: eventId || null,
                target_role_id: roleId,
                reason,
            });
            setMessage('Role change request submitted successfully!');
            setTimeout(() => {onClose();}, 2000);
        }catch(error){
            setMessage('Error submitting role change request.');
        }
    };


    return(
        <div className='flex flex-col gap-4 p-4 w-[60vw]'>
            <div className='flex items-start justify-center px-4 '>
                <button onClick={onClose} className='text-[1.2rem] font-semibold'>←</button>
                <h2 className='text-[1.4rem] font-bold'>
                    Request Role Change
                </h2>
            </div>
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className='border p-2 rounded'>
                <option value="">Select Event</option>
                {events && events.map((event: any) => (
                    <option key={event.event_id} value={event.event_id}>{event.event_name}</option>
                ))}
            </select>
            <select onChange={(e) => setRoleId(e.target.value)} className='border p-2 rounded'>
                <option value="">Select Role</option>
                {roles.map((r) => (
                    <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                ))} 
            </select>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className='border p-2 rounded' placeholder='Why do you want this role?'/>
            {message && <div className='text-green-500'>{message}</div>}

            <div className='flex gap-2 justify-end'>
                <button onClick={handleSubmit} className='bg-blue-500 text-white px-4 py-2 rounded'>Submit</button>
            </div>
        </div>
    )
};

