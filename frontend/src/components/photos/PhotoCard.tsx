import { useNavigate } from "react-router-dom";

export default function PhotoCard ({photo}: any) {
    const navigate = useNavigate();

    return(
        <div className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-lg" onClick={() => navigate(`/photos/${photo.photo_id}`)} >
            <img src={photo.file_original} alt="photo" className="w-full h-[10vh] object-cover" />
        </div>
    );
}