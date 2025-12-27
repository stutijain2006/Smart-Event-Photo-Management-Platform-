import  {useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PhotoCard from "../../components/photos/PhotoCard";
import { useAppSelector } from "../../app/hooks";
import ShowTag from "../../components/tags/TagPeople";
import Modal from "../../components/common/Modal";

export default function AlbumDetailPage() {
    const { albumId } = useParams<{ albumId: string }>();
    const navigate = useNavigate();
    const [photos, setPhotos] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [showTag, setShowTag] = useState(false);


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

    useEffect(() => {
        api.get(`/photos/?album_id=${albumId}`).then(res => setPhotos(res.data)).catch(console.error);
    }, [albumId]);

    const filteredPhotos = photos.filter((photo: any) => photo.photo_id.toLowerCase().includes(search.toLowerCase()));


    return (
        <DashboardLayout>
            <div className="p-6 flex flex-col items-center justify-center">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="text-[1.3rem]">←</button>
                    <div className="text-[1.3rem] font-bold ">Album </div>
                </div>

                {canManage && (
                    <div className="flex flex-col justify-center items-center">
                        <button className="flex gap-4 bg-gray-300 px-4 py-2 w-[40vw] h-[40vh] rounded-lg"> + Upload Photos</button>
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