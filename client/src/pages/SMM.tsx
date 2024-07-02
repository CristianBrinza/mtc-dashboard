import "../styles/smm.css";
import React, { useEffect, useState } from "react";
import Popup from "../components/Popup";
import Button from "../components/Button";
import Icon from "../components/Icon";

interface SsmData {
    id: string;
    img: string;
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
    comment: string;
}

export default function SMM() {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isOperatorPopupPopupVisible, setUpdateOperatorPopupVisible] = useState(false);
    const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
    const [isConfirmPopupVisible, setIsConfirmPopupVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SsmData | null>(null);
    const [ssmData, setSsmData] = useState<SsmData[]>([]);
    const [visibleSection, setVisibleSection] = useState<string | null>(null);
    const [visibleSort, setVisibleSort] = useState<string | null>(null);
    const [visibleFilter, setVisibleFilter] = useState<string | null>(null);
    const [visibleNewAdvanced, setVisibleNewAdvanced] = useState<string | null>(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [statusMessage, setStatusMessage] = useState(" ");
    const [formInputs, setFormInputs] = useState({ operator: '', subject: '', sponsor: false, type: '', comment: '' });
    const [sortCriteria, setSortCriteria] = useState("none");
    const [updateOperatorsFeedbackMessage, setUpdateOperatorsFeedbackMessage] = useState("");
    const [visibleUpdateBlock, setVisibleUpdateBlock] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState("ascending");
    const [filterCriteria, setFilterCriteria] = useState({
        operator: [],
        subject: [],
        type: [],
        sponsor: null,
        dateRange: { from: "", to: "" },
        day: [],
        source: [],
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isInfoPopupVisible, setIsInfoPopupVisible] = useState(false);
    const [selectedItemInfo, setSelectedItemInfo] = useState<SsmData | null>(null);
    const [isUpdatePopupVisible, setIsUpdatePopupVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateStatusMessage, setUpdateStatusMessage] = useState("");
    const [isUpdateComplete, setIsUpdateComplete] = useState(false);

    const baseUrl = import.meta.env.VITE_BACKEND_SOCIAL_URL;

    useEffect(() => {
        const loadMenuButtons = async () => {
            try {
                const response = await fetch(`${baseUrl}/json/smm`, { method: "GET" });
                if (!response.ok) throw new Error("Network response was not ok");
                const data: SsmData[] = await response.json();
                setSsmData(data);
            } catch (error) {
                console.error("Error fetching the JSON data:", error);
            }
        };
        loadMenuButtons();
    }, [baseUrl]);

    const togglePopup = () => setIsPopupVisible(!isPopupVisible);
    const toggleUpdateOperatorPopup = () => setUpdateOperatorPopupVisible(!isOperatorPopupPopupVisible);

    const toggleEditPopup = () => setIsEditPopupVisible(!isEditPopupVisible);
    const toggleConfirmPopup = () => setIsConfirmPopupVisible(!isConfirmPopupVisible);

    const toggleSection = (section: string) => {
        setVisibleSection(visibleSection === section ? null : section);
    };

    const toggleNewAdvanced = () => {
        setVisibleNewAdvanced(visibleNewAdvanced === "advenced" ? null : "advenced");
    };

    const exportToExcel = () => {
        const csvData = convertToCSV(ssmData);
        downloadCSV(csvData);
    };

    const exportToExcelScreen = () => {
        const filteredAndSortedData = searchFilter(filterData(sortData(ssmData)));
        const csvData = convertToCSV(filteredAndSortedData);
        downloadCSV(csvData);
    };

    const convertToCSV = (objArray) => {
        const array = typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
        let str = "";
        const headers = ["id", "img", "source", "sponsor", "date", "day", "operator", "likes", "comments", "shares", "subject", "type", "link", "comment"];
        str += headers.join(",") + "\r\n";
        for (let i = 0; i < array.length; i++) {
            let line = "";
            for (const header of headers) {
                if (line !== "") line += ",";
                line += array[i][header] !== undefined ? `"${array[i][header]}"` : "";
            }
            str += line + "\r\n";
        }
        return str;
    };

    const downloadCSV = (csvData) => {
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.setAttribute("href", url);
        a.setAttribute("download", "data.csv");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const downloadFile = (url, filename) => {
        fetch(url, { headers: { "Content-Type": "application/json" } })
            .then((response) => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then((data) => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch((error) => console.error("There was a problem with the fetch operation:", error));
    };

    const generateUniqueNumericId = (existingIds) => {
        let newId;
        const baseId = 1000000;
        const increment = 100;
        do {
            newId = baseId + Math.floor(Math.random() * increment) * increment;
        } while (existingIds.includes(newId.toString()));
        return newId.toString();
    };

    const getDayOfWeek = (dateString) => {
        const [day, month, year] = dateString.split(".").map(Number);
        const date = new Date(year, month - 1, day);
        if (isNaN(date.getTime())) return "Invalid Date";
        const options = { weekday: "long" };
        return new Intl.DateTimeFormat("en-US", options).format(date);
    };

    const AddNewLink = async () => {
        const linkInputElement = document.querySelector("#smm_main_add_left input") as HTMLInputElement;
        const linkInput = linkInputElement.value;
        const operatorSelectElement = document.querySelector("#smm_main_add_left_advenced_block select[name='operator']") as HTMLSelectElement;
        const subjectSelectElement = document.querySelector("#smm_main_add_left_advenced_block select[name='subject']") as HTMLSelectElement;
        const typeSelectElement = document.querySelector("#smm_main_add_left_advenced_block select[name='type']") as HTMLSelectElement;
        const sponsorCheckboxElement = document.querySelector("#smm_main_add_left_advenced_block input[name='sponsor']") as HTMLInputElement;

        const operator = operatorSelectElement.value;
        const subject = subjectSelectElement.value;
        const type = typeSelectElement.value;
        const sponsor = sponsorCheckboxElement.checked;

        setIsButtonDisabled(true);
        setStatusMessage("Processing...");

        if (linkInput.includes("www.instagram.com")) {
            try {
                const response = await fetch(`${baseUrl}/get_insta_post?url=${encodeURIComponent(linkInput)}`);
                if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
                const data = await response.json();

                const newId = generateUniqueNumericId(ssmData.map((item) => item.id));
                const social_instagram_post = {
                    id: newId,
                    img: data.Cover_Image_URL,
                    sponsor,
                    source: "instagram",
                    date: data.Date,
                    day: getDayOfWeek(data.Date),
                    operator: operator || "",
                    likes: data.Likes || 0,
                    comments: data.Comments || 0,
                    shares: data.Shares || 0,
                    subject: subject || "",
                    type: type || "",
                    link: linkInput,
                    comment: ""
                };

                if (ssmData.some((item) => item.link === linkInput)) {
                    setStatusMessage("Error, link already exists");
                    setIsButtonDisabled(false);
                    return;
                }

                const updatedData = [social_instagram_post, ...ssmData];
                setSsmData(updatedData);

                const fetchResponse = await fetch(`${baseUrl}/json/smm`, { method: "GET" });
                if (!fetchResponse.ok) throw new Error(`Network response was not ok: ${fetchResponse.statusText}`);
                const existingData = await fetchResponse.json();
                const newUpdatedData = [social_instagram_post, ...existingData];

                const jsonResponse = await fetch(`${baseUrl}/json/smm`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newUpdatedData),
                });

                if (!jsonResponse.ok) throw new Error(`Failed to update JSON file on server: ${jsonResponse.statusText}`);

                setStatusMessage("Done");
                linkInputElement.value = "";
            } catch (error) {
                console.error("Error fetching the post data:", error.message);
                setStatusMessage("Error occurred");
            } finally {
                setIsButtonDisabled(false);
            }
        } else {
            setStatusMessage("Invalid URL");
            setIsButtonDisabled(false);
        }
    };

    const showEditPopup = (id: string) => {
        const item = ssmData.find((data) => data.id === id);
        if (item) {
            setSelectedItem(item);
            setFormInputs({
                operator: item.operator || '',
                subject: item.subject || '',
                sponsor: item.sponsor,
                type: item.type || '',
                comment: item.comment || ''
            });
            toggleEditPopup();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormInputs({ ...formInputs, [name]: value });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormInputs({ ...formInputs, sponsor: e.target.checked });
    };

    const handleUpdate = async () => {
        if (selectedItem) {
            const updatedItem = { ...selectedItem, ...formInputs };
            const updatedData = ssmData.map((item) => item.id === selectedItem.id ? updatedItem : item);
            setSsmData(updatedData);

            try {
                const response = await fetch(`${baseUrl}/json/smm`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedData),
                });

                if (!response.ok) throw new Error(`Failed to update JSON file on server: ${response.statusText}`);
                toggleEditPopup();
            } catch (error) {
                console.error("Error updating the JSON data:", error.message);
            }
        }
    };

    const handleDelete = async () => {
        if (selectedItem) {
            const updatedData = ssmData.filter((item) => item.id !== selectedItem.id);
            setSsmData(updatedData);

            try {
                const response = await fetch(`${baseUrl}/json/smm`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: selectedItem.id }),
                });

                if (!response.ok) throw new Error(`Failed to delete item on server: ${response.statusText}`);
                toggleEditPopup();
            } catch (error) {
                console.error("Error deleting the item:", error.message);
            }
        }
    };

    const handleConfirmDelete = async () => {
        if (selectedItem) {
            const updatedData = ssmData.filter((item) => item.id !== selectedItem.id);
            setSsmData(updatedData);

            try {
                const response = await fetch(`${baseUrl}/json/smm`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: selectedItem.id }),
                });

                if (!response.ok) throw new Error(`Failed to delete item on server: ${response.statusText}`);
                toggleEditPopup();
                setIsConfirmPopupVisible(false);
            } catch (error) {
                console.error("Error deleting the item:", error.message);
            }
        }
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => setSortCriteria(e.target.value);
    const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value);

    const sortData = (data: SsmData[]) => {
        if (sortCriteria === "none") return data;
        const sortedData = [...data];
        sortedData.sort((a, b) => {
            let comparison = 0;
            switch (sortCriteria) {
                case "date":
                    comparison = parseDateString(a.date).getTime() - parseDateString(b.date).getTime();
                    break;
                case "likes":
                    comparison = a.likes - b.likes;
                    break;
                case "comments":
                    comparison = a.comments - b.comments;
                    break;
                case "shares":
                    comparison = a.shares - b.shares;
                    break;
                default:
                    break;
            }
            return sortOrder === "ascending" ? comparison : -comparison;
        });
        return sortedData;
    };

    useEffect(() => {
        const savedSortCriteria = localStorage.getItem("sortCriteria");
        const savedSortOrder = localStorage.getItem("sortOrder");
        if (savedSortCriteria) setSortCriteria(savedSortCriteria);
        if (savedSortOrder) setSortOrder(savedSortOrder);
    }, []);

    useEffect(() => {
        localStorage.setItem("sortCriteria", sortCriteria);
        localStorage.setItem("sortOrder", sortOrder);
    }, [sortCriteria, sortOrder]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSearchQuery('');
        setFilterCriteria((prev) => {
            if (name === "withSponsor" || name === "withoutSponsor") {
                let sponsor = null;
                if (name === "withSponsor" && checked) sponsor = true;
                if (name === "withoutSponsor" && checked) sponsor = false;
                if (!checked) sponsor = null;
                return { ...prev, sponsor };
            } else if (type === "checkbox") {
                return { ...prev, [name]: checked ? [...prev[name], value] : prev[name].filter((item) => item !== value) };
            } else if (type === "date") {
                return { ...prev, dateRange: { ...prev.dateRange, [name]: value } };
            } else {
                return { ...prev, [name]: value };
            }
        });
    };

    const handleSearchChange = (e) => setSearchQuery(e.target.value);

    const searchFilter = (data) => {
        if (!searchQuery) return data;
        return data.filter((item) => item.link.includes(searchQuery) || item.id.includes(searchQuery));
    };

    const parseDateString = (dateString: string): Date => {
        const [day, month, year] = dateString.split('.').map(Number);
        return new Date(year, month - 1, day);
    };

    const filterData = (data) => {
        return data.filter((item) => {
            const operatorMatch = filterCriteria.operator.length === 0 || filterCriteria.operator.includes(item.operator);
            const subjectMatch = filterCriteria.subject.length === 0 || filterCriteria.subject.includes(item.subject);
            const typeMatch = filterCriteria.type.length === 0 || filterCriteria.type.includes(item.type);
            const sponsorMatch = filterCriteria.sponsor === null || item.sponsor === filterCriteria.sponsor;
            const dateMatch = (!filterCriteria.dateRange.from || parseDateString(item.date) >= new Date(filterCriteria.dateRange.from)) &&
                (!filterCriteria.dateRange.to || parseDateString(item.date) <= new Date(filterCriteria.dateRange.to));
            const dayMatch = filterCriteria.day.length === 0 || filterCriteria.day.includes(item.day);
            const sourceMatch = filterCriteria.source.length === 0 || filterCriteria.source.includes(item.source);
            return operatorMatch && subjectMatch && typeMatch && sponsorMatch && dateMatch && dayMatch && sourceMatch;
        });
    };

    const showInfoPopup = (id: string) => {
        const item = ssmData.find((data) => data.id === id);
        if (item) {
            setSelectedItemInfo(item);
            setIsInfoPopupVisible(true);
        }
    };

    const handleUpdateAll = async () => {
        setIsUpdatePopupVisible(true);
        setIsUpdating(true);
        setUpdateStatusMessage("Updating records...");

        try {
            const filteredData = searchFilter(filterData(ssmData));
            const updatedData = [];

            for (const item of filteredData) {
                const response = await fetch(`${baseUrl}/get_insta_post?url=${encodeURIComponent(item.link)}`);
                if (response.ok) {
                    const data = await response.json();
                    const updatedItem = { ...item, likes: data.Likes || 0, comments: data.Comments || 0, shares: data.Shares || 0 };
                    updatedData.push(updatedItem);
                } else {
                    console.error(`Failed to update item with ID ${item.id}`);
                }
            }

            const finalData = ssmData.map(item => updatedData.find(updatedItem => updatedItem.id === item.id) || item);
            setSsmData(finalData);

            const response = await fetch(`${baseUrl}/json/smm`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalData),
            });

            if (response.ok) {
                setUpdateStatusMessage("Update complete!");
                setIsUpdateComplete(true);
            } else {
                throw new Error("Failed to update the server.");
            }
        } catch (error) {
            console.error("Error updating records:", error.message);
            setUpdateStatusMessage("An error occurred during the update.");
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isUpdating) {
                e.preventDefault();
                e.returnValue = "The data is still updating. Are you sure you want to leave?";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isUpdating]);

    const handleUpdateOperators = async () => {
        const operatorSelectElement = document.querySelector(".update_operators_select") as HTMLSelectElement;
        const nrInputElement = document.querySelector(".update_operators_input") as HTMLInputElement;

        const operatorValue = operatorSelectElement.value;
        const operatorArray = JSON.parse(operatorValue);
        const operatorURL = operatorArray[0];
        const operatorName = operatorArray[1];
        const nr = nrInputElement.value;

        if (!operatorURL || !nr) {
            console.error("Operator and number of posts are required");
            setUpdateOperatorsFeedbackMessage("Error: Operator and number of posts are required");
            return;
        }

        setUpdateOperatorsFeedbackMessage("Processing...");
        setIsUpdating(true);

        try {
            const response = await fetch(`${baseUrl}/get_insta_post_links?nr=${nr}&operator=${encodeURIComponent(operatorURL)}`);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

            const data = await response.json();
            const newLinks = data.filter(link => {
                const linkExists = ssmData.some(item => item.link === link);
                if (linkExists) {
                    console.log("Link already exists:", link);
                }
                return !linkExists;
            });

            for (const link of newLinks) {
                await addNewLinkToDatabase(link, operatorName);
            }

            setUpdateOperatorsFeedbackMessage("Done");
        } catch (error) {
            console.error("Error fetching post links:", error);
            setUpdateOperatorsFeedbackMessage("Error occurred");
        } finally {
            setIsUpdating(false);
        }
    };



    const addNewLinkToDatabase = async (link, operator) => {
        try {
            const response = await fetch(`${baseUrl}/get_insta_post?url=${encodeURIComponent(link)}`);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
            const data = await response.json();

            const newId = generateUniqueNumericId(ssmData.map((item) => item.id));
            const social_instagram_post = {
                id: newId,
                img: data.Cover_Image_URL,
                sponsor: false,
                source: "instagram",
                date: data.Date,
                day: getDayOfWeek(data.Date),
                operator: operator || "",
                likes: data.Likes || 0,
                comments: data.Comments || 0,
                shares: data.Shares || 0,
                subject: "",
                type: "",
                link,
                comment: ""
            };

            const updatedData = [social_instagram_post, ...ssmData];
            setSsmData(updatedData);

            const fetchResponse = await fetch(`${baseUrl}/json/smm`, { method: "GET" });
            if (!fetchResponse.ok) throw new Error(`Network response was not ok: ${fetchResponse.statusText}`);
            const existingData = await fetchResponse.json();
            const newUpdatedData = [social_instagram_post, ...existingData];

            const jsonResponse = await fetch(`${baseUrl}/json/smm`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUpdatedData),
            });

            if (!jsonResponse.ok) throw new Error(`Failed to update JSON file on server: ${jsonResponse.statusText}`);
        } catch (error) {
            console.error("Error adding new link to database:", error.message);
        }
    };




    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isUpdating) {
                e.preventDefault();
                e.returnValue = "The data is still updating. Are you sure you want to leave?";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isUpdating]);




    return (
        <>
            <div className="smm_main">
                <div id="smm_main_title">Moldtelecom SMM | Marketing Dashboard</div>
                <div id="smm_main_options">
                    <Button id="add_new" className={`smm_main_btn ${visibleSection === 'add' ? 'smm_main_btn_pressed' : ''}`} onClick={() => toggleSection('add')}>
                        <Icon type="add" />
                        Add
                    </Button>
                    <Button id="show_export_setting" className={`smm_main_btn ${visibleSection === 'export' ? 'smm_main_btn_pressed' : ''}`} onClick={() => toggleSection('export')}>
                        <Icon type="export" />
                        Export
                    </Button>
                    <Button className={`smm_main_btn ${visibleSection === 'options' ? 'smm_main_btn_pressed' : ''}`} onClick={() => toggleSection('options')}>
                        <Icon type="options" />
                        Options
                    </Button>
                    <Button className="smm_main_btn">
                        <Icon type="settings" />
                        Settings
                    </Button>
                </div>

                <div id="smm_main_add" style={{ display: visibleSection === 'add' ? 'flex' : 'none' }}>
                    <div>
                        <div id="smm_main_add_left">
                            <input type="text" placeholder="link" />
                            <Button id="add_new" onClick={!isButtonDisabled ? AddNewLink : null} style={{ opacity: isButtonDisabled ? 0.5 : 1 }}>
                                <Icon type="add" />
                                Add
                            </Button>
                            <Button id="smm_main_add_left_advenced" className={visibleNewAdvanced === 'advenced' ? 'smm_main_btn_pressed' : ''} onClick={toggleNewAdvanced}>
                                Advanced
                            </Button>
                            <div>{statusMessage}</div>
                        </div>
                        <div id="smm_main_add_left_advenced_block" style={{ display: visibleNewAdvanced === 'advenced' ? 'flex' : 'none' }}>
                            <select name="operator">
                                <option value="">Select Operator</option>
                                <option value="Moldtelecom">Moldtelecom</option>
                                <option value="Orange MD">Orange MD</option>
                                <option value="Orange RO">Orange RO</option>
                                <option value="Moldcell">Moldcell</option>
                                <option value="Vodaphone RO">Vodaphone RO</option>
                                <option value="Vodaphone IT">Vodaphone IT</option>
                                <option value="Arax">Arax</option>
                                <option value="Starnet">Starnet</option>
                                <option value="Megafon">RU | Megafon</option>
                                <option value="MTS">RU | MTS</option>
                                <option value="Beeline">RU | Beeline</option>
                                <option value="Darwin">Others | Darwin</option>
                                <option value="Enter">Others | Enter</option>
                                <option value="MAIB">Others | MAIB</option>
                            </select>
                            <select name="subject">
                                <option value="">Select Subject</option>
                                <option value="Comercial">Comercial</option>
                                <option value="PR">Branding | PR</option>
                                <option value="Event">Branding | Event</option>
                                <option value="Promoted">Branding | Promoted</option>
                                <option value="Informativ">Informativ</option>
                                <option value="Interactiv">Interactiv</option>
                            </select>
                            <select name="type">
                                <option value="">Select Type</option>
                                <option value="Carousel">Carousel</option>
                                <option value="Reel">Reel</option>
                                <option value="Video">Video</option>
                                <option value="Solo">Solo</option>
                                <option value="Animated">Animated</option>
                            </select>
                            <div className="smm_main_add_label">Sponsor:</div>
                            <label className="toggle-switch">
                                <input type="checkbox" name="sponsor" onChange={handleInputChange} checked={formInputs.sponsor} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div id="smm_main_add_option_plus">
                        <Button id="add_new" onClick={toggleUpdateOperatorPopup}>
                            <Icon type="update" />
                            Update operators
                        </Button>

                        <Button id="add_new" onClick={togglePopup}>
                            <Icon type="add" />
                            Manual Add
                        </Button>
                    </div>
                </div>

                <div id="smm_main_export_options" style={{ display: visibleSection === 'export' ? 'flex' : 'none' }}>
                    <Button id="export_to_excel" onClick={exportToExcel}>
                        <Icon type="export" />
                        excel (full)
                    </Button>
                    <Button id="export_to_excel" onClick={exportToExcelScreen}>
                        <Icon type="export" />
                        excel (view)
                    </Button>
                    <Button id="export_to_excel" onClick={() => downloadFile('json/smm.json', 'data.json')}>
                        <Icon type="export" />
                        json
                    </Button>
                </div>

                <div id="smm_main_export_options_block" style={{ display: visibleSection === 'options' ? 'flex' : 'none' }}>
                    <Button onClick={handleUpdateAll}>
                        <Icon type="update" />
                        Update
                    </Button>
                </div>

                <div id="smm_main_table_options">
                    <input type="text" placeholder="Search by link or ID" value={searchQuery} onChange={handleSearchChange} />
                    <Button id="show_sort" className={visibleSort === 'sorting' ? 'smm_main_btn_pressed' : ''} onClick={() => setVisibleSort(visibleSort === "sorting" ? null : "sorting")}>
                        <Icon type="sort" />
                        Sort by
                    </Button>
                    <Button id="show_filter" className={visibleFilter === 'filter' ? 'smm_main_btn_pressed' : ''} onClick={() => setVisibleFilter(visibleFilter === "filter" ? null : "filter")}>
                        <Icon type="filter" />
                        Filter
                    </Button>
                </div>

                <div id="smm_main_sorting" style={{ display: visibleSort === 'sorting' ? 'flex' : 'none' }}>
          <span>
            <input type="radio" name="sortCriteria" value="none" onChange={handleSortChange} checked={sortCriteria === "none"} />
            <span>no sorting</span>&nbsp;&nbsp;&nbsp;&nbsp;
              <input type="radio" name="sortCriteria" value="date" onChange={handleSortChange} checked={sortCriteria === "date"} />
            <span>by date</span>&nbsp;&nbsp;&nbsp;&nbsp;
              <input type="radio" name="sortCriteria" value="likes" onChange={handleSortChange} checked={sortCriteria === "likes"} />
            <span>by likes</span>&nbsp;&nbsp;&nbsp;&nbsp;
              <input type="radio" name="sortCriteria" value="comments" onChange={handleSortChange} checked={sortCriteria === "comments"} />
            <span>by comments</span>&nbsp;&nbsp;&nbsp;&nbsp;
              <input type="radio" name="sortCriteria" value="shares" onChange={handleSortChange} checked={sortCriteria === "shares"} />
            <span>by shares</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
                    <select onChange={handleOrderChange} value={sortOrder}>
                        <option value="ascending">ascending</option>
                        <option value="descending">descending</option>
                    </select>
                </div>

                <div id="smm_main_filtering" style={{ display: visibleFilter === 'filter' ? 'flex' : 'none' }}>

                    <div className={"smm_main_filtering_block"}>
                        <div className={"smm_main_filtering_bold"}>Operator:</div>
                        <div>
                        <div className={"smm_main_filtering_muiltiple_choice"}>
                            <input type="checkbox" name="operator" value="Moldtelecom"
                                   onChange={handleFilterChange}/> Moldtelecom
                            <div className={"smm_main_filtering_block_category"}>
                                <input type="checkbox" name="operator" value="Orange MD"
                                       onChange={handleFilterChange}/> Orange MD
                                <input type="checkbox" name="operator" value="Orange RO"
                                       onChange={handleFilterChange}/> Orange RO
                            </div>
                            <input type="checkbox" name="operator" value="Moldcell"
                                   onChange={handleFilterChange}/> Moldcell
                            <input type="checkbox" name="operator" value="Starnet"
                                   onChange={handleFilterChange}/> Starnet
                            <input type="checkbox" name="operator" value="Arax" onChange={handleFilterChange}/> Arax
                            <div className={"smm_main_filtering_block_category"}>
                                RU |
                                <input type="checkbox" name="operator" value="Megafon"
                                       onChange={handleFilterChange}/> Megafon
                                <input type="checkbox" name="operator" value="MTS" onChange={handleFilterChange}/> MTS
                                <input type="checkbox" name="operator" value="Beeline"
                                       onChange={handleFilterChange}/> Beeline
                            </div>
                            <div className={"smm_main_filtering_block_category"}>
                                <input type="checkbox" name="operator" value="Vodaphone RO"
                                       onChange={handleFilterChange}/> Vodaphone RO
                                <input type="checkbox" name="operator" value="Vodaphone IT"
                                       onChange={handleFilterChange}/> Vodaphone IT
                            </div>
                        </div>

                        <div className={"smm_main_filtering_muiltiple_choice"}>
                            Others :
                            <input type="checkbox" name="operator" value="Darwin"
                                   onChange={handleFilterChange}/> Darwin
                            <input type="checkbox" name="operator" value="Enter"
                                   onChange={handleFilterChange}/> Enter
                            <input type="checkbox" name="operator" value="MAIB"
                                   onChange={handleFilterChange}/> MAIB
                        </div>
                        </div>
                    </div>
                    <div className={"smm_main_filtering_block"}>
                        <div className={"smm_main_filtering_bold"}>Subject:</div>
                        <div className={"smm_main_filtering_block_category"}>
                            Branding |
                            <input type="checkbox" name="subject" value="Event" onChange={handleFilterChange} /> Event
                            <input type="checkbox" name="subject" value="PR" onChange={handleFilterChange} /> PR
                            <input type="checkbox" name="subject" value="Promoted" onChange={handleFilterChange} /> Promoted
                        </div>
                        <input type="checkbox" name="subject" value="Comercial" onChange={handleFilterChange} /> Comercial
                        <input type="checkbox" name="subject" value="Informativ" onChange={handleFilterChange} /> Informativ
                        <input type="checkbox" name="subject" value="Interactiv" onChange={handleFilterChange} /> Interactiv
                    </div>
                    <div className={"smm_main_filtering_block"}>
                        <div className={"smm_main_filtering_bold"}>Type:</div>
                        <input type="checkbox" name="type" value="Carousel" onChange={handleFilterChange} /> Carousel
                        <input type="checkbox" name="type" value="Reel" onChange={handleFilterChange} /> Reel
                        <input type="checkbox" name="type" value="Video" onChange={handleFilterChange} /> Video
                        <input type="checkbox" name="type" value="Solo" onChange={handleFilterChange} /> Solo
                        <input type="checkbox" name="type" value="Animated" onChange={handleFilterChange} /> Animated
                    </div>
                    <div className={"smm_main_filtering_block"}>
                        <div className={"smm_main_filtering_bold"}>Sponsor:</div>
                        <label>
                            <input type="checkbox" name="withSponsor" value="withSponsor" checked={filterCriteria.sponsor === true} onChange={handleFilterChange} />
                            Yes
                        </label>
                        <label>
                            <input type="checkbox" name="withoutSponsor" value="withoutSponsor" checked={filterCriteria.sponsor === false} onChange={handleFilterChange} />
                            No
                        </label>
                    </div>
                    <div className={"smm_main_filtering_block"}>
                        <div className={"smm_main_filtering_bold"}>Date Range:</div>
                        <input type="date" name="from" onChange={handleFilterChange} />&nbsp; to &nbsp;
                        <input type="date" name="to" onChange={handleFilterChange} />
                    </div>
                    <div className={"smm_main_filtering_block"}>
                        <div className={"smm_main_filtering_bold"}>Day:</div>
                        <input type="checkbox" name="day" value="Monday" onChange={handleFilterChange} /> Monday
                        <input type="checkbox" name="day" value="Tuesday" onChange={handleFilterChange} /> Tuesday
                        <input type="checkbox" name="day" value="Wednesday" onChange={handleFilterChange} /> Wednesday
                        <input type="checkbox" name="day" value="Thursday" onChange={handleFilterChange} /> Thursday
                        <input type="checkbox" name="day" value="Friday" onChange={handleFilterChange} /> Friday
                        <input type="checkbox" name="day" value="Saturday" onChange={handleFilterChange} /> Saturday
                        <input type="checkbox" name="day" value="Sunday" onChange={handleFilterChange} /> Sunday
                    </div>
                    <div className={"smm_main_filtering_block"}>
                        <div className={"smm_main_filtering_bold"}>Source:</div>
                        <input type="checkbox" name="source" value="instagram" onChange={handleFilterChange} /> Instagram
                        <input type="checkbox" name="source" value="facebook" onChange={handleFilterChange} /> Facebook
                    </div>
                </div>

                <div id="smm_main_table">
                    {searchFilter(filterData(sortData(ssmData))).map((item) => (
                        <div className="smm_main_table_cell" id={item.id} key={item.id}>
                            <img className="smm_main_table_social" src={`../images/general/${item.source}.png`} alt="" />
                            <span className="smm_main_table_id" style={{ width: "60px" }}>{item.id}</span>
                            <span className={"smm_main_table_post_img"}>
                <img className="smm_main_table_post" src={`http://127.0.0.1:5000/proxy_image?url=${encodeURIComponent(item.img)}`} alt="post" />
                <img className="smm_main_table_post_big" src={`http://127.0.0.1:5000/proxy_image?url=${encodeURIComponent(item.img)}`} alt="post" />
              </span>
                            <img className="smm_main_table_money" src={item.sponsor ? "../images/general/money.png" : "../images/general/no_money.png"} alt="" />
                            <span className="smm_main_table_text_info" style={{ width: "85px" }}>{item.date}</span>
                            <span className="smm_main_table_text_info" style={{ width: "85px" }}>{item.day}</span>
                            <span className="smm_main_table_text_info" style={{ width: "105px" }}>{item.operator}</span>
                            <div className="smm_main_table_social_count">
                                <span style={{ width: "30px" }}>{item.likes}</span>
                                <img className="smm_main_table_social_svg" src="../images/general/like.png" alt="" />
                            </div>
                            <div className="smm_main_table_social_count">
                                <span style={{ width: "30px" }}>{item.comments}</span>
                                <img className="smm_main_table_social_svg" src="../images/general/comment.png" alt="" />
                            </div>
                            <div className="smm_main_table_social_count">
                                <span style={{ width: "30px" }}>{item.shares}</span>
                                <img className="smm_main_table_social_svg" src="../images/general/share.png" alt="" />
                            </div>
                            <span className="smm_main_table_text_info_type" style={{ width: "100px" }}>{item.subject}</span>
                            <span className="smm_main_table_text_info_type" style={{ width: "100px" }}>{item.type}</span>
                            <a className="smm_main_table_text_info" href={item.link}>link</a>
                            <img className="smm_main_table_control smm_main_table_control_more" onClick={() => showInfoPopup(item.id)} src="../images/general/more.png" alt="" />
                            <img className="smm_main_table_control smm_main_table_control_edit" onClick={() => showEditPopup(item.id)} src="../images/general/edit.png" alt="" />
                        </div>
                    ))}
                </div>
            </div>

            <Popup id="manual_add" title="Manual Add" isVisible={isPopupVisible} onClose={togglePopup}>
                Manual Add Form or Content Here
            </Popup>
            <Popup
                id="update_operators"
                title="Update operators"
                isVisible={isOperatorPopupPopupVisible}
                onClose={isUpdating ? () => {
                } : toggleUpdateOperatorPopup}
            >
                <div className={"update_operators_block_top"}>
                    <Button id="update_operators_btn" type="button"
                            onClick={() => setVisibleUpdateBlock('instagram')}>Instagram</Button>
                    <Button id="update_operators_btn" type="button"
                            onClick={() => setVisibleUpdateBlock('facebook')}>Facebook</Button>
                    <Button id="update_operators_btn" type="button"
                            onClick={() => setVisibleUpdateBlock('tiktok')}>TikTok</Button>
                </div>
                <div className={"update_operators_block"} id="update_operators_block_instagram"
                     style={{display: visibleUpdateBlock === 'instagram' ? 'flex' : 'none'}}>
                    <select name="operator" className={"update_operators_select"}>
                        <option value="">Select Operator</option>
                        <option value='["https://www.instagram.com/moldtelecom.md/","Moldtelecom"]'>Moldtelecom</option>
                        <option value='["https://www.instagram.com/orange.md/","Orange MD"]'>Orange MD</option>
                        <option value='["https://www.instagram.com/orange.ro/","Orange RO"]'>Orange RO</option>
                        <option value='["https://www.instagram.com/moldcell/","Moldcell"]'>Moldcell</option>
                        <option value='["https://www.instagram.com/starnet/","Starnet"]'>Starnet</option>
                        <option value='["https://www.instagram.com/vodafone.ro/","Vodaphone RO"]'>Vodaphone RO</option>
                        <option value='["https://www.instagram.com/vodafone.it/","Vodaphone IT"]'>Vodaphone IT</option>
                        <option value='["https://www.instagram.com/arax/","Arax"]'>Arax</option>
                        <option value='["https://www.instagram.com/mts.ru/","MTS"]'>RU | MTS</option>
                        <option value='["https://www.instagram.com/megafon/","Megafon"]'>RU | Megafon</option>
                        <option value='["https://www.instagram.com/beeline/","Beeline"]'>RU | Beeline</option>
                        <option value='["https://www.instagram.com/darwin/","Darwin"]'>Others | Darwin</option>
                        <option value='["https://www.instagram.com/enter/","Enter"]'>Others | Enter</option>
                        <option value='["https://www.instagram.com/maib/","MAIB"]'>Others | MAIB</option>
                    </select>
                    <input className={"update_operators_input"} type="number" name="nr"/>
                    <Button id="update_operators_btn" type="button" onClick={handleUpdateOperators}>Update</Button>
                    <div>{updateOperatorsFeedbackMessage}</div>
                </div>
                <div className={"update_operators_block"} id="update_operators_block_facebook"
                     style={{display: visibleUpdateBlock === 'facebook' ? 'flex' : 'none'}}>
                    {/* Facebook update block content */}
                </div>
                <div className={"update_operators_block"} id="update_operators_block_tiktok"
                     style={{display: visibleUpdateBlock === 'tiktok' ? 'flex' : 'none'}}>
                    {/* TikTok update block content */}
                </div>

            </Popup>


            {isEditPopupVisible && selectedItem && (
                <Popup id="edit_popup" title="Edit Item" isVisible={isEditPopupVisible} onClose={toggleEditPopup}>
                    <form>
                        <div className={"smm_popup_row"}>
                            <div className="smm_main_add_label">Operator:</div>
                            <select name="operator" value={formInputs.operator} onChange={handleInputChange}>
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
                            </select>
                        </div>
                        <div className={"smm_popup_row"}>
                            <div className="smm_main_add_label">Subject:</div>
                            <select name="subject" value={formInputs.subject} onChange={handleInputChange}>
                                <option value="">Select Subject</option>
                                <option value="Comercial">Comercial</option>
                                <option value="Event">Branding | Event</option>
                                <option value="PR">Branding | PR</option>
                                <option value="Promoted">Branding | Promoted</option>
                                <option value="Informativ">Informativ</option>
                                <option value="Interactiv">Interactiv</option>
                            </select>
                        </div>
                        <div className={"smm_popup_row"}>
                            <div className="smm_main_add_label">Type:</div>
                            <select name="type" value={formInputs.type} onChange={handleInputChange}>
                                <option value="">Select Type</option>
                                <option value="Carousel">Carousel</option>
                                <option value="Reel">Reel</option>
                                <option value="Video">Video</option>
                                <option value="Solo">Solo</option>
                                <option value="Animated">Animated</option>
                            </select>
                        </div>
                        <div className={"smm_popup_row"}>
                            <div className="smm_main_add_label">Sponsor:</div>
                            <label className="toggle-switch">
                                <input type="checkbox" name="sponsor" checked={formInputs.sponsor} onChange={handleCheckboxChange} />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div className={"smm_popup_row"}>
                            <div className="smm_main_add_label">Comment:</div>
                            <textarea name="comment" value={formInputs.comment} onChange={handleInputChange} rows={2} cols={50} className="textarea-comment" />
                        </div>
                        <div className={"smm_popup_row smm_popup_row_btns"}>
                            <Button id="smm_popup_edit_button" type="button" onClick={handleUpdate}>Update</Button>
                            <Button id="smm_popup_delete_button" type="button" style={{ borderColor: '#ffb4b4', color: '#ffb4b4' }} onClick={() => setIsConfirmPopupVisible(true)}>Delete</Button>
                        </div>
                    </form>
                </Popup>
            )}

            {isInfoPopupVisible && selectedItemInfo && (
                <Popup id="info_popup" title="Item Details" isVisible={isInfoPopupVisible} onClose={() => setIsInfoPopupVisible(false)}>
                    <div id="info_popup_inside">
                        <div id="info_popup_inside_left">
                            <div className={"smm_popup_row"}>
                                <div className="smm_main_add_label">Operator:</div>
                                <div>{selectedItemInfo.operator}</div>
                            </div>
                            <div className={"smm_popup_row"}>
                                <div className="smm_main_add_label">Subject:</div>
                                <div>{selectedItemInfo.subject}</div>
                            </div>
                            <div className={"smm_popup_row"}>
                                <div className="smm_main_add_label">Type:</div>
                                <div>{selectedItemInfo.type}</div>
                            </div>
                            <div className={"smm_popup_row"}>
                                <div className="smm_main_add_label">Sponsor:</div>
                                <div>{selectedItemInfo.sponsor ? "Yes" : "No"}</div>
                            </div>
                            <div className={"smm_popup_row"}>
                                <div className="smm_main_add_label">Date:</div>
                                <div>{selectedItemInfo.date}</div>
                            </div>
                            <div className={"smm_popup_row"}>
                                <div className="smm_main_add_label">Day:</div>
                                <div>{selectedItemInfo.day}</div>
                            </div>
                            <div className={"smm_popup_row"}>
                                <div className="smm_main_add_label">Likes:</div>
                                <div>{selectedItemInfo.likes}</div>
                            </div>
                            <div className={"smm_popup_row"}>
                                <div className="smm_main_add_label">Comments:</div>
                                <div>{selectedItemInfo.comments}</div>
                            </div>
                            <div className={"smm_popup_row"}>
                                <div className="smm_main_add_label">Shares:</div>
                                <div>{selectedItemInfo.shares}</div>
                            </div>
                            <div className={"smm_popup_row"}>
                                <div className="smm_main_add_label">Link:</div>
                                <a href={selectedItemInfo.link} target="_blank" rel="noopener noreferrer">{selectedItemInfo.link}</a>
                            </div>
                            <div className={"smm_popup_row"}>
                                <div className="smm_main_add_label">Comment:</div>
                                <div>{selectedItemInfo.comment}</div>
                            </div>
                        </div>
                        <img className="smm_popup_row_post" src={`http://127.0.0.1:5000/proxy_image?url=${encodeURIComponent(selectedItemInfo.img)}`} alt="post" />
                    </div>
                </Popup>
            )}

            {isUpdatePopupVisible && (
                <Popup id="update_popup" title="Updating Records" isVisible={isUpdatePopupVisible} onClose={() => { if (!isUpdating) setIsUpdatePopupVisible(false); }}>
                    <div>
                        <p>{updateStatusMessage}</p>
                        {isUpdating && <div className="loading-animation"></div>}
                        {isUpdateComplete && (
                            <Button className="smm_main_btn" onClick={() => setIsUpdatePopupVisible(false)}>Close</Button>
                        )}
                    </div>
                </Popup>
            )}

            {isConfirmPopupVisible && (
                <Popup id="confirm_delete_popup" title="Confirm Delete" isVisible={isConfirmPopupVisible} onClose={() => setIsConfirmPopupVisible(false)}>
                    <div>
                        <p>Are you sure you want to delete this item?</p>
                        <div className={"smm_popup_row"}>
                            <Button onClick={handleConfirmDelete} style={{ borderColor: '#ffb4b4', color: '#ffb4b4' }}>Yes</Button>
                            <Button onClick={() => setIsConfirmPopupVisible(false)}>No</Button>
                        </div>
                    </div>
                </Popup>
            )}
        </>
    );
}
