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
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (form.email !== form.confirmEmail) {
      setError('Email addresses do not match');
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
      // Remove confirmEmail before sending to API
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
        <form onSubmit={handleSubmit}>
          <input 
            name="username" 
            placeholder="Username *" 
            value={form.username} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password *" 
            value={form.password} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="firstName" 
            placeholder="First Name *" 
            value={form.firstName} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="lastName" 
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
            placeholder="Country *" 
            value={form.country} 
            onChange={handleChange} 
            required 
          />
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
