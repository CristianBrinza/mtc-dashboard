import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import { registerUser, loginUser } from '../services/api';
import "../styles/registerform.css";
import Button from "./Button.tsx";

const RegisterForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerUser({ username, password, role });
            const response = await loginUser({ username, password });
            login(response.data.token);
            toast.success('Registration successful');
            navigate('/');
        } catch (err) {
            toast.error('Registration failed. Please try again.');
        }
    };

    return (
        <div className="register_main">
            <form onSubmit={handleSubmit} id="register_form">
                <input type="text" value={username}
                       onChange={(e) => setUsername(e.target.value)} placeholder="username"/>
                <input type="password" value={password}
                       onChange={(e) => setPassword(e.target.value)} placeholder="password"/>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="">Select role</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SMM">SMM</option>
                    <option value="DIRECTOR">DIRECTOR</option>
                    <option value="SEF">SEF</option>
                    <option value="WEB_DEVELOPER">WEB_DEVELOPER</option>
                    <option value="DEFAULT">DEFAULT</option>
                    <option value="VIEWER">VIEWER</option>
                </select>
                <Button className={"register_form_submit"} type="submit">Register</Button>
                <Button onClick={() => navigate('/login')}>Login</Button>
            </form>
        </div>
    );
};

export default RegisterForm;
