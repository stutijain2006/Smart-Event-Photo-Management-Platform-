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
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = canManagePhotos(user?.roles);
    const navigate = useNavigate();
    const [photos, setPhotos] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [layout, setLayout] = useState<LayoutType>("grid-4");

    const { selectionMode, setSelectionMode} = useBatch();

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

    return(
        <DashboardLayout>
            {selectionMode && (
                <BatchToolbar type="photo" canManage={isAdmin} />
            )}

            <div className="p-6 flex flex-col items-center">
                <div className="flex gap-6 mb-6">
                    <button onClick={() => setSelectionMode(!selectionMode)} className="px-4 py-2 rounded-lg bg-gray-300" >
                        {selectionMode ? "Cancel" : "Select"}
                    </button>
                </div>

                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Photographer ID or Photo ID" className="px-4 py-2 rounded-lg mb-6 border w-[60vw]" />

                {filteredPhotos.length === 0 ? (
                    <p>No photos found</p>
                ): (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {filteredPhotos.map((photo) => (
                            <SelectableCard key={photo.photo_id} id={photo.photo_id} onClick={() => {
                                if (!selectionMode){
                                    navigate(`/photos/${photo.photo_id}`);
                                }
                            }} >
                                <img src={`${MEDIA_BASE}${photo.file_original}`} alt="photo" className="w-[20vw] h-[25vw] object-contain" />
                            </SelectableCard>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}