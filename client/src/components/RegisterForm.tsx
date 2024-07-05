import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { registerUser, loginUser } from '../services/api';
import LoginForm from "./LoginForm.tsx";



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
            console.log('Registration successful', 'success');
        } catch (err) {
            console.log('Registration failed. Please try again.', 'error');
        }
    };

    return (

        <form onSubmit={handleSubmit}>


            <input type="text" value={username}
                   onChange={(e) => setUsername(e.target.value)}/>
            <input type="text" value={password}
                   onChange={(e) => setPassword(e.target.value)} />
            <input type="text" value={role}
                   onChange={(e) => setRole(e.target.value)}/>

            <button type="submit">
                Register
            </button>


            <button

                onClick={() => navigate('/login')}
            >
                Login
            </button>

        </form>

    );
};
export default RegisterForm;
