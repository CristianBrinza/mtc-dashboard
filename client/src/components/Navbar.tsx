import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/navbar.css";

const Navbar: React.FC = () => {
    const [menuData, setMenuData] = useState({ menu: [] });

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_SOCIAL_URL}/json/system`);
                setMenuData(response.data);
            } catch (error) {
                console.error('Error fetching menu data:', error);
            }
        };

        fetchMenuData();
    }, []);

    return (
        <div id="mtc_dashboard_menu">
            <a href="home" style={{ height: "100%" }}>
                <img id="mtc_dashboard_menu_logo" src="../images/general/logo.png" alt="logo" />
            </a>
            {menuData.menu.map((item, index) => (
                <a key={index} href={item[1]}>{item[0]}</a>
            ))}
        </div>
    );
};

export default Navbar;
