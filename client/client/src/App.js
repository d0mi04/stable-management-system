import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Unauthorized from "./pages/Unauthorized";
import { AuthProvider } from "./context/AuthContext"; 
import { StableProvider } from './context/StableContext';
import PrivateRoute from "./components/PrivateRoute";
import AdminLayout from './components/AdminLayout';
import UserLayout from './components/UserLayout';
// później można dodać np. import NotFound from './components/NotFound'; --> coś takiego na przykład na błąd 404

import Dashboard from './pages/Dashboard'; // admin
import Horses from './pages/Horses';
import HorseDetails from './pages/HorseDetails'; // admin
import Stables from './pages/Stables'; // most likely admin
import Staff from './pages/Staff'; // most likely admin
import Expenses from './pages/Expenses'; // admin
import Settings from './pages/Settings'; // admin

import UserHome from './pages/UserHome';
import Schedule from './pages/Schedule';

function App() {
  return (
    <AuthProvider>
      <StableProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            {/* <Route path="*" element={<NotFound />} /> --> opcjonalna strona 404 */}

            {/* dostęp tylko dla admina */}
            <Route element={<PrivateRoute requiredRole="admin" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="horses/*" element={<Horses />} />
                <Route path="horses/:id" element={<HorseDetails />} />
                <Route path="stables" element={<Stables />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="staff" element={<Staff />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* dostęp tylko po zalogowaniu  */}
            <Route element={<PrivateRoute />}>
              <Route path="/user" element={<UserLayout />}>
                <Route index element={<UserHome />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="notices" element={<div>Ogloszenia (mock)</div>} />
                <Route path="discussion" element={<div>Dyskusja (mock)</div>} />
              </Route>
            </Route>            
          </Routes>
        </Router>
      </StableProvider>
    </AuthProvider>
  );
}

export default App;
