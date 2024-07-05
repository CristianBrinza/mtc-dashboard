import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/utilities.css"
import Navbar from "../components/Navbar.tsx";

export default function Statistics() {
    const navigate = useNavigate();

    return (
        <>
            <Navbar />
            <div className="utilities_main">
                <div id="utilities_main_title">Moldtelecom | Marketing Statistics</div>


           </div>
       </>
    );
}
