// sprawdzanie, czy użytkownik jest zalogowany --> user z kontekstu
import React from "react";
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ requiredRole }) => {
    const { user } = useAuth();

    // jak user nie jest zalogowany, to przenosi do strony logowania
    if (!user) {
        return (
            <Navigate to="/login" replace />
        );
    }

    // jak chce dostać się do zasobów niedostępnych dla jego roli to przekierowuje na unauthorized
    if (requiredRole && user.role !== requiredRole) {
        return (
            <Navigate to="/unauthorized" replace />
        );
    }

    // a jak jest wszystko ok to przenosi na Outlet - to jest jakaś trasa podrzędna
    return (
        <Outlet />
    );
};

export default PrivateRoute;