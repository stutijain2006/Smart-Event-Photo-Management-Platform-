import React, { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import SelectableCard from "../../components/batch/SelectableCard";
import BatchProvider, { useBatch } from "../../components/batch/BatchProvider";
import { useNavigate } from "react-router-dom";
import DownloadPhotoModal from "../../components/photos/DownloadPhotoModal";
import Modal from "../../components/common/Modal";
import { useAppSelector } from "../../app/hooks";
import { canManagePhotos } from "../../utils/permission/permissions";
import BatchToolbar from "../../components/batch/BatchToolbar";

type LayoutType = "grid-3" | "grid-4" | "masonry" | "timeline";
const MEDIA_BASE = "http://127.0.0.1:8000";

export default function MyPhotos(){
    return(
        <BatchProvider>
            <MyPhotosContent />
        </BatchProvider>
    )
}
function MyPhotosContent(){
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = canManagePhotos(user?.roles);

    const [photos, setPhotos] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [layout, setLayout] = useState<LayoutType>("grid-4");
    const [showDownload, setShowDownload] = useState(false);
    const [selectedPhotoIds, setSelectedPhotoIds] = useState<any>(null);
    const { selectionMode, setSelectionMode, selectedIds} = useBatch();

    const fetchPhotos = async() => {
        const res = await api.get(`/photos/my/`);
        setPhotos(res.data);
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const filteredPhotos = photos.filter((p) => {
        const q = search.toLowerCase();
        return(
            p.photographer_name?.toLowerCase().includes(q) || 
            p.photo_id.toLowerCase().includes(q)
        );
    });

    const toggleLike = async(photoId : string) => {
        await api.post(`/photos/${photoId}/like/`);
        setPhotos((prev : any[]) => 
            prev.map((p) => 
                p.photo_id === photoId ? {
                    ...p, 
                    liked_by_me : !p.liked_by_me,
                    like_count: p.liked_by_me ? p.like_count - 1 : p.like_count + 1
                }
                : p
            )
        );
    };

    const deletePhoto = async(photoId : string) => {
        if (!window.confirm("Delete this photo?")) return;
        await api.delete(`/photos/${photoId}/`);
        setPhotos((prev) : any => prev.filter((p) => p.photo_id !== photoId));
    };

    const openDownload = (photo: any) => {
        setSelectedPhotoIds(photo);
        setShowDownload(true);
    };

    const groupByDate = filteredPhotos.reduce((acc: any, photo: any) => {
        const date = photo.uploaded_at;
        if (!acc[date]) acc[date] = [];
        acc[date].push(photo);
        return acc;
    }, {});

    const renderPhoto = (photo: any) => (
        <div key={photo.photo_id} className="relative group cursor-pointer mb-4">
            <SelectableCard id={photo.photo_id} onClick={() => {if (!selectionMode) {
                navigate(`/photos/${photo.photo_id}`)}}} >
                <img 
                src={`${MEDIA_BASE}${photo.file_watermarked || photo.file_original}`} 
                className="w-full h-full object-cover" />
            </SelectableCard>

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition">
                    <>
                    <button onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(photo.photo_id);
                    }} className="bg-white px-4 py-2 rounded-lg">
                        {photo.liked_by_me ? "Unlike" : "Like"}
                    </button>

                    <button onClick={(e) => {
                        e.stopPropagation();
                        openDownload(photo);
                    }} className="bg-white px-4 py-2 rounded-lg">Download </button>

                    </>
                {isAdmin && (
                    <button onClick={(e) => {
                        e.stopPropagation();
                        deletePhoto(photo.photo_id);
                    }} className="bg-white px-4 py-2 rounded-lg">Delete</button>
                )}
            </div>
        </div>
    );

    const renderLayout = () =>{
        if (layout === "timeline"){
            return Object.entries(groupByDate).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()).map(([date, items]: any) => (
                <div key={date} className="mb-10 w-full">
                    <h2 className="text-2xl font-bold mb-4">{date}</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {items.map(renderPhoto)}
                    </div>      
                </div>
            ));
        }

        if(layout === "masonry"){
            return (
                <div className="grid grid-cols-4 gap-4">
                    {filteredPhotos.map(renderPhoto)}
                </div>
            );
        }

        const cols = layout === "grid-3"  ? "grid-cols-3" : "grid-cols-4";
        return (
            <div className={`grid ${cols} gap-4`}>
                {filteredPhotos.map(renderPhoto)}
            </div>
        );
    };
    
    return(
        <DashboardLayout>
            <div className="w-full max-w-7xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-[1.4rem] font-bold"> My Photos</h1>

                    <select value={layout} onChange={(e) => setLayout(e.target.value as LayoutType)} className="border px-4 py-2 rounded-lg">
                        <option value="grid-3">Grid 3</option>
                        <option value="grid-4">Grid 4</option>
                        <option value="masonry">Masonry</option>
                        <option value="timeline">Timeline</option>
                    </select>
                </div>

                <button onClick={() => setSelectionMode(!selectionMode)} className="border px-4 py-2 rounded-lg">{selectionMode ? "Cancel" : "Select"}</button>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Photographer or Photo ID" className="border p-2 rounded-lg w-full mb-6" />

                {selectionMode && (
                    <BatchToolbar type="photo" canManage={isAdmin} extraActions={{
                        like: async(ids: string[]) => {
                            for (const id of ids){
                                await api.post(`/photos/${id}/like/`);
                            }
                            fetchPhotos();
                        },
                        download: async(ids: string[]) => {
                            alert("Batch Download coming soon...")
                        },
                    }}
                    />
                )}

                {filteredPhotos.length === 0 ? (
                    <p className="text-gray-500">No photos found</p>
                ) : (
                    renderLayout()
                )}

                {showDownload && selectedPhotoIds && (
                    <Modal isOpen={showDownload} onClose={() => setShowDownload(false)}>
                        <DownloadPhotoModal onDownload={(variant) => {
                            api.post(`/photos/${selectedPhotoIds.photo_id}/download/`, { variant });
                        }}
                        />
                    </Modal>
                )}
            </div>
        </DashboardLayout>
    )
}