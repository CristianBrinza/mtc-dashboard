// src/pages/AdminPage.tsx
import React from 'react';
import Navbar from "../components/Navbar.tsx";
import "../styles/admin.css"
import Icon from "../components/Icon.tsx";
import {useNavigate} from "react-router-dom";

const AdminPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <>
            <Navbar/>
           <div className={"admin_main"}>
               <div id="admin_main_title">Admin Page</div>

               <div id="admin_main_select">
                   <div className={"admin_main_select_block"}  onClick={() => navigate('/register')}>
                       <Icon type="add"/>
New user
                   </div>
               </div>
           </div>

        </>
    );
};

export default AdminPage;
