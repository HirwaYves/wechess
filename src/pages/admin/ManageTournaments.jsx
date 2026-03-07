import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTable from '../../components/admin/AdminTable';
import AdminButton from '../../components/admin/AdminButton';
import AdminModal from '../../components/admin/AdminModal';
import { useToast } from '../../components/admin/AdminToastContext';
import { api } from '../../services/api';
import './ManageTournaments.css';

const ManageTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const data = await api.getTournaments();
      setTournaments(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    try {
      await api.deleteTournament(id);
      addToast('Tournament deleted', 'success');
      loadTournaments();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRowClick = async (tournament) => {
    try {
      const parts = await api.getParticipants(tournament.id);
      setParticipants(parts);
      setSelectedTournament(tournament);
      setModalOpen(true);
    } catch (err) {
      addToast('Failed to load participants', 'error');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'platform', label: 'Platform' },
    { key: 'time_control', label: 'Time Control' },
    { key: 'max_players', label: 'Max Players' },
    { key: 'entry_type', label: 'Entry' },
  ];

  const actions = [
    { label: 'Edit', onClick: (row) => navigate(`/admin/edit-tournament/${row.id}`), variant: 'secondary' },
    { label: 'Delete', onClick: (row) => handleDelete(row.id), variant: 'danger' },
  ];

  return (
    <div className="admin-manage-tournaments">
      <div className="admin-header">
        <h1>Manage Tournaments</h1>
        <AdminButton onClick={() => navigate('/admin/create-tournament')}>+ New Tournament</AdminButton>
      </div>
      {loading ? <div>Loading...</div> : (
        <AdminTable columns={columns} data={tournaments} actions={actions} onRowClick={handleRowClick} />
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Participants: ${selectedTournament?.title}`}>
        {participants.length === 0 ? <p>No participants yet.</p> : (
          <table className="admin-modal-table">
            <thead><tr><th>Player</th><th>Username</th><th>Rating</th><th>Score</th><th>Wins</th><th>Losses</th></tr></thead>
            <tbody>
              {participants.map(p => (
                <tr key={p.player_id}>
                  <td>{p.full_name}</td>
                  <td>{p.username}</td>
                  <td>{p.rating}</td>
                  <td>{p.score}</td>
                  <td>{p.wins}</td>
                  <td>{p.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminModal>
    </div>
  );
};

export default ManageTournaments;