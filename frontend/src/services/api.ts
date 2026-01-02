import axios from "axios";

const getCSRFToken = () => document.cookie.split("; ").find((row) => row.startsWith("csrftoken="))?.split("=")[1];

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
    },
});

export default api;