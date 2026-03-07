import React, { useState, useEffect } from 'react';
import AdminTable from '../../components/admin/AdminTable';
import { useToast } from '../../components/admin/AdminToastContext';
import { api } from '../../services/api';
import './ManageRegistrations.css';

const ManageRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingRegistrations();
      setRegistrations(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (reg) => {
    try {
      await api.confirmRegistration(reg.id);
      addToast('Registration confirmed', 'success');
      loadRegistrations();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleReject = async (reg) => {
    try {
      await api.rejectRegistration(reg.id);
      addToast('Registration rejected', 'success');
      loadRegistrations();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'tournament_id', label: 'Tournament ID' },
    { key: 'registered_at', label: 'Registered', render: (val) => new Date(val).toLocaleString() },
  ];

  const actions = [
    { label: 'Confirm', onClick: handleConfirm, variant: 'confirm' },
    { label: 'Reject', onClick: handleReject, variant: 'reject' },
  ];

  return (
    <div className="admin-manage-registrations">
      <h1>Pending Registrations</h1>
      {loading ? <div>Loading...</div> : (
        <AdminTable columns={columns} data={registrations} actions={actions} />
      )}
    </div>
  );
};

export default ManageRegistrations;