import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute: React.FC<any> = ({ component: Component, ...rest }) => {
    const { isAuthenticated } = useContext(AuthContext);
    return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};
export default PrivateRoute;
