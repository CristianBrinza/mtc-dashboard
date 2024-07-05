import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import { loginUser } from '../services/api';
import './../styles/loginform.css';
import Button from './Button.tsx';

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted');  // Debug statement
        try {
            console.log('Attempting to log in...');
            const response = await loginUser({ username, password });
            console.log('Login response:', response);
            if (response && response.data && response.data.token) {
                login(response.data.token);
                toast.success('Login successful');
                navigate('/');
            } else {
                console.error('Login failed: No token in response');
                toast.error('Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            toast.error('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="login_main">
            <img
                src="images/general/logo.png"
                alt="Dashboard"
                id="login_img"
                onClick={() => navigate('/')} // Corrected onClick
            />
            <form onSubmit={handleSubmit} id="login_form">
                <input
                    type="text"
                    value={username}
                    placeholder="username"
                    autoComplete="username"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    value={password}
                    placeholder="password"
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" className={"login_form_submit"}>
                    Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                    Register
                </Button>
            </form>
        </div>
    );
};

export default LoginForm;
