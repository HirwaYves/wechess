// server/server.js
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { updateElo } from './utils/elo.js';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires ssl in production. This config works for local dev too.
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const app = express();
app.use(cors());
app.use(express.json());

// --- Health
app.get('/', (req, res) => res.send('WEChess API (Postgres)'));

// --- GET /api/tournaments  (list tournaments)
app.get('/api/tournaments', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, title, platform, time_control, date FROM tournaments ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/tournaments error', err);
    res.status(500).json({ error: 'db error' });
  }
});

// --- GET /api/tournaments/:id/participants  (standings with player names)
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
    console.error('GET /api/tournaments/:id/participants error', err);
    res.status(500).json({ error: 'db error' });
  }
});

// --- POST /api/register  (create a player)
app.post('/api/register', async (req, res) => {
  const { username, firstName, lastName, email, country, rating } = req.body;
  try {
    const sql = `INSERT INTO players (username, first_name, last_name, email, country, current_rating)
                 VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const vals = [username, firstName, lastName, email || null, country, rating || 1000];
    const { rows } = await pool.query(sql, vals);
    res.json(rows[0]);
  } catch (err) {
    console.error('POST /api/register error', err);
    res.status(500).json({ error: 'insert failed', details: err.message });
  }
});

// --- PUT /api/player/:id/enable  (admin enables player)
app.put('/api/player/:id/enable', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await pool.query('UPDATE players SET is_enabled = TRUE WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/player/:id/enable error', err);
    res.status(500).json({ error: 'update failed' });
  }
});

// --- POST /api/tournaments/:id/start  (add enabled players into tournament participants)
app.post('/api/tournaments/:id/start', async (req, res) => {
  const tourId = Number(req.params.id);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Insert enabled players who are not already participants
    const insertSql = `
      INSERT INTO tournament_participants (tournament_id, player_id)
      SELECT $1, p.id
      FROM players p
      WHERE p.is_enabled = TRUE
      ON CONFLICT (tournament_id, player_id) DO NOTHING
    `;
    await client.query(insertSql, [tourId]);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/tournaments/:id/start error', err);
    res.status(500).json({ error: 'start failed', details: err.message });
  } finally {
    client.release();
  }
});

// --- POST /api/match  (record a match, update standings and Elo)
app.post('/api/match', async (req, res) => {
  const { tournament_id, round, white, black, result } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) read current ratings
    const r1 = await client.query('SELECT id, current_rating FROM players WHERE id=$1 FOR UPDATE', [white]);
    const r2 = await client.query('SELECT id, current_rating FROM players WHERE id=$1 FOR UPDATE', [black]);
    if (!r1.rows[0] || !r2.rows[0]) throw new Error('player not found');

    const whiteRating = r1.rows[0].current_rating;
    const blackRating = r2.rows[0].current_rating;

    // 2) compute new ratings using Elo helper
    const { newA, newB, deltaA, deltaB } = updateElo(whiteRating, blackRating, result);

    // 3) insert match
    const mSql = `INSERT INTO matches
      (tournament_id, round, white_player_id, black_player_id, result, white_rating_before, black_rating_before, white_rating_after, black_rating_after)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`;
    const mRes = await client.query(mSql, [tournament_id, round || 0, white, black, result, whiteRating, blackRating, newA, newB]);
    const matchId = mRes.rows[0].id;

    // 4) update players' ratings
    await client.query('UPDATE players SET current_rating=$1 WHERE id=$2', [newA, white]);
    await client.query('UPDATE players SET current_rating=$1 WHERE id=$2', [newB, black]);

    // 5) insert rating history
    await client.query('INSERT INTO rating_history (player_id, match_id, old_rating, new_rating, delta) VALUES ($1,$2,$3,$4,$5)', [white, matchId, whiteRating, newA, deltaA]);
    await client.query('INSERT INTO rating_history (player_id, match_id, old_rating, new_rating, delta) VALUES ($1,$2,$3,$4,$5)', [black, matchId, blackRating, newB, deltaB]);

    // 6) update tournament_participants stats (score/wins/draws/losses)
    if (result === '1-0') {
      await client.query('UPDATE tournament_participants SET wins = wins + 1, score = score + 1 WHERE tournament_id=$1 AND player_id=$2', [tournament_id, white]);
      await client.query('UPDATE tournament_participants SET losses = losses + 1 WHERE tournament_id=$1 AND player_id=$2', [tournament_id, black]);
    } else if (result === '0-1') {
      await client.query('UPDATE tournament_participants SET wins = wins + 1, score = score + 1 WHERE tournament_id=$1 AND player_id=$2', [tournament_id, black]);
      await client.query('UPDATE tournament_participants SET losses = losses + 1 WHERE tournament_id=$1 AND player_id=$2', [tournament_id, white]);
    } else if (result === '1/2-1/2') {
      await client.query('UPDATE tournament_participants SET draws = draws + 1, score = score + 0.5 WHERE tournament_id=$1 AND player_id=$2', [tournament_id, white]);
      await client.query('UPDATE tournament_participants SET draws = draws + 1, score = score + 0.5 WHERE tournament_id=$1 AND player_id=$2', [tournament_id, black]);
    }

    await client.query('COMMIT');
    res.json({ ok: true, matchId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/match error', err);
    res.status(500).json({ error: 'match failed', details: err.message });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));