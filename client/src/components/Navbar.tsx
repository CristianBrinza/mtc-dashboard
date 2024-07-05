import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/navbar.css";
import AuthContext from '../context/AuthContext';
import Button from "./Button.tsx";

const Navbar: React.FC = () => {
    const [menuData, setMenuData] = useState({ menu: [] });
    const { isAuthenticated, logout } = useContext(AuthContext);
    const navigate = useNavigate();

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

    const handleAuthAction = () => {
        if (isAuthenticated) {
            logout();
        } else {
            navigate('/login');
        }
    };

    return (
        <div id="mtc_dashboard_menu">
            <a href="home" style={{ height: "100%" }}>
                <img id="mtc_dashboard_menu_logo" src="../images/general/logo.png" alt="logo" />
            </a>
            {menuData.menu.map((item, index) => (
                <a key={index} href={item[1]}>{item[0]}</a>
            ))}
            <Button
                onClick={handleAuthAction}
                style={{ marginLeft: 'auto' }}
            >
                {isAuthenticated ? 'Logout' : 'Login'}
            </Button>
        </div>
    );
};

export default Navbar;
