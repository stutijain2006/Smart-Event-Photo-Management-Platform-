import React, {useState} from 'react';
import api from "../../services/api";

const ROLES = ["ADMIN", "USER", "EVENT_MANAGER", "PHOTOGRAPHER"];
export default function AdminRoleModel({person, onClose} : any) {
    const [role, setRole] = useState(person.role);
    const [eventId, setEventId] = useState(person.event_id || null);
    const [message, setMessage] = useState('');

    const handleSave = async() => {
        await api.post("admin/assign-role", {
            user_id: person.user_id,
            role_name : role,
            event_id: eventId || null
        });
        setMessage("Role updated successfully!");
    };

    return(
        <div className='space-y-4 p-4 w-[60vw]'>
            <h2 className='text-[1.3rem] font-bold'>Manage Role</h2>
            <div className='font-semibold'>{person.person_name || person.user_name }</div>
            <select value={role} onChange={(e) => setRole(e.target.value)} className='border px-4 py-2 w-full rounded-lg'> 
                <option value=''>Select Role</option>
                {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>

            {message && <div className='text-green-600'> {message} </div>}

            <div className='flex justify-end items-center gap-6'>
                <button onClick={onClose} className='border px-4 py-2 rounded-lg'>Cancel</button>
                <button onClick={handleSave} className='border px-4 py-2 rounded-lg'>Save</button>
            </div>
        </div>
    )
}