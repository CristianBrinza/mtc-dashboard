// src/App.tsx
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
import AdminPage from "./pages/AdminPage.tsx";
import "./App.css";
import NoAccessPage from "./pages/NoAccessPage.tsx";

function App() {
    return (
        <>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<PrivateRoute component={RegisterPage} roles={['ADMIN']}/>} />
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/dashboard" element={<Home />} />
                        <Route path="/smm" element={<PrivateRoute component={SMM} roles={['ADMIN','DIRECTOR']}/>} />
                        <Route path="/phones" element={<PrivateRoute component={Phones} />} />
                        <Route path="/admin" element={<PrivateRoute component={AdminPage} roles={['ADMIN']} />} />
                        <Route path="*" element={<NotFound />} />
                        <Route path="/test" element={<Test />} />
                        <Route path="/no_access" element={<NoAccessPage />} />
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
