import React, { useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../../context/AuthContext";
import styles from "./OnlineUsers.module.css";

// Correct backend socket URL
const socket = io(`${import.meta.env.VITE_BACKEND}`, { transports: ["websocket", "polling"] });

const OnlineUsers: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [onlineUsers, setOnlineUsers] = useState<{ username: string; profilePicture?: string }[]>([]);

    useEffect(() => {
        if (user) {
            socket.emit("userOnline", {
                id: user.id,
                username: user.username,
                profilePicture: user.profilePicture || "",
            });

            socket.on("updateOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            return () => {
                socket.emit("userOffline", user.id);
                socket.disconnect();
            };
        }
    }, [user]);

    const getInitials = (username: string) => {
        if (!username) return "";
        const nameParts = username.split(" ");
        return nameParts.length > 1
            ? nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase()
            : username.substring(0, 2).toUpperCase();
    };

    return (
        <div className={styles.online_now}>
            {onlineUsers.map((onlineUser, index) => (
                <div key={index} className={styles.userContainer}>
                    {onlineUser.profilePicture ? (
                        <img
                            src={`${import.meta.env.VITE_BACKEND}${onlineUser.profilePicture}`}
                            alt={onlineUser.username}
                            className={styles.online_now_picture}
                        />
                    ) : (
                        <div className={styles.initialsCirclePopup}>
                            {getInitials(onlineUser.username)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default OnlineUsers;
