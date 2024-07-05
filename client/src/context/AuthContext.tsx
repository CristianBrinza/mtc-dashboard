// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../utils/decodeToken';

interface AuthContextProps {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    userRole: string;
    userInfo: any;
    loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
    token: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false,
    userRole: '',
    userInfo: null,
    loading: true,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [userRole, setUserRole] = useState<string>('');
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            const decoded = decodeToken(token);
            //console.log('Decoded token:', decoded); // Debug log
            if (decoded && decoded.user && decoded.user.role) {
                setUserRole(decoded.user.role);
                setUserInfo(decoded.user);
                //console.log('User role set to:', decoded.user.role); // Debug log
            }
        }
        setLoading(false); // Set loading to false after processing
    }, [token]);

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        const decoded = decodeToken(newToken);
        //console.log('Decoded token on login:', decoded); // Debug log
        if (decoded && decoded.user && decoded.user.role) {
            setUserRole(decoded.user.role);
            setUserInfo(decoded.user);
            //console.log('User role set to:', decoded.user.role); // Debug log
        }
        navigate('/');
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setUserRole('');
        setUserInfo(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token, userRole, userInfo, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
