import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function NotificationList({notification, onClose} : any){
    const navigate = useNavigate();

    const handleClick = async(notif :any) => {
        if (!notif.is_read){
            await api.post(`/notifications/${notif.notification_id}/read/`);
        }

        if (notif.type === "TAG_PHOTO"){
            navigate(`/photos/${notif.object_id}`);
        }
        else if (notif.type === "TAG_ALBUM"){
            navigate(`/albums/${notif.object_id}`);
        }
        else if (notif.type === "TAG_EVENT"){
            navigate(`/events/${notif.object_id}`);
        }
        onClose();
    };

    return(
        <div className="bg-white shadow rounded-lg w-[30vw]">
            {notification.map((n:any) => (
                <div key={n.notification_id} onClick= {() => handleClick(n)} className={`p-3 cursor-pointer ${n.is_read ? "bg-white" : "bg-gray-400"}`} >
                    {n.message}
                </div>
            ))}
        </div>
    );
}