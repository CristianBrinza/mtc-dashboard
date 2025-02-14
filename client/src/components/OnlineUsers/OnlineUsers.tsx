import React, { useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../../context/AuthContext";
import styles from "./OnlineUsers.module.css";

// Correct backend socket URL
const socket = io("http://localhost:5020", { transports: ["websocket", "polling"] });

const OnlineUsers: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [onlineUsers, setOnlineUsers] = useState<{ username: string; profilePicture: string }[]>([]);

    useEffect(() => {
        if (user) {
            socket.emit("userOnline", {
                id: user.id,
                username: user.username,
                profilePicture: user.profilePicture || ""
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

    return (
        <div className={styles.online_now}>
            {onlineUsers.map((onlineUser, index) => (
                <img
                    key={index}
                    src={onlineUser.profilePicture
                        ? `${import.meta.env.VITE_BACKEND}${onlineUser.profilePicture}`
                        : "/default-avatar.png"}
                    alt={onlineUser.username}
                    className={styles.online_now_picture}
                />
            ))}
        </div>
    );
};

export default OnlineUsers;
