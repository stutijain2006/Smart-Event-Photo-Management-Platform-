import { useEffect, useRef } from "react";

export function useNotifications(onMessage: (data: any) => void){
    const socketRef = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (socketRef.current){
            return;
        }
        const socket = new WebSocket("ws://localhost:8000/ws/notifications/");
        socketRef.current = socket;
        socket.onopen=() => {
            console.log("WS connected")
        }
        socket.onmessage=(e) => {
            const data = JSON.parse(e.data);
            onMessage(data);
        };
        socket.onerror =(e) => {
            console.error("WS error", e);
        }
        socket.onclose = () => {
            console.log("WS closed");
            socketRef.current = null;
        }
        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, [onMessage]);
}