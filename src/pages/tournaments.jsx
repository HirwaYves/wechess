import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/admin/AdminToastContext';
import './tournaments.css';

const API = import.meta.env.VITE_API_BASE || '/api';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [viewMode, setViewMode] = useState('score');
  const { user } = useAuth();
  const { addToast } = useToast();

  const isLoggedIn = user !== null || localStorage.getItem('token') !== null;

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch(`${API}/api/tournaments`);
        if (!res.ok) throw new Error('Failed to load tournaments');
        const data = await res.json();
        setTournaments(data);
        if (data.length > 0) setSelectedTournament(data[0].id);
      } catch (err) {
        addToast(err.message, 'error');
      } finally {
        setLoadingTournaments(false);
      }
    };
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (!selectedTournament) return;
    const fetchStandings = async () => {
      setLoadingStandings(true);
      try {
        const res = await fetch(`${API}/api/tournaments/${selectedTournament}/standings`);
        if (!res.ok) throw new Error('Failed to load standings');
        const data = await res.json();
        setStandings(data);
      } catch (err) {
        addToast(err.message, 'error');
        setStandings([]);
      } finally {
        setLoadingStandings(false);
      }
    };
    fetchStandings();
  }, [selectedTournament]);

  const handleRegister = async () => {
    if (!selectedTournament) return;
    const token = localStorage.getItem('token');
    if (!token) {
      addToast('Please log in to register', 'error');
      return;
    }
    setRegistering(true);
    try {
      const res = await fetch(`${API}/api/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tournamentId: selectedTournament }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      addToast('Registration submitted! Pending confirmation.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setRegistering(false);
    }
  };

  const sortedStandings = [...standings]
    .sort((a, b) => {
      if (viewMode === 'score') {
        if (b.score !== a.score) return b.score - a.score;
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.rating - a.rating;
      } else {
        return b.rating - a.rating;
      }
    })
    .map((player, index) => ({ ...player, rank: index + 1 }));

  return (
    <section className="tournaments-page">
      <div className="container">
        <h1 className="page-title">Tournaments & Standings</h1>

        {loadingTournaments ? (
          <div className="loading-indicator">Loading tournaments...</div>
        ) : tournaments.length === 0 ? (
          <div className="no-data">No tournaments available yet.</div>
        ) : (
          <>
            <div className="tournament-header">
              <div className="tournament-selector">
                <label htmlFor="tournament">Select Tournament:</label>
                <select
                  id="tournament"
                  value={selectedTournament || ''}
                  onChange={(e) => setSelectedTournament(Number(e.target.value))}
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
              {isLoggedIn && (
                <button
                  className="register-btn"
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering ? 'Registering...' : 'Register for this tournament'}
                </button>
              )}
            </div>

            <div className="view-toggle">
              <button
                className={viewMode === 'score' ? 'active' : ''}
                onClick={() => setViewMode('score')}
              >
                By Tournament Score
              </button>
              <button
                className={viewMode === 'rating' ? 'active' : ''}
                onClick={() => setViewMode('rating')}
              >
                By Current Rating
              </button>
            </div>

            {loadingStandings ? (
              <div className="loading-indicator">Loading standings...</div>
            ) : sortedStandings.length === 0 ? (
              <div className="no-data">No participants yet.</div>
            ) : (
              <div className="standings-table-wrapper">
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Username</th>
                      <th>Country</th>
                      <th>Rating</th>
                      <th>Score</th>
                      <th>Wins</th>
                      <th>Losses</th>
                      <th>Buchholz</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStandings.map((player) => (
                      <tr
                        key={player.player_id}
                        className={user?.id === player.player_id ? 'current-user-row' : ''}
                      >
                        <td>{player.rank}</td>
                        <td>{player.username}</td>
                        <td>{player.country || '—'}</td>
                        <td>{player.rating}</td>
                        <td>{player.score}</td>
                        <td>{player.wins}</td>
                        <td>{player.losses}</td>
                        <td>{player.buchholz}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Tournaments;
