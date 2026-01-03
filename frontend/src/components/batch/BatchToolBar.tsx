import { useBatch } from "./BatchProvider";
import api from "../../services/api";
import { useState } from "react";
import Modal from "../common/Modal";
import DownloadPhotoModal from "../photos/DownloadPhotoModal";

type ExtraActions = {
    removeFromAlbum?: (ids : string[]) => Promise<void>;
}
type Props = {
    type: "photo" | "album" | "event"| "user";
    canManage: boolean;
    extraActions?: ExtraActions;
};

export default function BatchToolbar({ type, canManage, extraActions } : Props){
    const { selectedIds, clear } = useBatch();
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    if (selectedIds.length ===0 ) return null;

    const endPointMap: Record<string, string> = {
        photo: "/photos/batch-delete/",
        album: "/albums/batch-delete/",
        event: "/events/batch-delete/",
        user: "/people/batch-deactivate/"
    };

    const handleDelete = async() => {
        await api.post(endPointMap[type], {ids: selectedIds});
        alert("Photos Deleted Successfully");
        clear();
    };
    const handleLike = async() => {
        await Promise.all(
            selectedIds.map((id) => {
                api.post(`/photos/${id}/like/`);
            })
        )
        alert("Like Status Updated ");
        clear();
        window.location.reload();
    };

    const handleDownload = async(
        variant: "original" | "compressed" | "watermarked"
    ) => {
        for (const id of selectedIds){
            const res = await api.post(`/photos/${id}/download/`, {variant});
            window.open(res.data.file_url, "_blank");
        }
        alert("Photos Downloaded Successfully");
        setShowDownloadModal(false);
    };

    const handleRemoveFromAlbum = async() => {
        if (!extraActions?.removeFromAlbum) return;
        await extraActions.removeFromAlbum(selectedIds);
        alert("Photos removed from album successfully");
        clear();
    };

    return(
        <>
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg px-6 py-3 flex gap-4 z-50">
            {(type === "photo") && (
                <>
                <button onClick={() => setShowDownloadModal(true)} className="px-4 py-2 border">Download</button>
                <button onClick={handleLike} className="px-4 py-2 border">Like</button>
                {extraActions?.removeFromAlbum && canManage && (
                    <button onClick={handleRemoveFromAlbum} className="text-red-400 px-4 py-2 border" >Remove from Album</button>
                )}
                </>
            )}
            {canManage && <button className="text-red-600 px-4 py-2 border" onClick={handleDelete} >
                { type === "user" ? "Deactivate" : "Delete"}
            </button>}

            <button onClick={clear}>Cancel</button>

        </div>
        <Modal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} >
            <DownloadPhotoModal onDownload={handleDownload} />
        </Modal>
        </>
    );
}