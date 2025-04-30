import { useState, useEffect, useContext } from "react";
import Menu from "../../components/Menu/Menu.tsx";
import Dashboard from "../../components/Dashboard/Dashboard.tsx";
import Input from "../../components/input/Input.tsx";
import Button from "../../components/Button.tsx";
import { AuthContext } from "../../context/AuthContext.tsx";
import {
    getNotifications,
    // deleteNotification,
    Notification,
} from "../../services/notificationService.tsx";
import styles from "./Notifications.module.css";
import Icon, { icons } from "../../components/Icon.tsx";

export default function NotificationsPage() {
    const breadcrumbItems = [
        { label: "Admin" },
        { label: "Rețele sociale" },
        { label: "Notifications" },
    ];
    const { user } = useContext(AuthContext)!;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [n, setN] = useState(10);
    const [date, setDate] = useState("");
    const [startHour, setStartHour] = useState("00:00");
    const [endHour, setEndHour] = useState("23:59");
    const [typeFilter, setTypeFilter] = useState("");
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        try {
            const resp = await getNotifications({
                n,
                date: date || undefined,
                start_hour: startHour,
                end_hour: endHour,
                type: typeFilter || undefined,
            });
            let data = resp.data;
            if (search) {
                const term = search.toLowerCase();
                data = data.filter((x) => x.text.toLowerCase().includes(term));
            }
            setNotifications(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user && user.roles.includes("admin")) {
            fetchData();
        }
    }, [n, date, startHour, endHour, typeFilter, search]);

    return (
        <>
            <Menu active="Rețele sociale" />
            <Dashboard
                breadcrumb={breadcrumbItems}
                menu="social"
                active="Notifications"
            >
                <div className={styles.container}>
                    <div className={styles.filters}>
                        <div>
                            <label>Count:</label>
                            <select className={styles.page_select}
                                value={n}
                                onChange={(e) => setN(Number(e.target.value))}
                            >
                                {[5, 10, 20, 50].map((val) => (
                                    <option key={val} value={val}>
                                        {val}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Date:</label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Start Hour:</label>
                            <Input
                                type="time"
                                value={startHour}
                                onChange={(e) => setStartHour(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>End Hour:</label>
                            <Input
                                type="time"
                                value={endHour}
                                onChange={(e) => setEndHour(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Type:</label>
                            <Input
                                type="text"
                                placeholder="info | error | success | warning"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Search:</label>
                            <Input
                                type="text"
                                placeholder="Search text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.list}>
                        {notifications.map((noti) => {
                            const type = noti.type || "info";

                            const iconTypeMap: Record<string, keyof typeof icons> = {
                                info: "info",
                                success: "info",
                                warning: "warning",
                                error: "error",
                            };

                            const bgColorMap: Record<string, string> = {
                                error: "#EA5F51",
                                warning: "#EA8B3F",
                                success: "#4DD181",
                                info: "var(--costume_info_notification)",
                            };
                            const boderColorMap: Record<string, string> = {
                                error: "#EA5F51",
                                warning: "#EA8B3F",
                                success: "#4DD181",
                                info: '#D9DFFF',
                            };

                            const iconColorMap: Record<string, string> = {
                                error: "#ffffff",
                                warning: "#ffffff",
                                success: "#ffffff",
                                info: "#D9DFFF",
                            };

                            const textColorMap: Record<string, string> = {
                                error: "#ffffff",
                                warning: "#ffffff",
                                success: "#ffffff",
                                info: "#222222",
                            };

                            return (
                                <div
                                    key={noti._id}
                                    className={styles.card}
                                    style={{
                                        background: bgColorMap[type],
                                        color: textColorMap[type],
                                        borderColor:boderColorMap[type],
                                        borderStyle: 'solid',
                                        borderWidth: '1px'
                                    }}
                                >
                                    <Icon type={iconTypeMap[type]} color={iconColorMap[type]} />
                                    <div style={{ width: "calc(100% - 80px)" }}>{noti.text}</div>
                                    <div
                                        style={{
                                            fontSize: "10px",
                                            lineHeight: "10px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {noti.date}
                                        <br />
                                        {noti.hour}
                                    </div>
                                    {noti.link && (
                                        <div>
                                            <Button to={noti.link}>
                                                <Icon type="links" />
                                            </Button>
                                            {/*<Button onClick={() => handleDelete(noti._id)}>Delete</Button>*/}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Dashboard>
        </>
    );
}
