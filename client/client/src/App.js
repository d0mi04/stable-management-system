import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
// później można dodać np. import NotFound from './components/NotFound'; --> coś takiego na przykład na błąd 404

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<Login />} />
        {/* <Route path="*" element={<NotFound />} /> --> opcjonalna strona 404 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
