import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import CommentsModal from "../../components/photos/CommentsModal";
import DownloadPhotoModal from "../../components/photos/DownloadPhotoModal";
import MetadataModal from "../../components/photos/MetadataModal";
import ShareModal from "../../components/photos/ShareModal";
import Modal from "../../components/common/Modal";

export default function PhotoDetailPage(){
    const params = useParams();
    const photoId = params.photoId;
    const navigate = useNavigate();
    const [photo, setPhoto] = useState<any>(null);
    const [showShare, setShowShare] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showDownload, setShowDownload] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);

    const loadData= async() => {
        const photos= await api.get(`/photos/`);
        setPhoto(photos.data.find((p: any) => p.photo_id === photoId));

        const c = await api.get(`/photos/${photoId}/comments`);
        setComments(c.data);
    };

    useEffect(() => {
        loadData();
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

    if (!photoId) return (<div>Loading...</div>);

    return (
        <DashboardLayout>
            <div className="flex flex-col justify-center items-center p-6">
                <div className="flex justify-around items-center px-4">
                    <button onClick={() => navigate(-1)} className="text-[1.3rem]">←</button>
                    <div className="text-[1.3rem] font-bold">{photo.taken_at}</div>
                </div>
                <img src= {photo.file_path_original} alt= "photo" className="w-[70vw] h-[70vh] object-contain rounded-lg" />
                <div className="flex items-start justify-around px-4"> 
                    <button onClick={() => setShowShare(true)} className="bg-gray-300 p-2 rounded-lg"> Share </button>
                    <div className="flex justify-center items-center gap-3">
                        <button onClick={likePhoto} className="bg-gray-300 p-2 rounded-lg"> ❤️ Like ({photo.like_count})</button>
                        <button onClick={() => setShowDetails(true)} className="bg-gray-300 p-2 rounded-lg"> 👀 Details</button>
                        <button onClick={() => setShowDownload(true)} className="bg-gray-300 p-2 rounded-lg"> ⬇ Download ({photo.download_count})</button>
                    </div>
                    <div className="bg-gray-300 p-2 rounded-lg" onClick={() => setShowComments(true)} > Comments</div>
                </div>
            </div>

            <Modal isOpen={showShare} onClose={() => setShowShare(false)}><ShareModal photoId={photoId} /></Modal>
            <Modal isOpen={showDetails} onClose={() => setShowDetails(false)}><MetadataModal metadata={photo.photo_metadata} /></Modal>
            <Modal isOpen={showDownload} onClose={() => setShowDownload(false)}><DownloadPhotoModal onDownload = {downloadPhoto} /></Modal>
            <Modal isOpen={showComments} onClose={() => setShowComments(false)}><CommentsModal 
            photoId={photoId} refresh={loadData} comments={comments} /></Modal>
        </DashboardLayout>
    );
}

