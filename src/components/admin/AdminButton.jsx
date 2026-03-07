// src/components/admin/AdminButton.jsx
import React from 'react';
import './AdminButton.css';

const AdminButton = ({ children, variant = 'primary', onClick, type = 'button', disabled, ...props }) => {
  return (
    <button
      className={`admin-btn admin-btn-${variant}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default AdminButton;