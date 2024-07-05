import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import { registerUser, loginUser } from '../services/api';

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
        <form onSubmit={handleSubmit}>
            <input type="text" value={username}
                   onChange={(e) => setUsername(e.target.value)} placeholder="username"/>
            <input type="password" value={password}
                   onChange={(e) => setPassword(e.target.value)} placeholder="password"/>
            <input type="text" value={role}
                   onChange={(e) => setRole(e.target.value)} placeholder="role"/>
            <button type="submit">Register</button>
            <button onClick={() => navigate('/login')}>Login</button>
        </form>
    );
};

export default RegisterForm;
