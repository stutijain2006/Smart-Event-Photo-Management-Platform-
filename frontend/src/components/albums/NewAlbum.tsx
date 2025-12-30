import React, { useState } from "react";
import api from "../../services/api";
import Modal from "../common/Modal";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    eventId ?: string
}

export default function NewAlbum({ isOpen, onClose, onCreated, eventId }: Props) {
    const [albumName, setAlbumName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) {
        return null;
    }
    const handleCreate = async() => {
        if (!albumName.trim()) {
            alert("Please enter album name and description");
            return;
        }
        try{
            setLoading(true);
            await api.post('/albums/', {album_name: albumName, description, event_id: eventId || null});
            alert ("Album created successfully");
            onCreated();
            onClose();
        }catch(error : any){
            console.log(error.response?.data);
        }finally{
            setLoading(false);
        }
    };

    return(
        <Modal isOpen={isOpen} onClose={onClose}>
                <h2 className="text-[1.4rem] font-bold mb-4">Create New Album</h2>
                <div className="flex flex-col gap-3">
                    <input type="text" placeholder="Album Name" value={albumName} onChange={(e) => setAlbumName(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2" />
                    <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2" />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
                    <button onClick={handleCreate} disabled={loading} className="px-4 py-2 rounded-lg bg-[#0066ff] text-black border">{loading ? "Creating..." : "Create"}</button>
                </div>
        </Modal>
    );
}