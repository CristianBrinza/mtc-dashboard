// src/pages/AdminPage.tsx
import React from 'react';
import Navbar from "../components/Navbar.tsx";

const AdminPage: React.FC = () => {
    return (
        <>
            <Navbar/>
            <h1>Admin Page</h1>
            <p>Only accessible by users with the ADMIN role.</p>
        </>
    );
};

export default AdminPage;
