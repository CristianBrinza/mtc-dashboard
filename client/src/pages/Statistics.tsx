import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/statistics.css";
import Navbar from "../components/Navbar.tsx";
import Icon from "../components/Icon.tsx";
import axios from "axios";

export default function Statistics() {
    const navigate = useNavigate();
    const [moldtelecomFollowers, setMoldtelecomFollowers] = useState<number | null>(null);
    const [orangeFollowers, setOrangeFollowers] = useState<number | null>(null);

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const moldtelecomResponse = await axios.get('http://127.0.0.1:5000/get_profile?username=moldtelecom.md');
                setMoldtelecomFollowers(moldtelecomResponse.data["Followers Count"]);

                const orangeResponse = await axios.get('http://127.0.0.1:5000/get_profile?username=orangemoldova');
                setOrangeFollowers(orangeResponse.data["Followers Count"]);
            } catch (error) {
                console.error('Error fetching follower counts:', error);
            }
        };

        fetchFollowers();
    }, []);

    const formatNumber = (number: number) => {
        return new Intl.NumberFormat('de-DE').format(number);
    };

    return (
        <>
            <Navbar />
            <div className="statistics_main">
                <div id="statistics_main_title">Moldtelecom | Marketing Statistics</div>
                <div id="statistics_main_top">
                    <div className={"statistics_main_top_blocks"}>

                        <div className={"statistics_main_top_blocks_title"}>
                            <Icon type="instagram"/>
                            Moldtelecom
                            <div
                                className={"statistics_main_top_blocks_followers"}>{moldtelecomFollowers !== null ? formatNumber(moldtelecomFollowers) : "Loading..."}</div>

                        </div>

                    </div>
                    <div className={"statistics_main_top_blocks"}>
                        <div className={"statistics_main_top_blocks_title"}>
                            <Icon type="instagram"/>
                            Orange
                            <div
                                className={"statistics_main_top_blocks_followers"}>{orangeFollowers !== null ? formatNumber(orangeFollowers) : "Loading..."}</div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
