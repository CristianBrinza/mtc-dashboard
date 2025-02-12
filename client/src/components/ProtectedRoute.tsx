// frontend/src/components/ProtectedRoute.tsx
import React, { JSX, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: JSX.Element;
    roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
    const { user, token } = useContext(AuthContext)!;

    // 🔹 Prevent redirecting while auth state is loading
    if (token && !user) {
        return null; // Wait until useEffect restores user
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.some(role => user.roles.includes(role))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
