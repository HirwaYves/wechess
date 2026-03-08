// server/index.js  (Postgres-only, single file)
// Replace your existing server/index.js with this file.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-please-change';

// ------------ Helpers / Auth middleware ------------
function makeToken(user) {
  const payload = { userId: user.id, username: user.username, isAdmin: !!user.is_admin };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

async function requireAuth(req, res, next) {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query('SELECT id, username, is_admin, is_active FROM players WHERE id=$1', [decoded.userId]);
    if (!rows[0]) return res.status(401).json({ error: 'invalid token - user not found' });
    if (!rows[0].is_active) return res.status(403).json({ error: 'account disabled' });
    req.user = { id: rows[0].id, username: rows[0].username, isAdmin: rows[0].is_admin };
    next();
  } catch (err) {
    console.error('requireAuth', err);
    return res.status(401).json({ error: 'invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'not authenticated' });
  if (!req.user.isAdmin) return res.status(403).json({ error: 'admin required' });
  next();
}

// ------------ Routes ------------

// Health
app.get('/', (req, res) => res.send('WEChess API (Postgres)'));

// Public: list tournaments
app.get('/api/tournaments', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, title, date, platform, time_control, max_players, entry_type FROM tournaments ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/tournaments', err);
    res.status(500).json({ error: 'db error', details: err.message });
  }
});

// Public: list players (minimal info)
app.get('/api/players', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, first_name, last_name, current_rating FROM players ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/players', err);
    res.status(500).json({ error: 'db error', details: err.message });
  }
});

// Public: participants for a tournament
app.get('/api/tournaments/:id/participants', async (req, res) => {
  const tourId = Number(req.params.id);
  const sql = `
    SELECT tp.player_id,
           p.username,
           p.first_name || ' ' || p.last_name AS full_name,
           p.country,
           p.current_rating AS rating,
           tp.score,
           tp.wins,
           tp.draws,
           tp.losses,
           CASE WHEN (tp.wins + tp.losses)=0 THEN 0
                ELSE ROUND(100.0 * tp.wins / GREATEST((tp.wins + tp.losses),1)::numeric, 2)
           END AS win_pct
    FROM tournament_participants tp
    JOIN players p ON p.id = tp.player_id
    WHERE tp.tournament_id = $1
    ORDER BY tp.score DESC, tp.wins DESC, p.current_rating DESC
  `;
  try {
    const { rows } = await pool.query(sql, [tourId]);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/tournaments/:id/participants', err);
    res.status(500).json({ error: 'db error', details: err.message });
  }
});

// ---------- Auth: register & login (Postgres) ----------

/**
 * POST /api/auth/register
 * body: { username, password, firstName, lastName, email, country }
 */
app.post('/api/auth/register', async (req, res) => {
  const { username, password, firstName, lastName, email, country } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const sql = `
      INSERT INTO players (username, password_hash, first_name, last_name, email, country, current_rating, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,$7, true)
      RETURNING id, username, first_name, last_name, current_rating, is_admin
    `;
    const vals = [username, hash, firstName || '', lastName || '', email || null, country || null, 1000];
    const { rows } = await pool.query(sql, vals);
    const user = rows[0];
    const token = makeToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error('POST /api/auth/register', err);
    if (err.code === '23505') return res.status(409).json({ error: 'username already exists' });
    res.status(500).json({ error: 'db error', details: err.message });
  }
});

/**
 * POST /api/auth/login
 * body: { username, password }
 */
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const { rows } = await pool.query('SELECT id, username, password_hash, first_name, last_name, email, country, is_admin, is_active, current_rating FROM players WHERE username = $1', [username]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    if (!user.is_active) return res.status(403).json({ error: 'account disabled' });

    const ok = bcrypt.compareSync(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = makeToken(user);
    // Return user info and token
    res.json({
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        country: user.country,
        current_rating: user.current_rating,
        is_admin: user.is_admin
      },
      token
    });
  } catch (err) {
    console.error('POST /api/auth/login', err);
    res.status(500).json({ error: 'db error', details: err.message });
  }
});

