import  {useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PhotoCard from "../dashboard/widgets/PhotoCard";

export default function AlbumDetailPage() {
    const { albumId } = useParams();
    const navigate = useNavigate();
    const [photos, setPhotos] = useState<any[]>([]);

    useEffect(() => {
        api.get(`/photos/?album_id=${albumId}`).then(res => setPhotos(res.data)).catch(console.error);
    }, [albumId]);


    return (
        <DashboardLayout>
            <div className="p-6 flex flex-col items-center justify-center">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="text-[1.3rem]">←</button>
                    <div className="text-[1.3rem] font-bold ">Album </div>
                </div>

                {photos.length === 0? (
                    <p> No photos in this album ...</p>
                ): (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {photos.map((photo: any) => (
                        <PhotoCard key={photo.photo_id} photo={photo} />    
                    ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}