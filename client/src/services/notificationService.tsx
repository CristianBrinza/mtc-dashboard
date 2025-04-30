import axios from "axios";

export interface Notification {
    _id: string;
    type: string;
    text: string;
    date: string;   // "DD.MM.YYYY"
    hour: string;   // "HH:mm"
    link?: string;
}

export interface GetNotificationsParams {
    n?: number;
    date?: string;
    start_hour?: string;
    end_hour?: string;
    type?: string;
}

const AUTH_HEADER = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
};

export const getNotifications = (params: GetNotificationsParams) =>
    axios.get<Notification[]>(
        `${import.meta.env.VITE_BACKEND}/api/notifications`,
        { params, ...AUTH_HEADER }
    );

export const createNotification = (data: Omit<Notification, "_id">) =>
    axios.post(
        `${import.meta.env.VITE_BACKEND}/api/notifications`,
        data,
        AUTH_HEADER
    );

export const updateNotification = (id: string, data: Partial<Notification>) =>
    axios.put(
        `${import.meta.env.VITE_BACKEND}/api/notifications/${id}`,
        data,
        AUTH_HEADER
    );

export const deleteNotification = (id: string) =>
    axios.delete(`${import.meta.env.VITE_BACKEND}/api/notifications/${id}`, AUTH_HEADER);
