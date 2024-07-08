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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const moldtelecomResponse = await axios.get('http://127.0.0.1:5000/get_profile?username=moldtelecom.md');
                const moldtelecomFollowerCount = moldtelecomResponse.data["Followers Count"];
                setMoldtelecomFollowers(moldtelecomFollowerCount);

                const orangeResponse = await axios.get('http://127.0.0.1:5000/get_profile?username=orangemoldova');
                const orangeFollowerCount = orangeResponse.data["Followers Count"];
                setOrangeFollowers(orangeFollowerCount);

                // Update the JSON data
                await updateFollowersData('moldtelecom', moldtelecomFollowerCount);
                await updateFollowersData('orange', orangeFollowerCount);
            } catch (error) {
                console.error('Error fetching follower counts:', error);
                setError('Error fetching follower counts.');
            }
        };

        fetchFollowers();
    }, []);

    const updateFollowersData = async (username, followerCount) => {
        const today = new Date().toLocaleDateString('en-GB'); // Format: DD.MM.YYYY

        try {
            // Fetch existing statistics data
            const response = await axios.get(`http://127.0.0.1:5000/json/statistics`);
            const data = response.data;

            // Ensure the instagram key exists
            if (!data.instagram) {
                data.instagram = {};
            }

            // Ensure the specific user key exists
            if (!data.instagram[username]) {
                data.instagram[username] = [];
            }

            const userData = data.instagram[username];

            // Check if today's data exists
            const todayData = userData.find(entry => entry.date === today);

            if (todayData) {
                // Update follower count if different
                if (todayData.followers !== followerCount) {
                    todayData.followers = followerCount;
                }
            } else {
                // Add new entry for today
                userData.push({ date: today, followers: followerCount });
            }

            // Send updated data back to the server
            await axios.put(`http://127.0.0.1:5000/json/statistics`, data);
        } catch (error) {
            console.error('Error updating follower data:', error);
            setError('Error updating follower data.');
        }
    };

    const formatNumber = (number: number) => {
        return new Intl.NumberFormat('de-DE').format(number);
    };

    return (
        <>
            <Navbar />
            <div className="statistics_main">
                <div id="statistics_main_title">Moldtelecom | Marketing Statistics</div>
                {error && <div className="error_message">{error}</div>}
                <div id="statistics_main_top">
                    <div className={"statistics_main_top_blocks"}>

                        <div className={"statistics_main_top_blocks_title"}>
                            <Icon type="instagram"/>
                            Moldtelecom
                            <div className={"statistics_main_top_blocks_followers"}>
                                {moldtelecomFollowers !== null ? formatNumber(moldtelecomFollowers) : "Loading..."}
                            </div>
                        </div>

                    </div>
                    <div className={"statistics_main_top_blocks"}>
                        <div className={"statistics_main_top_blocks_title"}>
                            <Icon type="instagram"/>
                            Orange
                            <div className={"statistics_main_top_blocks_followers"}>
                                {orangeFollowers !== null ? formatNumber(orangeFollowers) : "Loading..."}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
