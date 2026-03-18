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
      
      {/* User info card */}
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

      {/* Lichess Integration Section */}
      <div className="lichess-section">
        <h2>🎯 Lichess Integration</h2>
        <p className="lichess-description">
          To join tournaments that are hosted on Lichess, you need to link your Lichess account. 
          This allows us to automatically track your game results and update your ranking here on WEChess.
        </p>
        
        <div className="lichess-action">
          {!lichessUsername ? (
            <>
              <p className="warning">You haven't linked a Lichess account yet.</p>
              <div className="button-group">
                <a 
                  href="https://lichess.org/signup" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-lichess-signup"
                >
                  ➕ Create Lichess Account
                </a>
                <span className="or-text">or</span>
              </div>
            </>
          ) : (
            <p className="success">✅ Linked Lichess account: <strong>{lichessUsername}</strong></p>
          )}
          
          <form onSubmit={handleSubmit} className="lichess-form">
            <label>
              {lichessUsername ? 'Update' : 'Enter'} your Lichess username:
              <input
                type="text"
                value={lichessUsername}
                onChange={(e) => setLichessUsername(e.target.value)}
                placeholder="e.g., yourlichesusername"
              />
            </label>
            <button type="submit" disabled={updating} className="btn-save">
              {updating ? 'Saving...' : 'Save Lichess Username'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
