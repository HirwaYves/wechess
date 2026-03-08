import React, { useState, useEffect } from 'react';
import AdminTable from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';
import { useToast } from '../../components/admin/AdminToastContext';
import { api } from '../../services/api';
import './ManagePlayers.css';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const ManagePlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await api.getPlayers();
      setPlayers(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (player) => {
    try {
      await api.togglePlayerStatus(player.id);
      addToast(`Player ${player.username} ${player.is_active ? 'disabled' : 'enabled'}`, 'success');
      loadPlayers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const resetPassword = async (player) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/admin/reset-password/${player.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      addToast(`New password for ${player.username}: ${data.tempPassword}`, 'success', 10000); // show longer
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'country', label: 'Country' },
    { key: 'current_rating', label: 'Rating' },
    { key: 'is_active', label: 'Active', render: (val) => val ? '✅' : '❌' },
  ];

  const actions = [
    { label: 'View', onClick: (row) => { setSelectedPlayer(row); setModalOpen(true); }, variant: 'view' },
    { label: (row) => row.is_active ? 'Disable' : 'Enable', onClick: toggleStatus, variant: (row) => row.is_active ? 'reject' : 'confirm' },
    { label: 'Reset Password', onClick: resetPassword, variant: 'secondary' },
  ];

  return (
    <div className="admin-manage-players">
      <h1>Manage Players</h1>
      {loading ? <div>Loading...</div> : (
        <AdminTable columns={columns} data={players} actions={actions} />
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Player Details">
        {selectedPlayer && (
          <div>
            <p><strong>ID:</strong> {selectedPlayer.id}</p>
            <p><strong>Username:</strong> {selectedPlayer.username}</p>
            <p><strong>Name:</strong> {selectedPlayer.first_name} {selectedPlayer.last_name}</p>
            <p><strong>Email:</strong> {selectedPlayer.email}</p>
            <p><strong>Country:</strong> {selectedPlayer.country}</p>
            <p><strong>Rating:</strong> {selectedPlayer.current_rating}</p>
            <p><strong>Status:</strong> {selectedPlayer.is_active ? 'Active' : 'Inactive'}</p>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default ManagePlayers;
