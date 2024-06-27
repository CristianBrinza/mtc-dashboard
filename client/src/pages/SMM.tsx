import "../styles/smm.css"
import React, { useEffect, useState } from "react";
import { config } from 'dotenv';
import Popup from "../components/Popup";

interface SsmData {
    id: string;
    img:string;
    source: string;
    sponsor: boolean;
    date: string;
    day: string;
    operator: string;
    likes: number;
    comments: number;
    shares: number;
    subject: string;
    type: string;
    link: string;
}

export default function SMM() {
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const togglePopup = () => {
        setIsPopupVisible(!isPopupVisible);
    };

    const [ssmData, setSsmData] = useState<SsmData[]>([]);

    useEffect(() => {
        const loadMenuButtons = async () => {
            try {
                const response = await fetch("http://127.0.0.1:5000/json/smm", {
                    method: 'GET',
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data: SsmData[] = await response.json();
                setSsmData(data);
            } catch (error) {
                console.error("Error fetching the JSON data:", error);
            }
        };

        loadMenuButtons();
    }, []);

    const [isExportVisible, setisExportVisible] = useState(false);
    const [isAddVisible, setIsAddVisible] = useState(false);
    const [visibleSection, setVisibleSection] = useState<string | null>(null);

    const toggleExportSettings = () => {
        setVisibleSection(visibleSection === 'export' ? null : 'export');
    };

    const toggleAddNew = () => {
        setVisibleSection(visibleSection === 'add' ? null : 'add');
    };

    const exportToExcel = () => {
        const csvData = convertToCSV(ssmData);
        downloadCSV(csvData);
    };
    const exportToExcelScreen = () => {
        const csvData = convertToCSV(ssmData);
        downloadCSV(csvData);
    };




    const convertToCSV = (objArray) => {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = '';
        let row = '';

        // Create header row
        for (const index in array[0]) {
            if (row !== '') row += ',';
            row += index;
        }
        str += row + '\r\n';

        // Create data rows
        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (const index in array[i]) {
                if (line !== '') line += ',';
                line += array[i][index];
            }
            str += line + '\r\n';
        }

        return str;
    };

    const downloadCSV = (csvData) => {
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'data.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const downloadFile = (url, filename) => {
        fetch(url, { headers: { 'Content-Type': 'application/json' } })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Expecting a JSON response
            })
            .then(data => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => console.error('There was a problem with the fetch operation:', error));
    };



    // Helper function to generate a unique numeric ID
    const generateUniqueNumericId = (existingIds) => {
        let newId;
        const baseId = 1000000;
        const increment = 100; // Adjust as needed to ensure uniqueness
        do {
            newId = baseId + Math.floor(Math.random() * increment) * increment;
        } while (existingIds.includes(newId.toString()));
        return newId.toString();
    };

    const getDayOfWeek = (dateString) => {
        const [day, month, year] = dateString.split('.').map(Number);
        const date = new Date(year, month - 1, day);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        const options = { weekday: 'long' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    const AddNewLink = async () => {
        const linkInput = (document.querySelector('#smm_main_add_left input') as HTMLInputElement).value;
        if (linkInput.includes('www.instagram.com')) {
            try {
                const baseUrl = import.meta.env.VITE_BACKEND_SOCIAL_URL;
                const response = await fetch(`${baseUrl}/get_post?url=${encodeURIComponent(linkInput)}`);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                const data = await response.json();

                // Structuring the data
                const newId = generateUniqueNumericId(ssmData.map(item => item.id));
                const social_instagram_post = {
                    id: newId,
                    img: data.Cover_Image_URL,
                    sponsor: false,
                    source: 'instagram',
                    date: data.Date,
                    day: getDayOfWeek(data.Date),
                    operator: '',
                    likes: data.Likes,
                    comments: data.Comments,
                    shares: data.Shares,
                    subject: '',
                    type: '',
                    link: linkInput
                };

                // Check if link already exists
                const linkExists = ssmData.some(item => item.link === linkInput);
                if (linkExists) {
                    console.log("Error, link already exists");
                    return;
                }

                // Add new record to ssmData
                const updatedData = [...ssmData, social_instagram_post];
                setSsmData(updatedData);

                // Update JSON file on server
                const jsonResponse = await fetch(`http://127.0.0.1:5000/json/smm`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(social_instagram_post)  // Send the new post data
                });

                if (!jsonResponse.ok) {
                    throw new Error(`Failed to update JSON file on server: ${jsonResponse.statusText}`);
                }

            } catch (error) {
                console.error('Error fetching the post data:', error.message);
            }
        }
    };

// ... (rest of your component code)

    return (
        <>

            <div className="smm_main">
                <div id="smm_main_title">
                    Moldtelecom SMM | Marketing Dashboard
                </div>

                <div id="smm_main_options">
                    <div id="add_new"
                         className={`smm_main_btn ${visibleSection === 'add' ? 'smm_main_btn_pressed' : ''}`}
                         onClick={toggleAddNew}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.0002 5.5L12.0002 18.5" stroke="#9DAEFF" strokeWidth="1.8"
                                  strokeLinecap="round"></path>
                            <path d="M5.5 11.9996H18.5" stroke="#9DAEFF" strokeWidth="1.8"
                                  strokeLinecap="round"></path>
                        </svg>


                        Add
                    </div>
                    <div id="show_export_setting"
                         className={`smm_main_btn ${visibleSection === 'export' ? 'smm_main_btn_pressed' : ''}`}
                         onClick={toggleExportSettings}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19.715 11.2989V19.7153C19.715 20.0873 19.5672 20.4441 19.3042 20.7072C19.0411 20.9702 18.6843 21.118 18.3123 21.118H5.68773C5.3157 21.118 4.95892 20.9702 4.69585 20.7072C4.43279 20.4441 4.285 20.0873 4.285 19.7153V11.2989C4.285 10.9269 4.43279 10.5701 4.69585 10.307C4.95892 10.044 5.3157 9.89618 5.68773 9.89618H7.79182C7.97783 9.89618 8.15623 9.97008 8.28776 10.1016C8.41929 10.2331 8.49319 10.4115 8.49319 10.5975C8.49319 10.7836 8.41929 10.962 8.28776 11.0935C8.15623 11.225 7.97783 11.2989 7.79182 11.2989H5.68773V19.7153H18.3123V11.2989H16.2082C16.0222 11.2989 15.8438 11.225 15.7122 11.0935C15.5807 10.962 15.5068 10.7836 15.5068 10.5975C15.5068 10.4115 15.5807 10.2331 15.7122 10.1016C15.8438 9.97008 16.0222 9.89618 16.2082 9.89618H18.3123C18.6843 9.89618 19.0411 10.044 19.3042 10.307C19.5672 10.5701 19.715 10.9269 19.715 11.2989ZM8.9894 7.58694L11.2986 5.27683V13.403C11.2986 13.589 11.3725 13.7674 11.5041 13.8989C11.6356 14.0305 11.814 14.1044 12 14.1044C12.186 14.1044 12.3644 14.0305 12.4959 13.8989C12.6275 13.7674 12.7014 13.589 12.7014 13.403V5.27683L15.0106 7.58694C15.1422 7.71855 15.3207 7.79248 15.5068 7.79248C15.6929 7.79248 15.8714 7.71855 16.003 7.58694C16.1346 7.45534 16.2086 7.27685 16.2086 7.09073C16.2086 6.90461 16.1346 6.72612 16.003 6.59451L12.4962 3.0877C12.4311 3.02249 12.3537 2.97075 12.2686 2.93546C12.1834 2.90016 12.0922 2.882 12 2.882C11.9078 2.882 11.8166 2.90016 11.7314 2.93546C11.6463 2.97075 11.5689 3.02249 11.5038 3.0877L7.99697 6.59451C7.86537 6.72612 7.79143 6.90461 7.79143 7.09073C7.79143 7.27685 7.86537 7.45534 7.99697 7.58694C8.12858 7.71855 8.30707 7.79248 8.49319 7.79248C8.6793 7.79248 8.8578 7.71855 8.9894 7.58694Z"
                                fill="#9DAEFF" stroke="#9DAEFF" strokeWidth="0.553543"></path>
                        </svg>

                        Export
                    </div>
                    <div className="smm_main_btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M4.44444 12C4.44444 11.2677 5.04546 10.6667 5.77778 10.6667C6.5101 10.6667 7.11111 11.2677 7.11111 12C7.11111 12.7323 6.5101 13.3333 5.77778 13.3333C5.04546 13.3333 4.44444 12.7323 4.44444 12ZM16.8889 12C16.8889 11.2677 17.4899 10.6667 18.2222 10.6667C18.9545 10.6667 19.5556 11.2677 19.5556 12C19.5556 12.7323 18.9545 13.3333 18.2222 13.3333C17.4899 13.3333 16.8889 12.7323 16.8889 12ZM10.6667 12C10.6667 11.2677 11.2677 10.6667 12 10.6667C12.7323 10.6667 13.3333 11.2677 13.3333 12C13.3333 12.7323 12.7323 13.3333 12 13.3333C11.2677 13.3333 10.6667 12.7323 10.6667 12Z"
                                fill="#9DAEFF" stroke="#9DAEFF" strokeWidth="0.888889"></path>
                        </svg>


                        Options
                    </div>
                    <div className="smm_main_btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12.0001 8.89986H12C11.3869 8.89986 10.7875 9.08168 10.2777 9.42233C9.76784 9.76297 9.37049 10.2472 9.13584 10.8136C8.9012 11.3801 8.83981 12.0034 8.95943 12.6048C9.07905 13.2062 9.37431 13.7586 9.80787 14.1921C10.2414 14.6257 10.7938 14.921 11.3952 15.0406C11.9966 15.1602 12.6199 15.0988 13.1864 14.8642C13.7528 14.6295 14.237 14.2322 14.5777 13.7223C14.9183 13.2125 15.1001 12.6131 15.1001 12V11.9999C15.0977 11.1785 14.7703 10.3914 14.1894 9.81056C13.6086 9.22971 12.8215 8.90231 12.0001 8.89986ZM18.5694 12.8576L18.5678 12.8686L18.5766 12.8755L20.4513 14.3432C20.4514 14.3433 20.4514 14.3433 20.4515 14.3434C20.5295 14.4079 20.5821 14.498 20.5999 14.5977C20.6176 14.6975 20.5993 14.8003 20.5482 14.8879L20.5482 14.8879L18.7745 17.9501C18.7745 17.9502 18.7744 17.9502 18.7744 17.9502C18.7228 18.037 18.6423 18.1027 18.547 18.1359C18.4517 18.1691 18.3478 18.1677 18.2535 18.1319C18.2534 18.1319 18.2534 18.1319 18.2533 18.1318L16.0489 17.2462L16.0387 17.2421L16.03 17.2488C15.5722 17.6013 15.0712 17.8939 14.5392 18.1194L14.5292 18.1236L14.5277 18.1344L14.1981 20.4745C14.1981 20.4746 14.1981 20.4747 14.1981 20.4748C14.1803 20.5751 14.1283 20.6662 14.051 20.7325C13.9736 20.7988 13.8755 20.8362 13.7736 20.8383H10.2264C10.1263 20.8363 10.0298 20.8005 9.95273 20.7366C9.87574 20.6729 9.82258 20.585 9.80189 20.4872L9.47233 18.1471L9.4708 18.1363L9.46069 18.1321C8.9273 17.9092 8.42602 17.6162 7.9701 17.2608L7.96136 17.254L7.95109 17.2581L5.74665 18.1438C5.74659 18.1438 5.74653 18.1438 5.74646 18.1438C5.65219 18.1797 5.54831 18.1812 5.45305 18.148C5.35777 18.1149 5.27723 18.0492 5.22556 17.9625C5.22554 17.9625 5.22552 17.9625 5.2255 17.9624L3.4518 14.9006L3.45177 14.9006C3.40068 14.8131 3.38238 14.7102 3.40013 14.6104C3.41787 14.5108 3.47045 14.4206 3.54849 14.3561C3.54855 14.356 3.54862 14.356 3.54868 14.3559L5.4234 12.8882L5.43212 12.8814L5.4306 12.8704C5.39077 12.5819 5.36973 12.2912 5.36762 12C5.36922 11.713 5.39026 11.4265 5.43059 11.1424L5.43215 11.1314L5.4234 11.1245L3.54868 9.65677C3.54862 9.65672 3.54856 9.65667 3.5485 9.65662C3.47045 9.59211 3.41787 9.50196 3.40013 9.40226C3.38238 9.30249 3.40068 9.19966 3.45177 9.11213L3.4518 9.11208L5.22551 6.04987C5.22553 6.04984 5.22555 6.0498 5.22557 6.04977C5.27718 5.96306 5.3577 5.89731 5.45299 5.86409C5.54825 5.83087 5.65217 5.83229 5.74649 5.8681C5.74655 5.86812 5.7466 5.86814 5.74666 5.86817L7.95109 6.75379L7.96129 6.75789L7.97001 6.75118C8.42782 6.39867 8.9288 6.10611 9.46078 5.8806L9.47081 5.87635L9.47233 5.86556L9.80194 3.5252C9.81967 3.42487 9.87165 3.33379 9.94903 3.26751C10.0264 3.20119 10.1245 3.1638 10.2264 3.16171H13.7736C13.8737 3.1637 13.9702 3.19953 14.0473 3.26337C14.1243 3.32712 14.1774 3.41503 14.1981 3.5128L14.5277 5.85285L14.5292 5.86372L14.5393 5.86794C15.0734 6.09063 15.5753 6.38363 16.0318 6.73918L16.0406 6.74598L16.0508 6.74185L18.2533 5.85622C18.2534 5.8562 18.2535 5.85618 18.2535 5.85616C18.3478 5.82032 18.4517 5.81884 18.5469 5.85199C18.6422 5.88514 18.7228 5.9508 18.7744 6.03745C18.7745 6.03748 18.7745 6.03752 18.7745 6.03756L20.5482 9.09975L20.5482 9.09981C20.5993 9.18733 20.6176 9.29017 20.5999 9.38994C20.5821 9.48964 20.5295 9.57979 20.4515 9.6443C20.4514 9.64435 20.4514 9.6444 20.4513 9.64445L18.5766 11.1122L18.5679 11.119L18.5694 11.13C18.6092 11.4183 18.6302 11.7089 18.6324 12C18.6308 12.2869 18.6097 12.5735 18.5694 12.8576Z"
                                fill="#9DAEFF" stroke="#9DAEFF" strokeWidth="0.0385111"></path>
                        </svg>


                        Settings
                    </div>
                </div>


                <div id="smm_main_add" style={{display: visibleSection === 'add' ? 'flex' : 'none'}}>
                    <div id="smm_main_add_left">
                        <input type="text" placeholder="link"/>
                        <div className="smm_main_btn" id="add_new" onClick={AddNewLink}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.0002 5.5L12.0002 18.5" stroke="#9DAEFF" strokeWidth="1.8"
                                      strokeLinecap="round"></path>
                                <path d="M5.5 11.9996H18.5" stroke="#9DAEFF" strokeWidth="1.8"
                                      strokeLinecap="round"></path>
                            </svg>


                            Add
                        </div>
                    </div>
                    <div className="smm_main_btn" id="add_new" onClick="smm_popoup('manual_add')">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.0002 5.5L12.0002 18.5" stroke="#9DAEFF" strokeWidth="1.8"
                                  strokeLinecap="round"></path>
                            <path d="M5.5 11.9996H18.5" stroke="#9DAEFF" strokeWidth="1.8"
                                  strokeLinecap="round"></path>
                        </svg>


                        Manual Add
                    </div>
                </div>

                <div
                    id="smm_main_export_options"
                    style={{display: visibleSection === 'export' ? 'flex' : 'none'}}
                >

                    <div className="smm_main_btn" id="export_to_excel" onClick={exportToExcel}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19.715 11.2989V19.7153C19.715 20.0873 19.5672 20.4441 19.3042 20.7072C19.0411 20.9702 18.6843 21.118 18.3123 21.118H5.68773C5.3157 21.118 4.95892 20.9702 4.69585 20.7072C4.43279 20.4441 4.285 20.0873 4.285 19.7153V11.2989C4.285 10.9269 4.43279 10.5701 4.69585 10.307C4.95892 10.044 5.3157 9.89618 5.68773 9.89618H7.79182C7.97783 9.89618 8.15623 9.97008 8.28776 10.1016C8.41929 10.2331 8.49319 10.4115 8.49319 10.5975C8.49319 10.7836 8.41929 10.962 8.28776 11.0935C8.15623 11.225 7.97783 11.2989 7.79182 11.2989H5.68773V19.7153H18.3123V11.2989H16.2082C16.0222 11.2989 15.8438 11.225 15.7122 11.0935C15.5807 10.962 15.5068 10.7836 15.5068 10.5975C15.5068 10.4115 15.5807 10.2331 15.7122 10.1016C15.8438 9.97008 16.0222 9.89618 16.2082 9.89618H18.3123C18.6843 9.89618 19.0411 10.044 19.3042 10.307C19.5672 10.5701 19.715 10.9269 19.715 11.2989ZM8.9894 7.58694L11.2986 5.27683V13.403C11.2986 13.589 11.3725 13.7674 11.5041 13.8989C11.6356 14.0305 11.814 14.1044 12 14.1044C12.186 14.1044 12.3644 14.0305 12.4959 13.8989C12.6275 13.7674 12.7014 13.589 12.7014 13.403V5.27683L15.0106 7.58694C15.1422 7.71855 15.3207 7.79248 15.5068 7.79248C15.6929 7.79248 15.8714 7.71855 16.003 7.58694C16.1346 7.45534 16.2086 7.27685 16.2086 7.09073C16.2086 6.90461 16.1346 6.72612 16.003 6.59451L12.4962 3.0877C12.4311 3.02249 12.3537 2.97075 12.2686 2.93546C12.1834 2.90016 12.0922 2.882 12 2.882C11.9078 2.882 11.8166 2.90016 11.7314 2.93546C11.6463 2.97075 11.5689 3.02249 11.5038 3.0877L7.99697 6.59451C7.86537 6.72612 7.79143 6.90461 7.79143 7.09073C7.79143 7.27685 7.86537 7.45534 7.99697 7.58694C8.12858 7.71855 8.30707 7.79248 8.49319 7.79248C8.6793 7.79248 8.8578 7.71855 8.9894 7.58694Z"
                                fill="#9DAEFF" stroke="#9DAEFF" strokeWidth="0.553543"></path>
                        </svg>

                        excel (full)
                    </div>
                    <div className="smm_main_btn" id="export_to_excel" onClick={exportToExcelScreen}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19.715 11.2989V19.7153C19.715 20.0873 19.5672 20.4441 19.3042 20.7072C19.0411 20.9702 18.6843 21.118 18.3123 21.118H5.68773C5.3157 21.118 4.95892 20.9702 4.69585 20.7072C4.43279 20.4441 4.285 20.0873 4.285 19.7153V11.2989C4.285 10.9269 4.43279 10.5701 4.69585 10.307C4.95892 10.044 5.3157 9.89618 5.68773 9.89618H7.79182C7.97783 9.89618 8.15623 9.97008 8.28776 10.1016C8.41929 10.2331 8.49319 10.4115 8.49319 10.5975C8.49319 10.7836 8.41929 10.962 8.28776 11.0935C8.15623 11.225 7.97783 11.2989 7.79182 11.2989H5.68773V19.7153H18.3123V11.2989H16.2082C16.0222 11.2989 15.8438 11.225 15.7122 11.0935C15.5807 10.962 15.5068 10.7836 15.5068 10.5975C15.5068 10.4115 15.5807 10.2331 15.7122 10.1016C15.8438 9.97008 16.0222 9.89618 16.2082 9.89618H18.3123C18.6843 9.89618 19.0411 10.044 19.3042 10.307C19.5672 10.5701 19.715 10.9269 19.715 11.2989ZM8.9894 7.58694L11.2986 5.27683V13.403C11.2986 13.589 11.3725 13.7674 11.5041 13.8989C11.6356 14.0305 11.814 14.1044 12 14.1044C12.186 14.1044 12.3644 14.0305 12.4959 13.8989C12.6275 13.7674 12.7014 13.589 12.7014 13.403V5.27683L15.0106 7.58694C15.1422 7.71855 15.3207 7.79248 15.5068 7.79248C15.6929 7.79248 15.8714 7.71855 16.003 7.58694C16.1346 7.45534 16.2086 7.27685 16.2086 7.09073C16.2086 6.90461 16.1346 6.72612 16.003 6.59451L12.4962 3.0877C12.4311 3.02249 12.3537 2.97075 12.2686 2.93546C12.1834 2.90016 12.0922 2.882 12 2.882C11.9078 2.882 11.8166 2.90016 11.7314 2.93546C11.6463 2.97075 11.5689 3.02249 11.5038 3.0877L7.99697 6.59451C7.86537 6.72612 7.79143 6.90461 7.79143 7.09073C7.79143 7.27685 7.86537 7.45534 7.99697 7.58694C8.12858 7.71855 8.30707 7.79248 8.49319 7.79248C8.6793 7.79248 8.8578 7.71855 8.9894 7.58694Z"
                                fill="#9DAEFF" stroke="#9DAEFF" strokeWidth="0.553543"></path>
                        </svg>

                        excel (view)
                    </div>
                    <div className="smm_main_btn" id="export_to_excel"
                         onClick={() => downloadFile('json/smm.json', 'data.json')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19.715 11.2989V19.7153C19.715 20.0873 19.5672 20.4441 19.3042 20.7072C19.0411 20.9702 18.6843 21.118 18.3123 21.118H5.68773C5.3157 21.118 4.95892 20.9702 4.69585 20.7072C4.43279 20.4441 4.285 20.0873 4.285 19.7153V11.2989C4.285 10.9269 4.43279 10.5701 4.69585 10.307C4.95892 10.044 5.3157 9.89618 5.68773 9.89618H7.79182C7.97783 9.89618 8.15623 9.97008 8.28776 10.1016C8.41929 10.2331 8.49319 10.4115 8.49319 10.5975C8.49319 10.7836 8.41929 10.962 8.28776 11.0935C8.15623 11.225 7.97783 11.2989 7.79182 11.2989H5.68773V19.7153H18.3123V11.2989H16.2082C16.0222 11.2989 15.8438 11.225 15.7122 11.0935C15.5807 10.962 15.5068 10.7836 15.5068 10.5975C15.5068 10.4115 15.5807 10.2331 15.7122 10.1016C15.8438 9.97008 16.0222 9.89618 16.2082 9.89618H18.3123C18.6843 9.89618 19.0411 10.044 19.3042 10.307C19.5672 10.5701 19.715 10.9269 19.715 11.2989ZM8.9894 7.58694L11.2986 5.27683V13.403C11.2986 13.589 11.3725 13.7674 11.5041 13.8989C11.6356 14.0305 11.814 14.1044 12 14.1044C12.186 14.1044 12.3644 14.0305 12.4959 13.8989C12.6275 13.7674 12.7014 13.589 12.7014 13.403V5.27683L15.0106 7.58694C15.1422 7.71855 15.3207 7.79248 15.5068 7.79248C15.6929 7.79248 15.8714 7.71855 16.003 7.58694C16.1346 7.45534 16.2086 7.27685 16.2086 7.09073C16.2086 6.90461 16.1346 6.72612 16.003 6.59451L12.4962 3.0877C12.4311 3.02249 12.3537 2.97075 12.2686 2.93546C12.1834 2.90016 12.0922 2.882 12 2.882C11.9078 2.882 11.8166 2.90016 11.7314 2.93546C11.6463 2.97075 11.5689 3.02249 11.5038 3.0877L7.99697 6.59451C7.86537 6.72612 7.79143 6.90461 7.79143 7.09073C7.79143 7.27685 7.86537 7.45534 7.99697 7.58694C8.12858 7.71855 8.30707 7.79248 8.49319 7.79248C8.6793 7.79248 8.8578 7.71855 8.9894 7.58694Z"
                                fill="#9DAEFF" stroke="#9DAEFF" strokeWidth="0.553543"></path>
                        </svg>

                        json
                    </div>
                </div>

                <div id="smm_main_table_options">
                    <div className="smm_main_btn" id="show_sort" onClick="show_sort()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M15.6466 5.64663L15.6466 5.64657L12.6466 8.64652C12.6466 8.64654 12.6466 8.64656 12.6466 8.64657C12.5529 8.74033 12.5002 8.86746 12.5002 9.00002C12.5002 9.13255 12.5529 9.25966 12.6465 9.35341C12.6466 9.35345 12.6466 9.35348 12.6466 9.35352M15.6466 5.64663L12.6466 9.35352M15.6466 5.64663L15.6527 5.64038C15.6988 5.59262 15.754 5.55453 15.815 5.52833C15.876 5.50212 15.9416 5.48833 16.008 5.48775C16.0744 5.48717 16.1402 5.49982 16.2017 5.52497C16.2631 5.55011 16.3189 5.58723 16.3659 5.63418C16.4128 5.68113 16.4499 5.73695 16.4751 5.7984C16.5002 5.85985 16.5129 5.92569 16.5123 5.99208C16.5117 6.05847 16.4979 6.12408 16.4717 6.18508C16.4455 6.24608 16.4074 6.30125 16.3597 6.34738L16.3596 6.34732L16.3535 6.35347L13.3535 9.35341M15.6466 5.64663L13.3535 9.35341M12.6466 9.35352C12.7404 9.44719 12.8675 9.49981 13 9.49981C13.1326 9.49981 13.2597 9.44717 13.3535 9.35347M12.6466 9.35352L13.3535 9.35347M13.3535 9.35347C13.3535 9.35345 13.3535 9.35343 13.3535 9.35341M13.3535 9.35347L13.3535 9.35341"
                                fill="#9DAEFF" stroke="#9DAEFF"></path>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M19.7069 9.7071C19.5194 9.89457 19.2651 9.99989 18.9999 9.99989C18.7348 9.99989 18.4804 9.89457 18.2929 9.7071L15.2929 6.7071C15.1108 6.5185 15.01 6.2659 15.0122 6.0037C15.0145 5.7415 15.1197 5.49069 15.3051 5.30528C15.4905 5.11988 15.7413 5.01471 16.0035 5.01243C16.2657 5.01015 16.5183 5.11094 16.7069 5.2931L19.7069 8.2931C19.8944 8.48063 19.9997 8.73494 19.9997 9.0001C19.9997 9.26527 19.8944 9.51957 19.7069 9.7071Z"
                                  fill="#9DAEFF"></path>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M15.9999 6.99994C16.2651 6.99994 16.5195 7.1053 16.707 7.29283C16.8946 7.48037 16.9999 7.73472 16.9999 7.99994V15.9999C16.9999 16.2652 16.8946 16.5195 16.707 16.707C16.5195 16.8946 16.2651 16.9999 15.9999 16.9999C15.7347 16.9999 15.4803 16.8946 15.2928 16.707C15.1053 16.5195 14.9999 16.2652 14.9999 15.9999V7.99994C14.9999 7.73472 15.1053 7.48037 15.2928 7.29283C15.4803 7.1053 15.7347 6.99994 15.9999 6.99994ZM11.7069 14.2929C11.8944 14.4805 11.9997 14.7348 11.9997 14.9999C11.9997 15.2651 11.8944 15.5194 11.7069 15.7069L8.70692 18.7069C8.51832 18.8891 8.26571 18.9899 8.00352 18.9876C7.74132 18.9853 7.49051 18.8802 7.3051 18.6948C7.11969 18.5093 7.01452 18.2585 7.01224 17.9963C7.00997 17.7341 7.11076 17.4815 7.29292 17.2929L10.2929 14.2929C10.4804 14.1055 10.7348 14.0002 10.9999 14.0002C11.2651 14.0002 11.5194 14.1055 11.7069 14.2929Z"
                                  fill="#9DAEFF"></path>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M4.29303 14.293C4.48056 14.1055 4.73487 14.0002 5.00003 14.0002C5.26519 14.0002 5.5195 14.1055 5.70703 14.293L8.70703 17.293C8.80254 17.3852 8.87872 17.4956 8.93113 17.6176C8.98354 17.7396 9.01113 17.8708 9.01228 18.0036C9.01343 18.1363 8.98813 18.268 8.93785 18.3909C8.88757 18.5138 8.81332 18.6255 8.71943 18.7194C8.62553 18.8133 8.51388 18.8875 8.39098 18.9378C8.26809 18.9881 8.13641 19.0134 8.00363 19.0122C7.87085 19.0111 7.73963 18.9835 7.61763 18.9311C7.49562 18.8787 7.38528 18.8025 7.29303 18.707L4.29303 15.707C4.10556 15.5194 4.00024 15.2651 4.00024 15C4.00024 14.7348 4.10556 14.4805 4.29303 14.293Z"
                                  fill="#9DAEFF"></path>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M8 16.9999C7.73478 16.9999 7.48043 16.8946 7.29289 16.707C7.10536 16.5195 7 16.2652 7 15.9999V7.99994C7 7.73472 7.10536 7.48037 7.29289 7.29283C7.48043 7.1053 7.73478 6.99994 8 6.99994C8.26522 6.99994 8.51957 7.1053 8.70711 7.29283C8.89464 7.48037 9 7.73472 9 7.99994V15.9999C9 16.2652 8.89464 16.5195 8.70711 16.707C8.51957 16.8946 8.26522 16.9999 8 16.9999Z"
                                  fill="#9DAEFF"></path>
                        </svg>

                        Sort by
                    </div>
                    <div className="smm_main_btn" id="show_filter" onClick="show_filter()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M18.7952 4H5.20325C5.01101 3.99984 4.82279 4.05509 4.66114 4.15914C4.49949 4.26319 4.37126 4.41164 4.2918 4.58669C4.21235 4.76175 4.18503 4.956 4.21313 5.14618C4.24124 5.33636 4.32356 5.51441 4.45025 5.659L9.75225 11.717C9.91171 11.8995 9.99949 12.1337 9.99925 12.376V17.25C9.99925 17.3276 10.0173 17.4042 10.052 17.4736C10.0868 17.543 10.1372 17.6034 10.1993 17.65L13.1993 19.9C13.2735 19.9557 13.3619 19.9896 13.4543 19.998C13.5468 20.0063 13.6398 19.9887 13.7229 19.9472C13.8059 19.9057 13.8758 19.8419 13.9246 19.7629C13.9734 19.6839 13.9993 19.5929 13.9993 19.5V12.376C13.999 12.1337 14.0868 11.8995 14.2463 11.717L19.5483 5.658C20.1143 5.012 19.6542 4 18.7952 4Z"
                                stroke="#9DAEFF" strokeWidth="2" strokeLinecap="round"></path>
                        </svg>


                        Filter
                    </div>
                </div>


                <div id="smm_main_table">
                    {ssmData.map((item) => (
                        <div className="smm_main_table_cell" id={item.id} key={item.id}>
                            <img
                                className="smm_main_table_social"
                                src={`../images/general/${item.source}.png`}
                                alt=""
                            />
                            <span className="smm_main_table_id" style={{width: "60px"}}>
            {item.id}
          </span>
                            <span className={"smm_main_table_post_img"}>
                            <img
                                className="smm_main_table_post"
                                src={`http://127.0.0.1:5000/proxy_image?url=${encodeURIComponent(item.img)}`}
                                alt="post"
                            />
                            <img
                                className="smm_main_table_post_big"
                                src={`http://127.0.0.1:5000/proxy_image?url=${encodeURIComponent(item.img)}`}
                                alt="post"
                            />
                                </span>

                            <img
                                className="smm_main_table_money"
                                src={
                                    item.sponsor
                                        ? "../images/general/money.png"
                                        : "../images/general/no_money.png"
                                }
                                alt=""
                            />
                            <span className="smm_main_table_text_info" style={{width: "85px"}}>
            {item.date}
          </span>
                            <span className="smm_main_table_text_info" style={{width: "85px"}}>
            {item.day}
          </span>
                            <span className="smm_main_table_text_info" style={{width: "70px"}}>
            {item.operator}
          </span>
                            <div className="smm_main_table_social_count">
                                <span style={{width: "35px"}}>{item.likes}</span>
                                <img
                                    className="smm_main_table_social_svg"
                                    src="../images/general/like.png"
                                    alt=""
                                />
                            </div>
                            <div className="smm_main_table_social_count">
                                <span style={{width: "35px"}}>{item.comments}</span>
                                <img
                                    className="smm_main_table_social_svg"
                                    src="../images/general/comment.png"
                                    alt=""
                                />
                            </div>
                            <div className="smm_main_table_social_count">
                                <span style={{width: "35px"}}>{item.shares}</span>
                                <img
                                    className="smm_main_table_social_svg"
                                    src="../images/general/share.png"
                                    alt=""
                                />
                            </div>
                            <span
                                className="smm_main_table_text_info_type"
                                style={{width: "100px"}}
                            >
            {item.subject}
          </span>
                            <span
                                className="smm_main_table_text_info_type"
                                style={{width: "100px"}}
                            >
            {item.type}
          </span>
                            <a className="smm_main_table_text_info" href={item.link}>
                                link
                            </a>
                            <img
                                className="smm_main_table_control smm_main_table_control_more"
                                onClick={() => showInfoPopup(item.id)}
                                src="../images/general/more.png"
                                alt=""
                            />
                            <img
                                className="smm_main_table_control smm_main_table_control_edit"
                                onClick={() => showEditPopup(item.id)}
                                src="../images/general/edit.png"
                                alt=""
                            />
                        </div>
                    ))}
                </div>
            </div>

            <Popup
                id="manual_add"
                title="Manual Add"
                isVisible={isPopupVisible}
                onClose={togglePopup}
            >
                Manual Add Form or Content Here
            </Popup>
            <div className="smm_main_btn" id="add_new" onClick={togglePopup}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.0002 5.5L12.0002 18.5" stroke="#9DAEFF" strokeWidth="1.8" strokeLinecap="round"></path>
                    <path d="M5.5 11.9996H18.5" stroke="#9DAEFF" strokeWidth="1.8" strokeLinecap="round"></path>
                </svg>
                Add
            </div>
        </>
    );
}
const showInfoPopup = (id: string) => {
    // Implement the popup logic here
    console.log("Show info popup for", id);
};

const showEditPopup = (id: string) => {
    // Implement the popup logic here
    console.log("Show edit popup for", id);
};
