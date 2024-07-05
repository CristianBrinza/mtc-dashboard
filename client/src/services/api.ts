// src/services/api.ts
import axios from 'axios';

// Base URL for the API
const API_URL = 'http://localhost:5001/api';

// Create an Axios instance
const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// API function to login a user
export const loginUser = (credentials: { username: string; password: string }) => {
    return api.post('/auth/login', credentials);
};

// API function to register a user
export const registerUser = (user: { username: string; password: string; role: string }) => {
    return api.post('/auth/register', user);
};

// API function to fetch user profile
export const fetchUserProfile = () => {
    return api.get('/profile');
};

// API function to update user profile
export const updateUserProfile = (data: { name: string; surname: string; password?: string; avatar: string }) => {
    return api.put('/profile', data);
};

export default api;
