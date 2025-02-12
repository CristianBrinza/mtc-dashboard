// frontend/src/context/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: string;
    username: string;
    roles: string[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    // 🔹 Restore user from token on page load
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decoded: any = jwtDecode(storedToken);
                setUser({
                    id: decoded.id,
                    username: decoded.username,
                    roles: decoded.roles,
                });
                setToken(storedToken);
            } catch (error) {
                console.error('Failed to decode token', error);
                logout();
            }
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(
                import.meta.env.VITE_BACKEND+'/api/auth/login',
                { email, password },
                { withCredentials: true }
            );
            const { token, user } = response.data;

            setToken(token);
            localStorage.setItem('token', token);
            setUser(user);
        } catch (error: any) {
            console.error('Login error', error.response?.data || error.message);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        axios.post(import.meta.env.VITE_BACKEND+'/api/auth/logout', {}, { withCredentials: true });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
