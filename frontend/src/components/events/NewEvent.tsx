import React, { useState } from "react";
import api from "../../services/api";
import Modal from "../common/Modal";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function NewEvent({ isOpen, onClose, onCreated }: Props) {
    const [eventName, setEventName] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) {
        return null;
    }
    const handleCreate = async() => {
        if (!eventName || !eventDate) {
            alert("Please enter event name and date.");
            return;
        }
        try{
            setLoading(true);
            await api.post('/events/', {event_name: eventName, event_date: eventDate, event_description: description, start_time: startTime, end_time: endTime, location: location});
            alert ("Event created successfully");
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
                <h2 className="text-[1.4rem] font-bold mb-4">Create New Event</h2>
                <div className="flex flex-col gap-3">
                    <input type="text" placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2" /> 
                    <input type="date" placeholder="Event Date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2" />
                    <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2" />
                    <input type="time" placeholder="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2" />
                    <input type="time" placeholder="End Time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2" />
                    <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2" />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
                    <button onClick={handleCreate} disabled={loading} className="px-4 py-2 rounded-lg bg-[#0066ff] text-black border">{loading ? "Creating..." : "Create"}</button>
                </div>
        </Modal>
    );
}