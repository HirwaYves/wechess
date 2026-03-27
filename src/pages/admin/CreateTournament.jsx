import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminFormInput from '../../components/admin/AdminFormInput';
import AdminDateTimePicker from '../../components/admin/AdminDateTimePicker';
import AdminButton from '../../components/admin/AdminButton';
import { useToast } from '../../components/admin/AdminToastContext';
import { api } from '../../services/api';
import './CreateTournament.css';

const BASE = import.meta.env.VITE_API_BASE || '';
const API = BASE ? `${BASE}/api` : '/api';

const CreateTournament = () => {
  const [form, setForm] = useState({
    title: '',
    date: '',
    platform: '',
    timeControl: '',
    maxPlayers: '',
    entryFee: '',
    season: '',
    joinUrl: '',
    requireLichess: false,
    autoConfirm: false  // new field
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await fetch(`${API}/seasons`, { headers });
        if (!res.ok) throw new Error('Failed to load seasons');
        const data = await res.json();
        setSeasons(Array.isArray(data) ? data : []);
      } catch (err) {
        addToast(err.message, 'error');
        setSeasons([]);
      }
    };
    fetchSeasons();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title required';
    if (!form.date) newErrors.date = 'Date required';
    if (!form.platform.trim()) newErrors.platform = 'Platform required';
    if (!form.timeControl.trim()) newErrors.timeControl = 'Time control required';
    if (!form.maxPlayers || isNaN(form.maxPlayers) || form.maxPlayers < 1) newErrors.maxPlayers = 'Must be a positive number';
    if (!form.season) newErrors.season = 'Season required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Please fix form errors', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.createTournament(form);
      addToast('Tournament created successfully', 'success');
      navigate('/admin/tournaments');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-tournament">
      <h1>Create Tournament</h1>
      <form onSubmit={handleSubmit} className="admin-create-form">
        <AdminFormInput
          label="Title"
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          required
        />
        <AdminDateTimePicker
          label="Date & Time"
          id="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          error={errors.date}
          required
        />
        <AdminFormInput
          label="Platform"
          id="platform"
          name="platform"
          value={form.platform}
          onChange={handleChange}
          error={errors.platform}
          required
        />
        <AdminFormInput
          label="Time Control"
          id="timeControl"
          name="timeControl"
          value={form.timeControl}
          onChange={handleChange}
          error={errors.timeControl}
          required
        />
        <AdminFormInput
          label="Max Players"
          id="maxPlayers"
          name="maxPlayers"
          type="number"
          value={form.maxPlayers}
          onChange={handleChange}
          error={errors.maxPlayers}
          required
        />
        <AdminFormInput
          label="Entry Fee"
          id="entryFee"
          name="entryFee"
          value={form.entryFee}
          onChange={handleChange}
        />
        <div className="admin-form-group">
          <label htmlFor="season" className="admin-label">Season *</label>
          <select
            id="season"
            name="season"
            value={form.season}
            onChange={handleChange}
            className={`admin-input ${errors.season ? 'admin-input-error' : ''}`}
            required
          >
            <option value="">Select a season</option>
            {seasons.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.season && <span className="admin-error">{errors.season}</span>}
        </div>

        {/* Join URL (optional) */}
        <AdminFormInput
          label="Join URL (optional)"
          id="joinUrl"
          name="joinUrl"
          value={form.joinUrl}
          onChange={handleChange}
          placeholder="https://lichess.org/tournament/..."
        />

        {/* Require Lichess checkbox */}
        <div className="admin-form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="requireLichess"
              checked={form.requireLichess}
              onChange={handleChange}
            />
            <span>Require players to have a linked Lichess account</span>
          </label>
          <p className="checkbox-hint">
            If checked, players must have a Lichess username in their profile before registering.
          </p>
        </div>

        {/* Auto-confirm checkbox */}
        <div className="admin-form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="autoConfirm"
              checked={form.autoConfirm}
              onChange={handleChange}
            />
            <span>Auto‑confirm registrations (players join immediately)</span>
          </label>
          <p className="checkbox-hint">
            If checked, players can register and join the tournament without admin approval.
          </p>
        </div>

        <div className="admin-form-actions">
          <AdminButton type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Tournament'}
          </AdminButton>
          <AdminButton variant="secondary" type="button" onClick={() => navigate('/admin/tournaments')}>
            Cancel
          </AdminButton>
        </div>
      </form>
    </div>
  );
};

export default CreateTournament;
