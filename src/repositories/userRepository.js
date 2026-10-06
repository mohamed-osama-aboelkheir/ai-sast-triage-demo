const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({ connectionString: config.databaseUrl });

async function findByToken(token) {
  const { rows } = await pool.query('SELECT id, username, role FROM users WHERE api_token = $1', [token]);
  return rows[0] || null;
}

module.exports = { findByToken };
