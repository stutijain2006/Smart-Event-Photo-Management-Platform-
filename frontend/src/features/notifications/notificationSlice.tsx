import { createSlice , PayloadAction } from "@reduxjs/toolkit";

interface Notification{
    notification_id : string;
    message : string;
    type: string;
    object_id : string | null;
    created_at : string;
    is_read?: boolean
}

interface NotificationState {
    items: Notification[];
    unreadCount: number;
}

const initialState: NotificationState = {
    items: [],
    unreadCount: 0,
}

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        addNotification(state, action: PayloadAction<Notification>){
            state.items.unshift(action.payload);
            state.unreadCount += 1
        },
        markAsRead(state, action: PayloadAction<string>){
            const notif = state.items.find(
                n => n.notification_id === action.payload
            );
            if (notif && !notif.is_read){
                notif.is_read = true;
                state.unreadCount -= 1
            }
        },
        setNotifications(state, action: PayloadAction<Notification[]>){
            state.items = action.payload;
            state.unreadCount = action.payload.filter(n => !n.is_read).length;
        },
        resetNotifications(state){
            state.items= [];
            state.unreadCount =0;
        }
    },
});

export const {
    addNotification, 
    markAsRead,
    setNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;