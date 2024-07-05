import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotFound from "./pages/NotFound.tsx";
import Home from "./pages/Home.tsx";
import SMM from "./pages/SMM.tsx";
import Test from "./pages/Test.tsx";
import Navbar from "./components/Navbar.tsx";
import Utilities from "./pages/Utilities.tsx";
import QR from "./Utilities/QR/QR.tsx";
import Statistics from "./pages/Statistics.tsx";
import Phones from "./pages/Phones.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import LoginPage from "./pages/LoginPage.tsx";

function App() {
    return (
        <>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/dashboard" element={<Home />} />
                        <Route path="/smm" element={<PrivateRoute component={SMM} />} />
                        <Route path="/phones" element={<PrivateRoute component={Phones} />} />
                        <Route path="*" element={<NotFound />} />
                        <Route path="/test" element={<Test />} />
                        <Route path="/utilities" element={<Utilities />} />
                        <Route path="/qr_generator" element={<QR />} />
                        <Route path="/statistics" element={<Statistics />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
            <ToastContainer position="bottom-right" autoClose={5000} />
        </>
    );
}

export default App;
