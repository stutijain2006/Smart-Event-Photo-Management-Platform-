import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAppSelector } from "../../app/hooks";
import ShowTag from "../../components/tags/TagPeople";
import Modal from "../../components/common/Modal";
import axios from "axios";

export default function EventDetailPage() {
    const { eventId } = useParams<{ eventId: string }>();
    if (!eventId) return null;
    const { user } = useAppSelector((state: any) => state.auth);
    const roles = user?.roles || [];

    const canManage = roles.includes("ADMIN") || roles.includes("PHOTOGRAPHER");

    const [eventDetails, setEventDetails] = useState<any>(null);
    const [albums, setAlbums] = useState<any[]>([]);    
    const [photos, setPhotos] = useState<any[]>([]);
    const [showTag, setShowTag] = useState(false);
    const [file, setFile] = useState<any>(null);
    const [files, setFiles] = useState<any[]>([]);
    const navigate = useNavigate();

    const handleFileChange = (e : any) => {
        setFile(e.target.files[0]);
    };

    const handleMultipleFileChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setFiles(Array.from(e.target.files));
    };

    const handleUpload = async() => {
        if (!file){
            alert("Please select a file");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("event_id", eventId);

        try{
            const res = await axios.post("/photos/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            console.log("Upload successful: ", res.data);
            alert("Image uploaded successfully");

            const photosRes = await api.get(`/photos/?event_id=${eventId}`);
            setPhotos(photosRes.data);
        }catch(error){
            console.error("Error uploading image: ", error);
            alert("Error uploading image");
        }
    };

    const handleBulkUpload = async() => {
        if (files.length === 0){
            alert("Please select at least one file");
            return;
        }
        const formData = new FormData();
        files.forEach((file: any) => {
            formData.append("files", file);
        });
        formData.append("event_id", eventId);

        try{
            await api.post("/photos/bulk-upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            alert("Images uploaded successfully");
            const photosRes = await api.get(`/photos/?event_id=${eventId}`);
            setPhotos(photosRes.data);
        }catch(error){
            console.error("Error uploading images: ", error);
            alert("Error uploading images");
        }
    }

    useEffect(() => {
        api.get(`/events/`).then(res => {
            setEventDetails(res.data.find((event: any) => event.event_id === eventId)); 
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
                        <button className="text-[1.2rem] font-semibold px-4 py-2 rounded-lg" onClick={() => setShowTag(true)}>+ Tag People</button>
                    </div>
                )}
            </div>
            { canManage && (
                <div className="flex justify-center items-center gap-6">
                    <div className="my-4">
                        <input type="file" onChange={handleFileChange} />
                        <button className="bg-gray-300 px-4 py-2 w-[60vw] h-[30vh] rounded-lg" onClick={handleUpload}>
                            + Add Photo
                        </button>
                    </div>
                    <div className="my-4">
                        <input type="file" multiple onChange={handleMultipleFileChange} />
                        <button className="bg-gray-300 px-4 py-2 w-[60vw] h-[30vh] rounded-lg" onClick={handleBulkUpload}>
                            Upload Selected Photos
                        </button>
                    </div>
                </div>
                
            )}
            <div className="flex flex-col items-start justify-center gap-6">
                <div className="text-[1.1rem] font-semibold mb-2">Albums</div>
                <div className="grid grid-cols-1 gap-4 mb-4">
                    {albums.map((album) => (
                        <div key={album.album_id} className="border p-4 rounded shadow w-[80vw] h-[30vh] flex flex-col items-start justify-center gap-2" onClick={() => navigate(`/albums/${album.album_id}`)}>
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
                            <img src={photo.file_path_original} alt="photo" className="w-full h-full object-cover rounded" />
                        </div>
                    ))}
                </div>
            </div>
            <Modal isOpen={showTag} onClose={() => setShowTag(false)}>
                <ShowTag type="event" objectId={eventId} onClose={() => setShowTag(false)} />
            </Modal>
        </DashboardLayout>
    );
}