import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/admin/AdminToastContext';
import { useNavigate } from 'react-router-dom';
import './tournaments.css';

const API = import.meta.env.VITE_API_BASE || '/api';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [viewMode, setViewMode] = useState('score');
  const [userLichess, setUserLichess] = useState(null);
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isLoggedIn = user !== null || localStorage.getItem('token') !== null;

  // Fetch user's Lichess username when logged in
  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem('token');
      fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUserLichess(data.lichess_username || null))
        .catch(() => setUserLichess(null));
    } else {
      setUserLichess(null);
    }
  }, [isLoggedIn]);

  // Fetch seasons and tournaments
  useEffect(() => {
    const fetchSeasonsAndTournaments = async () => {
      try {
        const [seasonsRes, tournamentsRes] = await Promise.all([
          fetch(`${API}/api/seasons`),
          fetch(`${API}/api/tournaments`)
        ]);
        if (!seasonsRes.ok || !tournamentsRes.ok) throw new Error('Failed to load data');
        const seasonsData = await seasonsRes.json();
        const tournamentsData = await tournamentsRes.json();
        setSeasons(seasonsData);
        setTournaments(tournamentsData);
      } catch (err) {
        addToast(err.message, 'error');
      } finally {
        setLoadingTournaments(false);
      }
    };
    fetchSeasonsAndTournaments();
  }, []);

  // Filter tournaments by selected season
  const filteredTournaments = selectedSeason
    ? tournaments.filter(t => t.season_id === parseInt(selectedSeason))
    : tournaments;

  // When season changes, select first tournament in that season if any
  useEffect(() => {
    if (filteredTournaments.length > 0) {
      setSelectedTournament(filteredTournaments[0].id);
    } else {
      setSelectedTournament(null);
    }
  }, [selectedSeason, filteredTournaments]);

  // Fetch standings when selected tournament changes
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

  // Get tournament details to check requirement
  const tournament = tournaments.find(t => t.id === selectedTournament);
  
  // If tournament requires Lichess, verify user has it
  if (tournament?.require_lichess) {
    if (!userLichess) {
      addToast('This tournament requires a linked Lichess account. Please add it in your profile first.', 'error');
      navigate('/profile');
      return;
    }
    
    const confirmMessage = `Your Lichess username is "${userLichess}". Is this correct?`;
    if (!window.confirm(confirmMessage)) return;
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

  // Get selected tournament details for join link
  const selectedTournamentData = tournaments.find(t => t.id === selectedTournament);

  return (
    <section className="tournaments-page">
      <div className="container">
        <h1 className="page-title">Tournaments & Standings</h1>

        {loadingTournaments ? (
          <div className="loading-indicator">Loading tournaments...</div>
        ) : (
          <>
            {/* Season selector */}
            <div className="season-selector">
              <label htmlFor="season">Select Season:</label>
              <select
                id="season"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
              >
                <option value="">All Seasons</option>
                {seasons.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {filteredTournaments.length === 0 ? (
              <div className="no-data">No tournaments in this season.</div>
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
                      {filteredTournaments.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({new Date(t.date).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  {isLoggedIn && (
                    <>
                      {userLichess ? (
                        <button
                          className="register-btn"
                          onClick={handleRegister}
                          disabled={registering}
                        >
                          {registering ? 'Registering...' : 'Register for this tournament'}
                        </button>
                      ) : (
                        <div className="lichess-warning">
                          <p>You need to <a href="/profile">link your Lichess account</a> first.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Join Link (if available) */}
                {selectedTournamentData?.join_url && (
                  <div className="join-link-container">
                    <p>
                      <strong>Join the arena:</strong>{' '}
                      <a href={selectedTournamentData.join_url} target="_blank" rel="noopener noreferrer">
                        {selectedTournamentData.join_url}
                      </a>
                    </p>
                  </div>
                )}

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
          </>
        )}
      </div>
    </section>
  );
};

export default Tournaments;
