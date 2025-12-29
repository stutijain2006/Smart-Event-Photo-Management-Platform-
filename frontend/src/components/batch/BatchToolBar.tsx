import { useBatch } from "./BatchProvider";
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
    if (selectedIds.length ===0 ) return null;

    const handleDelete = async() => {
        await fetch(`/api/${type}s/batch-delete`, {
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ids: selectedIds})
        });
        clear();
    };
    const handleLike = async() => {
        await fetch(`/api/${type}s/batch-like`, {
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ids: selectedIds})
        });
        clear();
    };

    const handleDownload = async() => {
        await fetch(`/api/${type}s/batch-download`, {
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ids: selectedIds})
        });
    }

    const handleRemoveFromAlbum = async() => {
        if (!extraActions?.removeFromAlbum) return;
        await extraActions.removeFromAlbum(selectedIds);
        clear();
    };

    return(
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-xl px-6 py-3 flex gap-4">
            {type === "photo" && (
                <>
                <button onClick={handleDownload}>Download</button>
                <button onClick={handleLike}>Like</button>
                {extraActions?.removeFromAlbum && canManage && (
                    <button onClick={handleRemoveFromAlbum} className="text-red-400">Remove from Album</button>
                )}
                </>
            )}
            {canManage && <button className="text-red-600" onClick={handleDelete}>Delete</button>}

            <button onClick={clear}>Cancel</button>
        </div>
    );
}