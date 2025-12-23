import api from "../../services/api";

export const registerUser = (data: {
    person_name: string,
    email_id: string,
    password: string
}) => api.post("/auth/register", data, {
    headers: {
        "Content-Type": "application/json"
    }
});

export const verifyOTP = (data : {
    email_id: string,
    otp: string
}) => api.post("/auth/verify-email", data, {
    headers: {
        "Content-Type": "application/json"
    }
});

export const loginUser = (data: {
    email_id: string,
    password: string
}) => api.post("/auth/login", data, {
    headers: {
        "Content-Type": "application/json"
    }
});

export const logoutUser = () => api.get("/auth/logout");

export const getomniportLoginURL = () => {
    api.get("auth/omniport-login-url")
};

export function getMe () {
    return api.get("/auth/me");
}
