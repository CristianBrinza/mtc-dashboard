// src/components/PrivateRoute.tsx
import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

interface PrivateRouteProps {
    component: React.FC<any>;
    roles?: string[];
    [key: string]: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, roles, ...rest }) => {
    const { isAuthenticated, userRole, loading } = useContext(AuthContext);

    console.log('PrivateRoute check:', { isAuthenticated, userRole, roles, loading }); // Debug log

    if (loading) {
        return <div>Loading...</div>; // Show a loading state
    }

    if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to /login'); // Debug log
        return <Navigate to="/login" />;
    }

    if (roles && roles.indexOf(userRole) === -1) {
        console.log(`User role ${userRole} not authorized, redirecting to /no_access`); // Debug log
        return <Navigate to="/no_access" />;
    }

    return <Component {...rest} />;
};

export default PrivateRoute;
