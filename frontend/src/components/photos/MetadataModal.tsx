export default function MetadataModal({metadata} : any) {
    if (!metadata) return (<p> No Metadata available</p>);

    return(
        <div className="space-y-2">
            <h2 className="text-[1.2rem] font-bold">Photo Details </h2>
            {Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center gap-2">
                    <span className="font-medium">{key}:</span>
                    <span>{String(value || '')}</span>
                </div>
            ))}
        </div>
    );
}