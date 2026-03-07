// src/components/admin/AdminHeader.jsx
import React, { useState } from 'react';
import './AdminHeader.css';

const AdminHeader = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const username = localStorage.getItem('username') || 'Admin';

  return (
    <header className="admin-header">
      <button className="admin-menu-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <div className="admin-header-search">
        <input type="text" placeholder="Search..." />
      </div>
      <div className="admin-header-user">
        <button className="admin-user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <span className="admin-user-avatar">👤</span>
          <span className="admin-user-name">{username}</span>
        </button>
        {dropdownOpen && (
          <div className="admin-user-dropdown">
            <a href="/profile">Profile</a>
            <a href="/settings">Settings</a>
            <hr />
            <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;