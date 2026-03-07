// src/components/admin/AdminFormInput.jsx
import React from 'react';
import './AdminFormInput.css';

const AdminFormInput = ({ label, type = 'text', id, name, value, onChange, error, required, ...props }) => {
  return (
    <div className="admin-form-group">
      {label && <label htmlFor={id} className="admin-label">{label}{required && <span className="admin-required">*</span>}</label>}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`admin-input ${error ? 'admin-input-error' : ''}`}
        required={required}
        {...props}
      />
      {error && <span className="admin-error">{error}</span>}
    </div>
  );
};

export default AdminFormInput;