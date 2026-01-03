import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authslice";
import notificationsSlice from "../features/notifications/notificationSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        notifications: notificationsSlice
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;