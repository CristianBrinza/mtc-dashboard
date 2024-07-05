import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

interface AuthContextProps {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    userRole: string | null;
    userInfo: any;
}

const AuthContext = createContext<AuthContextProps>({
    token: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false,
    userRole: null,
    userInfo: null,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            const decoded: any = jwtDecode(token);
            setUserRole(decoded.user.role);
            setUserInfo(decoded.user);
        }
    }, [token]);

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        const decoded: any = jwtDecode(newToken);
        setUserRole(decoded.user.role);
        setUserInfo(decoded.user);
        navigate('/');
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setUserRole(null);
        setUserInfo(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token, userRole, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
