// src/components/admin/AdminModal.jsx
import React, { useEffect } from 'react';
import './AdminModal.css';
import AdminButton from './AdminButton';

const AdminModal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button className="admin-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="admin-modal-content">
          {children}
        </div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default AdminModal;