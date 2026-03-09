// src/components/navbar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/WEchess logo with knight silhouette.png';
import './navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // All navigation items (full list)
  const allNavItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/tournaments', label: 'Tournaments' },
    { path: '/leaderboard', label: 'Leaderboard' },
    ...(!user ? [{ path: '/register', label: 'Register' }] : []),
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="WEChess" className="logo-img" />
        </NavLink>

        {/* Primary links – visible on mobile only */}
        <div className="primary-mobile-links">
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/tournaments"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={() => setMenuOpen(false)}
          >
            Tournaments
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={() => setMenuOpen(false)}
          >
            Leaderboard
          </NavLink>
        </div>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>

        {/* Full navigation menu (desktop always visible, mobile toggled) */}
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          {allNavItems.map(item => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}

          {user?.isAdmin && (
            <li className="nav-item">
              <NavLink
                to="/admin"
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </NavLink>
            </li>
          )}

          {/* Login/Logout */}
          <li className="nav-item nav-right">
            {!user ? (
              <NavLink
                to="/login"
                className={({ isActive }) => isActive ? 'nav-link btn-login active' : 'nav-link btn-login'}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </NavLink>
            ) : (
              <div className="nav-logged">
                <button className="nav-user" onClick={() => navigate('/profile')}>
                  {user.username}
                </button>
                <button className="nav-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
