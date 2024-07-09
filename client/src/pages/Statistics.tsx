import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/statistics.css";
import Navbar from "../components/Navbar.tsx";
import Icon from "../components/Icon.tsx";
import axios from "axios";
import { LineChart } from "@mui/x-charts/LineChart";

export default function Statistics() {
    const navigate = useNavigate();
    const [moldtelecomFollowers, setMoldtelecomFollowers] = useState<number | null>(null);
    const [orangeFollowers, setOrangeFollowers] = useState<number | null>(null);
    const [moldtelecomData, setMoldtelecomData] = useState<{ date: string, followers: number }[]>([]);
    const [orangeData, setOrangeData] = useState<{ date: string, followers: number }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [heatmapData, setHeatmapData] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState<{ from: string, to: string }>({ from: '', to: '' });
    const [operator, setOperator] = useState<string>("Moldtelecom");

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const moldtelecomResponse = await axios.get('http://127.0.0.1:5000/get_profile?username=moldtelecom.md');
                const moldtelecomFollowerCount = moldtelecomResponse.data["Followers Count"];
                setMoldtelecomFollowers(moldtelecomFollowerCount);

                const orangeResponse = await axios.get('http://127.0.0.1:5000/get_profile?username=orangemoldova');
                const orangeFollowerCount = orangeResponse.data["Followers Count"];
                setOrangeFollowers(orangeFollowerCount);

                const statisticsResponse = await axios.get(`http://127.0.0.1:5000/json/statistics`);
                const data = statisticsResponse.data.instagram;

                if (data.moldtelecom) {
                    const moldtelecomData = getLastNDaysData(data.moldtelecom, 4);
                    setMoldtelecomData(moldtelecomData);
                }

                if (data.orange) {
                    const orangeData = getLastNDaysData(data.orange, 4);
                    setOrangeData(orangeData);
                }

                await updateFollowersData('moldtelecom', moldtelecomFollowerCount);
                await updateFollowersData('orange', orangeFollowerCount);
            } catch (error) {
                console.error('Error fetching follower counts:', error);
                setError('Error fetching follower counts.');
            }
        };

        fetchFollowers();
    }, []);

    useEffect(() => {
        const fetchHeatmapData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/json/smm');
                const data = response.data;
                setHeatmapData(data);
            } catch (error) {
                console.error('Error fetching heatmap data:', error);
                setError('Error fetching heatmap data.');
            }
        };

        fetchHeatmapData();
    }, []);

    const getLastNDaysData = (userData: { date: string, followers: number }[], daysInterval: number) => {
        const today = new Date();
        const todayDate = today.toLocaleDateString('en-GB');
        const dates = [];
        for (let i = 0; i <= 4 * 6; i += daysInterval) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            dates.push(date.toLocaleDateString('en-GB'));
        }

        return userData
            .filter(entry => dates.includes(entry.date))
            .sort((a, b) => new Date(a.date.split('.').reverse().join('-')).getTime() - new Date(b.date.split('.').reverse().join('-')).getTime());
    };

    const updateFollowersData = async (username, followerCount) => {
        const today = new Date().toLocaleDateString('en-GB');
        try {
            const response = await axios.get(`http://127.0.0.1:5000/json/statistics`);
            const data = response.data;
            if (!data.instagram) {
                data.instagram = {};
            }
            if (!data.instagram[username]) {
                data.instagram[username] = [];
            }
            const userData = data.instagram[username];
            const todayData = userData.find(entry => entry.date === today);
            if (todayData) {
                if (todayData.followers !== followerCount) {
                    todayData.followers = followerCount;
                }
            } else {
                userData.push({ date: today, followers: followerCount });
            }
            await axios.put(`http://127.0.0.1:5000/json/statistics`, data);
        } catch (error) {
            console.error('Error updating follower data:', error);
            setError('Error updating follower data.');
        }
    };

    const formatNumber = (number: number) => {
        return new Intl.NumberFormat('de-DE').format(number);
    };

    const getCellColor = (count) => {
        switch (count) {
            case 0: return 'white';
            case 1: return 'orange';
            case 2: return 'red';
            case 3: return 'purple';
            case 4: return 'violet';
            default: return 'black';
        }
    };

    const handleDateChange = (e) => {
        setDateRange({ ...dateRange, [e.target.name]: e.target.value });
    };

    const handleOperatorChange = (e) => {
        setOperator(e.target.value);
    };

    const generateHeatmapData = () => {
        const { from, to } = dateRange;
        const fromDate = new Date(from);
        const toDate = new Date(to);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return [];

        const filteredData = heatmapData.filter(item => {
            const itemDate = new Date(item.date.split('.').reverse().join('-'));
            return itemDate >= fromDate && itemDate <= toDate && item.operator === operator;
        });

        const dayMap = { "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6 };
        const weekData = Array(7).fill(0).map(() => Array(7).fill(0));

        filteredData.forEach(item => {
            const itemDate = new Date(item.date.split('.').reverse().join('-'));
            const dayIndex = dayMap[item.day];
            const weekIndex = Math.floor((itemDate - fromDate) / (1000 * 60 * 60 * 24 * 7));
            weekData[weekIndex][dayIndex] += 1;
        });

        return weekData;
    };

    const heatmapDataArray = generateHeatmapData();

    return (
        <>
            <Navbar />
            <div className="statistics_main">
                <div id="statistics_main_title">Moldtelecom | Marketing Statistics</div>
                {error && <div className="error_message">{error}</div>}
                <div id="statistics_main_top">
                    <div className={"statistics_main_top_blocks"}>
                        <div className={"statistics_main_top_blocks_title"}>
                            <Icon type="instagram" />
                            Moldtelecom
                            <div className={"statistics_main_top_blocks_followers"}>
                                {moldtelecomFollowers !== null ? formatNumber(moldtelecomFollowers) : "Loading..."}
                            </div>
                        </div>
                        <LineChart className={"statistics_main_top_line_charts"}
                                   xAxis={[{ data: moldtelecomData.map((data, index) => index) }]}
                                   series={[
                                       {
                                           data: moldtelecomData.map(data => data.followers),
                                           color: '#9DAEFF',
                                       },
                                   ]}
                                   width={280}
                                   margin={{ left: 30, right: 30, top: 30, bottom: 30 }}
                                   height={150}
                        />
                    </div>
                    <div className={"statistics_main_top_blocks"}>
                        <div className={"statistics_main_top_blocks_title"}>
                            <Icon type="instagram" />
                            Orange
                            <div className={"statistics_main_top_blocks_followers"}>
                                {orangeFollowers !== null ? formatNumber(orangeFollowers) : "Loading..."}
                            </div>
                        </div>
                        <LineChart className={"statistics_main_top_line_charts"}
                                   xAxis={[{ data: orangeData.map((data, index) => index) }]}
                                   series={[
                                       {
                                           data: orangeData.map(data => data.followers),
                                           color: '#9DAEFF',
                                       },
                                   ]}
                                   width={280}
                                   margin={{ left: 30, right: 30, top: 30, bottom: 30 }}
                                   height={150}
                        />
                    </div>
                </div>
                <div id="statistics_heatmap">
                    <div id="statistics_heatmap_left">
                        <span>Date Range:</span>
                        <div id="statistics_heatmap_left_date_block">
                            <input className="statistics_heatmap_left_date" type="date" name="from" onChange={handleDateChange} /><span>&nbsp;</span>
                            <input className="statistics_heatmap_left_date" type="date" name="to" onChange={handleDateChange} />
                        </div>
                        <span>Subject:</span>
                        <div id="statistics_heatmap_left_date_block ">
                            <select className={"statistics_main_select statistics_main_select_100"} name="subject">
                                <option value="">Select Subject</option>
                                <option value="PR">Branding | PR</option>
                                <option value="Event">Branding | Event</option>
                                <option value="Promoted">Branding | Promoted</option>
                                <option value="Comercial">Comercial</option>
                                <option value="Informativ">Informativ</option>
                                <option value="Interactiv">Interactiv</option>
                                <option value="(I) Comercial">Influencer | Comercial</option>
                                <option value="(I) Informativ">Influencer | Informativ</option>
                                <option value="(I) Interactiv">Influencer | Interactiv</option>
                            </select>
                        </div>
                        <span>Type:</span>
                        <div>
                            <select className={"statistics_main_select statistics_main_select_100"} name="type">
                                <option value="">Select Type</option>
                                <option value="Carousel">Carousel</option>
                                <option value="Reel">Reel</option>
                                <option value="Video">Video</option>
                                <option value="Solo">Solo</option>
                                <option value="Animated">Animated</option>
                            </select>
                        </div>
                    </div>
                    <div id="statistics_heatmap_right">
                        <div className={"statistics_heatmap_right_block"}>
                            <select className={"statistics_main_select"} name="operator" onChange={handleOperatorChange}>
                                <option value="Moldtelecom">Moldtelecom</option>
                                <option value="Orange MD">Orange MD</option>
                                <option value="Orange RO">Orange RO</option>
                                <option value="Moldcell">Moldcell</option>
                                <option value="Starnet">Starnet</option>
                                <option value="Vodaphone RO">Vodaphone RO</option>
                                <option value="Vodaphone IT">Vodaphone IT</option>
                                <option value="Arax">Arax</option>
                                <option value="MTS">RU | MTS</option>
                                <option value="Megafon">RU | Megafon</option>
                                <option value="Beeline">RU | Beeline</option>
                                <option value="Darwin">Others | Darwin</option>
                                <option value="Enter">Others | Enter</option>
                                <option value="MAIB">Others | MAIB</option>
                                <option value="Moldcell Money">Moldcell Money</option>
                                <option value="Others">Others</option>
                            </select>
                            <div className={"statistics_heatmap_right_block_heatmap"}>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Mon</th>
                                        <th>Tue</th>
                                        <th>Wed</th>
                                        <th>Thuy</th>
                                        <th>Fri</th>
                                        <th>Sat</th>
                                        <th>Sun</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {heatmapDataArray.map((week, weekIndex) => (
                                        <tr key={weekIndex}>
                                            {week.map((count, dayIndex) => (
                                                <td key={dayIndex} style={{ backgroundColor: getCellColor(count) }}></td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className={"statistics_heatmap_right_block"}>
                            {/* Additional blocks or content can go here */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
