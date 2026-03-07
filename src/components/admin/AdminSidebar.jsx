// src/components/admin/AdminSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminSidebar.css';
import logo from '../../assets/WEchess logo with knight silhouette.png'; // two levels up

const AdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/seasons', label: 'Seasons', icon: '📅' }, // <-- add this line
  { path: '/admin/tournaments', label: 'Tournaments', icon: '🏆' },
  { path: '/admin/players', label: 'Players', icon: '👥' },
  { path: '/admin/registrations', label: 'Registrations', icon: '📝' },
  { path: '/admin/submit-match', label: 'Submit Match', icon: '⚔️' },
  { path: '/admin/create-tournament', label: 'Create Tournament', icon: '➕' },
];

  return (
    <>
      {isOpen && <div className="admin-sidebar-overlay" onClick={onClose}></div>}
      <aside className={`admin-sidebar ${isOpen ? 'admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-header">
          <img src={logo} alt="WEChess" className="admin-logo" />
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 'admin-nav-item ' + (isActive ? 'admin-nav-active' : '')}
              onClick={onClose}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-nav-item admin-logout-btn">
            <span className="admin-nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;