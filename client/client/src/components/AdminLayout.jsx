import React from "react";
import { Outlet, Link } from 'react-router-dom';

const AdminLayout = () => {
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
                </ul>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;