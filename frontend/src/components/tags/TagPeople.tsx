import React, {useState, useEffect} from 'react';   
import api from '../../services/api';

interface Person{
    user_id : string;
    name : string;
    email : string;
}

interface Props{
    type : "event" | "album" | "photo",
    objectId : string,
    onClose : () => void
}
export default function TagPeople({type, objectId, onClose}: Props){
    const [people, setPeople] = useState<Person[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get("/admin/people/").then(res => setPeople(res.data));
    }, []);
    
    const tagPerson = async (userId : string) => {
        await api.post("/tags/person/", {
            user_id : userId,
            type,
            object_id: objectId
        });
        alert("Person Tagged successfully");
    };

    const filtered = people.filter(p => {
        return p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    });

    return(
        <div className='p-4'>
            <h2 className='text-[1.3rem] font-bold mb-4'>Tag People</h2>
            <input placeholder='Search' value={search} onChange={e => setSearch(e.target.value)} className='border p-2 rounded-lg w-full mb-3' />

            <div className='max-h-[10vh] overflow-y-auto'>
                {filtered.map(p => (
                    <div key={p.user_id} className='flex justify-between p-2 border-b'>
                        <div>
                            <div className='font-semibold text-[1rem]'>{p.name}</div>
                            <div className='text-[0.7rem]'>{p.email}</div>
                        </div>
                        <button className='text-[1rem] font-semibold' onClick={() => tagPerson(p.user_id)}>Tag</button>
                    </div>
                ))}
            </div>

            <button className='text-[1rem] font-semibold' onClick={onClose}>Close</button>
        </div>
    );
}