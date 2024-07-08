// src/pages/AdminPage.tsx
import React from 'react';
import Navbar from "../components/Navbar.tsx";

const NoAccessPage: React.FC = () => {
    return (
        <>
            <Navbar/>
            <h1>No Access</h1>

        </>
    );
};

export default NoAccessPage;
