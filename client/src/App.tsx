import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from "./pages/NotFound.tsx";
import Home from "./pages/Home.tsx";
import SMM from "./pages/SMM.tsx";
import Test from "./pages/Test.tsx";
import Navbar from "./components/Navbar.tsx";
import React from "react";
import Utilities from "./pages/Utilities.tsx";
import QR from "./Utilities/QR/QR.tsx";

function App() {


  return (
      <>
          <Navbar/>
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/dashboard" element={<Home />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/smm" element={<SMM />} />
                  <Route path="/test" element={<Test />} />
                  <Route path="/utilities" element={<Utilities />} />
                  <Route path="/qr_generator" element={<QR />} />
              </Routes>
          </BrowserRouter>
      </>

  )
}

export default App
