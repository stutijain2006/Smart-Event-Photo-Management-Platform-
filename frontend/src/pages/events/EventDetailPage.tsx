import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAppSelector } from "../../app/hooks";
import ShowTag from "../../components/tags/TagPeople";
import Modal from "../../components/common/Modal";
import DragDropUpload from "../../components/uploads/DragDropUpload";
import BatchProvider, {useBatch} from "../../components/batch/BatchProvider";
import BatchToolbar from "../../components/batch/BatchToolbar";
import SelectableCard from "../../components/batch/SelectableCard";
import { canManagePhotos } from "../../utils/permission/permissions";
import NewAlbum from "../../components/albums/NewAlbum";

export default function EventDetailPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const { user } = useAppSelector((state: any) => state.auth);
    if (!eventId) return null;
   const canManage = canManagePhotos(user?.roles);

    return(
        <BatchProvider>
            <EventDetailPageContent eventId={eventId} canManage={canManage} />
        </BatchProvider>
    );
}

function EventDetailPageContent({eventId, canManage}: any) {
    const [eventDetails, setEventDetails] = useState<any>(null);
    const [albums, setAlbums] = useState<any[]>([]);    
    const [photos, setPhotos] = useState<any[]>([]);
    const [showTag, setShowTag] = useState(false);
    const [showAlbumModal, setShowAlbumModal] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const { selectionMode, setSelectionMode , clear} = useBatch();
    const navigate = useNavigate();
    const [activeSelection, setActiveSelection] = useState<"album" | "photo" | null>(null);

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
            await api.post("/photos/upload", formData, {
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
            {selectionMode && (
                <BatchToolbar type={activeSelection ?? "photo"} canManage={canManage} />
            )}

            <div className="flex justify-center items-start px-4">
                <button onClick={onClose} className='text-[1.2rem] font-semibold'>←</button>
                <h2 className='text-[1.4rem] font-bold'>
                    {eventDetails.event_name}
                </h2>
                {canManage && (
                    <div className="flex gap-3">
                        <button className="text-[1.2rem] font-semibold px-4 py-2 rounded-lg" onClick={() => setShowAlbumModal(true)}>+ Create Album</button>
                        <button className="text-[1.2rem] font-semibold px-4 py-2 rounded-lg" onClick={() => setShowTag(true)}>+ Tag People</button>
                    </div>
                )}
            </div>
            { canManage && !selectionMode && (
                <div className="my-4 px-4 w-full">
                    <DragDropUpload onFilesSelected={setFiles} />
                    {files.length > 0 && (
                        <div className="mt-4 flex items-center gap-4">
                            <div className="text-[0.8rem] text-gray-600">
                                {files.length} file(s) selected
                            </div>
                            <button className="bg-gray-300 px-4 py-2 rounded-lg" onClick={handleBulkUpload}>
                                Upload Photos
                            </button>
                        </div>  
                    )}
                </div>
            )}

            {!selectionMode ? (
                <>
                <div className="flex justify-center items-center gap-6">
                    <button onClick={() => {
                        clear();
                        setSelectionMode(true);
                        setActiveSelection("album");
                    }} className="px-4 py-2 bg-gray-300 w-[20vw]">Select Albums</button>

                    <button onClick={() => {
                        clear();
                        setSelectionMode(true);
                        setActiveSelection("photo");
                    }} className="px-4 py-2 bg-gray-300 w-[20vw]">Select Photos</button>
                </div>
                </>
            ) : (
                <button onClick={() => {
                    clear();
                    setSelectionMode(false);
                    setActiveSelection(null);
                }} className="px-4 py-2 bg-gray-300 w-[20vw]">Cancel</button>
            )}

            <div className="flex flex-col items-start justify-center gap-6">
                <div className="text-[1.1rem] font-semibold mb-2">Albums</div>
                <div className="grid grid-cols-1 gap-4 mb-4">
                    {albums.map((album) => (
                        <SelectableCard key={album.album_id} 
                        id = {album.album_id} disabled={activeSelection !== "album"} onClick={() => {
                            if (!selectionMode){ navigate(`/albums/${album.album_id}`); }
                        }}>
                            <h3 className="font-semibold text-[1rem]">{album.album_name}</h3>
                            <p className="font-medium text-[0.8rem]">{album.description}</p>

                        </SelectableCard>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-start justify-center px-4 my-6">
                <div className="text-[1.1rem] font-semibold mb-2">Photos</div>
                <div className="grid grid-cols-4 gap-4 w-[90vw]">
                    {photos.map((photo) => (
                        <SelectableCard key={photo.photo_id} id = {photo.photo_id} disabled={activeSelection !== "photo"} onClick={ () => {
                            if (!selectionMode){ navigate(`/photos/${photo.photo_id}`);
                        }
                        }}>
                            <img src={photo.file_original} alt="photo" className="w-full h-full object-cover rounded" />
                        </SelectableCard>
                    ))}
                </div>
            </div>
            <NewAlbum 
                isOpen={showAlbumModal}
                eventId={eventId}
                onClose={() => setShowAlbumModal(false)}
                onCreated = {() => {
                    api.get(`/albums/?event_id=${eventId}`).then(res => setAlbums(res.data));
                }} />
            <Modal isOpen={showTag} onClose={() => setShowTag(false)}>
                <ShowTag type="event" objectId={eventId} onClose={() => setShowTag(false)} />
            </Modal>
        </DashboardLayout>
    );
}