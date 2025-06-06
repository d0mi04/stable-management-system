import React from "react";
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // po wylogowaniu przenosi nas na stronę /login
    };

    if(!user || user.role !== 'user') return null;

    return (
        <div>
            <nav>
                <ul>
                    <li><Link to="/user">UserHome</Link></li>
                    <li><Link to="/user/schedule">Schedule</Link></li>
                    <li><button onClick={handleLogout}>Log out</button></li>
                </ul>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;