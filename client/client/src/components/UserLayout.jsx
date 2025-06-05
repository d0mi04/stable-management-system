import React from "react";
import { Outlet, Link } from 'react-router-dom';

const UserLayout = () => {
    return (
        <div>
            <nav>
                <ul>
                    <li><Link to="/user">UserHome</Link></li>
                    <li><Link to="/user/schedule">Schedule</Link></li>
                </ul>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;