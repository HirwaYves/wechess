import { useState, useEffect } from 'react';
import './leaderboard.css';

const API = import.meta.env.VITE_API_BASE || '/api';

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API}/leaderboard`);
        if (!res.ok) throw new Error('Failed to load leaderboard');
        const data = await res.json();
        setPlayers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <section className="leaderboard-page">
      <div className="container">
        <h1 className="page-title">Global Leaderboard</h1>
        {loading ? (
          <div className="loading-indicator">Loading...</div>
        ) : players.length === 0 ? (
          <div className="no-data">No players yet.</div>
        ) : (
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Nat</th>
                  <th>Rating</th>
                  <th>Titles</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player.id}>
                    <td>{index + 1}</td>
                    <td>{player.first_name} {player.last_name}</td>
                    <td>{player.country || '—'}</td>
                    <td>{player.current_rating}</td>
                    <td className="titles-cell">N/A</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Leaderboard;
