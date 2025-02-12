import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import Breadcrumb from "../Breadcrumb/Breadcrumb.tsx";
import Icon, { icons } from "../Icon.tsx";

interface DashboardProps {
    active?: string;
    menu: string;
    breadcrumb?: BreadcrumbItem[];
    children: React.ReactNode;
}

interface MenuItem {
    name: string;
    link: string;
    icon?: keyof typeof icons;
}

interface BreadcrumbItem {
    label: string | React.ReactNode;
    url?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ breadcrumb = [], active, menu, children }) => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    useEffect(() => {
        fetch("/json/dashboard.json")
            .then((response) => response.json())
            .then((data) => {
                const selectedMenu = data[menu] || [];

                setMenuItems(
                    selectedMenu.map(([name, link, icon]: [string, string, string]) => ({
                        name,
                        link,
                        icon: icon as keyof typeof icons,
                    }))
                );
            })
            .then((data) => console.log(data))
            .catch((error) => console.error("Error loading menu:", error));
    }, [menu]);

    return (
        <div className={styles.Dashboard}>
            <div className={styles.Dashboard_left}>
                {menuItems.map((item, index) => (
                    <a href={item.link} key={index}
                       className={`${styles.menuItem} ${active === item.name ? styles.dashboard_active : ""}`}>
                        {item.icon && (
                            <Icon type={item.icon}
                                  color={active === item.name ? "#212A55" : "#212A55"}
                                  className={styles.menuIcon} />
                        )}
                        {item.name}
                    </a>
                ))}
            </div>
            <div className={styles.Dashboard_right}>
                <Breadcrumb items={breadcrumb} />
                <div className={styles.Dashboard_content}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
