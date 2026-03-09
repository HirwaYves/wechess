// src/components/navbar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaTrophy, FaChartLine, FaInfoCircle, FaEnvelope, FaUser, FaSignInAlt, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../assets/WEchess logo with knight silhouette.png';
import './navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const allNavItems = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/about', label: 'About', icon: <FaInfoCircle /> },
    { path: '/tournaments', label: 'Tournaments', icon: <FaTrophy /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <FaChartLine /> },
    ...(!user ? [{ path: '/register', label: 'Register', icon: <FaUser /> }] : []),
    { path: '/contact', label: 'Contact', icon: <FaEnvelope /> },
  ];

  // Primary text links for mobile (visible outside hamburger)
  const primaryMobileTextLinks = [
    { path: '/', label: 'Home' },
    { path: '/tournaments', label: 'Tournaments' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="WEChess" className="logo-img" />
        </NavLink>

        {/* Desktop Navigation (full text) */}
        <ul className="nav-menu-desktop">
          {allNavItems.map(item => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
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
              >
                Admin
              </NavLink>
            </li>
          )}
          <li className="nav-item nav-right">
            {!user ? (
              <NavLink
                to="/login"
                className={({ isActive }) => isActive ? 'nav-link btn-login active' : 'nav-link btn-login'}
              >
                Login
              </NavLink>
            ) : (
              <div className="nav-logged">
                <button className="nav-user" onClick={() => navigate('/profile')}>
                  <FaUser /> {user.username}
                </button>
                <button className="nav-logout" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </li>
        </ul>

        {/* Mobile Navigation */}
        <div className="nav-mobile">
          {/* Primary text links */}
          <div className="mobile-primary-links">
            {primaryMobileTextLinks.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 'mobile-text-link' + (isActive ? ' active' : '')}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Hamburger button */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Mobile drawer (unchanged) */}
          <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
            <ul className="mobile-menu">
              {allNavItems.map(item => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 'mobile-link' + (isActive ? ' active' : '')}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="mobile-link-icon">{item.icon}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
              {user?.isAdmin && (
                <li>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => 'mobile-link' + (isActive ? ' active' : '')}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="mobile-link-icon"><FaUser /></span>
                    Admin
                  </NavLink>
                </li>
              )}
              <li className="mobile-divider"></li>
              {!user ? (
                <li>
                  <NavLink
                    to="/login"
                    className="mobile-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="mobile-link-icon"><FaSignInAlt /></span>
                    Login
                  </NavLink>
                </li>
              ) : (
                <>
                  <li>
                    <NavLink
                      to="/profile"
                      className="mobile-link"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="mobile-link-icon"><FaUser /></span>
                      Profile ({user.username})
                    </NavLink>
                  </li>
                  <li>
                    <button className="mobile-logout" onClick={handleLogout}>
                      <span className="mobile-link-icon"><FaSignOutAlt /></span>
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
