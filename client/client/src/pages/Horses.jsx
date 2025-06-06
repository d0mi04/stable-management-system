import React from "react";
import { Outlet, Link } from 'react-router-dom';
import HorseForm from "./admin/Horses/HorseForm";

const Horses = () => {
  return (
    <div>
      <h2>Horses (Admin only)</h2>

      <Link to="add">Add new Horse</Link>
      <HorseForm />

      <Outlet />
    </div>
  );
};

export default Horses;
