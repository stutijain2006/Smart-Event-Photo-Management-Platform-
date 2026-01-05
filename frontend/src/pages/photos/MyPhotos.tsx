import React, { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import SelectableCard from "../../components/batch/SelectableCard";
import BatchProvider, { useBatch } from "../../components/batch/BatchProvider";
import { useNavigate } from "react-router-dom";
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
    const isUser = canManagePhotos(user?.roles);
    const navigate = useNavigate();
    const [photos, setPhotos] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [layout, setLayout] = useState<LayoutType>("grid-4");
    const [selectedTag, setSelectedTag] = useState<string>("all"); 

    const { selectionMode, setSelectionMode, clear} = useBatch();
    const allTags = Array.from(
        new Set(
            photos.flatMap((p) => p.tags ? p.tags.split(",").map((t:string) => t.trim()) : [])
        )
    );

    const fetchPhotos = async() => {
        const res = await api.get(`/photos/my/`);
        setPhotos(res.data);
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const filteredPhotos = photos.filter((p) => {
        const q = search.toLowerCase();
        const matchesSearch = (
            p.photographer_name?.toLowerCase().includes(q) || 
            p.photo_id.toLowerCase().includes(q) ||
            p.tags?.toLowerCase().includes(q)
        );

        const matchesTag = selectedTag === "all" || p.tags?.toLowerCase().includes(selectedTag?.toLowerCase());
        return matchesSearch && matchesTag;
    });

    const groupedByDate = filteredPhotos.reduce((acc: any, p: any) => {
        const date = p.uploaded_at;
        if (!acc[date]) acc[date] = [];
        acc[date].push(p);
        return acc;
    }, {});

    const renderPhoto = (photo:any) => (
        <SelectableCard key={photo.photo_id} id={String(photo.photo_id)} onClick={() => {
            if (!selectionMode){
                navigate(`/photos/${photo.photo_id}`);
            }
        }} >
            <div className="relative w-full h-full">
                <img src={photo.file_original} alt="photo" className="w-[20vw] h-[25vw] object-contain" />
            </div>
        </SelectableCard>
    );

    const renderLayout = () => {
        if (layout ==="timeline"){
            return Object.entries(groupedByDate).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()).map(([date, items] : any) => (
                <div key={date} className="mb-10 w-full">
                    <h2 className="text-[1.2rem] font-semibold mb-4">{date}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {items.map(renderPhoto)}
                    </div>
                </div>
            ));
        }

        const cols = layout === "grid-3" ? "grid-cols-3": layout === "grid-4" ? "grid-cols-4" : "grid-cols-4";

        return(
            <div className={`grid ${cols} gap-4`}>
                {filteredPhotos.map(renderPhoto)}
            </div>
        );
    };

    return(
        <>
        {selectionMode && (
                <BatchToolbar type="photo" canManage={isUser} />
            )}
        <DashboardLayout>

            <div className="p-6 flex flex-col items-center">
                <div className="flex gap-6 mb-6">
                    <button onClick={() => {setSelectionMode(!selectionMode)}}
                    className="px-4 py-2 rounded-lg bg-gray-300" >
                        {selectionMode ? "Cancel" : "Select"}
                    </button>

                    <select value={layout} onChange={(e) => setLayout(e.target.value as LayoutType)} className="px-4 py-2 rounded-lg border">
                        <option value="grid-3">Grid 3</option>
                        <option value="grid-4">Grid 4</option>
                        <option value="masonry">Masonry</option>
                        <option value="timeline">Timeline</option>
                    </select>
                </div>
                <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="px-4 py-2 border rounded-lg">
                    <option value ="all">All</option>
                    {allTags.map((tag) => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>

                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Photographer ID or Photo ID" className="px-4 py-2 rounded-lg mb-6 border w-[60vw]" />

                {filteredPhotos.length === 0 ? (
                    <p>No photos found</p>
                ): (
                    renderLayout()
                )}
            </div>
        </DashboardLayout>
        </>
    )
}