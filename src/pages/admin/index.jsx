// src/pages/admin/index.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/admin/AdminToastContext';
// import './admin.css';

export default function AdminDashboard() {
  const [players, setPlayers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    Promise.all([
      api.getPlayers(),
      api.getPendingRegistrations()
    ]).then(([playersData, regsData]) => {
      setPlayers(playersData || []);
      setRegistrations(regsData || []);
    }).catch(err => {
      addToast(err.message, 'error');
    }).finally(() => setLoading(false));
  }, []);

  const confirmRegistration = async (regId) => {
    try {
      await api.confirmRegistration(regId);
      // Refresh data
      const regs = await api.getPendingRegistrations();
      setRegistrations(regs || []);
      const pls = await api.getPlayers();
      setPlayers(pls || []);
      addToast('Registration confirmed', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const rejectRegistration = async (regId) => {
    try {
      await api.rejectRegistration(regId);
      const regs = await api.getPendingRegistrations();
      setRegistrations(regs || []);
      addToast('Registration rejected', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <div className="container" style={{ padding: 20 }}>Loading admin…</div>;

  return (
    <div className="container admin-page">
      <h1>Admin Dashboard</h1>

      <section>
        <h2>Pending Registrations</h2>
        {registrations.length === 0 ? <p>No pending registrations.</p> : (
          <table className="admin-table">
            <thead><tr><th>#</th><th>Player</th><th>Tournament</th><th>When</th><th>Actions</th></tr></thead>
            <tbody>
              {registrations.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.username} — {r.first_name} {r.last_name}</td>
                  <td>{r.tournament_id}</td>
                  <td>{new Date(r.registered_at).toLocaleString()}</td>
                  <td>
                    <button onClick={() => confirmRegistration(r.id)}>Confirm</button>
                    <button onClick={() => rejectRegistration(r.id)} style={{ marginLeft: 8 }}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>All Players</h2>
        <table className="admin-table">
          <thead><tr><th>id</th><th>username</th><th>name</th><th>rating</th><th>country</th></tr></thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.username}</td>
                <td>{p.first_name} {p.last_name}</td>
                <td>{p.current_rating}</td>
                <td>{p.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
