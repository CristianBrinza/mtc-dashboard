import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { loginUser } from '../services/api';
import "./../styles/loginform.css"
import Button from "./Button.tsx";


const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await loginUser({ username, password });
            login(response.data.token);
            console.log('Login successful', 'success');
        } catch (err) {
            console.log('Login failed. Please check your credentials.', 'error');
        }
    };

    return (
        <div className="login_main">
            <img src="images/general/logo.png" alt="Dashboard" id="login_img"/>
            <form onSubmit={handleSubmit} id="login_form">

                <input type="text" value={username} placeholder="username"
                       onChange={(e) => setUsername(e.target.value)}/>
                <input type="text" value={password} placeholder="password"
                       onChange={(e) => setPassword(e.target.value)}/>

                <Button type="submit" className={"login_form_submit"} >
                    Login
                </Button>


                <Button
                    onClick={() => navigate('/register')}
                >
                    Register
                </Button>

            </form>
        </div>

    );
};

export default LoginForm;
