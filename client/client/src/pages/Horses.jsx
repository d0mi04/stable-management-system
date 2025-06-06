import React from "react";
import { Outlet, Link, useLocation } from 'react-router-dom';
import HorseTable from "./admin/Horses/HorseTable";

const Horses = () => {
  const location = useLocation();
  const isBasePath = location.pathname === "/admin/horses";
  
  return (
    <div>
      <h2>Horses (Admin only)</h2>

      <Link to="add">Add new Horse</Link>
      
      {/* teraz wyświetlamy wszystkie konie */}
      {isBasePath && <HorseTable />}

      {/* tu ma się renderować formularz dodawania lub edycji */}
      <Outlet />
    </div>
  );
};

export default Horses;
