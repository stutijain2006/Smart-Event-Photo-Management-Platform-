import  {useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PhotoCard from "../../components/photos/PhotoCard";
import { useAppSelector } from "../../app/hooks";
import ShowTag from "../../components/tags/TagPeople";
import Modal from "../../components/common/Modal";
import DragDropUpload from "../../components/uploads/DragDropUpload";
import { upload } from "@testing-library/user-event/dist/upload";

export default function AlbumDetailPage() {
    const { albumId } = useParams<{ albumId: string }>();
    const navigate = useNavigate();
    const [photos, setPhotos] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [showTag, setShowTag] = useState(false);
    const [uploading, setUploading] = useState(false);

    const user = useAppSelector((state) => state.auth.user);
    const roles = user?.roles || [];
    const canManage = roles.includes("ADMIN") || roles.includes("PHOTOGRAPHER");

    if (!albumId){
        return (
            <DashboardLayout>
                <div> Invalid Album</div>
            </DashboardLayout>
        )
    }

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
            <div className="p-6 flex flex-col items-center justify-center">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="text-[1.3rem]">←</button>
                    <div className="text-[1.3rem] font-bold ">Album </div>
                </div>

                {canManage && (
                    <div className="flex flex-col justify-center items-center w-[60vw]">
                        <DragDropUpload onFilesSelected={handleFilesSelected} />
                        {uploading && (
                            <div className="flex gap-4 bg-gray-300 px-4 py-2 w-[40vw] h-[40vh] rounded-lg">Uploading...</div>
                        )}
                        <button className="flex gap-4 bg-gray-300 px-4 py-2 w-[10vw] h-[40vh] rounded-lg" onClick={() => setShowTag(true)}>+ Tag People</button>
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
                        <PhotoCard key={photo.photo_id} photo={photo} />    
                    ))}
                    </div>
                )}
            </div>
            <Modal isOpen={showTag} onClose={() => setShowTag(false)}><ShowTag  type="album" objectId={albumId} onClose = {() => setShowTag(false)} /></Modal>
        </DashboardLayout>
    );
}