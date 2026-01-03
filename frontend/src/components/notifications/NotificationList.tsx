import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { markAsRead } from "../../features/notifications/notificationSlice";

interface NotificationListProps{
    onClose: () => void
}

export default function NotificationList({onClose} : NotificationListProps){
    const notifications = useAppSelector((state : any) => state.notifications.items);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleClick = async(notif :any) => {
        await api.post(`/notifications/${notif.notification_id}/read/`);
        dispatch(markAsRead(notif.notification_id));
        onClose();
        
        if (notif.type === "TAG_PHOTO" || notif.type === "NEW_PHOTO"){
            navigate(`/photos/${notif.object_id}`);
        }
        else if (notif.type === "TAG_ALBUM"){
            navigate(`/albums/${notif.object_id}`);
        }
        else if (notif.type === "TAG_EVENT"){
            navigate(`/events/${notif.object_id}`);
        }
    };

    return(
        <div className="bg-white shadow rounded-lg w-[30vw]">
            {notifications.length === 0 ? (
                <p className="p-4 text-gray-500">No Notifications</p>
            ): (
                notifications.map((n:any) => (
                    <div key={n.notification_id} onClick= {() => handleClick(n)} className={`p-3 cursor-pointer ${n.is_read ? "bg-white" : "bg-gray-400"}`} >
                        {n.message}
                    </div>
                ))
            )}
        </div>
    );
}