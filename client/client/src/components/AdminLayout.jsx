import React from "react";
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // po wylogowaniu przenosi na stronę /login
    };

    if(!user || user.role !== 'admin') return null;

    return (
        <div>
            <nav>
                <ul>
                    <li><Link to="/admin">Dashboard</Link></li>
                    <li><Link to="/admin/horses">Horses</Link></li>
                    <li><Link to="/admin/stables">Stables</Link></li>
                    <li><Link to="/admin/schedule">Schedule</Link></li>
                    <li><Link to="/admin/staff">Staff</Link></li>
                    <li><Link to="/admin/expenses">Expenses</Link></li>
                    <li><Link to="/admin/settings">Settings</Link></li>
                    <li><button onClick={handleLogout}>Log out</button></li>
                </ul>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;