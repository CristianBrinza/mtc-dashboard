import React, { useState, useContext, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/Button.tsx";
import Menu from "../../components/Menu/Menu.tsx";
import styles from "./ProfileEdit.module.css";
import Input from "../../components/input/Input.tsx";

const ProfileEdit: React.FC = () => {
    const { user } = useContext(AuthContext)!;

    const [profileData, setProfileData] = useState({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        profilePicture: "",
        profileFile: null as File | null,
    });
    const [profileMessage, setProfileMessage] = useState("");
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordMessage, setPasswordMessage] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || "",
                email: user.email || "",
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                profilePicture: user.profilePicture || "",
                profileFile: null,
            });
        }
    }, [user]);

    const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;
        if (name === "profilePicture" && files) {
            setProfileData(prev => ({ ...prev, profileFile: files[0] }));
        } else {
            setProfileData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleProfileSave = async () => {
        const formData = new FormData();
        formData.append("email", profileData.email);
        formData.append("firstName", profileData.firstName);
        formData.append("lastName", profileData.lastName);
        if (profileData.profileFile) {
            formData.append("profilePicture", profileData.profileFile);
        }

        try {
            await axios.put(
                `${import.meta.env.VITE_BACKEND}/api/auth/update`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );
            setProfileMessage("Profile updated successfully.");
        } catch (error: any) {
            setProfileMessage(error.response?.data?.message || "Error updating profile.");
        }
    };

    const handlePasswordSave = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage("New password and confirm password do not match.");
            return;
        }
        try {
            await axios.put(
                `${import.meta.env.VITE_BACKEND}/api/auth/update`,
                { password: passwordData.newPassword },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    withCredentials: true,
                }
            );
            setPasswordMessage("Password updated successfully.");
        } catch (error: any) {
            setPasswordMessage(error.response?.data?.message || "Error updating password.");
        }
    };


    return (
        <>
            <Menu/>

        <div className={styles.edit_profile}>

            <h2>Edit Profile</h2>
            {profileMessage && <p>{profileMessage}</p>}


            <div className={styles.edit_profile_passwords}>
                <Input placeholder="Username" type="text" name="username" value={profileData.username} readOnly  maxWidth="180px"
                       disabled/>
                <Input placeholder="Email" type="email" name="email" value={profileData.email} icon="email" maxWidth="280px" minWidth="280px"
                       onChange={handleProfileChange}/>
            </div>
            <div className={styles.edit_profile_passwords}>
                <Input placeholder="First Name" type="text" name="firstName" value={profileData.firstName} maxWidth="230px" minWidth="230px"
                       onChange={handleProfileChange}/>
                <Input placeholder="Last Name" type="text" name="lastName" value={profileData.lastName} maxWidth="230px" minWidth="230px"
                       onChange={handleProfileChange}/>
            </div>
            <div className={styles.edit_profile_passwords}>
                {profileData.profilePicture ? (
                    <img src={`${import.meta.env.VITE_BACKEND}${profileData.profilePicture}`} alt="Profile"
                         className={styles.profile_picture}/>
                ) : (
                    <div className={styles.edit_profile_empty_picture}></div>
                )}
                <input type="file" name="profilePicture" onChange={handleProfileChange} accept="image/*"/>
            </div>

            <Button onClick={handleProfileSave}>Save Profile</Button>

            <hr style={{margin: "20px 0"}}/>

            <h3>Change Password</h3>
            {passwordMessage && <p>{passwordMessage}</p>}
            <div className={styles.edit_profile_passwords}>
                <Input
                    maxWidth="240px" minWidth="240px"
                    placeholder="Current Password"
                    type={showPasswords ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                />
                <Input
                    maxWidth="280px" minWidth="280px"
                    placeholder="New Password"
                    type={showPasswords ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                />
                <Input
                    maxWidth="280px" minWidth="280px"
                    placeholder="Confirm New Password"
                    type={showPasswords ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                />
            </div>

            <div className={styles.edit_profile_passwords}>
                <Button onClick={handlePasswordSave}>Save Password</Button>
                <Button onClick={() => setShowPasswords(!showPasswords)}>
                    {showPasswords ? "Hide Passwords" : "Show Passwords"}
                </Button>
            </div>
        </div>
        </>
    );
};

export default ProfileEdit;
