import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import AvatarEditor from 'react-avatar-editor';
import Button from '../components/Button';
import Navbar from "../components/Navbar.tsx";
import "../styles/profile.css";

const Profile: React.FC = () => {
    const { token, userInfo, setUserInfo } = useContext(AuthContext);
    const [profile, setProfile] = useState({ name: '', surname: '', avatar: '' });
    const [password, setPassword] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const editorRef = useRef<AvatarEditor | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const profileData = response.data;
                setProfile({
                    name: profileData.name || '',
                    surname: profileData.surname || '',
                    avatar: profileData.avatar || ''
                });
            } catch (error) {
                console.error('Error fetching profile data:', error);
                toast.error('Failed to fetch profile data');
            }
        };
        fetchProfile();
    }, [token]);

    useEffect(() => {
        if (image) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(image);
        } else {
            setPreview(null);
        }
    }, [image]);

    const handleSave = async () => {
        try {
            let avatar = profile.avatar;
            if (editorRef.current) {
                avatar = editorRef.current.getImageScaledToCanvas().toDataURL();
            }
            const updatedProfile = { ...profile, avatar, password: password || undefined };
            const response = await axios.put('http://localhost:5001/api/profile', updatedProfile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
            setUserInfo(response.data); // Update user info in context
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    return (
        <>
            <Navbar />
            <div className="profile_main">

                <div id="profile_main_title">Your Profile</div>
                <span className="profile_main_input_block"><div className={"profile_main_input_lable"}>Role:</div>
                <span style={{fontWeight: 600}}>{userInfo?.role}</span></span>
                <span className="profile_main_input_block"><div className={"profile_main_input_lable"}>Surname:</div>
                <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    placeholder="Name"
                />
                </span>
                <span className="profile_main_input_block"><div className={"profile_main_input_lable"}>Name:</div>
                <input
                    type="text"
                    value={profile.surname}
                    onChange={(e) => setProfile({...profile, surname: e.target.value})}
                    placeholder="Surname"
                />
                </span>
                <span className="profile_main_input_block"><div className={"profile_main_input_lable"}>Passowrd:</div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New Password"
                />
                    </span>
                <span style={{marginTop:'10px'}}>Change avatar/profile picture:</span>
                    {preview ? (
                        <AvatarEditor
                            ref={editorRef}
                            image={preview}
                            width={150}
                            height={150}
                            border={50}
                            scale={1.2}
                        />
                    ) : (
                        <div className="avatar-placeholder">No image selected</div>
                    )}
                    <input type="file" id="profile_main_input_file"
                           onChange={(e) => setImage(e.target.files?.[0] || null)}/>
                <Button onClick={handleSave}>Save</Button>
            </div>

        </>
);
};

export default Profile;
