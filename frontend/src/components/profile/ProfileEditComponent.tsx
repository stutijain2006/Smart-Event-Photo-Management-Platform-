import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getCSRFToken } from '../../utils/csrf';

export default function ProfileEditComponent({ user }: { user: any }) {
    const [name, setName] = useState("");
    const [shortBio, setShortBio] = useState("");
    const [batch, setBatch] = useState("");
    const [department, setDepartment] = useState("");
    const [profilePicture, setProfilePicture] = useState("");

    useEffect(() => {
        if (user){
            setName(user.person_name || "");
            setShortBio(user.short_bio || "");
            setBatch(user.batch || "");
            setDepartment(user.department || "");
            setProfilePicture(user.profile_picture || "");
        }
    }, [user]);
    
    const handleProfileUpdate = async () => {
        try {
            const payload = {
                person_name : name,
                short_bio : shortBio,
                batch,
                department,
                profile_picture: profilePicture
            }
            await api.put('/auth/me/', payload, {
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                },
            });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
        }
    };


    return (
        <div className="flex flex-col gap-4 p-4">
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border p-2 rounded" />
            <input type="text" value={shortBio} onChange={(e) => setShortBio(e.target.value)} placeholder="Short Bio" className="border p-2 rounded" />
            <input type="text" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="Batch" className="border p-2 rounded" />
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" className="border p-2 rounded" />
            <input type="text" value={profilePicture} onChange={(e) => setProfilePicture(e.target.value)} placeholder="Profile Picture URL" className="border p-2 rounded" />
            <button onClick={handleProfileUpdate} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Update Profile</button>
        </div>      
    );
}