// src/components/admin/AdminDateTimePicker.jsx
import React from 'react';
import './AdminFormInput.css'; // reuse same styles

const AdminDateTimePicker = ({ label, id, name, value, onChange, error, required }) => {
  return (
    <div className="admin-form-group">
      {label && <label htmlFor={id} className="admin-label">{label}{required && <span className="admin-required">*</span>}</label>}
      <input
        type="datetime-local"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`admin-input ${error ? 'admin-input-error' : ''}`}
        required={required}
      />
      {error && <span className="admin-error">{error}</span>}
    </div>
  );
};

export default AdminDateTimePicker;