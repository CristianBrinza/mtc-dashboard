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
import Statistics from "./pages/Statistics.tsx";
import Phones from "./pages/Phones.tsx";

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
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/phones" element={<Phones />} />
              </Routes>
          </BrowserRouter>
      </>

  )
}

export default App
