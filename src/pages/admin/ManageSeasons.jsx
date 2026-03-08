import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTable from '../../components/admin/AdminTable';
import AdminButton from '../../components/admin/AdminButton';
import AdminModal from '../../components/admin/AdminModal';
import AdminFormInput from '../../components/admin/AdminFormInput';
import { useToast } from '../../components/admin/AdminToastContext';
import './ManageSeasons.css';

const BASE = import.meta.env.VITE_API_BASE || '';
const API = BASE ? `${BASE}/api` : '/api';

const ManageSeasons = () => {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '' });
  const [formErrors, setFormErrors] = useState({});
  const { addToast } = useToast();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/seasons`, { headers });
      if (!res.ok) throw new Error('Failed to load seasons');
      const data = await res.json();
      setSeasons(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast(err.message, 'error');
      setSeasons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name required';
    if (!form.start_date) errors.start_date = 'Start date required';
    if (!form.end_date) errors.end_date = 'End date required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      const url = editingSeason ? `${API}/seasons/${editingSeason.id}` : `${API}/seasons`;
      const method = editingSeason ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Failed to save season');
      addToast(editingSeason ? 'Season updated' : 'Season created', 'success');
      setModalOpen(false);
      setEditingSeason(null);
      setForm({ name: '', start_date: '', end_date: '' });
      fetchSeasons();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this season? It may affect tournaments.')) return;
    try {
      const res = await fetch(`${API}/seasons/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete');
      addToast('Season deleted', 'success');
      fetchSeasons();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openCreateModal = () => {
    setEditingSeason(null);
    setForm({ name: '', start_date: '', end_date: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (season) => {
    setEditingSeason(season);
    setForm({ name: season.name, start_date: season.start_date, end_date: season.end_date });
    setFormErrors({});
    setModalOpen(true);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
  ];

  const actions = [
    { label: 'Edit', onClick: (row) => openEditModal(row), variant: 'secondary' },
    { label: 'Delete', onClick: (row) => handleDelete(row.id), variant: 'danger' },
  ];

  return (
    <div className="admin-manage-seasons">
      <div className="admin-header">
        <h1>Seasons</h1>
        <AdminButton onClick={openCreateModal}>+ New Season</AdminButton>
      </div>
      {loading ? <div>Loading...</div> : (
        <AdminTable columns={columns} data={seasons} actions={actions} />
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingSeason ? 'Edit Season' : 'Create Season'}>
        <form onSubmit={handleSubmit}>
          <AdminFormInput
            label="Name"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            error={formErrors.name}
            required
          />
          <AdminFormInput
            label="Start Date"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={handleInputChange}
            error={formErrors.start_date}
            required
          />
          <AdminFormInput
            label="End Date"
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={handleInputChange}
            error={formErrors.end_date}
            required
          />
          <div className="admin-form-actions">
            <AdminButton type="submit">{editingSeason ? 'Update' : 'Create'}</AdminButton>
            <AdminButton variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default ManageSeasons;
