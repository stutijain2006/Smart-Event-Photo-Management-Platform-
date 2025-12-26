import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function PhotoDetailPage(){
    const { photoId } = useParams();
    const navigate = useNavigate();
    const [photo, setPhoto] = useState<any>(null);
    const [comments, useComments] = useState<any[]>([]);

    useEffect(() => {
        api.get(`/photos/`).then(res => setPhoto(res.data.find((photo: any) => photo.photo_id === Number(photoId))));
        api.get(`/photos/${photoId}/comments`).then(res => useComments(res.data));
    }, [photoId]);

    const likePhoto = async() => {
        await api.post(`/photos/${photoId}/like/`);
        setPhoto((prev: any) => {
            return {...prev, like_count: prev.like_count + 1}
        });
    }

    const downloadPhoto = async() => {
        await api.post(`/photos/${photoId}/download/`, {variant: "original"});
        setPhoto((prev:any) => {
            return {...prev, download_count: prev.download_count + 1}
        })
        window.open(photo.file_path_original, "_blank");
    };

    if (!photo) return (<div>Loading...</div>);

    return (
        <DashboardLayout>
            <div className="flex flex-col justify-center items-center p-6">
                <div className="flex justify-around items-center px-4">
                    <button onClick={() => navigate(-1)} className="text-[1.3rem]">←</button>
                    <div className="text-[1.3rem] font-bold">{photo.taken_at}</div>
                </div>
                <img src= {photo.file_path_original} alt= "photo" className="w-[70vw] h-[70vh] object-contain rounded-lg" />
                <div className="flex items-start justify-around px-4"> 
                    <button onClick={sharePhoto} className="bg-gray-300 p-2 rounded-lg"> Share </button>
                    <div className="flex justify-center items-center gap-3">
                        <button onClick={likePhoto} className="bg-gray-300 p-2 rounded-lg"> ❤️ Like ({photo.like_count})</button>
                        <button onClick={moreDetails} className="bg-gray-300 p-2 rounded-lg"> 👀 Details</button>
                        <button onClick={downloadPhoto} className="bg-gray-300 p-2 rounded-lg"> ⬇ Download ({photo.download_count})</button>
                    </div>
                    <div className="bg-gray-300 p-2 rounded-lg" > Comments</div>
                </div>
            </div>
        </DashboardLayout>
    )
}

