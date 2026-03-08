// src/pages/login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';

const API = import.meta.env.VITE_API_BASE || '/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned ${res.status}: ${text.substring(0, 100)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || `Login failed (${res.status})`);
      }

      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Login to WEChess</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            className="inp"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="inp"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="msg">{error}</div>}
          <button type="submit" className="btn">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
