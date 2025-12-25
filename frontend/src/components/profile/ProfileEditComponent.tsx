import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ProfileEditComponent({ user }: { user: any }) {
    const [name, setName] = useState(user.name);
    const [shortBio, setShortBio] = useState(user.short_bio);
    const [batch, setBatch] = useState(user.batch);
    const [department, setDepartment] = useState(user.department);
    const [profilePicture, setProfilePicture] = useState(user.profilePicture);

    const handleProfileUpdate = async () => {
        try {
            await api.put('/auth/me', {
                name,
                short_bio: shortBio,
                batch,
                department,
                profilePicture
            });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
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