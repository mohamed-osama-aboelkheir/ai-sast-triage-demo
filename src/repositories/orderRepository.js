const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({ connectionString: config.databaseUrl });

async function find(userId, status, orderBy) {
  const { rows } = await pool.query(
    `SELECT id, total, status, created_at FROM orders
     WHERE user_id = $1 AND ($2::text IS NULL OR status = $2)
     ORDER BY ${orderBy}`,
    [userId, status || null]
  );
  return rows;
}

module.exports = { find };
