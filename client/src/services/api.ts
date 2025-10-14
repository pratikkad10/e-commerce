import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    withCredentials: true,
});

// Auth APIs
export const loginUser = (data: {
    email: string;
    password: string;
}) => api.post("/auth/login", data);


export const signupUser = (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    storeName?: string;
    role?: string;
}) => api.post("/auth/register", data);


export const getProfile = () => api.get("/users/profile");


export const logoutUser = () => api.post("/auth/logout");


export const resetPassword = (data: any) => api.post("/auth/reset-password", data);