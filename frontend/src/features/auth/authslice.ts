import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import  {getMe} from "./authAPI";

export interface User {
    user_id : string;
    email_id: string;
    person_name: string;
    roles: string[];
    is_email_verified: boolean;
}

interface AuthState {
    user : User | null;
    roles : [];
    isAuthenticated : boolean;
    loading : boolean;
    error : string | null;
}

const initalState : AuthState = {
    user : null,
    roles : [],
    isAuthenticated : false,
    loading : false,
    error : null
}

export const fetchMe = createAsyncThunk("auth/fetch-me", async () => {
    const response = await getMe();
    return response.data
})

const authSlice = createSlice({
    name : "auth",
    initialState : initalState,
    reducers : {
        logoutSuccess(state){
            state.user = null;
            state.roles = [];
            state.isAuthenticated = false;
        },
    },
    extraReducers : (builder) => {
        builder
        .addCase(fetchMe.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchMe.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user || null;
            state.roles = action.payload.roles || [];
            state.isAuthenticated = true;
            state.error = null
        })
        .addCase(fetchMe.rejected, (state) => {
            state.loading = false;
            state.user = null;
            state.error = "Invalid credentials";
            state.isAuthenticated = false
        })
    }
});

const authReducer = authSlice.reducer;

export const { logoutSuccess } = authSlice.actions;
export default authReducer;

