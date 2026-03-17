import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/admin/AdminToastContext';
import './profile.css';

const API = import.meta.env.VITE_API_BASE || '/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [lichessUsername, setLichessUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUser(data);
        setLichessUsername(data.lichess_username || '');
      } catch (err) {
        console.error(err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lichessUsername }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }
      const updatedUser = await res.json();
      setUser(updatedUser);
      addToast('Lichess username updated successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <div className="container">Please log in.</div>;

  return (
    <div className="profile-page container">
      <h1>My Profile</h1>
      <div className="profile-card">
        <div className="profile-avatar">
          {user.first_name?.[0]}{user.last_name?.[0]}
        </div>
        <div className="profile-info">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Country:</strong> {user.country}</p>
          <p><strong>Rating:</strong> {user.current_rating}</p>
          <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="profile-edit-card">
        <h2>Link Lichess Account</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Lichess Username:
            <input
              type="text"
              value={lichessUsername}
              onChange={(e) => setLichessUsername(e.target.value)}
              placeholder="Your Lichess username"
            />
          </label>
          <button type="submit" disabled={updating}>
            {updating ? 'Saving...' : 'Save'}
          </button>
        </form>
        <p className="info">
          You must link your Lichess account before joining tournaments. 
          This allows us to track your results automatically.
        </p>
      </div>
    </div>
  );
};

export default Profile;