/**
 * GET /api/auth/me – get current user from token
 */
app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, first_name, last_name, email, country, current_rating, created_at, is_admin FROM players WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/auth/me', err);
    res.status(500).json({ error: 'db error', details: err.message });
  }
});

// ---------- Registrations ----------

async function tournamentIsFull(clientOrPool, tournamentId) {
  const t = await clientOrPool.query('SELECT max_players FROM tournaments WHERE id=$1', [tournamentId]);
  if (!t.rows[0]) throw new Error('tournament not found');
  const maxPlayers = t.rows[0].max_players || 0;
  const c = await clientOrPool.query('SELECT COUNT(*)::int AS cnt FROM tournament_participants WHERE tournament_id=$1', [tournamentId]);
  const cnt = parseInt(c.rows[0].cnt, 10);
  return cnt >= maxPlayers;
}

/**
 * Public: POST /api/registrations
 * body: { playerId, tournamentId, paymentRef }
 */

// Admin-only: list pending registrations
app.get('/api/registrations', requireAuth, requireAdmin, async (req, res) => {
  const status = req.query.status || 'pending';
  try {
    const sql = `
      SELECT r.id, r.tournament_id, r.player_id, r.status, r.registered_at, r.payment_ref,
             p.username, p.first_name, p.last_name, p.current_rating, p.country
      FROM registrations r
      JOIN players p ON p.id = r.player_id
      WHERE r.status = $1
      ORDER BY r.registered_at ASC
    `;
    const { rows } = await pool.query(sql, [status]);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/registrations', err);
    res.status(500).json({ error: 'db error', details: err.message });
  }
});

// Admin confirm/reject
app.put('/api/registrations/:id/confirm', requireAuth, requireAdmin, async (req, res) => {
  const regId = Number(req.params.id);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const regQ = 'SELECT * FROM registrations WHERE id=$1 FOR UPDATE';
    const regR = await client.query(regQ, [regId]);
    if (regR.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'registration not found' }); }
    const reg = regR.rows[0];
    if (reg.status === 'confirmed') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'already confirmed' }); }

    const t = await client.query('SELECT max_players FROM tournaments WHERE id=$1 FOR UPDATE', [reg.tournament_id]);
    if (!t.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'tournament not found' }); }
    const maxPlayers = t.rows[0].max_players || 0;
    const cntRes = await client.query('SELECT COUNT(*)::int AS cnt FROM tournament_participants WHERE tournament_id=$1', [reg.tournament_id]);
    const currentCount = parseInt(cntRes.rows[0].cnt, 10);
    if (currentCount >= maxPlayers) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'tournament is full; cannot confirm' }); }

    const insertPart = `
      INSERT INTO tournament_participants (tournament_id, player_id, score, wins, draws, losses, buchholz)
      VALUES ($1, $2, 0, 0, 0, 0, 0)
      ON CONFLICT (tournament_id, player_id) DO NOTHING
      RETURNING *
    `;
    const partRes = await client.query(insertPart, [reg.tournament_id, reg.player_id]);

    await client.query('UPDATE registrations SET status=$1, confirmed_at = NOW() WHERE id=$2', ['confirmed', regId]);

    await client.query('COMMIT');
    res.json({ ok: true, participant: partRes.rows[0] || null });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT /api/registrations/:id/confirm', err);
    res.status(500).json({ error: 'confirm failed', details: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/registrations/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  const regId = Number(req.params.id);
  try {
    await pool.query('UPDATE registrations SET status=$1 WHERE id=$2', ['rejected', regId]);
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/registrations/:id/reject', err);
    res.status(500).json({ error: 'db error', details: err.message });
  }
});

