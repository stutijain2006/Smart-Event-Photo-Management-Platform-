import { useNavigate } from "react-router-dom";

export default function AlbumCard({ album } : any){
    const navigate = useNavigate();

    const handleClick = () => {
        if (album.isVirtual){
            navigate(album.route);
        }
        else{
            navigate(`/albums/${album.album_id}`);
        }
    };

    return(
        <div onClick={handleClick} className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-lg">
            <div className="h-[15vh] bg-gray-200 rounded mb-3 flex items-center justify-center">📁</div>
            <div className="font-semibold">{album.album_name}</div>
        </div>
    );
}