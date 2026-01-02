import React, {useState, useEffect} from 'react';
import api from '../../services/api';
import PhotoCard from '../../components/photos/PhotoCard';
import { useAppSelector } from '../../app/hooks';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import SelectableCard from '../../components/batch/SelectableCard';
import BatchProvider from '../../components/batch/BatchProvider';  

export default function MyFavourite() {
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await api.get(`/my/favourite`);
                setPhotos(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    return (
        <BatchProvider>
            <DashboardLayout>
                <div className='p-6'>
                    <div className='flex flex-col items-center justify-start gap-4 mb-6'>
                        <div className='flex justify-around items-center mx-4'>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-[1.3rem]"
                            >
                                ←
                            </button>
                            <h1 className="text-[1.5rem] font-bold">
                                My Favourite Photos ❤️
                            </h1>
                        </div>

                        {loading ? (
                            <p>Loading... </p>
                        ) : photos.length === 0 ? (
                            <p>You haven't liked any photos yet</p>
                        ): (
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                {photos.map((photo: any) => (
                                    <SelectableCard
                                        key={photo.photo_id}
                                        id= {photo.photo_id}
                                        onClick={() => navigate(`/photos/${photo.photo_id}`)}
                                    >
                                        <img src={`http://localhost:8000/${photo.file_original}`} alt="photo" className="w-[20vw] h-[40vh] object-contain" />
                                    </SelectableCard>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </BatchProvider>
    )
}

