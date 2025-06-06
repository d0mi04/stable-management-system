import React from "react";
import HorseTable from "./admin/Horses/HorseTable";
import { Routes, Route } from 'react-router-dom';

const Horses = () => {
  return (
    <div>
      <h2>Horses (Admin only)</h2>
      <Routes>
        <Route index element={<HorseTable />} />
      </Routes>
    </div>
  );
};

export default Horses;
