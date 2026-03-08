// src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Request failed with status ${res.status}`);
  }
  return res.json();
};

export const api = {
  // Tournaments
  getTournaments: () => fetch(`${API_BASE}/tournaments`, { headers: getHeaders() }).then(handleResponse),
  createTournament: (data) => fetch(`${API_BASE}/tournaments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateTournament: (id, data) => fetch(`${API_BASE}/tournaments/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteTournament: (id) => fetch(`${API_BASE}/tournaments/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  // Players
  getPlayers: () => fetch(`${API_BASE}/players`, { headers: getHeaders() }).then(handleResponse),
  togglePlayerStatus: (id) => fetch(`${API_BASE}/players/${id}/toggle`, {
    method: 'PUT',
    headers: getHeaders()
  }).then(handleResponse),

  // Registrations
  getPendingRegistrations: () => fetch(`${API_BASE}/registrations?status=pending`, { headers: getHeaders() }).then(handleResponse),
  confirmRegistration: (id) => fetch(`${API_BASE}/registrations/${id}/confirm`, {
    method: 'PUT',
    headers: getHeaders()
  }).then(handleResponse),
  rejectRegistration: (id) => fetch(`${API_BASE}/registrations/${id}/reject`, {
    method: 'PUT',
    headers: getHeaders()
  }).then(handleResponse),

  // Matches
  submitMatch: (data) => fetch(`${API_BASE}/matches`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse),

  // Participants for a tournament
  getParticipants: (tournamentId) => fetch(`${API_BASE}/tournaments/${tournamentId}/participants`, { headers: getHeaders() }).then(handleResponse),

  // Leaderboard
  getLeaderboard: (seasonId) => fetch(`${API_BASE}/leaderboard${seasonId ? `?season_id=${seasonId}` : ''}`).then(handleResponse),

  // Seasons (admin)
  getSeasons: () => fetch(`${API_BASE}/seasons`, { headers: getHeaders() }).then(handleResponse),
  createSeason: (data) => fetch(`${API_BASE}/seasons`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateSeason: (id, data) => fetch(`${API_BASE}/seasons/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteSeason: (id) => fetch(`${API_BASE}/seasons/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),
};
