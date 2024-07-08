//src/components/Navbar.tsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/navbar.css";
import AuthContext from '../context/AuthContext';
import UserMenu from './UserMenu';

const Navbar: React.FC = () => {
    const [menuData, setMenuData] = useState({ menu: [] });
    const { isAuthenticated, logout, userInfo } = useContext(AuthContext);
    const [showUserMenu, setShowUserMenu] = useState(false);
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

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    const getInitials = (username) => {
        if (!username) return '';

        const parts = username.split('.');
        if (parts.length === 1) {
            // If there's only one part (e.g., "cristi"), return the first letter
            return parts[0].charAt(0).toUpperCase();
        } else {
            // If there are multiple parts (e.g., "cristian.brinza"), return the first letter of each part
            return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
        }
    };

    const initials = getInitials(userInfo?.username);
    const avatar = userInfo?.avatar ? (
        <img src={userInfo.avatar} alt="Profile" className="user-avatar" />
    ) : (
        initials
    );

    return (
        <div id="mtc_dashboard_menu">
            <a href="home" style={{height: "100%"}}>
                <img id="mtc_dashboard_menu_logo" src="../images/general/logo.png" alt="logo"/>
            </a>
            {userInfo?.role === 'ADMIN' && <a href="/admin">Admin</a>}

            {menuData.menu.map((item, index) => (
                <a key={index} href={item[1]}>{item[0]}</a>
            ))}
            <div
                className="user-initial-circle"
                onClick={toggleUserMenu}
                style={{marginLeft: 'auto'}}
            >
                {avatar}
            </div>
            {showUserMenu && (
                <UserMenu
                    onLogout={handleAuthAction}
                    isAuthenticated={isAuthenticated}
                />
            )}
        </div>
    );
};

export default Navbar;
