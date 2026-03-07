// src/components/admin/AdminToast.jsx
import React, { useEffect } from 'react';
import './AdminToast.css';

const AdminToast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`admin-toast admin-toast-${type}`}>
      <span>{message}</span>
      <button className="admin-toast-close" onClick={onClose}>×</button>
    </div>
  );
};

export default AdminToast;