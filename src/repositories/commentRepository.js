const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({ connectionString: config.databaseUrl });

async function list() {
  const { rows } = await pool.query(
    `SELECT c.id, c.body, c.created_at, u.username
     FROM comments c JOIN users u ON u.id = c.user_id
     ORDER BY c.created_at DESC`
  );
  return rows;
}

async function create(userId, body) {
  await pool.query('INSERT INTO comments (user_id, body) VALUES ($1, $2)', [userId, body]);
}

module.exports = { list, create };
