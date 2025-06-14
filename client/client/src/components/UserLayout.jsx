import React from "react";
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconHorse, IconDashboard } from "@tabler/icons-react";

const UserLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // po wylogowaniu przenosi nas na stronę /login
    };

    if(!user || user.role !== 'user') return null;

    return (
	<div className="min-h-screen bg-gray-50">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href="/user"
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-700 font-medium"
            >
              <span className="text-xl font-bold text-indigo-700">
                Stable User
              </span>

              <IconHorse className="w-8 h-8 text-indigo-700" />
            </a>
            <Link
              to="/user/schedule"
              className="text-gray-700 hover:text-indigo-700 font-medium"
            >
              Schedule
            </Link>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-semibold transition"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>
      {/* Page content with top padding for navbar */}
      <main className="pt-20 max-w-7xl mx-auto px-4">
        <Outlet />
      </main>
    </div>
    );
};

export default UserLayout;