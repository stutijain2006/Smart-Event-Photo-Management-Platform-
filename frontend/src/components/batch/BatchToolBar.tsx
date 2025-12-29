import { useBatch } from "./BatchProvider";
type Props = {
    type: "photo" | "album" | "event"| "user";
    canManage: boolean;
};

export default function BatchToolbar({ type, canManage } : Props){
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

    return(
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-xl px-6 py-3 flex gap-4">
            {type === "photo" && (
                <>
                <button>Download</button>
                <button>Like</button>
                </>
            )}
            {canManage && <button className="text-red-600" onClick={handleDelete}>Delete</button>}

            <button onClick={clear}>Cancel</button>
        </div>
    );
}