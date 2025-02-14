import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export interface User {
    id: string;
    username: string;
    roles: string[];
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string;
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

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            try {
                const decoded: any = jwtDecode(storedToken);
                const parsedUser: User = JSON.parse(storedUser);
                setUser({
                    id: decoded.id,
                    username: decoded.username,
                    roles: decoded.roles,
                    ...parsedUser,
                });
                setToken(storedToken);
            } catch (error) {
                console.error('Failed to decode token or parse user', error);
                logout();
            }
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND}/api/auth/login`,
                { email, password },
                { withCredentials: true }
            );
            const { token, user } = response.data;

            setToken(token);
            localStorage.setItem('token', token);

            const userData: User = {
                id: user.id,
                username: user.username,
                roles: user.roles,
            };
            if (user.firstName) userData.firstName = user.firstName;
            if (user.lastName) userData.lastName = user.lastName;
            if (user.email) userData.email = user.email;
            if (user.profilePicture) userData.profilePicture = user.profilePicture;

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error: any) {
            console.error('Login error', error.response?.data || error.message);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        axios.post(`${import.meta.env.VITE_BACKEND}/api/auth/logout`, {}, { withCredentials: true });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
