import  {useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PhotoCard from "../../components/photos/PhotoCard";
import { useAppSelector } from "../../app/hooks";
import ShowTag from "../../components/tags/TagPeople";
import Modal from "../../components/common/Modal";
import DragDropUpload from "../../components/uploads/DragDropUpload";

import BatchProvider, { useBatch } from "../../components/batch/BatchProvider";
import BatchToolbar from "../../components/batch/BatchToolbar";
import SelectableCard from "../../components/batch/SelectableCard";
import { canManagePhotos } from "../../utils/permission/permissions";

export default function AlbumDetailPage() {
    const { albumId } = useParams<{ albumId: string }>();

    const user = useAppSelector((state) => state.auth.user);
    const canManage = canManagePhotos(user?.roles);

    if (!albumId){
        return (
            <DashboardLayout>
                <div> Invalid Album</div>
            </DashboardLayout>
        )
    }

    return (
        <BatchProvider>
            <AlbumContent albumId={albumId} canManage={canManage} />
        </BatchProvider>
    );
}

function AlbumContent({ albumId, canManage} : {albumId : string, canManage: boolean}) {

    const navigate = useNavigate();
    const {selectionMode, setSelectionMode} = useBatch();
    const [photos, setPhotos] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [showTag, setShowTag] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fetchPhotos = async() => {
        const response = await api.get(`/albums/${albumId}/photos`);
        setPhotos(response.data);
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const handleFilesSelected = async(files : File[]) => {
        if (!canManage) return;
        setUploading(true);
        const formData = new FormData();

        files.forEach((file: any) => {
            formData.append("files", file);
        });

        formData.append("album_id", albumId);

        try{
            await api.post("/photos/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            await fetchPhotos();
        } catch(err) {
            console.error(err);
            alert("Error uploading images");
        } finally {
            setUploading(false);
        }
    }

    const filteredPhotos = photos.filter((photo: any) => photo.photo_id.toLowerCase().includes(search.toLowerCase()));

    return (
        <DashboardLayout>
            {selectionMode && (
                <BatchToolbar type= "photo" canManage={canManage} extraActions={{removeFromAlbum: async (ids: string[]) => {
                    await api.post(`/albums/${albumId}/photos/remove`, {photo_ids: ids});
                await fetchPhotos();
                },
                }} />
            )}
            <div className="p-6 flex flex-col items-center justify-center">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="text-[1.3rem]">←</button>
                    <div className="text-[1.3rem] font-bold ">Album </div>
                </div>

                <div className="flex justify-center items-center gap-6">
                    <button onClick={() => setSelectionMode(!selectionMode)} className="px-4 py-2 rounded-lg bg-gray-300">
                        {selectionMode? "Cancel" : "Select"}
                    </button>
                    {canManage && (
                        <button className="flex gap-4 bg-gray-300 px-4 py-2 w-[10vw] h-[40vh] rounded-lg" onClick={() => setShowTag(true)}>+ Tag People</button>
                    )}
                </div>

                {canManage && !selectionMode && (
                    <div className="flex flex-col justify-center items-center w-[60vw]">
                        <DragDropUpload onFilesSelected={handleFilesSelected} />
                        {uploading && (
                            <div className="flex gap-4 bg-gray-300 px-4 py-2 w-[40vw] h-[40vh] rounded-lg">Uploading...</div>
                        )}
                    </div>
                )}

                <div className="mb-6">
                    <input type = "text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="border p-2 rounded-lg w-[40vw]"></input>
                </div>

                {filteredPhotos.length === 0? (
                    <p> No photos in this album ...</p>
                ): (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {filteredPhotos.map((photo: any) => (
                        <SelectableCard key={photo.photo_id} id={photo.photo_id} onClick={() => {
                            if (!selectionMode) navigate(`/photos/${photo.photo_id}`);
                        }} > 
                            <img src={photo.file_path_thumbnail || photo.file_path_original} alt="photo" className="w-[10vw] h-[10vh] object-cover" />
                        </SelectableCard>    
                    ))}
                    </div>
                )}
            </div>
            <Modal isOpen={showTag} onClose={() => setShowTag(false)}><ShowTag  type="album" objectId={albumId} onClose = {() => setShowTag(false)} /></Modal>
        </DashboardLayout>
    );
}