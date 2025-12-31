import React , {useState, useEffect} from 'react';
import api from '../../services/api';

interface MetaDataModalProps {
    photoId : string;
}

export default function MetadataModal({photoId} : MetaDataModalProps) {
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMetadata = async() => {
        setLoading(true);
        setError(null);
        try{
            const res = await api.get(`/photos/${photoId}/metadata-extraction`);
            setMetadata(res.data.metadata);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch metadata");
        } finally {
            setLoading(false);
        }
    };

    const extractMetaData = async() => {
        setLoading(true);
        setError(null);
        try{
            const res = await api.post(`/photos/${photoId}/metadata-extraction`);
            setMetadata(res.data.metadata);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch metadata");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchMetadata();
    }, [photoId]);

    if (loading) return (<p>Loading Metadata ...</p>);

    return(
        <div className="space-y-2">
            <h2 className="text-[1.2rem] font-bold">Photo Details </h2>
            {error && <p className="text-red-500">{error}</p>}
            {!metadata && (
                <div className='space-y-2'>
                    <p>No Metadata Available ...</p>
                    <button onClick={extractMetaData} className='bg-blue-500 text-white px-4 py-2 rounded-lg'>Extract Metadata</button>
                </div>
            )}

            {metadata && (
                Object.entries(metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center gap-2">
                        <span className="font-medium">{key.replaceAll('_', ' ')}:</span>
                        <span>{String(value || '')}</span>
                    </div>
                ))
            )}
        </div>
    );
}