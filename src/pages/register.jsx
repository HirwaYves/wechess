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
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
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
          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} />
          <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email (optional)" value={form.email} onChange={handleChange} />
          <input name="country" placeholder="Country" value={form.country} onChange={handleChange} />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
