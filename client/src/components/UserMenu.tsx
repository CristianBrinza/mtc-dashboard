// src/components/UserMenu.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
    onLogout: () => void;
    isAuthenticated: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogout, isAuthenticated }) => {
    const navigate = useNavigate();

    return (
        <div className="user-menu">
            {isAuthenticated ? (
                <>
                    <div className="user-menu-item" onClick={() => navigate('/profile')}>Profile</div>
                    <div className="user-menu-item">Settings</div>
                    <div className="user-menu-item" onClick={onLogout}>Logout</div>
                </>
            ) : (
                <div className="user-menu-item" onClick={() => navigate('/login')}>Login</div>
            )}
        </div>
    );
};

export default UserMenu;
