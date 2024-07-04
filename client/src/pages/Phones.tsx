import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/phones.css"
import Icon from "../components/Icon.tsx";
import Button from "../components/Button.tsx";

interface PhoneEntry {
    name: string;
    position: string;
    location: string;
    phone_1: string;
    phone_2: string;
    phone_3: string;
    mail: string;
    teams: string;
}

export default function Phones() {
    const navigate = useNavigate();
    const [phoneData, setPhoneData] = useState<PhoneEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const baseUrl = import.meta.env.VITE_BACKEND_SOCIAL_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${baseUrl}/json/system`);
                const data = await response.json();
                setPhoneData(data.phones);
            } catch (error) {
                console.error("Error fetching phone data:", error);
            }
        };

        fetchData();
    }, []); // <-- Empty dependency array to fetch data only once on mount

    const handleMailClick = (email: string) => {
        // Use mailto to open the default email client with Outlook as preferred client
        window.location.href = `mailto:${email}`;
    };

    const handleNavigateClick = (email: string) => {
        navigate(`/teams/${email}`);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredPhoneData = phoneData.filter((entry) =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="phone_main">
                <div id="phone_main_title">Moldtelecom | Marketing Phonebook</div>
                <div id="phone_main_table">
                    <input
                        type="text"
                        placeholder="Search by Name"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                {filteredPhoneData.map((entry) => (
                    <div className="phone_main_table_cell" key={entry.mail}>
                        <span className="phone_main_table_text_info" style={{width:"160px",fontWeight:600}}>{entry.name}</span>
                        <span className="phone_main_table_text_info" style={{width:"170px",color:"#9DAEFF80"}}>{entry.position}</span>
                        <span className="phone_main_table_text_info phone_main_table_text_info_location" style={{width:"90px"}}>{entry.location}</span>
                        <span className="phone_main_table_text_info" style={{width:"100px"}}>{entry.phone_1}</span>
                        <span className="phone_main_table_text_info" style={{width:"100px"}}>{entry.phone_2}</span>
                        <span className="phone_main_table_text_info" style={{width:"100px"}}>{entry.phone_3}</span>
                        <div className="phone_main_table_cell_contact">
                            <Button onClick={() => handleMailClick(entry.mail)}>
                                <Icon type="mail"/>
                            </Button>
                            <Button onClick={() => handleNavigateClick(entry.teams)}>
                                <Icon type="teams"/>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
