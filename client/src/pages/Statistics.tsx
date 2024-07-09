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
    const [dateRange, setDateRange] = useState<{ from: string, to: string }>({ from: '', to: '' });
    const [tableRows, setTableRows] = useState<JSX.Element[]>([]);
    const [selectedOperator, setSelectedOperator] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");
    const [dateCounts, setDateCounts] = useState<{ [key: string]: number }>({});

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
        if (selectedOperator || selectedSubject || selectedType) {
            fetchAndFilterData(selectedOperator, selectedSubject, selectedType);
        }
    }, [selectedOperator, selectedSubject, selectedType]);

    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            generateTableRows(dateRange.from, dateRange.to);
        }
    }, [dateRange, dateCounts]);

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

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange(prevState => ({ ...prevState, [name]: value }));
    };

    const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOperator(e.target.value);
    };

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSubject(e.target.value);
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(e.target.value);
    };

    const generateTableRows = (from: string, to: string) => {
        const startDate = new Date(from);
        const endDate = new Date(to);
        const rows = [];
        const dayMilliseconds = 86400000; // Number of milliseconds in a day

        while (startDate <= endDate) {
            const week = [];

            // Add transparent cells if the start date is not Monday
            if (week.length === 0 && startDate.getDay() !== 1) {
                for (let i = 1; i < startDate.getDay(); i++) {
                    week.push(<td key={`empty-${i}`} style={{ backgroundColor: 'transparent' }}></td>);
                }
            }

            for (let i = startDate.getDay(); i < 8; i++) {
                const dateString = startDate.toISOString().split('T')[0];
                if (startDate > endDate) break;

                const cellCount = dateCounts[dateString.split('-').reverse().join('.')] || 0;
                const cellColor = getCellColor(cellCount);

                week.push(
                    <td
                        key={dateString}
                        style={{
                            position: 'relative',
                            backgroundColor: dateString < from || dateString > to ? 'transparent' : cellColor,
                        }}
                    >
                        <div className="date-tooltip">{dateString}</div>
                    </td>
                );
                startDate.setTime(startDate.getTime() + dayMilliseconds);
            }

            rows.push(<tr key={startDate.toISOString()}>{week}</tr>);
        }

        setTableRows(rows);
    };

    const fetchAndFilterData = async (operator: string, subject: string, type: string) => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/json/smm');
            const data = response.data;

            const filteredData = data.filter(item =>
                (operator ? item.operator === operator : true) &&
                (subject ? item.subject === subject : true) &&
                (type ? item.type === type : true) &&
                item.source === 'instagram'
            );

            const dateCounts = filteredData.reduce((acc, item) => {
                if (acc[item.date]) {
                    acc[item.date]++;
                } else {
                    acc[item.date] = 1;
                }
                return acc;
            }, {});

            setDateCounts(dateCounts);
        } catch (error) {
            console.error('Error fetching or filtering data:', error);
        }
    };

    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            generateTableRows(dateRange.from, dateRange.to);
        }
    }, [dateRange, dateCounts]);

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
                            <input
                                className="statistics_heatmap_left_date"
                                type="date"
                                name="from"
                                value={dateRange.from}
                                onChange={handleDateChange}
                            />
                            <span>&nbsp;</span>
                            <input
                                className="statistics_heatmap_left_date"
                                type="date"
                                name="to"
                                value={dateRange.to}
                                onChange={handleDateChange}
                            />
                        </div>
                        <span>Subject:</span>
                        <div id="statistics_heatmap_left_date_block ">
                            <select className={"statistics_main_select statistics_main_select_100"} name="subject" value={selectedSubject} onChange={handleSubjectChange}>
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
                            <select className={"statistics_main_select statistics_main_select_100"} name="type" value={selectedType} onChange={handleTypeChange}>
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
                            <select
                                className={"statistics_main_select"}
                                name="operator"
                                value={selectedOperator}
                                onChange={handleOperatorChange}
                            >
                                <option value="">Select Operator</option>
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
                                        <th>Thu</th>
                                        <th>Fri</th>
                                        <th>Sat</th>
                                        <th>Sun</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {tableRows}
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
