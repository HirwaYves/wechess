import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/admin/AdminToastContext';
import './register.css';

const API = import.meta.env.VITE_API_BASE || '/api';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    country: '',
    lichessUsername: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateForm = () => {
    const requiredFields = ['username', 'password', 'firstName', 'lastName', 'email', 'confirmEmail', 'country'];
    for (const field of requiredFields) {
      if (!form[field].trim()) {
        setError(`All fields are required. Please fill in ${field}.`);
        return false;
      }
    }

    if (form.username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return false;
    }

    if (form.email !== form.confirmEmail) {
      setError('Email addresses do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (form.password.length < 3) {
      setError('Password must be at least 3 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmEmail, ...submitForm } = form;
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      addToast('Registration successful! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Join WEChess</h2>
        <form onSubmit={handleSubmit} noValidate>
          <input 
            name="username" 
            type="text"
            placeholder="Username * (min 3 chars)" 
            value={form.username} 
            onChange={handleChange} 
            required 
            minLength="3"
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password *" 
            value={form.password} 
            onChange={handleChange} 
            required 
            minLength="3"
          />
          <input 
            name="firstName" 
            type="text"
            placeholder="First Name *" 
            value={form.firstName} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="lastName" 
            type="text"
            placeholder="Last Name *" 
            value={form.lastName} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="email" 
            type="email" 
            placeholder="Email *" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="confirmEmail" 
            type="email" 
            placeholder="Confirm Email *" 
            value={form.confirmEmail} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="country" 
            type="text"
            placeholder="Country *" 
            value={form.country} 
            onChange={handleChange} 
            required 
          />
          {/* Lichess username field with signup hint */}
          <input 
            name="lichessUsername" 
            type="text"
            placeholder="Lichess Username (optional – for tournament tracking)" 
            value={form.lichessUsername} 
            onChange={handleChange} 
          />
          <p className="lichess-hint">
            Don't have a Lichess account?{' '}
            <a href="https://lichess.org/signup" target="_blank" rel="noopener noreferrer">
              Create one here
            </a>
          </p>

          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
