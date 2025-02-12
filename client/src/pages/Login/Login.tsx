// frontend/src/components/Login.tsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from "./Login.module.css"
import Button from "../../components/Button.tsx";
import Icon from "../../components/Icon.tsx";

const Login = () => {
  const { login } = useContext(AuthContext)!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/retele-sociale', { replace: true }); // 🔹 Prevents navigating back to login
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };


  return (
      <div className={styles.login}>
        <div className={styles.login_inside}>


        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>

            <input
                type="email"
                value={email}
                placeholder="email"
                onChange={e => setEmail(e.target.value)}
                required
            />
          </div>
          <div>
            <input
                type="password"
                value={password}
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
            />
          </div>
          <Button type="submit">Login
            <Icon type="arrow_right" />
          </Button>

        </form>
        </div>
      </div>
  );
};

export default Login;
