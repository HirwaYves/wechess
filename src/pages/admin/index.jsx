    // src/pages/admin/index.jsx
    import React, { useEffect, useState } from 'react';
    // import './admin.css'; // create simple css or reuse container styles

    const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

    export default function AdminDashboard() {
    const [players, setPlayers] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

        Promise.all([
        fetch(`${API}/api/players`, { headers }).then(r => r.json()),
        fetch(`${API}/api/registrations?status=pending`, { headers }).then(r => r.json())
        ]).then(([playersData, regsData]) => {
        setPlayers(playersData || []);
        setRegistrations(regsData || []);
        }).catch(err => {
        console.error(err);
        }).finally(() => setLoading(false));
    }, [token]);

    const confirmRegistration = async (regId) => {
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
        try {
        const res = await fetch(`${API}/api/registrations/${regId}/confirm`, { method: 'PUT', headers });
        if (!res.ok) throw new Error('confirm failed');
        // refresh registrations and participants list quickly
        const regs = await fetch(`${API}/api/registrations?status=pending`, { headers }).then(r => r.json());
        setRegistrations(regs || []);
        // optionally refresh players
        const pls = await fetch(`${API}/api/players`, { headers }).then(r => r.json());
        setPlayers(pls || []);
        } catch (err) {
        console.error(err);
        alert('Could not confirm — see console.');
        }
    };

    const rejectRegistration = async (regId) => {
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
        try {
        await fetch(`${API}/api/registrations/${regId}/reject`, { method: 'PUT', headers });
        const regs = await fetch(`${API}/api/registrations?status=pending`, { headers }).then(r => r.json());
        setRegistrations(regs || []);
        } catch (err) {
        console.error(err);
        alert('Could not reject — see console.');
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