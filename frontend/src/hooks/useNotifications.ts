import { useEffect, useRef } from "react";
import { useAppDispatch } from "../app/hooks";
import { addNotification } from "../features/notifications/notificationSlice";

export function useNotifications(onMessage: (data: any) => void){
    const dispatch = useAppDispatch();
    const socketRef = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (socketRef.current){
            return;
        }
        const socket = new WebSocket("ws://localhost:8000/ws/notifications/");
        socketRef.current = socket;
        socket.onopen=() => {
            console.log("WS opened");
        }
        socket.onmessage=(e) => {
            const data = JSON.parse(e.data);
            dispatch(addNotification(data));
        };
        socket.onerror =(e) => {
            console.error("WS error", e);
        }
        return () => {
            socket.close();
        };
    }, [dispatch]);
}