// ---------- Admin: Create Tournament ----------
app.post('/api/tournaments', requireAuth, requireAdmin, async (req, res) => {
  const { title, date, platform, timeControl, maxPlayers, entryFee, season } = req.body;
  if (!title || !date || !platform || !timeControl || !maxPlayers || !season) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const sql = `
      INSERT INTO tournaments (title, date, platform, time_control, max_players, entry_type, season_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [title, date, platform, timeControl, maxPlayers, entryFee || 'Free', season];
    const { rows } = await pool.query(sql, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/tournaments', err);
    res.status(500).json({ error: err.message });
  }
});


// ---------- Admin: Toggle Player Status ----------
app.put('/api/players/:id/toggle', requireAuth, requireAdmin, async (req, res) => {
  const playerId = Number(req.params.id);
  try {
    const { rows } = await pool.query('SELECT is_active FROM players WHERE id = $1', [playerId]);
    if (!rows[0]) return res.status(404).json({ error: 'Player not found' });
    const newStatus = !rows[0].is_active;
    await pool.query('UPDATE players SET is_active = $1 WHERE id = $2', [newStatus, playerId]);
    res.json({ id: playerId, is_active: newStatus });
  } catch (err) {
    console.error('PUT /api/players/:id/toggle', err);
    res.status(500).json({ error: err.message });
  }
});


// ---------- Admin: Toggle Player Status ----------
app.put('/api/players/:id/toggle', requireAuth, requireAdmin, async (req, res) => {
  const playerId = Number(req.params.id);
  try {
    const { rows } = await pool.query('SELECT is_active FROM players WHERE id = $1', [playerId]);
    if (!rows[0]) return res.status(404).json({ error: 'Player not found' });
    const newStatus = !rows[0].is_active;
    await pool.query('UPDATE players SET is_active = $1 WHERE id = $2', [newStatus, playerId]);
    res.json({ id: playerId, is_active: newStatus });
  } catch (err) {
    console.error('PUT /api/players/:id/toggle', err);
    res.status(500).json({ error: err.message });
  }
});

// Register for a tournament (authenticated users)
app.post('/api/registrations', requireAuth, async (req, res) => {
  const { tournamentId, paymentRef } = req.body;
  const playerId = req.user.id; // from token
  if (!tournamentId) return res.status(400).json({ error: 'tournamentId required' });

  try {
    const full = await tournamentIsFull(pool, tournamentId);
    if (full) return res.status(409).json({ error: 'tournament full' });

    const sql = `
      INSERT INTO registrations (tournament_id, player_id, payment_ref)
      VALUES ($1, $2, $3)
      ON CONFLICT (tournament_id, player_id) DO NOTHING
      RETURNING *
    `;
    const { rows } = await pool.query(sql, [tournamentId, playerId, paymentRef || null]);
    if (rows.length === 0) return res.status(409).json({ error: 'already registered' });
    res.json(rows[0]);
  } catch (err) {
    console.error('POST /api/registrations', err);
    if (err.message && err.message.includes('tournament not found')) return res.status(404).json({ error: 'tournament not found' });
    res.status(500).json({ error: 'db error', details: err.message });
  }
});
// Public: leaderboard (all players sorted by rating)
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, username, first_name, last_name, country, current_rating
      FROM players
      ORDER BY current_rating DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/leaderboard', err);
    res.status(500).json({ error: err.message });
  }
});
// ---------- Admin: Submit Match ----------
app.post('/api/matches', requireAuth, requireAdmin, async (req, res) => {
  const { tournament_id, white_player_id, black_player_id, result } = req.body;
  if (!tournament_id || !white_player_id || !black_player_id || !result) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (white_player_id === black_player_id) {
    return res.status(400).json({ error: 'Players must be different' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get tournament's season_id
    const tourn = await client.query('SELECT season_id FROM tournaments WHERE id = $1', [tournament_id]);
    if (!tourn.rows[0]) throw new Error('Tournament not found');
    const season_id = tourn.rows[0].season_id;

    // Get current ratings
    const white = await client.query('SELECT current_rating FROM players WHERE id = $1', [white_player_id]);
    const black = await client.query('SELECT current_rating FROM players WHERE id = $1', [black_player_id]);
    if (!white.rows[0] || !black.rows[0]) throw new Error('Player not found');
    const whiteRating = white.rows[0].current_rating;
    const blackRating = black.rows[0].current_rating;

    // Calculate new ratings using elo helper
    const { updateElo } = require('./utils/elo');
    const { newA: newWhite, newB: newBlack } = updateElo(whiteRating, blackRating, result);

    // Insert match record
    const matchSql = `
      INSERT INTO matches
        (tournament_id, season_id, white_player_id, black_player_id, result,
         white_rating_before, black_rating_before, white_rating_after, black_rating_after)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const matchValues = [tournament_id, season_id, white_player_id, black_player_id, result,
                         whiteRating, blackRating, newWhite, newBlack];
    const matchRes = await client.query(matchSql, matchValues);
    const matchId = matchRes.rows[0].id;

    // Update players' current_rating
    await client.query('UPDATE players SET current_rating = $1 WHERE id = $2', [newWhite, white_player_id]);
    await client.query('UPDATE players SET current_rating = $1 WHERE id = $2', [newBlack, black_player_id]);

    // Update tournament_participants stats
    const updateParticipant = async (playerId, deltaWins, deltaLosses, deltaDraws, deltaScore) => {
      await client.query(`
        INSERT INTO tournament_participants (tournament_id, player_id, score, wins, draws, losses)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (tournament_id, player_id) DO UPDATE
        SET score = tournament_participants.score + EXCLUDED.score,
            wins = tournament_participants.wins + EXCLUDED.wins,
            draws = tournament_participants.draws + EXCLUDED.draws,
            losses = tournament_participants.losses + EXCLUDED.losses
      `, [tournament_id, playerId, deltaScore, deltaWins, deltaDraws, deltaLosses]);
    };

    if (result === '1-0') {
      await updateParticipant(white_player_id, 1, 0, 0, 1);
      await updateParticipant(black_player_id, 0, 1, 0, 0);
    } else if (result === '0-1') {
      await updateParticipant(white_player_id, 0, 1, 0, 0);
      await updateParticipant(black_player_id, 1, 0, 0, 1);
    } else { // draw
      await updateParticipant(white_player_id, 0, 0, 1, 0.5);
      await updateParticipant(black_player_id, 0, 0, 1, 0.5);
    }

    await client.query('COMMIT');
    res.json({ success: true, match_id: matchId, new_ratings: { white: newWhite, black: newBlack } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/matches', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------- Admin: Submit Match ----------
app.post('/api/matches', requireAuth, requireAdmin, async (req, res) => {
  const { tournament_id, white_player_id, black_player_id, result } = req.body;
  if (!tournament_id || !white_player_id || !black_player_id || !result) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (white_player_id === black_player_id) {
    return res.status(400).json({ error: 'Players must be different' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get tournament's season_id
    const tourn = await client.query('SELECT season_id FROM tournaments WHERE id = $1', [tournament_id]);
    if (!tourn.rows[0]) throw new Error('Tournament not found');
    const season_id = tourn.rows[0].season_id;

    // Get current ratings
    const white = await client.query('SELECT current_rating FROM players WHERE id = $1', [white_player_id]);
    const black = await client.query('SELECT current_rating FROM players WHERE id = $1', [black_player_id]);
    if (!white.rows[0] || !black.rows[0]) throw new Error('Player not found');
    const whiteRating = white.rows[0].current_rating;
    const blackRating = black.rows[0].current_rating;

    // Calculate new ratings using elo helper
    const { updateElo } = require('./utils/elo');
    const { newA: newWhite, newB: newBlack } = updateElo(whiteRating, blackRating, result);

    // Insert match record
    const matchSql = `
      INSERT INTO matches
        (tournament_id, season_id, white_player_id, black_player_id, result,
         white_rating_before, black_rating_before, white_rating_after, black_rating_after)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const matchValues = [tournament_id, season_id, white_player_id, black_player_id, result,
                         whiteRating, blackRating, newWhite, newBlack];
    const matchRes = await client.query(matchSql, matchValues);
    const matchId = matchRes.rows[0].id;

    // Update players' current_rating
    await client.query('UPDATE players SET current_rating = $1 WHERE id = $2', [newWhite, white_player_id]);
    await client.query('UPDATE players SET current_rating = $1 WHERE id = $2', [newBlack, black_player_id]);

    // Update tournament_participants stats
    const updateParticipant = async (playerId, deltaWins, deltaLosses, deltaDraws, deltaScore) => {
      await client.query(`
        INSERT INTO tournament_participants (tournament_id, player_id, score, wins, draws, losses)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (tournament_id, player_id) DO UPDATE
        SET score = tournament_participants.score + EXCLUDED.score,
            wins = tournament_participants.wins + EXCLUDED.wins,
            draws = tournament_participants.draws + EXCLUDED.draws,
            losses = tournament_participants.losses + EXCLUDED.losses
      `, [tournament_id, playerId, deltaScore, deltaWins, deltaDraws, deltaLosses]);
    };

    if (result === '1-0') {
      await updateParticipant(white_player_id, 1, 0, 0, 1);
      await updateParticipant(black_player_id, 0, 1, 0, 0);
    } else if (result === '0-1') {
      await updateParticipant(white_player_id, 0, 1, 0, 0);
      await updateParticipant(black_player_id, 1, 0, 0, 1);
    } else { // draw
      await updateParticipant(white_player_id, 0, 0, 1, 0.5);
      await updateParticipant(black_player_id, 0, 0, 1, 0.5);
    }

    await client.query('COMMIT');
    res.json({ success: true, match_id: matchId, new_ratings: { white: newWhite, black: newBlack } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/matches', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------- Seasons (admin only) ----------
app.get('/api/seasons', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM seasons ORDER BY start_date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/seasons', requireAuth, requireAdmin, async (req, res) => {
  const { name, start_date, end_date } = req.body;
  if (!name || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO seasons (name, start_date, end_date) VALUES ($1, $2, $3) RETURNING *',
      [name, start_date, end_date]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/seasons/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { name, start_date, end_date } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE seasons SET name = $1, start_date = $2, end_date = $3 WHERE id = $4 RETURNING *',
      [name, start_date, end_date, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Season not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/seasons/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await pool.query('DELETE FROM seasons WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get standings for a tournament (public)
app.get('/api/tournaments/:id/standings', async (req, res) => {
  const tournamentId = Number(req.params.id);
  try {
    const sql = `
      SELECT 
        tp.player_id,
        p.username,
        p.first_name || ' ' || p.last_name AS full_name,
        p.country,
        p.current_rating AS rating,
        tp.score,
        tp.wins,
        tp.draws,
        tp.losses,
        tp.buchholz
      FROM tournament_participants tp
      JOIN players p ON p.id = tp.player_id
      WHERE tp.tournament_id = $1
      ORDER BY tp.score DESC, tp.wins DESC, p.current_rating DESC
    `;
    const { rows } = await pool.query(sql, [tournamentId]);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/tournaments/:id/standings', err);
    res.status(500).json({ error: err.message });
  }
});


// Admin: Reset user password (generates a random temporary password)
app.put('/api/admin/reset-password/:userId', requireAuth, requireAdmin, async (req, res) => {
  const userId = Number(req.params.userId);
  try {
    // Generate a random 8-character password (letters + numbers)
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(tempPassword, salt);

    await pool.query('UPDATE players SET password_hash = $1 WHERE id = $2', [hash, userId]);

    res.json({ 
      message: 'Password reset successful', 
      tempPassword: tempPassword  // send back so admin can see it
    });
  } catch (err) {
    console.error('PUT /api/admin/reset-password/:userId', err);
    res.status(500).json({ error: err.message });
  }
});


// Admin: Reset user password (generates a random temporary password)
app.put('/api/admin/reset-password/:userId', requireAuth, requireAdmin, async (req, res) => {
  const userId = Number(req.params.userId);
  try {
    // Generate a random 8-character password (letters + numbers)
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(tempPassword, salt);

    await pool.query('UPDATE players SET password_hash = $1 WHERE id = $2', [hash, userId]);

    res.json({ 
      message: 'Password reset successful', 
      tempPassword: tempPassword  // send back so admin can see it
    });
  } catch (err) {
    console.error('PUT /api/admin/reset-password/:userId', err);
    res.status(500).json({ error: err.message });
  }
});

// ------------- Start server -------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

