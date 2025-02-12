// frontend/src/components/Login.tsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      navigate('/smm', { replace: true }); // 🔹 Prevents navigating back to login
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };


  return (
      <div>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
  );
};

export default Login;
