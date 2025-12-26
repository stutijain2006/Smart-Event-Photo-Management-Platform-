import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAppSelector } from "../../app/hooks";

export default function EventDetailPage() {
    const { eventId } = useParams();
    const { user } = useAppSelector((state: any) => state.auth);
    const roles = user?.roles || [];

    const canManage = roles.includes("ADMIN") || roles.includes("PHOTOGRAPHER");

    const [eventDetails, setEventDetails] = useState<any>(null);
    const [albums, setAlbums] = useState<any[]>([]);    
    const [photos, setPhotos] = useState<any[]>([]);

    useEffect(() => {
        api.get(`/events/`).then(res => {
            setEventDetails(res.data.find((event: any) => event.event_id === Number(eventId))); 
        })
        api.get(`/albums/?event_id=${eventId}`).then(res => setAlbums(res.data));
        api.get(`/photos/?event_id=${eventId}`).then(res => setPhotos(res.data));
    }, [eventId]);


    if (!eventDetails) {
        return <DashboardLayout><div>Loading...</div></DashboardLayout>;
    }

    const onClose = () => window.history.back();

    return(
        <DashboardLayout>
            <div className="flex justify-center items-start px-4">
                <button onClick={onClose} className='text-[1.2rem] font-semibold'>←</button>
                <h2 className='text-[1.4rem] font-bold'>
                    {eventDetails.event_name}
                </h2>
                {canManage && (
                    <div className="flex gap-3">
                        <button className="text-[1.2rem] font-semibold px-4 py-2 rounded-lg">+ Create Album</button>
                    </div>
                )}
            </div>
            <button className="bg-gray-300 px-4 py-2 w-[60vw] h-[30vh] rounded-lg">
                + Add Photos
            </button>
            <div className="flex flex-col items-start justify-center gap-6">
                <div className="text-[1.1rem] font-semibold mb-2">Albums</div>
                <div className="grid grid-cols-1 gap-4 mb-4">
                    {albums.map((album) => (
                        <div key={album.album_id} className="border p-4 rounded shadow w-[80vw] h-[30vh] flex flex-col items-start justify-center gap-2">
                            <h3 className="font-semibold text-[1rem]">{album.album_name}</h3>
                            <p className="font-medium text-[0.8rem]">{album.description}</p>

                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-start justify-center px-4 my-6">
                <div className="text-[1.1rem] font-semibold mb-2">Photos</div>
                <div className="grid grid-cols-4 gap-4 w-[90vw]">
                    {photos.map((photo) => (
                        <div key={photo.photo_id} className="border p-2 rounded shadow w-[20vw] h-[20vh]">
                            <img src={photo.photo_url} alt={photo.photo_name} className="w-full h-full object-cover rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}