import React, { useState, useEffect } from 'react';
import AdminButton from '../../components/admin/AdminButton';
import { useToast } from '../../components/admin/AdminToastContext';
import { api } from '../../services/api';
import './SubmitMatch.css';

const SubmitMatch = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [players, setPlayers] = useState([]);
  const [whiteId, setWhiteId] = useState('');
  const [blackId, setBlackId] = useState('');
  const [result, setResult] = useState('1-0');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    api.getTournaments()
      .then(setTournaments)
      .catch(err => addToast(err.message, 'error'));
  }, []);

  useEffect(() => {
    if (!selectedTournament) return;
    api.getParticipants(selectedTournament)
      .then(setPlayers)
      .catch(err => addToast(err.message, 'error'));
  }, [selectedTournament]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!whiteId || !blackId || whiteId === blackId) {
      addToast('Please select two different players', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.submitMatch({
        tournament_id: selectedTournament,
        white_player_id: whiteId,
        black_player_id: blackId,
        result
      });
      addToast('Match submitted and ratings updated', 'success');
      setWhiteId('');
      setBlackId('');
      setResult('1-0');
      const updated = await api.getParticipants(selectedTournament);
      setPlayers(updated);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format player display
  const formatPlayerName = (player) => {
    if (player.lichess_username && player.lichess_username !== player.username) {
      return `${player.lichess_username} (${player.username})`;
    }
    return player.username;
  };

  return (
    <div className="admin-submit-match">
      <h1>Submit Match Result</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tournament</label>
          <select value={selectedTournament} onChange={(e) => setSelectedTournament(e.target.value)} required>
            <option value="">Select tournament</option>
            {tournaments.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>

        {players.length > 0 && (
          <>
            <div className="form-group">
              <label>White Player</label>
              <select value={whiteId} onChange={(e) => setWhiteId(e.target.value)} required>
                <option value="">Select white</option>
                {players.map(p => (
                  <option key={p.player_id} value={p.player_id}>
                    {formatPlayerName(p)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Black Player</label>
              <select value={blackId} onChange={(e) => setBlackId(e.target.value)} required>
                <option value="">Select black</option>
                {players.map(p => (
                  <option key={p.player_id} value={p.player_id}>
                    {formatPlayerName(p)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Result</label>
              <select value={result} onChange={(e) => setResult(e.target.value)}>
                <option value="1-0">White wins (1-0)</option>
                <option value="0-1">Black wins (0-1)</option>
                <option value="1/2-1/2">Draw</option>
              </select>
            </div>
            <AdminButton type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Match'}
            </AdminButton>
          </>
        )}
      </form>
    </div>
  );
};

export default SubmitMatch;
