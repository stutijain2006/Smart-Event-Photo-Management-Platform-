import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getCSRFToken } from '../../utils/csrf';
import DragDropUpload from '../uploads/DragDropUpload';

export default function ProfileEditComponent({ user }: { user: any }) {
    const [name, setName] = useState("");
    const [shortBio, setShortBio] = useState("");
    const [batch, setBatch] = useState("");
    const [department, setDepartment] = useState("");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (user){
            setName(user.person_name || "");
            setShortBio(user.short_bio || "");
            setBatch(user.batch || "");
            setDepartment(user.department || "");
            setPreview(user.profile_picture || null);
        }
    }, [user]);
    
    const fileSelected = (files : File[]) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!(file instanceof File)) return;
        setProfilePicture(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleProfileUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append('person_name', name);
            formData.append('short_bio', shortBio);
            formData.append('batch', batch);
            formData.append('department', department);
            if (profilePicture){
                formData.append('profile_picture', profilePicture);
            }
            await api.put('/auth/me/', formData, {
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                    "Content-Type": "multipart/form-data",
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
            {preview && <img src={preview} alt="Profile Preview" className="w-[10vw] object-cover rounded-full" />}
            <DragDropUpload onFilesSelected={fileSelected} /> 
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border p-2 rounded" />
            <input type="text" value={shortBio} onChange={(e) => setShortBio(e.target.value)} placeholder="Short Bio" className="border p-2 rounded" />
            <input type="text" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="Batch" className="border p-2 rounded" />
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" className="border p-2 rounded" />
            <button onClick={handleProfileUpdate} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Update Profile</button>
        </div>      
    );
}