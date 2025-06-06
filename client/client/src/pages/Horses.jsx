import React from "react";
import { Outlet, Link } from 'react-router-dom';
import HorseForm from "./admin/Horses/HorseForm";

import HorseTable from "./admin/Horses/HorseTable";
import { Routes, Route } from 'react-router-dom';

const Horses = () => {
  return (
    <div>
      <h2>Horses (Admin only)</h2>

      <Link to="add">Add new Horse</Link>

      <Outlet />
      <Routes>
        <Route index element={<HorseTable />} />
      </Routes>
    </div>
  );
};

export default Horses;
